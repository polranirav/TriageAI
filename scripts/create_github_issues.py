#!/usr/bin/env python3
"""
Create all TriageAI GitHub issues via the GitHub REST API.

Usage:
    GITHUB_TOKEN=ghp_xxx python3 scripts/create_github_issues.py

The token needs 'repo' scope.
Get one at: https://github.com/settings/tokens/new
"""

import json
import os
import sys
import time
import urllib.request

REPO = "polranirav/TriageAI"
API_BASE = "https://api.github.com"

ISSUES = [
    # ── CRITICAL ─────────────────────────────────────────────────────────────
    {
        "title": "[Bug] Call duration_sec is never populated — dashboard always shows null",
        "labels": ["bug", "high-priority"],
        "body": """## Summary
`complete_session()` in `session_logger.py` never calculates or writes `duration_sec` to the database.
The column exists in `TriageSessionModel` (line 32) but is always `NULL`.

## Impact
- Overview dashboard "Avg Call Duration" shows `null` for every call
- Clinic admins have no visibility into call length
- Analytics endpoint `avg_duration_sec` always returns `null`

## Files
- `backend/app/logging/session_logger.py`
- `backend/app/models/triage_session.py:32`
- `backend/app/admin/router.py` (analytics_summary)

## Fix
Capture a start timestamp in `TriageSession` state machine and compute delta in `complete_session()`.
Store the result in `TriageSessionModel.duration_sec`.
""",
    },
    {
        "title": "[Bug] audioop deprecated in Python 3.11, removed in Python 3.13 — will break audio pipeline",
        "labels": ["bug", "high-priority", "technical-debt"],
        "body": """## Summary
`backend/app/voice/audio_utils.py` uses `audioop` for μ-law ↔ PCM16 conversion.
`audioop` is deprecated in Python 3.11 and **removed in Python 3.13**.

## Impact
- System will break with Python 3.13 upgrade (cannot be installed at all)
- No migration path currently planned

## Files
- `backend/app/voice/audio_utils.py:10` — `import audioop`

## Fix
Replace `audioop.ulaw2lin` / `audioop.lin2ulaw` / `audioop.ratecv` with:
- `scipy.signal.resample` or `librosa` for resampling
- Custom μ-law codec (small, no dependencies)
Add `scipy` or a dedicated audio library to `pyproject.toml`.
""",
    },
    {
        "title": "[Compliance] No data retention policy — triage sessions accumulate indefinitely (PIPEDA violation)",
        "labels": ["compliance", "high-priority", "security"],
        "body": """## Summary
The database has no automated data retention or deletion policy. Old triage sessions accumulate forever.
PIPEDA (and PHIPA) require data to be deleted when no longer needed.

## Impact
- PIPEDA/PHIPA compliance violation
- Ongoing privacy risk: call metadata retained longer than necessary
- Database growth without bound

## Fix
1. Add `DATA_RETENTION_DAYS` env var (default: 90)
2. Add a scheduled cleanup job (cron or Celery) that deletes sessions older than `DATA_RETENTION_DAYS`
3. Document retention policy in `RUNBOOK.md` and privacy notice
""",
    },
    {
        "title": "[Compliance] No PIPEDA consent event logged — implied consent not auditable",
        "labels": ["compliance", "medium-priority"],
        "body": """## Summary
The AI greets callers with a PIPEDA consent disclosure, but there is no structured log entry confirming
the caller heard it and continued (implied consent). If challenged legally, consent cannot be proven.

## Files
- `backend/app/triage/prompts.py` — consent text in opening
- `backend/app/logging/session_logger.py` — no consent event

## Fix
When the first audio chunk from the caller arrives after the consent disclosure,
log a `consent_implied` system event with timestamp and `call_sid`.
This creates an auditable record that consent was given by continuing the call.
""",
    },
    {
        "title": "[Security] Supabase direct DB host is IPv6-only — Docker containers fail to connect",
        "labels": ["bug", "infrastructure", "high-priority"],
        "body": """## Summary
The Supabase direct connection host `db.[ref].supabase.co` resolves to IPv6 only.
Docker containers on EC2 have no IPv6 routing, causing `[Errno 99] Cannot assign requested address`.

## Current Workaround
Using transaction pooler `aws-0-us-west-2.pooler.supabase.com:6543` with `statement_cache_size=0`.

## Risk
- If the pooler URL changes, the DB connection silently breaks
- Transaction pooler adds latency vs session pooler
- `statement_cache_size=0` disables prepared statement caching (performance impact)

## Fix
1. Document the pooler requirement in `RUNBOOK.md`
2. Add health check that verifies DB connectivity on startup
3. Consider switching to session pooler (port 5432) if prepared statements are needed
4. Add `SUPABASE_POOLER_URL` as a dedicated env var separate from `DATABASE_URL`
""",
    },
    {
        "title": "[Security] OpenAI WebSocket errors are silently ignored — triage may continue on failures",
        "labels": ["bug", "security", "medium-priority"],
        "body": """## Summary
In `media_bridge.py`, when OpenAI sends an `error` event, the code only logs a warning and continues the call.
The triage session proceeds as if the AI is functioning correctly.

## Files
- `backend/app/voice/media_bridge.py:231-233`

```python
elif event_type == "error":
    err = data.get("error", {})
    log.warning("openai_error", ...)  # call continues!
```

## Impact
- Silent failures: caller may receive no routing guidance
- Hard to detect in production logs (warning vs error)
- CTAS classification may not happen but the call appears successful

## Fix
On `openai_error` events with critical `error_type` (e.g. `server_error`, `rate_limit_exceeded`),
mark the session as failed and close the WebSocket gracefully.
For recoverable errors, continue but log at `error` level.
""",
    },
    {
        "title": "[Security] Admin API has no rate limiting — vulnerable to DoS via analytics queries",
        "labels": ["security", "medium-priority"],
        "body": """## Summary
Admin endpoints (`/v1/admin/analytics/*`, `/v1/admin/sessions`) have no rate limiting.
An attacker with a valid JWT can flood the DB with expensive analytics queries.

## Files
- `backend/app/admin/router.py` — no `@limiter.limit()` decorators

## Fix
Add rate limiting to all admin endpoints:
```python
@router.get("/analytics/summary")
@limiter.limit("60/minute")
async def analytics_summary(...):
```
Use the existing `limiter` instance from `app.main`.
""",
    },
    {
        "title": "[Security] No audit log for admin data access — PIPEDA requirement",
        "labels": ["compliance", "security", "medium-priority"],
        "body": """## Summary
When admins view session details or analytics, there's no audit trail of who accessed what data and when.
PIPEDA requires organizations to log access to personal health-adjacent data.

## Files
- `backend/app/admin/router.py` — no audit logging on any endpoint

## Fix
1. Create `audit_log` table (or use `system_events` with `event_type=admin_access`)
2. After each admin request, log: `{user_id, endpoint, call_sid (if applicable), timestamp}`
3. Log via the existing `log_event()` in `session_logger.py`
""",
    },
    {
        "title": "[Bug] Frontend Sessions and Overview pages show hardcoded mock data, not real API",
        "labels": ["bug", "frontend", "high-priority"],
        "body": """## Summary
Both `Sessions.tsx` and `Overview.tsx` display hardcoded mock data instead of calling the backend API.
Clinic admins see fake numbers and fake sessions regardless of actual call volume.

## Files
- `frontend/src/pages/Sessions.tsx` — hardcoded session array
- `frontend/src/pages/Overview.tsx` — hardcoded CTAS distribution, trend data, recent calls

## Fix
Replace mock data with `useEffect` API calls:
```tsx
useEffect(() => {
  api.listSessions().then(setData).catch(setError)
  api.analyticsSummary().then(setStats).catch(setError)
}, [])
```

Add loading skeleton and error states.
""",
    },
    {
        "title": "[Bug] datetime.utcnow() deprecated in Python 3.12, breaks in 3.13",
        "labels": ["bug", "technical-debt"],
        "body": """## Summary
`datetime.utcnow()` is deprecated in Python 3.12 and removed in Python 3.13.
Used in multiple places across the admin router and potentially other modules.

## Files
- `backend/app/admin/router.py:86` — `datetime.utcnow()`

## Fix
Replace all `datetime.utcnow()` with `datetime.now(timezone.utc)`:
```python
from datetime import datetime, timezone
since = datetime.now(timezone.utc) - timedelta(days=days)
```
""",
    },
    {
        "title": "[Feature] Connect frontend Analytics page to real backend data",
        "labels": ["enhancement", "frontend", "medium-priority"],
        "body": """## Summary
The Analytics page (`Analytics.tsx`) uses hardcoded or stub data.
The backend `/v1/admin/analytics/summary` and `/v1/admin/analytics/ctas-distribution` endpoints
already exist and return real data.

## Fix
Wire up the Analytics page to the backend:
- Fetch CTAS distribution for the donut chart
- Fetch summary stats (total calls, escalation rate, non-emergency %)
- Show loading/error states
- Add time period selector (7/30/90 days) that maps to the `?days=` query param
""",
    },
    {
        "title": "[Feature] Implement call duration tracking in session lifecycle",
        "labels": ["enhancement", "high-priority"],
        "body": """## Summary
Triage sessions have a `duration_sec` column that is never populated.
Duration is critical for clinic billing, capacity planning, and quality monitoring.

## Implementation
1. Store `started_at` timestamp in `TriageSession` state machine when `start` event received
2. In `_finalize_session()`, compute `duration = now() - started_at`
3. Pass `duration_sec=int(duration.total_seconds())` to `complete_session()`
4. `complete_session()` writes it to `TriageSessionModel.duration_sec`

## Impact
- Overview dashboard "Avg Call Duration" shows real data
- Clinic admins can identify unusually long/short calls
- Cost analysis possible (longer calls = more OpenAI spend)
""",
    },
    {
        "title": "[Feature] Improve health endpoint to check external dependency connectivity",
        "labels": ["enhancement", "infrastructure", "medium-priority"],
        "body": """## Summary
`GET /health` returns `{"status": "ok"}` even if the database is unreachable or OpenAI credentials are invalid.
Docker and monitoring tools (UptimeRobot) report the service as healthy when it's actually broken.

## Fix
Add a deep health check:
```python
@app.get("/health/deep")
async def deep_health(db: AsyncSession = Depends(get_session)):
    try:
        await db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "ok" if db_ok else "degraded",
        "database": "ok" if db_ok else "unreachable",
    }
```

Keep `GET /health` fast (no DB) for load balancer checks.
Add `GET /health/deep` for monitoring systems.
""",
    },
    {
        "title": "[Feature] Add request correlation ID to all structured logs",
        "labels": ["enhancement", "observability", "medium-priority"],
        "body": """## Summary
Production logs have no correlation ID linking all log entries from the same HTTP request or WebSocket call.
Debugging multi-step failures (voice → triage → DB write) requires manual log correlation by `call_sid`,
which isn't available until the Twilio `start` event arrives.

## Fix
Add middleware that injects a UUID `request_id` into structlog context for every request:
```python
class CorrelationIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request_id = str(uuid.uuid4())
        with structlog.contextvars.bound_contextvars(request_id=request_id):
            response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
```
""",
    },
    {
        "title": "[Feature] Implement data export for clinic admins (CSV download)",
        "labels": ["enhancement", "frontend", "low-priority"],
        "body": """## Summary
Clinic admins have no way to export triage session data for offline analysis or reporting.
A CSV export of sessions (call_sid, ctas_level, routing_action, duration_sec, timestamp) would
be useful for monthly CHC reporting.

## Fix
1. Add `GET /v1/admin/sessions/export?format=csv&days=30` backend endpoint
2. Return `text/csv` response with sessions in the given period
3. Add "Download CSV" button on the Sessions page in the frontend
4. Ensure no PII is included in the export (call_sid is pseudonymous, not PII)
""",
    },
    {
        "title": "[Feature] Add \"Forgot Password\" backend endpoint for admin accounts",
        "labels": ["enhancement", "frontend", "low-priority"],
        "body": """## Summary
The Login page has a "Forgot password?" link that goes to `href="#"` (does nothing).
Clinic admins who forget their password cannot recover access without direct EC2 access to reset env vars.

## Fix
1. Add `POST /v1/admin/auth/reset-request` endpoint that accepts `{email}`
2. If email matches `ADMIN_EMAIL`, send a reset link via email (or log a temporary token)
3. Add `POST /v1/admin/auth/reset` endpoint to set a new password
4. For MVP: simply update the Login.tsx link to show a message: "Contact your TriageAI administrator to reset your password"
""",
    },
    {
        "title": "[Feature] Frontend needs React ErrorBoundary to prevent white-screen crashes",
        "labels": ["enhancement", "frontend", "medium-priority"],
        "body": """## Summary
The React app has no `ErrorBoundary` component. If any component throws an unhandled error during rendering,
the entire page goes blank with no error message.

## Files
- `frontend/src/App.tsx` — no ErrorBoundary wrapping

## Fix
Add an ErrorBoundary around the main Routes:
```tsx
import { ErrorBoundary } from 'react-error-boundary'

<ErrorBoundary fallback={<ErrorPage />}>
  <Routes>...</Routes>
</ErrorBoundary>
```

Or use the `react-error-boundary` package.
Create a user-friendly `ErrorPage` component that shows "Something went wrong. Please refresh."
""",
    },
    {
        "title": "[Feature] Add loading states and error handling to all frontend API calls",
        "labels": ["enhancement", "frontend", "medium-priority"],
        "body": """## Summary
Frontend pages that call the API have no loading state, skeleton screens, or error messages.
Users see nothing while data loads and no feedback when API calls fail (e.g., 401, 503).

## Fix
1. Create a `useApi<T>()` custom hook that returns `{data, loading, error}`
2. Show skeleton loaders while `loading=true`
3. Show an inline error banner when `error` is set
4. Handle 401 responses globally by redirecting to `/login` (session expired)

Example:
```tsx
const { data: sessions, loading, error } = useApi(() => api.listSessions())
if (loading) return <SessionsSkeleton />
if (error) return <ErrorBanner message={error.message} />
```
""",
    },
    {
        "title": "[DevOps] Deploy.yml auto-deploy to EC2 not configured with GitHub Secrets",
        "labels": ["infrastructure", "high-priority"],
        "body": """## Summary
`deploy.yml` workflow requires these GitHub Secrets to deploy to EC2:
- `EC2_HOST` — `3.98.109.224`
- `EC2_USER` — `ec2-user`
- `EC2_SSH_KEY` — contents of `~/.ssh/triageai.pem`
- `ENV_FILE` — contents of `/srv/triageai/.env`

These secrets have not been added to the repository settings.
Every push to `main` currently triggers a CI build but the deploy step fails/skips.

## Fix
1. Go to: https://github.com/polranirav/TriageAI/settings/secrets/actions
2. Add the 4 secrets listed above
3. Verify the next push triggers a successful deployment
""",
    },
    {
        "title": "[DevOps] Rotate exposed AWS access key AKIAWXYWUBCTGS3K3EFS immediately",
        "labels": ["security", "high-priority", "infrastructure"],
        "body": """## Summary
AWS access key `AKIAWXYWUBCTGS3K3EFS` was exposed in a chat session and should be considered compromised.

## Immediate Action Required
1. Go to AWS IAM Console → Users → polranirav → Security credentials
2. **Deactivate** `AKIAWXYWUBCTGS3K3EFS` immediately
3. Create a new access key
4. Update the key on EC2: `sudo sed -i 's/AKIAWXYWUBCTGS3K3EFS/NEW_KEY_ID/' /srv/triageai/.env`
5. Update `AWS_SECRET_ACCESS_KEY` in `.env` as well
6. Verify CloudWatch / EC2 still works after rotation

## Note
If any unauthorized usage is detected in CloudTrail logs, consider rotating Twilio and OpenAI credentials too.
""",
    },
    {
        "title": "[DevOps] Twilio trial account shows \"press any key\" prompt — breaks real user experience",
        "labels": ["infrastructure", "high-priority"],
        "body": """## Summary
Twilio trial accounts add a mandatory "Press any key to accept this call" prompt before connecting.
Real users (Ontario patients) will be confused and may hang up thinking it's a spam call.

## Fix
1. Upgrade the Twilio account at: https://console.twilio.com → Upgrade Account
2. Remove trial account restrictions
3. After upgrade: test that calls connect directly without the prompt
4. Consider adding a brief branded intro: "Thank you for calling TriageAI."

## Cost Estimate
Twilio Pay-as-you-go: ~$0.0085/min for incoming calls (negligible vs OpenAI cost).
""",
    },
    {
        "title": "[DevOps] git broken locally due to unaccepted Xcode license — blocks commits",
        "labels": ["infrastructure", "medium-priority"],
        "body": """## Summary
Local git is failing with "You have not agreed to the Xcode license agreements."
All recent changes have been deployed via `scp` directly to EC2 instead of `git push`.
This means the GitHub repo is **behind** the production EC2 deployment.

## Files Behind on GitHub
- `backend/app/admin/router.py` — new `auth_router` / `POST /v1/admin/login`
- `backend/app/main.py` — registers `admin_auth_router`
- `backend/app/config.py` — `ADMIN_EMAIL`, `ADMIN_PASSWORD` settings
- `backend/app/triage/prompts.py` — rewritten triage prompt
- `backend/app/voice/media_bridge.py` — switched to `gpt-4o-mini-realtime-preview`
- `backend/pyproject.toml` — added `PyJWT>=2.8.0`
- `frontend/src/pages/Login.tsx` — calls `/v1/admin/login` instead of Supabase

## Fix
Run in Terminal:
```bash
sudo xcodebuild -license accept
cd "/Users/niravpolara/Desktop/My Resume/01 Software Developer/Ai/TriageAI"
git add -A && git commit -m "Fix dashboard login, reduce AI cost 10x, improve triage prompt"
git push
```
""",
    },
    {
        "title": "[Security] Admin ADMIN_PASSWORD stored as plaintext in EC2 .env — should be hashed",
        "labels": ["security", "medium-priority"],
        "body": """## Summary
`ADMIN_PASSWORD` in `.env` is stored and compared as plaintext in `admin_login()`.
If the `.env` file is read by an attacker, the password is immediately usable.

## Files
- `backend/app/admin/router.py` — `body.password != settings.ADMIN_PASSWORD`
- `/srv/triageai/.env` on EC2 — plaintext password

## Fix
Store a bcrypt hash of the password in `ADMIN_PASSWORD_HASH` instead:
```python
import bcrypt
if not bcrypt.checkpw(body.password.encode(), settings.ADMIN_PASSWORD_HASH.encode()):
    raise TriageAIError(...)
```
Generate the hash with: `python3 -c "import bcrypt; print(bcrypt.hashpw(b'password', bcrypt.gensalt()).decode())"`

Add `bcrypt>=4.0` to `pyproject.toml`.
""",
    },
    {
        "title": "[Feature] Add comprehensive catch-all exception handler to FastAPI app",
        "labels": ["enhancement", "medium-priority"],
        "body": """## Summary
FastAPI only has handlers for `TriageAIError` and `RateLimitExceeded`.
Any other unhandled exception returns a 500 with Python's default error format (leaks stack traces in dev).

## Files
- `backend/app/main.py`

## Fix
Add a generic exception handler:
```python
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("unhandled_exception", error=str(exc), path=str(request.url))
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred.", "status": 500, "details": {}}},
    )
```
""",
    },
    {
        "title": "[Feature] Add database connection pool configuration for production load",
        "labels": ["enhancement", "performance", "low-priority"],
        "body": """## Summary
`create_async_engine()` uses default pool settings. Under load, connections may be exhausted.
No visibility into pool status. No explicit pool sizing for production EC2 instance size.

## Files
- `backend/app/database.py:15-20`

## Fix
```python
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
    pool_pre_ping=True,
    pool_size=5,          # max persistent connections
    max_overflow=10,      # additional connections under load
    pool_timeout=30,      # wait 30s before raising error
    connect_args=_connect_args,
)
```

Note: For Supabase transaction pooler, keep pool_size low since each connection is a pooler connection.
""",
    },
    {
        "title": "[Feature] Add CTAS level summary to Twilio call completion webhook",
        "labels": ["enhancement", "low-priority"],
        "body": """## Summary
After a triage call completes, there is no mechanism to notify the clinic system with the CTAS outcome.
A POST webhook to a configurable URL would allow clinic EMR systems to receive real-time triage results.

## Fix
1. Add `CLINIC_WEBHOOK_URL` env var (optional)
2. After `_finalize_session()` completes with a `ctas_level`, POST the outcome to `CLINIC_WEBHOOK_URL`
3. Payload: `{call_sid, ctas_level, routing_action, questions_completed, timestamp}`
4. Include HMAC signature for security

This enables CHC integration without building a full API integration.
""",
    },
    {
        "title": "[Feature] Add session search and filtering to Sessions page",
        "labels": ["enhancement", "frontend", "low-priority"],
        "body": """## Summary
The Sessions page lists all sessions but has no search or filter functionality.
Clinic admins cannot quickly find sessions by CTAS level, date range, or escalation status.

## Backend
`GET /v1/admin/sessions` already supports `?ctas_level=` and `?escalated=` query params.
Date range filtering needs to be added.

## Frontend Fix
1. Add filter bar with: CTAS Level dropdown, Escalated toggle, Date range picker
2. Connect to existing backend `?ctas_level=&escalated=&days=` query params
3. Add search by partial `call_sid`
4. Add pagination controls (the backend already supports `page` + `per_page`)
""",
    },
    {
        "title": "[Feature] Multilingual support — remove dead code or implement (FF_MULTILINGUAL)",
        "labels": ["enhancement", "low-priority", "technical-debt"],
        "body": """## Summary
`FF_MULTILINGUAL = False` feature flag exists but the feature is never referenced in code.
The `language_detected` column in `TriageSessionModel` always defaults to `'en'` and is never written.

## Files
- `backend/app/config.py:38` — `FF_MULTILINGUAL: bool = False`
- `backend/app/models/triage_session.py:42` — `language_detected = Column(..., default='en')`

## Options
**Option A (MVP):** Remove `language_detected` column and `FF_MULTILINGUAL` flag to reduce dead code.
Add a migration to drop the column.

**Option B (V2):** Implement multilingual detection using OpenAI's language detection capability.
Serve French triage questions for Quebec callers.
""",
    },
    {
        "title": "[Feature] Add graceful shutdown to close active WebSocket connections on deploy",
        "labels": ["enhancement", "reliability", "low-priority"],
        "body": """## Summary
When the API container is restarted during deployment, any active triage calls are abruptly terminated.
The WebSocket connections are not closed cleanly, and Twilio may show the call as failed.

## Files
- `backend/app/main.py` — lifespan context manager shutdown block

## Fix
Track all active WebSocket sessions in a global registry.
On shutdown signal, close all WebSocket connections gracefully with a 503 response to Twilio.
Use `asyncio.shield()` to give active calls a grace period before hard shutdown.
""",
    },
    {
        "title": "[Feature] Secrets rotation runbook — document process for all production credentials",
        "labels": ["documentation", "security", "medium-priority"],
        "body": """## Summary
`RUNBOOK.md` documents rollback and incident response but has no procedure for rotating secrets.
If `OPENAI_API_KEY`, `TWILIO_AUTH_TOKEN`, or `SECRET_KEY` is compromised, operators don't know the steps.

## Fix
Add a "Secrets Rotation" section to `RUNBOOK.md` with step-by-step instructions for:
1. `OPENAI_API_KEY` — create new key, update `.env` on EC2, restart `api` container, verify calls work
2. `TWILIO_AUTH_TOKEN` — update token in Twilio console, update `.env`, restart container
3. `SECRET_KEY` — generate new 64-char key, update `.env`, restart container (all admin sessions invalidated)
4. `ADMIN_PASSWORD` — bcrypt new password, update `.env`, restart container
5. `DATABASE_URL` — update Supabase password, update `.env`, verify connectivity
""",
    },
    {
        "title": "[Testing] Add integration test for warm transfer failure path",
        "labels": ["testing", "medium-priority"],
        "body": """## Summary
When `warm_transfer()` fails on L1/L2 escalation, the exception is silently caught and the call continues.
There is no test verifying that:
1. The session is still written to the DB with `escalated=False` when transfer fails
2. The error is logged correctly
3. The call audio continues (caller is not dropped)

## Files
- `backend/app/voice/media_bridge.py:274-280`
- `backend/tests/unit/` — no test for this path

## Fix
Add `test_warm_transfer_failure_still_records_session()` in a new or existing test file:
```python
@patch("app.voice.media_bridge.warm_transfer", side_effect=Exception("Twilio error"))
async def test_warm_transfer_failure_still_records_session(mock_transfer):
    # Simulate triage submission with ctas_level=1
    # Verify session is written with escalated=False
    # Verify error is logged
```
""",
    },
    {
        "title": "[Testing] CI coverage drops below 70% threshold — monitor and maintain",
        "labels": ["testing", "medium-priority"],
        "body": """## Summary
Coverage is at ~73% and falling as new code is added without corresponding tests.
The CI threshold is 70%, leaving little headroom.

## Current uncovered areas (approximate)
- `backend/app/admin/router.py` — login endpoint, analytics with real DB data
- `backend/app/escalation/transfer.py` — Twilio API calls
- `backend/app/voice/media_bridge.py` — WebSocket bridge paths
- `backend/app/routing/__init__.py` — routing messages

## Fix
Add tests for each uncovered module. Target 80% coverage minimum for safety-critical paths.
Add a coverage badge to README.
""",
    },
    {
        "title": "[Testing] Add E2E smoke test that verifies full triage call flow on each deploy",
        "labels": ["testing", "infrastructure", "medium-priority"],
        "body": """## Summary
The deploy.yml smoke test only checks `GET /health`. The full triage flow (voice webhook → WebSocket →
OpenAI → classification → DB write) is never tested automatically after a deploy.

A broken triage flow (e.g., wrong OpenAI model name, DB schema change) would only be detected when
a real patient calls.

## Fix
Add a post-deploy smoke test script that:
1. Calls `POST /v1/voice` with a fake Twilio signature (dev mode bypass)
2. Verifies a session is created in the DB
3. Simulates a `submit_triage` function call with mock answers
4. Verifies the session is completed with the expected CTAS level
5. Fails the deploy if any step fails
""",
    },
    {
        "title": "[Docs] Document all API endpoints in docs/skills/API_REFERENCE.md",
        "labels": ["documentation", "low-priority"],
        "body": """## Summary
`docs/skills/API_REFERENCE.md` does not exist. Integrators and clinic EMR systems have no reference
for TriageAI's API surface.

## Endpoints to document
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /v1/voice | Twilio sig | Inbound call TwiML |
| WS | /v1/media-stream | — | OpenAI audio bridge |
| POST | /v1/escalate | Twilio sig | Warm transfer trigger |
| GET | /v1/triage/health | — | Triage module health |
| POST | /v1/admin/login | — | Get admin JWT |
| GET | /v1/admin/analytics/summary | Bearer | Dashboard stats |
| GET | /v1/admin/analytics/ctas-distribution | Bearer | CTAS donut data |
| GET | /v1/admin/sessions | Bearer | Session list |
| GET | /v1/admin/sessions/{call_sid} | Bearer | Session detail |
| GET | /health | — | App health |
""",
    },
    {
        "title": "[Docs] Add DOMAIN and all production env vars to .env.example",
        "labels": ["documentation", "low-priority"],
        "body": """## Summary
`docker-compose.prod.yml` uses `${DOMAIN}` env var (via Caddyfile), but `DOMAIN` is not in `.env.example`.
Operators deploying fresh instances won't know to set it.

## Missing from .env.example
- `DOMAIN` — public hostname (e.g. `triageai.mooo.com`)
- `ADMIN_EMAIL` — admin dashboard login email ✅ (added)
- `ADMIN_PASSWORD` — admin dashboard login password ✅ (added)

## Fix
Add to `.env.example`:
```
# ─── Deployment ──────────────────────────────────────────────────────────────
# Public domain name — used by Caddyfile for HTTPS and Let's Encrypt
DOMAIN=triageai.mooo.com
```
""",
    },
    {
        "title": "[Feature] Add voice fallback when OpenAI connection fails mid-call",
        "labels": ["enhancement", "reliability", "medium-priority"],
        "body": """## Summary
If the OpenAI connection fails during a call (rate limit, network error, model timeout),
the caller hears silence and then the call drops. There's no fallback to inform the caller.

## Current Behavior
- `_connect_to_openai()` raises `TriageAIError` → WebSocket closes → caller hears dead air
- No TwiML redirect to a human operator or recorded message

## Fix
1. On OpenAI connection failure, use Twilio's `<Redirect>` TwiML to send the call to a fallback number
2. Or play a pre-recorded `fallback.twiml` that tells the caller to call 911 if emergency, or call back
3. Log the failure with Sentry so it triggers an alert
""",
    },
    {
        "title": "[Feature] Implement admin password change endpoint (without requiring env var update)",
        "labels": ["enhancement", "low-priority"],
        "body": """## Summary
Currently, changing the admin password requires SSH access to EC2 to update `.env` and restart the container.
This is impractical for clinic IT staff who manage TriageAI without SSH access.

## Fix
1. Add `POST /v1/admin/auth/change-password` endpoint (requires current password + new password)
2. Store password hash in the database (not env vars) for easier rotation
3. On password change, invalidate existing JWTs (add JWT expiry or use jti claim with blocklist)
""",
    },
]


def create_labels(token: str) -> None:
    """Create labels if they don't exist."""
    labels = [
        {"name": "bug", "color": "d73a4a"},
        {"name": "enhancement", "color": "a2eeef"},
        {"name": "security", "color": "e4e669"},
        {"name": "compliance", "color": "0075ca"},
        {"name": "high-priority", "color": "b60205"},
        {"name": "medium-priority", "color": "e99695"},
        {"name": "low-priority", "color": "c5def5"},
        {"name": "frontend", "color": "bfd4f2"},
        {"name": "infrastructure", "color": "1d76db"},
        {"name": "testing", "color": "0e8a16"},
        {"name": "documentation", "color": "fbca04"},
        {"name": "technical-debt", "color": "e4e669"},
        {"name": "observability", "color": "cc317c"},
        {"name": "performance", "color": "fef2c0"},
        {"name": "reliability", "color": "006b75"},
    ]
    for label in labels:
        data = json.dumps(label).encode()
        req = urllib.request.Request(
            f"{API_BASE}/repos/{REPO}/labels",
            data=data,
            headers={
                "Authorization": f"token {token}",
                "Accept": "application/vnd.github.v3+json",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req) as resp:
                if resp.status == 201:
                    print(f"  ✓ Created label: {label['name']}")
        except urllib.error.HTTPError as e:
            if e.code == 422:
                pass  # Label already exists
            else:
                print(f"  ! Label error ({label['name']}): {e.code}")


def create_issue(token: str, issue: dict, index: int, total: int) -> bool:
    data = json.dumps({
        "title": issue["title"],
        "body": issue["body"],
        "labels": issue.get("labels", []),
    }).encode()
    req = urllib.request.Request(
        f"{API_BASE}/repos/{REPO}/issues",
        data=data,
        headers={
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
            print(f"  [{index}/{total}] ✓ #{result['number']} — {issue['title'][:70]}")
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  [{index}/{total}] ✗ FAILED — {issue['title'][:60]} | {e.code}: {body[:100]}")
        return False


def main() -> None:
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if not token:
        print("ERROR: Set GITHUB_TOKEN environment variable.")
        print("  Create one at: https://github.com/settings/tokens/new")
        print("  Required scope: repo")
        print()
        print("  Usage: GITHUB_TOKEN=ghp_xxx python3 scripts/create_github_issues.py")
        sys.exit(1)

    print(f"Repository: {REPO}")
    print(f"Issues to create: {len(ISSUES)}")
    print()

    print("Step 1/2: Creating labels...")
    create_labels(token)
    print()

    print("Step 2/2: Creating issues...")
    total = len(ISSUES)
    created = 0
    for i, issue in enumerate(ISSUES, 1):
        ok = create_issue(token, issue, i, total)
        if ok:
            created += 1
        time.sleep(0.5)  # Avoid GitHub secondary rate limits

    print()
    print(f"Done. {created}/{total} issues created.")
    print(f"View at: https://github.com/{REPO}/issues")


if __name__ == "__main__":
    main()
