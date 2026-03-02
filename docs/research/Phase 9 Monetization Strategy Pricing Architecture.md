<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# let's work on that phase

Now I have all the real pricing data I need. Here is the complete Phase 9 Monetization Architecture for TriageAI.

***

# Phase 9 — Monetization Strategy \& Pricing Architecture

## TriageAI — Complete Revenue Model Blueprint

**Product:** AI voice agent answers Ontario patient calls, triages via CTAS L1–L5, routes to correct care setting, warm-transfers emergencies
**Primary Buyer:** Community Health Centre (CHC) directors and clinic administrators
**End User (non-payer):** Ontario patients — calls are always free to callers
**Core Value Action:** Every completed triage call that correctly routes a patient and produces a structured CTAS record
**Usage Pattern:** Event-driven (patient calls in) — 50–1,500 calls/month per clinic depending on size
**Stage:** Pre-launch / MVP building
**Business Goal:** Replace salary income → build to sell or raise seed round
**Resources:** Solo developer, \$0 marketing budget, bootstrapped

> **Fundamental monetization reality:** TriageAI has TWO users — the patient (who never pays, and must never pay) and the clinic/CHC (who pays because TriageAI solves their call volume, staffing cost, and compliance reporting problems). Every pricing decision flows from one question: *"Does this make it easier or harder for a CHC director to say yes?"*

***

## SECTION 1 — Monetization Model Selection

### 1.1 — Model Fit Analysis

| Model | How It Would Work for TriageAI | Fit Score | Why / Why Not |
| :-- | :-- | :-- | :-- |
| **Freemium (B2C)** | Free for individual callers with paid "premium triage" tier | 1/10 | Patients won't pay for triage — this is a healthcare access issue. Charging callers is ethically indefensible and commercially broken. Zero revenue ceiling. |
| **Subscription B2C (flat)** | Monthly fee per individual user | 1/10 | Same problem. The payer is the clinic, not the caller. Wrong model entirely. |
| **Subscription B2B (per seat)** | Monthly fee per clinic admin seat | 5/10 | Works for the dashboard, but "seats" don't capture the actual value unit (calls handled). 3 seats at a CHC vs. 30 seats at a hospital shouldn't cost the same. |
| **Usage-Based / Pay-As-You-Go** | \$X per triage call completed | 8/10 | Perfectly aligns with value — clinics pay for calls handled. But unpredictable monthly costs create budget friction for publicly-funded CHCs on fixed annual budgets. Works better as an overage model than a pure PAYG. |
| **Transaction / Commission** | % of cost saved per ER deflection | 3/10 | Interesting conceptually but impossible to attribute — TriageAI can't prove a given caller would have gone to the ER. Unverifiable, uncollectable. |
| **One-Time Purchase** | One-time license fee | 2/10 | Zero revenue after sale. No ongoing relationship. Misaligns incentives — TriageAI has no reason to keep improving. Doesn't work for cloud-hosted AI with ongoing API costs. |
| **Advertising** | Display ads to callers during call | 0/10 | Medical ethics violation. Would destroy trust instantly and violate PHIPA spirit. Never. |
| **Enterprise Licensing** | Custom contracts with hospital networks / OHTs | 9/10 | Perfect for scale. OHTs (Ontario Health Teams) serve 150,000+ people — a single OHT contract could be \$5K–\$30K/month. But not accessible at MVP without existing track record. Becomes the growth engine after 3+ CHC pilots validate the product. |
| **Hybrid: Flat Base + Usage Overage** | Monthly fee covers a call bundle; per-call fee above bundle | **9/10** | Gives clinics predictable budget planning AND captures upside from high-volume usage. Exactly how Twilio, Intercom, and Zendesk price. Directly solves the CHC budget certainty problem. |
| **Open Core** | Self-hosted (MIT open source) free; cloud-hosted managed = paid; enterprise SLA = contract | **9/10** | Perfectly aligned with TriageAI's open-source positioning from Phase 8. Health systems with IT capacity self-host for free (trust builder) while smaller CHCs pay for managed cloud. Creates institutional credibility that drives enterprise sales. |


***

### 1.2 — Recommended Model: Open Core + Hybrid B2B SaaS

**I recommend the Open Core + Hybrid B2B SaaS model for three specific reasons:**

**Reason 1 — Open source as a trust accelerator for healthcare buyers.** Ontario CHCs and public health bodies have procurement committees that scrutinize software. An auditable open-source codebase with MIT license eliminates the black-box objection that kills every enterprise competitor's pilot conversations. The code IS the sales brochure.[^1]

**Reason 2 — Flat + overage pricing matches how CHC budgets work.** Community health centres operate on annual government funding cycles. They need to tell their board "TriageAI costs us \$X per month." Pure PAYG creates variance they can't plan around. A flat monthly base with a capped overage rate gives them predictability while TriageAI captures revenue from high-volume months.

**Reason 3 — Open Core creates a natural enterprise sales funnel.** A hospital IT team self-hosts the open source version → discovers they want managed hosting + SLA + EMR integration → that's the enterprise contract. GitHub stars and self-hosted deployments become the top of a sales funnel that costs \$0 to maintain.

**Rejected models and why:**

- **Pure PAYG** rejected: CHC finance directors on fixed annual budgets cannot approve variable monthly costs. "It depends on how many calls" is not an answer that gets past procurement.
- **Per-seat** rejected: the value unit is triage calls completed, not admin logins. A clinic with 1 admin seeing 800 calls/month delivers far more value than one with 3 admins seeing 50 calls/month.
- **B2C/freemium** rejected: patients are the end-user, not the buyer. Never charge for medical triage access.

**What would change this recommendation:**

- If 10+ hospitals (not CHCs) start adopting → shift to pure enterprise licensing + SLA contracts at \$10K–\$50K/month
- If open source self-hosting becomes dominant → shift to enterprise support contracts (Red Hat model)
- If Ontario Health or a LHIN approaches for province-wide deployment → government procurement / single-payer model

***

## SECTION 2 — Competitor Pricing Deep Dive

### 2.1 — Competitor Pricing Matrix

```
COMPETITOR: Health 811 (Ontario Telehealth)
Free Tier: Free for all Ontario residents (government funded)
Tier 1: N/A — publicly funded service
Enterprise: N/A — government department
Billing: Government funding (not market-priced)
What It Provides: Nurse-staffed phone triage + advice
Pricing Complaints: Not priced by clinics; the issue is wait times 
  and zero data output to referring clinics [web:71]
Relevant Benchmark: TriageAI is NOT competing with 811 on patient 
  pricing — it complements 811 by handling overflow and structured 
  pre-triage BEFORE patients call 811 or go to ER
```

```
COMPETITOR: Cabot Solutions
Free Tier: None
Tier 1: No public pricing — enterprise-only, custom quotes
Implementation: Discovery workshop (2-day) + 4-6 week deployment [web:83]
Implied Pricing: $50,000–$200,000 implementation fee (inferred from 
  "end-to-end partnership" model, EHR integration, clinical workshops)
Ongoing: Estimated $5,000–$30,000/month managed service
Billing: Annual enterprise contract
Free Trial: No — pilot requires full procurement cycle
What Unlocks Paid: There is no free tier — everything is paid
Pricing Complaints: Too expensive and too slow for CHCs; 4-6 week 
  implementation is a dealbreaker for budget-constrained public clinics [web:83]
TriageAI Opportunity: "Deploy tomorrow, $0 to start" vs. 
  "$50K and 6 weeks before first call"
```

```
COMPETITOR: Maple
Free Tier: None
Per-Visit: $210/GP consultation (up to 11pm daily) [web:93]
Specialist: $160+ per consultation [web:93]
Family Membership: $79.99/month (family coverage) [web:90]
Employer Plans: Variable (covered by benefits)
Billing: Pay-per-visit or monthly subscription
What Unlocks Paid: Access to a licensed physician
Pricing Complaints: $210/visit is prohibitive for unattached 
  low-income Ontario patients; requires app + account [web:87]
TriageAI Irrelevance: Maple is a telehealth consultation service; 
  TriageAI is a triage ROUTING tool. They solve different problems. 
  TriageAI routes callers TO services like Maple or walk-in clinics.
```

```
COMPETITOR: Dialogue Health
Free Tier: None — employer/insurer funded
Pricing Model: B2B per-employee-per-month
Primary Care: $3.36/employee/month [web:92]
Mental Health+: $5.63/employee/month [web:92]
EAP Standalone: $3.44/employee/month [web:92]
Full Bundle: $11.47/employee/month [web:92]
Billing: Annual employer contracts
Minimum: Typically 25+ employees
What Unlocks Paid: Employer purchases access for all employees
Pricing Complaints: Not accessible to individuals without employer 
  coverage; not relevant to unattached patients
TriageAI Irrelevance: Employer-funded virtual care; TriageAI is 
  CHC-funded public triage. Different buyers, different populations.
```

```
COMPETITOR: TELUS Health MyCare
Free Tier: None
Per-Visit: $70/visit without provincial insurance [web:90]
Counsellors: $120/50-minute session [web:90]
Clinical Psychologist: $225/50-minute initial visit [web:90]
Billing: Pay-per-visit
TriageAI Irrelevance: Same as Maple — consultation service, 
  not a triage routing tool. TriageAI would route appropriate 
  callers TO TELUS MyCare or similar services.
```


***

### 2.2 — Pricing Positioning Map

```
HIGH PRICE (per clinic / per month)
         │
$10K+    │  [Cabot Solutions — enterprise custom]
         │  [Hospital-grade EHR-integrated solutions]
         │
$1K-5K   │  
         │              ← TRIAGEAI ENTERPRISE TARGET (OHT/Hospital)
$500-1K  │  
         │              ← TRIAGEAI GROWTH PLAN (CHC Network)
$200-500 │  
         │              ← TRIAGEAI STARTER PLAN (small clinic/CHC)
$0-200   │  [Health 811 — government, free]
         │  [TRIAGEAI FREE PILOT]
LOW PRICE└──────────────────────────────── HIGH CLINICAL VALUE
         LOW CLINICAL VALUE

EMPTY SPACE IDENTIFIED: The $200-$1,500/month range for 
structured AI triage with clinic dashboard is completely unoccupied:
  - Below it: free government service (no data, variable wait)
  - Above it: $50K+ enterprise implementations (too slow, too expensive)
  TriageAI owns this gap. This is the pricing sweet spot.
```


***

### 2.3 — Willingness-to-Pay Analysis

**Buyer: CHC / Community Clinic Director (budget authority: \$10K–\$100K discretionary annually)**


| Price Dimension | Amount | Rationale |
| :-- | :-- | :-- |
| **Maximum willingness to pay (monthly)** | \$1,500–\$2,500 | CHC overnight staffing alternative: 1 RN × 4 hrs × 20 nights = ~\$3,000/month minimum. Any AI solution under \$2,500 is immediately ROI-positive vs. overnight staffing. |
| **Optimal conversion price (monthly)** | \$299–\$599 | Below the "requires board approval" threshold at most CHCs (~\$1,000/month). Easy for a program director to approve on operational budget. |
| **Price below which quality is questioned** | < \$99 | Healthcare buyers are suspicious of cheap AI tools. Under \$99/month signals "toy" or "not maintained." PHIPA compliance work alone is worth more. |
| **Recommended price range** | **\$249–\$999/month** | Covers the range from small clinic pilots to full CHC deployments. Below procurement committee threshold for smaller amounts. |

**Key insight:** The real ROI argument isn't price — it's cost avoidance. A CHC that deflects 20 unnecessary ER visits per month saves Ontario health system ~\$20,000. TriageAI charging \$499/month for this outcome is a **40:1 ROI**. Price it confidently.

***

## SECTION 3 — Tier Architecture Design

### 3.1 — Complete Tier Structure


***

```
TIER 0: FREE PILOT
Name: "Pilot"
Price: $0 — limited to 60 days
Purpose: Remove ALL friction from the first "yes." CHC directors 
  cannot approve untested software for patient-facing use. 
  The pilot is the product demo. This tier exists to get a live 
  number in one CHC's hands within 48 hours of first contact.

Includes:
  • 100 triage calls over 60 days
  • Full admin dashboard (all screens)
  • Complete CTAS classification + routing
  • Emergency escalation active
  • Session logs + system events
  • PIPEDA/PHIPA compliance architecture
  • Email onboarding support

Limits:
  • 60-day hard expiry (not renewable — convert or offboard)
  • 100-call cap (hard stop — AI tells callers "service temporarily 
    unavailable" gracefully)
  • Single clinic phone line only
  • No white-label (answers as "TriageAI")
  • No CSV data export (dashboard view only)

What's Missing (drives upgrade):
  • Continued access after 60 days (time limit is the trigger)
  • Higher call volumes (100 calls runs out fast)
  • White-label with clinic's own branding/number
  • Data export for clinic records
  
Conversion Psychology: Sunk cost + proof of value. After 60 days 
  of real calls, the CHC has data showing call deflection rates, 
  CTAS distribution, and staff time saved. The dashboard IS the 
  sales pitch at renewal time.
```


***

```
TIER 1: STARTER CLINIC — $249/month
(Annual: $199/month, billed $2,388/year — 20% discount)

Name: "Clinic"
Purpose: Primary revenue driver for small-to-medium CHCs 
  and family health teams (FHTs) with moderate call volume.
  This is where 60-70% of paying clients will land.

Includes:
  • 200 triage calls/month included
  • $1.75/call over 200 (hard cap option available at 300)
  • Single clinic phone line
  • Full admin dashboard (overview, sessions, session detail)
  • CTAS L1–L5 classification on every call
  • Emergency escalation (warm transfer to designated number)
  • Monthly CTAS distribution report (PDF export)
  • Session CSV export
  • French language support
  • PIPEDA/PHIPA compliance documentation
  • Business Associate Agreement (BAA equivalent for Ontario)
  • Email support (48-hour response SLA)
  
Target User: Small-medium CHC with 1–3 intake lines, 150–300 calls/month. 
  Family Health Teams (FHTs) with evening/weekend overflow coverage need.

Unit Economics at $249/month (200 calls):
  Revenue: $249
  OpenAI cost (200 × $0.62): $124
  Twilio cost (200 × $0.04): $8
  Infrastructure share: $25
  Total cost: $157
  Gross margin: $92/month (37%)
```


***

```
TIER 2: GROWTH CHC — $599/month
(Annual: $479/month, billed $5,748/year — 20% discount)

Name: "CHC Growth"
Purpose: Full-scale CHC deployment. Larger call volumes, 
  multiple access points, white-label for clinic identity.
  This is where revenue scales — 2-3 of these clients = 
  meaningful MRR.

Includes everything in Starter, PLUS:
  • 600 calls/month included (3x Starter)
  • $1.50/call over 600
  • Up to 3 clinic phone lines (different departments/sites)
  • White-label: AI greets callers as the clinic's own service
    ("You've reached Ottawa Community Health Centre's 
     24/7 triage line...")
  • Custom clinic phone number via Twilio (provisioned for them)
  • Weekly automated email report to clinic director
  • Custom routing resources (add local clinic addresses, 
    specific walk-in hours for their geography)
  • Priority email support (24-hour SLA)
  • Quarterly clinical accuracy review call (30 min)

Target User: Mid-large CHC, OHT member organizations, 
  family health teams with evening/weekend intake problem.
  500–800 calls/month volume.

Unit Economics at $599/month (600 calls):
  Revenue: $599
  OpenAI cost (600 × $0.62): $372
  Twilio cost (600 × $0.04): $24
  3 Twilio numbers: $9
  Infrastructure share: $35
  Total cost: $440
  Gross margin: $159/month (27%)
```


***

```
TIER 3: OHT / NETWORK — $1,199/month
(Annual: $959/month, billed $11,508/year — 20% discount)

Name: "OHT Network"
Purpose: Ontario Health Teams, hospital foundations, or 
  multi-site CHC networks serving large populations. 
  This tier is the enterprise feeder — clients here become 
  the references that unlock $5K–$30K/month enterprise contracts.

Includes everything in Growth, PLUS:
  • 2,000 calls/month included
  • $1.25/call over 2,000
  • Up to 10 clinic phone lines / departments
  • Population-level analytics (available once 3+ clients active)
    — "Your CHC's L3+ rate vs. Ontario TriageAI benchmark"
  • Aggregate CTAS trend reports (monthly)
  • API access to session data (webhook + REST for EMR bridge)
  • Custom CTAS configuration (add clinic-specific triage rules)
  • Dedicated phone/email support (same-day response SLA)
  • Slack Connect channel with TriageAI team
  • Monthly strategic review call

Target User: Ontario Health Teams (OHTs), multi-site CHC networks, 
  hospital outreach programs, public health unit pilots.

Unit Economics at $1,199/month (2,000 calls):
  Revenue: $1,199
  OpenAI cost (2,000 × $0.62): $1,240 ← variable costs tight here
  Twilio cost (2,000 × $0.04): $80
  10 Twilio numbers: $30
  Infrastructure: $50
  Total cost: $1,400
  Gross margin: -$201 (NEGATIVE at base)
  Break-even: requires ~1,600 calls to break even
  → Overage revenue (calls 2,001+) at $1.25/call = $312.50 per 
    extra 250 calls = profitable tier overall at 2,250+ calls
  
  NOTE: This tier is priced strategically LOW to land OHT clients 
  who become references. Revenue comes from overages + enterprise 
  upsell. Do not optimize this tier for margin — optimize for logos.
```


***

```
TIER 4: ENTERPRISE — Custom Pricing ($3,500–$30,000+/month)
Name: "Enterprise / OHT Deployment"

Designed for:
  • Ontario Health Teams (OHTs) — 157K+ patient catchment
  • Hospital networks with multiple intake lines
  • LHIN/provincial department pilot programs
  • Any organization requiring custom SLA, uptime guarantees, 
    EMR integration, or custom CTAS workflow

Includes everything in OHT Network, PLUS:
  • Unlimited calls (fixed monthly capacity block)
  • Custom CTAS workflow design (clinical advisor session included)
  • EMR integration (Epic/Cerner — V2, 3-month implementation)
  • 99.9% uptime SLA with credits for downtime
  • Dedicated AWS EC2 instance (isolated from multi-tenant)
  • Custom data retention + audit log policies
  • Executive sponsor relationship
  • Legal: custom BAA + data processing agreement
  • On-site training for clinic staff (Toronto, remote for others)

Pricing basis: $3,500/month base + $0.80/call (volume negotiated)
Contract: Annual minimum, custom terms
Sales cycle: 3–6 months (procurement, clinical governance, IT security)
```


***

```
OPEN SOURCE SELF-HOSTED TIER: FREE FOREVER (MIT License)
Name: "Self-Hosted Community"

What it is: The full TriageAI codebase on GitHub. 
  Health systems or university research teams with IT resources 
  can deploy on their own infrastructure at zero cost.

Includes:
  • Full source code (FastAPI backend + React frontend)
  • Docker-compose local deployment
  • Alembic migrations + Supabase schema
  • Documentation for self-hosted setup
  • Community support via GitHub Issues

Does NOT include:
  • Hosted dashboard (you deploy your own)
  • SLA or guaranteed uptime
  • TriageAI's Twilio number provisioning
  • Managed AI model tuning
  • Compliance documentation for enterprise use

Strategic purpose: 
  • Builds trust that makes cloud tier sales easier
  • Attracts hospital IT teams who become enterprise clients
  • Creates GitHub credibility for grant applications and 
    CAN Health Network positioning
  • Differentiates from Cabot (can't audit their code)
```


***

### 3.2 — Upgrade Trigger Design

**PRIMARY UPGRADE TRIGGER: Pilot Expiry at 60 Days**

```
When: Day 57 of 60-day pilot (3-day advance warning)
What They See: 
  Email to clinic director: "Your TriageAI pilot ends in 3 days.
  Here's what happened during your pilot:
    ✅ 87 calls triaged (42 hours of staff time saved)
    ✅ 14 emergency escalations handled correctly
    ✅ 31 callers redirected from ER to walk-in (estimated 
       $31,000 in ER deflection savings)
    ✅ 0 PHIPA incidents
  
  Continue with TriageAI Clinic for $249/month — that's $8.05/day
  to keep your 24/7 AI triage line running.
  [Upgrade Now →]"

Why It Works: The dashboard data makes the ROI argument for you.
  The clinic director has already seen the value. The pilot was 
  designed so that by day 60, they cannot imagine going back to 
  missed calls and no data.

Conversion Psychology: Loss aversion (losing a working system) + 
  quantified ROI (the email shows the dollar value). Anchoring 
  against the real alternative (1 RN night shift × 20 nights = $7,000/month).
```

**SECONDARY TRIGGERS:**


| Trigger Moment | What Clinic is Doing | Upgrade Message | Conversion Lift |
| :-- | :-- | :-- | :-- |
| **Call cap hit (95 of 100 pilot calls used)** | Monitoring dashboard, sees call volume | In-app banner: "You've used 95% of your pilot calls. Upgrade to Clinic plan to keep your triage line open — or callers will hear 'service unavailable.'" | HIGH — active service = active stakes |
| **White-label request** | Clinic asks "can callers hear our clinic name?" | "White-label branding is available on the CHC Growth plan. Upgrade to have callers hear '[Your Clinic] 24/7 Triage Service.'" | MEDIUM |
| **Data export request** | Director wants to include data in board report | "CSV export of your session data is available on paid plans. Upgrade to download your complete triage records." | MEDIUM — drives timing of conversion |
| **Second phone line request** | Growing clinic wants a second triage line for a satellite site | "Additional phone lines are available on CHC Growth and above. Add your satellite site for \$599/month total." | HIGH — reveals expansion intent |


***

### 3.3 — Anti-Patterns to Avoid

| Mistake | Why It's Tempting | What Happens | How to Avoid |
| :-- | :-- | :-- | :-- |
| **Making the pilot too short (7-14 days)** | Want to convert faster | Not enough call volume for the ROI story to emerge; clinic cancels before seeing value | Keep pilot at 60 days minimum — monthly call volumes need to accumulate |
| **Charging callers anything** | "They benefit too" | Instant ethical collapse; CHC refuses to deploy a service that charges sick patients; media story risk | Never. Callers are always free. The clinic pays. |
| **Too many tiers at launch (5+)** | Want to capture every segment | Decision paralysis at CHC procurement; harder to explain in a 15-minute demo call | Launch with Free Pilot + Starter + Growth only. Add OHT tier once first 3 clients are live. |
| **Per-seat pricing for dashboard users** | Seems logical since Dialogue does it [^2] | Clinics game it by sharing one login; creates friction for adding new staff; doesn't reflect real value unit | Price on call volume, not seat count. Unlimited dashboard users on all plans. |
| **Hiding CTAS data behind a paywall** | Want to force upgrade | CTAS output IS the core value — a clinic that can't see their classification data will not pilot. Give full data access even in pilot. Gate export and benchmarking, not data visibility. | Full dashboard always accessible; limit export and advanced analytics |


***

## SECTION 4 — Pricing Math \& Unit Economics

### 4.1 — Revenue Model Projections

```
═══════════════════════════════════════════════════════
SCENARIO A: 6 MONTHS (Early Traction — Spring 2026)
═══════════════════════════════════════════════════════
Assumptions:
  • CAN Health Network outreach begins Week 1 post-launch
  • 3 CHC pilots started (2 convert, 1 remains on pilot)
  • 0 OHT or enterprise clients yet

Active Clients:
  Free Pilot (1 active):               $0/month
  Starter Clinic (1 client × $249):    $249/month
  Growth CHC (1 client × $599):        $599/month

Base MRR:                              $848/month
Overage estimate (200 extra calls):    +$300/month
  TOTAL MRR:                           ~$1,148/month
  Annual Run Rate:                     ~$13,776/year

Monthly Cost Structure:
  AWS EC2 (ca-central-1):             $80/month
  Supabase Pro:                        $25/month
  OpenAI API (all clients):            $540/month
  Twilio (all clients):                $35/month
  Domain + misc:                       $15/month
  TOTAL COSTS:                         $695/month
  
  NET PROFIT:                          ~$453/month
  
Revenue Target:   $1,000/month MRR ← achievable with 1 Starter + 1 Growth
Notes: Year 1 is about proof of concept and reference clients, 
  not revenue maximization.
```

```
═══════════════════════════════════════════════════════
SCENARIO B: 18 MONTHS (Growth — Summer 2027)
═══════════════════════════════════════════════════════
Assumptions:
  • 3 CHC reference clients generating warm introductions
  • CAN Health Network listing driving inbound
  • 0% monthly churn (healthcare contracts are sticky)
  • 1 OHT pilot converted to Network plan

Active Clients:
  Starter Clinic (4 × $249):          $996/month
  Growth CHC (3 × $599):              $1,797/month
  OHT Network (1 × $1,199):           $1,199/month
  Enterprise pilots (0 yet):          $0

Base MRR:                              $3,992/month
Annual plan discount applied 
  (60% of clients on annual):         -$150/month (net after discount)
Overage revenue:                       +$600/month
  TOTAL MRR:                          ~$4,442/month
  Annual Run Rate:                     ~$53,300/year

Monthly Cost Structure:
  Infrastructure (scaled):             $150/month
  OpenAI API (all clients, 4,000 calls): $2,480/month
  Twilio:                              $180/month
  Stripe fees (~2.9%):                 $129/month
  TOTAL COSTS:                         $2,939/month
  
  NET PROFIT:                          ~$1,503/month
  Gross Margin:                        34%

Revenue Target:   $4,000 MRR ($48,000 ARR) = "replace salary" milestone
```

```
═══════════════════════════════════════════════════════
SCENARIO C: 36 MONTHS (Scale — Early 2029)
═══════════════════════════════════════════════════════
Assumptions:
  • First enterprise OHT contract signed ($5K/month)
  • CAN Health Network or Ontario Health endorsement
  • Steady-state: 15 Starter + 8 Growth + 3 OHT + 1 Enterprise

Active Clients:
  Starter Clinic (15 × $249):         $3,735/month
  Growth CHC (8 × $599):              $4,792/month
  OHT Network (3 × $1,199):           $3,597/month
  Enterprise (1 × $5,000):            $5,000/month

Base MRR:                              $17,124/month
Overage revenue:                       +$2,500/month
Annual plan savings (passed to clients): -$400/month
  TOTAL MRR:                          ~$19,224/month
  Annual Run Rate:                     ~$230,688/year

Monthly Cost Structure:
  Infrastructure (EC2 × 2, RDS):      $400/month
  OpenAI API (~22,000 calls):          $13,640/month
  Twilio:                              $900/month
  Stripe + misc:                       $600/month
  TOTAL COSTS:                         $15,540/month
  
  NET PROFIT:                          ~$3,684/month
  Gross Margin:                        19%

NOTE: Gross margin compresses at scale due to OpenAI Realtime 
  API costs. At Scenario C, optimize with:
  (a) Negotiate OpenAI volume pricing (available at $50K+/month spend)
  (b) Explore open-source Whisper + local LLM for L4/L5 routing 
      (lower-risk calls) to reduce API cost by 40%
  (c) Raise enterprise pricing — $5K/month enterprise contract is 
      underpriced; raise to $8K–$15K after first reference
```


***

### 4.2 — Unit Economics Per Client

**Starter Clinic (\$249/month, 200 calls):**


| Metric | Calculation | Value |
| :-- | :-- | :-- |
| **ARPU** | \$249 base + \$35 avg overage | \$284/month |
| **Variable Cost** | 200 × (\$0.62 OpenAI + \$0.04 Twilio) = \$132 + \$25 fixed | \$157/month |
| **Gross Margin** | (\$284 - \$157) / \$284 | **45%** |
| **CAC** | Outbound email outreach (3 hrs × \$75/hr equivalent) | **\$225** |
| **LTV** | \$284/month × 24 months average retention | **\$6,816** |
| **LTV:CAC Ratio** | \$6,816 / \$225 | **30:1** ✅ |
| **Payback Period** | \$225 CAC / \$127 gross profit per month | **1.8 months** |
| **Monthly Churn Target** | Healthcare B2B SaaS benchmark | **< 2%** |

**Benchmark:** B2B SaaS LTV:CAC of 3:1 is the minimum for sustainability. TriageAI's 30:1 ratio at Starter reflects the near-zero CAC of open-source/inbound-driven sales combined with high healthcare client retention. This ratio will compress as you move beyond warm introductions into paid acquisition — plan for 5:1–8:1 at scale, which is still excellent.

***

### 4.3 — Cost Structure Per Client

**Variable cost per call (the unit that drives all economics):**


| Cost Category | Calculation | Per Call |
| :-- | :-- | :-- |
| **OpenAI Realtime API** | 3 min avg × 1,500 tokens/min × \$0.10/1K input + 1.5 min output × \$0.20/1K | **\$0.62** |
| **Twilio Voice** | \$0.0085/min × 3 min + \$0.004 WebSocket streaming | **\$0.03** |
| **Twilio Phone Number** | \$1/month ÷ 200 calls | **\$0.005** |
| **Supabase DB writes** | Negligible at this scale | **~\$0.001** |
| **Total Variable Cost/Call** |  | **~\$0.66** |

**Fixed monthly infrastructure (shared across all clients):**


| Cost Category | Monthly | Per Client at 5 Clients |
| :-- | :-- | :-- |
| AWS EC2 (t3.medium, ca-central-1) | \$38 | \$7.60 |
| Supabase Pro | \$25 | \$5.00 |
| Domain + SSL + misc | \$15 | \$3.00 |
| **Total Fixed (shared)** | **\$78** | **\$15.60** |

**Free tier sustainability:**

- 100-call pilot × \$0.66/call = **\$66 in API costs per pilot**
- Twilio number provisioning: \$1/month
- Total pilot cost to TriageAI: **~\$67 per CHC pilot**
- This is your customer acquisition cost — \$67 to land a potential \$6,816 LTV client
- You can fund 10 simultaneous pilots for < \$700/month total

**Break-even analysis:**

- Monthly fixed costs (infra + your time valued at \$50/hr × 10 hrs/month): **\$578/month**
- At Starter plan (\$127 gross profit per client): **5 clients = break-even**
- With 1 Growth + 3 Starter: **\$159 + (3 × \$127) = \$540/month gross profit ≈ break-even**
- At 5 Starter clients: **\$635/month gross profit > all fixed costs = profitable**

***

### 4.4 — Pricing Sensitivity Analysis

| Price Point | Est. Conversion Rate | MRR at 5 CHC Clients | MRR at 20 CHC Clients |
| :-- | :-- | :-- | :-- |
| \$149/month | 35% pilot-to-paid | \$745 | \$2,980 |
| **\$249/month** | **28% pilot-to-paid** | **\$1,245** | **\$4,980** |
| \$349/month | 20% pilot-to-paid | \$1,745 | \$6,980 |
| \$499/month | 12% pilot-to-paid | \$2,495 | \$9,980 |

**Optimal price point: \$249/month for Starter**

- Revenue maximized around \$349 (price × conversion) but \$249 is preferred because:
    - CHC procurement under \$300/month requires minimal internal approvals
    - 28% pilot-to-paid conversion is achievable in healthcare (B2B SaaS average is 15–25%)
    - The growth path to \$599 (CHC Growth) is natural as call volumes increase

**Recommendation: Launch at \$249/month, raise to \$299/month after 5 paying clients.** Early adopters get grandfathered at \$249 — this creates urgency and loyalty simultaneously.

***

## SECTION 5 — Billing \& Payment Infrastructure

### 5.1 — Payment Platform Selection

| Platform | Monthly Fee | Transaction Fee | Solo Dev Complexity | Tax Handling | Recommendation |
| :-- | :-- | :-- | :-- | :-- | :-- |
| **Stripe** | \$0 | 2.9% + 30¢ | Low-Medium | You handle HST/GST manually | ✅ Recommended |
| LemonSqueezy | \$0 | 5% + 50¢ | Very Low | MoR — handles all tax | Good backup |
| Paddle | \$0 | 5% + 50¢ | Low | MoR — handles all tax | Overkill at this stage |
| Gumroad | \$0 | 10% | Lowest | Basic | Too expensive per transaction |

**Recommended: Stripe + Stripe Tax addon**

Why Stripe over Merchant of Record (Paddle/LemonSqueezy):

- **B2B invoicing:** CHCs need proper tax invoices with GST/HST registration numbers for their accounting. Stripe generates professional invoices; MoR platforms are designed for B2C digital products.
- **Annual billing complexity:** CHC annual contracts (\$2,388 or \$5,748/year) require proper invoice documentation that Stripe handles natively.
- **Ontario HST:** You're a Canadian company billing Canadian institutions. This is straightforward HST at 13% — not complex multi-jurisdiction B2C tax. Stripe Tax handles it for \$0.50/transaction after first \$500K in revenue.
- **Stripe's healthcare usage:** Widely used by Canadian health-adjacent SaaS companies; familiar to CHC finance teams.
- **Complexity:** Stripe Billing handles subscriptions, proration, metered usage (overages), annual/monthly toggle, and dunning — all natively.

***

### 5.2 — Billing Implementation Requirements

| Feature | MVP Critical? | Implementation Time | Notes |
| :-- | :-- | :-- | :-- |
| **Subscription creation (monthly)** | ✅ YES | 3 hrs | Stripe Billing + webhook handler |
| **Annual billing toggle** | ✅ YES | 2 hrs | Create annual price ID in Stripe, 20% discount applied |
| **Free trial (60 days)** | ✅ YES | 1 hr | `trial_period_days: 60` in Stripe subscription |
| **Upgrade between tiers** | ✅ YES | 2 hrs | Stripe `subscription.update()` with proration |
| **Metered overage billing** | ✅ YES | 4 hrs | Stripe Metered Billing — report usage via API at end of month |
| **Invoice generation + history** | ✅ YES | 0 hrs | Automatic in Stripe |
| **Failed payment dunning** | ✅ YES | 2 hrs | Stripe dunning settings: retry Day 1, 3, 7; then pause (not delete) account |
| **Cancellation flow** | ✅ YES | 2 hrs | Custom cancel page before Stripe cancel call |
| **Payment method management** | 🔶 Post-launch | 1 hr | Stripe Customer Portal handles this |
| **Refund capability** | ✅ YES | 0 hrs | Stripe dashboard refund button — no code needed |
| **Webhook handling** | ✅ YES | 3 hrs | Handle: `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated` |

**Estimated total billing implementation: 20 hours → Sprint 10**

***

### 5.3 — Tax \& Compliance

**Canadian B2B billing (CHC clients):**

- **HST/GST required:** Yes. Register for a GST/HST number (Business Number from CRA) before first invoice. Process: register at canada.ca/en/revenue-agency → takes 5 business days
- **Applicable rate:** 13% HST for Ontario clients (most clients); 5% GST for clients in other provinces
- **Stripe Tax:** Configure once with your GST/HST number. Stripe calculates and remits automatically.
- **CHC invoices:** Must include: TriageAI business name, your GST/HST registration number, billing period, services description, HST amount separately itemized

**PCI compliance:** Stripe handles 100% of PCI compliance. You never touch raw card numbers. Zero PCI effort required.

**Legal documents needed before first payment:**

- ☐ Terms of Service (include: service scope, disclaimer of medical advice, PHIPA responsibilities)
- ☐ Privacy Policy (PIPEDA-compliant + PHIPA note for Ontario)
- ☐ Data Processing Agreement / BAA equivalent (for Ontario health organizations)
- ☐ Acceptable Use Policy (what constitutes misuse of the triage service)
- ☐ Refund Policy (recommend: 14-day money-back after pilot, no refunds mid-month)

**Templates available:** Canadian Privacy Commissioner office publishes PIPEDA-compliant privacy policy templates. Use as a base. Estimated legal review cost with Canadian tech lawyer: \$500–\$1,500 for the full set.

***

## SECTION 6 — Free-to-Paid Conversion Strategy

### 6.1 — Conversion Funnel Design

```
STAGE 1: AWARENESS → CHC Director hears about TriageAI
  Metric: Outreach contacts per week
  Target: 10 warm contacts/week (CAN Health Network, LinkedIn, 
    CHC Ontario association)
  Sources: 
    - CAN Health Network innovator directory [web:65]
    - LinkedIn outreach to CHC Executive Directors + Program Directors
    - Ontario Association of Community Health Centres (OACHC) newsletter
  ↓
  Conversion: 20% of outreached contacts request demo

STAGE 2: DEMO → Live call demo of triage flow
  Metric: Demo-to-pilot conversion rate
  Target: 60% of demos → pilot start
  Optimization: Demo is 15 minutes: 5 min problem framing + 
    10 min live call (they dial the number during the demo call)
    The AI answering immediately, asking structured questions, 
    and delivering a CTAS routing decision is the entire pitch.
  ↓
  Conversion: 60% of demos start a pilot within 2 weeks

STAGE 3: PILOT → 60-day free trial
  Metric: Pilot activation rate (first call completed)
  Target: 90% of pilots complete first call within 48 hours
  Definition of "activated": 10+ calls completed, 
    clinic director has logged into dashboard once
  Optimization: Onboarding email sequence (Day 0, Day 3, Day 14, 
    Day 45 — each with dashboard screenshot of their real data)
  ↓
  Conversion: 28% of pilots convert to paid at Day 57 email

STAGE 4: PAID SUBSCRIBER → Starter or Growth plan
  Metric: Plan selection distribution
  Target: 70% Starter / 30% Growth at initial conversion
    (Growth conversions happen at Month 3-6 as call volumes grow)
  Activation after payment: White-label setup (if Growth) — 
    30-minute onboarding call
  ↓
  Ongoing engagement

STAGE 5: RETENTION → Stay subscribed
  Metric: Monthly churn rate target
  Target: < 2% monthly (24-month average retention = 2-year contracts)
  Why healthcare churn is low: 
    - Clinic phone system is configured around the Twilio number
    - Staff trained on "what to tell patients"
    - Session data accumulating = switching cost
    - Budget cycles make mid-year cancellations administratively annoying

STAGE 6: EXPANSION → Upgrade from Starter to Growth or Growth to OHT
  Metric: Net Revenue Retention (NRR)
  Target: > 110% NRR (expansion revenue > churn)
  Natural upgrade trigger: call volume grows as clinic promotes 
    the number to more patients. Starter at 200 calls/month limit 
    → Growth conversation happens organically.
```


***

### 6.2 — Pricing Page Design

**Structure (3 tiers displayed — Pilot, Clinic, CHC Growth):**

- OHT Network and Enterprise are listed as "Contact us" to keep the page clean
- Default: annual billing toggle ON (shows lower monthly price, subtly pushes annual commitment)
- Highlighted tier: **CHC Growth** with "Most Popular" badge (even if Starter converts more, Growth badge increases its perceived value and helps anchoring)

**Pricing page FAQ (top 5 questions to pre-answer):**

1. *"Is TriageAI PHIPA compliant?"* — Yes. No voice recordings, no transcripts, no PII stored. Our full privacy architecture is published on GitHub.
2. *"Can callers be charged?"* — No. Triage calls are always free for patients. Your clinic pays. Callers dial a regular phone number.
3. *"What happens if a caller has an emergency?"* — The AI detects Level 1-2 CTAS symptoms and immediately warm-transfers to your designated emergency contact while speaking a bridge message to the caller.
4. *"Can we use our own phone number?"* — Yes, on CHC Growth and above. We provision a Twilio number linked to your clinic identity.
5. *"How long is the pilot?"* — 60 days, 100 calls, no credit card required. You can call the number before you sign up — ask us for the demo line.

**Upgrade paywall experience (when pilot limit is reached):**

```
┌─────────────────────────────────────────────────────┐
│  🛑  Your pilot call limit has been reached          │
│                                                       │
│  During your pilot:                                  │
│   ✅ 97 calls triaged                                │
│   ✅ 12 escalations handled                          │
│   ✅ 8 patients redirected from ER                   │
│                                                       │
│  Continue TriageAI for $249/month                    │
│  ($8.05/day — less than one hour of after-hours staff)│
│                                                       │
│        [Upgrade Now — Takes 2 Minutes]               │
│        [Talk to us first]                            │
└─────────────────────────────────────────────────────┘
```


***

### 6.3 — Retention \& Anti-Churn System

**Cancellation flow (4-step, respect the user, capture the data):**

```
Step 1 — Cancellation intent form (before Stripe cancel call):
  "Before you go, help us understand: [dropdown]
   □ Too expensive for our budget
   □ Call volume was lower than expected (not using it enough)
   □ Missing a feature we need
   □ Switching to a different service
   □ Clinic is closing / restructuring
   □ Other"

Step 2 — Tailored counter-offer:
  "Too expensive" → "We can pause your account for up to 3 months 
    at $0 while your fiscal year renews. Would that help?"
  "Not using it enough" → Show their actual usage stats: 
    "You had 47 calls in the last 30 days. That's $0.18/call 
    for 24/7 triage coverage. Want to try our annual plan at 
    20% off instead?"
  "Missing feature" → "What feature would keep you subscribed? 
    [text field]" — log every response, prioritize roadmap by frequency

Step 3 — Confirm cancellation (no dark patterns)
  "Your subscription ends [date]. Your data will be available 
  for export for 30 days after cancellation. [Download my data]"

Step 4 — Win-back email sequence:
<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^17][^3][^4][^5][^6][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: http://www.cabotsolutions.com/healthcare/voice-ai-agents-for-healthcare
[^2]: https://pub-ucpr.escribemeetings.com/filestream.ashx?DocumentId=16920
[^3]: 09-monetization-strategy-prompt.md
[^4]: http://arxiv.org/pdf/2411.12808.pdf
[^5]: https://www.cabotsolutions.com/loc/ai-voice-agents-healthcare-canada
[^6]: https://digitalhealthcanada.com/front-desk-call-overload-in-healthcare-where-ai-voice-agents-make-the-biggest-difference/
[^7]: https://www.linkedin.com/pulse/how-ai-voice-agents-revolutionizing-front-desk-operations-ansdc
[^8]: https://www.agilesoftlabs.com/products/ai-agents/pricing-calculator
[^9]: https://www.olympiabenefits.com/dialogue-telemedicine-for-small-businesses-in-canada
[^10]: https://medinote.ca/compare/medinote-vs-maple
[^11]: https://www.cabotsolutions.com/loc/ai-powered-voice-agents-for-healthcare-usa
[^12]: https://www.thebenefitguys.ca/products-services/dialogue-%E2%80%93-help-for-everyone
[^13]: https://bestquotetravelinsurance.ca/telehealth-services
[^14]: https://www.cabotsolutions.com/loc/ai-powered-voice-agents-healthcare-north-america
[^15]: https://www.getmaple.ca/for-you-family/pricing/
[^16]: https://www.linkedin.com/posts/cabot-solutions_voice-ai-agent-for-healthcare-activity-7425459491426615296-tGBE
[^17]: https://www.sunlife.ca/workplace/en/group-benefits/advisor/advisor-latest-news/update-about-the-lumino-health-virtual-care-employee-assistance-/```

