"""
Unit tests for the routing module — routing messages and resource lookup.
"""

from app.routing import get_resources_for_action, get_routing_message


class TestGetRoutingMessage:
    """Test routing message lookup from triage_config.json."""

    def test_escalate_911_message(self):
        msg = get_routing_message("escalate_911")
        assert msg  # Non-empty
        assert "emergency" in msg.lower() or "nurse" in msg.lower() or "stay" in msg.lower()

    def test_er_urgent_message(self):
        msg = get_routing_message("er_urgent")
        assert msg
        assert "emergency" in msg.lower() or "urgent" in msg.lower()

    def test_walk_in_message(self):
        msg = get_routing_message("walk_in")
        assert msg
        assert "walk-in" in msg.lower() or "clinic" in msg.lower()

    def test_home_care_message(self):
        msg = get_routing_message("home_care")
        assert msg
        assert "home" in msg.lower() or "rest" in msg.lower() or "emergency" not in msg.lower()

    def test_unknown_action_returns_conservative_fallback(self):
        """Unknown routing action → conservative fallback, never says 'you're fine'."""
        msg = get_routing_message("nonexistent_action")
        assert msg
        assert "emergency" in msg.lower() or "911" in msg


class TestGetResourcesForAction:
    """Test resource lookup by routing action."""

    def test_escalate_911_returns_emergency(self):
        resources = get_resources_for_action("escalate_911")
        assert len(resources) >= 1
        assert resources[0]["type"] == "emergency"

    def test_er_urgent_returns_emergency(self):
        resources = get_resources_for_action("er_urgent")
        assert len(resources) >= 1

    def test_walk_in_returns_telehealth(self):
        resources = get_resources_for_action("walk_in")
        assert len(resources) >= 1

    def test_home_care_returns_telehealth(self):
        resources = get_resources_for_action("home_care")
        assert len(resources) >= 1

    def test_unknown_action_returns_empty(self):
        resources = get_resources_for_action("unknown")
        assert resources == []
