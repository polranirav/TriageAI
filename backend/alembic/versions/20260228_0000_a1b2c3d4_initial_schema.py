"""Initial schema: triage_sessions and system_events

Revision ID: a1b2c3d4
Revises:
Create Date: 2026-02-28 00:00:00.000000
"""

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID

from alembic import op

revision = "a1b2c3d4"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "triage_sessions",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        # Twilio opaque call identifier — not PII
        sa.Column("call_sid", sa.String(64), nullable=False),
        sa.Column("ctas_level", sa.Integer, nullable=True),
        sa.Column("routing_action", sa.String(32), nullable=True),
        sa.Column("duration_sec", sa.Integer, nullable=True),
        sa.Column(
            "escalated",
            sa.Boolean,
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column("escalation_ts", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "questions_completed",
            sa.Integer,
            nullable=False,
            server_default=sa.text("0"),
        ),
        sa.Column(
            "language_detected",
            sa.String(8),
            nullable=False,
            server_default=sa.text("'en'"),
        ),
        sa.Column(
            "started_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_unique_constraint(
        "uq_triage_sessions_call_sid", "triage_sessions", ["call_sid"]
    )
    op.create_index("ix_triage_sessions_call_sid", "triage_sessions", ["call_sid"])

    op.create_table(
        "system_events",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "call_sid",
            sa.String(64),
            sa.ForeignKey("triage_sessions.call_sid", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("event_type", sa.String(64), nullable=False),
        # JSON audit metadata — NEVER write PII here (see COMPLIANCE.md)
        sa.Column(
            "metadata",
            JSONB,
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_system_events_call_sid", "system_events", ["call_sid"])


def downgrade() -> None:
    op.drop_index("ix_system_events_call_sid", "system_events")
    op.drop_table("system_events")
    op.drop_index("ix_triage_sessions_call_sid", "triage_sessions")
    op.drop_constraint("uq_triage_sessions_call_sid", "triage_sessions")
    op.drop_table("triage_sessions")
