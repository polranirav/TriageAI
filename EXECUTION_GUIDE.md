# TriageAI — Execution Guide

> What's automated → AI does it. What's manual → you do it. What's blocked → we figure it out together.

## Sprint 1: Foundation (Week 1)

### 🤖 Automated (AI does this)
- [x] Create all 12 skills/documentation MD files
- [ ] Initialize Git repository structure
- [ ] Create `pyproject.toml` with dependencies
- [ ] Create `Dockerfile` and `docker-compose.yml`
- [ ] Configure `ruff` linting in `pyproject.toml`
- [ ] Create FastAPI `main.py` with health endpoint
- [ ] Create Pydantic `config.py` (settings from `.env`)
- [ ] Create `.env.example` with all env vars
- [ ] Set up `Caddyfile` for local reverse proxy
- [ ] Create GitHub Actions `ci.yml` workflow
- [ ] Create Alembic migration config

### 👤 Manual (You do this)
- [ ] Create GitHub repository (public, MIT license)
- [ ] Sign up for Supabase → create project → get connection string
- [ ] Sign up for Twilio → get Account SID + Auth Token + phone number
- [ ] Sign up for OpenAI → get API key → set billing alert at $50/mo
- [ ] Create `.env` from `.env.example` with real credentials
- [ ] Run `docker-compose up` to verify local setup

---

## Sprint 2: Database + Voice Webhook (Week 2)

### 🤖 Automated
- [ ] Create SQLAlchemy models (`triage_sessions`, `system_events`)
- [ ] Create first Alembic migration
- [ ] Create `POST /v1/voice` webhook handler with Twilio signature validation
- [ ] Create `Supabase Auth` integration setup
- [ ] Create database connection pool (`database.py`)

### 👤 Manual
- [ ] Configure Supabase: enable RLS on all tables
- [ ] Set up Twilio webhook URL (to ngrok for local dev)
- [ ] Run Alembic migration against Supabase
- [ ] Test: dial Twilio number → verify webhook fires

---

## Sprint 3: Audio Bridge (Week 3)

### 🤖 Automated
- [ ] Create `audio_utils.py` (μ-law ↔ PCM16 conversion)
- [ ] Create `WS /v1/media-stream` WebSocket handler
- [ ] Create `media_bridge.py` (Twilio ↔ FastAPI bridge)
- [ ] Write unit tests for audio conversion functions

### 👤 Manual
- [ ] Test with real phone call: dial number → verify audio stream connects
- [ ] Verify audio quality (no garbling, no one-way audio)

---

## Sprint 4: AI Conversation Engine (Week 4)

### 🤖 Automated
- [ ] Create OpenAI Realtime API WebSocket bridge
- [ ] Create `prompts.py` with GPT-4o system prompt
- [ ] Create `state_machine.py` (TriageState enum + transitions)
- [ ] Create `triage_config.json` with questions + routing messages
- [ ] Write unit tests for state machine

### 👤 Manual
- [ ] Test end-to-end: dial → AI greets → asks questions → responds
- [ ] Test PIPEDA consent disclosure in greeting
- [ ] Test prompt injection attempts (5 scenarios)

---

## Sprint 5: Triage + Routing (Week 5)

### 🤖 Automated
- [ ] Create `classifier.py` with `classify_ctas()` (TDD — tests first)
- [ ] Create `get_routing_action()` function
- [ ] Create routing message delivery logic
- [ ] Write 10+ parametrized tests for CTAS classifier
- [ ] Write early escalation detection (`should_escalate_early()`)

### 👤 Manual
- [ ] Review CTAS classification logic against CTAS 2022 standard
- [ ] Test 5 real phone calls with different symptom scenarios
- [ ] Verify routing messages are clear and actionable

---

## Sprint 6: Emergency Transfer + Logging (Week 6)

### 🤖 Automated
- [ ] Create `POST /v1/escalate` endpoint
- [ ] Create Twilio Participants API integration for warm transfer
- [ ] Create `session_logger.py` (async session writes)
- [ ] Create `system_events` logging for PHIPA audit trail
- [ ] Write integration tests for escalation endpoint

### 👤 Manual
- [ ] Set `ESCALATION_PHONE_NUMBER` to your personal phone
- [ ] Test emergency scenario: dial → say "chest pain" → verify warm transfer
- [ ] **Critical**: Verify you receive the bridged call on your phone
- [ ] Verify session appears in Supabase with correct CTAS level

### 🎯 Milestone M1 — Feature Complete
At this point, the voice MVP should be functional end-to-end.

---

## Sprint 7: Landing Page (Week 7)

### 🤖 Automated
- [ ] Create React + Vite frontend project
- [ ] Configure Tailwind CSS with Phase 5 design tokens
- [ ] Build landing page components (Hero, Features, CTA, Footer)
- [ ] Add animations (count-up, scroll reveal, micro-interactions)

### 👤 Manual
- [ ] Review design quality — must be visually impressive
- [ ] Test on real mobile device (iPhone Safari + Android Chrome)

---

## Sprint 8-9: Admin Dashboard (Weeks 8-9)

### 🤖 Automated
- [ ] Create login page with Supabase Auth
- [ ] Create dashboard layout (sidebar, top bar)
- [ ] Build overview page (stat cards, CTAS donut chart)
- [ ] Build sessions list page with filters
- [ ] Build session detail page with event timeline
- [ ] Create admin API endpoints (analytics, sessions)
- [ ] Set up JWT validation middleware

### 👤 Manual
- [ ] Create test clinic admin account in Supabase
- [ ] Test full flow: login → view dashboard → find specific call → export CSV

---

## Sprint 10: Hardening (Week 10)

### 🤖 Automated
- [ ] Run full test suite → achieve ≥70% coverage
- [ ] Security hardening: headers, CORS, rate limits
- [ ] Add Sentry SDK (Python + React)
- [ ] Create `RUNBOOK.md` with rollback procedures

### 👤 Manual
- [ ] Sign up for Sentry → get DSN → add to `.env`
- [ ] Sign up for UptimeRobot → add monitors
- [ ] Run 20-scenario CTAS validation suite manually
- [ ] **Critical**: Verify zero PII in database after all tests

### 🎯 Milestone M2 — Quality Complete

---

## Sprint 11: Production Deploy + Launch (Week 11)

### 🤖 Automated
- [ ] Create `deploy.yml` GitHub Actions workflow
- [ ] Create production `Caddyfile`
- [ ] Create Twilio fallback TwiML message

### 👤 Manual
- [ ] **Launch EC2 instance** in ca-central-1 (t3.medium)
- [ ] **Configure domain**: triageai.ca → A record → EC2 Elastic IP
- [ ] **Configure Twilio**: production webhook URL
- [ ] **Deploy**: push to main → workflow deploys automatically
- [ ] **Run all 10 smoke tests** (12 minutes)
- [ ] **First CHC outreach**: contact 2-3 CHC directors
- [ ] **Register on CAN Health Network** innovator directory
- [ ] **Register for GST/HST** business number (before first invoice)
- [ ] **Get privacy lawyer review** of compliance architecture ($500-$1,500)

### 🎯 Launch — First clinic pilot goes live

---

## Summary

| Category | Count |
|:---------|:------|
| 🤖 AI-automated tasks | ~45 tasks |
| 👤 Manual tasks | ~25 tasks |
| 🎯 Milestones | 3 (Feature Complete, Quality Complete, Launch) |
| Total sprints | 11 weeks |
| Productive hours/sprint | ~12 hours |
| Total productive hours | ~130 hours |
