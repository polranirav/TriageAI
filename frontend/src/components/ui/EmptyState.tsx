import { cn } from "../../lib/utils"
import { type LucideIcon } from "lucide-react"

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    subtext?: string
    action?: React.ReactNode
    className?: string
}

export function EmptyState({ icon: Icon, title, description, subtext, action, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
            {/* Icon with subtle glow */}
            <div className="w-16 h-16 rounded-2xl bg-card border border-border-default flex items-center justify-center mb-5">
                <Icon className="w-7 h-7 text-text-muted" />
            </div>

            <h3 className="text-[16px] font-semibold text-text-primary mb-2">{title}</h3>
            <p className="text-[14px] text-text-secondary max-w-sm">{description}</p>

            {subtext && (
                <p className="text-[12px] text-text-muted mt-2 font-mono">{subtext}</p>
            )}

            {action && <div className="mt-5">{action}</div>}
        </div>
    )
}
