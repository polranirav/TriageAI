"""
Escalation API endpoint — POST /v1/escalate

Triggers emergency warm transfer for CTAS L1/L2 calls.

Auth: Twilio signature (same as /v1/voice)
Rate limit: 5 req/min — prevents accidental escalation spam
"""

import structlog
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.exceptions import ESCALATION_FAILED, TRIAGE_SESSION_NOT_FOUND, TriageAIError
from app.logging.session_logger import log_event
from app.main import limiter
from app.models.triage_session import TriageSessionModel
from app.voice.dependencies import validate_twilio_signature

from .transfer import warm_transfer

logger = structlog.get_logger()

router = APIRouter(tags=["escalation"])


class EscalateRequest(BaseModel):
    call_sid: str = Field(..., description="Active Twilio call SID", min_length=2, max_length=64)
    ctas_level: int = Field(..., ge=1, le=2, description="CTAS level (must be 1 or 2)")


@router.post(
    "/escalate",
    responses={
        200: {"description": "Warm transfer initiated"},
        403: {"description": "Invalid Twilio signature"},
        404: {"description": "Session not found"},
        429: {"description": "Rate limit exceeded"},
        503: {"description": "Twilio API error"},
    },
)
@limiter.limit("5/minute")  # noqa: B008
async def escalate(
    request: Request,  # noqa: ARG001 — needed for rate limiter key + signature dep
    body: EscalateRequest,
    _: None = Depends(validate_twilio_signature),  # noqa: B008
    db: AsyncSession = Depends(get_session),  # noqa: B008
) -> dict:
    """
    Trigger emergency warm transfer for a CTAS L1/L2 call.

    Bridges a human nurse into the active Twilio call via Conference while
    keeping the caller on the line. The escalation is logged synchronously —
    silent failure on an emergency is unacceptable.
    """
    log = logger.bind(call_sid=body.call_sid, ctas_level=body.ctas_level)
    log.info("escalation_requested")

    # 1. Verify the session exists
    result = await db.execute(
        select(TriageSessionModel).where(TriageSessionModel.call_sid == body.call_sid)
    )
    session = result.scalar_one_or_none()

    if session is None:
        raise TriageAIError(
            code=TRIAGE_SESSION_NOT_FOUND,
            message=f"No session found for call_sid: {body.call_sid}",
            status=404,
        )

    # 2. Trigger the warm transfer via Twilio Conference bridge
    try:
        await warm_transfer(body.call_sid)
    except Exception as exc:
        log.error("escalation_twilio_failed", error=str(exc))
        raise TriageAIError(
            code=ESCALATION_FAILED,
            message="Failed to initiate emergency transfer",
            status=503,
        ) from exc

    # 3. Mark session as escalated + write PHIPA audit event
    try:
        await db.execute(
            update(TriageSessionModel)
            .where(TriageSessionModel.call_sid == body.call_sid)
            .values(escalated=True, ctas_level=body.ctas_level, routing_action="escalate_911")
        )
        await log_event(
            call_sid=body.call_sid,
            event_type="escalation_triggered",
            metadata={"ctas_level": body.ctas_level},
            db=db,
        )
        await db.commit()
        log.info("escalation_recorded")
    except Exception as exc:
        await db.rollback()
        # Transfer already fired — log DB failure but don't 500 the response
        log.error("escalation_db_write_failed", error=str(exc))

    return {"status": "escalated", "call_sid": body.call_sid}
