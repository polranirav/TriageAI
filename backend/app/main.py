from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import sentry_sdk
import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.exceptions import TriageAIError

logger = structlog.get_logger()


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

    logger.info("triageai_starting", environment=settings.ENVIRONMENT)
    yield

    # Shutdown
    logger.info("triageai_stopping")


app = FastAPI(
    title="TriageAI",
    description="AI-powered medical call triage & escalation system for Ontario, Canada",
    version="0.1.0",
    lifespan=lifespan,
    # Disable docs in production
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url=None,
)

# CORS — locked to localhost in dev, triageai.ca in prod
_allowed_origins = (
    ["http://localhost:3000", "http://127.0.0.1:3000"]
    if settings.ENVIRONMENT == "development"
    else ["https://triageai.ca"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


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


@app.get("/health", tags=["system"])
async def health_check() -> dict[str, str]:
    return {"status": "ok", "environment": settings.ENVIRONMENT}


# Router stubs — populated in later sprints
# from app.voice.router import router as voice_router
# from app.triage.router import router as triage_router
# from app.escalation.router import router as escalation_router
# from app.admin.router import router as admin_router
# app.include_router(voice_router, prefix="/v1")
# app.include_router(triage_router, prefix="/v1")
# app.include_router(escalation_router, prefix="/v1")
# app.include_router(admin_router, prefix="/v1/admin")
