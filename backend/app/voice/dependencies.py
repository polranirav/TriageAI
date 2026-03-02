import structlog
from fastapi import Request
from twilio.request_validator import RequestValidator

from app.config import settings
from app.exceptions import INVALID_TWILIO_SIGNATURE, TriageAIError

logger = structlog.get_logger()


async def validate_twilio_signature(request: Request) -> None:
    """
    FastAPI dependency — validates every inbound Twilio webhook.
    Returns 403 immediately on signature mismatch.
    ALWAYS required — never bypass in production.
    """
    validator = RequestValidator(settings.TWILIO_AUTH_TOKEN)
    signature = request.headers.get("X-Twilio-Signature", "")
    form_data = dict(await request.form())
    # Caddy terminates TLS and forwards as HTTP internally, so request.url
    # has scheme=http. Reconstruct with the public https:// base URL so the
    # signature matches what Twilio signed.
    url = str(request.url).replace("http://", "https://", 1)

    if not validator.validate(url, form_data, signature):
        logger.warning("invalid_twilio_signature", url=url)
        raise TriageAIError(
            code=INVALID_TWILIO_SIGNATURE,
            message="Invalid Twilio webhook signature",
            status=403,
        )
