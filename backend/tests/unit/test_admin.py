"""
Unit tests for admin auth middleware and admin API endpoints.

These tests mock the database layer to avoid needing a real PostgreSQL connection.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.admin.auth import require_auth
from app.exceptions import TriageAIError

# ── Auth middleware unit tests (no HTTP needed) ──────────────────────────────


class TestAuthMiddleware:
    @pytest.mark.asyncio
    async def test_no_token_raises_401(self):
        """No credentials → UNAUTHORIZED."""
        with pytest.raises(TriageAIError) as exc_info:
            await require_auth(request=MagicMock(), credentials=None)
        assert exc_info.value.status == 401

    @pytest.mark.asyncio
    async def test_dev_token_accepted(self):
        """dev-token is accepted in development mode."""
        creds = MagicMock()
        creds.credentials = "dev-token"

        with patch("app.admin.auth.settings") as mock_settings:
            mock_settings.ENVIRONMENT = "development"
            result = await require_auth(request=MagicMock(), credentials=creds)

        assert result["user_id"] == "dev-user-001"
        assert result["role"] == "admin"

    @pytest.mark.asyncio
    async def test_dev_token_with_user_id(self):
        """dev-token:custom-id extracts the custom user ID."""
        creds = MagicMock()
        creds.credentials = "dev-token:user-42"

        with patch("app.admin.auth.settings") as mock_settings:
            mock_settings.ENVIRONMENT = "development"
            result = await require_auth(request=MagicMock(), credentials=creds)

        assert result["user_id"] == "user-42"

    @pytest.mark.asyncio
    async def test_invalid_dev_token_raises_401(self):
        """Not starting with 'dev-token' → rejected in dev mode too."""
        creds = MagicMock()
        creds.credentials = "bad-token"

        with patch("app.admin.auth.settings") as mock_settings:
            mock_settings.ENVIRONMENT = "development"

            with pytest.raises(TriageAIError) as exc_info:
                await require_auth(request=MagicMock(), credentials=creds)
            assert exc_info.value.status == 401


# ── Endpoint routing tests (with mocked DB) ─────────────────────────────────


@pytest.fixture
def mock_db_session():
    """Mock database session that returns empty results."""
    mock_session = AsyncMock()

    # Mock scalar results for count/avg queries
    mock_result = MagicMock()
    mock_result.scalar.return_value = 0
    mock_result.all.return_value = []
    mock_result.scalars.return_value = MagicMock(all=lambda: [])
    mock_result.scalar_one_or_none.return_value = None
    mock_session.execute.return_value = mock_result

    return mock_session


@pytest.fixture
async def client(mock_db_session):
    """Async test client with mocked DB session."""
    from app.database import get_session
    from app.main import app

    async def override_get_session():
        yield mock_db_session

    app.dependency_overrides[get_session] = override_get_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    # Clean up overrides
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers():
    return {"Authorization": "Bearer dev-token"}


class TestAdminEndpoints:
    @pytest.mark.asyncio
    async def test_analytics_summary_returns_200(self, client, auth_headers):
        res = await client.get("/v1/admin/analytics/summary", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert "total_calls" in data
        assert "escalation_rate" in data

    @pytest.mark.asyncio
    async def test_ctas_distribution_returns_200(self, client, auth_headers):
        res = await client.get("/v1/admin/analytics/ctas-distribution", headers=auth_headers)
        assert res.status_code == 200
        assert "distribution" in res.json()

    @pytest.mark.asyncio
    async def test_sessions_list_returns_200(self, client, auth_headers):
        res = await client.get("/v1/admin/sessions", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert "sessions" in data
        assert "total" in data
        assert data["page"] == 1

    @pytest.mark.asyncio
    async def test_session_detail_returns_404(self, client, auth_headers):
        res = await client.get("/v1/admin/sessions/nonexistent", headers=auth_headers)
        assert res.status_code == 404

    @pytest.mark.asyncio
    async def test_summary_rejects_invalid_days(self, client, auth_headers):
        res = await client.get("/v1/admin/analytics/summary?days=0", headers=auth_headers)
        assert res.status_code == 422

    @pytest.mark.asyncio
    async def test_endpoints_require_auth(self, client):
        """All admin endpoints should reject unauthenticated requests."""
        for path in [
            "/v1/admin/analytics/summary",
            "/v1/admin/analytics/ctas-distribution",
            "/v1/admin/sessions",
        ]:
            res = await client.get(path)
            assert res.status_code == 401, f"{path} should require auth"
