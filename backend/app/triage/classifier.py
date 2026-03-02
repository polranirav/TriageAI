"""
CTAS classifier — pure, deterministic, no LLM calls.

CRITICAL INVARIANT: When data is missing, classify UP not DOWN.
A missed emergency is infinitely worse than a false alarm.
"""

import json
from enum import Enum
from pathlib import Path

_CONFIG_PATH = Path(__file__).parent / "triage_config.json"

with _CONFIG_PATH.open() as _f:
    _CONFIG = json.load(_f)

_L1_KEYWORDS: list[str] = _CONFIG["l1_keywords"]
_CRISIS_KEYWORDS: list[str] = _CONFIG["crisis_keywords"]


class CTASLevel(Enum):
    L1 = 1
    L2 = 2
    L3 = 3
    L4 = 4
    L5 = 5


class RoutingAction(Enum):
    ESCALATE_911 = "escalate_911"
    ER_URGENT = "er_urgent"
    WALK_IN = "walk_in"
    HOME_CARE = "home_care"
    INCOMPLETE = "incomplete"


def classify_ctas(answers: dict) -> CTASLevel:
    """
    Map triage answers to a CTAS level (1–5).

    Args:
        answers: dict with keys chief_complaint, severity, age, duration_minutes, conditions

    Returns:
        CTASLevel — never raises; missing data always returns L2 or higher.
    """
    complaint: str = answers.get("chief_complaint", "").lower()
    severity: int | None = answers.get("severity")
    age: int | None = answers.get("age")
    duration: int | None = answers.get("duration_minutes")

    # Crisis keywords → L1 unconditionally (FF_CRISIS_OVERRIDE always true)
    if any(kw in complaint for kw in _CRISIS_KEYWORDS):
        return CTASLevel.L1

    # L1 symptom keywords
    if any(kw in complaint for kw in _L1_KEYWORDS):
        if severity is not None and severity >= 8:
            return CTASLevel.L1
        if age is not None and age >= 65:
            return CTASLevel.L1
        return CTASLevel.L2

    # Missing data → conservative (L2), never L5
    if severity is None or age is None:
        return CTASLevel.L2

    # Severity-based classification
    if severity >= 8:
        return CTASLevel.L2 if age >= 50 else CTASLevel.L3
    if severity >= 5:
        return CTASLevel.L3 if (duration is not None and duration < 120) else CTASLevel.L4

    return CTASLevel.L5


def should_escalate_early(partial_answers: dict) -> bool:
    """
    Detect L1/L2 conditions before all 5 questions are answered.

    This is the most safety-critical function in the system.
    Returns True → trigger emergency transfer IMMEDIATELY.
    """
    complaint: str = partial_answers.get("chief_complaint", "").lower()
    severity: int | None = partial_answers.get("severity")

    # Any crisis keyword = immediate escalation
    if any(kw in complaint for kw in _CRISIS_KEYWORDS):
        return True

    # Caller explicitly requests emergency services
    if "911" in complaint or "emergency" in complaint:
        return True

    # L1 keywords with supporting factors
    if any(kw in complaint for kw in _L1_KEYWORDS):
        if severity is not None and severity >= 9:
            return True
        if partial_answers.get("age", 0) >= 65:
            return True

    return False


def get_routing_action(ctas_level: int) -> RoutingAction:
    """
    Map a CTAS level integer to the corresponding routing action.

    Args:
        ctas_level: integer 1–5

    Raises:
        TypeError: if ctas_level is not an int
        ValueError: if ctas_level is outside 1–5
    """
    if not isinstance(ctas_level, int):
        raise TypeError(f"CTAS level must be int, got {type(ctas_level)}")

    mapping: dict[int, RoutingAction] = {
        1: RoutingAction.ESCALATE_911,
        2: RoutingAction.ESCALATE_911,
        3: RoutingAction.ER_URGENT,
        4: RoutingAction.WALK_IN,
        5: RoutingAction.HOME_CARE,
    }

    if ctas_level not in mapping:
        raise ValueError(f"Invalid CTAS level: {ctas_level}. Must be 1–5.")

    return mapping[ctas_level]
