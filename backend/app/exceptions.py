from typing import Any


class TriageAIError(Exception):
    def __init__(self, code: str, message: str, status: int, details: dict[str, Any] | None = None):
        self.code = code
        self.message = message
        self.status = status
        self.details = details or {}
        super().__init__(message)


# 403 — Webhook signature validation failed
INVALID_TWILIO_SIGNATURE = "INVALID_TWILIO_SIGNATURE"

# 404 — call_sid not found in DB
TRIAGE_SESSION_NOT_FOUND = "TRIAGE_SESSION_NOT_FOUND"

# 409 — routing already triggered for this session
TRIAGE_SESSION_ALREADY_COMPLETE = "TRIAGE_SESSION_ALREADY_COMPLETE"

# 503 — Twilio Participants API call failed
ESCALATION_FAILED = "ESCALATION_FAILED"

# 503 — OpenAI Realtime WebSocket connection failed
OPENAI_CONNECTION_FAILED = "OPENAI_CONNECTION_FAILED"

# 500 — audioop μ-law/PCM16 conversion error
AUDIO_CONVERSION_ERROR = "AUDIO_CONVERSION_ERROR"

# 500 — SQLAlchemy write operation failed
DATABASE_WRITE_FAILED = "DATABASE_WRITE_FAILED"

# 422 — classifier returned out-of-range CTAS level
INVALID_CTAS_LEVEL = "INVALID_CTAS_LEVEL"

# 429 — slowapi rate limit exceeded
RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"

# 401 — missing or invalid JWT token
UNAUTHORIZED = "UNAUTHORIZED"

# 403 — valid JWT but wrong clinic scope
FORBIDDEN = "FORBIDDEN"

# 500 — uncaught exception fallback
INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"
