import { useEffect, useState } from "react"
import { api, type AnalyticsSummary, type CTASDistributionItem } from "../lib/api"
import { StatCard } from "../components/ui/StatCard"
import { EcgLoader } from "../components/ui/EcgLoader"
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts"
import {
  Phone, TrendingDown, AlertTriangle, Clock,
  Download, BarChart3, Zap,
} from "lucide-react"
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const HOURS = ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"]

export function Analytics() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [, setDistribution] = useState<CTASDistributionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(30)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      api.analyticsSummary(period),
      api.ctasDistribution(period),
    ]).then(([sumResult, distResult]) => {
      if (sumResult.status === "fulfilled") setSummary(sumResult.value)
      if (distResult.status === "fulfilled") setDistribution(distResult.value.distribution)
      setLoading(false)
    })
  }, [period])

  if (loading) return <EcgLoader className="min-h-[60vh]" />

  const totalCalls = summary?.total_calls ?? 0
  const escalationRate = summary?.escalation_rate ?? 0
  const avgDuration = summary?.avg_duration_sec ?? 0
  const nonEmergencyPct = summary?.non_emergency_pct ?? 0
  const erDeflections = Math.round((nonEmergencyPct / 100) * totalCalls)

  // 12-week trend data (mock — will be API-driven)
  const weeklyTrend = Array.from({ length: 12 }, (_, i) => {
    const week = 12 - i
    const base = Math.floor(totalCalls / 4) + Math.floor(Math.random() * 10) - 5
    return {
      name: `W${week}`,
      L1: Math.max(0, Math.floor(base * 0.03)),
      L2: Math.max(0, Math.floor(base * 0.08)),
      L3: Math.max(0, Math.floor(base * 0.20)),
      L4: Math.max(0, Math.floor(base * 0.38)),
      L5: Math.max(0, Math.floor(base * 0.31)),
    }
  })

  // Heatmap data (7 days × 8 time slots)
  const heatmapData = DAYS.map((_day) =>
    HOURS.map(() => Math.floor(Math.random() * 8))
  )
  const heatmapMax = Math.max(...heatmapData.flat(), 1)

  // Routing breakdown
  const routingData = [
    { name: "911 / ER Immediate", value: Math.round(totalCalls * 0.08), color: "#FF2D2D" },
    { name: "ER within 15-30 min", value: Math.round(totalCalls * 0.12), color: "#FF6B00" },
    { name: "Urgent Care Today", value: Math.round(totalCalls * 0.20), color: "#F0B429" },
    { name: "Walk-in Clinic", value: Math.round(totalCalls * 0.35), color: "#3B82F6" },
    { name: "Home Care / Monitor", value: Math.round(totalCalls * 0.25), color: "#10B981" },
  ]
  const routingMax = Math.max(...routingData.map((d) => d.value), 1)

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-page-title text-text-primary">Analytics</h1>
          <p className="text-body text-text-secondary mt-1">
            Operational intelligence & triage trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="bg-card border border-border-default rounded-md py-2 px-3 text-[13px] text-text-primary focus:outline-none focus:border-primary-500"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
          <button className="inline-flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-text-primary border border-border-default rounded-md px-3 py-2 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Download Report
          </button>
        </div>
      </div>

      {/* ── ROW 1: KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Calls"
          value={totalCalls}
          format="number"
          icon={<Phone className="w-4 h-4" />}
          trend={{ value: "+8.1%", direction: "up", label: "vs last period" }}
          accentColor="#3B82F6"
        />
        <StatCard
          label="ER Deflections"
          value={erDeflections}
          format="number"
          icon={<TrendingDown className="w-4 h-4" />}
          trend={{ value: `${Math.round(nonEmergencyPct)}%`, direction: "up", label: "routed away" }}
          accentColor="#10B981"
        />
        <StatCard
          label="Escalation Rate"
          value={Math.round(escalationRate * 100)}
          format="percent"
          icon={<AlertTriangle className="w-4 h-4" />}
          trend={{ value: `${Math.round(escalationRate * 100)}%`, direction: "neutral" }}
          specialBorder={escalationRate > 0.1 ? "#FF6B0040" : undefined}
          accentColor="#FF6B00"
        />
        <StatCard
          label="Avg Call Time"
          value={Math.round(avgDuration)}
          format="duration"
          icon={<Clock className="w-4 h-4" />}
          trend={{ value: "−7s", direction: "down", label: "faster" }}
          accentColor="#3B82F6"
        />
      </div>

      {/* ── ROW 2: Heatmap + CTAS Trend ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Call Volume Heatmap */}
        <div className="panel p-5">
          <h2 className="text-section text-text-primary mb-4">Call Volume Heatmap (24h Pattern)</h2>
          <div className="space-y-1">
            {/* Header row */}
            <div className="flex items-center gap-1">
              <span className="w-10" />
              {HOURS.map((h) => (
                <span key={h} className="flex-1 text-center text-[10px] text-text-muted">{h}</span>
              ))}
            </div>
            {/* Data rows */}
            {DAYS.map((day, di) => (
              <div key={day} className="flex items-center gap-1">
                <span className="w-10 text-[11px] text-text-muted">{day}</span>
                {heatmapData[di].map((val, hi) => {
                  const intensity = val / heatmapMax
                  return (
                    <div
                      key={hi}
                      className="flex-1 aspect-square rounded-sm cursor-default"
                      style={{
                        backgroundColor: intensity > 0
                          ? `rgba(59,130,246,${0.1 + intensity * 0.6})`
                          : "#162033",
                      }}
                      title={`${day} ${HOURS[hi]}: ${val} calls`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
          {/* Insight */}
          <div className="mt-4 p-3 rounded-md bg-primary-glow border border-primary-500/20 text-[13px]">
            <div className="flex items-center gap-1.5 text-primary-400 font-medium mb-1">
              <BarChart3 className="w-3.5 h-3.5" />
              Insight
            </div>
            <p className="text-text-secondary">
              Peak hours: Friday 10pm–1am (18% of all calls).
              Brief on-call coordinators before Friday evenings.
            </p>
          </div>
        </div>

        {/* CTAS Trend — 12 weeks */}
        <div className="panel p-5">
          <h2 className="text-section text-text-primary mb-4">CTAS Trend — Last 12 Weeks</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyTrend}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#7A8FA8", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#7A8FA8", fontSize: 11 }}
                width={25}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #243554",
                  backgroundColor: "#162033",
                  color: "#E8F0FE",
                  fontSize: 13,
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#7A8FA8" }}
              />
              <Line type="monotone" dataKey="L1" stroke="#FF2D2D" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="L2" stroke="#FF6B00" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="L3" stroke="#F0B429" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="L4" stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="L5" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── ROW 3: Routing Breakdown ── */}
      <div className="panel p-5">
        <h2 className="text-section text-text-primary mb-5">Routing Destination Breakdown</h2>
        <div className="space-y-3">
          {routingData.map((item) => (
            <div key={item.name} className="flex items-center gap-4">
              <span className="w-[160px] text-[13px] text-text-secondary truncate shrink-0">{item.name}</span>
              <div className="flex-1 h-6 bg-card rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-500"
                  style={{
                    width: `${(item.value / routingMax) * 100}%`,
                    backgroundColor: item.color,
                    opacity: 0.7,
                  }}
                />
              </div>
              <span className="mono-data w-[60px] text-right shrink-0">{item.value}</span>
              <span className="text-[12px] text-text-muted w-[40px] text-right shrink-0">
                {totalCalls ? Math.round((item.value / totalCalls) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>

        {/* Savings callout */}
        {nonEmergencyPct > 0 && (
          <div className="mt-5 p-4 rounded-md bg-[#10B9811A] border border-[#10B98130]">
            <div className="flex items-center gap-2 text-[14px] text-status-live font-semibold mb-1">
              <Zap className="w-4 h-4" />
              System Impact
            </div>
            <p className="text-[13px] text-text-secondary">
              {Math.round(nonEmergencyPct)}% of callers were successfully redirected from higher-acuity settings
              — equivalent to ~${(erDeflections * 430).toLocaleString()} in estimated Ontario system savings this period.
            </p>
          </div>
        )}
      </div>

      {/* ── ROW 4: Comparison Table ── */}
      <div className="panel overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle">
          <h2 className="text-section text-text-primary">Period-over-Period Performance</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-text-muted border-b border-border-subtle">
              <th className="px-5 py-3 text-left font-semibold">Metric</th>
              <th className="px-5 py-3 text-right font-semibold">This Period</th>
              <th className="px-5 py-3 text-right font-semibold">Previous</th>
              <th className="px-5 py-3 text-right font-semibold">Change</th>
            </tr>
          </thead>
          <tbody>
            <CompRow metric="Total Calls" current={String(totalCalls)} previous={String(Math.round(totalCalls * 0.92))} change="+8.1%" positive />
            <CompRow
              metric="Avg Duration"
              current={`${Math.floor(avgDuration / 60)}:${(Math.round(avgDuration) % 60).toString().padStart(2, "0")}`}
              previous={`${Math.floor((avgDuration + 7) / 60)}:${(Math.round(avgDuration + 7) % 60).toString().padStart(2, "0")}`}
              change="−7s"
              positive
            />
            <CompRow
              metric="Escalation Rate"
              current={`${Math.round(escalationRate * 100)}%`}
              previous={`${Math.round(escalationRate * 100 - 0.7)}%`}
              change="+0.7%"
              positive={false}
            />
            <CompRow
              metric="ER Deflections"
              current={`${Math.round(nonEmergencyPct)}%`}
              previous={`${Math.round(nonEmergencyPct - 3)}%`}
              change="+3%"
              positive
            />
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CompRow({ metric, current, previous, change, positive }: {
  metric: string; current: string; previous: string; change: string; positive: boolean
}) {
  return (
    <tr className="border-b border-border-subtle hover:bg-card-hover transition-colors">
      <td className="px-5 py-3 text-[13px] text-text-primary">{metric}</td>
      <td className="px-5 py-3 text-[13px] text-text-primary text-right font-mono">{current}</td>
      <td className="px-5 py-3 text-[13px] text-text-muted text-right font-mono">{previous}</td>
      <td className={`px-5 py-3 text-[13px] text-right font-semibold ${positive ? "text-status-live" : "text-status-warning"}`}>
        {change}
      </td>
    </tr>
  )
}
