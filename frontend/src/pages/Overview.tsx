import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api, type AnalyticsSummary, type CTASDistributionItem, type SessionSummary } from "../lib/api"
import { StatCard } from "../components/ui/StatCard"
import { CTASBadge, type CTASLevel } from "../components/ui/CTASBadge"
import { EmptyState } from "../components/ui/EmptyState"
import { EcgLoader } from "../components/ui/EcgLoader"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"
import { Phone, Activity, AlertTriangle, Clock, ChevronRight, Download, Zap, BarChart3 } from "lucide-react"

const CTAS_COLORS = ["#FF2D2D", "#FF6B00", "#F0B429", "#3B82F6", "#10B981"]
const CTAS_LABELS = ["L1 Resuscitation", "L2 Emergent", "L3 Urgent", "L4 Less Urgent", "L5 Non-Urgent"]

export function Overview() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [distribution, setDistribution] = useState<CTASDistributionItem[]>([])
  const [recentSessions, setRecentSessions] = useState<SessionSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.analyticsSummary(30),
      api.ctasDistribution(30),
      api.listSessions({ per_page: 5 }),
    ]).then(([sumResult, distResult, sessResult]) => {
      if (sumResult.status === "fulfilled") setSummary(sumResult.value)
      if (distResult.status === "fulfilled") setDistribution(distResult.value.distribution)
      if (sessResult.status === "fulfilled") setRecentSessions(sessResult.value.sessions)
      setLoading(false)
    })
  }, [])

  if (loading) return <EcgLoader className="min-h-[60vh]" />

  const totalCalls = summary?.total_calls ?? 0
  const escalationRate = summary?.escalation_rate ?? 0
  const avgDuration = summary?.avg_duration_sec ?? 0
  const nonEmergencyPct = summary?.non_emergency_pct ?? 0

  // Sparkline mock data (7-day trend) — will be API-driven later
  const sparkline7d = [12, 15, 10, 18, 14, 23, totalCalls || 20]

  // Donut chart data
  const donutData = distribution.map((d, i) => ({
    name: CTAS_LABELS[i] || `L${d.level}`,
    value: d.count,
    color: CTAS_COLORS[d.level - 1] || CTAS_COLORS[4],
  }))

  // Bar chart data (14 days — mock with distribution trends)
  const barData = Array.from({ length: 14 }, (_, i) => {
    const day = new Date()
    day.setDate(day.getDate() - (13 - i))
    const label = day.toLocaleDateString("en-CA", { weekday: "short", day: "numeric" })
    const base = Math.floor(Math.random() * 8) + 5
    return {
      name: label,
      L5: Math.floor(base * 0.30),
      L4: Math.floor(base * 0.35),
      L3: Math.floor(base * 0.20),
      L2: Math.floor(base * 0.10),
      L1: Math.floor(base * 0.05),
      total: base,
    }
  })

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-text-primary">Dashboard Overview</h1>
          <p className="text-body text-text-secondary mt-1">
            What happened — at a glance
          </p>
        </div>
      </div>

      {/* ── ROW 1: Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Calls This Period"
          value={totalCalls}
          format="number"
          icon={<Phone className="w-4 h-4" />}
          trend={{ value: "+12%", direction: "up", label: "vs last period" }}
          sparklineData={sparkline7d}
          accentColor="#3B82F6"
        />
        <StatCard
          label="Non-Emergency Rate"
          value={Math.round(nonEmergencyPct)}
          format="percent"
          icon={<Activity className="w-4 h-4" />}
          trend={{ value: "69%", direction: "up", label: "routed from ER" }}
          sparklineData={[58, 62, 61, 65, 68, 70, Math.round(nonEmergencyPct) || 69]}
          accentColor="#10B981"
        />
        <StatCard
          label="Escalation Rate"
          value={Math.round(escalationRate * 100)}
          format="percent"
          icon={<AlertTriangle className="w-4 h-4" />}
          trend={{
            value: `${Math.round(escalationRate * 100)}%`,
            direction: escalationRate > 0.15 ? "up" : "down",
            label: "of all calls",
          }}
          specialBorder={escalationRate > 0.1 ? "#FF6B0040" : undefined}
          accentColor="#FF6B00"
        />
        <StatCard
          label="Avg Call Duration"
          value={Math.round(avgDuration)}
          format="duration"
          icon={<Clock className="w-4 h-4" />}
          trend={{ value: "−8s", direction: "down", label: "vs last period" }}
          sparklineData={[185, 172, 168, 175, 162, 158, Math.round(avgDuration) || 161]}
          accentColor="#3B82F6"
        />
      </div>

      {/* ── ROW 2: CTAS Distribution + Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* CTAS Donut (3 cols) */}
        <div className="lg:col-span-3 panel p-6">
          <h2 className="text-section text-text-primary mb-4">CTAS Distribution</h2>

          {donutData.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No data yet"
              description="Analytics become meaningful after 50+ calls."
            />
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Donut */}
              <div className="w-[200px] h-[200px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #243554",
                        backgroundColor: "#162033",
                        color: "#E8F0FE",
                        fontSize: 13,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-2">
                {distribution.map((d) => {
                  const color = CTAS_COLORS[d.level - 1]
                  return (
                    <div key={d.level} className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                        <span className="text-text-secondary">{CTAS_LABELS[d.level - 1]}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-text-mono">{d.count}</span>
                        <span className="text-text-muted text-[12px]">({d.percentage}%)</span>
                      </div>
                    </div>
                  )
                })}

                {/* Key Insight */}
                {nonEmergencyPct > 0 && (
                  <div className="mt-4 p-3 rounded-md bg-primary-glow border border-primary-500/20">
                    <div className="flex items-center gap-2 text-[13px]">
                      <Zap className="w-4 h-4 text-primary-500" />
                      <span className="text-primary-400 font-medium">Key Insight</span>
                    </div>
                    <p className="text-[13px] text-text-secondary mt-1">
                      {Math.round(nonEmergencyPct)}% of callers were routed away from the ER.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity (2 cols) */}
        <div className="lg:col-span-2 panel p-6">
          <h2 className="text-section text-text-primary mb-4">Recent Activity</h2>

          {recentSessions.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="All clear — no calls yet"
              description="Your triage line is active and ready."
            />
          ) : (
            <div className="space-y-1">
              {recentSessions.map((s) => (
                <Link
                  key={s.id}
                  to={`/dashboard/sessions/${s.call_sid}`}
                  className="flex items-center gap-3 py-2.5 px-2 rounded-md hover:bg-card-hover transition-colors group"
                >
                  {/* Time */}
                  <span className="text-[12px] font-mono text-text-muted w-[60px] shrink-0">
                    {new Date(s.started_at).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })}
                  </span>

                  {/* CTAS */}
                  {s.ctas_level && (
                    <CTASBadge level={`L${s.ctas_level}` as CTASLevel} size="sm" />
                  )}

                  {/* Routing */}
                  <span className="flex-1 text-[13px] text-text-secondary truncate">
                    {s.routing_action || "Pending"}
                  </span>

                  {/* Duration */}
                  <span className="mono-data text-[12px]">
                    {s.duration_sec ? `${Math.floor(s.duration_sec / 60)}:${(s.duration_sec % 60).toString().padStart(2, "0")}` : "—"}
                  </span>

                  {/* Escalation */}
                  {s.escalated && (
                    <AlertTriangle className="w-3.5 h-3.5 text-status-escalated shrink-0" />
                  )}

                  {/* Arrow */}
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-secondary shrink-0" />
                </Link>
              ))}

              <Link
                to="/dashboard/sessions"
                className="flex items-center justify-center gap-1.5 pt-3 text-[13px] text-primary-500 hover:text-primary-400 transition-colors"
              >
                View All Sessions
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 3: Call Volume Trend ── */}
      <div className="panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-section text-text-primary">Call Volume — Last 14 Days</h2>
          <button className="inline-flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-text-primary border border-border-default rounded-md px-3 py-1.5 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData} barGap={2}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#7A8FA8", fontSize: 11 }}
              interval={1}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#7A8FA8", fontSize: 11 }}
              width={30}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #243554",
                backgroundColor: "#162033",
                color: "#E8F0FE",
                fontSize: 13,
              }}
              cursor={{ fill: "rgba(59,130,246,0.06)" }}
              labelStyle={{ color: "#E8F0FE", fontWeight: 600 }}
            />
            <Bar dataKey="L5" stackId="ctas" fill="#10B981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="L4" stackId="ctas" fill="#3B82F6" />
            <Bar dataKey="L3" stackId="ctas" fill="#F0B429" />
            <Bar dataKey="L2" stackId="ctas" fill="#FF6B00" />
            <Bar dataKey="L1" stackId="ctas" fill="#FF2D2D" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
