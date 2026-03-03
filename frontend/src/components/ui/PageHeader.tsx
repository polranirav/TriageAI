interface PageHeaderProps {
    eyebrow?: string
    title: string
    subtitle?: string
    action?: React.ReactNode
}

export function PageHeader({ eyebrow, title, subtitle, action }: PageHeaderProps) {
    return (
        <section className="panel p-5 md:p-6 mb-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    {eyebrow && (
                        <p className="text-[11px] uppercase tracking-[0.12em] text-primary-400 mb-1">
                            {eyebrow}
                        </p>
                    )}
                    <h1 className="text-h1">{title}</h1>
                    {subtitle && (
                        <p className="text-body-sm text-neutral-500 mt-1">{subtitle}</p>
                    )}
                </div>
                {action && <div className="flex-shrink-0">{action}</div>}
            </div>
        </section>
    )
}
