import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Radio, PhoneCall, AlertTriangle, Clock, RefreshCw } from "lucide-react"
import { api, type LiveDashboardData, type SessionSummary } from "../lib/api"
import { StatCard } from "../components/ui/StatCard"
import { CTASBadge, type CTASLevel } from "../components/ui/CTASBadge"
import { cn } from "../lib/utils"

const POLL_INTERVAL = 5000 // 5 s

export function LiveMonitor() {
  const [data, setData] = useState<LiveDashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [secAgo, setSecAgo] = useState(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const result = await api.liveData()
      setData(result)
      setSecAgo(0)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load live data")
    }
  }, [])

  useEffect(() => {
    fetchData()
    pollRef.current = setInterval(fetchData, POLL_INTERVAL)
    tickRef.current = setInterval(() => setSecAgo((s) => s + 1), 1000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [fetchData])

  const stats = data?.today_stats
  const avgDurDisplay = stats?.avg_duration_sec
    ? `${Math.floor(stats.avg_duration_sec / 60)}:${String(Math.round(stats.avg_duration_sec % 60)).padStart(2, "0")}`
    : "—"

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto animate-fade-in">
      {/* Header */}
      <section className="panel p-5 md:p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-primary-400 mb-1">Real-time</p>
            <h1 className="text-h1 flex items-center gap-2.5">
              <Radio className="w-5 h-5 text-primary-400" />
              Live Monitor
            </h1>
            <p className="text-body-sm text-text-muted mt-1">
              Active calls and today's activity — auto-refreshes every 5 s
            </p>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-text-muted">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Updated {secAgo === 0 ? "just now" : `${secAgo}s ago`}</span>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Active Now"
          value={stats?.active_count ?? 0}
          icon={<PhoneCall className="w-4 h-4" />}
          accentColor="#10B981"
          specialBorder={stats?.active_count ? "#10B98150" : undefined}
        />
        <StatCard
          label="Calls Today"
          value={stats?.total_calls ?? 0}
          icon={<Radio className="w-4 h-4" />}
        />
        <StatCard
          label="Escalations Today"
          value={stats?.escalations ?? 0}
          icon={<AlertTriangle className="w-4 h-4" />}
          accentColor="#FF6B00"
          specialBorder={stats?.escalations ? "#FF6B0050" : undefined}
        />
        <StatCard
          label="Avg Duration Today"
          value={avgDurDisplay}
          icon={<Clock className="w-4 h-4" />}
          format="raw"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Active calls — wider */}
        <section className="panel p-5 md:p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h3 inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-status-live animate-pulse" />
              Active Calls
            </h2>
            <span className="mono-data text-[12px]">{data?.active_calls.length ?? 0} live</span>
          </div>

          {!data ? (
            <div className="ecg-loader" />
          ) : data.active_calls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <PhoneCall className="w-8 h-8 text-text-muted mb-3 opacity-40" />
              <p className="text-sm text-text-muted">No active calls right now</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.active_calls.map((call) => (
                <ActiveCallRow key={call.call_sid} call={call} />
              ))}
            </div>
          )}
        </section>

        {/* Recent activity — narrower */}
        <section className="panel p-5 md:p-6 lg:col-span-2">
          <h2 className="text-h3 mb-4">Recent Activity</h2>

          {!data ? (
            <div className="ecg-loader" />
          ) : data.recent_sessions.length === 0 ? (
            <p className="text-sm text-text-muted py-8 text-center">No sessions yet today</p>
          ) : (
            <div className="space-y-1">
              {data.recent_sessions.map((s) => (
                <RecentSessionRow key={s.call_sid} session={s} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

// ── Active Call Row ───────────────────────────────────────────────────────────

function ActiveCallRow({ call }: { call: SessionSummary }) {
  const [elapsed, setElapsed] = useState(() => {
    const diff = Date.now() - new Date(call.started_at).getTime()
    return Math.floor(diff / 1000)
  })

  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const mins = Math.floor(elapsed / 60)
  const secs = String(elapsed % 60).padStart(2, "0")
  const level = call.ctas_level ? (`L${call.ctas_level}` as CTASLevel) : null

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border-subtle bg-card/50 px-3 py-2.5",
        call.escalated && "border-orange-500/30 bg-orange-500/5",
      )}
    >
      <span className="w-2 h-2 rounded-full bg-status-live animate-pulse shrink-0" />
      <span className="mono-data text-[11px] truncate flex-1">{call.call_sid.slice(-8)}</span>
      {level ? <CTASBadge level={level} size="sm" /> : <span className="text-[11px] text-text-muted">—</span>}
      <span className="text-[11px] text-text-muted">Q{call.questions_completed}/5</span>
      <span className="mono-data text-[12px] shrink-0 text-status-live">
        {mins}:{secs}
      </span>
    </div>
  )
}

// ── Recent Session Row ────────────────────────────────────────────────────────

function RecentSessionRow({ session }: { session: SessionSummary }) {
  const level = session.ctas_level ? (`L${session.ctas_level}` as CTASLevel) : null
  const dur = session.duration_sec
    ? `${Math.floor(session.duration_sec / 60)}:${String(session.duration_sec % 60).padStart(2, "0")}`
    : "—"

  return (
    <Link
      to={`/dashboard/sessions/${session.call_sid}`}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-2 text-[12px] transition-colors hover:bg-card",
        session.escalated && "row-escalated",
      )}
    >
      {level ? <CTASBadge level={level} size="sm" /> : <span className="text-text-muted">—</span>}
      <span className="mono-data text-[11px] flex-1 truncate text-text-muted">
        {session.call_sid.slice(-8)}
      </span>
      <span className="text-text-muted">{dur}</span>
      {session.escalated && (
        <AlertTriangle className="w-3 h-3 text-orange-400 shrink-0" />
      )}
    </Link>
  )
}
