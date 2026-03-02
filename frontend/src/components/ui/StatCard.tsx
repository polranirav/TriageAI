import { cn } from "../../lib/utils"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  trend?: number // positive or negative percentage
  trendLabel?: string
  className?: string
  valueClassName?: string
}

export function StatCard({ label, value, trend, trendLabel = "vs yesterday", className, valueClassName }: StatCardProps) {
  const isPositive = trend !== undefined && trend > 0
  const isNegative = trend !== undefined && trend < 0

  return (
    <div className={cn(
      "bg-neutral-800 border border-neutral-700 rounded-xl p-5 md:p-6 transition-colors duration-200 hover:border-neutral-600 flex flex-col",
      className
    )}>
      <h3 className="text-[11px] font-medium text-neutral-500 uppercase tracking-[0.08em] mb-1">
        {label}
      </h3>
      
      <div className="flex items-baseline gap-3 mt-1">
        <span className={cn("text-[32px] font-extrabold text-neutral-50 leading-none", valueClassName)}>
          {value}
        </span>
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-3">
          <span className={cn(
            "flex items-center text-[13px] font-medium",
            isPositive ? "text-primary-500" : isNegative ? "text-[#ef4444]" : "text-neutral-400"
          )}>
            {isPositive && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
            {isNegative && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {Math.abs(trend)}%
          </span>
          <span className="text-[11px] text-neutral-600">{trendLabel}</span>
        </div>
      )}
    </div>
  )
}
