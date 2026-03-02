from datetime import datetime
from typing import Any

import structlog
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import DATABASE_WRITE_FAILED, TriageAIError
from app.models.system_event import SystemEventModel
from app.models.triage_session import TriageSessionModel

logger = structlog.get_logger()


async def create_session(call_sid: str, db: AsyncSession) -> TriageSessionModel:
    """
    Create a new triage session record and fire the call_started event.
    Raises TriageAIError on DB write failure — never silently fails.
    """
    try:
        session = TriageSessionModel(call_sid=call_sid)
        db.add(session)
        await db.flush()

        event = SystemEventModel(
            call_sid=call_sid,
            event_type="call_started",
            event_metadata={},
        )
        db.add(event)
        await db.commit()
    except Exception as exc:
        await db.rollback()
        logger.error("session_create_failed", call_sid=call_sid, error=str(exc))
        raise TriageAIError(
            code=DATABASE_WRITE_FAILED,
            message="Failed to create triage session",
            status=500,
        ) from exc

    logger.info("triage_session_created", call_sid=call_sid)
    return session


async def complete_session(
    call_sid: str,
    ctas_level: int | None,
    routing_action: str | None,
    escalated: bool,
    questions_completed: int,
    db: AsyncSession,
) -> None:
    """
    Write the final triage outcome to the triage_sessions record and
    append a triage_completed system event.

    Called from the media bridge after the call ends (or on error).
    Never raises — a logging failure must not crash the bridge.
    """
    try:
        stmt = (
            update(TriageSessionModel)
            .where(TriageSessionModel.call_sid == call_sid)
            .values(
                ctas_level=ctas_level,
                routing_action=routing_action,
                escalated=escalated,
                questions_completed=questions_completed,
                ended_at=datetime.utcnow(),
            )
        )
        await db.execute(stmt)

        event = SystemEventModel(
            call_sid=call_sid,
            event_type="triage_completed",
            event_metadata={
                "ctas_level": ctas_level,
                "routing_action": routing_action,
                "early_escalation": escalated,
                "questions_completed": questions_completed,
            },
        )
        db.add(event)
        await db.commit()
        logger.info("session_completed", call_sid=call_sid, ctas_level=ctas_level)
    except Exception as exc:
        await db.rollback()
        logger.error("session_complete_failed", call_sid=call_sid, error=str(exc))
        # Do not raise — call is already over


async def log_event(
    call_sid: str,
    event_type: str,
    metadata: dict[str, Any],
    db: AsyncSession,
) -> SystemEventModel:
    """
    Append a structured audit event to system_events.
    Caller is responsible for committing the transaction.
    NEVER put PII in metadata — see COMPLIANCE.md.
    """
    event = SystemEventModel(
        call_sid=call_sid,
        event_type=event_type,
        event_metadata=metadata,
    )
    db.add(event)
    return event
