from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # Twilio
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    ESCALATION_PHONE_NUMBER: str = ""

    # OpenAI
    OPENAI_API_KEY: str = ""

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost:5432/triageai"

    # Public base URL — used to build WebSocket URLs in TwiML responses
    # In dev: http://localhost:8000, in prod: https://api.triageai.ca
    BASE_URL: str = "http://localhost:8000"

    # Security
    SECRET_KEY: str = "change-me-in-production"  # noqa: S105
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"

    # Admin dashboard credentials
    ADMIN_EMAIL: str = "admin@triageai.ca"
    ADMIN_PASSWORD: str = "change-me-in-production"  # noqa: S105

    # Sentry
    SENTRY_DSN: str | None = None

    # Data retention (PIPEDA/PHIPA) — sessions deleted after this many days
    RETENTION_DAYS: int = 90

    # Feature flags
    FF_MULTILINGUAL: bool = False
    FF_ADMIN_DASHBOARD: bool = False
    FF_ANALYTICS: bool = False
    # NEVER disable — crisis override must always be active
    FF_CRISIS_OVERRIDE: bool = True


settings = Settings()
