import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { api, type SessionDetail as SessionDetailType } from "../lib/api"
import { CTASBadge, type CTASLevel } from "../components/ui/CTASBadge"
import { ArrowLeft, Clock, Phone, AlertTriangle } from "lucide-react"

export function SessionDetail() {
  const { id } = useParams<{ id: string }>()
  const [detail, setDetail] = useState<SessionDetailType | null>(null)
  const [loadedId, setLoadedId] = useState<string | null>(null)
  const [error, setError] = useState<{ id: string; message: string } | null>(null)

  useEffect(() => {
    if (!id) return
    api.sessionDetail(id)
      .then((response) => {
        setDetail(response)
        setError(null)
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Failed to load session"
        setError({ id, message })
      })
      .finally(() => setLoadedId(id))
  }, [id])

  if (!id) {
    return (
      <div className="p-4 md:p-8 max-w-[900px] mx-auto animate-fade-in">
        <div className="panel p-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">Session not found</span>
        </div>
      </div>
    )
  }

  const loading = loadedId !== id

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-[900px] mx-auto animate-fade-in">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-800 rounded w-48" />
          <div className="h-40 bg-neutral-800 rounded-xl" />
          <div className="h-60 bg-neutral-800 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error?.id === id || !detail) {
    return (
      <div className="p-4 md:p-8 max-w-[900px] mx-auto animate-fade-in">
        <div className="panel p-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error?.message || "Session not found"}</span>
        </div>
      </div>
    )
  }

  const s = detail.session

  return (
    <div className="p-4 md:p-8 max-w-[900px] mx-auto animate-fade-in">
      {/* Back link */}
      <Link to="/dashboard/sessions" className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-300 transition-colors mb-5">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Sessions
      </Link>

      {/* Header card */}
      <section className="panel p-5 md:p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-primary-400 mb-1">Session Detail</p>
            <h1 className="text-2xl font-bold text-neutral-50 font-mono">{s.call_sid}</h1>
          </div>
          {s.ctas_level && <CTASBadge level={`L${s.ctas_level}` as CTASLevel} />}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <InfoCell icon={<Phone className="w-3.5 h-3.5" />} label="Routing" value={s.routing_action || "Pending"} />
          <InfoCell icon={<Clock className="w-3.5 h-3.5" />} label="Duration" value={s.duration_sec ? `${(s.duration_sec / 60).toFixed(1)} min` : "—"} />
          <InfoCell label="Questions" value={`${s.questions_completed} / 5`} />
          <InfoCell label="Escalated" value={s.escalated ? "Yes" : "No"} valueClass={s.escalated ? "text-red-400" : "text-green-400"} />
        </div>
      </section>

      {/* Events timeline */}
      <section className="panel p-5 md:p-6">
        <h2 className="text-lg font-semibold text-neutral-100 mb-4">Events Timeline</h2>
        {detail.events.length === 0 ? (
          <p className="text-[13px] text-neutral-500">No events recorded for this session.</p>
        ) : (
          <div className="space-y-3">
            {detail.events.map((e, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-[13px] font-medium text-neutral-200">{e.event_type}</span>
                    <span className="text-[11px] text-neutral-500 shrink-0">
                      {e.created_at ? new Date(e.created_at).toLocaleTimeString("en-CA") : ""}
                    </span>
                  </div>
                  {Object.keys(e.metadata).length > 0 && (
                    <pre className="text-[11px] text-neutral-500 mt-1 overflow-x-auto">
                      {JSON.stringify(e.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function InfoCell({ icon, label, value, valueClass }: { icon?: React.ReactNode; label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] text-neutral-500 mb-1">
        {icon}
        {label}
      </div>
      <span className={`text-[15px] font-medium ${valueClass || "text-neutral-200"}`}>{value}</span>
    </div>
  )
}
