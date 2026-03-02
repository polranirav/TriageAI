import structlog
from fastapi import APIRouter, Depends, Form, Request, WebSocket
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_session
from app.logging.session_logger import create_session
from app.main import limiter  # noqa: E402
from app.voice.dependencies import validate_twilio_signature
from app.voice.media_bridge import handle_media_stream

logger = structlog.get_logger()

router = APIRouter(tags=["voice"])


@router.post(
    "/voice",
    response_class=Response,
    responses={
        200: {"content": {"text/xml": {}}},
        403: {"description": "Invalid Twilio signature"},
        429: {"description": "Rate limit exceeded"},
    },
)
@limiter.limit("20/minute")  # noqa: B008
async def voice_webhook(
    request: Request,  # noqa: ARG001 — needed for rate limiter key + signature dep
    call_sid: str = Form(..., alias="CallSid"),
    _: None = Depends(validate_twilio_signature),  # noqa: B008
    db: AsyncSession = Depends(get_session),  # noqa: B008
) -> Response:
    """
    Twilio inbound call webhook.
    Validates signature → creates session record → returns TwiML to start Media Stream.
    """
    await create_session(call_sid, db)
    logger.info("voice_webhook_received", call_sid=call_sid)

    # Derive WebSocket URL from configured BASE_URL
    ws_base = (
        settings.BASE_URL.replace("https://", "wss://").replace("http://", "ws://")
    )

    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="{ws_base}/v1/media-stream" />
  </Connect>
</Response>"""

    return Response(content=twiml, media_type="text/xml")


@router.post(
    "/voice/fallback",
    response_class=Response,
    responses={200: {"content": {"text/xml": {}}}},
    tags=["voice"],
)
async def voice_fallback() -> Response:
    """
    Twilio fallback webhook — called when the primary /v1/voice webhook fails.

    Returns a safe TwiML response that directs callers to 911 or Telehealth Ontario.
    Configure this URL in the Twilio console under Phone Numbers → Voice fallback URL.
    """
    twiml = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        "<Response>"
        '<Say voice="alice" language="en-CA">'
        "We're sorry, our triage service is temporarily unavailable. "
        "For a medical emergency, please hang up and call 9-1-1. "
        "For urgent care, please call Telehealth Ontario at 1-866-797-0000. "
        "Please try calling back in a few minutes."
        "</Say>"
        "<Hangup/>"
        "</Response>"
    )
    return Response(content=twiml, media_type="text/xml")


@router.websocket("/media-stream")
async def media_stream_ws(websocket: WebSocket) -> None:
    """
    Twilio opens this WebSocket for bidirectional audio after receiving TwiML <Connect><Stream>.
    Bridges audio between Twilio Media Streams and the OpenAI Realtime API.
    """
    await handle_media_stream(websocket)
