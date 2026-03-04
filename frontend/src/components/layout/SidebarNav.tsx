import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"
import {
  LayoutDashboard, Radio, List, AlertTriangle,
  BarChart3, Settings, FileText, HelpCircle,
  Bell, LogOut, Zap, ChevronLeft, MoreHorizontal,
} from "lucide-react"
import { logout } from "../../lib/api"
import { useState } from "react"

interface NavItem {
  name: string
  path: string
  icon: typeof LayoutDashboard
  badge?: string
}

interface NavSection {
  label: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Live Monitor", path: "/dashboard/live", icon: Radio },
    ],
  },
  {
    label: "TRIAGE DATA",
    items: [
      { name: "All Sessions", path: "/dashboard/sessions", icon: List },
      { name: "Escalations", path: "/dashboard/escalations", icon: AlertTriangle },
      { name: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "CLINIC",
    items: [
      { name: "Configuration", path: "/dashboard/settings", icon: Settings },
      { name: "Reports", path: "/dashboard/reports", icon: FileText },
      { name: "Help & Docs", path: "/dashboard/help", icon: HelpCircle },
    ],
  },
]

const MOBILE_TABS = [
  { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { name: "Live", path: "/dashboard/live", icon: Radio },
  { name: "Sessions", path: "/dashboard/sessions", icon: List },
  { name: "Alerts", path: "/dashboard/escalations", icon: AlertTriangle },
  { name: "More", path: "/dashboard/settings", icon: MoreHorizontal },
]

export function SidebarNav() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== "/dashboard" && location.pathname.startsWith(path))

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          "bg-sidebar flex-col fixed inset-y-0 left-0 border-r border-border-subtle z-20 hidden md:flex transition-all duration-200",
          collapsed ? "w-[64px]" : "w-[240px]",
        )}
      >
        {/* Logo + Branding */}
        <div className="h-16 flex items-center px-4 border-b border-border-subtle">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-white text-xs font-bold">
              <Zap className="w-4 h-4" />
            </span>
            {!collapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold text-base text-text-primary">TriageAI</span>
                  <span className="flex items-center gap-1 text-[10px] text-status-live">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-text-muted truncate">Ottawa CHC</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-text-muted">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.path)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.badge ? "#" : item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-150 relative",
                        active
                          ? "bg-card text-text-primary border-l-[3px] border-l-primary-500"
                          : "text-text-secondary hover:bg-card/50 hover:text-text-primary border-l-[3px] border-l-transparent",
                        item.badge && "opacity-50 cursor-not-allowed",
                        collapsed && "justify-center px-0",
                      )}
                      onClick={item.badge ? (e) => e.preventDefault() : undefined}
                    >
                      <Icon className={cn("w-[18px] h-[18px] shrink-0", active && "text-primary-500")} />
                      {!collapsed && (
                        <>
                          <span className="truncate">{item.name}</span>
                          {item.badge && (
                            <span className="ml-auto text-[9px] font-bold uppercase bg-border-subtle text-text-muted px-1.5 py-0.5 rounded">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border-subtle">
          {/* Alerts */}
          {!collapsed && (
            <Link
              to="/dashboard/escalations"
              className="flex items-center gap-3 px-5 py-3 text-[13px] text-text-secondary hover:text-text-primary transition-colors"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span>Alerts</span>
            </Link>
          )}

          {/* Status Strip */}
          <div className={cn("px-4 py-3 border-t border-border-subtle", collapsed && "px-2")}>
            {!collapsed ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-live" />
                  <span className="mono-data text-[11px]">System Operational</span>
                </div>
                <button
                  onClick={() => setCollapsed(true)}
                  className="text-text-muted hover:text-text-secondary transition-colors"
                  title="Collapse sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCollapsed(false)}
                className="w-full flex justify-center text-text-muted hover:text-text-secondary transition-colors"
                title="Expand sidebar"
              >
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>

          {/* User / Logout */}
          {!collapsed && (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-border-default flex items-center justify-center text-[11px] font-bold text-text-secondary">
                  OC
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] text-text-primary font-medium truncate">Ottawa CHC</span>
                  <span className="text-[11px] text-text-muted">Admin</span>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border-default px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:border-border-active transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar (5 tabs) ── */}
      <nav className="fixed md:hidden bottom-0 inset-x-0 z-20 border-t border-border-subtle bg-sidebar/95 backdrop-blur-md">
        <div className="grid grid-cols-5 gap-0.5 p-1.5 pb-[calc(env(safe-area-inset-bottom)+0.375rem)]">
          {MOBILE_TABS.map((item) => {
            const active = isActive(item.path)
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "rounded-md py-2 flex flex-col items-center gap-1 text-[10px] font-medium transition-colors",
                  active
                    ? "bg-primary-500/10 text-primary-400"
                    : "text-text-muted hover:text-text-secondary",
                )}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
