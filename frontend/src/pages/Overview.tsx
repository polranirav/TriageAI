import { Link } from "react-router-dom"
import { BarChart3, Clock3, PhoneCall, Siren, Sparkles } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { StatCard } from "../components/ui/StatCard"
import { CTASBadge, type CTASLevel } from "../components/ui/CTASBadge"
import { cn } from "../lib/utils"

const triageData: { level: CTASLevel; value: number; color: string }[] = [
  { level: "L1", value: 6, color: "#ef4444" },
  { level: "L2", value: 12, color: "#f97316" },
  { level: "L3", value: 34, color: "#f59e0b" },
  { level: "L4", value: 28, color: "#14b8a6" },
  { level: "L5", value: 20, color: "#22c55e" },
]

const callTrend = [
  { hour: "00", calls: 8 },
  { hour: "04", calls: 5 },
  { hour: "08", calls: 14 },
  { hour: "12", calls: 22 },
  { hour: "16", calls: 19 },
  { hour: "20", calls: 11 },
]

const recentCalls: { level: CTASLevel; action: string; time: string; critical: boolean }[] = [
  { level: "L1", action: "Escalated to Human", time: "2 min ago", critical: true },
  { level: "L3", action: "ER Urgent", time: "6 min ago", critical: false },
  { level: "L5", action: "Home Care", time: "11 min ago", critical: false },
  { level: "L4", action: "Walk-in", time: "29 min ago", critical: false },
  { level: "L2", action: "Nurse Callback", time: "1 hr ago", critical: true },
]

export function Overview() {
  const todayLabel = new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date())

  return (
    <div className="p-4 md:p-8 max-w-[1320px] mx-auto animate-fade-in">
      <header className="mb-6 md:mb-8 panel p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-primary-400 mb-1">Operations Snapshot</p>
            <h1 className="text-h1">Overview</h1>
            <p className="text-body-sm text-neutral-500 mt-1">Today - {todayLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-primary-700/40 bg-primary-900/20 px-2.5 py-1 text-primary-300">
              <Sparkles className="h-3.5 w-3.5" />
              AI Triage Live
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 px-2.5 py-1 text-neutral-400">
              <Clock3 className="h-3.5 w-3.5" />
              Updated 1 min ago
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Calls" value="142" trend={12} className="bg-neutral-900/90" />
        <StatCard label="Escalation Rate" value="18%" trend={-2} className="bg-neutral-900/90" />
        <StatCard label="Avg Call Duration" value="2.4 min" trend={-8} className="bg-neutral-900/90" />
        <StatCard label="Non-Emerg Deflected" value="64%" trend={4} className="bg-neutral-900/90" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 panel p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h3">CTAS Distribution</h2>
            <div className="text-[11px] text-neutral-500">Last 24h</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-[240px] md:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={triageData} dataKey="value" nameKey="level" innerRadius={55} outerRadius={90} strokeWidth={2}>
                    {triageData.map((entry) => (
                      <Cell key={entry.level} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #404040",
                      backgroundColor: "#171717",
                      color: "#d4d4d4",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {triageData.map((item) => (
                <div key={item.level} className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <CTASBadge level={item.level} showLabel={false} />
                  </div>
                  <span className="text-sm text-neutral-300">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lg:col-span-5 panel p-5 md:p-6">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-800">
            <h2 className="text-h3">Recent Calls</h2>
            <Link to="/dashboard/sessions" className="text-[13px] text-primary-400 hover:text-primary-300 transition-colors font-medium">
              View all
            </Link>
          </div>

          <div className="space-y-2">
            {recentCalls.map((call, i) => (
              <article
                key={`${call.action}-${i}`}
                className={cn(
                  "flex justify-between items-center py-3 px-3 rounded-md border transition-colors cursor-pointer",
                  call.critical
                    ? "bg-[#450a0a]/35 border-[#ef4444]/45 hover:bg-[#450a0a]/55"
                    : "bg-neutral-900 border-neutral-800 hover:bg-neutral-800/75",
                )}
              >
                <div className="flex items-center gap-3">
                  <CTASBadge level={call.level} showLabel={false} />
                  <span className={cn("text-[14px] font-medium", call.critical ? "text-[#fda4af]" : "text-neutral-200")}>
                    {call.action}
                  </span>
                </div>
                <span className={cn("text-[12px] font-mono", call.critical ? "text-[#fb923c]" : "text-neutral-400")}>
                  {call.time}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="lg:col-span-8 panel p-5 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-h3">Call Volume Trend</h2>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500">
              <BarChart3 className="h-3.5 w-3.5" />
              6-hour buckets
            </span>
          </div>
          <div className="h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={callTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" opacity={0.3} />
                <XAxis dataKey="hour" stroke="#737373" tickLine={false} axisLine={false} />
                <YAxis stroke="#737373" tickLine={false} axisLine={false} width={26} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #404040",
                    backgroundColor: "#171717",
                    color: "#d4d4d4",
                  }}
                />
                <Bar dataKey="calls" radius={[6, 6, 0, 0]} fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="lg:col-span-4 panel p-5 md:p-6">
          <h2 className="text-h3 mb-4">Alerts</h2>
          <div className="space-y-3">
            <div className="rounded-md border border-red-700/40 bg-red-950/25 p-3">
              <p className="text-[12px] uppercase tracking-[0.08em] text-red-400 mb-1 inline-flex items-center gap-1.5">
                <Siren className="w-3.5 h-3.5" />
                Critical Queue
              </p>
              <p className="text-sm text-neutral-200">2 active high-priority escalations require nurse callbacks.</p>
            </div>
            <div className="rounded-md border border-neutral-800 bg-neutral-900 p-3">
              <p className="text-[12px] uppercase tracking-[0.08em] text-primary-400 mb-1 inline-flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" />
                Twilio Bridge
              </p>
              <p className="text-sm text-neutral-300">Average bridge connect time is 14 seconds (target &lt; 20s).</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
