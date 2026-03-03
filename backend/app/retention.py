"""
PIPEDA/PHIPA data retention — automatically purge sessions older than RETENTION_DAYS.

Session deletion cascades to system_events via FK ON DELETE CASCADE,
so only triage_sessions needs to be targeted.
"""

import asyncio
from datetime import UTC, datetime, timedelta

import structlog
from sqlalchemy import delete

from app.config import settings
from app.database import async_session_factory
from app.models.triage_session import TriageSessionModel

logger = structlog.get_logger()


async def run_retention_cleanup() -> None:
    """Delete triage sessions (and cascaded events) older than RETENTION_DAYS days."""
    cutoff = datetime.now(UTC) - timedelta(days=settings.RETENTION_DAYS)
    async with async_session_factory() as db:
        result = await db.execute(
            delete(TriageSessionModel).where(TriageSessionModel.started_at < cutoff)
        )
        await db.commit()
    logger.info(
        "retention_cleanup_complete",
        sessions_deleted=result.rowcount,
        cutoff_days=settings.RETENTION_DAYS,
    )


async def retention_loop() -> None:
    """Run data retention cleanup at startup, then every 24 hours."""
    while True:
        try:
            await run_retention_cleanup()
        except Exception:
            logger.exception("retention_cleanup_failed")
        await asyncio.sleep(24 * 3600)
