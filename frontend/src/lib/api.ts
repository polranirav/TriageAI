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

// ── API functions ────────────────────────────────────────────────────────────

export const api = {
  // Health
  health: () => apiFetch<{ status: string }>("/health"),

  // Analytics
  analyticsSummary: (days = 30) =>
    apiFetch<AnalyticsSummary>(`/v1/admin/analytics/summary?days=${days}`),

  ctasDistribution: (days = 30) =>
    apiFetch<{ distribution: CTASDistributionItem[] }>(
      `/v1/admin/analytics/ctas-distribution?days=${days}`
    ),

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
}
