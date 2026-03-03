import { cn } from "../../lib/utils"

interface EcgLoaderProps {
    className?: string
}

/** ECG heartbeat trace loading animation — replaces spinners throughout the dashboard. */
export function EcgLoader({ className }: EcgLoaderProps) {
    return (
        <div className={cn("flex items-center justify-center py-12", className)}>
            <div className="flex flex-col items-center gap-4">
                {/* ECG SVG trace */}
                <svg width="120" height="40" viewBox="0 0 120 40" className="overflow-visible">
                    <path
                        d="M0,20 L20,20 L25,20 L30,8 L35,32 L40,6 L45,34 L50,20 L55,20 L70,20 L75,20 L80,8 L85,32 L90,6 L95,34 L100,20 L120,20"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="300"
                        className="animate-ecg-trace"
                    />
                </svg>
                <span className="text-[12px] text-text-muted font-mono">Loading...</span>
            </div>
        </div>
    )
}
