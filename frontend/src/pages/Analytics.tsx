import { useEffect, useState } from "react"
import {
  api,
  type AnalyticsSummary,
  type WeeklyTrendItem,
  type RoutingBreakdownItem,
} from "../lib/api"
import { StatCard } from "../components/ui/StatCard"
import { EcgLoader } from "../components/ui/EcgLoader"
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts"
import { Phone, TrendingDown, AlertTriangle, Clock, Download, BarChart3, Zap } from "lucide-react"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const HOURS = ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"]

const ROUTING_META: Record<string, { label: string; color: string }> = {
  escalate_911: { label: "911 / ER Immediate",  color: "#FF2D2D" },
  call_911:     { label: "911 / ER Immediate",  color: "#FF2D2D" },
  er_15min:     { label: "ER within 15 min",    color: "#FF6B00" },
  er_30min:     { label: "ER within 30 min",    color: "#F0B429" },
  urgent_care:  { label: "Urgent Care Today",   color: "#F0B429" },
  walk_in:      { label: "Walk-in Clinic",      color: "#3B82F6" },
  home_care:    { label: "Home Care / Monitor", color: "#10B981" },
}

export function Analytics() {
  const [summary, setSummary]         = useState<AnalyticsSummary | null>(null)
  const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrendItem[]>([])
  const [routing, setRouting]         = useState<RoutingBreakdownItem[]>([])
  const [heatmap, setHeatmap]         = useState<number[][]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [period, setPeriod]           = useState(30)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const weeks = Math.max(1, Math.ceil(period / 7))
    Promise.all([
      api.analyticsSummary(period),
      api.analyticsWeeklyTrend(weeks),
      api.analyticsRoutingBreakdown(period),
      api.analyticsHeatmap(period),
    ])
      .then(([sum, trend, rt, hm]) => {
        setSummary(sum)
        setWeeklyTrend(trend.trend)
        setRouting(rt.routing)
        setHeatmap(hm.heatmap)
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load analytics")
      )
      .finally(() => setLoading(false))
  }, [period])

  if (loading) return <EcgLoader className="min-h-[60vh]" />

  const totalCalls      = summary?.total_calls ?? 0
  const escalationRate  = summary?.escalation_rate ?? 0
  const avgDuration     = summary?.avg_duration_sec ?? 0
  const nonEmergencyPct = summary?.non_emergency_pct ?? 0
  const erDeflections   = Math.round(nonEmergencyPct * totalCalls)
  const weeks           = Math.max(1, Math.ceil(period / 7))

  const heatmapMax = Math.max(...(heatmap.length ? heatmap.flat() : [1]), 1)
  const routingMax = Math.max(...routing.map((r) => r.count), 1)

  // Label each week entry for the chart
  const chartData = weeklyTrend.length > 0
    ? weeklyTrend.map((item, i) => ({ ...item, name: `W${i + 1}` }))
    : Array.from({ length: weeks }, (_, i) => ({
        name: `W${i + 1}`, total: 0, l1: 0, l2: 0, l3: 0, l4: 0, l5: 0,
      }))

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-page-title text-text-primary">Analytics</h1>
          <p className="text-body text-text-secondary mt-1">Operational intelligence &amp; triage trends</p>
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
          <button
            onClick={() => api.exportSessionsCSV(period).catch(() => {})}
            className="inline-flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-text-primary border border-border-default rounded-md px-3 py-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Calls" value={totalCalls} format="number" icon={<Phone className="w-4 h-4" />}
          trend={totalCalls > 0 ? { value: String(totalCalls), direction: "up", label: "this period" } : undefined}
          accentColor="#3B82F6" />
        <StatCard label="ER Deflections" value={erDeflections} format="number" icon={<TrendingDown className="w-4 h-4" />}
          trend={totalCalls > 0 ? { value: `${Math.round(nonEmergencyPct * 100)}%`, direction: "up", label: "routed away" } : undefined}
          accentColor="#10B981" />
        <StatCard label="Escalation Rate" value={Math.round(escalationRate * 100)} format="percent" icon={<AlertTriangle className="w-4 h-4" />}
          trend={totalCalls > 0 ? { value: `${Math.round(escalationRate * 100)}%`, direction: "neutral" } : undefined}
          specialBorder={escalationRate > 0.1 ? "#FF6B0040" : undefined} accentColor="#FF6B00" />
        <StatCard label="Avg Call Time" value={Math.round(avgDuration)} format="duration" icon={<Clock className="w-4 h-4" />}
          trend={totalCalls > 0 ? { value: `${Math.round(avgDuration)}s`, direction: "neutral", label: "avg" } : undefined}
          accentColor="#3B82F6" />
      </div>

      {/* Heatmap + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="panel p-5">
          <h2 className="text-section text-text-primary mb-4">Call Volume Heatmap (24h Pattern)</h2>
          {heatmap.length === 0 ? (
            <p className="text-[13px] text-text-muted py-8 text-center">
              No data yet — heatmap will populate once calls are recorded.
            </p>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <span className="w-10" />
                {HOURS.map((h) => (
                  <span key={h} className="flex-1 text-center text-[10px] text-text-muted">{h}</span>
                ))}
              </div>
              {DAYS.map((day, di) => (
                <div key={day} className="flex items-center gap-1">
                  <span className="w-10 text-[11px] text-text-muted">{day}</span>
                  {(heatmap[di] || Array(8).fill(0)).map((val, hi) => {
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
              {totalCalls > 0 && (
                <div className="mt-4 p-3 rounded-md bg-primary-glow border border-primary-500/20 text-[13px]">
                  <div className="flex items-center gap-1.5 text-primary-400 font-medium mb-1">
                    <BarChart3 className="w-3.5 h-3.5" /> Insight
                  </div>
                  <p className="text-text-secondary">{totalCalls} calls analyzed over {period} days.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="panel p-5">
          <h2 className="text-section text-text-primary mb-4">CTAS Trend — Last {weeks} Weeks</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#7A8FA8", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#7A8FA8", fontSize: 11 }} width={25} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #243554", backgroundColor: "#162033", color: "#E8F0FE", fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#7A8FA8" }} />
              <Line type="monotone" dataKey="l1" name="L1" stroke="#FF2D2D" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="l2" name="L2" stroke="#FF6B00" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="l3" name="L3" stroke="#F0B429" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="l4" name="L4" stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="l5" name="L5" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Routing Breakdown */}
      <div className="panel p-5">
        <h2 className="text-section text-text-primary mb-5">Routing Destination Breakdown</h2>
        {routing.length === 0 ? (
          <p className="text-[13px] text-text-muted py-4">
            No routing data yet — breakdown will appear once calls are classified.
          </p>
        ) : (
          <div className="space-y-3">
            {routing.map((item) => {
              const meta = ROUTING_META[item.action] || { label: item.action, color: "#3B82F6" }
              return (
                <div key={item.action} className="flex items-center gap-4">
                  <span className="w-[180px] text-[13px] text-text-secondary truncate shrink-0">{meta.label}</span>
                  <div className="flex-1 h-6 bg-card rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm transition-all duration-500"
                      style={{ width: `${(item.count / routingMax) * 100}%`, backgroundColor: meta.color, opacity: 0.7 }}
                    />
                  </div>
                  <span className="mono-data w-[60px] text-right shrink-0">{item.count}</span>
                  <span className="text-[12px] text-text-muted w-[40px] text-right shrink-0">
                    {Math.round(item.percentage * 100)}%
                  </span>
                </div>
              )
            })}
          </div>
        )}
        {nonEmergencyPct > 0 && (
          <div className="mt-5 p-4 rounded-md bg-[#10B9811A] border border-[#10B98130]">
            <div className="flex items-center gap-2 text-[14px] text-status-live font-semibold mb-1">
              <Zap className="w-4 h-4" /> System Impact
            </div>
            <p className="text-[13px] text-text-secondary">
              {Math.round(nonEmergencyPct * 100)}% of callers were redirected from higher-acuity settings —
              equivalent to ~${(erDeflections * 430).toLocaleString()} in estimated Ontario system savings.
            </p>
          </div>
        )}
      </div>

      {/* Period-over-Period */}
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
            <CompRow metric="Total Calls" current={String(totalCalls)} previous="—" change={totalCalls > 0 ? String(totalCalls) : "—"} positive />
            <CompRow
              metric="Avg Duration"
              current={`${Math.floor(avgDuration / 60)}:${(Math.round(avgDuration) % 60).toString().padStart(2, "0")}`}
              previous="—" change={totalCalls > 0 ? `${Math.round(avgDuration)}s` : "—"} positive
            />
            <CompRow
              metric="Escalation Rate" current={`${Math.round(escalationRate * 100)}%`}
              previous="—" change={totalCalls > 0 ? `${Math.round(escalationRate * 100)}%` : "—"}
              positive={escalationRate <= 0.15}
            />
            <CompRow
              metric="ER Deflections" current={`${Math.round(nonEmergencyPct * 100)}%`}
              previous="—" change={totalCalls > 0 ? `${Math.round(nonEmergencyPct * 100)}%` : "—"} positive
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
