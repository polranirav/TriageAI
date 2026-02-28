# TriageAI — Feature Roadmap

> 11 sprints × 1 week each × 12 productive hours/sprint

## Sprint Plan

| Sprint | Theme | Tasks | Hours |
|:-------|:------|:------|:------|
| **1** | Foundation — Repo, Docker, CI/CD | F0-T01, F0-T02, F0-T03 | 9h |
| **2** | Database + Voice Webhook | F0-T04, F1-T01, F2-T01 | 12h |
| **3** | Audio Bridge | F1-T02 | 6h |
| **4** | AI Conversation Engine | F1-T03, F2-T02 | 12h |
| **5** | Triage Logic + Routing | F2-T03, F3-T01, F3-T02 | 13h |
| **6** | Emergency Transfer + Logging | F4-T01, F4-T02, F5-T01 | 12h |
| **7** | Frontend + Landing Page | F5-T02, F6-T01, F6-T02 | 15h |
| **8** | Admin Auth + Dashboard | F7-T01, F7-T02 | 11h |
| **9** | Dashboard Data Screens | F7-T03, F7-T04 | 15h |
| **10** | Session Detail + Hardening | F7-T05, QA-01, QA-02 | 12h |
| **11** | Production Deploy + Launch | OPS-01–04, GTM-01 | 12h |

## Critical Path (54 productive hours)

```
F0-T01 → F0-T02 → F1-T01 → F1-T02 → F1-T03 → F2-T02 → F2-T03
→ F3-T01 → F3-T02 → F4-T01 → F4-T02 → F5-T01 → VOICE MVP
```

**Non-negotiable:** F1-T02 (audio bridge), F1-T03 (OpenAI bridge), F2-T03 (system prompt), F4-T02 (auto-escalation)

## Milestones

| Milestone | Sprint | Gate |
|:----------|:-------|:-----|
| **M1 — Feature Complete** | Sprint 6 | All voice features working, calls create DB rows |
| **M2 — Quality Complete** | Sprint 10 | ≥85% CTAS accuracy on 20 scenarios, edge cases handled |
| **M3 — Production Live** | Sprint 11 | First CHC pilot receiving real patient calls |

## Feature Flags

| Feature | Flag | Default | Enable When |
|:--------|:-----|:--------|:------------|
| Multilingual | `FF_MULTILINGUAL` | false | After 100 EN calls |
| Walk-in routing | `FF_WALKIN_ROUTING` | false | Ontario Health API ready |
| Admin dashboard | `FF_ADMIN_DASHBOARD` | false | First CHC onboarded |
| Analytics | `FF_ANALYTICS` | false | 500+ calls in DB |
| SMS follow-up | `FF_SMS_FOLLOWUP` | false | V2 only |
| Crisis override | `FF_CRISIS_OVERRIDE` | **true** | **NEVER disable** |

## Post-MVP (V2 Features)

| Feature | Effort | Priority |
|:--------|:-------|:---------|
| French language support | 4-8 hrs | Sprint 8+ |
| White-label clinic branding | 6 hrs | Sprint 9+ |
| SMS summary to caller | 6-8 hrs | Sprint 7+ |
| EMR integration (Epic/Cerner) | 40-80 hrs | V2 |
| Population-level analytics | 20 hrs | V2 |
| Post-call outcome tracking | 30 hrs | V2 |
| Playwright E2E automation | 15 hrs | V2 |
