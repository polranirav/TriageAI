import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"
import { Activity, List, BarChart3, Settings, Bell, LogOut } from "lucide-react"
import { logout } from "../../lib/api"

export function SidebarNav() {
  const location = useLocation()

  const navItems = [
    { name: "Overview", path: "/dashboard", icon: Activity },
    { name: "Call Sessions", path: "/dashboard/sessions", icon: List },
    { name: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ]

  return (
    <>
      <aside className="w-[260px] bg-neutral-950/95 backdrop-blur-md flex-col fixed inset-y-0 left-0 border-r border-neutral-800 z-20 hidden md:flex">
        <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-primary-700/50 bg-primary-900/30 text-primary-400 text-xs font-semibold">
              TA
            </span>
            <span className="font-sans font-bold text-lg text-white">TriageAI</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider bg-primary-900/50 text-primary-400 px-1.5 py-0.5 rounded">
            Admin
          </span>
        </div>

        <div className="px-4 py-4">
          <div className="panel rounded-lg px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] text-neutral-500">Coverage</p>
              <p className="text-sm text-neutral-200 font-medium">24/7 Active</p>
            </div>
            <Bell className="w-4 h-4 text-primary-400" />
          </div>
        </div>

        <div className="flex-1 py-2 px-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path))
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors relative group",
                  isActive
                    ? "bg-primary-900/35 text-primary-300 border border-primary-700/40"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 border border-transparent",
                )}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-[11px] font-bold text-neutral-300">
              CH
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] text-neutral-300 font-medium">City Health Clinic</span>
              <span className="text-[11px] text-neutral-500">Free Pilot</span>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-neutral-700 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </aside>

      <nav className="fixed md:hidden bottom-0 inset-x-0 z-20 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur-md">
        <div className="grid grid-cols-4 gap-1 p-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path))
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "rounded-md py-2 flex flex-col items-center gap-1 text-[11px] transition-colors",
                  isActive ? "bg-primary-900/35 text-primary-300" : "text-neutral-500 hover:text-neutral-300",
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name.split(" ")[0]}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
