# TriageAI — Runbook

> Incident response and operational procedures for the TriageAI production system.
> **On-call priority**: Escalation path failures (CTAS L1/L2) are P0 — wake someone up.

---

## Service Overview

| Component | Description | Port |
|:----------|:------------|:-----|
| `backend` | FastAPI app (Uvicorn) | 8000 |
| `db` | PostgreSQL via Supabase | 5432 |
| Twilio | Inbound calls + Media Streams | external |
| OpenAI Realtime | GPT-4o audio bridge | external |
| Caddy | Reverse proxy (TLS termination) | 80/443 |

**Health endpoint:** `GET https://api.triageai.ca/health`
Expected response: `{"status": "ok", "environment": "production"}`

---

## Runbook Index

1. [Rollback Procedure](#rollback-procedure)
2. [Restart Services](#restart-services)
3. [Database Issues](#database-issues)
4. [Twilio Webhook Down](#twilio-webhook-down)
5. [OpenAI Realtime Unreachable](#openai-realtime-unreachable)
6. [Escalation Transfer Failing](#escalation-transfer-failing-p0)
7. [High Error Rate](#high-error-rate)
8. [Log Access](#log-access)
9. [Smoke Tests](#smoke-tests)

---

## Rollback Procedure

```bash
# 1. SSH into EC2
ssh -i ~/.ssh/triageai.pem ec2-user@<EC2_IP>

# 2. List recent image tags (note the previous working tag)
docker images triageai-backend --format "table {{.Tag}}\t{{.CreatedAt}}"

# 3. Edit docker-compose.yml to pin to previous tag
#    Change: image: triageai-backend:latest
#    To:     image: triageai-backend:<PREVIOUS_TAG>
nano /srv/triageai/docker-compose.yml

# 4. Redeploy with pinned image
cd /srv/triageai
docker-compose up -d --no-build

# 5. Verify health
curl https://api.triageai.ca/health

# 6. Notify team + create post-mortem issue in GitHub
```

**GitHub Actions rollback (preferred):**
1. Go to GitHub → Actions → `deploy.yml`
2. Click the last green run before the bad deploy
3. Click **Re-run jobs** → confirm
4. Monitor deployment in Actions tab

---

## Restart Services

```bash
# Restart backend only (no downtime on in-flight WebSocket calls)
docker-compose restart api

# Full restart (brief downtime — coordinate with on-call)
docker-compose down && docker-compose up -d

# Check container status
docker-compose ps

# Tail live logs
docker-compose logs -f api
```

---

## Database Issues

### Connection refused / pool exhausted
```bash
# Check DB connection count
docker-compose exec api python -c "
import asyncio
from app.database import engine
async def check():
    async with engine.connect() as conn:
        result = await conn.execute('SELECT 1')
        print('DB OK:', result.scalar())
asyncio.run(check())
"

# If pool exhausted — Supabase → Settings → Database → connection pool size
# Bump pgBouncer pool_size or reduce app SQLAlchemy pool_size in DATABASE_URL
```

### Migration needed after deploy
```bash
cd /srv/triageai
docker-compose exec api alembic upgrade head
```

---

## Twilio Webhook Down

**Symptoms:** Calls go to voicemail; Twilio logs show `POST /v1/voice` returning non-200.

```bash
# 1. Verify endpoint is up
curl -X POST https://api.triageai.ca/v1/voice \
  -d "CallSid=CA_test" \
  --no-location

# Expected: 403 (invalid signature) — endpoint is reachable
# Got: connection refused → backend is down → see Restart Services

# 2. Verify Twilio signature validation (not blocking real Twilio traffic)
#    Check Twilio console → Monitor → Logs → Errors
#    Error 11200 = HTTP failure; Error 12100 = invalid TwiML

# 3. Fallback: set Twilio webhook to static TwiML (emergency fallback)
#    Twilio console → Phone Numbers → your number
#    Set webhook URL to: https://handler.twilio.com/twiml/<FALLBACK_TwiML_SID>
```

---

## OpenAI Realtime Unreachable

**Symptoms:** Callers hear silence; logs show `openai_connect_failed`.

```bash
# Check OpenAI status
curl https://status.openai.com/api/v2/status.json | jq '.status.description'

# Check backend logs for connection errors
docker-compose logs api | grep "openai_connect_failed"

# If OpenAI is down: callers will get TwiML <Say> fallback message after timeout
# Verify OPENAI_API_KEY is set and not expired
docker-compose exec api env | grep OPENAI_API_KEY | cut -c1-30
```

---

## Escalation Transfer Failing (P0)

**Symptoms:** CTAS L1/L2 calls not being bridged to nurse line; `warm_transfer_failed` in logs.

```bash
# 1. Check recent escalation errors
docker-compose logs api | grep -E "warm_transfer|escalation"

# 2. Verify Twilio credentials are active
#    Twilio console → Account → Auth Tokens — check for revocation

# 3. Verify ESCALATION_PHONE_NUMBER is correct E.164 format
docker-compose exec api env | grep ESCALATION_PHONE_NUMBER

# 4. Manual escalation test (replaces automated warm transfer)
#    If warm transfer is broken:
#    - Instruct nurse staff to monitor for calls from TWILIO_PHONE_NUMBER
#    - Caller will remain on line; nurse manually calls back

# 5. Page on-call if any CTAS L1/L2 call went unescalated
#    Check: SELECT * FROM triage_sessions WHERE ctas_level <= 2 AND escalated = false
#    ORDER BY started_at DESC LIMIT 10;
```

---

## High Error Rate

**Threshold:** >5% HTTP 5xx over 5 minutes → investigate.

```bash
# Count recent errors
docker-compose logs api | grep '"status":5' | wc -l

# Sentry: https://sentry.io → TriageAI project → Issues (filter: Last 1 hour)

# Top error patterns
docker-compose logs api | grep "ERROR" | tail -50

# If DB errors dominate → see Database Issues
# If OpenAI errors dominate → see OpenAI Realtime Unreachable
# If rate limit errors spike → check for abuse → block IP at Caddy level
```

**Block abusive IP at Caddy:**
```
# /srv/triageai/Caddyfile — add before the reverse_proxy line:
@blocked {
    remote_ip <BAD_IP>
}
respond @blocked 403
```

---

## Log Access

All logs are JSON (structlog). Fields: `event`, `call_sid`, `level`, `timestamp`.

```bash
# Live logs
docker-compose logs -f api

# Filter by call_sid
docker-compose logs api | grep "CA_xxxxxxxxxxxx"

# Filter by event type
docker-compose logs api | grep '"event":"escalation_triggered"'

# Export last 1000 lines to file
docker-compose logs api --tail=1000 > /tmp/triageai-$(date +%Y%m%d-%H%M).log
```

**Sentry dashboard:** https://sentry.io → TriageAI → Issues

---

## Smoke Tests

Run after every deploy (takes ~3 minutes):

```bash
cd /srv/triageai

# 1. Health check
curl -f https://api.triageai.ca/health && echo "PASS: health"

# 2. Voice webhook — invalid sig returns 403 (not 500)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://api.triageai.ca/v1/voice)
[ "$STATUS" = "403" ] && echo "PASS: voice webhook" || echo "FAIL: voice webhook ($STATUS)"

# 3. Escalate endpoint — missing auth returns 403
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://api.triageai.ca/v1/escalate \
  -H "Content-Type: application/json" -d '{"call_sid":"CA_test","ctas_level":1}')
[ "$STATUS" = "403" ] && echo "PASS: escalate auth" || echo "FAIL: escalate auth ($STATUS)"

# 4. Admin API — no token returns 401
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.triageai.ca/v1/admin/analytics/summary)
[ "$STATUS" = "401" ] && echo "PASS: admin auth" || echo "FAIL: admin auth ($STATUS)"

# 5. Docs hidden in production
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.triageai.ca/docs)
[ "$STATUS" = "404" ] && echo "PASS: docs hidden" || echo "WARN: docs exposed ($STATUS)"
```

---

## Escalation Contact

| Role | Contact | When |
|:-----|:--------|:-----|
| On-call engineer | — (set in PagerDuty) | P0 escalation failure |
| Twilio support | support.twilio.com | Twilio API issues |
| OpenAI status | status.openai.com | Realtime API outage |
| Supabase status | status.supabase.com | Database issues |

---

*Last updated: 2026-03-02*
