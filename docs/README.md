# TriageAI — Documentation Hub

## 📍 Quick Navigation

| What You Need | Where to Look |
|:-------------|:--------------|
| **Project overview, tech stack, constraints** | [`../CLAUDE.md`](../CLAUDE.md) (root) |
| **What to build next, auto vs. manual tasks** | [`../EXECUTION_GUIDE.md`](../EXECUTION_GUIDE.md) (root) |
| **How to build a specific feature** | [`../.claude/`](../.claude/) (skills files — auto-loaded by Claude Code) |
| **Original deep research documents** | [`research/`](research/) (rarely needed) |

---

## 📘 Skills Files — `.claude/` (auto-loaded by Claude Code)

These files live in `.claude/` so Claude Code can automatically discover and use them.

### Tier 1 — Core (load when writing any code)
- **ARCHITECTURE.md** — System diagram, data flow, DB schema, API surface
- **CONVENTIONS.md** — Coding standards, error codes, git workflow, linting

### Tier 2 — Domain (load when working on that module)
- **VOICE_PIPELINE.md** — Twilio ↔ OpenAI audio bridge
- **CTAS_TRIAGE.md** — Classifier, state machine, routing
- **COMPLIANCE.md** — PIPEDA/PHIPA, zero-PII rules
- **FRONTEND.md** — Design system, components
- **DEPLOYMENT.md** — Docker, CI/CD, rollback
- **TESTING.md** — Test pyramid, P0 safety tests

### Tier 3 — Reference (load only when needed)
- **API_REFERENCE.md** — Endpoint contracts, schemas
- **MONETIZATION.md** — Pricing tiers, Stripe billing
- **ROADMAP.md** — Sprint plan, milestones

---

## 📚 Research Docs — `research/`

Original phase planning documents (450KB+ total). Deep reference when skills files don't have enough detail.
