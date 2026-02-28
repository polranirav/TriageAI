import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_returns_200(client: AsyncClient) -> None:
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_health_includes_environment(client: AsyncClient) -> None:
    response = await client.get("/health")
    body = response.json()
    assert "environment" in body
    assert body["environment"] in ("development", "staging", "production")
