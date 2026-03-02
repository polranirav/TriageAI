"""
Unit tests for TriageSession state machine.

The state machine tracks one call's progress through the 5-question
triage flow. All transitions are deterministic and PII-free.
"""

from app.triage.state_machine import TriageSession, TriageState


class TestTriageSessionInit:
    def test_initial_state_is_greeting(self) -> None:
        session = TriageSession("CA123")
        assert session.state == TriageState.GREETING

    def test_initial_questions_completed_is_zero(self) -> None:
        session = TriageSession("CA123")
        assert session.questions_completed == 0

    def test_call_sid_stored(self) -> None:
        session = TriageSession("CA_test_sid")
        assert session.call_sid == "CA_test_sid"


class TestAdvanceState:
    def test_greeting_advances_to_q1(self) -> None:
        session = TriageSession("CA123")
        session.advance_state()
        assert session.state == TriageState.Q1

    def test_six_advances_reach_complete(self) -> None:
        """GREETING→Q1→Q2→Q3→Q4→Q5→COMPLETE requires 6 advances."""
        session = TriageSession("CA123")
        for _ in range(6):
            session.advance_state()
        assert session.state == TriageState.COMPLETE

    def test_questions_completed_increments(self) -> None:
        session = TriageSession("CA123")
        session.advance_state()
        assert session.questions_completed == 1

    def test_questions_completed_counts_all_advances(self) -> None:
        session = TriageSession("CA123")
        for _ in range(3):
            session.advance_state()
        assert session.questions_completed == 3

    def test_advance_from_terminal_state_is_noop(self) -> None:
        session = TriageSession("CA123")
        for _ in range(6):
            session.advance_state()
        assert session.state == TriageState.COMPLETE
        count_before = session.questions_completed
        session.advance_state()  # no-op
        assert session.state == TriageState.COMPLETE
        assert session.questions_completed == count_before

    def test_advance_returns_next_state(self) -> None:
        session = TriageSession("CA123")
        result = session.advance_state()
        assert result == TriageState.Q1


class TestIsComplete:
    def test_not_complete_at_start(self) -> None:
        session = TriageSession("CA123")
        assert session.is_complete() is False

    def test_complete_after_six_advances(self) -> None:
        session = TriageSession("CA123")
        for _ in range(6):
            session.advance_state()
        assert session.is_complete() is True

    def test_not_complete_after_partial_flow(self) -> None:
        session = TriageSession("CA123")
        session.advance_state()
        session.advance_state()
        assert session.is_complete() is False


class TestMarkIncomplete:
    def test_sets_state_to_incomplete(self) -> None:
        session = TriageSession("CA123")
        session.advance_state()
        session.mark_incomplete()
        assert session.state == TriageState.INCOMPLETE

    def test_is_not_complete_when_incomplete(self) -> None:
        session = TriageSession("CA123")
        session.mark_incomplete()
        assert session.is_complete() is False


class TestMarkEscalated:
    def test_sets_state_to_escalated(self) -> None:
        session = TriageSession("CA123")
        session.mark_escalated()
        assert session.state == TriageState.ESCALATED

    def test_escalated_is_not_complete(self) -> None:
        session = TriageSession("CA123")
        session.mark_escalated()
        assert session.is_complete() is False
