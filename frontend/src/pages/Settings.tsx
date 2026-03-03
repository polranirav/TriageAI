import { useState } from "react"
import { Bell, ShieldCheck, Siren, Save } from "lucide-react"
import { logout } from "../lib/api"

export function Settings() {
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [emailDigest, setEmailDigest] = useState(true)
  const [criticalOnly, setCriticalOnly] = useState(false)

  return (
    <div className="p-4 md:p-8 max-w-[1100px] mx-auto animate-fade-in">
      <section className="panel p-5 md:p-6 mb-6">
        <p className="text-[11px] uppercase tracking-[0.12em] text-primary-400 mb-1">Configuration</p>
        <h1 className="text-h1">Settings</h1>
        <p className="text-body-sm text-neutral-500 mt-1">Manage escalation behavior, notifications, and clinic profile.</p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="panel p-5 md:p-6">
          <h2 className="text-h3 mb-4 inline-flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary-400" />
            Clinic Profile
          </h2>
          <div className="space-y-3">
            <label className="block">
              <span className="text-[13px] text-neutral-400">Clinic Name</span>
              <input
                defaultValue="City Health Clinic"
                className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </label>
            <label className="block">
              <span className="text-[13px] text-neutral-400">On-call Number</span>
              <input
                defaultValue="+1 (226) 212-8564"
                className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </label>
            <label className="block">
              <span className="text-[13px] text-neutral-400">Escalation SLA</span>
              <input
                defaultValue="20 seconds"
                className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </label>
          </div>
        </section>

        <section className="panel p-5 md:p-6">
          <h2 className="text-h3 mb-4 inline-flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary-400" />
            Notifications
          </h2>
          <div className="space-y-3">
            <ToggleRow label="SMS alert for escalated calls" enabled={smsAlerts} onToggle={() => setSmsAlerts((v) => !v)} />
            <ToggleRow label="6-hour email digest" enabled={emailDigest} onToggle={() => setEmailDigest((v) => !v)} />
            <ToggleRow label="Send only L1/L2 alerts to nurse lead" enabled={criticalOnly} onToggle={() => setCriticalOnly((v) => !v)} />
          </div>
        </section>
      </div>

      <section className="panel p-5 md:p-6 mt-6">
        <h2 className="text-h3 mb-4 inline-flex items-center gap-2 text-red-300">
          <Siren className="w-4 h-4 text-red-400" />
          Safety Actions
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-200">Sign out from this dashboard</p>
            <p className="text-xs text-neutral-500 mt-1">Use this when ending a shared workstation session.</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-[13px] font-medium text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </section>

      <div className="mt-6 flex justify-end">
        <button className="inline-flex items-center gap-2 rounded-lg border border-primary-700/40 bg-primary-900/30 px-4 py-2 text-sm text-primary-300 hover:bg-primary-900/45 transition-colors">
          <Save className="w-4 h-4" />
          Save Preferences
        </button>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  enabled,
  onToggle,
}: {
  label: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2.5 flex items-center justify-between">
      <span className="text-sm text-neutral-300">{label}</span>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={enabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? "bg-primary-600" : "bg-neutral-700"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  )
}
