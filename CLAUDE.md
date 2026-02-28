# TriageAI — Master Context

> **AI-powered medical call triage & escalation system for Ontario, Canada.**
> Callers dial a phone number → AI conducts a 5-question CTAS triage → routes to correct care → warm-transfers emergencies to a human nurse.

## Project Identity

| Key | Value |
|:----|:------|
| **Product** | TriageAI — voice-first AI medical triage |
| **Target Market** | Ontario, Canada (2.3M unattached patients, 811 CHCs) |
| **Buyer** | Community Health Centre (CHC) directors |
| **End User** | Ontario patients — calls are always free |
| **Architecture** | Modular Monolith |
| **Stage** | MVP (Pre-launch) |
| **Compliance** | PIPEDA + PHIPA (Ontario) |
| **License** | MIT (open source) |

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Backend** | Python 3.11, FastAPI, SQLAlchemy 2.0 (async), Pydantic v2 |
| **Database** | Supabase (PostgreSQL), Alembic migrations |
| **Voice** | Twilio Programmable Voice + Media Streams WebSocket |
| **AI** | OpenAI Realtime API (`gpt-4o-realtime-preview`) |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| **Deployment** | Docker, AWS EC2 (ca-central-1), Caddy, GitHub Actions CI/CD |
| **Monitoring** | Sentry, UptimeRobot, CloudWatch |
| **Payments** | Stripe Billing (B2B SaaS) |

## Repository Structure

```
triageai-ontario/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI init, CORS, middleware
│   │   ├── config.py            # Pydantic settings from env
│   │   ├── database.py          # SQLAlchemy async engine + session
│   │   ├── exceptions.py        # TriageAIError + error codes
│   │   ├── voice/               # Feature 1: Voice intake
│   │   │   ├── router.py        # POST /v1/voice, WS /v1/media-stream
│   │   │   ├── media_bridge.py  # Twilio ↔ OpenAI WebSocket bridge
│   │   │   └── audio_utils.py   # μ-law ↔ PCM16 conversion
│   │   ├── triage/              # Feature 2: CTAS logic
│   │   │   ├── router.py        # Triage API endpoints
│   │   │   ├── state_machine.py # TriageSession state management
│   │   │   ├── classifier.py    # classify_ctas(), get_routing_action()
│   │   │   ├── prompts.py       # GPT-4o system prompt builder
│   │   │   └── triage_config.json
│   │   ├── routing/             # Feature 3: Routing decisions
│   │   ├── escalation/          # Feature 4: Emergency transfer
│   │   │   └── router.py        # POST /v1/escalate
│   │   ├── logging/             # Feature 5: Session logger
│   │   ├── admin/               # V2: Admin API (JWT-protected)
│   │   └── models/              # SQLAlchemy ORM models
│   ├── alembic/                 # DB migrations
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── conftest.py
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/ui/       # shadcn/ui primitives
│   │   ├── components/features/ # Domain components
│   │   ├── pages/               # Landing, Login, Dashboard/*
│   │   ├── hooks/               # useAuth, useSessions
│   │   └── lib/                 # api.ts, supabase.ts
│   ├── tailwind.config.js       # Phase 5 design tokens
│   └── vite.config.ts
├── .github/workflows/
│   ├── ci.yml
│   └── deploy.yml
├── docker-compose.yml
├── Caddyfile
└── .env.example
```

## MVP Features (Finalized)

1. **AI Voice Intake** — Twilio + GPT-4o Realtime API bidirectional audio bridge
2. **CTAS Triage Logic** — 5-question flow via externalized `triage_config.json`
3. **3-Tier Routing** — Emergency (911) / Urgent (ER) / Non-urgent (walk-in/home)
4. **Emergency Warm Transfer** — Twilio Participants API bridges a human agent
5. **Session Logger** — Metadata only, zero PII stored (PHIPA compliant)
6. **Landing Page** — Dark theme marketing page with live phone CTA
7. **Clinic Admin Dashboard** — Overview, sessions list, session detail (V2)

## Critical Constraints

### 🔴 NEVER Do

- **Never store PII**: No phone numbers, names, transcripts, or audio in the database
- **Never diagnose**: AI routes only — never names medications or provides diagnoses
- **Never classify DOWN on missing data**: Incomplete triage → assume urgent (L2), not safe (L5)
- **Never log health content**: Structured logging only — `call_sid`, `ctas_level`, `routing_action`, timestamps
- **Never hardcode secrets**: All secrets via `.env` (local) or AWS Parameter Store (prod)
- **Never commit to main directly**: Branch per task → PR per task → squash merge

### 🟢 ALWAYS Do

- **Validate Twilio signatures** on every webhook request (HTTP 403 if invalid)
- **Include PIPEDA consent disclosure** in AI greeting
- **Test escalation path** before every production deploy
- **Use structured JSON logging** via `structlog` — never `print()`
- **Write tests for safety-critical functions**: `classify_ctas()`, `should_escalate_early()`, `mark_escalated()`

## Environment Variables

```env
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+16475550000
ESCALATION_PHONE_NUMBER=+16135550001

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/triageai

# Security
SECRET_KEY=64_character_random_string
ENVIRONMENT=development

# Sentry
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Feature Flags
FF_MULTILINGUAL=false
FF_ADMIN_DASHBOARD=false
FF_ANALYTICS=false
```

## Related Documentation

| File | Purpose |
|:-----|:--------|
| `ARCHITECTURE.md` | System components, data flow, module map |
| `CONVENTIONS.md` | Coding standards, naming, git workflow |
| `VOICE_PIPELINE.md` | Twilio + OpenAI audio bridge details |
| `CTAS_TRIAGE.md` | Classification logic, state machine, routing |
| `COMPLIANCE.md` | PIPEDA/PHIPA rules, zero-PII enforcement |
| `FRONTEND.md` | Design system, components, screen specs |
| `DEPLOYMENT.md` | Docker, CI/CD, AWS, rollback procedures |
| `TESTING.md` | Test pyramid, coverage targets, P0 safety tests |
| `API_REFERENCE.md` | Endpoint contracts, error codes, schemas |
| `MONETIZATION.md` | Pricing tiers, Stripe billing, unit economics |
| `ROADMAP.md` | Sprint plan, features, milestones |
