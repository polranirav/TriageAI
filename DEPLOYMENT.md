# TriageAI — Deployment & Infrastructure

> Docker → GitHub Actions CI/CD → AWS EC2 (ca-central-1) + Caddy + Vercel

## Infrastructure Overview

| Component | Technology | Environment |
|:----------|:-----------|:------------|
| Backend Hosting | AWS EC2 t3.medium (ca-central-1) | Production |
| Reverse Proxy | Caddy (auto-SSL, HSTS) | Production |
| Frontend Hosting | Vercel | Production |
| Database | Supabase (PostgreSQL) | Production |
| Container Registry | GitHub Container Registry (GHCR) | CI/CD |
| CI/CD | GitHub Actions | Automated |
| Local Dev | Docker Compose | Development |

## Local Development

### docker-compose.yml

```yaml
services:
  api:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app          # Hot-reload on code changes
    env_file: .env
    depends_on:
      - db
    command: uvicorn app.main:app --host 0.0.0.0 --reload

  db:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: triageai_dev
      POSTGRES_USER: triageai
      POSTGRES_PASSWORD: localdevonly
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

**Commands:**
```bash
docker-compose up          # Start everything
docker-compose down -v     # Clean shutdown + remove volumes
```

## CI/CD Pipeline

### `.github/workflows/ci.yml`

Triggers on every push and PR:

```
Push/PR → Backend CI → Frontend CI
          ├── Install deps      ├── Install deps
          ├── Ruff lint         ├── TypeScript check
          ├── Pytest + coverage ├── Vite build
          └── Coverage ≥70%    └── Bundle size check
```

### `.github/workflows/deploy.yml`

Triggers on merge to `main`:

```
Merge to main → Build Docker image → Push to GHCR → SSH to EC2
    → Pull new image → Run migration → Start new container (port 8001)
    → Health check → Update Caddy → Stop old container
```

## Zero-Downtime Deployment

```
1. Pull new image (old container still running on :8000)
2. Run Alembic migration (backward-compatible)
3. Start new container on :8001
4. Health check: curl localhost:8001/health
5. If 200 → Caddy reload (hot swap to :8001)
6. Wait 30s, watch Sentry error rate
7. If clean → stop old container
8. If errors → revert Caddy to :8000
```

## Database Migration Safety

**3-Phase Rule (never skip a phase):**

| Phase | Action | Example |
|:------|:-------|:--------|
| 1. ADD | Add nullable column | `ALTER TABLE ... ADD COLUMN language VARCHAR(5) DEFAULT NULL` |
| 2. MIGRATE | Update code to use new column | Deploy code that writes to new column |
| 3. CLEAN | Remove old column (weeks later) | `ALTER TABLE ... DROP COLUMN legacy_field` |

**Pre-migration checklist:**
- [ ] Supabase backup < 1 hour old
- [ ] Migration tested on staging
- [ ] `alembic downgrade -1` tested
- [ ] Row count verified before and after

## Rollback Procedures

### Level 1 — Feature Rollback (< 1 min)

```bash
# Set feature flag to false, restart
ssh ubuntu@EC2_IP
echo "FF_FEATURE=false" >> /etc/triageai/.env
docker restart triageai-api
```

### Level 2 — Deployment Rollback (< 5 min)

```bash
ssh ubuntu@EC2_IP
docker stop triageai-api
docker run -d --name triageai-api \
  --env-file /etc/triageai/.env \
  -p 8000:8000 \
  ghcr.io/username/triageai-api:PREVIOUS_SHA
curl http://localhost:8000/health  # verify
```

### Level 3 — Full System Recovery (< 30 min)

1. Enable Twilio fallback TwiML message (2 min)
2. Stop all containers
3. Rotate API keys if data breach suspected
4. Restore Supabase from backup (5-10 min)
5. Deploy last known-good image (`v1.0.0` tag)
6. Run smoke tests (12 min)
7. Re-enable Twilio production webhook
8. Email all clinic directors

## Monitoring Stack

| Layer | Tool | Alert Method |
|:------|:-----|:-------------|
| Uptime | UptimeRobot (5-min checks) | SMS |
| Errors | Sentry | Email + push |
| Performance | Sentry Performance | Email |
| Infrastructure | CloudWatch | Email |
| API costs | OpenAI Dashboard ($50 alert) | Email |
| Call costs | Twilio Console ($30 alert) | Email |
| Frontend | Vercel Analytics | Dashboard |

## Smoke Test Suite (12 min, before every deploy)

| # | Test | Expected |
|:--|:-----|:---------|
| 1 | `curl /health` | `{"status":"ok"}` in < 200ms |
| 2 | HTTP → HTTPS redirect | 301 redirect |
| 3 | POST /v1/voice without signature | 403 |
| 4 | Live non-emergency call | AI greets in < 3s, L5 routing |
| 5 | Live emergency call | Warm transfer fires in < 10s |
| 6 | Session in Supabase | Row exists, no PII |
| 7 | Dashboard login | Redirect to /dashboard |
| 8 | Unauthenticated access | Redirect to /login |
| 9 | Sentry error capture | Error appears in < 30s |
| 10 | UptimeRobot status | Both monitors green |

## NEVER Deploy When

- Right before sleeping — calls are 24/7
- OpenAI status page shows degradation
- Twilio status page shows issues
- You can't watch Sentry for 15 min post-deploy
