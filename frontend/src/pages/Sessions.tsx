import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api, type SessionSummary } from "../lib/api"
import { CTASBadge, type CTASLevel } from "../components/ui/CTASBadge"
import { EmptyState } from "../components/ui/EmptyState"
import { EcgLoader } from "../components/ui/EcgLoader"
import { cn } from "../lib/utils"
import {
  Search, Download, ChevronRight, ChevronLeft, AlertTriangle,
  List,
} from "lucide-react"

export function Sessions() {
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ctasFilter, setCtasFilter] = useState<number | undefined>()
  const [escalatedFilter, setEscalatedFilter] = useState<boolean | undefined>()
  const [search, setSearch] = useState("")
  const perPage = 25

  useEffect(() => {
    setLoading(true)
    setError(null)
    api
      .listSessions({
        page,
        per_page: perPage,
        ctas_level: ctasFilter,
        escalated: escalatedFilter,
      })
      .then((res) => {
        setSessions(res.sessions)
        setTotal(res.total)
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load sessions"))
      .finally(() => setLoading(false))
  }, [page, ctasFilter, escalatedFilter])

  const totalPages = Math.ceil(total / perPage)
  const filtered = search
    ? sessions.filter((s) => s.call_sid.toLowerCase().includes(search.toLowerCase()))
    : sessions

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-text-primary">All Sessions</h1>
          <p className="text-body text-text-secondary mt-1">
            Complete call history — review and audit triage outcomes
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => alert("CSV export coming soon")}
            className="inline-flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-text-primary border border-border-default rounded-md px-3 py-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="panel p-3 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border-default rounded-md py-2 pl-9 pr-3 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        {/* CTAS Filter */}
        <select
          value={ctasFilter || ""}
          onChange={(e) => {
            setCtasFilter(e.target.value ? Number(e.target.value) : undefined)
            setPage(1)
          }}
          className="bg-surface border border-border-default rounded-md py-2 px-3 text-[13px] text-text-primary focus:outline-none focus:border-primary-500"
        >
          <option value="">All CTAS</option>
          <option value="1">L1 — Resuscitation</option>
          <option value="2">L2 — Emergent</option>
          <option value="3">L3 — Urgent</option>
          <option value="4">L4 — Less Urgent</option>
          <option value="5">L5 — Non-Urgent</option>
        </select>

        {/* Escalation Filter */}
        <select
          value={escalatedFilter === undefined ? "" : String(escalatedFilter)}
          onChange={(e) => {
            setEscalatedFilter(e.target.value === "" ? undefined : e.target.value === "true")
            setPage(1)
          }}
          className="bg-surface border border-border-default rounded-md py-2 px-3 text-[13px] text-text-primary focus:outline-none focus:border-primary-500"
        >
          <option value="">All Escalation</option>
          <option value="true">Escalated Only</option>
          <option value="false">Non-Escalated</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
          {error}
        </div>
      )}

      {/* Sessions Table */}
      {loading ? (
        <EcgLoader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={List}
          title="No sessions found"
          description="No triage calls match your filters. Try adjusting the criteria."
        />
      ) : (
        <div className="panel overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[1fr_80px_1fr_80px_100px_40px] gap-4 px-5 py-3 border-b border-border-subtle text-[11px] uppercase tracking-wider text-text-muted font-semibold">
            <span>Time</span>
            <span>CTAS</span>
            <span>Routing Decision</span>
            <span>Duration</span>
            <span>Escalated</span>
            <span />
          </div>

          {/* Table Rows */}
          {filtered.map((s) => {
            const time = new Date(s.started_at)
            const dateStr = time.toLocaleDateString("en-CA", {
              weekday: "short", day: "numeric", month: "short",
            })
            const timeStr = time.toLocaleTimeString("en-CA", {
              hour: "2-digit", minute: "2-digit",
            })
            const durMin = s.duration_sec ? Math.floor(s.duration_sec / 60) : 0
            const durSec = s.duration_sec ? s.duration_sec % 60 : 0

            return (
              <Link
                key={s.id}
                to={`/dashboard/sessions/${s.call_sid}`}
                className={cn(
                  "grid grid-cols-1 md:grid-cols-[1fr_80px_1fr_80px_100px_40px] gap-2 md:gap-4 px-5 py-3.5 border-b border-border-subtle hover:bg-card-hover transition-colors group",
                  s.escalated && "row-escalated",
                )}
              >
                {/* Time */}
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-mono text-text-muted">{dateStr}</span>
                  <span className="text-[13px] font-mono text-text-secondary">{timeStr}</span>
                </div>

                {/* CTAS */}
                <div className="flex items-center">
                  {s.ctas_level ? (
                    <CTASBadge level={`L${s.ctas_level}` as CTASLevel} size="sm" />
                  ) : (
                    <span className="text-[12px] text-text-muted">—</span>
                  )}
                </div>

                {/* Routing */}
                <div className="flex items-center">
                  {s.routing_action ? (
                    <span className={cn(
                      "text-[12px] font-medium px-2 py-0.5 rounded-md truncate",
                      s.routing_action === "incomplete"
                        ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                        : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    )}>
                      {s.routing_action === "incomplete"
                        ? "Incomplete"
                        : s.routing_action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  ) : (
                    <span className="text-[12px] text-text-muted italic">No data</span>
                  )}
                </div>

                {/* Duration */}
                <div className="flex items-center">
                  <span className="mono-data">
                    {s.duration_sec ? `${durMin}:${durSec.toString().padStart(2, "0")}` : "—"}
                  </span>
                </div>

                {/* Escalated */}
                <div className="flex items-center">
                  {s.escalated ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#FF6B001A] border border-[#FF6B0040] text-[#FF6B00]">
                      <AlertTriangle className="w-3 h-3" />
                      Escalated
                    </span>
                  ) : (
                    <span className="text-[12px] text-text-muted">—</span>
                  )}
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-end">
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary-500 transition-colors" />
                </div>
              </Link>
            )
          })}

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border-subtle">
            <span className="text-[12px] text-text-muted">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total} sessions
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 text-[12px] text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed border border-border-default rounded-md px-3 py-1.5 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </button>
              <span className="text-[12px] text-text-muted font-mono">{page} / {totalPages || 1}</span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 text-[12px] text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed border border-border-default rounded-md px-3 py-1.5 transition-colors"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
