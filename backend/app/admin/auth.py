"""
JWT authentication middleware for admin dashboard endpoints.

Uses Supabase Auth JWTs — validates the token signature against
the Supabase JWT secret. In development mode, a simpler validation
is used for testing.
"""

import structlog
from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings
from app.exceptions import UNAUTHORIZED, TriageAIError

logger = structlog.get_logger()

_bearer_scheme = HTTPBearer(auto_error=False)


async def require_auth(
    request: Request,  # noqa: ARG001
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),  # noqa: B008
) -> dict:
    """
    FastAPI dependency that validates the JWT token.

    Returns a dict with user information extracted from the token.
    Raises TriageAIError (UNAUTHORIZED) if no token or invalid token.

    In development: accepts any Bearer token with value "dev-token" for testing.
    In production: validates against Supabase JWT secret using PyJWT.
    """
    if not credentials:
        raise TriageAIError(
            code=UNAUTHORIZED,
            message="Authentication required. Provide a Bearer token.",
            status=401,
        )

    token = credentials.credentials

    if settings.ENVIRONMENT == "development":
        # Development mode — accept simple tokens for testing
        # Format: "dev-token" or "dev-token:<user_id>"
        if token.startswith("dev-token"):
            parts = token.split(":")
            return {
                "user_id": parts[1] if len(parts) > 1 else "dev-user-001",
                "email": "dev@triageai.local",
                "role": "admin",
            }
        raise TriageAIError(
            code=UNAUTHORIZED,
            message="Invalid development token. Use 'dev-token' or 'dev-token:<user_id>'.",
            status=401,
        )

    # Production: validate JWT
    try:
        import jwt  # PyJWT — only imported in prod to avoid dev dependency

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return {
            "user_id": payload.get("sub", ""),
            "email": payload.get("email", ""),
            "role": payload.get("role", "authenticated"),
        }
    except Exception as exc:
        logger.warning("jwt_validation_failed", error=str(exc))
        raise TriageAIError(
            code=UNAUTHORIZED,
            message="Invalid or expired authentication token.",
            status=401,
        ) from exc
