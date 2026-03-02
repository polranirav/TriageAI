import { cn } from "../../lib/utils"
import { AlertTriangle, Circle } from "lucide-react"

export type CTASLevel = "L1" | "L2" | "L3" | "L4" | "L5"

interface CTASBadgeProps {
  level: CTASLevel
  className?: string
  showLabel?: boolean
}

export function CTASBadge({ level, className, showLabel = true }: CTASBadgeProps) {
  const config = {
    L1: { bg: "bg-[#450a0a]", text: "text-[#ef4444]", border: "border-[#ef4444]/30", icon: AlertTriangle, label: "Resuscitation" },
    L2: { bg: "bg-[#431407]", text: "text-[#f97316]", border: "border-[#f97316]/30", icon: AlertTriangle, label: "Emergent" },
    L3: { bg: "bg-[#451a03]", text: "text-[#f59e0b]", border: "border-[#f59e0b]/30", icon: Circle, label: "Urgent" },
    L4: { bg: "bg-[#042f2e]", text: "text-[#14b8a6]", border: "border-[#14b8a6]/30", icon: Circle, label: "Semi-Urgent" },
    L5: { bg: "bg-[#052e16]", text: "text-[#22c55e]", border: "border-[#22c55e]/30", icon: Circle, label: "Non-Urgent" },
  }

  const { bg, text, border, icon: Icon, label } = config[level]
  const isCritical = level === "L1" || level === "L2"

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-[0.06em] border",
      bg, text, border, className,
      isCritical ? "animate-critical-pulse border-[#ef4444] shadow-sm shadow-red-900/50" : ""
    )}>
      <Icon className={cn("w-2.5 h-2.5", isCritical ? "fill-current" : "")} strokeWidth={3} />
      {showLabel ? `${level} · ${label}` : level}
    </span>
  )
}
