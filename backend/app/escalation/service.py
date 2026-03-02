"""
Escalation service — Twilio Participants API warm transfer.

When a caller is classified CTAS L1 or L2, this module bridges a human nurse
into the call WHILE KEEPING THE CALLER ON THE LINE. This is a warm transfer,
not a cold redirect — the nurse hears context before the caller is connected.

SLA: Must respond in < 500ms (emergency path).
"""

import structlog
from twilio.rest import Client as TwilioClient

from app.config import settings
from app.exceptions import ESCALATION_FAILED, TriageAIError

logger = structlog.get_logger()


def _get_twilio_client() -> TwilioClient:
    """Create Twilio REST client. Raises TriageAIError if credentials are missing."""
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        raise TriageAIError(
            code=ESCALATION_FAILED,
            message="Twilio credentials not configured",
            status=503,
        )
    return TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)


async def trigger_warm_transfer(call_sid: str, ctas_level: int) -> dict:
    """
    Bridge a human nurse into an active Twilio call using the Participants API.

    This is synchronous Twilio API work wrapped in an async function.
    The Twilio SDK is sync but the call is fast (<500ms typically).

    Args:
        call_sid: Active Twilio call SID to bridge into
        ctas_level: CTAS level (1 or 2) for context

    Returns:
        dict with participant_sid and status

    Raises:
        TriageAIError (ESCALATION_FAILED) if Twilio API call fails
    """
    log = logger.bind(call_sid=call_sid, ctas_level=ctas_level)

    if not settings.ESCALATION_PHONE_NUMBER:
        log.error("escalation_phone_not_configured")
        raise TriageAIError(
            code=ESCALATION_FAILED,
            message="Escalation phone number not configured",
            status=503,
            details={"reason": "ESCALATION_PHONE_NUMBER not set in environment"},
        )

    try:
        client = _get_twilio_client()
        log.info("escalation_initiating")

        # Use Twilio Participants API to bridge a nurse into the active call
        # This adds a new participant WITHOUT dropping the caller
        participant = client.conferences(call_sid).participants.create(
            from_=settings.TWILIO_PHONE_NUMBER,
            to=settings.ESCALATION_PHONE_NUMBER,
            early_media=True,
            # Status callback for monitoring (optional)
            status_callback_event=["initiated", "ringing", "answered", "completed"],
        )

        log.info(
            "escalation_initiated",
            participant_sid=participant.call_sid,
            to=settings.ESCALATION_PHONE_NUMBER[:4] + "***",  # Log partial — compliance
        )

        return {
            "status": "escalated",
            "participant_sid": participant.call_sid,
            "call_sid": call_sid,
            "ctas_level": ctas_level,
        }

    except TriageAIError:
        raise  # Re-raise our own errors
    except Exception as exc:
        log.error("escalation_twilio_error", error=str(exc))
        raise TriageAIError(
            code=ESCALATION_FAILED,
            message=f"Failed to initiate warm transfer: {exc}",
            status=503,
            details={"twilio_error": str(exc)},
        ) from exc
