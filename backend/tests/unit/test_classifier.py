"""
P0 Safety Tests — CTAS Classifier

These tests are NON-NEGOTIABLE. A regression here means the system
could fail to escalate a life-threatening emergency.
Run before every production deploy.
"""

import pytest

from app.triage.classifier import (
    CTASLevel,
    RoutingAction,
    classify_ctas,
    get_routing_action,
    should_escalate_early,
)


class TestClassifyCTAS:
    # ── Crisis keyword handling ──────────────────────────────────────────────

    def test_crisis_keyword_always_l1(self) -> None:
        assert classify_ctas({"chief_complaint": "I want to kill myself"}) == CTASLevel.L1

    def test_suicide_keyword_l1(self) -> None:
        assert classify_ctas({"chief_complaint": "thinking about suicide"}) == CTASLevel.L1

    def test_crisis_keyword_overrides_low_severity(self) -> None:
        """Crisis = L1 even if caller says severity 1."""
        answers = {"chief_complaint": "want to die", "severity": 1, "age": 25}
        assert classify_ctas(answers) == CTASLevel.L1

    # ── L1 keyword handling ──────────────────────────────────────────────────

    def test_chest_pain_high_severity_l1(self) -> None:
        answers = {"chief_complaint": "chest pain", "severity": 9, "age": 40}
        assert classify_ctas(answers) == CTASLevel.L1

    def test_chest_pain_elderly_l1(self) -> None:
        answers = {"chief_complaint": "chest pain", "severity": 5, "age": 65}
        assert classify_ctas(answers) == CTASLevel.L1

    def test_chest_pain_moderate_severity_young_l2(self) -> None:
        answers = {"chief_complaint": "chest pain", "severity": 5, "age": 40}
        assert classify_ctas(answers) == CTASLevel.L2

    def test_stroke_symptoms_l1(self) -> None:
        answers = {"chief_complaint": "stroke symptoms, face drooping", "severity": 9, "age": 55}
        assert classify_ctas(answers) == CTASLevel.L1

    # ── Missing data — must classify UP ─────────────────────────────────────

    def test_missing_severity_returns_l2(self) -> None:
        """CRITICAL: missing data must never classify down to L5."""
        result = classify_ctas({"chief_complaint": "mild headache"})
        assert result == CTASLevel.L2
        assert result != CTASLevel.L5

    def test_missing_age_returns_l2(self) -> None:
        result = classify_ctas({"chief_complaint": "mild headache", "severity": 3})
        assert result == CTASLevel.L2

    def test_empty_answers_returns_l2(self) -> None:
        """Completely empty triage must never produce L5."""
        result = classify_ctas({})
        assert result == CTASLevel.L2
        assert result.value <= 2

    def test_empty_complaint_missing_data_returns_l2(self) -> None:
        result = classify_ctas({"chief_complaint": ""})
        assert result == CTASLevel.L2

    # ── Severity-based classification ────────────────────────────────────────

    def test_high_severity_older_patient_l2(self) -> None:
        answers = {"chief_complaint": "stomach pain", "severity": 8, "age": 55}
        assert classify_ctas(answers) == CTASLevel.L2

    def test_high_severity_young_patient_l3(self) -> None:
        answers = {"chief_complaint": "stomach pain", "severity": 8, "age": 30}
        assert classify_ctas(answers) == CTASLevel.L3

    def test_moderate_severity_short_duration_l3(self) -> None:
        answers = {"chief_complaint": "back pain", "severity": 6, "age": 40, "duration_minutes": 60}
        assert classify_ctas(answers) == CTASLevel.L3

    def test_moderate_severity_long_duration_l4(self) -> None:
        answers = {
            "chief_complaint": "back pain", "severity": 6, "age": 40, "duration_minutes": 200
        }
        assert classify_ctas(answers) == CTASLevel.L4

    def test_mild_severity_l5(self) -> None:
        answers = {"chief_complaint": "runny nose", "severity": 2, "age": 30}
        assert classify_ctas(answers) == CTASLevel.L5

    def test_ctas_level_always_in_range(self) -> None:
        """Classifier must always return a value between L1 and L5."""
        cases = [
            {},
            {"chief_complaint": "headache"},
            {"chief_complaint": "chest pain", "severity": 10, "age": 80},
            {"chief_complaint": "runny nose", "severity": 1, "age": 20},
        ]
        for answers in cases:
            result = classify_ctas(answers)
            assert 1 <= result.value <= 5, f"Out-of-range CTAS for answers={answers}"


class TestShouldEscalateEarly:
    def test_crisis_keyword_triggers(self) -> None:
        assert should_escalate_early({"chief_complaint": "I want to die"}) is True

    def test_suicide_keyword_triggers(self) -> None:
        assert should_escalate_early({"chief_complaint": "thinking about suicide"}) is True

    def test_911_request_triggers(self) -> None:
        assert should_escalate_early({"chief_complaint": "I need 911 right now"}) is True

    def test_emergency_keyword_triggers(self) -> None:
        assert should_escalate_early({"chief_complaint": "this is an emergency"}) is True

    def test_l1_keyword_high_severity_triggers(self) -> None:
        assert should_escalate_early({"chief_complaint": "chest pain", "severity": 9}) is True

    def test_l1_keyword_elderly_triggers(self) -> None:
        assert should_escalate_early({"chief_complaint": "can't breathe", "age": 65}) is True

    def test_l1_keyword_low_severity_young_no_trigger(self) -> None:
        """L1 keyword but low severity and young patient — do not over-escalate."""
        result = should_escalate_early({"chief_complaint": "chest pain", "severity": 3, "age": 25})
        assert result is False

    def test_mild_complaint_no_trigger(self) -> None:
        assert should_escalate_early({"chief_complaint": "runny nose", "severity": 2}) is False

    def test_empty_answers_no_trigger(self) -> None:
        assert should_escalate_early({}) is False


class TestGetRoutingAction:
    def test_l1_escalates_911(self) -> None:
        assert get_routing_action(1) == RoutingAction.ESCALATE_911

    def test_l2_escalates_911(self) -> None:
        assert get_routing_action(2) == RoutingAction.ESCALATE_911

    def test_l3_er_urgent(self) -> None:
        assert get_routing_action(3) == RoutingAction.ER_URGENT

    def test_l4_walk_in(self) -> None:
        assert get_routing_action(4) == RoutingAction.WALK_IN

    def test_l5_home_care(self) -> None:
        assert get_routing_action(5) == RoutingAction.HOME_CARE

    def test_invalid_level_raises_value_error(self) -> None:
        with pytest.raises(ValueError, match="Invalid CTAS level"):
            get_routing_action(6)

    def test_zero_raises_value_error(self) -> None:
        with pytest.raises(ValueError, match="Invalid CTAS level"):
            get_routing_action(0)

    def test_wrong_type_raises_type_error(self) -> None:
        with pytest.raises(TypeError, match="must be int"):
            get_routing_action("L1")  # type: ignore[arg-type]
