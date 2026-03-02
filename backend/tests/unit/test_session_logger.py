"""
Unit tests for session logger — log_event() and complete_session().

Mocks the database to test logging logic without a real PostgreSQL connection.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from app.logging.session_logger import complete_session, log_event
from app.models.system_event import SystemEventModel


@pytest.fixture
def mock_db():
    """Mock async database session."""
    db = AsyncMock()
    db.add = MagicMock()
    db.flush = AsyncMock()
    return db


class TestLogEvent:
    @pytest.mark.asyncio
    async def test_log_event_creates_system_event(self, mock_db):
        """log_event should add a SystemEventModel to the DB session."""
        await log_event(
            call_sid="CA_test_log_001",
            event_type="triage_started",
            metadata={"source": "test"},
            db=mock_db,
        )
        mock_db.add.assert_called_once()
        event = mock_db.add.call_args[0][0]
        assert isinstance(event, SystemEventModel)
        assert event.call_sid == "CA_test_log_001"
        assert event.event_type == "triage_started"

    @pytest.mark.asyncio
    async def test_log_event_preserves_metadata(self, mock_db):
        """Metadata dict should be stored as-is."""
        metadata = {"ctas_level": 1, "trigger": "voice"}
        await log_event(
            call_sid="CA_test_meta",
            event_type="escalation_triggered",
            metadata=metadata,
            db=mock_db,
        )
        event = mock_db.add.call_args[0][0]
        assert event.event_metadata == metadata

    @pytest.mark.asyncio
    async def test_log_event_empty_metadata(self, mock_db):
        """Empty metadata should not crash."""
        await log_event(
            call_sid="CA_test_empty",
            event_type="call_ended",
            metadata={},
            db=mock_db,
        )
        event = mock_db.add.call_args[0][0]
        assert event.event_metadata == {}


class TestCompleteSession:
    @pytest.mark.asyncio
    async def test_complete_session_updates_db(self, mock_db):
        """complete_session should execute an update statement."""
        await complete_session(
            call_sid="CA_test_complete",
            ctas_level=3,
            routing_action="walk_in",
            escalated=False,
            questions_completed=5,
            db=mock_db,
        )
        # Should have called execute (for the UPDATE) and flush
        mock_db.execute.assert_called()

    @pytest.mark.asyncio
    async def test_complete_session_with_escalation(self, mock_db):
        """Escalated sessions should set escalated=True."""
        await complete_session(
            call_sid="CA_test_esc",
            ctas_level=1,
            routing_action="escalate_911",
            escalated=True,
            questions_completed=2,
            db=mock_db,
        )
        mock_db.execute.assert_called()

    @pytest.mark.asyncio
    async def test_complete_session_null_ctas(self, mock_db):
        """Session that ended before classification should handle None ctas."""
        await complete_session(
            call_sid="CA_test_null",
            ctas_level=None,
            routing_action=None,
            escalated=False,
            questions_completed=0,
            db=mock_db,
        )
        mock_db.execute.assert_called()
