# TriageAI — Production Deployment Guide

## Prerequisites

| Item | Details |
|:-----|:--------|
| AWS EC2 | Ubuntu 22.04, t3.medium (2 vCPU, 4 GB RAM) |
| Domain | `triageai.ca` — A record → EC2 public IP |
| Ports | 80, 443 open in security group |
| Docker | Docker Engine + Compose V2 installed |
| Supabase | Project with Auth enabled |
| Twilio | Account with phone number + voice capability |
| OpenAI | API key with GPT-4o access |

---

## Step 1: Server Setup

```bash
# SSH into EC2
ssh ubuntu@YOUR_EC2_IP

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Create project directory
sudo mkdir -p /opt/triageai
sudo chown $USER:$USER /opt/triageai
```

## Step 2: Environment Variables

Create `.env` on the server at `/opt/triageai/.env`:

```env
# ── Core ──────────────────────────────────────────
ENVIRONMENT=production
SECRET_KEY=<generate-with-openssl-rand-base64-32>

# ── Twilio ────────────────────────────────────────
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
ESCALATION_PHONE_NUMBER=+1XXXXXXXXXX
BASE_URL=https://triageai.ca

# ── OpenAI ────────────────────────────────────────
OPENAI_API_KEY=sk-...

# ── Database ──────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://triageai:STRONG_PASSWORD@db:5432/triageai
POSTGRES_USER=triageai
POSTGRES_PASSWORD=STRONG_PASSWORD
POSTGRES_DB=triageai

# ── Sentry (optional) ────────────────────────────
SENTRY_DSN=https://xxx@sentry.io/yyy

# ── Domain ────────────────────────────────────────
DOMAIN=triageai.ca

# ── Feature Flags ─────────────────────────────────
FF_CRISIS_OVERRIDE=true
FF_ADMIN_DASHBOARD=true
```

## Step 3: Deploy

```bash
# From your local machine
DEPLOY_HOST=YOUR_EC2_IP ./scripts/deploy.sh production
```

Or manually:

```bash
# On the server
cd /opt/triageai
docker compose -f docker-compose.prod.yml up -d --build
```

## Step 4: Verify

```bash
# Health check
curl https://triageai.ca/health

# Smoke tests (from local machine)
cd backend
BASE_URL=https://triageai.ca .venv/bin/pytest tests/smoke/ -v
```

## Step 5: Twilio Webhook

In Twilio Console → Phone Numbers → your number:
- **Voice webhook URL**: `https://triageai.ca/v1/voice/incoming` (POST)
- **Status callback URL**: `https://triageai.ca/v1/voice/status` (POST)

---

## Monitoring

| Tool | Purpose |
|:-----|:--------|
| `docker compose -f docker-compose.prod.yml logs -f api` | Backend logs |
| `docker compose -f docker-compose.prod.yml logs -f caddy` | Access logs |
| Sentry dashboard | Error tracking + alerts |
| `/health` endpoint | Uptime monitoring (plug into UptimeRobot) |

## Rollback

```bash
# On the server
docker compose -f docker-compose.prod.yml down
git checkout PREVIOUS_COMMIT
docker compose -f docker-compose.prod.yml up -d --build
```
