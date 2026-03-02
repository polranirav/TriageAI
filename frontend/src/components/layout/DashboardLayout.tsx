import { Outlet } from "react-router-dom"
import { SidebarNav } from "./SidebarNav"
import { ShieldCheck } from "lucide-react"

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <SidebarNav />
      <header className="md:hidden sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-primary-700/50 bg-primary-900/30 text-primary-400 text-[10px] font-semibold">
              TA
            </span>
            <p className="text-sm font-semibold text-neutral-100">TriageAI Dashboard</p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-primary-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            PHIPA Safe
          </div>
        </div>
      </header>
      <main className="md:pl-[260px] pb-20 md:pb-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
