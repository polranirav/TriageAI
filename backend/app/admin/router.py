"""
Admin dashboard API — analytics and session management.

All endpoints require JWT authentication via the require_auth dependency.
"""

from datetime import UTC, datetime, timedelta

import jwt
import structlog
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.admin.auth import require_auth
from app.config import settings
from app.database import get_session
from app.exceptions import TRIAGE_SESSION_NOT_FOUND, UNAUTHORIZED, TriageAIError
from app.models.system_event import SystemEventModel
from app.models.triage_session import TriageSessionModel

logger = structlog.get_logger()

# ── Unauthenticated: login ────────────────────────────────────────────────────

auth_router = APIRouter(tags=["admin-auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"  # noqa: S105


@auth_router.post("/login", response_model=TokenResponse)
async def admin_login(body: LoginRequest) -> TokenResponse:
    """Return a signed JWT for the admin dashboard. Validates email + password from env."""
    if body.email != settings.ADMIN_EMAIL or body.password != settings.ADMIN_PASSWORD:
        raise TriageAIError(
            code=UNAUTHORIZED,
            message="Invalid admin credentials.",
            status=401,
        )
    token = jwt.encode(
        {"sub": "admin", "email": body.email, "role": "admin", "aud": "authenticated"},
        settings.SECRET_KEY,
        algorithm="HS256",
    )
    return TokenResponse(access_token=token)


# ── Authenticated: analytics + sessions ──────────────────────────────────────

router = APIRouter(tags=["admin"], dependencies=[Depends(require_auth)])


# ── Response models ──────────────────────────────────────────────────────────


class AnalyticsSummary(BaseModel):
    total_calls: int
    escalation_rate: float
    avg_duration_sec: float | None
    non_emergency_pct: float
    period_start: str
    period_end: str


class CTASDistributionItem(BaseModel):
    level: int
    count: int
    percentage: float


class CTASDistribution(BaseModel):
    distribution: list[CTASDistributionItem]


class SessionSummary(BaseModel):
    id: str
    call_sid: str
    ctas_level: int | None
    routing_action: str | None
    duration_sec: int | None
    escalated: bool
    questions_completed: int
    started_at: str


class SessionListResponse(BaseModel):
    sessions: list[SessionSummary]
    total: int
    page: int
    per_page: int


class EventItem(BaseModel):
    event_type: str
    created_at: str
    metadata: dict


class SessionDetail(BaseModel):
    session: SessionSummary
    events: list[EventItem]


# ── Analytics endpoints ──────────────────────────────────────────────────────


@router.get("/analytics/summary", response_model=AnalyticsSummary)
async def analytics_summary(
    days: int = Query(default=30, ge=1, le=365),
    db: AsyncSession = Depends(get_session),  # noqa: B008
) -> AnalyticsSummary:
    """Dashboard stat cards — total calls, escalation rate, avg duration."""
    since = datetime.now(UTC) - timedelta(days=days)

    # Total calls in period
    total_q = select(func.count()).select_from(TriageSessionModel).where(
        TriageSessionModel.started_at >= since
    )
    total = (await db.execute(total_q)).scalar() or 0

    # Escalation count
    esc_q = select(func.count()).select_from(TriageSessionModel).where(
        TriageSessionModel.started_at >= since,
        TriageSessionModel.escalated.is_(True),
    )
    escalated = (await db.execute(esc_q)).scalar() or 0

    # Average duration
    dur_q = select(func.avg(TriageSessionModel.duration_sec)).where(
        TriageSessionModel.started_at >= since,
        TriageSessionModel.duration_sec.is_not(None),
    )
    avg_dur = (await db.execute(dur_q)).scalar()

    # Non-emergency (L3-L5)
    non_emerg_q = select(func.count()).select_from(TriageSessionModel).where(
        TriageSessionModel.started_at >= since,
        TriageSessionModel.ctas_level.is_not(None),
        TriageSessionModel.ctas_level >= 3,
    )
    non_emerg = (await db.execute(non_emerg_q)).scalar() or 0

    return AnalyticsSummary(
        total_calls=total,
        escalation_rate=round(escalated / total, 3) if total > 0 else 0.0,
        avg_duration_sec=round(avg_dur, 1) if avg_dur else None,
        non_emergency_pct=round(non_emerg / total, 3) if total > 0 else 0.0,
        period_start=since.isoformat(),
        period_end=datetime.now(UTC).isoformat(),
    )


@router.get("/analytics/ctas-distribution", response_model=CTASDistribution)
async def ctas_distribution(
    days: int = Query(default=30, ge=1, le=365),
    db: AsyncSession = Depends(get_session),  # noqa: B008
) -> CTASDistribution:
    """CTAS donut chart data — count and percentage per level."""
    since = datetime.now(UTC) - timedelta(days=days)

    stmt = (
        select(
            TriageSessionModel.ctas_level,
            func.count().label("count"),
        )
        .where(
            TriageSessionModel.started_at >= since,
            TriageSessionModel.ctas_level.is_not(None),
        )
        .group_by(TriageSessionModel.ctas_level)
        .order_by(TriageSessionModel.ctas_level)
    )
    result = await db.execute(stmt)
    rows = result.all()

    total = sum(r.count for r in rows) or 1  # avoid div/0
    distribution = [
        CTASDistributionItem(
            level=r.ctas_level,
            count=r.count,
            percentage=round(r.count / total, 3),
        )
        for r in rows
    ]

    return CTASDistribution(distribution=distribution)


# ── Sessions endpoints ───────────────────────────────────────────────────────


@router.get("/sessions", response_model=SessionListResponse)
async def list_sessions(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    ctas_level: int | None = Query(default=None, ge=1, le=5),
    escalated: bool | None = Query(default=None),
    db: AsyncSession = Depends(get_session),  # noqa: B008
) -> SessionListResponse:
    """Paginated session list with optional filters."""
    base_q = select(TriageSessionModel)
    count_q = select(func.count()).select_from(TriageSessionModel)

    if ctas_level is not None:
        base_q = base_q.where(TriageSessionModel.ctas_level == ctas_level)
        count_q = count_q.where(TriageSessionModel.ctas_level == ctas_level)
    if escalated is not None:
        base_q = base_q.where(TriageSessionModel.escalated == escalated)
        count_q = count_q.where(TriageSessionModel.escalated == escalated)

    total = (await db.execute(count_q)).scalar() or 0

    stmt = (
        base_q.order_by(TriageSessionModel.started_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    result = await db.execute(stmt)
    sessions = result.scalars().all()

    return SessionListResponse(
        sessions=[
            SessionSummary(
                id=str(s.id),
                call_sid=s.call_sid,
                ctas_level=s.ctas_level,
                routing_action=s.routing_action,
                duration_sec=s.duration_sec,
                escalated=s.escalated,
                questions_completed=s.questions_completed,
                started_at=s.started_at.isoformat() if s.started_at else "",
            )
            for s in sessions
        ],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/sessions/{call_sid}", response_model=SessionDetail)
async def get_session_detail(
    call_sid: str,
    db: AsyncSession = Depends(get_session),  # noqa: B008
) -> SessionDetail:
    """Session detail with system events timeline."""
    stmt = select(TriageSessionModel).where(
        TriageSessionModel.call_sid == call_sid
    )
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()

    if not session:
        raise TriageAIError(
            code=TRIAGE_SESSION_NOT_FOUND,
            message=f"No session found for call_sid: {call_sid}",
            status=404,
        )

    # Fetch events
    events_stmt = (
        select(SystemEventModel)
        .where(SystemEventModel.call_sid == call_sid)
        .order_by(SystemEventModel.created_at.asc())
    )
    events_result = await db.execute(events_stmt)
    events = events_result.scalars().all()

    return SessionDetail(
        session=SessionSummary(
            id=str(session.id),
            call_sid=session.call_sid,
            ctas_level=session.ctas_level,
            routing_action=session.routing_action,
            duration_sec=session.duration_sec,
            escalated=session.escalated,
            questions_completed=session.questions_completed,
            started_at=session.started_at.isoformat() if session.started_at else "",
        ),
        events=[
            EventItem(
                event_type=e.event_type,
                created_at=e.created_at.isoformat() if e.created_at else "",
                metadata=e.event_metadata or {},
            )
            for e in events
        ],
    )
