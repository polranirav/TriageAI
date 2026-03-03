import { useEffect, useRef, useState } from "react"
import { cn } from "../../lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatCardProps {
  label: string
  value: number | string
  format?: "number" | "duration" | "percent" | "raw"
  trend?: { value: string; direction: "up" | "down" | "neutral"; label?: string }
  sparklineData?: number[]
  accentColor?: string
  specialBorder?: string // e.g. orange for escalation card
  icon?: React.ReactNode
  className?: string
}

export function StatCard({
  label,
  value,
  format = "raw",
  trend,
  sparklineData,
  accentColor = "#3B82F6",
  specialBorder,
  icon,
  className,
}: StatCardProps) {
  const displayValue = useCountUp(typeof value === "number" ? value : 0, format)
  const rawDisplay = typeof value === "string" ? value : displayValue

  return (
    <div
      className={cn("panel p-6 transition-all duration-200 hover:-translate-y-0.5 group", className)}
      style={specialBorder ? { borderColor: specialBorder } : undefined}
    >
      {/* Label */}
      <div className="flex items-center justify-between mb-3">
        <span className="section-label">{label}</span>
        {icon && <span className="text-text-muted group-hover:text-text-secondary transition-colors">{icon}</span>}
      </div>

      {/* Value — count-up animated */}
      <p className="text-[36px] font-bold leading-none text-text-primary tracking-tight mb-2">
        {rawDisplay}
      </p>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1.5 mb-3">
          {trend.direction === "up" && <TrendingUp className="w-3.5 h-3.5 text-status-live" />}
          {trend.direction === "down" && <TrendingDown className="w-3.5 h-3.5 text-[#FF2D2D]" />}
          {trend.direction === "neutral" && <Minus className="w-3.5 h-3.5 text-text-muted" />}
          <span
            className={cn(
              "text-[13px]",
              trend.direction === "up" && "text-status-live",
              trend.direction === "down" && "text-[#FF2D2D]",
              trend.direction === "neutral" && "text-text-muted",
            )}
          >
            {trend.value}
          </span>
          {trend.label && <span className="text-[12px] text-text-muted">{trend.label}</span>}
        </div>
      )}

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 1 && (
        <Sparkline data={sparklineData} color={accentColor} />
      )}
    </div>
  )
}

// ── Count-up hook ──
function useCountUp(target: number, format: string) {
  const [current, setCurrent] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const duration = 600
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCurrent(Math.round(eased * target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target])

  if (format === "percent") return `${current}%`
  if (format === "duration") {
    const min = Math.floor(current / 60)
    const sec = current % 60
    return `${min}:${sec.toString().padStart(2, "0")}`
  }
  return current.toLocaleString()
}

// ── Sparkline mini chart ──
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const width = 200
  const height = 40
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const step = width / (data.length - 1)

  const points = data
    .map((v, i) => {
      const x = i * step
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="mt-1">
      <defs>
        <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* Area fill */}
      <polygon
        fill={`url(#spark-${color.replace("#", "")})`}
        points={`0,${height} ${points} ${width},${height}`}
      />
    </svg>
  )
}
