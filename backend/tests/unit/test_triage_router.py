"""
Tests for the triage module — router smoke-test endpoint and system prompt.
"""

import pytest

from app.triage.prompts import SUBMIT_TRIAGE_FUNCTION, build_system_prompt


class TestBuildSystemPrompt:
    def test_returns_string(self) -> None:
        result = build_system_prompt()
        assert isinstance(result, str)

    def test_contains_pipeda_consent_disclosure(self) -> None:
        """PIPEDA consent disclosure must appear verbatim."""
        result = build_system_prompt()
        assert "No personal health information is stored" in result

    def test_contains_five_questions(self) -> None:
        result = build_system_prompt()
        assert "5 questions" in result or "5 Questions" in result or "THE 5 QUESTIONS" in result

    def test_contains_routing_messages(self) -> None:
        result = build_system_prompt()
        assert "escalate_911" in result or "Connecting you to a nurse" in result


class TestSubmitTriageFunction:
    def test_is_dict(self) -> None:
        assert isinstance(SUBMIT_TRIAGE_FUNCTION, dict)

    def test_has_function_type(self) -> None:
        assert SUBMIT_TRIAGE_FUNCTION["type"] == "function"

    def test_name_is_submit_triage(self) -> None:
        assert SUBMIT_TRIAGE_FUNCTION["name"] == "submit_triage"

    def test_required_fields_present(self) -> None:
        required = SUBMIT_TRIAGE_FUNCTION["parameters"]["required"]
        assert "chief_complaint" in required
        assert "early_escalation" in required


class TestTriageHealthEndpoint:
    @pytest.mark.asyncio
    async def test_triage_health_returns_200(self, client) -> None:
        response = await client.get("/v1/triage/health")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_triage_health_returns_ok(self, client) -> None:
        response = await client.get("/v1/triage/health")
        data = response.json()
        assert data["status"] == "ok"

    @pytest.mark.asyncio
    async def test_triage_health_includes_ctas_level(self, client) -> None:
        response = await client.get("/v1/triage/health")
        data = response.json()
        assert "test_ctas_level" in data
        assert 1 <= data["test_ctas_level"] <= 5

    @pytest.mark.asyncio
    async def test_triage_health_known_l1_case(self, client) -> None:
        """Chest pain + severity 9 + age 70 must always classify as L1."""
        response = await client.get("/v1/triage/health")
        data = response.json()
        assert data["test_ctas_level"] == 1

    @pytest.mark.asyncio
    async def test_triage_health_includes_states(self, client) -> None:
        response = await client.get("/v1/triage/health")
        data = response.json()
        assert "states" in data
        assert "greeting" in data["states"]
