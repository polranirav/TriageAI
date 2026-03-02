"""
Twilio warm transfer — bridges a live call to the nurse escalation line.

Method: Twilio Conference bridge
  1. Redirect the caller's active call into a named Conference room.
  2. Dial ESCALATION_PHONE_NUMBER and put the nurse in the same room.
  Both participants hear each other directly; the AI audio stream is dropped.

The Twilio SDK uses the synchronous `requests` library.
asyncio.to_thread() prevents it from blocking the FastAPI event loop.
"""

import asyncio

import structlog
from twilio.rest import Client

from app.config import settings

logger = structlog.get_logger()


async def warm_transfer(call_sid: str) -> None:
    """
    Bridge the live Twilio call to the nurse escalation line via Conference.

    Args:
        call_sid: The Twilio Call SID of the active caller session.

    Raises:
        TwilioRestException: if either Twilio API call fails.
    """
    conference_name = f"escalation_{call_sid}"
    conference_twiml = (
        "<Response>"
        '<Dial><Conference beep="false" waitUrl="">'
        f"{conference_name}"
        "</Conference></Dial>"
        "</Response>"
    )

    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

    # Step 1: Redirect the caller into the conference room.
    # This ends the Media Stream WebSocket and replaces the call audio.
    await asyncio.to_thread(
        client.calls(call_sid).update,
        twiml=conference_twiml,
    )
    logger.info("caller_redirected_to_conference", call_sid=call_sid, conference=conference_name)

    # Step 2: Dial the nurse line and add them to the same conference.
    await asyncio.to_thread(
        client.calls.create,
        to=settings.ESCALATION_PHONE_NUMBER,
        from_=settings.TWILIO_PHONE_NUMBER,
        twiml=conference_twiml,
    )
    logger.info("nurse_dialed", conference=conference_name)
