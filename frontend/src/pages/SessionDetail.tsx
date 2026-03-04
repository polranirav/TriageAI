import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { api, type SessionDetail as SessionDetailType } from "../lib/api"
import { CTASBadge, type CTASLevel } from "../components/ui/CTASBadge"
import { EcgLoader } from "../components/ui/EcgLoader"
import { cn } from "../lib/utils"
import {
  ArrowLeft, Download, Copy, Check, ShieldCheck,
  AlertTriangle,
} from "lucide-react"

const EVENT_ICONS: Record<string, { icon: string; color: string }> = {
  session_started: { icon: "○", color: "text-text-muted" },
  consent_delivered: { icon: "○", color: "text-text-muted" },
  question_asked: { icon: "●", color: "text-primary-500" },
  answer_received: { icon: "●", color: "text-primary-500" },
  ctas_classified: { icon: "●", color: "text-status-live" },
  escalation_triggered: { icon: "🚨", color: "text-status-critical" },
  bridge_connected: { icon: "✓", color: "text-status-live" },
  session_ended: { icon: "○", color: "text-text-muted" },
  crisis_detected: { icon: "▲", color: "text-status-warning" },
}

const ROUTING_LABELS: Record<string, string> = {
  "call_911": "Call 911 immediately",
  "er_15min": "Emergency department within 15 minutes",
  "er_30min": "Emergency department within 30 minutes",
  "urgent_care": "Urgent care today",
  "walk_in": "Walk-in clinic today",
  "home_care": "Monitor at home",
}

export function SessionDetail() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<SessionDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    api
      .sessionDetail(id)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load session"))
      .finally(() => setLoading(false))
  }, [id])

  const copyCallSid = () => {
    if (!data) return
    navigator.clipboard.writeText(data.session.call_sid)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <EcgLoader className="min-h-[60vh]" />
  if (error || !data) return (
    <div className="p-8 text-center">
      <p className="text-text-secondary">{error || "Session not found."}</p>
      <Link to="/dashboard/sessions" className="text-primary-500 hover:underline mt-2 block">
        ← Back to Sessions
      </Link>
    </div>
  )

  const s = data.session
  const events = data.events
  const ctasLevel = s.ctas_level ? (`L${s.ctas_level}` as CTASLevel) : null
  const started = new Date(s.started_at)
  const durMin = s.duration_sec ? Math.floor(s.duration_sec / 60) : 0
  const durSec = s.duration_sec ? s.duration_sec % 60 : 0
  const routingLabel = s.routing_action
    ? ROUTING_LABELS[s.routing_action] || s.routing_action
    : "Pending assessment"

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto animate-fade-in space-y-6">
      {/* Back + Header */}
      <Link
        to="/dashboard/sessions"
        className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sessions
      </Link>

      {/* Call SID + Date */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-page-title text-text-primary">Session Detail</h1>
          <button
            onClick={copyCallSid}
            className="inline-flex items-center gap-1.5 text-[12px] font-mono text-text-muted hover:text-text-secondary transition-colors bg-card rounded-md px-2 py-1 border border-border-subtle"
          >
            {s.call_sid.slice(0, 16)}...
            {copied ? <Check className="w-3 h-3 text-status-live" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        <p className="text-body text-text-secondary mt-1">
          {started.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          {" · "}
          {started.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })}
          {s.duration_sec && ` · Duration: ${durMin}:${durSec.toString().padStart(2, "0")}`}
        </p>
      </div>

      {/* Status Banner (if escalated or L1/L2) */}
      {s.escalated && ctasLevel && (
        <div
          className="flex items-center gap-3 p-4 rounded-lg border"
          style={{
            backgroundColor: s.ctas_level === 1 ? "#FF2D2D1A" : "#FF6B001A",
            borderColor: s.ctas_level === 1 ? "#FF2D2D40" : "#FF6B0040",
          }}
        >
          <AlertTriangle className="w-5 h-5" style={{ color: s.ctas_level === 1 ? "#FF2D2D" : "#FF6B00" }} />
          <div>
            <p className="text-[14px] font-semibold" style={{ color: s.ctas_level === 1 ? "#FF2D2D" : "#FF6B00" }}>
              CTAS {ctasLevel} — {s.ctas_level === 1 ? "RESUSCITATION" : "EMERGENT"} · ESCALATED
            </p>
            <p className="text-[13px] text-text-secondary mt-0.5">
              Emergency bridge initiated · On-call contacted
            </p>
          </div>
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Timeline (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* CTAS Classification Card */}
          {ctasLevel && (
            <div className="panel p-5">
              <h2 className="section-label mb-3">CTAS Classification</h2>
              <div className="flex items-center gap-3 mb-3">
                <CTASBadge level={ctasLevel} size="lg" showLabel />
              </div>
              <p className="text-[14px] text-text-secondary">
                <span className="text-text-muted">Routing:</span> {routingLabel}
              </p>
            </div>
          )}

          {/* Call Timeline */}
          <div className="panel p-5">
            <h2 className="section-label mb-4">Call Timeline</h2>

            {events.length === 0 ? (
              <p className="text-[13px] text-text-muted py-4">No events recorded for this session.</p>
            ) : (
              <div className="space-y-0">
                {events.map((evt, i) => {
                  const time = new Date(evt.created_at)
                  const iconCfg = EVENT_ICONS[evt.event_type] || { icon: "○", color: "text-text-muted" }
                  const isEscalation = evt.event_type.includes("escalation") || evt.event_type.includes("crisis")
                  const label = formatEventLabel(evt.event_type, evt.metadata)

                  return (
                    <div key={i} className="flex gap-3 py-2">
                      {/* Vertical line + icon */}
                      <div className="flex flex-col items-center">
                        <span className={cn("text-[14px] leading-none", iconCfg.color)}>
                          {iconCfg.icon}
                        </span>
                        {i < events.length - 1 && (
                          <div className="w-px flex-1 bg-border-subtle mt-1" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-text-muted">
                            {time.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </span>
                          {isEscalation && (
                            <span className="text-[10px] font-bold uppercase text-status-critical bg-[#FF2D2D1A] px-1.5 py-0.5 rounded">
                              Escalation
                            </span>
                          )}
                        </div>
                        <p className={cn("text-[13px] mt-0.5", isEscalation ? "text-status-critical font-medium" : "text-text-secondary")}>
                          {label}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Session Meta (2 cols) */}
        <div className="lg:col-span-2">
          <div className="panel p-5 space-y-4 sticky top-20">
            <h2 className="section-label mb-2">Session Details</h2>

            <MetaRow label="Call SID" mono>
              <span className="truncate max-w-[180px]" title={s.call_sid}>{s.call_sid}</span>
            </MetaRow>

            <MetaRow label="Date & Time">
              {started.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
              {" · "}
              {started.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })}
            </MetaRow>

            <MetaRow label="Total Duration" mono>
              {s.duration_sec
                ? `${durMin} min ${durSec} sec`
                : "—"}
            </MetaRow>

            <MetaRow label="CTAS Level">
              {ctasLevel ? <CTASBadge level={ctasLevel} showLabel /> : "—"}
            </MetaRow>

            <MetaRow label="Routing Decision">
              {routingLabel}
            </MetaRow>

            <MetaRow label="Escalated">
              {s.escalated ? (
                <span className="text-status-escalated font-medium">✓ Yes — bridge initiated</span>
              ) : (
                <span className="text-text-muted">No</span>
              )}
            </MetaRow>

            <MetaRow label="Questions Completed">
              {s.questions_completed} of 5
            </MetaRow>

            {/* Data compliance */}
            <div className="pt-3 border-t border-border-subtle space-y-2">
              <p className="section-label">Data Stored</p>
              <div className="space-y-1.5">
                {[
                  "Zero PII — PHIPA safe",
                  "No audio recording",
                  "No transcript stored",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-[12px] text-status-live">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-border-subtle space-y-2">
              <button className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border-default px-3 py-2 text-[12px] text-text-secondary hover:text-text-primary hover:border-border-active transition-colors">
                <Download className="w-3.5 h-3.5" />
                Export This Session
              </button>
              <Link
                to="/dashboard/sessions"
                className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border-default px-3 py-2 text-[12px] text-text-secondary hover:text-text-primary hover:border-border-active transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sessions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ──

function MetaRow({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-text-muted mb-0.5">{label}</p>
      <div className={cn("text-[13px] text-text-primary", mono && "font-mono text-text-mono")}>
        {children}
      </div>
    </div>
  )
}

function formatEventLabel(type: string, meta: Record<string, unknown>): string {
  const labels: Record<string, string> = {
    session_started: "Call received — triage started",
    consent_delivered: "PIPEDA consent delivered",
    question_asked: `Q${meta.question_number || "?"}: ${meta.question || "Question asked"}`,
    answer_received: `Answer captured: "${meta.answer || "..."}"`,
    ctas_classified: `CTAS Level ${meta.ctas_level || "?"} confirmed`,
    escalation_triggered: "ESCALATION INITIATED — on-call coordinator bridge dialed",
    bridge_connected: `Bridge connected (${meta.duration_sec || "?"}s)`,
    session_ended: "Call ended",
    crisis_detected: `Crisis keyword detected: "${meta.keyword || "..."}"`,
  }
  return labels[type] || type.replace(/_/g, " ")
}
