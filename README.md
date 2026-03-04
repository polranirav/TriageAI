# 🏥 TriageAI

**AI-powered medical call triage & escalation system for Ontario, Canada.**

> Callers dial a phone number → AI conducts a 5-question CTAS triage → routes to the correct level of care → warm-transfers emergencies to a human nurse in real time.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

---

## 🎯 The Problem

**2.3 million Ontarians** don't have a family doctor. Many rely on walk-in clinics, ER visits, or the overloaded 811 line — costing the healthcare system billions and delaying care for patients who need it most.

## 💡 The Solution

TriageAI automates the first point of contact. A patient calls a phone number, speaks to an AI triage nurse, and is routed to the appropriate level of care — **in under 2 minutes**, 24/7.

### How It Works

```
📞 Patient dials the triage line
     ↓
🤖 AI greets and asks 5 CTAS-based questions
     ↓
🧠 CTAS classifier determines urgency level (L1–L5)
     ↓
🚑 L1/L2 → Warm-transfer to human nurse (escalation)
🏥 L3    → Directed to ER / urgent care
🏪 L4    → Directed to walk-in clinic
🏠 L5    → Home care advice given
```

---

## ✨ Features

| Feature | Description |
|:--------|:------------|
| **Voice Triage** | Natural AI conversation via Twilio + OpenAI Realtime API |
| **CTAS Classification** | Deterministic 5-level Canadian Triage & Acuity Scale |
| **Emergency Escalation** | Auto-detects emergencies (chest pain, stroke, etc.) and warm-transfers to a nurse |
| **Live Dashboard** | Real-time monitoring of active calls, CTAS distribution, escalation rates |
| **Session History** | Full audit trail of every triage call with outcomes and durations |
| **Analytics** | Daily/weekly/monthly call volume, CTAS trends, average handle time |
| **PIPEDA Compliant** | Zero PII storage, auto-deletion after 90 days, consent-first design |
| **Admin Auth** | Secure login with JWT-based session management |

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Patient    │────▶│    Twilio     │────▶│   FastAPI        │
│   (Phone)    │◀────│  (Voice/WS)  │◀────│   Backend        │
└─────────────┘     └──────────────┘     │                   │
                                          │  ┌─────────────┐ │
                                          │  │  OpenAI      │ │
                                          │  │  Realtime    │ │
                                          │  │  API (WS)    │ │
                                          │  └─────────────┘ │
                                          │                   │
                                          │  ┌─────────────┐ │
                                          │  │  PostgreSQL  │ │
                                          │  │  Database    │ │
                                          │  └─────────────┘ │
                                          └───────────────────┘
                                                   │
                                          ┌───────────────────┐
                                          │  React Dashboard   │
                                          │  (Admin Panel)     │
                                          └───────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Backend** | Python 3.11 · FastAPI · SQLAlchemy 2.0 (async) · Pydantic v2 |
| **Database** | PostgreSQL 15 · Alembic migrations |
| **Voice** | Twilio Programmable Voice + Media Streams (WebSocket) |
| **AI Engine** | OpenAI Realtime API (`gpt-4o-mini-realtime-preview`) |
| **Frontend** | React 18 · TypeScript · Vite · Tailwind CSS |
| **Deployment** | Docker · Docker Compose · Caddy (reverse proxy + TLS) |
| **CI/CD** | GitHub Actions |

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** and [uv](https://docs.astral.sh/uv/) (or pip)
- **Node.js 18+** and npm
- **Docker** and Docker Compose
- **Twilio account** with a phone number
- **OpenAI API key** with Realtime API access

### 1. Clone the repository

```bash
git clone https://github.com/your-username/TriageAI.git
cd TriageAI
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

### 3. Run with Docker (recommended)

```bash
# Production mode
docker-compose -f docker-compose.prod.yml up --build -d

# The app will be available at https://your-domain.com
```

### 4. Run locally (development)

```bash
# Backend
cd backend
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

### 5. Configure Twilio

1. Go to your [Twilio Console](https://console.twilio.com)
2. Set your phone number's webhook URL to: `https://your-domain.com/v1/voice`
3. Method: **POST**

---

## 📁 Project Structure

```
TriageAI/
├── backend/
│   ├── app/
│   │   ├── admin/          # Admin dashboard API routes
│   │   ├── logging/        # Session & event logging
│   │   ├── models/         # SQLAlchemy models
│   │   ├── triage/         # CTAS classifier, routing logic, prompts
│   │   ├── voice/          # Twilio webhook, media bridge, audio codec
│   │   ├── config.py       # Environment configuration
│   │   └── main.py         # FastAPI app entry point
│   ├── tests/              # Pytest test suite
│   ├── alembic/            # Database migrations
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Dashboard pages
│   │   └── lib/            # API client, utilities
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml          # Local development
├── docker-compose.prod.yml     # Production deployment
├── Caddyfile                   # Reverse proxy config
└── .env.example                # Environment template
```

---

## 🔧 Configuration

All configuration is done via environment variables. See [`.env.example`](.env.example) for the full list.

| Variable | Description | Required |
|:---------|:------------|:--------:|
| `TWILIO_ACCOUNT_SID` | Twilio account identifier | ✅ |
| `TWILIO_AUTH_TOKEN` | Twilio authentication token | ✅ |
| `TWILIO_PHONE_NUMBER` | Twilio phone number (E.164) | ✅ |
| `OPENAI_API_KEY` | OpenAI API key with Realtime access | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `BASE_URL` | Public HTTPS URL for WebSocket | ✅ |
| `SECRET_KEY` | JWT signing key (64 chars) | ✅ |
| `ADMIN_EMAIL` | Dashboard login email | ✅ |
| `ADMIN_PASSWORD` | Dashboard login password | ✅ |
| `ESCALATION_PHONE_NUMBER` | Nurse line for L1/L2 transfers | ✅ |

---

## 📊 Dashboard

The admin dashboard provides real-time visibility into the triage system:

- **Live Monitor** — Active calls with duration and question progress
- **All Sessions** — Searchable history with CTAS level, routing decision, and duration
- **Escalations** — Filtered view of emergency escalations
- **Analytics** — CTAS distribution, call volume trends, average duration
- **Reports** — Exportable summaries for clinic administrators
- **Settings** — Clinic configuration and system preferences

---

## 🔒 Security & Compliance

- **PIPEDA / PHIPA Compliant** — Designed for Ontario healthcare privacy regulations
- **Zero PII Storage** — No personal health information is stored in logs or analytics
- **Auto-Deletion** — Triage records are purged after configurable retention period (default: 90 days)
- **Consent-First** — AI discloses its nature and obtains consent at the start of every call
- **Twilio Signature Validation** — All incoming webhooks are cryptographically verified
- **HTTPS Only** — TLS enforced via Caddy with automatic certificate management

---

## 🧪 Testing

```bash
cd backend

# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=app --cov-report=term-missing

# Run specific test modules
uv run pytest tests/test_classifier.py -v
```

---

## 🚢 Deployment

TriageAI is designed to run on a single EC2 instance (or any Docker-capable server):

```bash
# SSH into your server
ssh user@your-server

# Clone and configure
git clone https://github.com/your-username/TriageAI.git
cd TriageAI
cp .env.example .env
# Edit .env with production values

# Deploy
docker-compose -f docker-compose.prod.yml up --build -d

# Run database migrations
docker exec triageai-api-1 alembic upgrade head
```

See [`DEPLOY.md`](DEPLOY.md) for detailed deployment instructions.

---

## 🗺️ Roadmap

- [x] Voice triage pipeline (Twilio ↔ OpenAI)
- [x] CTAS-based classification engine
- [x] Emergency detection & warm transfer
- [x] Admin dashboard with live monitoring
- [x] Session history & analytics
- [x] Docker deployment pipeline
- [ ] Multilingual support (French / Mandarin / Hindi)
- [ ] SMS follow-up after triage
- [ ] Multi-tenant SaaS (Stripe billing)
- [ ] FHIR integration for EHR hand-off
- [ ] Mobile app for clinic staff

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  Built with ❤️ for Ontario's healthcare system
</p>
