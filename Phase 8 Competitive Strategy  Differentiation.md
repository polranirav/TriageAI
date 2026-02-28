<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# let's work on tha things?

Now I have the real competitive landscape. Here is the complete Phase 8 Competitive Strategy for TriageAI.

***

# Phase 8 — Competitive Strategy \& Differentiation

## TriageAI — Complete Competitive Intelligence \& Positioning Blueprint

**Stage:** MVP Building
**Target User:** (A) Unattached Ontario patients — no family doctor, need triage guidance; (B) CHC/clinic directors — need call volume management + patient routing data
**Direct Competitors:** Health 811, Cabot Solutions, Medium AI, Talk to Medi, Amplify Care/Strello Health
**Indirect Competitors:** Maple, Dialogue Health, TELUS Health MyCare

> **Strategic North Star:** TriageAI's war is not with Maple or Dialogue. It is with the *status quo* — a patient who hangs up after 20 minutes on hold and drives to the ER instead. Every conversion from "unnecessary ER visit" to "correct care setting" is the win. That framing drives every strategic decision below.

***

## PILLAR 1 — Feature Gap Analysis

### 1.1 — Competitor Feature Matrix

| Feature Category | Feature | TriageAI | Health 811 | Cabot Solutions | Medium AI | Maple | Dialogue |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| **Core Triage** | Inbound voice call triage | ✅ | ✅ | 🔶 partial | 🔶 partial | ❌ | ❌ |
| **Core Triage** | CTAS-standardized classification (L1–L5) | ✅ | ❌ no structure | ❌ | ❌ | ❌ | ❌ |
| **Core Triage** | 0-second answer time | ✅ | ❌ (variable waits) [^1] | ✅ | ✅ | ❌ | ❌ |
| **Core Triage** | Symptom-based routing decision | ✅ | ✅ nurse judgment | 🔶 | ✅ | ❌ | ❌ |
| **Core Triage** | Emergency warm transfer to human | ✅ | ✅ escalation | 🔶 | ✅ | ❌ | ❌ |
| **Core Triage** | 24/7 availability | ✅ | ✅ [^2] | ✅ | ✅ | ✅ | 🔶 |
| **Access** | No app download required | ✅ | ✅ | ✅ | ✅ | ❌ requires app | ❌ requires app |
| **Access** | No account/registration needed | ✅ | ✅ | 🔶 | ❌ | ❌ | ❌ requires employer |
| **Access** | Free for caller | ✅ | ✅ | ❌ clinic pays | ❌ clinic pays | ❌ \$49–79/visit | ❌ employer pays |
| **Access** | French language support | ❌ V2 | ✅ | ✅ [^3] | 🔶 | ✅ | ✅ |
| **Access** | 20+ language support | ❌ V2 | ❌ English/French | ✅ [^3] | ❌ | ❌ | ❌ |
| **Clinic B2B** | Clinic admin dashboard | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Clinic B2B** | Per-session analytics | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Clinic B2B** | CTAS distribution reporting | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Clinic B2B** | Escalation audit trail | ✅ | ❌ | 🔶 | 🔶 | ❌ | ❌ |
| **Clinic B2B** | EMR / EHR integration | ❌ V2+ | ❌ | ✅ Epic/Cerner [^3] | 🔶 | ❌ | 🔶 |
| **Clinic B2B** | OHIP/billing integration | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Clinic B2B** | White-label / custom branding | ❌ | ❌ | ✅ | 🔶 | ❌ | ❌ |
| **Compliance** | PIPEDA compliant | ✅ | ✅ | ✅ | 🔶 | ✅ | ✅ |
| **Compliance** | PHIPA compliant (Ontario) | ✅ | ✅ | ✅ [^3] | ❌ stated | ✅ | ✅ |
| **Compliance** | Data residency in Canada | ✅ (ca-central-1) | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Compliance** | Zero-PII voice storage | ✅ | ✅ | ❌ stores transcripts | ❌ | N/A | N/A |
| **Deployment** | Setup time | < 1 day | N/A (gov) | 4–6 weeks [^3] | Unknown | N/A | N/A |
| **Deployment** | Self-serve / open source | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Deployment** | Per-call cost model | ✅ (Twilio + OpenAI) | Gov funded | Enterprise contract | Enterprise contract | Per-visit | Per-employee |
| **AI/Technology** | Real-time voice AI (no IVR menus) | ✅ | ❌ human nurses | ✅ | ✅ | ❌ | ❌ |
| **AI/Technology** | Conversation continuity (no repeat questions) | ✅ | ✅ nurse memory | ✅ | 🔶 | ❌ | 🔶 |
| **AI/Technology** | Prompt injection defenses | ✅ | N/A | Unknown | Unknown | N/A | N/A |
| **Consumer UX** | Doctor/nurse consultation | ❌ (routing only) | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Consumer UX** | Prescription capability | ❌ (by design) | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Consumer UX** | Mental health support | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |


***

### 1.2 — Gap Classification

**🔴 OFFENSIVE GAPS** — they have it, users want it, TriageAI lacks it:


| Feature | Who Has It | User Demand | Build Effort | Build It? | Why/Why Not |
| :-- | :-- | :-- | :-- | :-- | :-- |
| French language support | Health 811, Cabot, Maple | HIGH in Ontario (14% Francophone) | 4–8 hrs (OpenAI Realtime detects language) | **YES — Sprint 8** | Legal/regulatory risk without it in Ontario; quick win |
| EMR integration (Epic/Cerner) | Cabot Solutions | HIGH for CHC pilots | 40–80 hrs | **NOT MVP — V2** | CHCs want it but won't block a pilot without it; negotiate "manual export" workaround |
| White-label (clinic's phone number, branded greeting) | Cabot | MEDIUM | 6–10 hrs (config, not code) | **YES — Sprint 9** | CHCs won't deploy with "TriageAI" branding on their line; essential for B2B sales |
| SMS summary to caller post-call | None have this well | MEDIUM | 6–8 hrs (Twilio SMS) | **YES — Sprint 7** | Differentiator AND addresses "will the patient remember their routing?" problem |

**🟢 DEFENSIVE GAPS** — TriageAI has it, competitors don't:


| Feature | Why They Don't Have It | Durability | How to Widen |
| :-- | :-- | :-- | :-- |
| **CTAS-standardized output (L1–L5)** | Health 811 = nurse judgment (unstructured); Cabot/Medi = general symptom routing, not CTAS-aligned | HIGH — CTAS is the clinical standard; replicating requires clinical knowledge + config | Publish CTAS mapping openly to build credibility; get a doctor to validate config publicly |
| **Zero-PII architecture (no voice/transcript stored)** | Cabot stores transcripts for quality review; others require accounts | MEDIUM — can be copied but is a trust differentiator NOW | Publish privacy architecture on GitHub; get a privacy lawyer to review + post letter |
| **Open-source codebase** | All competitors are proprietary | HIGH — CHCs and public health bodies in Canada have regulatory preference for auditable systems | Publish on GitHub, add MIT license, write a blog post on the architecture |
| **CTAS dashboard for clinic administrators** | Health 811 gives zero data to clinics; Cabot dashboard exists but not CTAS-structured | MEDIUM | Add benchmark data ("your escalation rate vs. Ontario average") as V2 differentiator |
| **\$0 setup cost + self-serve** | All B2B competitors charge \$50K–\$200K implementation fees [^3] | HIGH at MVP stage (CHC pilots) | Keep free/open-source through first 3 clinic pilots; monetize after proving clinical value |

**⚪ WHITESPACE GAPS** — nobody has this, real user need:


| Feature | Evidence of Need | Why Nobody Built It | First-Mover Advantage? | Effort |
| :-- | :-- | :-- | :-- | :-- |
| **CTAS-population-level analytics for Ontario CHCs** ("your clinic's community has 23% L3+ calls — higher than regional average") | CHC directors have no population-level triage data; Ontario Health doesn't publish it | Requires aggregating across multiple clinics; single-clinic tools don't have the data | YES — once 3+ clinics use TriageAI, aggregate data is unique | 20 hrs (V2) |
| **Post-call outcome tracking** ("caller was told walk-in; did they go? Did they end up in ER anyway?") | No triage tool tracks whether their routing was followed or correct | Hard without follow-up mechanism; PHIPA concerns | YES — creates a continuous improvement loop no competitor has | 30 hrs (V2) |
| **CAN Health Network / Ontario Health pilot pathway documentation** | CHC directors told the researcher community they want AI tools with clear compliance documentation | Regulatory complexity deters startups | YES — publish the "how to pilot TriageAI at your CHC" package | 4 hrs (docs, not code) |

**⛔ IRRELEVANT GAPS** — exists but users don't care:


| Feature | Why It Doesn't Matter | Risk of Ignoring |
| :-- | :-- | :-- |
| Prescription capability | TriageAI is a routing tool, not a clinical care tool — attempting to add prescriptions would require physician licensing, regulatory approval, malpractice insurance | Zero risk |
| Mental health therapy | Outside scope; Health 811 and 988 Crisis Line cover this; TriageAI handles crisis handoff (hard transfer to crisis line) | Zero risk of user defection |
| Video consultation | Completely different product category; adds patient identity, OHIP billing complexity | Zero risk |
| Appointment booking | Cabot/Medi do this; it's a distraction from triage focus at MVP | Low risk |


***

### 1.3 — Feature Parity Threshold

**Table stakes — minimum needed for a CHC to even pilot TriageAI:**


| Table Stake | Have It? | Build Time | Priority |
| :-- | :-- | :-- | :-- |
| 0-second answer, 24/7 | ✅ | — | Done |
| CTAS L1–L5 classification | ✅ | — | Done |
| Emergency escalation | ✅ | — | Done |
| PHIPA-compliant (zero PII stored) | ✅ | — | Done |
| Canadian data residency (AWS ca-central-1) | ✅ | — | Done |
| PIPEDA consent disclosure in AI greeting | ✅ | — | Done |
| French language support | ❌ | 4–8 hrs | Sprint 8 |
| White-label clinic number/greeting | ❌ | 6 hrs | Sprint 9 |
| One-page clinical validation document | ❌ | 4 hrs (doc) | Before first demo |

**Features to DELIBERATELY NOT BUILD (MVP):**

- EMR integration — adds 40+ hours, zero pilots have required it yet. Position as "available in V2 upon pilot completion"
- Mobile app — defeats the entire "no app needed" advantage
- Video consult — completely different product
- Appointment booking — Medi/Cabot already do this; TriageAI wins by being a focused triage tool, not trying to be everything

***

### 1.4 — Competitor Weakness Mining

**Health 811:**

- Real-world wait times contradict government claims — The Local (Feb 2026) found significant user frustration with actual wait experiences[^1]
- No structured data output — clinics cannot see what Health 811 told their patients
- No clinic integration — zero visibility for community health centres into their patients' triage calls
- English/French only — Ontario's 20+ language communities are underserved
- **TriageAI Opportunity:** "Health 811 on 0-second hold time, with a clinic dashboard attached"

**Cabot Solutions:**

- 4–6 week implementation timeline — too slow for CHC pilot adoption[^3]
- Enterprise pricing (\$50K–\$200K) — community health centres are publicly funded with tight budgets
- Stores audio transcripts — PHIPA risk exposure; harder to position as privacy-first
- Requires clinical governance board review — high friction
- **TriageAI Opportunity:** "Deploy in 1 day, free pilot, no transcript storage, open source for audit"

**Medium AI / Talk to Medi:**

- Both target appointment booking and admin automation — not specialized triage[^4][^5]
- No CTAS framework — general "symptom routing" without clinical standards
- No public PHIPA compliance documentation
- **TriageAI Opportunity:** "CTAS standard, not a generic voice bot"

**Maple:**

- \$49–79 per consultation — inaccessible to the 2.3M unattached patients who are disproportionately lower-income[^6]
- Requires account creation and app installation — massive friction for the exact population TriageAI targets (elderly, low-tech)
- Provides a doctor consult — overkill for 60% of calls that just need routing guidance
- **TriageAI Opportunity:** "No app, no account, no cost — just call"

***

## PILLAR 2 — 10x Rule Application

### 2.1 — 10x Opportunity Identification

| Feature Area | Current Best | Can Be 10x? | How | Confidence |
| :-- | :-- | :-- | :-- | :-- |
| **Answer speed** | Health 811: 60 seconds official / real-world variable [^1] | ✅ YES | 0 seconds — AI answers instantly every time | Very High |
| **Caller friction** | Maple: requires app + account + payment | ✅ YES | Just call a phone number — nothing else | Very High |
| **Triage structure** | Health 811: nurse judgment, unstructured | ✅ YES | CTAS L1–L5 every call, machine-readable, consistent | High |
| **Clinic data visibility** | All competitors: zero CTAS output to clinic | ✅ YES | Dashboard with every call's CTAS level, routing, escalation audit trail | High |
| **Setup cost** | Cabot: \$50K–\$200K, 4–6 weeks | ✅ YES | \$0, 1 day self-serve | Very High (for early adopters) |
| **Privacy architecture** | Cabot: stores transcripts | ✅ YES | Zero-PII by design, open-source for audit | High |
| **Doctor consultation quality** | Maple: real licensed physicians | ❌ NO | TriageAI is routing-only — don't compete here | — |
| **Language breadth** | Cabot: 20+ languages | ❌ NOT NOW | V2 possibility but complex clinical accuracy problem | — |
| **EMR integration depth** | Cabot: Epic/Cerner/Meditech | ❌ NO | Out of scope for MVP | — |


***

### 2.2 — The 3 10x Bets


***

**10x BET \#1: Answer Speed + Zero Friction Access**

```
10x BET: 0-second AI answer vs. any waiting room

Current Best: Health 811 claims <60 seconds (official) but 
  The Local (Feb 2026) documents real user frustration [web:71].
  Even at 60 seconds, a distressed caller in pain waits.
  Maple requires app download + account creation + $49.

Their Weakness: Health 811 is constrained by human nurse staffing —
  you can't get to 0 seconds without AI. Maple's business model 
  requires registration for billing. Both structurally cannot fix this.

My 10x Approach: Dial a phone number. AI answers in <3 seconds.
  No app. No account. No payment. No hold music. Ever.

Technical Feasibility: Already built in Phase 3 — Twilio + 
  OpenAI Realtime. This is a Day 1 reality, not a roadmap item.

Time to 10x: Sprint 4 completion (Week 4).

Proof of 10x: 
  Competitor: 60 seconds to first human word (best case)
  TriageAI: <3 seconds to first AI word (verified in load test)
  = 20x faster. Measurable with a stopwatch.

Defensibility: HIGH. Health 811 is a government service that 
  CANNOT replace RNs with AI without a policy change. Maple's 
  VC investors need a doctor-consult revenue model to justify 
  valuations. Neither can copy this WITHOUT destroying their 
  existing business.
```


***

**10x BET \#2: Structured CTAS Output That Clinics Can Actually Use**

```
10x BET: Machine-readable CTAS classification vs. 
  unstructured nurse advice

Current Best: Health 811 produces nurse advice (unstructured 
  conversational output — no CTAS level, no routing code, 
  nothing a clinic system can consume). Cabot produces 
  "symptom routing" but not CTAS-standardized.

Their Weakness: Health 811 is a patient service, not a 
  clinical data tool — it was never designed to feed clinic 
  dashboards. Cabot doesn't use CTAS (they use custom 
  decision trees without the clinical standard).

My 10x Approach: Every call produces:
  - CTAS Level (L1–L5, the Canadian emergency standard)
  - Routing action (machine-readable enum)
  - Session metadata (duration, questions completed, escalated?)
  - All visible in a clinic dashboard per call, per day, per month
  This is actionable clinical intelligence Health 811 and 
  Cabot cannot produce.

Technical Feasibility: Built in Phase 3 (triage_config.json + 
  classify_ctas() + admin dashboard). Fully in-scope.

Proof of 10x:
  Health 811: "Nurse told patient to go to ER" (unstructured, 
    zero data for clinic)
  TriageAI: 
    ctas_level: 3, routing_action: "er_urgent", 
    duration: 187s, escalated: false
    → visible in clinic dashboard within 2 minutes of call

Defensibility: HIGH. CTAS is the Canadian Emergency Triage 
  and Acuity Scale — a clinical standard that takes domain 
  expertise to implement correctly. Generic voice AI companies 
  (Cabot, Medi) would need clinical advisors + a full 
  redesign to adopt it. Health 811 would need a government 
  procurement process.
```


***

**10x BET \#3: Zero-PII Architecture as a PHIPA Trust Signal**

```
10x BET: Open-source, auditable, zero-transcript privacy 
  architecture vs. "trust us" enterprise compliance claims

Current Best: Cabot "promises" PHIPA compliance but stores 
  audio transcripts for quality review [web:69]. Enterprise 
  competitors provide compliance PDFs that nobody can audit.
  Health 811 is government (trusted by default, but opaque).

Their Weakness: Enterprise vendors need transcripts to improve 
  their models and for quality assurance — removing transcript 
  storage breaks their AI improvement flywheel. They are 
  structurally incentivized to STORE data.

My 10x Approach:
  - Zero voice audio stored (Twilio stream never written to disk)
  - Zero transcript stored (OpenAI conversation not persisted)
  - Only: CTAS level + routing action + duration (all de-identified)
  - Full architecture published on GitHub for audit
  - Compliance architecture reviewed by Canadian privacy lawyer 
    (1-page public document)
  
  This is not just "PHIPA compliant" — it is "provably 
  impossible to breach patient health voice data."

Technical Feasibility: Already built in Phase 3 — architecture 
  enforces this at the DB schema level (no transcript columns).

Proof of 10x:
  Cabot: "PHIPA compliant" (trust the PDF)
  TriageAI: "Read the code. There is no column in our database 
  that could store a phone number or health statement. 
  Here's the GitHub link."

Defensibility: HIGH for CHC/public health trust positioning. 
  Any competitor that actually stores transcripts CANNOT 
  match this claim without fundamentally changing their 
  architecture (and destroying their quality assurance system).
```


***

### 2.3 — Kill List (Stop Doing These)

| Feature/Direction | Why It's a Waste | Redirect Effort To |
| :-- | :-- | :-- |
| Building an AI that gives health advice beyond routing | Requires physician licensing, malpractice insurance, Health Canada regulation — solo developer cannot tackle this | Deeper CTAS classification accuracy |
| Competing on language breadth (20+ languages at MVP) | Cabot already has it; clinical accuracy in non-English requires separate validation per language; 0 CHC pilots require it yet | French support ONLY (1 sprint, high Ontario ROI) |
| Building a mobile app | Destroys your \#1 competitive advantage (no app needed). Zero callers will prefer the app over just dialing | None — your competitor advantage is NOT having an app |
| EMR integration at MVP | 40+ hours, zero current pilots need it. Cabot has it; you don't beat them here. | Post-pilot contract requirement |
| Competing with Maple/Dialogue on telehealth | Completely different product category (doctor consult vs. routing). TriageAI is not a telemedicine company. | Being the best triage routing tool in Ontario |


***

## PILLAR 3 — Network Effects Strategy

### 3.1 — Network Effect Audit

| Type | Applicable? | How It Works in TriageAI | Strength |
| :-- | :-- | :-- | :-- |
| **Direct** (more users = more value per user) | ❌ | A caller gets the same triage quality whether 10 or 10,000 calls have been made | None |
| **Indirect / Cross-Side** (more clinics attract more callers) | ✅ WEAK | More CHC clients → TriageAI number becomes more broadly promoted → more callers → more data for clinics | Weak but real |
| **Data** (more usage = better AI) | ✅ MEDIUM | More real Ontario triage calls → better CTAS classifier calibration → better routing accuracy → more clinic trust | Medium |
| **Content** (more users = more content) | ❌ | No user-generated content | None |
| **Social / Institutional** | ✅ MEDIUM | CAN Health Network endorsement → multiple CHCs trust → network of CHCs promotes to their patients | Medium — institutional network effect, not personal |

**Honest assessment:** TriageAI is not a classic network effects product (it's a voice service, not a social platform). The strongest effect is **data + institutional trust** — not viral growth. Don't try to engineer a viral loop that doesn't naturally exist here.

***

### 3.2 — Data Network Effect Design

**The actual flywheel for TriageAI:**

```
CHC pilots TriageAI
  → Hundreds of real Ontario triage calls generated
    → CTAS classifier calibrated on real call patterns
      → Routing accuracy improves (measured in dashboard)
        → CHC director sees "our escalation rate dropped 18%"
          → CHC refers TriageAI to CAN Health Network colleagues
            → 2nd CHC pilots TriageAI
              → More data → even better classifier → ...
```

**Critical mass threshold:** 3 CHC clients + 500 calls/month — at this scale, CTAS distribution data becomes a meaningful Ontario benchmark ("your clinic's L3 rate is 14% vs. Ontario TriageAI average of 11%").

**Cold start strategy (before critical mass):** Publish the demo number publicly. Every person who calls the demo line is generating real CTAS training data. 200 demo calls/month in Phase 1 → classifier is validated on real voices before first CHC contract.

***

### 3.3 — Engineering Network Effects Into MVP

| Feature Modification | Current Design | Network-Enhanced Design | Effort |
| :-- | :-- | :-- | :-- |
| **Benchmark data in dashboard** | Each clinic sees only their own data | Add "Ontario average" comparison line to all charts once 3+ clinics onboard | 6 hrs (V2) |
| **CAN Health Network referral path** | No formal referral mechanism | Add "Recommend to a colleague" CTA in dashboard + one-click CHC onboarding guide | 4 hrs (V2) |
| **Open CTAS accuracy leaderboard** | Private performance data | Monthly public post: "TriageAI's accuracy this month: 94% on validated scenarios" — builds institutional trust | 0 hrs engineering, 2 hrs content |


***

## PILLAR 4 — Platform Lock-In \& Switching Costs

### 4.1 — Competitor Switching Cost Analysis

| Competitor | Switching Cost Type | Severity | What Traps Users |
| :-- | :-- | :-- | :-- |
| **Cabot Solutions** | Financial + Integration depth | HIGH | \$50K–\$200K implementation investment; Epic/Cerner integration woven into workflows; 6-month onboarding |
| **Dialogue** | Employer contract + team adoption | HIGH | Annual employer benefits contracts; whole team enrolled; changing requires HR/benefits procurement |
| **Maple** | Low — intentionally easy to leave | LOW | No contract; \$0 to stop. Users stay because it works. |
| **Health 811** | None — government service | NONE | Publicly funded; nobody is "locked in" |
| **Medium AI / Medi** | Workflow integration | MEDIUM | Clinic phone system configuration; staff training |

**Key insight:** TriageAI's initial switching cost is LOW (a feature, not a bug — it lowers the barrier to try it). The strategy is to build switching costs AFTER clinics experience value, not before.

***

### 4.2 — TriageAI Lock-In Strategy (Ethical, Value-Based)

| Lock-In Mechanic | How It Works | When to Introduce | Ethical? |
| :-- | :-- | :-- | :-- |
| **Historical session data** | 6 months of every call's CTAS level, routing, escalation — irreplaceable audit trail and quality improvement data | From Day 1 (every call logged) | ✅ User owns their data; export always available |
| **CTAS benchmark accumulation** | The longer a clinic uses TriageAI, the more their benchmarks improve in accuracy and context (seasonal trends, population shifts) | After 500 calls | ✅ Genuine clinical value |
| **CAN Health Network positioning** | Being the AI triage system that "Ontario CHCs use" creates institutional identity — switching means explaining why you left | After 2nd CHC client | ✅ Network trust, not hostage |
| **White-label phone number integration** | Clinic's own Twilio number → removing TriageAI means reconfiguring their entire phone system | Sprint 9 | ✅ They chose the integration |
| **Staff familiarity with dashboard** | After 3 months, clinic admin staff know the dashboard; retraining is a real cost | From Day 1 of admin access | ✅ Earned through genuine UX quality |

**What TriageAI will NEVER do:** Refuse data export, lock data in proprietary format, or make it technically difficult to leave. The open-source architecture IS the lock-in — clinics trust a system they can audit, and that trust is harder to rebuild with a competitor than the data itself.

***

### 4.3 — Reducing Switching Costs FROM Competitors TO TriageAI

| Competitor | Migration Friction | TriageAI Solution | Implementation |
| :-- | :-- | :-- | :-- |
| **From Cabot** | Clinic used to EMR integration — TriageAI doesn't have it | Offer CSV export from TriageAI session data that can be manually uploaded to any EMR. Position lack of integration as "privacy-first, no direct access to your patient records" | 2 hrs (CSV export already built in F7-T04) |
| **From Health 811 (as referring pathway)** | Staff trained to tell patients "call 811" — changing script takes effort | Provide a literal 1-page "Tell Your Patients" card with the TriageAI number — replace one instruction with one instruction | 0 hrs engineering, 2 hrs design |
| **From no triage system (most CHCs)** | No existing data to migrate — friction is adoption inertia, not migration | One 30-minute setup call + 1-day live number | Already built |

**UX Familiarity Shortcut:** Health 811's IVR system uses standard call center patterns. TriageAI's AI greeting should begin with a similar "Welcome to..." pattern so callers already familiar with 811 feel oriented. Do not make the AI sound jarring or novel — make it feel like the best version of what they already expect.

***

## PILLAR 5 — Data Moat

### 5.1 — Proprietary Data Assessment

| Data Type | How Generated | Volume (6mo/18mo) | Unique to TriageAI? | Competitive Value |
| :-- | :-- | :-- | :-- | :-- |
| **Ontario CTAS distribution per call** | Every triage call classifies a real symptom profile | 500 / 10,000 calls | YES — no Ontario service produces structured CTAS data at call level | HIGH — population-level clinical intelligence |
| **Routing accuracy validation** (which CTAS level maps to which routing in Ontario) | 20-scenario QA testing + CHC feedback | 20 scenarios / 200+ scenarios | YES — CTAS + Ontario routing resources is unique combination | HIGH — improves classifier |
| **Call duration per CTAS level** | Session logger (duration_sec by ctas_level) | 500 / 10,000 data points | YES — industry benchmark data | MEDIUM — useful for operational reports |
| **Escalation rate patterns** (which symptom profiles trigger L1/L2 at what rate) | Escalation events in system_events | 25 / 500 escalations | YES — no public Ontario dataset exists | HIGH — validates clinical model |
| **Peak call time patterns** (when Ontario patients seek triage guidance) | Session timestamps | 500 / 10,000 timestamps | MEDIUM — valuable for CHC staffing planning | MEDIUM |
| **Caller language distribution** (% English vs. French vs. other) | Language detection at call start (V2) | V2 only | MEDIUM | MEDIUM |


***

### 5.2 — Data-Powered Feature Design

| Data Source | Feature It Powers | Improves With Scale | Minimum Threshold | Replication Difficulty |
| :-- | :-- | :-- | :-- | :-- |
| **CTAS distribution per clinic** | "Your Community's Health Dashboard" — benchmark a clinic's population against Ontario average | Exponentially better at 5+ clinics | 3 clinics, 500 calls | HIGH — requires aggregate data from multiple deployments |
| **Routing accuracy by symptom keyword** | Auto-calibration of CTAS config — flag symptom-response patterns where AI routing diverges from CHC feedback | Improves weekly | 200 calls with outcome feedback | MEDIUM |
| **Escalation timing patterns** | Predict peak escalation hours → CHC can ensure human agent is always available during those windows | Better after 1,000 calls | 100 escalation events | MEDIUM |
| **Call duration benchmarks** | Show clinic "your avg call is 3.2 min vs. Ontario average 2.8 min — may indicate callers need clearer question prompts" | Meaningful at 500 calls | 500 calls | HIGH — requires multi-clinic aggregate |


***

### 5.3 — Data Flywheel

```
TRIAGEAI DATA FLYWHEEL:

CHC pilots TriageAI on their intake line
  → Real Ontario patients call with real symptoms
    → Every call generates: CTAS level, routing, escalation, duration
      → Aggregate data reveals Ontario population triage patterns
        → CTAS classifier recalibrated quarterly on real data
          → Routing accuracy improves (measurable in QA scenarios)
            → CHC director's dashboard shows better outcomes
              → CHC refers TriageAI to CAN Health Network peers
                → More CHCs join → More calls → More data → ...

FLYWHEEL SELF-SUSTAINING THRESHOLD: 3 CHC clients + 1,000 calls
  (At this point, benchmark comparison data becomes genuinely 
   valuable to new CHC prospects — the data sells the product)

DATA STRATEGY BEFORE THRESHOLD:
  Synthetic seed data: 100 clinically validated CTAS scenarios 
  (doctor-reviewed) pre-populate the accuracy benchmarks before 
  real call data accumulates. This prevents the cold-start problem 
  where the classifier looks unvalidated.
```


***

### 5.4 — Data Moat Timeline

| Stage | Timeline | State of Data Moat |
| :-- | :-- | :-- |
| Today → Sprint 11 | 0–3 months | No moat. Demo calls only. Classifier based on static config. |
| First CHC Pilot | Months 3–6 | Emerging moat. 200–500 real calls. Escalation rate baseline established. |
| 3 CHC Clients | Months 6–12 | Meaningful moat. Benchmark comparisons possible. CHC-to-CHC referral begins. |
| 10 CHC Clients | Months 12–18 | Durable moat. Ontario's most comprehensive CTAS population-level dataset. New entrants would need 1–2 years to replicate. |

**What accelerates the moat:** Getting 1 academic hospital or Ontario Health sub-organization to pilot TriageAI would generate 10,000+ calls/month instead of 500. One institutional partner = 10x data acceleration.

***

## PILLAR 6 — UX Differentiation

### 6.1 — UX Competitive Teardown

**COMPETITOR: Health 811**

```
CORE TASK — Get triage guidance for a symptom:
  Steps: Dial 811 → navigate IVR menus → wait on hold 
    → explain symptoms to nurse → receive advice
  Time: 5–25+ minutes (variable, officially <1 min)
  Friction: IVR navigation, hold music, explaining context
    again to nurse after hold
  Delight: Talking to a real human nurse is genuinely reassuring

FIRST-TIME EXPERIENCE:
  Time to first value: 2–10 minutes
  Onboarding: None required
  Empty state: N/A

VISUAL DESIGN (website): 
  Functional government design — accessible but not engaging
  Website has AI symptom checker buried under navigation

INFORMATION DENSITY: Low — designed for broadest possible audience

BIGGEST UX WEAKNESS: Unpredictable wait time creates 
  anxiety for the exact moment users are already anxious 
  (they're calling because something is wrong)
UX SCORE: 6/10
```

**COMPETITOR: Cabot Solutions**

```
CORE TASK — Deploy AI triage for a clinic:
  Steps: Discovery workshop (2 days on-site) → 
    4–6 week implementation → staff training → go-live
  Time to live: 4–6 weeks [web:69]
  Friction: Enterprise procurement, IT involvement, 
    clinical governance review
  Delight: Custom branded, deeply integrated with existing systems

FIRST-TIME EXPERIENCE:
  Time to first value: 4–6 weeks
  Onboarding: Full implementation team provided

BIGGEST UX WEAKNESS: Completely inaccessible to a 
  CHC director who wants to "try it this week" before 
  committing to a $50K contract
UX SCORE: 7/10 for enterprise buyers, 2/10 for small CHCs
```

**COMPETITOR: Maple**

```
CORE TASK — Get medical consultation:
  Steps: Download app → create account → verify identity → 
    select symptom → wait for doctor match → video call
  Time: 10–30 minutes to first doctor word
  Friction: App store, account creation, payment entry, 
    doctor availability
  Delight: Actual licensed doctor, prescriptions possible

FIRST-TIME EXPERIENCE:
  Time to first value: 15–30 minutes (first ever session)
  Onboarding: Account setup required
  
BIGGEST UX WEAKNESS: Complete overkill for a caller who 
  just needs to know if their headache warrants an ER visit. 
  Like calling a plumber to turn off a faucet. 
  AND it costs $49+.
UX SCORE: 8/10 for its use case, 3/10 for TriageAI's use case
```


***

### 6.2 — UX Advantage Map

| UX Dimension | Best Competitor | TriageAI Target | How to Achieve | Impact on Caller |
| :-- | :-- | :-- | :-- | :-- |
| **Time to first value** | Health 811: 1–25 min (variable) | < 5 seconds | AI answers instantly, greets within 3 sec | "It answered immediately. I couldn't believe it." |
| **Setup friction** | Maple: app + account + payment | Zero — just dial | Architecture decision: voice-only, no registration | "I didn't have to do anything. Just called." |
| **Caller anxiety management** | Health 811: hold music | Immediate empathetic AI greeting | Tone design in system prompt: warm, calm, clinical confidence | "It didn't feel like a robot. It felt like someone was listening." |
| **Routing clarity** | Health 811: nurse advice (sometimes vague) | Crisp, specific next step | Routing messages specify exact action + nearest resource | "It told me exactly where to go. Not just 'see a doctor.'" |
| **Caller trust signal** | Cabot: enterprise branding | Privacy-first, PIPEDA-first | Consent disclosure as first words; "no data stored" reassurance | "I felt safe telling it my symptoms." |


***

### 6.3 — TriageAI's 3 UX Bets


***

**UX BET \#1: Instant Calm**

```
UX BET: Emotional state of the caller in the first 5 seconds

Current Industry Standard: 
  Hold music + IVR menu ("Press 1 for English, Press 2 for...") 
  → adds anxiety to an already anxious caller

My Approach: 
  AI answers in <3 seconds with a warm, calm, human-sounding 
  voice: "Hi, you've reached TriageAI, your free 24/7 
  medical triage service for Ontario. I'm here to help you 
  figure out the right care. Let's start — what's your main 
  concern today?"
  
  No menu. No hold. No "your call is important to us."
  Just: answer → consent → first question.

User Perception Goal: "It felt like calling a calm, knowledgeable 
  friend who was immediately present. Not a call center."

Measurement: Post-call survey (via SMS) with one question: 
  "How did the call make you feel? 😰 Anxious / 😐 Neutral / 😌 Reassured"
  Target: >70% Reassured

Implementation: System prompt voice direction + 
  OpenAI Realtime voice selection (Alloy or Shimmer — 
  warm female voice, tested for warmth vs. authority)
```


***

**UX BET \#2: Specificity Over Vagueness**

```
UX BET: Routing decision specificity

Current Industry Standard:
  Health 811 nurse: "You should probably see a doctor in the 
  next day or two" (helpful but vague)
  
My Approach:
  "Based on what you've told me, I recommend going to an 
  urgent care clinic today — not the emergency room, 
  but don't wait until tomorrow. You can find urgent care 
  clinics near you at 811.ca, or search 'urgent care 
  [your city]'. Do you need me to repeat that?"
  
  Specific: correct care level, correct urgency frame, 
  a resource to act on, and an offer to repeat.

User Perception Goal: "I knew exactly what to do when I hung up."

Measurement: Track whether L4 callers actually reach walk-in 
  clinics (via post-call SMS + optional opt-in follow-up) 
  vs. ER admissions data (public Ontario data comparison — V2)

Implementation: Routing message templates in triage_config.json 
  with specific action verbs and resource references for each level
```


***

**UX BET \#3: Clinic Dashboard — Data Density Done Right**

```
UX BET: Admin dashboard information density

Current Industry Standard:
  Cabot: Data-dense, enterprise-style dashboards designed 
  for hospital IT directors — overwhelming for a CHC coordinator
  Health 811: No dashboard at all — zero clinic data

My Approach:
  Phase 5 design system — Linear-inspired dark dashboard:
  - 4 stat cards visible above the fold: Total Calls, 
    Escalation Rate, Avg Duration, Non-Emergency Deflected
  - One CTAS donut chart. One recent sessions list.
  - Nothing else on the overview page.
  
  "If a CHC coordinator can understand what happened today 
  in under 30 seconds, the dashboard won."

User Perception Goal (clinic staff): "I check it every morning 
  in 30 seconds and I always know exactly what's happening."

Measurement: Session recording (if consented) or user 
  interviews — how long does it take a new clinic admin 
  to find a specific call from yesterday?
  Target: < 45 seconds with zero training

Implementation: Already specced in Phase 5 — SCR-05/06/07 
  with skeleton loading, empty states, and simplified nav
```


***

### 6.4 — Same Feature, Better Execution

| Feature | How Competitor Does It | What Users Dislike | TriageAI's Better Version | Why It Wins |
| :-- | :-- | :-- | :-- | :-- |
| **Triage questioning** | Health 811: Nurse asks open-ended questions, callers get confused about what information to give | "I didn't know what to say" | AI asks 5 specific, structured questions in plain language, one at a time, with a follow-up prompt if the answer is unclear | Structured but feels natural; caller always knows what's expected |
| **Emergency escalation** | Health 811: "I need to transfer you" → hold → new person → repeat symptoms | Repeating symptoms is frustrating and time-wasting (and dangerous in L1 situations) | AI bridges human agent with 5-second spoken triage summary BEFORE caller speaks to human | Human agent is ready; caller never repeats |
| **Routing decision delivery** | Health 811: Conversational, sometimes vague | "I wasn't sure if it was urgent or not" | Explicit urgency label ("this is urgent, today, not tomorrow") + specific resource + repeat offer | No ambiguity about what to do |
| **Session history for clinic** | Cabot: Full session transcript in dashboard | "I'm worried about storing patient data" | CTAS level + routing + timeline events — zero health content stored | Clinical value WITHOUT privacy liability |
| **Access for tech-averse callers** | Maple: Requires account creation | Elderly/low-income users disproportionately cannot or will not download apps | Just a phone call — works on a 2005 landline | Reaches the exact population that needs it most |


***

## FINAL STRATEGY SUMMARY

### Compete On (10x Bets — Where Every Resource Goes):

1. **0-second answer, zero friction** — TriageAI answers before Health 811 puts you on hold
2. **CTAS-structured output for clinics** — the only triage call that produces machine-readable clinical data
3. **Zero-PII, open-source trust architecture** — PHIPA compliance you can audit, not just claim

### Match (Table Stakes — Required to Be Considered):

- PHIPA + PIPEDA compliance → ✅ done
- Canadian data residency → ✅ done
- 24/7 availability → ✅ done
- French language support → ❌ Sprint 8
- White-label clinic phone number → ❌ Sprint 9
- One-page clinical validation document → ❌ Next 2 weeks (docs only)


### Ignore (Deliberate Exclusions):

- **Telehealth / doctor consultations** — Maple and Dialogue own this; TriageAI is routing, not care
- **EMR integration at MVP** — Cabot has it; negotiate it as a paid V2 add-on after pilot success
- **Mobile app** — destroys the zero-friction advantage
- **20+ language support at MVP** — French only; multilingual in V2 after clinical validation per language
- **Video consultation** — completely wrong product category


### Moat Timeline:

- **Month 3:** Zero-friction positioning moat (structural — competitors can't replicate without destroying existing business models)
- **Month 6:** First CTAS calibration data moat (500+ real Ontario calls)
- **Month 12:** Institutional trust moat (2–3 CHC clients on CAN Health Network radar)
- **Month 18:** Data moat durable (10,000+ calls, Ontario benchmark dataset unique in market)

***

### Competitive Positioning Statement

> *"I used to call Health 811 when I wasn't sure whether to go to the ER. Sometimes I'd wait 20 minutes on hold and hang up. Now I just call the TriageAI number — it answers immediately, asks me five clear questions, and tells me exactly where to go. Last week it told me my symptoms weren't an emergency and pointed me to an urgent care clinic two blocks away. I didn't end up wasting four hours in the ER. The whole call was under three minutes. And honestly? It felt like it actually listened."*

***

## This Week's Strategic Moves (Ordered by Impact)

**Move 1 — Publish the clinical validation document (Tuesday)**
Write a 1-page PDF: "TriageAI Clinical Basis" — citing CTAS 2022 standard, explaining the 5-question methodology, and noting the zero-PII architecture. Have any MD/RN contact review it. Post it to GitHub. This is the single highest-leverage trust document for every CHC outreach email.

**Move 2 — Register the Twilio demo number and get a live call working (Wednesday)**
A live, callable demo number is your most powerful competitive weapon. Every person you email a CHC director, share on LinkedIn, or demo to a researcher can call it in 30 seconds. No deck, no Loom video, no pitch replaces "call this number right now."

**Move 3 — Create the CHC pilot outreach template (Thursday)**
Write one cold outreach email specifically to Community Health Centre executive directors in Toronto and Ottawa. Subject line: "Free 30-day TriageAI pilot for your intake line — no integration, no contract, works tomorrow." Attach the clinical validation document. Send to 10 CHCs this week.

**Move 4 — Set up the GitHub repo as public with MIT license (Thursday)**
The open-source positioning is a competitive weapon vs. Cabot and Medi — but only if the repo is actually public. Add a clear README with: what it is, clinical basis, PHIPA architecture, how to deploy. This is your credibility signal to Ontario Health researchers and policy people who will Google you.

**Move 5 — Register on CAN Health Network's innovator directory (Friday)**
CAN Health Network ([canhealth.com](https://canhealth.com)) is the single most important Ontario health innovation body for connecting to CHC pilots. Submit a company profile this week. It takes 20 minutes and puts TriageAI in front of procurement-ready CHC buyers. This is where your first paying client will come from — not Product Hunt.[^7]
<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^17][^18][^19][^20][^21][^22][^23][^24][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://thelocal.to/health811-telehealth-wait-times-ontario/

[^2]: https://www.ontariohealth.ca/news/health811-resources-help-providers-support-patients-in-accessing.html

[^3]: https://www.cabotsolutions.com/loc/ai-powered-voice-agents-ontario-healthcare

[^4]: https://ca.linkedin.com/company/medium-ai

[^5]: https://talktomedi.com

[^6]: https://ogaei.ca/blog/comparison-of-telemedicine-platforms-in-ontario-ogaei-maple-tia-health-rocket-doctor-telus-mycare/

[^7]: https://canadianhealthcarenetwork.ca/appointment-booking-ai-triage-pilot-launches-ontario

[^8]: 08-competitive-strategy-prompt.md

[^9]: https://arxiv.org/html/2309.08865v3

[^10]: https://pmc.ncbi.nlm.nih.gov/articles/PMC10900097/

[^11]: https://pmc.ncbi.nlm.nih.gov/articles/PMC11412733/

[^12]: https://pmc.ncbi.nlm.nih.gov/articles/PMC11836802/

[^13]: https://www.frontiersin.org/articles/10.3389/fdgth.2023.1297073/pdf?isPublishedV2=False

[^14]: https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2024.1391906/pdf

[^15]: https://journals.sagepub.com/doi/10.1177/20552076251334422

[^16]: https://dx.plos.org/10.1371/journal.pone.0281733

[^17]: https://www.canhealth.com/2025/02/12/treatment-com-to-acquire-rocket-doctor/

[^18]: https://peakdemand.ca/c/manufacturing/b/ai-receptionist-gta-toronto-ai-agency-voice-ai-receptionist-ivr-phone-system-replacement-ai-call-answering-service-crm-lead-capture-appointment-booking-healthcare-manufacturing-contractors-compete-2026

[^19]: https://canvasbusinessmodel.com/blogs/competitors/dialogue-competitive-landscape

[^20]: https://www.cabotsolutions.com/loc/ai-powered-voice-agents-healthcare-toronto

[^21]: https://ogaei.ca/blog/best-ontario-telemedicine-platforms/

[^22]: https://westernyorkregionoht.ca/health-connect-ontario-has-undergone-a-name-change-to-health811/

[^23]: https://digitalhealthcanada.com/membership/chief-executive-forum/inititatives/ai-in-action/

[^24]: https://www.canada.ca/en/health-canada/corporate/transparency/health-agreements/bilateral-agreement-pan-canadian-virtual-care-priorities-covid-19/wave-three-early-diagnostic-policy-recommendations.html

