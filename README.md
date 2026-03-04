# TriageAI

**AI-powered medical call triage & escalation system for Ontario, Canada.**

> Callers dial a phone number → AI conducts a 5-question CTAS triage → routes to the correct level of care → warm-transfers emergencies to a human nurse in real time.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

---

## The Problem

**2.3 million Ontarians** don't have a family doctor. Many rely on walk-in clinics, ER visits, or the overloaded 811 line — costing the healthcare system billions and delaying care for patients who need it most.

## The Solution

TriageAI automates the first point of contact. A patient calls a phone number, speaks to an AI triage nurse, and is routed to the appropriate level of care — **in under 2 minutes**, 24/7.

### How It Works

```
Patient dials the triage line
     ↓
AI greets, reads PIPEDA consent, and asks 5 CTAS-based questions
     ↓
CTAS classifier determines urgency level (L1–L5)
     ↓
L1/L2  →  Warm-transfer to human nurse (Twilio Conference bridge)
L3     →  Directed to ER / urgent care
L4     →  Directed to walk-in clinic
L5     →  Home care guidance
```

---

## Features

| Feature | Description |
|---------|------------|
| **Voice Triage** | Natural AI conversation via Twilio + OpenAI Realtime API |
| **CTAS Classification** | Deterministic 5-level Canadian Triage & Acuity Scale |
| **Emergency Escalation** | Auto-detects chest pain, stroke, etc. — warm-transfers to a nurse via Twilio Conference |
| **Live Dashboard** | Real-time monitoring of active calls, CTAS distribution, escalation rates |
| **Session History** | Full audit trail of every triage call with outcomes and durations |
| **Analytics** | Daily/weekly call volume, CTAS trends, call volume heatmap, routing breakdown |
| **PIPEDA/PHIPA Compliant** | Zero PII storage, auto-deletion after 90 days, consent-first design |
| **Admin Auth** | JWT-based login (dev bypass mode for local development) |

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────────┐
│   Patient    │────▶│    Twilio     │────▶│   FastAPI Backend    │
│   (Phone)    │◀────│  (Voice/WS)  │◀────│   (AWS EC2)          │
└─────────────┘     └──────────────┘     │                      │
                                         │  ┌──────────────────┐ │
                                         │  │  OpenAI Realtime  │ │
                                         │  │  API (WebSocket)  │ │
                                         │  └──────────────────┘ │
                                         │                        │
                                         │  ┌──────────────────┐ │
                                         │  │    PostgreSQL     │ │
                                         │  │    (Supabase)     │ │
                                         │  └──────────────────┘ │
                                         └────────────────────────┘
                                                    │
                                         ┌────────────────────────┐
                                         │   React Admin Dashboard │
                                         │   (served via Caddy)    │
                                         └────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.11 · FastAPI · SQLAlchemy 2.0 (async) · Pydantic v2 |
| **Database** | Supabase (PostgreSQL) · Alembic migrations |
| **Voice** | Twilio Programmable Voice + Media Streams (WebSocket) |
| **AI Engine** | OpenAI Realtime API (`gpt-4o-realtime-preview`) |
| **Frontend** | React 18 · TypeScript · Vite · Tailwind CSS |
| **Deployment** | Docker · Docker Compose · AWS EC2 (`ca-central-1`) · Caddy (TLS + reverse proxy) |
| **CI/CD** | GitHub Actions — lint, test, SSH deploy on every push to `main` |
| **Monitoring** | Sentry (errors) · UptimeRobot (uptime) · AWS CloudWatch (infra) |

---

## Quick Start

### Prerequisites

- **Python 3.11** and [uv](https://docs.astral.sh/uv/)
- **Node.js 18+** and npm
- **Docker** and Docker Compose
- **Twilio account** with a phone number
- **OpenAI API key** with Realtime API access

### 1. Clone the repository

```bash
git clone https://github.com/polranirav/TriageAI.git
cd TriageAI
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

### 3. Run locally (development)

```bash
# Backend
cd backend
uv venv --python 3.11 .venv
uv pip install -e ".[dev]"
docker compose up db -d          # start local Postgres
.venv/bin/alembic upgrade head   # run migrations
ENVIRONMENT=development .venv/bin/uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev    # http://localhost:5173
```

### 4. Configure Twilio Webhook

1. Go to your [Twilio Console](https://console.twilio.com)
2. Set your phone number's webhook URL to: `https://your-domain.com/v1/voice`
3. Method: **POST**

---

## Project Structure

```
TriageAI/
├── backend/
│   ├── app/
│   │   ├── admin/          # JWT-protected admin API (analytics, sessions, export)
│   │   ├── escalation/     # Twilio Conference warm transfer
│   │   ├── logging/        # Session & event logger (zero PII)
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── retention.py    # PIPEDA 90-day auto-delete background task
│   │   ├── routing/        # Ontario care routing messages
│   │   ├── triage/         # CTAS classifier, state machine, prompts, config
│   │   ├── voice/          # Twilio webhook, OpenAI media bridge, audio codec
│   │   ├── config.py       # Pydantic settings (all env vars)
│   │   └── main.py         # FastAPI app, lifespan, middleware
│   ├── tests/unit/         # 139 unit tests (73%+ coverage)
│   ├── alembic/            # Database migrations
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/     # StatCard, CTASBadge, EcgLoader, EmptyState, layout
│   │   ├── pages/          # Landing, Login, Overview, Sessions, Analytics, Reports, etc.
│   │   └── lib/api.ts      # Typed API client (auth + all endpoints)
│   ├── Dockerfile          # Multi-stage production build (Vite → Caddy)
│   └── package.json
├── .github/workflows/
│   ├── ci.yml              # Ruff lint + pytest on every push/PR
│   └── deploy.yml          # SSH → EC2, docker compose up, migrate, smoke test
├── docker-compose.yml      # Local development (api + db)
├── docker-compose.prod.yml # Production (api + frontend + caddy + db)
├── Caddyfile               # HTTPS, WebSocket proxy, gzip, security headers
├── RUNBOOK.md              # Rollback procedures, incident response, smoke tests
└── .env.example            # All required env vars with comments
```

---

## Environment Variables

All configuration is via environment variables. See [`.env.example`](.env.example) for the full list.

| Variable | Description | Required |
|----------|------------|:--------:|
| `TWILIO_ACCOUNT_SID` | Twilio account identifier | ✅ |
| `TWILIO_AUTH_TOKEN` | Twilio authentication token | ✅ |
| `TWILIO_PHONE_NUMBER` | Twilio phone number (E.164 format) | ✅ |
| `ESCALATION_PHONE_NUMBER` | On-call nurse line for L1/L2 warm transfers | ✅ |
| `OPENAI_API_KEY` | OpenAI API key (Realtime API access required) | ✅ |
| `DATABASE_URL` | PostgreSQL async connection string | ✅ |
| `BASE_URL` | Public HTTPS URL (used for Twilio WebSocket callback) | ✅ |
| `SECRET_KEY` | JWT signing key (64+ random characters) | ✅ |
| `ENVIRONMENT` | `development` or `production` | ✅ |
| `RETENTION_DAYS` | Auto-delete sessions after N days (default: `90`) | — |
| `SENTRY_DSN` | Sentry error tracking DSN | — |

---

## Admin Dashboard

In `development` mode, any credentials bypass auth. In `production`, JWT is enforced.

| Route | Description |
|-------|-------------|
| `/` | Landing page (marketing) |
| `/login` | Admin login |
| `/dashboard` | Overview — KPIs, CTAS donut, recent calls, 14-day bar chart |
| `/dashboard/sessions` | All sessions with CTAS filter, search, and CSV export |
| `/dashboard/sessions/:id` | Session detail with event timeline |
| `/dashboard/analytics` | Weekly CTAS trend, call volume heatmap, routing breakdown |
| `/dashboard/escalations` | L1/L2 emergency calls only |
| `/dashboard/reports` | CSV export + PHIPA compliance reference |
| `/dashboard/live` | Live call monitor |
| `/dashboard/settings` | Clinic configuration |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/v1/voice` | Twilio voice webhook (TwiML response) |
| `WS` | `/v1/media-stream` | Twilio ↔ OpenAI bidirectional audio bridge |
| `POST` | `/v1/escalate` | Trigger warm transfer (requires Twilio signature) |
| `GET` | `/v1/admin/live` | Live call data |
| `GET` | `/v1/admin/sessions` | Session list (paginated, filterable by CTAS/escalation) |
| `GET` | `/v1/admin/sessions/:id` | Session detail + event timeline |
| `GET` | `/v1/admin/analytics/summary` | KPI summary (calls, escalation rate, duration, deflections) |
| `GET` | `/v1/admin/analytics/weekly-trend` | Per-week CTAS breakdown |
| `GET` | `/v1/admin/analytics/daily` | Per-day CTAS breakdown |
| `GET` | `/v1/admin/analytics/heatmap` | 7×8 call volume heatmap (day × 3-hour slot) |
| `GET` | `/v1/admin/analytics/routing-breakdown` | Routing destination distribution |
| `GET` | `/v1/admin/export/sessions.csv` | Authenticated CSV export |
| `GET/PUT` | `/v1/admin/settings` | Clinic settings |

---

## Security & Compliance

- **PIPEDA / PHIPA Compliant** — Designed specifically for Ontario healthcare privacy regulations
- **Zero PII Storage** — No names, phone numbers, transcripts, or audio ever stored
- **Consent-First** — AI reads the PIPEDA disclosure verbatim before every call
- **Auto-Deletion** — Sessions purged after configurable retention period (default: 90 days)
- **Twilio Signature Validation** — Every webhook cryptographically verified (HTTP 403 on failure)
- **HTTPS Only** — TLS enforced by Caddy with automatic Let's Encrypt certificates
- **Security Headers** — X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS (prod)
- **Rate Limiting** — Voice webhook: 20/min · Escalation endpoint: 5/min

---

## Testing

```bash
cd backend

# Run unit tests
ENVIRONMENT=development SECRET_KEY=test \
  DATABASE_URL=postgresql+asyncpg://test:test@localhost:5432/test \
  .venv/bin/pytest tests/unit/ -v

# With coverage
.venv/bin/pytest tests/unit/ --cov=app --cov-report=term-missing

# Lint
.venv/bin/ruff check .
```

- **139 tests**, **73%+ coverage**
- P0 safety tests cover: `classify_ctas()`, `should_escalate_early()`, `mark_escalated()`

---

## Deployment (AWS EC2)

The project deploys automatically via GitHub Actions on every push to `main`.

### Infrastructure

| Component | Details |
|-----------|---------|
| **Cloud** | AWS EC2 — `t3.small`, region `ca-central-1` (Canada) |
| **OS** | Ubuntu 22.04 LTS |
| **Reverse proxy** | Caddy — automatic HTTPS (Let's Encrypt), WebSocket upgrade, gzip, security headers |
| **Containers** | Docker Compose (`docker-compose.prod.yml`) — api + frontend + caddy + db |
| **Database** | PostgreSQL in Docker (or Supabase Session Pooler for managed option) |

### Required GitHub Secrets for CI/CD

```
EC2_HOST         # EC2 public IP or Elastic IP
EC2_USER         # SSH user (e.g. ubuntu)
EC2_SSH_KEY      # Private SSH key for EC2 access
DOMAIN           # Your public domain (e.g. triageai.example.com)
```

### First-time EC2 setup

```bash
# Install Docker on EC2
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER && newgrp docker

# Clone repo and configure
git clone https://github.com/polranirav/TriageAI.git
cd TriageAI
cp .env.example .env
nano .env   # fill in all production values

# Deploy
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker compose -f docker-compose.prod.yml exec api alembic upgrade head
```

### Subsequent deploys (automated via CI/CD)

Every push to `main`:
1. GitHub Actions runs `ruff check` + `pytest tests/unit/`
2. On success: SSH to EC2 → `git pull` → `docker compose build + up` → `alembic upgrade head`
3. Smoke test: `GET https://$DOMAIN/health` → must return `200`

See [`RUNBOOK.md`](RUNBOOK.md) for rollback procedures and incident response.

---

## Roadmap

- [x] Voice triage pipeline (Twilio ↔ OpenAI Realtime API)
- [x] CTAS-based classification engine (5-level, safety-first)
- [x] Emergency detection & warm transfer (Twilio Conference bridge)
- [x] Admin dashboard with live monitoring
- [x] Session history, analytics, CSV export
- [x] AWS EC2 deployment with GitHub Actions CI/CD
- [x] PIPEDA/PHIPA compliance (zero PII, auto-deletion)
- [ ] Multilingual support (French / Mandarin / Hindi)
- [ ] SMS follow-up after triage
- [ ] Multi-tenant SaaS (Stripe billing)
- [ ] FHIR integration for EHR hand-off

---

## License

This project is licensed under the [MIT License](LICENSE).

---

*Built for Ontario's 2.3M unattached patients and the CHCs that serve them.*
