import { cn } from "../../lib/utils"

export type CTASLevel = "L1" | "L2" | "L3" | "L4" | "L5"

const CTAS_CONFIG: Record<CTASLevel, {
  label: string
  solidColor: string
  bgColor: string
  borderColor: string
  pulse?: boolean
}> = {
  L1: { label: "Resuscitation", solidColor: "#FF2D2D", bgColor: "#FF2D2D1A", borderColor: "#FF2D2D40", pulse: true },
  L2: { label: "Emergent", solidColor: "#FF6B00", bgColor: "#FF6B001A", borderColor: "#FF6B0040" },
  L3: { label: "Urgent", solidColor: "#F0B429", bgColor: "#F0B4291A", borderColor: "#F0B42940" },
  L4: { label: "Less Urgent", solidColor: "#3B82F6", bgColor: "#3B82F61A", borderColor: "#3B82F640" },
  L5: { label: "Non-Urgent", solidColor: "#10B981", bgColor: "#10B9811A", borderColor: "#10B98140" },
}

interface CTASBadgeProps {
  level: CTASLevel
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

export function CTASBadge({ level, size = "md", showLabel = false, className }: CTASBadgeProps) {
  const config = CTAS_CONFIG[level]

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1",
    md: "text-[12px] px-2 py-1 gap-1.5",
    lg: "text-[14px] px-3 py-1.5 gap-2",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-md whitespace-nowrap",
        sizeClasses[size],
        config.pulse && "ctas-l1-pulse",
        className,
      )}
      style={{
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        color: config.solidColor,
      }}
    >
      {level}
      {showLabel && (
        <span className="font-normal opacity-80">
          {config.label}
        </span>
      )}
    </span>
  )
}

/** Return the CTAS color config for programmatic use (charts, etc.) */
export function getCTASColor(level: number | string) {
  const key = typeof level === "number" ? `L${level}` : level
  return CTAS_CONFIG[key as CTASLevel] ?? CTAS_CONFIG.L5
}
