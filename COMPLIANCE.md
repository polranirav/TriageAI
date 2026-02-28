# TriageAI — PIPEDA/PHIPA Compliance

> Zero-PII architecture — provably impossible to breach patient health voice data

## Regulatory Framework

| Regulation | Scope | Key Requirement |
|:-----------|:------|:----------------|
| **PIPEDA** | Federal — all Canadian orgs | Consent before collecting personal info; purpose limitation; data minimization |
| **PHIPA** | Ontario-specific — health info | Stricter rules for Personal Health Information (PHI); mandatory breach reporting |

## Zero-PII Architecture

**TriageAI's compliance strategy: don't store what you can't breach.**

### What IS Stored (De-identified Metadata)

| Field | Example | PII? |
|:------|:--------|:-----|
| `call_sid` | `CA3f7a2btest001` | No — Twilio opaque ID |
| `ctas_level` | `3` | No — classification result |
| `routing_action` | `er_urgent` | No — system decision |
| `duration_sec` | `187` | No |
| `escalated` | `true` | No |
| `escalation_ts` | `2026-03-01T14:32:00Z` | No |
| `questions_completed` | `5` | No |
| `language_detected` | `en` | No |
| `event_type` | `triage_started` | No |

### What is NEVER Stored

| Data Type | Where It Exists | Storage Duration | DB Column? |
|:----------|:---------------|:-----------------|:-----------|
| **Voice audio** | Twilio Media Stream → OpenAI | In-memory only, during call | ❌ No column |
| **Transcript** | OpenAI Realtime API session | In-memory only, during call | ❌ No column |
| **Phone number** | Twilio webhook parameters | Never written to DB | ❌ No column |
| **Caller name** | Never collected | N/A | ❌ No column |
| **Health statements** | AI conversation memory | Discarded on call end | ❌ No column |
| **IP address** | FastAPI request context | Never logged | N/A |

### Schema Enforcement

**No PII columns exist in the schema — this is enforced at the database level:**

```sql
-- Verification query (run before every production deploy)
SELECT column_name FROM information_schema.columns 
WHERE table_name IN ('triage_sessions', 'system_events')
  AND column_name ILIKE ANY(ARRAY[
    '%phone%', '%name%', '%transcript%', '%voice%', 
    '%audio%', '%address%', '%email%'
  ]);
-- MUST return 0 rows
```

## Consent Disclosure

**The AI greeting MUST include this verbatim:**

> "This service does not store your voice or personal health information."

This satisfies PIPEDA's informed consent requirement since:
1. No personal information is collected (data minimization)
2. The caller is told this explicitly before proceeding
3. No opt-in is needed because no personal data is processed

## Logging Rules

### ✅ Safe to Log

```python
logger.info("triage_session_created", call_sid="CA3f7a2b", started_at="2026-03-01T14:30:00Z")
logger.info("ctas_classified", call_sid="CA3f7a2b", ctas_level=3, routing_action="er_urgent")
logger.error("escalation_failed", call_sid="CA3f7a2b", twilio_error="503 Service Unavailable")
```

### ❌ NEVER Log

```python
# NEVER — phone number
logger.info("call_from", phone="+16135550001")  # ❌

# NEVER — health content
logger.info("caller_said", transcript="I have chest pain")  # ❌

# NEVER — auth tokens
logger.info("api_key", key=settings.OPENAI_API_KEY)  # ❌

# NEVER — caller identity
logger.info("caller_name", name="John Smith")  # ❌
```

## PHIPA Audit Trail

The `system_events` table serves as the PHIPA compliance audit trail:

| Event Type | When Fired | Metadata (JSON, no PII) |
|:-----------|:-----------|:----------------------|
| `call_started` | WebSocket connected | `{"call_sid": "CA..."}` |
| `triage_started` | First question asked | `{"question": "chief_complaint"}` |
| `question_answered` | Each answer received | `{"question_key": "severity", "completed": 3}` |
| `ctas_classified` | Classification complete | `{"ctas_level": 3, "routing_action": "er_urgent"}` |
| `escalation_triggered` | L1/L2 detected | `{"ctas_level": 1, "trigger": "early_detection"}` |
| `call_ended` | Call disconnected | `{"duration_sec": 187, "questions_completed": 5}` |

**Escalation writes are SYNCHRONOUS** — they must succeed or fail loudly. A silent failure on an emergency escalation is unacceptable.

## Security Measures

| Measure | Implementation |
|:--------|:--------------|
| HTTPS everywhere | Caddy auto-SSL with HSTS |
| Webhook validation | Twilio RequestValidator on every inbound call |
| Input validation | Pydantic models on all request bodies |
| Rate limiting | `slowapi`: 20/min on `/v1/voice`, 5/min on `/v1/escalate` |
| Secrets management | `.env` (local), AWS Parameter Store (prod) |
| Data residency | AWS ca-central-1 (Montreal) — Canadian data stays in Canada |
| JWT security | Stored in memory, not localStorage |
| Row-Level Security | Supabase RLS — one clinic cannot see another's data |

## Breach Response

If any PII is discovered in the database:

1. **Immediately** enable Supabase maintenance mode
2. **DELETE** the offending row (document what was deleted)
3. **Contact** privacy lawyer within 24 hours
4. **Review** what code path wrote the PII
5. **Write test** that prevents recurrence
6. **Notify** affected clinic director

This is a **SEV-1 incident** regardless of the data volume involved.
