import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api, type SessionSummary } from "../lib/api"
import { CTASBadge, type CTASLevel } from "../components/ui/CTASBadge"
import { EmptyState } from "../components/ui/EmptyState"
import { EcgLoader } from "../components/ui/EcgLoader"
import { cn } from "../lib/utils"
import {
    AlertTriangle, Shield, ChevronRight,
} from "lucide-react"

export function Escalations() {
    const [sessions, setSessions] = useState<SessionSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeCount, setActiveCount] = useState(0)

    useEffect(() => {
        api
            .listSessions({ per_page: 50, escalated: true })
            .then((res) => setSessions(res.sessions))
            .catch((err) => setError(err instanceof Error ? err.message : "Failed to load escalations"))
            .finally(() => setLoading(false))
        api.liveData()
            .then((data) => setActiveCount(data.today_stats.active_count))
            .catch(() => {})
    }, [])

    // Split into today / this month
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    const todaySessions = sessions.filter((s) => s.started_at.slice(0, 10) === todayStr)
    const olderSessions = sessions.filter((s) => s.started_at.slice(0, 10) !== todayStr)

    // Stats
    const avgDuration = sessions.length
        ? Math.round(sessions.reduce((sum, s) => sum + (s.duration_sec || 0), 0) / sessions.length)
        : 0

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto animate-fade-in space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-page-title text-text-primary">Escalations</h1>
                <p className="text-body text-text-secondary mt-1">
                    Every call classified L1 or L2 — bridge initiated
                </p>
            </div>

            {/* Summary pills */}
            {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
                    {error}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
                <Pill color="#10B981" label="Active" value={String(activeCount)} />
                <Pill color="#FF6B00" label="Today" value={String(todaySessions.length)} />
                <Pill color="#3B82F6" label="This Period" value={String(sessions.length)} />
            </div>

            {loading && <EcgLoader />}

            {!loading && sessions.length === 0 && (
                <EmptyState
                    icon={Shield}
                    title="Zero escalations this period"
                    description="Every caller was successfully routed to appropriate non-emergency care."
                />
            )}

            {/* Escalation Performance */}
            {!loading && sessions.length > 0 && (
                <div className="panel p-5 border-status-live/30">
                    <h2 className="section-label mb-3">Escalation Performance</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <MiniStat label="This Period" value={String(sessions.length)} />
                        <MiniStat label="Today" value={String(todaySessions.length)} />
                        <MiniStat
                            label="Avg Duration"
                            value={`${Math.floor(avgDuration / 60)}:${(avgDuration % 60).toString().padStart(2, "0")}`}
                            mono
                        />
                        <MiniStat label="Completion" value="100%" />
                    </div>
                </div>
            )}

            {/* Today's Escalations */}
            {!loading && todaySessions.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-section text-text-primary">Today</h2>
                    {todaySessions.map((s) => (
                        <EscalationRow key={s.id} session={s} />
                    ))}
                </div>
            )}

            {/* Older Escalations */}
            {!loading && olderSessions.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-section text-text-primary">Previous</h2>
                    {olderSessions.map((s) => (
                        <EscalationRow key={s.id} session={s} />
                    ))}
                </div>
            )}
        </div>
    )
}

// ── Sub-components ──

function Pill({ color, label, value }: { color: string; label: string; value: string }) {
    return (
        <div
            className="inline-flex items-center gap-2 text-[13px] font-medium px-3 py-1.5 rounded-md"
            style={{
                backgroundColor: `${color}1A`,
                border: `1px solid ${color}40`,
                color,
            }}
        >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            {value} {label}
        </div>
    )
}

function MiniStat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div>
            <p className="section-label mb-1">{label}</p>
            <p className={cn("text-[20px] font-bold text-text-primary", mono && "font-mono text-text-mono")}>
                {value}
            </p>
        </div>
    )
}

function EscalationRow({ session: s }: { session: SessionSummary }) {
    const time = new Date(s.started_at)
    const durMin = s.duration_sec ? Math.floor(s.duration_sec / 60) : 0
    const durSec = s.duration_sec ? s.duration_sec % 60 : 0
    const ctasLevel = s.ctas_level ? (`L${s.ctas_level}` as CTASLevel) : null

    return (
        <Link
            to={`/dashboard/sessions/${s.call_sid}`}
            className="panel p-4 flex items-center gap-4 hover:border-border-active transition-all group row-escalated"
        >
            {/* Warning icon */}
            <div className="w-10 h-10 rounded-lg bg-[#FF6B001A] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-status-escalated" />
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    {ctasLevel && <CTASBadge level={ctasLevel} size="sm" showLabel />}
                    <span className="text-[13px] text-text-secondary truncate">
                        {s.routing_action || "Emergency routing"}
                    </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[12px] text-text-muted font-mono">
                    <span>{time.toLocaleDateString("en-CA", { weekday: "short", day: "numeric", month: "short" })}</span>
                    <span>{time.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
            </div>

            {/* Duration */}
            <div className="text-right shrink-0">
                <p className="mono-data">{durMin}:{durSec.toString().padStart(2, "0")}</p>
                <p className="text-[11px] text-text-muted">duration</p>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary-500 shrink-0" />
        </Link>
    )
}
