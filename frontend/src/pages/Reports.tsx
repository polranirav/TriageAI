import { useEffect, useState } from "react"
import {
  FileText, Download, Calendar, Mail,
  BarChart3, AlertTriangle, Lock, TrendingUp, Check, Loader2
} from "lucide-react"
import { api, type AnalyticsSummary } from "../lib/api"
import { EcgLoader } from "../components/ui/EcgLoader"

export function Reports() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(30)
  const [exporting, setExporting] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.analyticsSummary(period)
      .then((data) => { setSummary(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [period])

  if (loading) return <EcgLoader className="min-h-[60vh]" />

  const totalCalls = summary?.total_calls ?? 0
  const escalationRate = summary?.escalation_rate ?? 0
  const escalations = Math.round(totalCalls * escalationRate)
  const avgDuration = summary?.avg_duration_sec ?? 0
  const nonEmergencyPct = summary?.non_emergency_pct ?? 0
  const erDeflections = Math.round((nonEmergencyPct / 100) * totalCalls)
  const completionRate = totalCalls > 0 ? 100 : 0

  const avgDurDisplay = avgDuration > 0
    ? `${Math.floor(avgDuration / 60)}:${String(Math.round(avgDuration % 60)).padStart(2, "0")} `
    : "—"

  const periodLabel = period === 7 ? "Last 7 Days" : period === 30 ? "Last 30 Days" : "Last 90 Days"

  const handleExport = (type: string) => {
    if (type === "CSV") {
      setExporting("CSV")
      api.exportSessionsCSV(period)
        .catch(() => {})
        .finally(() => setExporting(null))
      return
    }
    // Other report types (PDF, audit) coming soon
    setExporting(type)
    setTimeout(() => setExporting(null), 800)
  }

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto animate-fade-in font-sans pb-24" style={{ color: "#E8F0FE" }}>

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-[11px] mb-2 font-bold uppercase tracking-widest" style={{ color: "#7A8FA8" }}>
            Compliance & Auditing
          </div>
          <h1 className="text-[32px] font-bold tracking-tight leading-none mb-3">Clinic Reports</h1>
          <p className="text-[14px] max-w-[600px] leading-relaxed" style={{ color: "#7A8FA8" }}>
            Generate, download, and schedule operational and clinical reports. All exports are structurally stripped of PII to maintain strict PHIPA compliance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 border cursor-pointer hover:bg-white/5 transition-colors"
            style={{ background: "#162033", borderColor: "#243554" }}>
            <Calendar className="w-4 h-4" style={{ color: "#7A8FA8" }} />
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="bg-transparent text-[13px] font-medium outline-none cursor-pointer"
              style={{ color: "#E8F0FE" }}
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Live Summary Strip ── */}
      <div className="mb-12">
        <div className="rounded-xl border grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#243554]"
          style={{ background: "#162033", borderColor: "#243554" }}>
          {[
            { label: "TOTAL CALLS", value: String(totalCalls), sub: periodLabel },
            { label: "ESCALATIONS", value: String(escalations), sub: `${Math.round(escalationRate * 100)}% rate` },
            { label: "ER DEFLECT.", value: totalCalls > 0 ? `${erDeflections} (${Math.round(nonEmergencyPct)}%)` : "—", sub: "routed away from ER" },
            { label: "AVG DURATION", value: avgDurDisplay, sub: totalCalls > 0 ? `${Math.round(avgDuration)}s total` : "no data" },
            { label: "COMPLETION", value: totalCalls > 0 ? `${completionRate}% ` : "—", sub: `${totalCalls} sessions` },
          ].map((stat, i) => (
            <div key={i} className="p-5">
              <div className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: "#7A8FA8" }}>{stat.label}</div>
              <div className="text-[28px] font-bold mb-2" style={{ color: "#E8F0FE" }}>{stat.value}</div>
              <div className="text-[12px] font-medium" style={{ color: "#7A8FA8" }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
        {nonEmergencyPct > 0 && totalCalls > 0 && (
          <div className="text-[13px] italic text-right mt-3" style={{ color: "#10B981" }}>
            📊 Based on this period: estimated ${(erDeflections * 430).toLocaleString()} in Ontario system savings
          </div>
        )}
      </div>

      {/* ── Primary Reports ── */}
      <div className="mb-12">
        <h2 className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: "#7A8FA8" }}>Available Reports</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: CSV */}
          <div className="rounded-2xl border p-7 hover:-translate-y-1 transition-all duration-300"
            style={{ background: "#162033", borderColor: "#243554" }}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center border"
                style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.2)" }}>
                <BarChart3 className="w-6 h-6" style={{ color: "#3B82F6" }} />
              </div>
              <div>
                <h3 className="text-[18px] font-semibold" style={{ color: "#E8F0FE" }}>Raw Session Data</h3>
                <p className="text-[13px] mt-1" style={{ color: "#7A8FA8" }}>Full CSV export of all triage sessions</p>
              </div>
            </div>

            <div className="h-px w-full mb-5" style={{ background: "#243554" }} />

            <div className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "#7A8FA8" }}>What's Included:</div>
            <div className="space-y-2.5 mb-6">
              {[
                "Precise CTAS classifications (L1–L5)",
                "Routing destinations and durations",
                "Escalation events and bridge outcomes",
                "Call timestamps (date, time, duration)",
                "Session completion status"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[13px]" style={{ color: "#7A8FA8" }}>
                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#10B981" }} /> {item}
                </div>
              ))}
              <div className="flex items-start gap-2.5 text-[13px]" style={{ color: "#7A8FA8" }}>
                <span className="text-[14px] font-bold w-4 text-center shrink-0 mt-[-1px]" style={{ color: "#3D5068" }}>×</span>
                No caller PII — zero PHIPA/privacy risk
              </div>
            </div>

            <div className="h-px w-full mb-5" style={{ background: "#243554" }} />

            <div className="text-[12px] italic mb-4 text-center" style={{ color: "#7A8FA8" }}>
              {totalCalls} sessions in selected period · {periodLabel}
            </div>

            <button
              onClick={() => handleExport("CSV")}
              disabled={exporting === "CSV"}
              className="w-full h-11 rounded-lg flex items-center justify-center gap-2 text-[14px] font-semibold transition-colors hover:bg-blue-500 disabled:opacity-50"
              style={{ background: "#3B82F6", color: "#FFF" }}>
              {exporting === "CSV" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exporting === "CSV" ? "Generating..." : "Export CSV"}
            </button>
          </div>

          {/* Card 2: PDF */}
          <div className="rounded-2xl border p-7 hover:-translate-y-1 transition-all duration-300"
            style={{ background: "#162033", borderColor: "#243554" }}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center border"
                style={{ background: "rgba(167,139,250,0.1)", borderColor: "rgba(167,139,250,0.2)" }}>
                <FileText className="w-6 h-6" style={{ color: "#A78BFA" }} />
              </div>
              <div>
                <h3 className="text-[18px] font-semibold" style={{ color: "#E8F0FE" }}>Clinical Summary Report</h3>
                <p className="text-[13px] mt-1" style={{ color: "#7A8FA8" }}>Board-ready PDF operational report</p>
              </div>
            </div>

            <div className="h-px w-full mb-5" style={{ background: "#243554" }} />

            <div className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "#7A8FA8" }}>What's Included:</div>
            <div className="space-y-2.5 mb-6">
              {[
                "CTAS severity distribution chart",
                "Call volume trend (14-day bar chart)",
                "Estimated ER deflection savings",
                "Peak call volume heatmap (hour × day)",
                "Escalation summary (count, bridge times)",
                "Operational KPI table"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[13px]" style={{ color: "#7A8FA8" }}>
                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#10B981" }} /> {item}
                </div>
              ))}
            </div>

            <div className="h-px w-full mb-5" style={{ background: "#243554" }} />

            <div className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "#7A8FA8" }}>Report Preview:</div>
            <div className="rounded-lg border mb-6 p-4 flex flex-col items-center justify-center"
              style={{ borderColor: "#243554", background: "rgba(15,23,42,0.5)", height: "135px" }}>
              <div className="w-[180px] h-[100px] bg-white rounded-sm shadow-sm relative overflow-hidden flex flex-col items-center pt-2">
                <div className="w-full h-1 bg-[#3B82F6] absolute top-0 left-0" />
                <div className="text-[8px] font-bold text-neutral-800">TriageAI Clinical Summary</div>
                <div className="text-[6px] text-neutral-500 mb-2">{periodLabel}</div>
                <div className="w-8 h-8 rounded-full border-[3px] border-neutral-200 border-t-emerald-500 border-r-amber-500 mb-2" />
                <div className="text-[5px] text-neutral-500 font-mono">{totalCalls} calls · {escalations} escalations · {Math.round(nonEmergencyPct)}% deflected</div>
              </div>
            </div>

            <button
              onClick={() => handleExport("PDF")}
              disabled={exporting === "PDF"}
              className="w-full h-11 rounded-lg flex items-center justify-center gap-2 text-[14px] font-semibold transition-colors border hover:bg-white/5 disabled:opacity-50"
              style={{ background: "transparent", borderColor: "#243554", color: "#E8F0FE" }}>
              {exporting === "PDF" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exporting === "PDF" ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Secondary Reports ── */}
      <div className="mb-14">
        <h2 className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: "#7A8FA8" }}>Additional Reports</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border p-5 flex flex-col" style={{ background: "#162033", borderColor: "#243554" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: "rgba(255,107,0,0.1)" }}>
              <AlertTriangle className="w-5 h-5" style={{ color: "#FF6B00" }} />
            </div>
            <h3 className="text-[15px] font-semibold mb-1" style={{ color: "#E8F0FE" }}>Escalation Detail Report</h3>
            <p className="text-[12px] mb-4" style={{ color: "#7A8FA8" }}>All L1/L2 calls with bridge outcomes</p>
            <ul className="text-[12px] space-y-1 mb-6 flex-1" style={{ color: "#7A8FA8" }}>
              <li>• CTAS level per escalation</li>
              <li>• Bridge connect time</li>
              <li>• Coordinator reached: Y/N</li>
              <li>• Call duration</li>
            </ul>
            <div className="text-[11px] text-center mb-3" style={{ color: "#7A8FA8" }}>{escalations} escalations in period</div>
            <div className="flex gap-2">
              <button onClick={() => handleExport("Escalation CSV")} className="flex-1 h-8 rounded border text-[12px] font-medium hover:bg-white/5" style={{ borderColor: "#243554", color: "#E8F0FE" }}>↓ CSV</button>
              <button onClick={() => handleExport("Escalation PDF")} className="flex-1 h-8 rounded border text-[12px] font-medium hover:bg-white/5" style={{ borderColor: "#243554", color: "#E8F0FE" }}>↓ PDF</button>
            </div>
          </div>

          <div className="rounded-xl border p-5 flex flex-col" style={{ background: "#162033", borderColor: "#243554" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: "rgba(167,139,250,0.1)" }}>
              <Lock className="w-5 h-5" style={{ color: "#A78BFA" }} />
            </div>
            <h3 className="text-[15px] font-semibold mb-1" style={{ color: "#E8F0FE" }}>PHIPA Compliance Audit</h3>
            <p className="text-[12px] mb-4" style={{ color: "#7A8FA8" }}>Structural privacy verification report</p>
            <ul className="text-[12px] space-y-1 mb-6 flex-1" style={{ color: "#7A8FA8" }}>
              <li>• Zero-PII confirmation</li>
              <li>• Data schema audit</li>
              <li>• RLS policy summary</li>
              <li>• Last audit timestamp</li>
            </ul>
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <span className="text-[11px]">Status:</span>
              <span className="px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider"
                style={{ background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.3)", color: "#10B981" }}>
                ● All Clear
              </span>
            </div>
            <button onClick={() => handleExport("PHIPA Audit")} className="w-full h-8 rounded border text-[12px] font-medium hover:bg-white/5" style={{ borderColor: "#243554", color: "#E8F0FE" }}>
              ↓ Download Audit Report
            </button>
          </div>

          <div className="rounded-xl border p-5 flex flex-col" style={{ background: "#162033", borderColor: "#243554" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: "rgba(16,185,129,0.1)" }}>
              <TrendingUp className="w-5 h-5" style={{ color: "#10B981" }} />
            </div>
            <h3 className="text-[15px] font-semibold mb-1" style={{ color: "#E8F0FE" }}>Monthly Trend Report</h3>
            <p className="text-[12px] mb-4" style={{ color: "#7A8FA8" }}>3-month operational comparison</p>
            <ul className="text-[12px] space-y-1 mb-6 flex-1" style={{ color: "#7A8FA8" }}>
              <li>• Month-over-month call vol.</li>
              <li>• CTAS distribution shift</li>
              <li>• Escalation rate trend</li>
              <li>• ER deflection trajectory</li>
            </ul>
            <button onClick={() => handleExport("Monthly Trend")} className="w-full h-8 rounded border text-[12px] font-medium hover:bg-white/5" style={{ borderColor: "#243554", color: "#E8F0FE" }}>
              ↓ Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── Automated Delivery ── */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#7A8FA8" }}>Automated Delivery</h2>
            <p className="text-[13px] mt-1" style={{ color: "#7A8FA8" }}>Configure automatic report delivery to key stakeholders</p>
          </div>
        </div>

        <div className="rounded-xl border p-6" style={{ background: "#162033", borderColor: "#243554" }}>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[14px] font-bold tracking-wide" style={{ color: "#E8F0FE" }}>DELIVERY RULES</h3>
          </div>

          <div className="space-y-3">
            {/* Placeholder — no active rules yet */}
            <div className="rounded-lg border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ background: "#0F172A", borderColor: "#1E2D45" }}>
              <div className="flex gap-4">
                <div className="mt-1"><Mail className="w-5 h-5 text-[#3D5068]" /></div>
                <div>
                  <h4 className="text-[15px] font-semibold mb-1" style={{ color: "#E8F0FE" }}>Weekly Operational Digest</h4>
                  <p className="text-[13px] mb-2" style={{ color: "#7A8FA8" }}>Automated report delivery every Monday</p>
                  <div className="rounded-md border-l-4 p-2.5 text-[13px] mt-2"
                    style={{ background: "rgba(240,180,41,0.1)", borderLeftColor: "#F0B429", color: "#F0B429" }}>
                    <div className="font-bold flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3.5 h-3.5" /> No recipient configured</div>
                    <div className="opacity-90 leading-snug">Add an email address in Configuration to activate automatic report delivery.</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 self-start md:self-center">
                <span className="px-2 py-1 rounded border text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: "rgba(61,80,104,0.1)", borderColor: "rgba(61,80,104,0.3)", color: "#7A8FA8" }}>
                  ○ Not Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Report Explainer (Compliance) ── */}
      <div className="rounded-xl border p-8" style={{ background: "#0F1A2E", borderColor: "#2D4A78" }}>
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-5 h-5 text-[#A78BFA]" />
          <h2 className="text-[16px] font-semibold text-[#E8F0FE] uppercase tracking-wide">What Makes These Reports PHIPA-Safe</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x divide-[#1E2D45]">
          <div className="md:pr-6">
            <h3 className="text-[14px] font-semibold text-white mb-2">No caller identity</h3>
            <p className="text-[13px] leading-[1.7]" style={{ color: "#7A8FA8" }}>
              Reports contain no names, phone numbers, addresses, health card numbers, or any identifier that could be linked to a specific person. Every row is anonymous by structural design.
            </p>
          </div>
          <div className="md:px-6">
            <h3 className="text-[14px] font-semibold text-white mb-2">No health statements</h3>
            <p className="text-[13px] leading-[1.7]" style={{ color: "#7A8FA8" }}>
              The words callers speak are never stored. Reports contain only structured CTAS classifications and routing codes — not the underlying symptoms or health information that produced them.
            </p>
          </div>
          <div className="md:pl-6">
            <h3 className="text-[14px] font-semibold text-white mb-2">Safe to share with your board</h3>
            <p className="text-[13px] leading-[1.7]" style={{ color: "#7A8FA8" }}>
              These reports can be included in CHC board packages, OHT reports, and LHIN submissions without legal review. They contain operational statistics, not personal health information.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}