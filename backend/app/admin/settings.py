"""
Admin settings API — clinic profile and notification preferences.

Settings are persisted to a JSON file (settings.json) in the app data directory.
This avoids schema migrations for simple key-value config that admins can edit.
"""

import json
from pathlib import Path
from typing import Any

import structlog
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.admin.auth import require_auth
from app.config import settings as app_settings

logger = structlog.get_logger()

router = APIRouter(tags=["admin-settings"], dependencies=[Depends(require_auth)])

# Settings file path — persists across container restarts if volume-mounted
_SETTINGS_FILE = Path("/app/data/settings.json")


class ClinicSettings(BaseModel):
    clinic_name: str = ""
    oncall_number: str = ""
    escalation_sla: str = "20 seconds"
    sms_alerts: bool = True
    email_digest: bool = True
    critical_only: bool = False


def _load_settings() -> dict[str, Any]:
    """Load settings from disk, falling back to env vars for defaults."""
    defaults: dict[str, Any] = {
        "clinic_name": "Ottawa CHC",
        "oncall_number": app_settings.ESCALATION_PHONE_NUMBER or "",
        "escalation_sla": "20 seconds",
        "sms_alerts": True,
        "email_digest": True,
        "critical_only": False,
    }
    if _SETTINGS_FILE.exists():
        try:
            with open(_SETTINGS_FILE) as f:
                saved = json.load(f)
                defaults.update(saved)
        except Exception as exc:
            logger.warning("settings_load_failed", error=str(exc))
    return defaults


def _save_settings(data: dict[str, Any]) -> None:
    """Persist settings to disk."""
    _SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(_SETTINGS_FILE, "w") as f:
        json.dump(data, f, indent=2)
    logger.info("settings_saved")


@router.get("/settings", response_model=ClinicSettings)
async def get_settings() -> ClinicSettings:
    """Read current clinic settings."""
    data = _load_settings()
    return ClinicSettings(**data)


@router.put("/settings", response_model=ClinicSettings)
async def update_settings(body: ClinicSettings) -> ClinicSettings:
    """Update and persist clinic settings."""
    data = body.model_dump()
    _save_settings(data)
    return ClinicSettings(**data)
