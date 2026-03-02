from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from app.database import get_session
from app.main import app
from app.voice.dependencies import validate_twilio_signature


# Override Twilio signature validation for all tests in this module
@pytest.fixture(autouse=True)
def override_twilio_validation():
    async def always_valid():
        return None

    app.dependency_overrides[validate_twilio_signature] = always_valid
    yield
    app.dependency_overrides.pop(validate_twilio_signature, None)


# Override DB session so tests never touch a real database
@pytest.fixture(autouse=True)
def override_db_session():
    app.dependency_overrides[get_session] = lambda: AsyncMock()
    yield
    app.dependency_overrides.pop(get_session, None)


@pytest.mark.asyncio
async def test_voice_webhook_returns_twiml(client: AsyncClient) -> None:
    with patch("app.voice.router.create_session", new_callable=AsyncMock):
        response = await client.post(
            "/v1/voice",
            data={"CallSid": "CA3f7a2btest001"},
            headers={"X-Twilio-Signature": "test-sig"},
        )

    assert response.status_code == 200
    assert "text/xml" in response.headers["content-type"]
    assert "<Stream" in response.text
    assert "media-stream" in response.text


@pytest.mark.asyncio
async def test_voice_webhook_twiml_structure(client: AsyncClient) -> None:
    with patch("app.voice.router.create_session", new_callable=AsyncMock):
        response = await client.post(
            "/v1/voice",
            data={"CallSid": "CA3f7a2btest002"},
            headers={"X-Twilio-Signature": "test-sig"},
        )

    assert "<Response>" in response.text
    assert "<Connect>" in response.text
    assert "</Response>" in response.text


@pytest.mark.asyncio
async def test_voice_webhook_invalid_signature(client: AsyncClient) -> None:
    # Remove the always-valid override for this specific test
    app.dependency_overrides.pop(validate_twilio_signature, None)

    with patch(
        "app.voice.dependencies.RequestValidator.validate", return_value=False
    ):
        response = await client.post(
            "/v1/voice",
            data={"CallSid": "CA3f7a2btest003"},
            headers={"X-Twilio-Signature": "bad-signature"},
        )

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "INVALID_TWILIO_SIGNATURE"

    # Restore override for subsequent tests
    async def always_valid():
        return None

    app.dependency_overrides[validate_twilio_signature] = always_valid


@pytest.mark.asyncio
async def test_voice_webhook_missing_call_sid(client: AsyncClient) -> None:
    with patch("app.voice.router.create_session", new_callable=AsyncMock):
        response = await client.post(
            "/v1/voice",
            data={},  # no CallSid
            headers={"X-Twilio-Signature": "test-sig"},
        )

    assert response.status_code == 422
