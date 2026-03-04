/**
 * TriageAI API client — all backend API calls go through here.
 *
 * Handles authentication, error formatting, and base URL configuration.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

// Token storage
let authToken: string | null = localStorage.getItem("triageai_token")

export function setAuthToken(token: string | null) {
  authToken = token
  if (token) {
    localStorage.setItem("triageai_token", token)
  } else {
    localStorage.removeItem("triageai_token")
  }
}

export function getAuthToken(): string | null {
  return authToken
}

export function isAuthenticated(): boolean {
  return authToken !== null
}

export function logout() {
  setAuthToken(null)
  window.location.href = "/login"
}

// ── HTTP helpers ─────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  }

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    logout()
    throw new Error("Session expired. Please log in again.")
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message || `API error: ${res.status}`)
  }

  return res.json() as Promise<T>
}

/** Download a file from an authenticated endpoint — triggers browser save dialog. */
async function apiDownload(path: string, filename: string): Promise<void> {
  const headers: Record<string, string> = {}
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`

  const res = await fetch(`${API_BASE}${path}`, { headers })

  if (res.status === 401) {
    logout()
    throw new Error("Session expired. Please log in again.")
  }
  if (!res.ok) throw new Error(`Export failed: ${res.status}`)

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  total_calls: number
  escalation_rate: number
  avg_duration_sec: number | null
  non_emergency_pct: number
  period_start: string
  period_end: string
}

export interface CTASDistributionItem {
  level: number
  count: number
  percentage: number
}

export interface SessionSummary {
  id: string
  call_sid: string
  ctas_level: number | null
  routing_action: string | null
  duration_sec: number | null
  escalated: boolean
  questions_completed: number
  started_at: string
}

export interface SessionListResponse {
  sessions: SessionSummary[]
  total: number
  page: number
  per_page: number
}

export interface EventItem {
  event_type: string
  created_at: string
  metadata: Record<string, unknown>
}

export interface SessionDetail {
  session: SessionSummary
  events: EventItem[]
}

export interface TodayStats {
  total_calls: number
  escalations: number
  active_count: number
  avg_duration_sec: number | null
}

export interface LiveDashboardData {
  active_calls: SessionSummary[]
  recent_sessions: SessionSummary[]
  today_stats: TodayStats
}

export interface WeeklyTrendItem {
  week: string
  total: number
  l1: number
  l2: number
  l3: number
  l4: number
  l5: number
}

export interface DailyItem {
  date: string
  total: number
  l1: number
  l2: number
  l3: number
  l4: number
  l5: number
}

export interface RoutingBreakdownItem {
  action: string
  count: number
  percentage: number
}

// ── API functions ────────────────────────────────────────────────────────────

export const api = {
  // Health
  health: () => apiFetch<{ status: string }>("/health"),

  // Analytics — summary & CTAS distribution
  analyticsSummary: (days = 30) =>
    apiFetch<AnalyticsSummary>(`/v1/admin/analytics/summary?days=${days}`),

  ctasDistribution: (days = 30) =>
    apiFetch<{ distribution: CTASDistributionItem[] }>(
      `/v1/admin/analytics/ctas-distribution?days=${days}`
    ),

  // Analytics — extended charts
  analyticsWeeklyTrend: (weeks = 12) =>
    apiFetch<{ trend: WeeklyTrendItem[] }>(
      `/v1/admin/analytics/weekly-trend?weeks=${weeks}`
    ),

  analyticsDaily: (days = 14) =>
    apiFetch<{ daily: DailyItem[] }>(`/v1/admin/analytics/daily?days=${days}`),

  analyticsRoutingBreakdown: (days = 30) =>
    apiFetch<{ routing: RoutingBreakdownItem[] }>(
      `/v1/admin/analytics/routing-breakdown?days=${days}`
    ),

  analyticsHeatmap: (days = 30) =>
    apiFetch<{ heatmap: number[][] }>(`/v1/admin/analytics/heatmap?days=${days}`),

  // Sessions
  listSessions: (params: {
    page?: number
    per_page?: number
    ctas_level?: number
    escalated?: boolean
  } = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set("page", String(params.page))
    if (params.per_page) query.set("per_page", String(params.per_page))
    if (params.ctas_level) query.set("ctas_level", String(params.ctas_level))
    if (params.escalated !== undefined) query.set("escalated", String(params.escalated))
    return apiFetch<SessionListResponse>(`/v1/admin/sessions?${query}`)
  },

  sessionDetail: (callSid: string) =>
    apiFetch<SessionDetail>(`/v1/admin/sessions/${callSid}`),

  // Export
  exportSessionsCSV: (days = 30) =>
    apiDownload(
      `/v1/admin/export/sessions.csv?days=${days}`,
      `triageai-sessions-${days}d.csv`
    ),

  // Live monitor
  liveData: () =>
    apiFetch<LiveDashboardData>("/v1/admin/live"),

  // Settings
  getSettings: () =>
    apiFetch<ClinicSettings>(`/v1/admin/settings`),

  updateSettings: (data: ClinicSettings) =>
    apiFetch<ClinicSettings>(`/v1/admin/settings`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
}

export interface ClinicSettings {
  clinic_name: string
  oncall_number: string
  escalation_sla: string
  sms_alerts: boolean
  email_digest: boolean
  critical_only: boolean
}
