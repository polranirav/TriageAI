import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class TriageSessionModel(Base):
    """
    De-identified triage session metadata.
    PHIPA compliant — zero PII columns. See COMPLIANCE.md for enforced schema rules.
    """

    __tablename__ = "triage_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    # Twilio opaque identifier — not PII
    call_sid: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, index=True
    )
    # CTAS classification result (1-5), null if call ended before classification
    ctas_level: Mapped[int | None] = mapped_column(Integer, nullable=True)
    # Routing decision enum string
    routing_action: Mapped[str | None] = mapped_column(String(32), nullable=True)
    duration_sec: Mapped[int | None] = mapped_column(Integer, nullable=True)
    escalated: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("false")
    )
    escalation_ts: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    questions_completed: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default=text("0")
    )
    language_detected: Mapped[str] = mapped_column(
        String(8), nullable=False, server_default=text("'en'")
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    ended_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    events: Mapped[list["SystemEventModel"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "SystemEventModel",
        back_populates="session",
        cascade="all, delete-orphan",
    )
