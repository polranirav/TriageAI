import { Outlet, useLocation, Link } from "react-router-dom"
import { SidebarNav } from "./SidebarNav"
import { ShieldCheck, Search, Bell, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

const ROUTE_NAMES: Record<string, string> = {
  "/dashboard": "Dashboard Overview",
  "/dashboard/sessions": "All Sessions",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Configuration",
  "/dashboard/escalations": "Escalations",
  "/dashboard/live": "Live Monitor",
  "/dashboard/reports": "Reports",
  "/dashboard/help": "Help & Docs",
}

export function DashboardLayout() {
  const location = useLocation()
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Auto-refresh timestamp
  useEffect(() => {
    const interval = setInterval(() => setLastUpdated(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  // Build breadcrumb
  const isSessionDetail = location.pathname.match(/\/dashboard\/sessions\/(.+)/)
  const currentPageName = isSessionDetail
    ? "Session Detail"
    : ROUTE_NAMES[location.pathname] || "Dashboard"

  const timeAgo = Math.max(0, Math.round((Date.now() - lastUpdated.getTime()) / 60_000))
  const timeLabel = timeAgo === 0 ? "Just now" : `${timeAgo} min ago`

  return (
    <div className="min-h-screen bg-canvas">
      <SidebarNav />

      {/* ── Top Bar (Desktop) ── */}
      <header className="hidden md:flex fixed top-0 right-0 left-[240px] h-16 z-10 bg-sidebar/95 backdrop-blur-md border-b border-border-subtle items-center justify-between px-6">
        {/* Left: Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[13px]">
          <Link to="/dashboard" className="text-text-muted hover:text-text-secondary transition-colors">
            Dashboard
          </Link>
          {currentPageName !== "Dashboard Overview" && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
              {isSessionDetail && (
                <>
                  <Link to="/dashboard/sessions" className="text-text-muted hover:text-text-secondary transition-colors">
                    Sessions
                  </Link>
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                </>
              )}
              <span className="text-text-primary font-medium">{currentPageName}</span>
            </>
          )}
        </nav>

        {/* Center: Search */}
        <div className="flex-1 max-w-[400px] mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by CTAS level, routing, date..."
              className="w-full bg-card border border-border-default rounded-md py-2 pl-9 pr-14 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 transition-colors"
              readOnly
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-muted bg-surface border border-border-subtle rounded px-1.5 py-0.5">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Time + Notification */}
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-text-muted font-mono">
            Updated: {timeLabel}
          </span>
          <button className="relative p-2 rounded-md hover:bg-card transition-colors">
            <Bell className="w-4.5 h-4.5 text-text-secondary" />
          </button>
        </div>
      </header>

      {/* ── Mobile Top Bar ── */}
      <header className="md:hidden sticky top-0 z-10 border-b border-border-subtle bg-sidebar/95 backdrop-blur-md">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500 text-white text-[10px] font-bold">
              ⚡
            </span>
            <p className="text-sm font-semibold text-text-primary">TriageAI</p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-status-live">
            <ShieldCheck className="w-3.5 h-3.5" />
            PHIPA Safe
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="md:pl-[240px] md:pt-16 pb-20 md:pb-0 min-h-screen">
        <div className="bg-surface min-h-[calc(100vh-64px)]">
          <Outlet />
        </div>
      </main>

      {/* ── Floating PHIPA Badge (Desktop) ── */}
      <div className="hidden md:flex fixed bottom-4 right-4 z-30 items-center gap-1.5 bg-[#10B9811A] border border-[#10B98130] rounded-md px-3 py-1.5 text-[11px] text-status-live cursor-default select-none">
        <ShieldCheck className="w-3.5 h-3.5" />
        PHIPA Secure — Zero PII
      </div>
    </div>
  )
}
