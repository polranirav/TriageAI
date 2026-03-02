import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, String, func, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class SystemEventModel(Base):
    """
    PHIPA audit trail — structured events with no PII in metadata.
    See COMPLIANCE.md for permitted event types and metadata fields.
    """

    __tablename__ = "system_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    call_sid: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("triage_sessions.call_sid", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    event_type: Mapped[str] = mapped_column(String(64), nullable=False)
    # NEVER write PII here — see COMPLIANCE.md
    # DB column: "metadata". Python attr: "event_metadata" (SQLAlchemy reserves "metadata")
    event_metadata: Mapped[dict[str, Any]] = mapped_column(
        "metadata", JSONB, nullable=False, server_default=text("'{}'::jsonb")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    session: Mapped["TriageSessionModel"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "TriageSessionModel",
        back_populates="events",
    )
