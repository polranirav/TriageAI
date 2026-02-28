# TriageAI — API Reference

## Base URL

- **Development:** `http://localhost:8000`
- **Production:** `https://api.triageai.ca`

## Authentication

| Endpoint Type | Auth Method | Header |
|:-------------|:------------|:-------|
| Voice webhooks | Twilio Signature | `X-Twilio-Signature` |
| Admin API | Supabase JWT | `Authorization: Bearer <token>` |
| Health check | None | — |

## Endpoints

### `GET /health`

```
Response 200:
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

### `POST /v1/voice`

Twilio inbound call webhook. Returns TwiML to start Media Stream.

| Param | Source | Required |
|:------|:-------|:---------|
| `CallSid` | Twilio POST body | Yes |
| `From` | Twilio POST body | Yes (not stored) |
| `To` | Twilio POST body | Yes |
| `X-Twilio-Signature` | Header | Yes |

```xml
Response 200 (text/xml):
<Response>
  <Connect>
    <Stream url="wss://api.triageai.ca/v1/media-stream" />
  </Connect>
</Response>
```

| Error | Status | When |
|:------|:-------|:-----|
| `INVALID_TWILIO_SIGNATURE` | 403 | Missing/wrong signature |
| `RATE_LIMIT_EXCEEDED` | 429 | > 20 req/min |

**Rate limit:** 20 requests/minute per IP

---

### `WS /v1/media-stream`

Twilio Media Stream WebSocket — bidirectional audio bridge.

**Inbound events from Twilio:**
```json
{"event": "start", "start": {"callSid": "CAxxx"}}
{"event": "media", "media": {"payload": "<base64 μ-law>"}}
{"event": "stop"}
```

**No HTTP response — WebSocket-only.**

---

### `POST /v1/escalate`

Emergency warm transfer via Twilio Participants API.

```json
Request:
{
  "call_sid": "CA3f7a2btest001",
  "ctas_level": 1
}

Response 200:
{
  "status": "escalated",
  "call_sid": "CA3f7a2btest001"
}
```

| Error | Status | When |
|:------|:-------|:-----|
| `TRIAGE_SESSION_NOT_FOUND` | 404 | call_sid not in DB |
| `ESCALATION_FAILED` | 503 | Twilio API error |
| `RATE_LIMIT_EXCEEDED` | 429 | > 5 req/min |

**Rate limit:** 5 requests/minute (prevent escalation spam)
**SLA:** Must respond in < 500ms (emergency path)

---

### `GET /v1/admin/analytics/summary`

Dashboard stat cards — total calls, escalation rate, avg duration, non-emergency %.

```
Headers: Authorization: Bearer <JWT>
Query: ?start_date=2026-03-01&end_date=2026-03-31

Response 200:
{
  "total_calls": 87,
  "escalation_rate": 0.16,
  "avg_duration_sec": 187,
  "non_emergency_pct": 0.72,
  "period": {"start": "2026-03-01", "end": "2026-03-31"}
}
```

---

### `GET /v1/admin/analytics/ctas-distribution`

CTAS donut chart data.

```
Response 200:
{
  "distribution": [
    {"level": 1, "count": 3, "percentage": 0.03},
    {"level": 2, "count": 11, "percentage": 0.13},
    {"level": 3, "count": 18, "percentage": 0.21},
    {"level": 4, "count": 27, "percentage": 0.31},
    {"level": 5, "count": 28, "percentage": 0.32}
  ]
}
```

---

### `GET /v1/admin/sessions`

Paginated session list with filters.

```
Query: ?page=1&per_page=20&ctas_level=1&date_start=2026-03-01

Response 200:
{
  "sessions": [
    {
      "id": "uuid",
      "call_sid": "CA3f7a2b...",
      "ctas_level": 3,
      "routing_action": "er_urgent",
      "duration_sec": 187,
      "escalated": false,
      "questions_completed": 5,
      "started_at": "2026-03-01T14:30:00Z"
    }
  ],
  "total": 87,
  "page": 1,
  "per_page": 20
}
```

---

### `GET /v1/admin/session/{call_sid}`

Session detail with system events timeline.

```
Response 200:
{
  "session": { ... },
  "events": [
    {"event_type": "call_started", "created_at": "...", "metadata": {}},
    {"event_type": "triage_started", "created_at": "...", "metadata": {}},
    {"event_type": "ctas_classified", "created_at": "...", "metadata": {"ctas_level": 3}}
  ]
}
```

| Error | Status | When |
|:------|:-------|:-----|
| `TRIAGE_SESSION_NOT_FOUND` | 404 | call_sid doesn't exist |
| `FORBIDDEN` | 403 | Session belongs to another clinic |

## Standard Error Response

```json
{
  "error": {
    "code": "TRIAGE_SESSION_NOT_FOUND",
    "message": "No session found for call_sid: CA3f7a2b...",
    "status": 404,
    "details": {}
  }
}
```
