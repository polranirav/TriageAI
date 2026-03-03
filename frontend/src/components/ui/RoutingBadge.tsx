import { PhoneForwarded, Stethoscope, Building2, Home, AlertCircle } from "lucide-react"

const routingConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    escalate_911: {
        label: "Escalated",
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/25",
        icon: <PhoneForwarded className="w-3 h-3" />,
    },
    er_urgent: {
        label: "ER Urgent",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/25",
        icon: <Stethoscope className="w-3 h-3" />,
    },
    walk_in: {
        label: "Walk-in",
        color: "text-teal-400",
        bg: "bg-teal-500/10",
        border: "border-teal-500/25",
        icon: <Building2 className="w-3 h-3" />,
    },
    home_care: {
        label: "Home Care",
        color: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/25",
        icon: <Home className="w-3 h-3" />,
    },
    incomplete: {
        label: "Incomplete",
        color: "text-neutral-400",
        bg: "bg-neutral-500/10",
        border: "border-neutral-500/25",
        icon: <AlertCircle className="w-3 h-3" />,
    },
}

export function RoutingBadge({ action }: { action: string }) {
    const config = routingConfig[action] ?? routingConfig.incomplete
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-caption font-semibold uppercase tracking-wide border ${config.color} ${config.bg} ${config.border}`}
        >
            {config.icon}
            {config.label}
        </span>
    )
}
