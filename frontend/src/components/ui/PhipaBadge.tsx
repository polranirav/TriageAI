import { ShieldCheck } from "lucide-react"

/** Floating PHIPA Secure badge — bottom-right of every dashboard screen.
 *  Clicking could open a data architecture modal (future feature).
 */
export function PhipaBadge() {
    return (
        <div className="hidden md:flex fixed bottom-4 right-4 z-30 items-center gap-1.5 bg-[#10B9811A] border border-[#10B98130] rounded-md px-3 py-1.5 text-[11px] text-status-live cursor-default select-none hover:bg-[#10B98125] transition-colors">
            <ShieldCheck className="w-3.5 h-3.5" />
            PHIPA Secure — Zero PII
        </div>
    )
}
