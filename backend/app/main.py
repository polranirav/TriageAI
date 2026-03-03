import asyncio
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any

import sentry_sdk
import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.exceptions import RATE_LIMIT_EXCEEDED, TriageAIError

logger = structlog.get_logger()

# Global rate limiter — routers import and use this instance
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup
    if settings.SENTRY_DSN:
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            environment=settings.ENVIRONMENT,
            traces_sample_rate=0.1,
        )
        logger.info("sentry_initialized", environment=settings.ENVIRONMENT)

    from app.retention import retention_loop  # noqa: E402

    retention_task = asyncio.create_task(retention_loop())
    logger.info("triageai_starting", environment=settings.ENVIRONMENT)
    yield

    # Shutdown
    retention_task.cancel()
    try:
        await retention_task
    except asyncio.CancelledError:
        pass
    logger.info("triageai_stopping")


app = FastAPI(
    title="TriageAI",
    description="AI-powered medical call triage & escalation system for Ontario, Canada",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url=None,
)

# Attach rate limiter to app state
app.state.limiter = limiter

# CORS — locked to localhost in dev, triageai.ca in prod
_domain = os.environ.get("DOMAIN", "triageai.ca")
_allowed_origins = (
    ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"]
    if settings.ENVIRONMENT == "development"
    else [f"https://{_domain}", f"https://www.{_domain}"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security response headers to every API response."""

    async def dispatch(self, request: Request, call_next: Any) -> Any:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = (
                "max-age=63072000; includeSubDomains; preload"
            )
        return response


app.add_middleware(SecurityHeadersMiddleware)


@app.exception_handler(TriageAIError)
async def triage_error_handler(request: Request, exc: TriageAIError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "status": exc.status,
                "details": exc.details,
            }
        },
    )


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    # Use TriageAI error format instead of slowapi default
    return JSONResponse(
        status_code=429,
        content={
            "error": {
                "code": RATE_LIMIT_EXCEEDED,
                "message": "Too many requests. Please try again later.",
                "status": 429,
                "details": {"limit": str(exc.detail)},
            }
        },
    )


@app.get("/health", tags=["system"])
async def health_check() -> dict[str, str]:
    return {"status": "ok", "environment": settings.ENVIRONMENT}


# Routers
from app.voice.router import router as voice_router  # noqa: E402

app.include_router(voice_router, prefix="/v1")

from app.triage.router import router as triage_router  # noqa: E402

app.include_router(triage_router, prefix="/v1")

from app.escalation.router import router as escalation_router  # noqa: E402

app.include_router(escalation_router, prefix="/v1")

from app.admin.router import auth_router as admin_auth_router  # noqa: E402
from app.admin.router import router as admin_router  # noqa: E402

app.include_router(admin_auth_router, prefix="/v1/admin")
app.include_router(admin_router, prefix="/v1/admin")

from app.admin.settings import router as settings_router  # noqa: E402

app.include_router(settings_router, prefix="/v1/admin")
