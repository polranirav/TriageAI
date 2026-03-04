"""
Admin dashboard API — analytics and session management.

All endpoints require JWT authentication via the require_auth dependency.
"""

import csv
import io
from datetime import UTC, datetime, timedelta

import jwt
import structlog
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
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


class TodayStats(BaseModel):
    total_calls: int
    escalations: int
    active_count: int
    avg_duration_sec: float | None


class LiveDashboardResponse(BaseModel):
    active_calls: list[SessionSummary]
    recent_sessions: list[SessionSummary]
    today_stats: TodayStats


@router.get("/live", response_model=LiveDashboardResponse)
async def live_dashboard(
    db: AsyncSession = Depends(get_session),  # noqa: B008
) -> LiveDashboardResponse:
    """Live monitor — active calls, recent 15 completed, today's stats."""
    today = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
    stale_cutoff = datetime.now(UTC) - timedelta(minutes=5)

    # Auto-close stale sessions (started > 5 min ago with no ended_at)
    stale_q = (
        select(TriageSessionModel)
        .where(
            TriageSessionModel.ended_at.is_(None),
            TriageSessionModel.started_at < stale_cutoff,
        )
    )
    stale_sessions = (await db.execute(stale_q)).scalars().all()
    for s in stale_sessions:
        s.ended_at = datetime.now(UTC)
        if s.duration_sec is None and s.started_at:
            s.duration_sec = int((s.ended_at - s.started_at).total_seconds())
    if stale_sessions:
        await db.commit()

    # Active calls — only sessions started within last 5 min with no ended_at
    active_q = (
        select(TriageSessionModel)
        .where(
            TriageSessionModel.ended_at.is_(None),
            TriageSessionModel.started_at >= stale_cutoff,
        )
        .order_by(TriageSessionModel.started_at.desc())
    )
    active_calls = (await db.execute(active_q)).scalars().all()

    # 15 most-recently completed sessions
    recent_q = (
        select(TriageSessionModel)
        .where(TriageSessionModel.ended_at.is_not(None))
        .order_by(TriageSessionModel.ended_at.desc())
        .limit(15)
    )
    recent_sessions = (await db.execute(recent_q)).scalars().all()

    # Today totals
    total_q = select(func.count()).select_from(TriageSessionModel).where(
        TriageSessionModel.started_at >= today
    )
    total_today = (await db.execute(total_q)).scalar() or 0

    esc_q = select(func.count()).select_from(TriageSessionModel).where(
        TriageSessionModel.started_at >= today,
        TriageSessionModel.escalated.is_(True),
    )
    esc_today = (await db.execute(esc_q)).scalar() or 0

    dur_q = select(func.avg(TriageSessionModel.duration_sec)).where(
        TriageSessionModel.started_at >= today,
        TriageSessionModel.duration_sec.is_not(None),
    )
    avg_dur = (await db.execute(dur_q)).scalar()

    def _to_summary(s: TriageSessionModel) -> SessionSummary:
        return SessionSummary(
            id=str(s.id),
            call_sid=s.call_sid,
            ctas_level=s.ctas_level,
            routing_action=s.routing_action,
            duration_sec=s.duration_sec,
            escalated=s.escalated,
            questions_completed=s.questions_completed,
            started_at=s.started_at.isoformat() if s.started_at else "",
        )

    return LiveDashboardResponse(
        active_calls=[_to_summary(s) for s in active_calls],
        recent_sessions=[_to_summary(s) for s in recent_sessions],
        today_stats=TodayStats(
            total_calls=total_today,
            escalations=esc_today,
            active_count=len(active_calls),
            avg_duration_sec=round(avg_dur, 1) if avg_dur else None,
        ),
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


# ── Extended analytics endpoints ─────────────────────────────────────────────


class WeeklyTrendItem(BaseModel):
    week: str
    total: int
    l1: int
    l2: int
    l3: int
    l4: int
    l5: int


class WeeklyTrend(BaseModel):
    trend: list[WeeklyTrendItem]


class DailyItem(BaseModel):
    date: str
    total: int
    l1: int
    l2: int
    l3: int
    l4: int
    l5: int


class DailyBreakdown(BaseModel):
    daily: list[DailyItem]


class RoutingBreakdownItem(BaseModel):
    action: str
    count: int
    percentage: float


class RoutingBreakdown(BaseModel):
    routing: list[RoutingBreakdownItem]


class HeatmapResponse(BaseModel):
    # 7 rows (Mon–Sun) × 8 columns (3-hour slots: 12a,3a,6a,9a,12p,3p,6p,9p)
    heatmap: list[list[int]]


@router.get("/analytics/weekly-trend", response_model=WeeklyTrend)
async def analytics_weekly_trend(
    weeks: int = Query(default=12, ge=1, le=52),
    db: AsyncSession = Depends(get_session),  # noqa: B008
) -> WeeklyTrend:
    """Per-week CTAS breakdown for the trend line chart."""
    since = datetime.now(UTC) - timedelta(weeks=weeks)

    stmt = (
        select(
            func.date_trunc("week", TriageSessionModel.started_at).label("week"),
            TriageSessionModel.ctas_level,
            func.count().label("cnt"),
        )
        .where(
            TriageSessionModel.started_at >= since,
            TriageSessionModel.ctas_level.is_not(None),
        )
        .group_by(
            func.date_trunc("week", TriageSessionModel.started_at),
            TriageSessionModel.ctas_level,
        )
        .order_by(func.date_trunc("week", TriageSessionModel.started_at))
    )
    rows = (await db.execute(stmt)).all()

    weeks_dict: dict[str, dict] = {}
    for row in rows:
        wk = row.week
        week_str = wk.strftime("%Y-W%V") if hasattr(wk, "strftime") else str(wk)[:10]
        if week_str not in weeks_dict:
            weeks_dict[week_str] = {
                "week": week_str, "total": 0, "l1": 0, "l2": 0, "l3": 0, "l4": 0, "l5": 0
            }
        weeks_dict[week_str][f"l{row.ctas_level}"] = row.cnt
        weeks_dict[week_str]["total"] += row.cnt

    return WeeklyTrend(trend=[WeeklyTrendItem(**v) for v in weeks_dict.values()])


@router.get("/analytics/daily", response_model=DailyBreakdown)
async def analytics_daily(
    days: int = Query(default=14, ge=1, le=90),
    db: AsyncSession = Depends(get_session),  # noqa: B008
) -> DailyBreakdown:
    """Per-day CTAS breakdown for the bar chart."""
    since = datetime.now(UTC) - timedelta(days=days)

    stmt = (
        select(
            func.date_trunc("day", TriageSessionModel.started_at).label("day"),
            TriageSessionModel.ctas_level,
            func.count().label("cnt"),
        )
        .where(TriageSessionModel.started_at >= since)
        .group_by(
            func.date_trunc("day", TriageSessionModel.started_at),
            TriageSessionModel.ctas_level,
        )
        .order_by(func.date_trunc("day", TriageSessionModel.started_at))
    )
    rows = (await db.execute(stmt)).all()

    daily_dict: dict[str, dict] = {}
    for row in rows:
        d = row.day
        date_str = d.strftime("%Y-%m-%d") if hasattr(d, "strftime") else str(d)[:10]
        if date_str not in daily_dict:
            daily_dict[date_str] = {
                "date": date_str, "total": 0, "l1": 0, "l2": 0, "l3": 0, "l4": 0, "l5": 0
            }
        if row.ctas_level:
            daily_dict[date_str][f"l{row.ctas_level}"] = row.cnt
        daily_dict[date_str]["total"] += row.cnt

    return DailyBreakdown(daily=[DailyItem(**v) for v in daily_dict.values()])


@router.get("/analytics/routing-breakdown", response_model=RoutingBreakdown)
async def analytics_routing_breakdown(
    days: int = Query(default=30, ge=1, le=365),
    db: AsyncSession = Depends(get_session),  # noqa: B008
) -> RoutingBreakdown:
    """Real routing action distribution — replaces hardcoded percentages."""
    since = datetime.now(UTC) - timedelta(days=days)

    stmt = (
        select(TriageSessionModel.routing_action, func.count().label("cnt"))
        .where(
            TriageSessionModel.started_at >= since,
            TriageSessionModel.routing_action.is_not(None),
        )
        .group_by(TriageSessionModel.routing_action)
        .order_by(func.count().desc())
    )
    rows = (await db.execute(stmt)).all()

    total = sum(r.cnt for r in rows) or 1
    return RoutingBreakdown(
        routing=[
            RoutingBreakdownItem(
                action=r.routing_action,
                count=r.cnt,
                percentage=round(r.cnt / total, 3),
            )
            for r in rows
        ]
    )


@router.get("/analytics/heatmap", response_model=HeatmapResponse)
async def analytics_heatmap(
    days: int = Query(default=30, ge=1, le=90),
    db: AsyncSession = Depends(get_session),  # noqa: B008
) -> HeatmapResponse:
    """Call volume heatmap: 7 days (Mon–Sun) × 8 time slots (3 h each)."""
    since = datetime.now(UTC) - timedelta(days=days)

    stmt = (
        select(
            func.extract("dow", TriageSessionModel.started_at).label("dow"),
            func.extract("hour", TriageSessionModel.started_at).label("hour"),
            func.count().label("cnt"),
        )
        .where(TriageSessionModel.started_at >= since)
        .group_by(
            func.extract("dow", TriageSessionModel.started_at),
            func.extract("hour", TriageSessionModel.started_at),
        )
    )
    rows = (await db.execute(stmt)).all()

    # PostgreSQL DOW: 0=Sun, 1=Mon…6=Sat → frontend Mon=0…Sun=6
    heatmap = [[0] * 8 for _ in range(7)]
    for row in rows:
        dow = int(row.dow)
        hour = int(row.hour)
        frontend_day = (dow - 1) % 7  # Sun(0)→6, Mon(1)→0…Sat(6)→5
        time_slot = hour // 3         # 0–7
        if 0 <= frontend_day <= 6 and 0 <= time_slot <= 7:
            heatmap[frontend_day][time_slot] = row.cnt

    return HeatmapResponse(heatmap=heatmap)


@router.get("/export/sessions.csv")
async def export_sessions_csv(
    days: int = Query(default=30, ge=1, le=365),
    db: AsyncSession = Depends(get_session),  # noqa: B008
) -> StreamingResponse:
    """Export PHIPA-safe triage sessions as a CSV file."""
    since = datetime.now(UTC) - timedelta(days=days)

    stmt = (
        select(TriageSessionModel)
        .where(TriageSessionModel.started_at >= since)
        .order_by(TriageSessionModel.started_at.desc())
    )
    sessions = (await db.execute(stmt)).scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "call_sid", "ctas_level", "routing_action", "duration_sec",
        "escalated", "questions_completed", "started_at", "ended_at",
    ])
    for s in sessions:
        writer.writerow([
            s.call_sid,
            s.ctas_level or "",
            s.routing_action or "",
            s.duration_sec or "",
            s.escalated,
            s.questions_completed,
            s.started_at.isoformat() if s.started_at else "",
            s.ended_at.isoformat() if s.ended_at else "",
        ])

    filename = f"triageai-sessions-{days}d.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
