"""
Routing module — maps CTAS routing actions to patient-facing messages
and provides resource lookup for clinics and ERs.
"""

import json
from pathlib import Path

import structlog

logger = structlog.get_logger()

# Load routing messages from triage_config.json
_CONFIG_PATH = Path(__file__).parent.parent / "triage" / "triage_config.json"

with _CONFIG_PATH.open() as _f:
    _CONFIG = json.load(_f)

_ROUTING_MESSAGES: dict[str, str] = _CONFIG.get("routing_messages", {})


def get_routing_message(routing_action: str) -> str:
    """
    Get the patient-facing message for a routing action.

    Args:
        routing_action: One of escalate_911, er_urgent, walk_in, home_care

    Returns:
        Human-readable routing message optimized for TTS delivery.
    """
    message = _ROUTING_MESSAGES.get(routing_action)
    if not message:
        logger.warning("unknown_routing_action", action=routing_action)
        # Conservative fallback — never tell a patient everything is fine
        return (
            "I wasn't able to complete your assessment. "
            "Please call 911 or go to your nearest emergency room if you feel this is urgent."
        )
    return message


# Ontario resource data (pre-seeded, expandable via DB in V2)
ONTARIO_RESOURCES = {
    "crisis_lines": [
        {
            "name": "Ontario Crisis Line",
            "phone": "1-866-996-0991",
            "hours": "24/7",
            "description": "Free, confidential support for people in crisis",
        },
        {
            "name": "Kids Help Phone",
            "phone": "1-800-668-6868",
            "hours": "24/7",
            "description": "For children and youth in distress",
        },
    ],
    "telehealth": {
        "name": "Telehealth Ontario",
        "phone": "1-866-797-0000",
        "hours": "24/7",
        "description": "Free, confidential health advice from a registered nurse",
    },
    "health_info": {
        "name": "Ontario Health",
        "url": "https://www.ontario.ca/page/find-family-doctor-or-nurse-practitioner",
        "description": "Find a family doctor or nurse practitioner in Ontario",
    },
}


def get_resources_for_action(routing_action: str) -> list[dict]:
    """
    Get relevant resources based on the routing action.

    For non-emergency cases, provides helpful Ontario health resources.
    """
    if routing_action in ("escalate_911", "er_urgent"):
        return [
            {"type": "emergency", "message": "Call 911 or go to the nearest emergency room"},
        ]
    elif routing_action == "walk_in":
        return [
            ONTARIO_RESOURCES["telehealth"],
            ONTARIO_RESOURCES["health_info"],
        ]
    elif routing_action == "home_care":
        return [
            ONTARIO_RESOURCES["telehealth"],
        ]
    else:
        return []
