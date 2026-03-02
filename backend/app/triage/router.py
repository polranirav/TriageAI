"""
Triage API endpoints.

Used for health checks and internal verification of the classifier.
The primary triage path runs through the voice pipeline, not HTTP.
"""

from fastapi import APIRouter

from app.triage.classifier import classify_ctas, get_routing_action
from app.triage.state_machine import TriageState

router = APIRouter(tags=["triage"])


@router.get("/triage/health")
async def triage_health() -> dict:
    """
    Smoke-test the triage module.

    Runs a known L1 case through classify_ctas() and get_routing_action()
    to confirm the module loaded correctly and the classifier is functional.
    """
    test_answers = {
        "chief_complaint": "chest pain",
        "severity": 9,
        "age": 70,
    }
    level = classify_ctas(test_answers)
    action = get_routing_action(level.value)

    return {
        "status": "ok",
        "states": [s.value for s in TriageState],
        "test_ctas_level": level.value,
        "test_routing_action": action.value,
    }
