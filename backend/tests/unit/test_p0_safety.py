"""
P0 Safety Tests — These MUST always pass. Failure = deploy blocker.

Tests critical safety invariants:
  1. Crisis override can never be disabled
  2. CTAS L1 (Resuscitation) always routes to escalate_911
  3. CTAS L2 (Emergent) always routes to escalate_911
  4. Early escalation detects crisis keywords immediately
  5. Classifier missing data → conservative, never L5
  6. Conservative routing — unknown = emergency, never "you're fine"
"""

import pytest

from app.config import settings
from app.triage.classifier import (
    CTASLevel,
    RoutingAction,
    classify_ctas,
    get_routing_action,
    should_escalate_early,
)
from app.triage.state_machine import TriageSession, TriageState

# ── FF_CRISIS_OVERRIDE invariant ─────────────────────────────────────────────


class TestCrisisOverride:
    """FF_CRISIS_OVERRIDE must ALWAYS be True. It is NEVER user-toggleable."""

    def test_crisis_override_always_on(self):
        assert settings.FF_CRISIS_OVERRIDE is True

    def test_crisis_override_default_is_true(self):
        """Even if env vars are missing, default must be True."""
        from app.config import Settings
        fresh = Settings(
            TWILIO_ACCOUNT_SID="test",
            TWILIO_AUTH_TOKEN="test",
            OPENAI_API_KEY="test",
        )
        assert fresh.FF_CRISIS_OVERRIDE is True


# ── CTAS L1 classification safety ────────────────────────────────────────────


class TestCTASL1Safety:
    """L1 calls are life-threatening — MUST always route to escalation."""

    @pytest.mark.parametrize("complaint,severity", [
        ("chest pain", 9),
        ("not breathing", 10),
        ("severe bleeding", 9),
        ("unconscious", 10),
    ])
    def test_l1_complaints_classify_to_l1_or_l2(self, complaint, severity):
        """Critical complaints MUST classify as L1 or L2, never lower."""
        result = classify_ctas({
            "chief_complaint": complaint,
            "severity": severity,
            "age": 50,
        })
        assert result.value <= 2, (
            f"'{complaint}' with severity {severity} should be L1 or L2, got {result}"
        )

    def test_l1_always_escalates(self):
        action = get_routing_action(1)
        assert action == RoutingAction.ESCALATE_911

    def test_l2_also_escalates(self):
        """CTAS L2 routes to ESCALATE_911 per routing table."""
        action = get_routing_action(2)
        assert action == RoutingAction.ESCALATE_911


# ── CTAS L2 classification safety ────────────────────────────────────────────


class TestCTASL2Safety:
    """L2 calls are emergent — must go to ER or escalate."""

    def test_l2_routes_to_escalation(self):
        action = get_routing_action(2)
        assert action in (RoutingAction.ER_URGENT, RoutingAction.ESCALATE_911)

    def test_high_severity_with_age_risk(self):
        """High severity + elderly = at least L2."""
        result = classify_ctas({
            "chief_complaint": "chest pain",
            "severity": 8,
            "age": 80,
        })
        assert result.value <= 2, (
            f"Elderly + high severity + chest pain should be L1 or L2, got {result}"
        )


# ── Early escalation safety ──────────────────────────────────────────────────


class TestEarlyEscalation:
    """When crisis keywords are detected, early escalation must trigger."""

    def test_crisis_keyword_triggers_escalation(self):
        """Crisis keywords must trigger immediate escalation."""
        result = should_escalate_early({"chief_complaint": "I want to kill myself"})
        assert result is True

    def test_911_in_complaint_triggers_escalation(self):
        result = should_escalate_early({"chief_complaint": "I need 911"})
        assert result is True

    def test_emergency_keyword_triggers(self):
        result = should_escalate_early({"chief_complaint": "this is an emergency"})
        assert result is True

    def test_no_escalation_for_mild_complaint(self):
        result = should_escalate_early({"chief_complaint": "mild headache", "severity": 3})
        assert result is False

    def test_state_machine_marks_escalated(self):
        session = TriageSession("CA_test_crisis")
        session.mark_escalated()
        assert session.state == TriageState.ESCALATED


# ── Routing conservative fallback ────────────────────────────────────────────


class TestRoutingConservativeFallback:
    """Unknown or edge-case inputs must NEVER produce 'safe' routing."""

    def test_routing_message_fallback_is_conservative(self):
        from app.routing import get_routing_message
        msg = get_routing_message("totally_unknown_action")
        assert "emergency" in msg.lower() or "911" in msg

    def test_all_valid_levels_have_routing(self):
        """Every CTAS level 1-5 must produce a valid routing action."""
        for level in range(1, 6):
            action = get_routing_action(level)
            assert action is not None
            assert isinstance(action, RoutingAction)

    def test_invalid_level_raises(self):
        """Out-of-range CTAS level must raise, not silently downgrade."""
        with pytest.raises(ValueError):
            get_routing_action(6)
        with pytest.raises(ValueError):
            get_routing_action(0)


# ── Classifier edge cases ────────────────────────────────────────────────────


class TestClassifierEdgeCases:
    """Classifier must handle boundary and malformed inputs safely."""

    def test_severity_1_is_l5(self):
        result = classify_ctas({"chief_complaint": "mild headache", "severity": 1, "age": 25})
        assert result == CTASLevel.L5

    def test_missing_severity_defaults_conservatively(self):
        """Missing severity should NOT produce L5 (non-urgent)."""
        result = classify_ctas({"chief_complaint": "unknown symptom"})
        assert result.value <= 4, f"Missing severity should be conservative, got {result}"

    def test_missing_age_defaults_conservatively(self):
        """Missing age should NOT produce L5."""
        result = classify_ctas({"chief_complaint": "pain", "severity": 7})
        assert result.value <= 2, f"Missing age should return L2, got {result}"

    def test_empty_complaint_still_classifies(self):
        """Empty complaint should not crash the classifier."""
        result = classify_ctas({"chief_complaint": "", "severity": 5, "age": 40})
        assert isinstance(result, CTASLevel)


# ── State machine integrity ──────────────────────────────────────────────────


class TestStateMachineIntegrity:
    """State machine must track progression correctly."""

    def test_fresh_session_starts_in_greeting(self):
        session = TriageSession("CA_test")
        assert session.state == TriageState.GREETING

    def test_session_progresses_through_questions(self):
        session = TriageSession("CA_test")
        session.advance_state()  # GREETING → Q1
        assert session.state == TriageState.Q1
        assert session.questions_completed == 1

    def test_session_completes_after_all_questions(self):
        session = TriageSession("CA_test")
        for _ in range(6):  # GREETING → Q1 → Q2 → Q3 → Q4 → Q5 → COMPLETE
            session.advance_state()
        assert session.is_complete() is True
        assert session.state == TriageState.COMPLETE

    def test_incomplete_session_marked(self):
        session = TriageSession("CA_test")
        session.mark_incomplete()
        assert session.state == TriageState.INCOMPLETE

    def test_escalated_is_terminal_but_not_complete(self):
        """Escalated is a terminal state but is_complete() returns False (by design)."""
        session = TriageSession("CA_test")
        session.mark_escalated()
        assert session.state == TriageState.ESCALATED
        # is_complete only checks for COMPLETE state, which is correct —
        # an escalated call didn't "complete" the triage flow
        assert session.is_complete() is False
