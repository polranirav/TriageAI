"""
Smoke tests — run against a live deployment to verify critical paths.

Usage:
  BASE_URL=https://triageai.ca pytest tests/smoke/ -v
  BASE_URL=http://localhost:8000 pytest tests/smoke/ -v

These are NOT unit tests — they make real HTTP requests.
Run AFTER deployment to validate the system is healthy.
"""

import os

import httpx
import pytest

BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")


@pytest.fixture
def client():
    return httpx.Client(base_url=BASE_URL, timeout=10.0)


class TestHealthSmoke:
    """System must be reachable and reporting healthy."""

    def test_health_endpoint(self, client):
        res = client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"

    def test_health_reports_environment(self, client):
        res = client.get("/health")
        data = res.json()
        assert "environment" in data


class TestTriageSmoke:
    """Triage endpoint must be reachable."""

    def test_triage_health(self, client):
        res = client.get("/v1/triage/health")
        assert res.status_code == 200


class TestAuthSmoke:
    """Admin endpoints must enforce authentication."""

    def test_admin_requires_auth(self, client):
        res = client.get("/v1/admin/analytics/summary")
        assert res.status_code == 401

    def test_admin_rejects_bad_token(self, client):
        res = client.get(
            "/v1/admin/analytics/summary",
            headers={"Authorization": "Bearer fake-token-12345"},
        )
        assert res.status_code == 401


class TestVoiceSmoke:
    """Voice webhook must be reachable (POST only)."""

    def test_voice_webhook_reachable(self, client):
        # This will return 403 (missing Twilio signature) but NOT 404
        res = client.post("/v1/voice", data={"CallSid": "CA_smoke_test"})
        assert res.status_code != 404


class TestCORSSmoke:
    """CORS must be configured correctly."""

    def test_cors_headers_present(self, client):
        res = client.options(
            "/health",
            headers={
                "Origin": "https://triageai.ca",
                "Access-Control-Request-Method": "GET",
            },
        )
        # Should not be 405 Method Not Allowed
        assert res.status_code in (200, 204)
