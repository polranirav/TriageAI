<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Now that is the final things which I have to build it. So basically on that entire ten different uh perspective where we can see the how we can build the project so you know I am using the cloud code or other model for the specific things while I building that entire application and For that like I have to separate that ten different uh things into like ten different schemes skills dot md like you know you can say that like I have to build a skill dot md file or like the uh tech like architecture dot md file or ten different file based on that entire research so could you just let me know like how many uh differ different kinds of files I have to build while I using that uh research into production grade while using the cloud code or like codecs or many other things like so that scale.mt md file architecture.md file designing uix.md file like that gonna be helpful for me so first of all let me know like how many Md file, I want to create based order on that entire research

Based on all 10 phases of TriageAI research, here is the exact file map you need.

***

# TriageAI — MD File Architecture for AI-Assisted Development

## The Core Principle

When using Claude Code, Cursor, or Codex, MD files serve **two different jobs**: some are **always loaded** (give the AI the permanent project context so it never makes wrong assumptions), and some are **loaded on-demand** (you reference them with `@filename` only when working on that specific domain). You need both types.

***

## Total: 12 MD Files

### Tier 1 — Always Loaded (Core Context)

*These 3 files live in your project root. Claude Code reads `CLAUDE.md` automatically on every session. The others you pin or load at session start.*


| \# | File | Draws From | Purpose |
| :-- | :-- | :-- | :-- |
| 1 | `CLAUDE.md` | All 10 phases | Master context: what the project is, what NOT to do, current sprint, stack, conventions |
| 2 | `ARCHITECTURE.md` | Phase 3 + Phase 6 | Full system diagram, service boundaries, data flow, infrastructure |
| 3 | `ROADMAP.md` | Phase 2 | Sprint plan, current status, what's done vs. in progress vs. upcoming |


***

### Tier 2 — Domain Files (Load When Working on That Area)

*Load these with `@filename` in Claude Code when you're working on that specific domain.*


| \# | File | Draws From | Load When... |
| :-- | :-- | :-- | :-- |
| 4 | `DATABASE.md` | Phase 3 + Phase 6 | Writing queries, migrations, Supabase RLS, schema changes |
| 5 | `API_SPEC.md` | Phase 3 + Phase 6 | Building or modifying FastAPI endpoints, request/response contracts |
| 6 | `TRIAGE_ENGINE.md` | Phase 3 + Phase 7 | Working on CTAS logic, routing rules, symptom classification, escalation |
| 7 | `DESIGN_SYSTEM.md` | Phase 5 | Building any React component, dashboard screen, or UI element |
| 8 | `TESTING_SPEC.md` | Phase 7 | Writing tests, running QA, adding regression tests after bugs |
| 9 | `BILLING.md` | Phase 9 | Building Stripe integration, tier logic, metered usage, webhooks |
| 10 | `DEPLOYMENT.md` | Phase 10 | Infrastructure changes, CI/CD, Docker, EC2, environment config |


***

### Tier 3 — Reference Files (Load When Making Strategic Decisions)

*These are not coding files — they prevent you from building the wrong thing when an AI suggests a feature that contradicts your strategy.*


| \# | File | Draws From | Load When... |
| :-- | :-- | :-- | :-- |
| 11 | `COMPLIANCE.md` | Phase 3 + Phase 10 | Any feature that touches data storage, voice, or patient information |
| 12 | `COMPETITIVE.md` | Phase 8 | Deciding what to build, what to skip, how to position a feature |


***

## File-by-File Content Spec

### `CLAUDE.md` — The Master File

This is the most important file. Claude Code reads it automatically at the start of every session.

```markdown
# TriageAI — Claude Code Context

## What This Project Is (2 sentences)
## Current Sprint: Sprint [X] — [Goal]
## What I Am Building TODAY: [specific task]

## Tech Stack (exact versions)
## Project Structure (directory tree, 2 levels deep)

## CRITICAL RULES (never violate these)
- NEVER store voice audio, transcripts, or PII — zero tolerance
- NEVER expose /docs or /redoc in production
- NEVER use wildcard (*) CORS in production
- NEVER charge callers — only clinic B2B billing
- ALWAYS use Alembic for DB changes (never raw ALTER TABLE)
- ALWAYS validate Twilio signatures on /v1/voice webhook

## Coding Conventions
- Python: FastAPI, async/await, Pydantic v2 models
- React: functional components, no class components
- Database: Supabase + SQLAlchemy ORM (no raw SQL except analytics queries)
- Env vars: never hardcode — always os.getenv() with startup validation

## What Is Out of Scope (do not suggest)
- EMR/EHR integration (V2 only)
- Mobile app (destroys zero-friction advantage)
- Doctor consultations or prescription features
- Video calls
- Any feature that requires caller registration
```


***

### `ARCHITECTURE.md`

```markdown
# System Architecture

## High-Level Diagram (ASCII)
## Component Map: what each service does
## Data Flow: caller → Twilio → FastAPI → OpenAI → response
## External Services + API keys used
## AWS Infrastructure (EC2, Supabase, Vercel, Caddy)
## Environment Variables (all of them, with descriptions, no values)
## Port Map (what runs where locally vs. production)
## Docker Compose services
```


***

### `DATABASE.md`

```markdown
# Database Reference

## All Tables (name + purpose + row ownership)
## Full Schema (every column: name, type, nullable, default, description)
## Row Level Security (RLS) policies per table
## Indexes (which columns are indexed and why)
## Alembic Migration History (version → what changed)
## Zero-PII Audit (which columns exist, which are explicitly prohibited)
## Common Query Templates (analytics queries used in dashboard)
## Supabase Connection Details (pooling config, connection limits)
```


***

### `API_SPEC.md`

```markdown
# API Specification

## Authentication (how clinic admins auth, how Twilio auth works)
## Endpoint Inventory (every route: method, path, auth required, description)

## For each critical endpoint:
  ### POST /v1/voice
  - Purpose, Twilio signature validation logic
  - Request format (Twilio webhook payload)
  - Response format (TwiML)
  - Error cases + responses

  ### WS /v1/media-stream
  - WebSocket lifecycle (connect → stream → close)
  - OpenAI Realtime API bridge design
  - Session state management

  ### POST /v1/escalate
  - Emergency bridge logic (exact Twilio Participants API calls)
  - Failure behavior
  - CTAS threshold that triggers it

## Rate limiting rules (per endpoint)
## CORS configuration
```


***

### `TRIAGE_ENGINE.md`

```markdown
# Triage Engine — Clinical Logic Reference

## CTAS Standard Summary (L1–L5 definitions)
## The 5 Questions (exact text, sequence, branching logic)
## triage_config.json Structure (annotated — every field explained)
## Classification Algorithm (how answers map to CTAS levels)
## Routing Decision Map (CTAS level → routing_action enum)
## Routing Messages (exact text delivered to caller per level)
## Escalation Trigger Rules (which symptom patterns force L1/L2)
## Prompt Injection Defenses (how the system prompt protects clinical scope)
## Edge Cases (silence, vague answers, repeat callers, non-medical calls)
## 20-Scenario Validation Suite (the test cases from Phase 7)
## Clinical Disclaimer Language (verbatim text used in AI responses)
```


***

### `DESIGN_SYSTEM.md`

```markdown
# Design System — TriageAI

## Color Tokens (exact hex values: background, surface, border, text, CTAS severity colors)
## Typography Scale (font family, sizes, weights)
## Spacing Scale
## Component Library (every component: props, variants, usage rules)
## CTAS Severity Color Map (L1=red, L2=orange, L3=amber, L4=blue, L5=green — exact hex)
## Dashboard Layout (sidebar width, header height, main content grid)
## Screen Inventory (all 7 screens from Phase 5 with route paths)
## Empty States (what each screen shows with no data)
## Loading States (skeleton patterns per component)
## Responsive Breakpoints
## Accessibility Rules (color contrast ratios, ARIA labels required)
```


***

### `TESTING_SPEC.md`

```markdown
# Testing Specification

## Test File Map (what test file covers what)
## 20 CTAS Validation Scenarios (input → expected output — Phase 7)
## 10 Smoke Tests (exact steps — Section 1.2 from Phase 10)
## Integration Test Checklist (Twilio, OpenAI, Supabase)
## Security Test Suite (prompt injection, PII audit, auth bypass attempts)
## Load Test Scenarios (concurrent call behavior)
## Regression Test Registry (bug ID → test that prevents recurrence)
## Coverage Targets (per module)
## How to Run Tests Locally (exact commands)
## CI/CD Test Gates (what must pass before merge to main)
```


***

### `BILLING.md`

```markdown
# Billing Architecture

## Stripe Configuration (products, prices, price IDs)
## Tier Definitions (Pilot, Starter $249, Growth $599, OHT $1,199)
## Call Bundle Logic (included calls per tier, overage rate)
## Metered Usage Reporting (when and how to call Stripe usage API)
## Webhook Events to Handle (invoice.paid, payment_failed, subscription.deleted, subscription.updated)
## Tier Access Control (which features unlock at which tier)
## Free Pilot Logic (60-day expiry, 100-call cap, hard stop behavior)
## Upgrade Flow (Stripe Customer Portal or custom flow)
## Cancellation Flow (steps, counter-offers, data retention policy)
## Invoice Requirements (GST/HST number, Ontario billing rules)
## Test Mode vs. Live Mode (how to switch safely)
```


***

### `DEPLOYMENT.md`

```markdown
# Deployment Runbook

## Infrastructure Map (EC2, Supabase, Vercel, Twilio, AWS services)
## Environment Variables (full list — all 15+ vars with descriptions)
## Docker Build + Run Commands (exact)
## Zero-Downtime Deployment Sequence (from Phase 10 Section 3.1)
## GitHub Actions CI/CD Pipeline (stages, what each stage does)
## Rollback Commands (Level 1, 2, 3 — exact commands from Phase 10)
## Twilio Fallback TwiML (the pre-built safe message — with XML)
## Smoke Test Sequence (Section 1.2 — exact 10 tests)
## Backup + Restore Procedure (Supabase + EC2 EBS)
## Caddy Configuration (reverse proxy, HTTPS, security headers)
## Monitoring Tools (UptimeRobot, Sentry, CloudWatch — what each watches)
## Alert Thresholds (exact numbers — P0/P1/P2 per metric)
```


***

### `COMPLIANCE.md`

```markdown
# Compliance & Privacy Architecture

## PHIPA Rules (Ontario health information privacy requirements)
## PIPEDA Rules (federal Canadian privacy law)
## Zero-PII Architecture (what is stored vs. what is explicitly never stored)
## PII Audit Query (the SQL check from Phase 10 Section 1.1)
## PIPEDA Consent Disclosure (verbatim text the AI speaks at call start)
## Data Residency (AWS ca-central-1 — why and how enforced)
## Security Headers (exact values for all 5 required headers)
## API Key Rotation Procedure
## Data Processing Agreement (DPA) template reference
## Clinical Disclaimer Language
## What Happens at Data Breach (exact steps from Phase 10 SEV-1 protocol)
## GST/HST Compliance (invoicing requirements)
```


***

### `COMPETITIVE.md`

```markdown
# Competitive Positioning Reference

## The 3 Things We Win On (10x bets — do not dilute)
## Feature Kill List (things we deliberately do NOT build — and why)
## Competitor Summary (Health 811, Cabot, Maple, Dialogue — one paragraph each)
## Pricing Positioning (where we sit vs. competitors)
## What to Say When Asked "How is this different from Health 811?"
## What to Say When Asked "How is this different from Cabot?"
## CAN Health Network Positioning Statement
## The One-Sentence Product Description (use this everywhere)
```


***

## How to Use These Files With Claude Code

```
Session Start (always):
  Claude Code auto-reads CLAUDE.md
  You say: "@ARCHITECTURE.md @ROADMAP.md — I'm working on Sprint 11 today"

Working on Voice/Triage:
  "@TRIAGE_ENGINE.md @API_SPEC.md — 
   Help me fix the question loop bug in the media stream handler"

Working on Dashboard:
  "@DESIGN_SYSTEM.md @DATABASE.md — 
   Build the CTAS donut chart component using the color tokens"

Working on Billing:
  "@BILLING.md @API_SPEC.md — 
   Implement the Stripe metered usage reporting for call overages"

Working on Deployment:
  "@DEPLOYMENT.md @COMPLIANCE.md — 
   Write the GitHub Actions workflow for zero-downtime EC2 deploy"

Making a Product Decision:
  "@COMPETITIVE.md @ROADMAP.md — 
   Should I add French language support in Sprint 11 or defer?"
```


***

## Build Order for the MD Files

Build them in this sequence — each one feeds into the next:

```
Week 1 (before writing any code):
  Day 1:  CLAUDE.md          ← most critical, do this first
  Day 1:  ARCHITECTURE.md    ← locks the technical decisions
  Day 2:  DATABASE.md        ← schema is foundation for everything
  Day 2:  API_SPEC.md        ← contracts before implementation
  Day 3:  TRIAGE_ENGINE.md   ← clinical logic needs careful documentation
  Day 3:  COMPLIANCE.md      ← PHIPA rules must be clear before coding

Week 2 (before building UI and billing):
  Day 4:  DESIGN_SYSTEM.md   ← before first React component
  Day 5:  BILLING.md         ← before Stripe integration sprint
  Day 6:  TESTING_SPEC.md    ← before writing first test
  Day 7:  DEPLOYMENT.md      ← before first production deploy

When Needed:
  ROADMAP.md        ← update weekly as sprints complete
  COMPETITIVE.md    ← before any CHC outreach or pitch
```

The most valuable file you will build is `CLAUDE.md` — it is the single document that prevents every AI coding assistant from suggesting something that violates your PHIPA architecture, adds a feature that's on the kill list, or breaks a clinical constraint. Every other file supports it.

