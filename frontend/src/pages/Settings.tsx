import { useEffect, useState } from "react"
import { Bell, ShieldCheck, Siren, Save, Check, Loader2 } from "lucide-react"
import { api, logout, type ClinicSettings } from "../lib/api"
import { EcgLoader } from "../components/ui/EcgLoader"

export function Settings() {
  const [settings, setSettings] = useState<ClinicSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load settings from API
  useEffect(() => {
    api.getSettings()
      .then((data) => {
        setSettings(data)
        setLoading(false)
      })
      .catch(() => {
        // Fallback to defaults if API not available yet
        setSettings({
          clinic_name: "",
          oncall_number: "",
          escalation_sla: "20 seconds",
          sms_alerts: true,
          email_digest: true,
          critical_only: false,
        })
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await api.updateSettings(settings)
      setSettings(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof ClinicSettings, value: string | boolean) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
    setSaved(false)
  }

  if (loading) return <EcgLoader className="min-h-[60vh]" />

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
                value={settings?.clinic_name ?? ""}
                onChange={(e) => updateField("clinic_name", e.target.value)}
                placeholder="Enter your clinic name"
                className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </label>
            <label className="block">
              <span className="text-[13px] text-neutral-400">On-call / Escalation Number</span>
              <input
                value={settings?.oncall_number ?? ""}
                onChange={(e) => updateField("oncall_number", e.target.value)}
                placeholder="+1 (XXX) XXX-XXXX"
                className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
              <span className="text-[11px] text-neutral-600 mt-1 block">
                This is the number L1/L2 escalations are transferred to.
              </span>
            </label>
            <label className="block">
              <span className="text-[13px] text-neutral-400">Escalation SLA</span>
              <input
                value={settings?.escalation_sla ?? ""}
                onChange={(e) => updateField("escalation_sla", e.target.value)}
                placeholder="e.g. 20 seconds"
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
            <ToggleRow
              label="SMS alert for escalated calls"
              enabled={settings?.sms_alerts ?? true}
              onToggle={() => updateField("sms_alerts", !(settings?.sms_alerts ?? true))}
            />
            <ToggleRow
              label="6-hour email digest"
              enabled={settings?.email_digest ?? true}
              onToggle={() => updateField("email_digest", !(settings?.email_digest ?? true))}
            />
            <ToggleRow
              label="Send only L1/L2 alerts to nurse lead"
              enabled={settings?.critical_only ?? false}
              onToggle={() => updateField("critical_only", !(settings?.critical_only ?? false))}
            />
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

      {/* Save bar */}
      <div className="mt-6 flex items-center justify-end gap-3">
        {error && (
          <span className="text-[13px] text-red-400">{error}</span>
        )}
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-status-live font-medium animate-fade-in">
            <Check className="w-4 h-4" />
            Settings saved successfully
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg border border-primary-700/40 bg-primary-900/30 px-5 py-2.5 text-sm font-medium text-primary-300 hover:bg-primary-900/45 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save Preferences"}
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
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-primary-600" : "bg-neutral-700"
          }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : "translate-x-1"
            }`}
        />
      </button>
    </div>
  )
}
