<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Based on the top research, let's create the technical architecture of this entire project very in-depthly find out and figure it out what is the best take for that project.

I have all the technical details I need. Here is the complete Technical Architecture Blueprint for TriageAI.

***

# Phase 3 — Technical Architecture Blueprint

## TriageAI — AI Medical Call Triage System for Ontario

**Project Title:** TriageAI
**What It Does:** An AI voice agent that answers inbound medical calls 24/7, conducts structured CTAS-based triage questioning via natural language, and instantly warm-transfers emergencies to a live human — eliminating Health 811's 40-minute hold times for Ontario's 2.3M+ unattached patients.
**Core User Actions:**

1. Patient dials a phone number → AI answers within 3 seconds
2. AI conducts 5-question CTAS triage via real-time voice conversation
3. AI delivers a routing decision (911 / ER / walk-in / Home care)
4. Emergency cases → AI bridges live warm transfer to human agent
5. All sessions logged for dashboard analytics

**Scale (6 months):** ~200–500 demo calls/month, 50 beta testers, 1–2 CHC pilot clients
**Scale (18 months):** 5,000–10,000 calls/month if 3–5 clinic contracts secured
**Tech Stack:** Python (Advanced), FastAPI (Advanced), React (Intermediate), Docker (Intermediate), AWS EC2 (Intermediate), LangChain (Intermediate), PostgreSQL (Intermediate), Twilio (Learning), OpenAI API (Advanced)
**Hard Constraints:**

- PIPEDA + PHIPA compliant (Ontario health privacy law)[^1]
- Voice-only interface (no app download required by caller)
- Sub-1-second AI response latency target
- Budget: ~\$150–250/month infra at MVP scale
- Greenfield project

***

## PILLAR 1 — Architecture Pattern

### 1.1 — Architecture Recommendation

**Recommendation: Modular Monolith**

This is the correct answer for TriageAI at your current scale and team size. Here's the decisive reasoning:

A **Modular Monolith** means one deployable unit (one FastAPI application on one AWS EC2 instance), but structured internally with clean module boundaries — `voice/`, `triage/`, `routing/`, `logging/`, `admin/` — so that individual modules can be extracted into separate services later without rewriting your entire codebase.

**Why NOT microservices:** At 200–500 calls/month with one developer, microservices mean you spend 60% of your time on inter-service networking, orchestration, and DevOps instead of building the clinical triage logic that actually matters. You'd have a Kubernetes cluster with no users.

**Why NOT pure serverless:** Twilio's Media Streams architecture requires a persistent WebSocket connection that stays alive for the duration of a call (typically 2–5 minutes). AWS Lambda functions have a 15-minute max but WebSocket cold starts and connection management are painful. A long-running EC2 instance handles this naturally.[^2]

**Why NOT a simple monolith:** Clean module boundaries from Day 1 mean that when you land a CHC pilot and need to extract the admin dashboard into a separate service, you do it in a day — not a full refactor.

***

### 1.2 — Architecture Anti-Patterns to Avoid

**Anti-Pattern 1: "LLM-as-Triage-Brain" without a structured config layer**

- **What it looks like:** You hardcode all 5 triage questions directly in your GPT-4o system prompt string in `main.py`
- **Why it's tempting:** It works in 10 minutes and feels "AI-powered"
- **6 months later:** A medical reviewer (doctor, CHC director, or the CAN Health Network evaluator) asks you to change Question 3 and add a paediatric branch. You're rewriting code and redeploying instead of editing a JSON file. **Solution:** Externalize all triage logic into `triage_config.json` from Day 1

**Anti-Pattern 2: Storing patient call audio in S3 "just in case"**

- **What it looks like:** You record every call and store the audio file for replay
- **Why it's tempting:** Feels like good data practice; could train a model later
- **6 months later:** You have a PHIPA violation. Call audio containing health information is Personal Health Information under Ontario law — you need explicit consent, encrypted storage, retention policies, and breach notification procedures. **Solution:** Log metadata only (triage outcome, routing decision, call duration, timestamp) — zero audio, zero transcript in MVP[^1]

**Anti-Pattern 3: Building the admin dashboard before you have users**

- **What it looks like:** Week 3 and you're building a React dashboard with charts, filters, and clinic management before a single real call has been made
- **Why it's tempting:** It looks impressive in a demo and feels like "building the product"
- **6 months later:** You shipped the dashboard and not the core triage engine. The CHC director you email doesn't care about charts — they care whether the AI correctly identifies a stroke. **Solution:** Use Supabase's auto-generated table view as your dashboard for the first 90 days

***

### 1.3 — System Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CALLER'S PHONE                               │
│                   (Any phone, any carrier)                          │
└─────────────────────────┬───────────────────────────────────────────┘
                          │  PSTN / VoIP call
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    TWILIO PROGRAMMABLE VOICE                        │
│  • Provisions Canadian phone number (+1 Ontario area code)          │
│  • Receives inbound call → triggers HTTP POST webhook               │
│  • Returns TwiML: starts Media Stream (WebSocket to our server)     │
│  • Handles warm transfer via <Dial> verb on escalation signal       │
│  • Audio format: μ-law 8kHz (requires conversion to 16kHz PCM)     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │  POST /voice (TwiML webhook)
                           │  WebSocket ws://server/media-stream
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│              FASTAPI APPLICATION (Modular Monolith)                 │
│              Deployed on AWS EC2 t3.small (Ubuntu 22.04)            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  MODULE: voice/                                              │  │
│  │  • POST /voice → returns TwiML to start Media Stream         │  │
│  │  • WebSocket /media-stream → bridges Twilio ↔ OpenAI        │  │
│  │  • Audio conversion: μ-law 8kHz ↔ PCM 16kHz (via audioop)   │  │
│  └─────────────────────────┬────────────────────────────────────┘  │
│                            │  WebSocket (bidirectional audio)       │
│  ┌─────────────────────────▼────────────────────────────────────┐  │
│  │  MODULE: triage/                                             │  │
│  │  • Loads triage_config.json (CTAS question tree)             │  │
│  │  • Manages conversation state machine (Q1→Q2→...→Decision)  │  │
│  │  • Sends structured system prompt + context to OpenAI        │  │
│  │  • Parses LLM response → CTAS Level (1–5)                   │  │
│  └─────────────────────────┬────────────────────────────────────┘  │
│                            │  HTTPS + WebSocket                     │
│  ┌─────────────────────────▼────────────────────────────────────┐  │
│  │  OpenAI Realtime API (gpt-4o-realtime-preview)               │  │
│  │  External — handles STT + LLM response + TTS in one stream   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  MODULE: routing/                                            │  │
│  │  • Maps CTAS Level → routing action                          │  │
│  │    Level 1–2: trigger Twilio warm transfer                   │  │
│  │    Level 3: ER guidance + nearest hospital lookup            │  │
│  │    Level 4–5: walk-in / 811 / home care guidance             │  │
│  │  • POST /escalate → calls Twilio REST API to bridge transfer │  │
│  └─────────────────────────┬────────────────────────────────────┘  │
│                            │                                        │
│  ┌─────────────────────────▼────────────────────────────────────┐  │
│  │  MODULE: logging/                                            │  │
│  │  • POST /session-log → writes to PostgreSQL via SQLAlchemy   │  │
│  │  • Stores: call_sid, triage_level, routing_decision,         │  │
│  │    duration_seconds, language_detected, timestamp            │  │
│  │  • ZERO PII, ZERO audio, ZERO transcript stored in MVP       │  │
│  └─────────────────────────┬────────────────────────────────────┘  │
│                            │                                        │
│  ┌─────────────────────────▼────────────────────────────────────┐  │
│  │  MODULE: admin/ (V2 — not MVP)                               │  │
│  │  • REST endpoints for clinic dashboard                       │  │
│  │  • JWT-authenticated                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────────┘
                           │  SQLAlchemy ORM
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL)                            │
│  • Managed PostgreSQL — zero DBA work                               │
│  • Free tier: 500MB storage, 2 projects                             │
│  • Built-in table viewer = free dashboard for MVP                  │
│  • Auto-backups daily                                               │
└─────────────────────────────────────────────────────────────────────┘
                           
┌─────────────────────────────────────────────────────────────────────┐
│                    REACT DASHBOARD (V2 only)                        │
│  Deployed on Vercel (free tier)                                     │
│  Fetches from FastAPI admin/ module                                 │
│  Shows: call volume, triage distribution, escalation rate           │
└─────────────────────────────────────────────────────────────────────┘
```


***

### 1.4 — Future-Proofing Assessment

**When this architecture needs to change:**

- **>500 concurrent calls** — a single EC2 t3.small handles ~20–30 concurrent WebSocket sessions comfortably. At 500 concurrent, you need horizontal scaling behind an ALB
- **When a CHC pilot requires PHIPA-compliant data residency** — you'll need to migrate from Supabase (US data centres) to AWS RDS in Canada-Central (ca-central-1) region

**Early warning signs you've outgrown the monolith:**

- Deploying the admin dashboard causes the voice endpoint to restart (downtime for callers)
- Database queries from the logging module are competing with real-time triage session queries
- You're adding a second developer and merge conflicts are daily

**Migration path when that happens:**

1. Extract `admin/` module first → becomes a separate FastAPI service → lowest risk, no real-time dependency
2. Extract `logging/` → move to a message queue (AWS SQS + Lambda) for async writes
3. The `voice/` + `triage/` modules stay together longest — they're tightly coupled by design

***

## PILLAR 2 — Tech Stack Selection

### 2.1 — Frontend Stack

**Recommendation: React 18 + Vite + Tailwind CSS + shadcn/ui**

The frontend is a **V2 concern** for this project — the core product is voice-only and requires no frontend to function. However, you'll need a landing page and eventually a clinic dashboard. Here's the exact stack for both:


| Layer | Choice | Why This Over Alternatives |
| :-- | :-- | :-- |
| **Framework** | React 18 | You already know it; massive ecosystem for debugging alone; Next.js is overkill since you don't need SSR for a dashboard |
| **Build Tool** | Vite 5 | 10x faster hot reload than CRA; trivial config; you've used it before |
| **Styling** | Tailwind CSS v3 | No context switching between CSS files; utility-first is fast for solo devs; pairs perfectly with shadcn |
| **Component Library** | shadcn/ui | Copy-paste components, not a dependency — meaning you own the code; looks professional out of the box; built on Radix UI for accessibility |
| **State Management** | React Query (TanStack Query v5) | Server state (fetching call logs from FastAPI) doesn't need Redux; React Query handles caching, loading states, and refetching with 10 lines of code |

**Scaffold time:** 45 minutes from zero to a running React app with Tailwind + shadcn installed via CLI.

**Solo developer tax:** Very low — Tailwind + shadcn means you almost never write custom CSS, which is a massive time saver.

**Escape hatch:** React is as portable as it gets. If you wanted to switch to Next.js later, 80% of your component code migrates unchanged.

***

### 2.2 — Backend Stack

**Recommendation: Python 3.11 + FastAPI 0.110+ + SQLAlchemy 2.0 + Supabase Auth**


| Layer | Choice | Why |
| :-- | :-- | :-- |
| **Language** | Python 3.11 | Your strongest language; OpenAI SDK, Twilio SDK, LangChain all have first-class Python support; no context switching |
| **Framework** | FastAPI 0.110+ | Native async support critical for WebSocket audio bridging; automatic OpenAPI docs; you know it well; Twilio + FastAPI is a proven combo [^3][^4][^5] |
| **ORM** | SQLAlchemy 2.0 (async) | Industry standard; async mode essential since all your endpoints are async; clean migration support via Alembic |
| **Auth** | Supabase Auth (for clinic admin panel in V2) | No-build auth for the admin dashboard; free tier; JWT tokens issued and validated automatically |
| **Background Tasks** | FastAPI BackgroundTasks | Built-in; sufficient for logging call sessions asynchronously without a full Celery stack |
| **WebSocket Bridge** | `websockets` library (Python) | Direct, minimal dependency for the Twilio ↔ OpenAI audio pipe [^2] |

**Can you use the same language frontend and backend?**
Not directly (Python backend, JavaScript frontend) — but this doesn't matter for TriageAI because the frontend is minimal. The voice pipeline is 100% Python-to-Python (FastAPI → OpenAI SDK), which is what matters.

**Solo developer tax:** Low — FastAPI's auto-generated `/docs` endpoint means you get interactive API documentation for free, which is critical when you're debugging Twilio webhook responses alone at midnight.

**Escape hatch:** FastAPI → Django REST Framework migration is straightforward. SQLAlchemy models migrate to any Python ORM.

***

### 2.3 — Mobile Consideration

**No mobile app needed — and this is a feature, not a limitation.**

The entire value proposition of TriageAI is that it works on any phone without a download. A sick 71-year-old caller with limited English cannot be expected to install an app. Do not build a mobile app in V1 or V2.

**Path to add mobile later (if ever needed):** A React Native companion app for clinic staff (to receive warm transfer alerts, view triage summaries) could be built in V3 using Expo — sharing API endpoints with the existing FastAPI backend with zero rewriting.

***

### 2.4 — Third-Party Services \& APIs

| Service | Purpose | Free Tier | MVP Monthly Cost | Complexity |
| :-- | :-- | :-- | :-- | :-- |
| **Twilio Voice** | Inbound calls, Media Streams, warm transfer | \$15 trial credit | ~\$25–40 (phone number \$1 + ~500 call mins at \$0.05/min) | Medium [^3] |
| **OpenAI Realtime API** (gpt-4o-realtime-preview) | STT + LLM triage logic + TTS in one stream | None | ~\$60–80 (at 500 calls × 3 min avg × ~\$0.06/min audio) | Medium [^6] |
| **Supabase** | PostgreSQL + Auth + Storage | 500MB DB, 2 projects | \$0 (free tier sufficient for MVP) | Easy |
| **AWS EC2 t3.small** | FastAPI backend hosting | 750 hrs/mo (t2.micro free tier) | \$0 (free tier) or \$15/mo on t3.small | Medium |
| **Sentry** | Error monitoring + call crash alerts | 5K errors/month free | \$0 | Easy |
| **Resend** | Transactional email (admin alerts, pilot reports) | 3K emails/month free | \$0 | Easy |
| **PostHog** | Analytics — call volume, triage distribution | 1M events/month free | \$0 | Easy |
| **Cloudflare** | DNS + SSL + DDoS protection | Free | \$0 | Easy |
| **Infermedica API** | Clinically validated symptom checker (optional fallback) | 100 calls/month | \$0 (dev tier) → \$99/mo production | Hard |

**Total estimated monthly cost at 6-month scale: ~\$85–120/month**

**⚠️ Cost cliff:** At 5,000 calls/month (18-month scale), OpenAI Realtime API costs jump to ~\$600–900/month. This is the point where you need either a paid clinic contract covering costs, or you evaluate open-source TTS/STT alternatives like Deepgram (STT) + ElevenLabs (TTS) + GPT-4o text-only to reduce costs by ~60%.

***

### 2.5 — Tech Stack Compatibility Matrix

| Pair | Compatible? | Notes |
| :-- | :-- | :-- |
| FastAPI + Twilio Media Streams WebSocket | ✅ Confirmed | Twilio official tutorial uses exactly this combo [^3] |
| FastAPI + OpenAI Realtime API WebSocket | ✅ Confirmed | Both use async WebSocket — natural fit [^2] |
| SQLAlchemy 2.0 async + Supabase PostgreSQL | ✅ Confirmed | Standard PostgreSQL connection string works |
| Twilio + AWS EC2 (non-serverless) | ✅ Required | Persistent WebSocket connection needs a long-running server, not Lambda |
| React 18 + FastAPI REST | ✅ Standard | CORS configuration needed (FastAPI CORSMiddleware, 5 lines) |
| Alembic migrations + Supabase | ✅ Works | Connect via `postgresql+asyncpg://` connection string |

**⚠️ Known friction point:** Twilio sends audio in **μ-law 8kHz** format. OpenAI Realtime API expects **PCM16 16kHz**. You must implement a real-time audio conversion step in your WebSocket bridge. Use Python's built-in `audioop` library (`audioop.ulaw2lin` + `audioop.ratecv`) — this is 4 lines of code but will take 2–3 hours to get right without prior experience.[^2]

***

### 2.6 — The "Boring Technology" Audit

| Technology | Boring or Shiny? | Justified? |
| :-- | :-- | :-- |
| FastAPI | Boring (proven, widely used) | ✅ Right choice |
| PostgreSQL via Supabase | Boring | ✅ Right choice |
| OpenAI Realtime API | Shiny (launched Oct 2024) | ✅ Justified — this is the core differentiating technology; no mature boring alternative for real-time voice AI |
| Twilio | Boring (industry standard telephony) | ✅ Right choice |
| React + Tailwind + shadcn | Boring | ✅ Right choice |
| Docker | Boring | ✅ Right choice for reproducible deploys |
| LangChain | ⚠️ Shiny + high abstraction cost | ❌ **Do NOT use LangChain for the triage conversation flow.** LangChain adds abstraction overhead that makes the real-time audio pipeline harder to debug. Use the OpenAI Realtime API's native WebSocket directly with a custom state machine. Keep LangChain only if you add RAG over Ontario Health resources (V2). |


***

## PILLAR 3 — Cloud Infrastructure \& Deployment

### 3.1 — Hosting Platform Recommendation

**Recommendation: AWS EC2 t3.small (Canada Central region: ca-central-1) — Start on Railway, migrate to AWS at Week 4**

**Phase 1 (Weeks 1–3): Railway**

- Deploy in 5 minutes via `git push`, no DevOps knowledge required
- Free tier gives \$5/month credit; sufficient for early development
- **Why start here:** Zero setup friction during your most creative phase. Don't waste Week 1 configuring EC2 security groups

**Phase 2 (Week 4+): AWS EC2 t3.small in ca-central-1**

- **Why migrate to AWS:** Two critical reasons — (1) **data residency**: PHIPA requires that PHI stay in Canada; Supabase (US-hosted) is fine for MVP metadata, but as you move toward real clinic pilots, AWS ca-central-1 puts everything in Canada; (2) **interviewer credibility**: "deployed on AWS" reads better on a portfolio/resume than "Railway"[^1]
- **Why NOT Vercel/Netlify:** They're frontend platforms; your WebSocket server needs a persistent process they can't provide
- **Why NOT GCP/Azure:** AWS is your stated skill set and the dominant standard in Canadian health-tech

**Solo developer tax:** EC2 requires you to manage OS updates, security patches, and SSL certificates. Mitigate with: Ubuntu's `unattended-upgrades` for patches + Caddy web server (automatic HTTPS via Let's Encrypt, replaces Nginx with zero config).

**Vendor lock-in risk:** Medium — migrating from EC2 to GCP is straightforward (Docker container is portable). Migrating away from Twilio would require rewriting the voice layer, but Twilio is the industry standard and this risk is acceptable.

***

### 3.2 — Deployment Pipeline (CI/CD)

**Tool: GitHub Actions → Docker → AWS EC2 (via SSH deploy)**

```
git push origin main
        │
        ▼
GitHub Actions workflow (.github/workflows/deploy.yml)
        │
        ├── Step 1: Run pytest on triage logic (2 min)
        ├── Step 2: Build Docker image
        ├── Step 3: Push to AWS ECR (Elastic Container Registry)
        └── Step 4: SSH into EC2 → docker pull + docker-compose up -d
        
Total: ~4 minutes from push to live
```

**Rollback in under 5 minutes:**

```bash
# On EC2:
docker-compose down
docker run -d --name triageai previous_image_tag
```

Tag every Docker image with the git commit SHA — you always know which version is running and can roll back to any previous commit's image.

**One command to deploy:** `git push origin main` — GitHub Actions handles everything else.

***

### 3.3 — Environment Strategy

**3 environments for TriageAI (the minimum is 2, but 3 is worth it here):**


| Environment | Purpose | Infrastructure |
| :-- | :-- | :-- |
| **Local** | Development + debugging | `docker-compose up` on your MacBook/laptop |
| **Staging** | Test Twilio webhook calls before they go live | Same EC2 instance, different Docker container + different Twilio number |
| **Production** | Live demo number | EC2 t3.small, separate Supabase project |

**Why staging matters for this project specifically:** Twilio webhooks are notoriously hard to debug without a live HTTPS endpoint. On local, use **ngrok** (free tier) to expose your FastAPI server to Twilio during development. On staging, use the real EC2 URL.

**Environment variable management:**

- Store all secrets in **AWS Systems Manager Parameter Store** (free tier) — never in `.env` files committed to GitHub
- Locally: a `.env` file that is in `.gitignore`
- In GitHub Actions: stored as encrypted GitHub Secrets, injected at deploy time

***

### 3.4 — Infrastructure as Code

**Do you need IaC right now? No. Here's when to introduce it:**

For a solo developer at MVP scale, IaC adds setup overhead without meaningful benefit when you have one EC2 instance and one database. Use a `docker-compose.yml` + a `setup.sh` shell script that automates your EC2 initialization. This is 90% of what Terraform does at your scale, with 5% of the complexity.

**Introduce Terraform (or SST) when:**

- You need to replicate your environment for a second region (clinic pilot in BC)
- You're onboarding a second developer who needs an identical environment
- You want to reproduce your full stack from scratch in under 30 minutes

***

### 3.5 — Cost Projection Table

| Service | Free Tier Limit | 6-Month Cost/mo | 18-Month Cost/mo |
| :-- | :-- | :-- | :-- |
| AWS EC2 t3.small (ca-central-1) | 750 hrs t2.micro | \$15 | \$30 (t3.medium at scale) |
| AWS ECR (container registry) | 500MB free | \$0 | \$1 |
| Supabase PostgreSQL | 500MB, 2 projects | \$0 | \$25 (Pro plan at 5GB) |
| Twilio Voice (number + calls) | \$15 trial credit | \$30–40 | \$150–250 |
| OpenAI Realtime API | None | \$60–80 | \$400–600 |
| Sentry error monitoring | 5K errors/month | \$0 | \$0 |
| PostHog analytics | 1M events/month | \$0 | \$0 |
| Cloudflare DNS + SSL | Free | \$0 | \$0 |
| Domain name | — | \$1.50 (amortized) | \$1.50 |
| **TOTAL** | — | **~\$107–137/mo** | **~\$607–907/mo** |

**💥 Cost cliff:** The jump from \$130/mo to \$700/mo happens when call volume reaches ~2,000–3,000 calls/month. This is exactly the threshold at which you should have at least 1 paying clinic contract (\$500–1,000/month) — the math works out.

***

## PILLAR 4 — Data Architecture

### 4.1 — Database Selection

**Recommendation: PostgreSQL (via Supabase) — relational, no secondary store in MVP**

**SQL, not NoSQL** — and the reasoning is non-negotiable for this project. Your core data (triage sessions, routing decisions, CTAS levels) is highly structured and relational. You need:

- Reliable ACID transactions (a call session must be logged completely or not at all)
- Complex queries for analytics (count calls by triage level by week by routing decision)
- PHIPA audit trail requirements — relational databases handle this naturally

**Why NOT MongoDB:** Document stores shine when data shape is unpredictable. Your triage session data has an extremely consistent, predictable schema. MongoDB's flexibility buys you nothing here and costs you query power.

**Secondary store?** Add Redis only when you need session state caching (at 500+ concurrent calls) — not in MVP.

***

### 4.2 — Schema Design Principles

**Core entities (5 tables for MVP):**

```sql
-- 1. TRIAGE_SESSIONS (the core table — every call creates one row)
CREATE TABLE triage_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_sid        VARCHAR(50) UNIQUE NOT NULL,  -- Twilio Call SID
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    duration_sec    INTEGER,
    ctas_level      SMALLINT CHECK (ctas_level BETWEEN 1 AND 5),
    routing_action  VARCHAR(20) CHECK (routing_action IN 
                    ('911_transfer', 'er_urgent', 'walkin', 'home_care', 'incomplete')),
    language_code   VARCHAR(10) DEFAULT 'en',  -- for multilingual V2
    escalated       BOOLEAN DEFAULT FALSE,
    escalation_ts   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
-- NO PII. NO AUDIO. NO TRANSCRIPT. ← PHIPA MVP compliance

-- 2. TRIAGE_QUESTIONS_LOG (tracks which questions were answered)
CREATE TABLE triage_questions_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID REFERENCES triage_sessions(id) ON DELETE CASCADE,
    question_key    VARCHAR(50) NOT NULL,   -- e.g., "chief_complaint"
    answered        BOOLEAN DEFAULT FALSE,
    answered_at     TIMESTAMPTZ
);

-- 3. ROUTING_RESOURCES (lookup table — nearest clinics, 811, etc.)
CREATE TABLE routing_resources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    resource_type   VARCHAR(20) CHECK (resource_type IN 
                    ('hospital', 'walkin', 'chc', 'telehealth')),
    city            VARCHAR(100),
    province        VARCHAR(50) DEFAULT 'Ontario',
    phone           VARCHAR(20),
    hours_of_op     JSONB,
    is_active       BOOLEAN DEFAULT TRUE
);

-- 4. SYSTEM_EVENTS (audit log — for PHIPA compliance readiness)
CREATE TABLE system_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      VARCHAR(50) NOT NULL,   -- e.g., "call_started", "escalation_triggered"
    session_id      UUID REFERENCES triage_sessions(id),
    metadata        JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ADMIN_USERS (V2 — clinic portal login)
CREATE TABLE admin_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(200) UNIQUE NOT NULL,
    clinic_name     VARCHAR(200),
    role            VARCHAR(20) DEFAULT 'viewer',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**Normalization level: Partially denormalized** — `routing_action` is stored as a string enum directly on `triage_sessions` rather than a foreign key to a routing table. At MVP scale this is correct; denormalize further only when reporting queries require it.

**⚠️ Fast-growing table:** `system_events` — every call generates 5–8 events. At 10,000 calls/month this table hits 80,000 rows/month. Add a `created_at` index from Day 1 and set up a monthly archival job at 18-month scale.

***

### 4.3 — Data Access Patterns

| Query | Type | Frequency | Latency Requirement | Index Needed? |
| :-- | :-- | :-- | :-- | :-- |
| Create new triage session on call start | Write | Per call | <50ms | — |
| Update session with CTAS level on routing decision | Write | Per call | <50ms | `call_sid` |
| Log each question answered during conversation | Write | 5× per call | <100ms (async) | `session_id` |
| Trigger escalation update (set escalated=TRUE) | Write | ~15% of calls | **<30ms** (emergency path) | `call_sid` |
| Fetch triage distribution by week (dashboard) | Read | Dashboard load | <500ms | `ctas_level, created_at` |
| Fetch nearest active walk-in clinics by city | Read | Per non-urgent routing | <200ms | `resource_type, city, is_active` |
| Count calls by routing action last 30 days | Read aggregate | Dashboard load | <1s | `routing_action, started_at` |
| Audit log: all events for a specific session | Read | Rare (compliance review) | <1s | `session_id` |

**Performance-critical query:** The escalation update (`escalated=TRUE`) is on the **emergency path** — it must complete in under 30ms because the warm transfer Twilio API call is waiting for it. Use an indexed query on `call_sid` and make this a synchronous (not background) database write.

***

### 4.4 — Caching Strategy

**MVP verdict: No caching layer needed.** At 200–500 calls/month (~7–17 calls/day), your PostgreSQL query times will be under 5ms for all queries. Redis would add \$15–30/month and zero user-facing benefit.

**Add Redis (via AWS ElastiCache or Upstash) when:**

- Concurrent active calls exceed 20 simultaneously (routing resource lookups become a bottleneck)
- The clinic dashboard loads slowly (>2s) because of complex aggregate queries

**What to cache first when you do add it:**

- `routing_resources` lookup table — this changes at most weekly; cache with a 1-hour TTL
- Dashboard aggregate stats — compute on schedule (every 15 minutes), serve from cache

***

### 4.5 — Data Migration \& Backup

**Schema migrations: Alembic (part of SQLAlchemy ecosystem)**

```bash
# Creating a migration
alembic revision --autogenerate -m "add_language_code_to_sessions"

# Applying in production (zero-downtime for additive changes)
alembic upgrade head
```

**Rule:** Never run `alembic upgrade head` directly on production without first running it on staging. Add this as a step in your GitHub Actions deploy pipeline.

**Backup strategy:**

- **Supabase Pro** (\$25/mo at 18-month scale) includes automated daily backups with point-in-time recovery
- **Free tier workaround (MVP):** Set a GitHub Actions cron job (`0 2 * * *`) that runs `pg_dump` and uploads to an AWS S3 bucket (ca-central-1) — costs ~\$0.02/month for storage
- **Test restore every 30 days** — restore the dump to a local Docker PostgreSQL instance and verify row counts. Calendar reminder: first Sunday of every month, 15 minutes.

***

### 4.6 — Real-Time Data

**The voice call itself IS the real-time component** — handled entirely by the Twilio Media Streams WebSocket, not a database. No additional real-time infrastructure is needed for MVP.

**V2 real-time need:** When you build the clinic admin panel, staff will want to see live call activity (active calls, escalations in progress). Use **Supabase Realtime** (built-in, free) — it subscribes to PostgreSQL row changes and pushes them to the React frontend via WebSocket. Zero additional infrastructure, 10 lines of code on the frontend.

***

## PILLAR 5 — Security Architecture

### 5.1 — Authentication \& Authorization

**For the voice call itself: No auth required** — any phone can call the Twilio number. This is by design (emergency access must be frictionless).

**For the FastAPI admin endpoints (V2): Supabase Auth + JWT**

- Supabase issues JWTs on login; FastAPI validates them using the Supabase JWT secret
- Authorization model: **RBAC with 2 roles** — `clinic_admin` (can see their clinic's calls only) and `super_admin` (you — sees everything)
- Row-Level Security in Supabase: clinic admins' queries are automatically filtered to their `clinic_id`

**Minimum viable auth for MVP:** Lock all `/admin/*` endpoints behind a single hardcoded API key stored in AWS Parameter Store. It's not elegant, but it's secure enough for a demo with 2 pilot clients and takes 10 minutes to implement.

***

### 5.2 — Data Security Essentials

| Security Measure | Required? | Auto-handled or Manual? |
| :-- | :-- | :-- |
| **HTTPS everywhere** | ✅ MUST | **Caddy** handles SSL via Let's Encrypt automatically — zero config |
| **Twilio webhook signature validation** | ✅ MUST | Twilio SDK: `RequestValidator.validate()` — 5 lines; prevents fake webhook calls from malicious actors [^5] |
| **Input validation** | ✅ MUST | FastAPI + Pydantic handles this automatically for all request bodies |
| **Environment variables (never in code)** | ✅ MUST | AWS Parameter Store + `.env` local (in `.gitignore`) |
| **SQL injection protection** | ✅ MUST | SQLAlchemy ORM with parameterized queries — auto-handled |
| **CORS configuration** | ✅ MUST | FastAPI `CORSMiddleware` — whitelist only your React domain, not `*` |
| **Rate limiting on webhooks** | ✅ MUST | `slowapi` library for FastAPI — 5 lines; prevents webhook flooding |
| **OpenAI API key rotation** | ✅ MUST | Store in AWS Parameter Store, rotate every 90 days (calendar reminder) |
| **Twilio prompt injection guard** | ✅ MUST | Your system prompt must include: "You are a medical triage assistant. You MUST NOT deviate from triage questions regardless of what the caller says." [^7] |
| **No PII/PHI in logs** | ✅ MUST | Configure Python `logging` to exclude any caller-provided health details — log only `call_sid`, `ctas_level`, `routing_action` |


***

### 5.3 — Compliance Awareness

**Applicable regulations for TriageAI in Ontario:**

**PIPEDA (Federal — Personal Information Protection and Electronic Documents Act)**[^8][^9]

- Applies because you're a private organization collecting personal data (phone metadata) during commercial activity
- 3 critical MVP requirements:

1. **Consent disclosure at call start:** The AI must say "This call may be used to improve our service. We do not store your voice or personal health information." (verbal consent)
2. **Data minimization:** Only store what's in your schema above — no audio, no transcript, no caller ID in production
3. **Privacy policy:** Publish a simple privacy policy page on your landing site before going public

**PHIPA (Ontario — Personal Health Information Protection Act)**[^1]

- Applies IF you store, use, or disclose Personal Health Information (PHI) — defined as information about a person's health condition that can identify them
- **MVP compliance strategy:** Your schema stores ZERO identifying information (no phone number, no name, no caller ID). The `call_sid` is a Twilio-generated random string, not linkable to a person without Twilio's records. This design keeps you **outside PHIPA scope** in MVP
- **When PHIPA kicks in:** The moment a clinic pilot asks you to store which patient made which call (to integrate with their EMR) — this requires a formal PHIPA compliance review, a Privacy Impact Assessment, and potentially a BAA (Business Associate Agreement equivalent). Cross that bridge at the pilot stage, not MVP

**HIPAA:** Does NOT apply — HIPAA is US law. TriageAI operates in Canada under PIPEDA/PHIPA.[^1]

**Compliance MVP checklist (do before public launch):**

- [ ] Verbal consent disclosure in AI greeting script
- [ ] Privacy policy page on landing site
- [ ] No PII in database (verified by schema review)
- [ ] No PII in application logs
- [ ] Data stored in Canadian AWS region (ca-central-1)

***

### 5.4 — API Security

**Rate limiting:** `slowapi` library (FastAPI equivalent of Flask-Limiter)

```python
# 20 requests/minute on the Twilio webhook endpoint
@limiter.limit("20/minute")
@app.post("/voice")
async def voice_webhook(request: Request): ...
```

**Twilio webhook authentication (critical — do not skip):**

```python
from twilio.request_validator import RequestValidator

validator = RequestValidator(os.getenv("TWILIO_AUTH_TOKEN"))
# Validate every incoming webhook request signature
if not validator.validate(url, params, signature):
    raise HTTPException(status_code=403)
```

**CORS:** Allow only `https://yourdomain.com` — never `*` in production[^5]

**Top 3 API security mistakes solo developers make:**

1. **Exposing `/docs` in production** — FastAPI auto-generates interactive API docs; disable in production with `app = FastAPI(docs_url=None, redoc_url=None)` unless behind auth
2. **Not validating Twilio webhook signatures** — anyone who finds your webhook URL can send fake call events; the `RequestValidator` above prevents this entirely
3. **API keys in GitHub** — use `git-secrets` pre-commit hook from Day 1; one accidental commit of your OpenAI key = immediate compromise

***

### 5.5 — Security Monitoring (Solo Developer Edition)

**Setup time: 25 minutes. Zero daily maintenance.**


| Tool | What It Monitors | Setup |
| :-- | :-- | :-- |
| **Sentry** (free tier) | Unhandled exceptions, WebSocket crashes, 500 errors | `pip install sentry-sdk[fastapi]` + 3 lines of config |
| **AWS CloudWatch** | EC2 CPU spike, unusual traffic patterns | Enabled by default on EC2; set 1 alarm: CPU > 80% for 5 min |
| **Twilio Console alerts** | Unusual call volume spike (potential abuse of your number) | Built into Twilio dashboard — enable usage alerts |
| **GitHub Dependabot** | Vulnerable Python dependencies | Enable in GitHub repo settings — automatic PRs for security patches |

**Red alert signals to configure notifications for:**

- Sentry: any error rate spike > 10 errors in 5 minutes → email alert
- CloudWatch: CPU > 80% for > 5 minutes → SNS email (AWS free tier)
- Twilio: > 50 calls in 1 hour (demo abuse detection) → Twilio usage trigger

***

## PILLAR 6 — Scalability Design

### 6.1 — Current Scale Architecture

**At 6-month scale (200–500 calls/month = ~7–17 calls/day):**

A single **AWS EC2 t3.small** (2 vCPU, 2GB RAM) running your Dockerized FastAPI app handles this with ease. Resource math:

- Each active call = 1 persistent WebSocket connection = ~5MB RAM + minimal CPU (audio transcoding is lightweight)
- Peak concurrent calls at 17 calls/day = maybe 2–3 at the exact same time
- t3.small can handle 30–40 concurrent WebSocket connections before any degradation
- **Verdict: Single instance, no load balancer, no auto-scaling. This is correct.** Do not over-engineer.

***

### 6.2 — Scaling Trigger Points

| Metric | Current Capacity | Warning Threshold | Action Required |
| :-- | :-- | :-- | :-- |
| Concurrent WebSocket connections | 40 on t3.small | 30 active | Upgrade to t3.medium (\$30/mo) |
| API requests/second | ~50 RPS on FastAPI | 35 RPS sustained | Add second EC2 instance + ALB |
| PostgreSQL DB size | 500MB (Supabase free) | 400MB | Upgrade to Supabase Pro (\$25/mo) |
| Monthly bandwidth | 1TB (AWS free tier) | 800GB | Add Cloudflare CDN proxy (\$0, already recommended) |
| OpenAI API monthly cost | Unlimited (billed) | \$300/month | Evaluate Deepgram STT + ElevenLabs TTS hybrid to cut costs |
| Twilio concurrent calls | Unlimited (billed by usage) | \$200/month | Negotiate volume pricing with Twilio account rep |


***

### 6.3 — Load Balancing Strategy

**MVP: No load balancing needed.** One EC2 instance, one Docker container. Stating this explicitly because it's a common over-engineering trap.

**When you need it:** When you have 2 EC2 instances (at ~2,000+ concurrent calls/month). At that point:

- Use **AWS Application Load Balancer** (ALB) — \$16/month
- Enable **sticky sessions** for WebSocket connections (critical — a caller mid-triage must stay on the same instance)
- ALB supports WebSocket natively — no special configuration

***

### 6.4 — CDN \& Edge Strategy

**From Day 1:** Route all traffic through **Cloudflare** (free plan)

- Your landing page static assets (React build) served from Cloudflare's edge — instant global load times
- DDoS protection (someone spamming your webhook URL) — free
- SSL termination — handled automatically
- **Setup: 10 minutes** — point your domain's nameservers to Cloudflare, enable proxy

**Edge functions:** Not needed until you need sub-100ms regional response times for Canadian provinces. Your users are calling a phone number — Twilio handles geographic routing; your server location matters only for the webhook response time (<500ms is fine anywhere in North America).

***

### 6.5 — Performance Budget

| Metric | MVP Target | How to Achieve |
| :-- | :-- | :-- |
| Twilio webhook response time | <200ms | FastAPI async endpoint returns TwiML immediately; database writes are background tasks |
| AI first response latency (caller hears AI) | <1,000ms | Twilio + OpenAI Realtime achieves 320–1,040ms end-to-end [^10][^11] |
| Audio transcoding overhead | <10ms per frame | Python `audioop` library — optimized C implementation |
| Landing page load | <1.5s | Vite-built React served via Cloudflare CDN |
| Dashboard API response (aggregate queries) | <500ms | PostgreSQL indexed queries on `created_at` and `ctas_level` |

**3 cheapest performance wins to implement during build:**

1. **Make the `/voice` webhook async and return TwiML in <50ms** — do all database work as a `BackgroundTask`, not blocking the Twilio response
2. **Index `call_sid` on `triage_sessions` from Day 1** — this is your most frequently queried field (used in every call update) — one line in your Alembic migration
3. **Buffer Twilio audio frames at 40–60ms** before forwarding to OpenAI — reduces choppy audio artifacts without adding perceptible latency[^2]

***

## PILLAR 7 — API Design

### 7.1 — API Style Recommendation

**Recommendation: REST (JSON over HTTP) for all endpoints except the real-time audio bridge**

The real-time audio bridge is **WebSocket** (not REST, not GraphQL) — this is non-negotiable because Twilio Media Streams requires a persistent bidirectional socket for audio frames.[^2]

All other endpoints (session logging, routing lookups, admin APIs) are REST. Here's why GraphQL and gRPC are wrong for this project:

- **GraphQL:** Designed for flexible client-driven queries. Your clients (Twilio webhooks and a simple React dashboard) have fixed, predictable query patterns — GraphQL adds complexity with zero benefit
- **gRPC:** Binary protocol optimized for inter-service communication. You have one service and no polyglot clients
- **REST wins because:** It's what you know, Twilio expects it, FastAPI makes it trivial, and the OpenAPI auto-docs (`/docs`) make debugging alone dramatically easier

***

### 7.2 — API Structure \& Conventions

```
Base URL: https://api.triageai.ca/v1/

VOICE ENDPOINTS (Twilio webhooks)
POST   /v1/voice                    → Returns TwiML to start Media Stream
WS     /v1/media-stream             → WebSocket: Twilio audio ↔ OpenAI Realtime
POST   /v1/voice/status             → Twilio call status callback (call ended)

TRIAGE ENDPOINTS (internal)
POST   /v1/triage/session           → Create new triage session
PATCH  /v1/triage/session/{call_sid} → Update session with CTAS level + routing
GET    /v1/triage/session/{call_sid} → Fetch session details (for escalation handler)

ROUTING ENDPOINTS
GET    /v1/routing/resources?city={city}&type={type}  → Get nearby clinics
POST   /v1/escalate                 → Trigger warm transfer via Twilio REST API

ADMIN ENDPOINTS (JWT-protected, V2)
GET    /v1/admin/sessions?from={date}&to={date}        → Session list with filters
GET    /v1/admin/analytics/summary                     → Aggregate triage stats
```

**Versioning strategy:** `/v1/` prefix in URL from Day 1. When breaking changes are needed, add `/v2/` endpoints and deprecate `/v1/` over 90 days. Never break an existing endpoint silently.

**Standard error response format:**

```json
{
  "error": {
    "code": "TRIAGE_SESSION_NOT_FOUND",
    "message": "No session found for call_sid: CA1234abcd",
    "status": 404,
    "timestamp": "2026-02-27T19:00:00Z"
  }
}
```

**Pagination:** Use cursor-based pagination for session lists (`?after={uuid}&limit=50`) — offset pagination degrades with large tables.

***

### 7.3 — API Documentation Strategy

**Auto-generated: FastAPI's built-in OpenAPI (`/docs`) — available from Day 1 with zero extra work**

Every endpoint you define in FastAPI with Pydantic request/response models automatically appears in the Swagger UI at `/docs`. This is your API documentation during development.

**For clinic pilot demos:** Export the OpenAPI spec as a JSON file and upload to a **Notion page** as embedded documentation — takes 10 minutes and looks professional to non-technical CHC directors.

**Public API docs:** Build them only if you plan to offer third-party integrations (e.g., allowing other systems to query triage outcomes). Not needed until V3.

***

### 7.4 — API Rate Limiting \& Quotas

**MVP rate limits (implement from Day 1 using `slowapi`):**


| Endpoint | Limit | Reason |
| :-- | :-- | :-- |
| `POST /v1/voice` (Twilio webhook) | 20 requests/minute per IP | Prevent webhook flooding |
| `POST /v1/escalate` | 5 requests/minute | Emergency transfer cannot be spammed |
| `GET /v1/routing/resources` | 60 requests/minute | Public-ish endpoint, protect DB |
| `GET /v1/admin/*` | 100 requests/minute | Dashboard doesn't need more |

**Free vs. paid tiers (V2):** When clinic clients pay, they get higher call volume limits. Design this as a `clinic_tier` field on `admin_users` — `basic` (500 calls/mo), `professional` (5,000 calls/mo), `enterprise` (unlimited). The rate limiter checks this field from the JWT claim.

***

### 7.5 — Internal vs. External API Separation

**Start with one unified API — do not separate until you have a reason.** Your current clients are: Twilio (webhook consumer) and a React dashboard (admin consumer). They can both talk to the same FastAPI application.

**When to separate:** If you build a public API (letting third-party apps query triage outcomes for their patients), extract the `/v1/admin/*` endpoints into a separate `admin-api` service at that point — not before.

**What to think about NOW for future public API:**

- Add `X-Clinic-ID` header to all responses from Day 1 — makes data partitioning trivial later
- Keep all business logic in the `triage/` module, not in endpoint handlers — this makes extracting services surgical rather than painful

***

## Final Summary Table

| Layer | Technology | Why | Monthly Cost | Solo Dev Complexity (1–5) |
| :-- | :-- | :-- | :-- | :-- |
| **Voice Telephony** | Twilio Programmable Voice | Industry standard; Media Streams WebSocket; warm transfer built-in [^3] | \$30–40 | 3 |
| **AI Conversation** | OpenAI Realtime API (gpt-4o-realtime-preview) | Single stream: STT + LLM + TTS; <1s latency [^6][^11] | \$60–80 | 3 |
| **Backend Framework** | Python 3.11 + FastAPI 0.110+ | Your strongest stack; async WebSocket native; auto OpenAPI docs | \$0 | 2 |
| **Audio Conversion** | Python `audioop` (stdlib) | μ-law ↔ PCM16 conversion; zero dependency; 4 lines of code [^2] | \$0 | 2 |
| **Primary Database** | PostgreSQL via Supabase | Managed; free tier; ACID; auto-backups; built-in table viewer | \$0 (MVP) | 1 |
| **ORM + Migrations** | SQLAlchemy 2.0 async + Alembic | Industry standard; async; schema version control | \$0 | 2 |
| **Hosting** | AWS EC2 t3.small (ca-central-1) | Canada data residency; WebSocket persistent process; employer-recognizable | \$0–15 | 3 |
| **Containerization** | Docker + docker-compose | Reproducible environments; 1-command local setup | \$0 | 2 |
| **CI/CD** | GitHub Actions | Free; `git push` to deploy; integrated with your repo | \$0 | 2 |
| **Web Server / SSL** | Caddy | Auto HTTPS via Let's Encrypt; zero-config; replaces Nginx complexity | \$0 | 1 |
| **CDN + DDoS** | Cloudflare (free) | Edge caching; DDoS protection; SSL termination | \$0 | 1 |
| **Error Monitoring** | Sentry (free tier) | Crash alerts; stack traces; 5K errors/mo free | \$0 | 1 |
| **Analytics** | PostHog (free tier) | Call volume tracking; funnel analysis; 1M events/mo free | \$0 | 1 |
| **Frontend (V2)** | React 18 + Vite + Tailwind + shadcn/ui | Your skill set; fast scaffold; professional components | \$0 (Vercel free) | 2 |
| **Security** | slowapi + Twilio RequestValidator + AWS Parameter Store | Rate limiting + webhook auth + secret management | \$0 | 2 |
| **TOTAL** |  |  | **~\$107–137/mo** |  |


***

## Foundation Checklist — From Zero to Working Dev Environment

Execute in this exact order. **Target: one focused weekend (12–14 hours total).**


| \# | Step | Time |
| :-- | :-- | :-- |
| 1 | Create GitHub repo `triageai-ontario` — public, MIT license, initial README | 15 min |
| 2 | Set up Python 3.11 virtual environment + install: `fastapi uvicorn python-dotenv twilio openai sqlalchemy asyncpg alembic websockets audioop-lts slowapi sentry-sdk` | 20 min |
| 3 | Create project folder structure: `app/voice/`, `app/triage/`, `app/routing/`, `app/logging/`, `tests/` | 10 min |
| 4 | Sign up for Twilio → provision a Canadian phone number (+1 416 or +1 647) → note `ACCOUNT_SID`, `AUTH_TOKEN`, `PHONE_NUMBER` | 20 min |
| 5 | Sign up for OpenAI → create API key → test with a simple GPT-4o API call in Python | 15 min |
| 6 | Create Supabase project → copy `DATABASE_URL` → test connection with SQLAlchemy | 20 min |
| 7 | Create `.env` file with all secrets → add `.env` to `.gitignore` immediately | 5 min |
| 8 | Write `POST /voice` endpoint — returns TwiML that starts a Media Stream to `/media-stream` WebSocket | 45 min |
| 9 | Install `ngrok` → `ngrok http 8000` → paste the HTTPS URL into Twilio's "A call comes in" webhook field | 10 min |
| 10 | Call your Twilio number → verify the webhook fires → FastAPI receives the POST → you see the log in your terminal | 30 min |
| 11 | Build the WebSocket bridge: `app/voice/media_bridge.py` — receive Twilio μ-law audio, convert to PCM16, open OpenAI Realtime WebSocket, forward frames bidirectionally | 3–4 hrs |
| 12 | Create `triage_config.json` with 5 CTAS questions (chief complaint, duration, severity 1–10, age, existing conditions) | 45 min |
| 13 | Write the OpenAI system prompt in `app/triage/prompts.py` — loads `triage_config.json`, instructs the model on CTAS levels and routing decisions | 45 min |
| 14 | Run Alembic init → create first migration with `triage_sessions` table → `alembic upgrade head` → verify table in Supabase dashboard | 30 min |
| 15 | Write `app/logging/session_logger.py` — async function that creates/updates `triage_sessions` rows | 30 min |
| 16 | Write `POST /escalate` endpoint — calls Twilio REST API to add a participant (the human agent number) to the in-progress call | 45 min |
| 17 | End-to-end test: call the number → hear AI greeting → answer 3 questions → verify a row is created in Supabase `triage_sessions` | 45 min |
| 18 | Write 5 `pytest` unit tests for triage logic (given symptom set → assert correct CTAS level returned) | 1 hr |
| 19 | Create `Dockerfile` + `docker-compose.yml` → `docker-compose up` → verify everything runs in container | 45 min |
| 20 | Deploy to Railway: `railway login` + `railway up` → update Twilio webhook URL to Railway HTTPS URL → re-run end-to-end test on live server | 30 min |
| **TOTAL** |  | **~12–14 hours** |

After Step 20, you have a **working, deployed, end-to-end voice AI triage system** that answers a real phone call and routes based on CTAS logic. Everything after that is polish, features, and GTM.
<span style="display:none">[^12][^13][^14][^15][^16][^17][^18][^19][^20][^21][^22][^23][^24]</span>

<div align="center">⁂</div>

[^1]: https://www.syscreations.ca/blog/healthcare-laws-for-healthcare-app-development/

[^2]: https://skywork.ai/blog/agent/openai-realtime-api-twilio-integration-complete-guide/

[^3]: https://www.twilio.com/en-us/blog/voice-ai-assistant-openai-realtime-api-python

[^4]: https://dev.to/kailash_5fb9ac7483b880784/building-an-audio-conversation-bot-with-twilio-fastapi-and-google-gemini-2n94

[^5]: https://www.twilio.com/en-us/blog/build-secure-twilio-webhook-python-fastapi

[^6]: https://openai.com/index/introducing-the-realtime-api/

[^7]: https://www.youtube.com/watch?v=yguS8rpKt8s

[^8]: https://app-scoop.com/app-compliance-in-canada/

[^9]: https://capgo.app/blog/pipeda-compliance-for-mobile-apps-in-canada/

[^10]: https://www.retellai.com/resources/ai-voice-agent-latency-face-off-2025

[^11]: https://www.twilio.com/en-us/blog/developers/best-practices/guide-core-latency-ai-voice-agents

[^12]: 03-technical-architecture-prompt-template.md

[^13]: https://arxiv.org/html/2411.05828v1

[^14]: https://arxiv.org/html/2412.16176v1

[^15]: https://arxiv.org/pdf/2503.04724.pdf

[^16]: https://arxiv.org/html/2410.00037v2

[^17]: https://arxiv.org/html/2410.08035

[^18]: http://arxiv.org/pdf/2406.07846.pdf

[^19]: http://arxiv.org/pdf/2410.17799.pdf

[^20]: https://arxiv.org/pdf/2504.03708.pdf

[^21]: https://www.twilio.com/en-us/blog/developers/twilio-openai-realtime-api-resources

[^22]: https://www.twilio.com/en-us/blog/developers/tutorials/product/real-time-voice-translation-python-fastapi-conversationrelay

[^23]: https://developers.openai.com/api/docs/guides/realtime/

[^24]: https://www.ficode.com/blog/building-powerful-communication-applications-with-fastapi-and-twilio-a-comprehensive-guide

