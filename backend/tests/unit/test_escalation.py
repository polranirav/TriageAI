"""
Unit tests for the escalation service — trigger_warm_transfer().

These tests mock the Twilio SDK since we can't make real API calls in CI.
"""

from unittest.mock import MagicMock, patch

import pytest

from app.escalation.service import trigger_warm_transfer
from app.exceptions import TriageAIError


@pytest.fixture
def mock_twilio_client():
    """Create a mock Twilio client that returns a successful participant."""
    with patch("app.escalation.service._get_twilio_client") as mock_get:
        mock_client = MagicMock()
        mock_participant = MagicMock()
        mock_participant.call_sid = "CA_participant_123"
        mock_client.conferences.return_value.participants.create.return_value = mock_participant
        mock_get.return_value = mock_client
        yield mock_client


@pytest.fixture
def mock_settings_configured():
    """Ensure ESCALATION_PHONE_NUMBER is configured."""
    with patch("app.escalation.service.settings") as mock_settings:
        mock_settings.TWILIO_ACCOUNT_SID = "ACtest123"
        mock_settings.TWILIO_AUTH_TOKEN = "test_token"
        mock_settings.TWILIO_PHONE_NUMBER = "+16475550000"
        mock_settings.ESCALATION_PHONE_NUMBER = "+16135550001"
        yield mock_settings


@pytest.mark.asyncio
async def test_trigger_warm_transfer_success(mock_twilio_client, mock_settings_configured):
    """Happy path: warm transfer initiates and returns participant SID."""
    result = await trigger_warm_transfer("CAtestcall001", ctas_level=1)

    assert result["status"] == "escalated"
    assert result["call_sid"] == "CAtestcall001"
    assert result["ctas_level"] == 1
    assert result["participant_sid"] == "CA_participant_123"

    # Verify Twilio API was called with correct params
    mock_twilio_client.conferences.assert_called_once_with("CAtestcall001")


@pytest.mark.asyncio
async def test_trigger_warm_transfer_no_escalation_number():
    """ESCALATION_PHONE_NUMBER not set → TriageAIError."""
    with patch("app.escalation.service.settings") as mock_settings:
        mock_settings.ESCALATION_PHONE_NUMBER = ""
        mock_settings.TWILIO_ACCOUNT_SID = "ACtest123"
        mock_settings.TWILIO_AUTH_TOKEN = "test_token"

        with pytest.raises(TriageAIError) as exc_info:
            await trigger_warm_transfer("CAtestcall002", ctas_level=1)

        assert exc_info.value.status == 503
        assert "not configured" in exc_info.value.message


@pytest.mark.asyncio
async def test_trigger_warm_transfer_twilio_error(mock_settings_configured):
    """Twilio API throws an exception → TriageAIError with ESCALATION_FAILED."""
    with patch("app.escalation.service._get_twilio_client") as mock_get:
        mock_client = MagicMock()
        mock_client.conferences.return_value.participants.create.side_effect = (
            Exception("Twilio is down")
        )
        mock_get.return_value = mock_client

        with pytest.raises(TriageAIError) as exc_info:
            await trigger_warm_transfer("CAtestcall003", ctas_level=2)

        assert exc_info.value.status == 503
        assert "Twilio is down" in exc_info.value.message


@pytest.mark.asyncio
async def test_trigger_warm_transfer_l2_also_works(mock_twilio_client, mock_settings_configured):
    """L2 (Emergent) calls should also trigger warm transfer."""
    result = await trigger_warm_transfer("CAtestcall004", ctas_level=2)
    assert result["status"] == "escalated"
    assert result["ctas_level"] == 2
