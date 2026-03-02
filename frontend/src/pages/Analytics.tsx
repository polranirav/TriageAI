import { useCallback, useEffect, useState } from "react"
import { api, type AnalyticsSummary, type CTASDistributionItem } from "../lib/api"
import { StatCard } from "../components/ui/StatCard"
import { CTASBadge, type CTASLevel } from "../components/ui/CTASBadge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { RefreshCw, AlertTriangle } from "lucide-react"
import { cn } from "../lib/utils"

const CTAS_COLORS: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#f59e0b",
  4: "#14b8a6",
  5: "#22c55e",
}

export function Analytics() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [distribution, setDistribution] = useState<CTASDistributionItem[]>([])
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [s, d] = await Promise.all([
        api.analyticsSummary(days),
        api.ctasDistribution(days),
      ])
      setSummary(s)
      setDistribution(d.distribution)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load analytics"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const pieData = distribution.map((d) => ({
    name: `L${d.level}`,
    value: d.count,
    pct: d.percentage,
    color: CTAS_COLORS[d.level] || "#6b7280",
  }))

  const barData = distribution.map((d) => ({
    name: `L${d.level}`,
    calls: d.count,
    fill: CTAS_COLORS[d.level] || "#6b7280",
  }))

  return (
    <div className="p-4 md:p-8 max-w-[1320px] mx-auto animate-fade-in">
      {/* Header */}
      <section className="panel p-5 md:p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-primary-400 mb-1">Insights</p>
            <h1 className="text-h1">Analytics</h1>
            <p className="text-body-sm text-neutral-500 mt-1">Triage performance and CTAS distribution.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-neutral-800 border border-neutral-700 rounded-lg text-[13px] text-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-neutral-400 bg-neutral-800 border border-neutral-700 rounded-lg hover:text-neutral-200 hover:border-neutral-600 transition-all disabled:opacity-50"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-[13px] text-red-400">{error}</span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 animate-pulse">
              <div className="h-3 bg-neutral-700/50 rounded w-20 mb-3" />
              <div className="h-8 bg-neutral-700/50 rounded w-16" />
            </div>
          ))
        ) : summary ? (
          <>
            <StatCard label="Total Calls" value={summary.total_calls.toLocaleString()} />
            <StatCard
              label="Escalation Rate"
              value={`${(summary.escalation_rate * 100).toFixed(1)}%`}
              valueClassName={summary.escalation_rate > 0.2 ? "text-red-400" : "text-neutral-50"}
            />
            <StatCard
              label="Avg Duration"
              value={summary.avg_duration_sec ? `${(summary.avg_duration_sec / 60).toFixed(1)} min` : "—"}
            />
            <StatCard
              label="Non-Emergency %"
              value={`${(summary.non_emergency_pct * 100).toFixed(0)}%`}
              valueClassName="text-primary-400"
            />
          </>
        ) : null}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut chart */}
        <div className="panel p-6">
          <h3 className="text-lg font-semibold text-neutral-100 mb-4">CTAS Distribution</h3>
          {loading ? (
            <div className="h-[280px] flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-neutral-600 animate-spin" />
            </div>
          ) : pieData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-[14px] text-neutral-500">No data</div>
          ) : (
            <div className="h-[280px] flex items-center">
              <div className="w-[55%] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={105} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload?.length) return null
                        const d = payload[0].payload
                        return (
                          <div className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 shadow-xl">
                            <p className="text-[13px] font-semibold" style={{ color: d.color }}>{d.name}</p>
                            <p className="text-[12px] text-neutral-400">{d.value} calls ({(d.pct * 100).toFixed(1)}%)</p>
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-[45%] space-y-2.5 pl-4">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <CTASBadge level={d.name as CTASLevel} showLabel={false} />
                    <span className="ml-auto text-[13px] font-mono font-medium text-neutral-300">{d.value}</span>
                    <span className="text-[11px] text-neutral-500 w-12 text-right">{(d.pct * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bar chart */}
        <div className="panel p-6">
          <h3 className="text-lg font-semibold text-neutral-100 mb-4">Calls by CTAS Level</h3>
          {loading ? (
            <div className="h-[280px] flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-neutral-600 animate-spin" />
            </div>
          ) : barData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-[14px] text-neutral-500">No data</div>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    content={({ payload }) => {
                      if (!payload?.length) return null
                      const d = payload[0].payload
                      return (
                        <div className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 shadow-xl">
                          <p className="text-[13px] font-semibold" style={{ color: d.fill }}>{d.name}</p>
                          <p className="text-[12px] text-neutral-400">{d.calls} calls</p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="calls" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
