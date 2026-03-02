import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"
import { CTASBadge, type CTASLevel } from "../components/ui/CTASBadge"
import { cn } from "../lib/utils"

const sessions: {
  id: string
  caller: string
  level: CTASLevel
  routing: string
  duration: string
  started: string
}[] = [
  { id: "CA-81134", caller: "+1 (647) 555-0191", level: "L1", routing: "Escalated to Nurse", duration: "03:12", started: "10:02 AM" },
  { id: "CA-81128", caller: "+1 (416) 555-0142", level: "L3", routing: "ER Urgent", duration: "02:28", started: "9:54 AM" },
  { id: "CA-81121", caller: "+1 (905) 555-0166", level: "L5", routing: "Home Care", duration: "01:47", started: "9:42 AM" },
  { id: "CA-81120", caller: "+1 (437) 555-0138", level: "L4", routing: "Walk-In Clinic", duration: "02:11", started: "9:35 AM" },
  { id: "CA-81111", caller: "+1 (519) 555-0121", level: "L2", routing: "Nurse Callback", duration: "03:44", started: "9:18 AM" },
]

const levelFilters: Array<"ALL" | CTASLevel> = ["ALL", "L1", "L2", "L3", "L4", "L5"]

export function Sessions() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<"ALL" | CTASLevel>("ALL")

  const filtered = useMemo(() => {
    return sessions.filter((session) => {
      const matchesLevel = selectedLevel === "ALL" || session.level === selectedLevel
      const matchesQuery =
        query.trim().length === 0 ||
        session.id.toLowerCase().includes(query.toLowerCase()) ||
        session.caller.toLowerCase().includes(query.toLowerCase()) ||
        session.routing.toLowerCase().includes(query.toLowerCase())
      return matchesLevel && matchesQuery
    })
  }, [query, selectedLevel])

  return (
    <div className="p-4 md:p-8 max-w-[1320px] mx-auto animate-fade-in">
      <section className="panel p-5 md:p-6 mb-6">
        <p className="text-[11px] uppercase tracking-[0.12em] text-primary-400 mb-1">Operations</p>
        <h1 className="text-h1">Call Sessions</h1>
        <p className="text-body-sm text-neutral-500 mt-1">Review active triage outcomes and routing decisions.</p>
      </section>

      <section className="panel p-4 md:p-5 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search session ID, phone, or routing action..."
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 pl-9 pr-3 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {levelFilters.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setSelectedLevel(level)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[12px] border transition-colors",
                  selectedLevel === level
                    ? "bg-primary-900/35 border-primary-700/40 text-primary-300"
                    : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-neutral-200",
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-neutral-900/80 border-b border-neutral-800">
              <tr>
                <th className="text-left text-[11px] uppercase tracking-[0.08em] text-neutral-500 px-4 py-3">Session ID</th>
                <th className="text-left text-[11px] uppercase tracking-[0.08em] text-neutral-500 px-4 py-3">Caller</th>
                <th className="text-left text-[11px] uppercase tracking-[0.08em] text-neutral-500 px-4 py-3">CTAS</th>
                <th className="text-left text-[11px] uppercase tracking-[0.08em] text-neutral-500 px-4 py-3">Routing</th>
                <th className="text-left text-[11px] uppercase tracking-[0.08em] text-neutral-500 px-4 py-3">Duration</th>
                <th className="text-left text-[11px] uppercase tracking-[0.08em] text-neutral-500 px-4 py-3">Started</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr 
                  key={session.id} 
                  onClick={() => navigate(`/dashboard/sessions/${session.id}`)}
                  className="border-b border-neutral-800/70 hover:bg-neutral-900/70 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm text-neutral-100 font-mono">{session.id}</td>
                  <td className="px-4 py-3 text-sm text-neutral-300">{session.caller}</td>
                  <td className="px-4 py-3">
                    <CTASBadge level={session.level} showLabel={false} />
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-300">{session.routing}</td>
                  <td className="px-4 py-3 text-sm text-neutral-300 font-mono">{session.duration}</td>
                  <td className="px-4 py-3 text-sm text-neutral-500">{session.started}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-neutral-500">No sessions match your current filters.</div>
          )}
        </div>
      </section>
    </div>
  )
}
