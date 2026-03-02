<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# If I want to make that particular thing so how can I build that thing so for that I have in-depth prompt where I can create the strategic roadmap for any kind of product? Daksho for that particular project I need that detest

I have the full template. I have all the context from Phase 1 already — let me fill out every single pillar right now.

***

# Phase 2 — Strategic Roadmap \& Execution Plan

## TriageAI — AI-Powered Medical Call Triage System for Ontario

**Project Title:** TriageAI
**One-Line Description:** An AI voice agent that answers medical calls 24/7, triages urgency using CTAS clinical logic, and instantly routes emergencies to a live human — eliminating Ontario's 40-minute Health 811 hold times.
**Target User:** Ontarians aged 25–65 without a family doctor, plus Community Health Centres (CHCs) serving immigrant and low-income populations
**Tech Stack:** Python, FastAPI, LangChain, OpenAI API, Twilio Voice, React, Docker, AWS EC2/Lambda
**Time Available:** 15–20 hrs/week (portfolio build alongside job search)
**Budget:** ~\$150–300/month for API costs + hosting

***

## PILLAR 1 — OKRs (Objectives \& Key Results)

### 1.1 — Product Objective \& Key Results

**Objective:** Any Ontarian calling TriageAI gets an accurate triage decision in under 3 minutes with zero hold time, 24/7.


| Key Result | Baseline | Target | Deadline |
| :-- | :-- | :-- | :-- |
| Average call-to-triage-decision time | 0 (not built) | ≤ 3 minutes | Week 8 (end of MVP) |
| Triage accuracy vs. CTAS gold standard (test set of 50 scripted scenarios) | 0% | ≥ 85% | Week 10 |
| Emergency escalation success rate (call transferred to human within 30 sec of detection) | 0% | 100% | Week 8 |
| System uptime | 0% | ≥ 99% on AWS | Week 12 |


***

### 1.2 — Growth Objective \& Key Results

**Objective:** Build visible, credible traction that attracts CHC/clinic pilot interest and tech community attention within 12 weeks of launch.


| Key Result | Baseline | Target | Deadline |
| :-- | :-- | :-- | :-- |
| Demo calls completed by real testers (via shared Twilio number) | 0 | 200 demo calls | Week 14 |
| LinkedIn post impressions on build-in-public series | 0 | 5,000+ impressions per post | Week 10 |
| GitHub repo stars | 0 | 150+ stars | Week 14 |
| CHC/clinic pilot interest emails received | 0 | 5 warm leads | Week 16 |


***

### 1.3 — Learning Objective \& Key Results

**Objective:** Master production-grade voice AI and conversational health agent development — skills directly employable at health-tech companies.


| Key Result | Baseline | Target | Deadline |
| :-- | :-- | :-- | :-- |
| Deploy Twilio + OpenAI Realtime voice pipeline with <500ms latency end-to-end | Not built | ✅ Shipped to AWS | Week 6 |
| Implement 3 FastAPI endpoints: `/triage`, `/escalate`, `/session-log` | Not built | ✅ Fully documented in README | Week 7 |
| Publish 1 technical write-up on Medium/LinkedIn documenting the architecture | 0 | ✅ Published with 500+ views | Week 13 |


***

### 1.4 — Revenue Objective \& Key Results

**Objective:** Generate first consulting or pilot revenue from TriageAI within 6 months of public demo.


| Key Result | Baseline | Target | Deadline |
| :-- | :-- | :-- | :-- |
| First dollar earned (freelance AI consulting using this as demo OR paid pilot) | \$0 | \$1 (any amount validates the model) | Month 5 |
| Break-even on API/hosting costs (~\$200/mo) | -\$200/mo | \$0 net (costs covered) | Month 6 |
| 6-month revenue target (1 CHC pilot contract OR 2 consulting leads closed) | \$0 | \$2,000–5,000 | Month 6 |

*Reasoning: A single CHC pilot at \$500/month = \$3,000 over 6 months. Two consulting contracts at \$2,000 each are realistic given the niche expertise this demonstrates.*

***

### 1.5 — OKR Tracking System

**Tool:** Notion — create one page called `TriageAI OKR Tracker` with a table of all 12 KRs above. Free, fast, and already in your workflow.

**Weekly Review Ritual (Sunday, 10 min):**

1. Open the Notion OKR page — update each KR's current number (2 min)
2. Mark each KR: 🟢 On track / 🟡 At risk / 🔴 Behind (1 min)
3. Write one sentence for each 🔴: "Why behind, and what changes next week?" (5 min)
4. Set 3 specific tasks for the coming week tied directly to 🔴 or 🟡 KRs (2 min)

**Rule:** If a KR has been 🔴 for 3 consecutive weeks, it means the target is wrong or the approach is wrong — fix one of them, don't just keep pushing.

***

## PILLAR 2 — MVP Definition

### 2.1 — Core Value Proposition Lock

**The single most important thing the MVP must do:** Answer a phone call, ask 5 structured triage questions, and output one of three routing decisions — "Call 911 now," "Go to the ER within X hours," or "Here's where to go for non-urgent care" — with zero hold time.

**The Magic Moment:** 90 seconds into the call, the user hears a clear, calm, confident routing decision in plain language. That's it. That's the whole product in its MVP form.

**Time to Magic Moment:** Under 2 minutes from the moment the call connects — no signup, no app download, no login.

***

### 2.2 — MVP Feature Set (The Knife's Edge)

| \# | Feature | What It Does | Why It Cannot Be Cut | Build Time |
| :-- | :-- | :-- | :-- | :-- |
| 1 | **AI Voice Intake** | Twilio answers the call; GPT-4o conducts the conversation in natural language | Without this, there is no product | 3–4 days |
| 2 | **CTAS Triage Logic (5-question flow)** | Structured question tree (chief complaint → duration → severity → existing conditions → age) maps to CTAS Level 1–5 | This is the clinical engine — without it, the AI is just chatting, not triaging | 4–5 days |
| 3 | **3-Tier Routing Decision** | Emergency → warm transfer; Urgent → ER guidance; Non-urgent → walk-in/811 routing | Without routing, the call has no outcome — this is the value delivery | 2 days |
| 4 | **Emergency Warm Transfer** | On CTAS Level 1–2 detection, Twilio dials a pre-configured human number and bridges the call | This is the most important safety feature — cutting it makes the product dangerous | 1–2 days |
| 5 | **Session Logger** | FastAPI endpoint logs call ID, triage outcome, and routing decision to PostgreSQL (no PII stored in MVP) | Needed to demo the system, validate accuracy, and show a dashboard to pilot clients | 1 day |

**Total MVP Build: ~12–14 focused days of coding (not calendar days — actual productive hours)**

***

### 2.3 — Explicitly Out-of-Scope (The "NOT Now" List)

| Feature | Why Deferred | When to Add |
| :-- | :-- | :-- |
| Multilingual support (Punjabi, Urdu, Mandarin) | Critical for V2 but adds integration complexity; validate core flow first | After 100 demo calls confirm the base flow works |
| Real-time ER/walk-in wait time lookup | Requires Ontario Health API integration and data freshness management | V2, after core triage is stable |
| Patient identity \& account system | PIPEDA compliance overhead; MVP logs zero PII | Only if piloting with a real clinic (needs legal review) |
| SMS follow-up after call | Nice-to-have; adds Twilio SMS cost and workflow | After beta with real users who request it |
| Admin dashboard for clinics | Client-facing UI is post-traction work | When first clinic pilot signs |
| Appointment booking integration | Complex API integrations (Oscar, Accuro EMR) | V2 only after clinic partnership |
| Medication interaction checker | Separate product scope entirely | Not this product |
| Mental health triage branch | Separate, deeply sensitive domain with different regulatory requirements | Separate future product |
| iOS/Android app | Phone call requires zero app — that's the point | Never for MVP; possibly a companion app in V3 |
| Fine-tuned medical LLM | GPT-4o with strong system prompts is sufficient for MVP; fine-tuning adds months | After 1,000+ logged calls to train on |


***

### 2.4 — MVP Success Criteria

**Definition of Done (binary pass/fail):**

1. ✅ A call to the Twilio number connects in under 3 seconds and the AI greets the caller
2. ✅ The AI correctly routes 85%+ of 20 scripted test scenarios to the right CTAS tier
3. ✅ A CTAS Level 1 scenario (e.g., "chest pain, can't breathe, age 62") triggers a warm transfer within 30 seconds
4. ✅ All call sessions are logged to the database with triage outcome and routing decision
5. ✅ The system runs uninterrupted for 2 hours during a load test without crashing

**Ship or Kill Decision Gate — 4 weeks post-demo launch:**

- **Keep building:** ≥50 real demo calls completed + at least 1 CHC/clinic replies to a cold outreach email with genuine interest
- **Pivot:** Demo calls happen but all feedback is "cool demo but I wouldn't actually trust this" — means clinical credibility framing needs rework
- **Kill:** After 8 weeks post-launch, zero institutional interest and zero organic sharing — reassess whether phone-first is the right channel vs. chat/web

***

### 2.5 — Technical MVP Architecture

```
Caller Phone
     │
     ▼
Twilio Voice (inbound number)
     │  webhook on call connect
     ▼
FastAPI Backend (AWS EC2 / Railway)
     │
     ├── POST /triage → OpenAI GPT-4o Realtime API
     │        │  CTAS question flow via system prompt
     │        │  Returns: triage_level (1–5), routing_decision
     │
     ├── POST /escalate → Twilio <Dial> verb (warm transfer)
     │        │  Bridges to pre-configured emergency number
     │
     └── POST /session-log → PostgreSQL (Supabase free tier)
              │  Logs: call_sid, triage_level, routing, duration
              │  ZERO patient PII stored in MVP
```

**Use existing services, don't build:**

- **Twilio** for all voice/telephony (don't build a telephony stack)
- **OpenAI GPT-4o** via API (don't fine-tune or host your own LLM in MVP)
- **Supabase** for PostgreSQL + free dashboard (don't build a custom DB setup)
- **Railway or Render** for backend deploy in Week 1 (switch to AWS when you need to demo infrastructure to employers)

**⚠️ Hard-to-reverse decision — get this right in MVP:**
Your **CTAS question flow in the system prompt** is the clinical brain of this product. Structure it as a JSON config file (`triage_config.json`), NOT hardcoded in the prompt. This means you can swap/update triage logic without redeploying — this will matter when a nurse or doctor reviewer asks you to change a question.

***

## PILLAR 3 — Feature Prioritization

### 3.1 — Complete Feature Backlog

| \# | Feature | Category |
| :-- | :-- | :-- |
| 1 | AI Voice Intake (Twilio + GPT-4o) | Core |
| 2 | CTAS 5-question triage flow | Core |
| 3 | 3-tier routing decision (Emergency/Urgent/Non-urgent) | Core |
| 4 | Emergency warm transfer to human | Core |
| 5 | Session logger (call ID, outcome, routing) | Core |
| 6 | Multilingual support (Punjabi, Urdu, Mandarin, French) | Enhancement |
| 7 | Real-time nearest open walk-in clinic routing | Enhancement |
| 8 | ER wait time display (Ontario Health open data) | Enhancement |
| 9 | Post-call SMS summary sent to caller | Enhancement |
| 10 | Admin dashboard for clinic staff | Enhancement |
| 11 | Appointment booking (Oscar/Accuro EMR integration) | Enhancement |
| 12 | Caller history / session memory | Enhancement |
| 13 | Confidence score display on triage outcome | Enhancement |
| 14 | LinkedIn/X build-in-public posts (3/week) | Growth |
| 15 | Public GitHub repo with live demo number | Growth |
| 16 | Product Hunt launch page | Growth |
| 17 | Landing page with live demo CTA | Growth |
| 18 | Cold email to 20 Ontario CHCs | Growth |
| 19 | Technical blog post on architecture | Growth |
| 20 | B2B SaaS subscription for clinics (\$500/mo) | Monetization |
| 21 | CAN Health Network challenge submission | Monetization |
| 22 | Freelance consulting pipeline using demo | Monetization |
| 23 | Personalized follow-up care reminders | Delight |
| 24 | "Your triage summary" email post-call | Delight |
| 25 | Friendly, calming AI voice persona ("Nova") | Delight |
| 26 | Accessibility mode (slower speech, repeat questions) | Delight |


***

### 3.2 — RICE Scoring Matrix (Top 15 Features)

| Feature | Reach | Impact | Confidence | Effort (wks) | RICE Score |
| :-- | :-- | :-- | :-- | :-- | :-- |
| AI Voice Intake | 500 | 3 | 100% | 1 | **1500** |
| CTAS Triage Logic | 500 | 3 | 90% | 1.5 | **900** |
| Emergency Warm Transfer | 500 | 3 | 100% | 0.5 | **3000** ← \#1 |
| 3-Tier Routing Decision | 500 | 3 | 100% | 0.5 | **3000** ← \#1 |
| Session Logger | 200 | 2 | 100% | 0.5 | **800** |
| Public GitHub + Demo Number | 300 | 2 | 80% | 0.25 | **1920** |
| Landing Page + Demo CTA | 400 | 2 | 80% | 0.5 | **1280** |
| Multilingual Support | 300 | 3 | 70% | 3 | **210** |
| Walk-in Clinic Routing | 400 | 2 | 70% | 2 | **280** |
| Admin Dashboard | 50 | 2 | 60% | 4 | **15** |
| SMS Summary Post-Call | 300 | 1 | 70% | 1 | **210** |
| ER Wait Time Integration | 350 | 2 | 50% | 2.5 | **140** |
| CAN Health Challenge Submission | 100 | 3 | 80% | 0.5 | **480** |
| Friendly AI Persona ("Nova") | 500 | 1 | 90% | 0.5 | **900** |
| Technical Blog Post | 200 | 2 | 90% | 0.5 | **720** |

**🏆 Top 5 highest-ROI features to build AFTER MVP (in order):**

1. Public GitHub repo + live demo number (fastest credibility builder)
2. Landing page with live demo CTA
3. CAN Health Network challenge submission
4. Multilingual support (biggest differentiator for Ontario CHCs)
5. Walk-in clinic routing via Ontario Health open data

***

### 3.3 — MoSCoW Classification

**MUST Have (MVP dies without it):**

- AI Voice Intake, CTAS Triage Logic, 3-Tier Routing, Emergency Warm Transfer, Session Logger

**SHOULD Have (next sprint post-MVP):**

- Landing page, GitHub repo, live demo number, friendly AI persona, technical blog post, CAN Health submission

**COULD Have (if time allows in Week 10–12):**

- SMS post-call summary, multilingual (French first — easiest, OpenAI handles it natively), walk-in clinic routing

**WON'T Have (this version, no exceptions):**

- Admin dashboard, EMR integration, appointment booking, fine-tuned LLM, iOS app, patient identity system

✅ Cross-check: All 5 MUST-haves match exactly the MVP Feature Set in Pillar 2. No conflicts.

***

### 3.4 — Solo Developer Effort Reality Check

| Feature | Optimistic | Realistic (2x rule) | Shortcut Available? |
| :-- | :-- | :-- | :-- |
| Twilio voice setup + webhook | 8 hrs | 16 hrs | ✅ Twilio quickstart template cuts setup to 4 hrs |
| GPT-4o triage conversation flow | 10 hrs | 20 hrs | ✅ LangChain ConversationChain handles memory |
| CTAS logic in JSON config | 6 hrs | 12 hrs | ✅ Infermedica API can replace this entirely |
| Emergency warm transfer | 4 hrs | 8 hrs | ✅ Twilio `<Dial>` verb — 1 line of TwiML |
| FastAPI backend + endpoints | 8 hrs | 16 hrs | ✅ FastAPI boilerplate on GitHub |
| Supabase session logging | 4 hrs | 8 hrs | ✅ Supabase Python SDK — 30 min setup |
| AWS EC2 deploy + domain | 6 hrs | 12 hrs | ✅ Use Railway first (10 min deploy), switch to AWS later |
| 20 CTAS test scenario scripting | 5 hrs | 10 hrs | ⚠️ No shortcut — must be done manually |
| Landing page (React) | 8 hrs | 16 hrs | ✅ Use a free template (Tailwind UI or shadcn) |
| Demo + screen recording | 3 hrs | 6 hrs | ✅ Loom for recording, no editing needed for v1 |

**⚠️ Features over 40 hours:** Admin dashboard (~80 hrs realistic) — do NOT build in V1. Use Supabase's built-in auto-generated table UI as your "dashboard" for demo purposes.

***

## PILLAR 4 — Timeline \& Milestones

### 4.1 — Phase Breakdown

| Phase | Duration | Key Deliverables | Exit Criteria |
| :-- | :-- | :-- | :-- |
| **Phase 0: Foundation** | Week 1 | Repo created, Twilio account + test number active, FastAPI skeleton deployed to Railway, OpenAI API key tested | "Hello World" call connects and AI responds with a sentence |
| **Phase 1: Core Build** | Weeks 2–6 | CTAS triage flow working, routing logic complete, warm transfer functional, session logger live | All 5 MVP features pass binary success criteria (Pillar 2.4) |
| **Phase 2: Polish \& QA** | Week 7–8 | 20 scripted CTAS scenarios tested, edge cases handled (caller hangs up, silence, confused input), AI persona voice tuned | 85%+ accuracy on test scenarios, zero crashes in 2hr load test |
| **Phase 3: Soft Launch** | Weeks 9–10 | GitHub repo public, demo number shared on LinkedIn + r/Ontario, landing page live | 50 demo calls, 10 pieces of written feedback collected |
| **Phase 4: Public Launch** | Week 11–12 | Product Hunt submission, LinkedIn launch post, cold emails to 10 Ontario CHCs, technical blog post published | 200 total demo calls, 5 CHC/clinic warm leads |
| **Phase 5: Iterate** | Weeks 13–16 | Multilingual (French), walk-in routing, CAN Health submission | 1 pilot conversation active OR GitHub stars > 150 |


***

### 4.2 — Week-by-Week Milestone Calendar

| Week | Milestone | Hard/Soft |
| :-- | :-- | :-- |
| **Week 1** | Twilio number active; FastAPI "Hello World" deployed to Railway; repo created with README | 🔴 Hard |
| **Week 2** | GPT-4o connected to Twilio call webhook; basic conversation flow works (AI says hello, asks first question) | 🔴 Hard |
| **Week 3** | Full 5-question CTAS flow implemented in `triage_config.json`; routing decision returned | 🔴 Hard |
| **Week 4** | Emergency warm transfer functional (Level 1–2 → dial bridging); session logger to Supabase live | 🔴 Hard |
| **Week 5** | *(Buffer week)* — catch-up on any Week 2–4 overruns; begin scripting 20 test scenarios | 🟡 Soft |
| **Week 6** | All 20 scripted CTAS scenarios tested; accuracy calculated; bugs fixed | 🔴 Hard |
| **Week 7** | Edge case handling (silence, hang-up mid-call, unclear input); AI persona voice tuned | 🟡 Soft |
| **Week 8** | 2-hour load test passed; MVP declared complete; first LinkedIn "I shipped" post | 🔴 Hard |
| **Week 9** | Landing page live; GitHub repo public with live demo number; post shared on r/ontario and r/askTO | 🟡 Soft |
| **Week 10** | Screen-recorded demo video posted on LinkedIn + X; technical architecture diagram added to README | 🟡 Soft |
| **Week 11** | Product Hunt listing submitted; 10 cold emails sent to Ontario CHCs/clinics | 🟡 Soft |
| **Week 12** | Technical blog post published (Medium or personal site); respond to all GitHub issues + feedback | 🟡 Soft |
| **Week 13** | *(Buffer week)* — address top 3 feedback items from demo users | 🟡 Soft |
| **Week 14** | French language support added (low effort — OpenAI handles this with a language detection prefix) | 🟡 Soft |
| **Week 15** | CAN Health Network challenge application submitted | 🔴 Hard |
| **Week 16** | Walk-in clinic routing via Ontario Health open data API added | 🟡 Soft |


***

### 4.3 — Solo Developer Velocity Calibration

**Your available hours:** 15–20 hrs/week
**Realistic productive build hours:** ~10–12 hrs/week after accounting for:

- Context switching between job search (resume, applications, interviews): −3 hrs
- Debugging overhead ("2x rule" is real): already baked into estimates above
- Research and reading (Twilio docs, OpenAI realtime docs, CTAS protocols): −2 hrs

**Math check:** MVP = ~90 productive hours. At 10–12 hrs/week → **8–9 weeks to MVP**. Phase 0–2 is 8 weeks — ✅ the math works.

**Sustainable weekly rhythm:**

- **Monday/Tuesday evenings:** Deep coding (2 hrs each) — core feature implementation
- **Wednesday evening:** Architecture + documentation (1.5 hrs)
- **Saturday morning (3–4 hrs):** Longest focused session — the week's main deliverable
- **Sunday (1 hr):** OKR review + next week planning (NOT coding)
- **Thursday/Friday:** Job search focused — keep TriageAI separate to prevent burnout

***

### 4.4 — Risk Register \& Contingency

| Risk | Likelihood | Impact | Mitigation |
| :-- | :-- | :-- | :-- |
| **OpenAI Realtime API latency too high** (>1.5 sec response kills voice UX) | Medium | High | Test in Week 1 before committing. Fallback: use Whisper (STT) + GPT-4o text + TTS as separate pipeline — slower but proven |
| **CTAS clinical logic challenged** (someone says "AI can't do medical triage") | High | Medium | Frame clearly as a **navigation/routing tool**, NOT a diagnosis tool. Add a disclaimer at call start. Use exact CTAS language from published Canadian guidelines |
| **Scope creep** (temptation to add multilingual/dashboard before shipping) | Very High | High | The "NOT Now" list in Pillar 2.3 is your written contract with yourself. Re-read it every Monday |
| **Job interview prep consuming all build time** | High | Medium | Keep 2 weekday evenings sacred for TriageAI. Even 2 hrs of progress/week keeps momentum |
| **Twilio costs spike** (demo goes viral, 1000+ calls at \$0.01–0.05/min) | Low | Medium | Set a Twilio spend cap of \$50/month in account settings. Add a 3-minute call limit in code for MVP |

**🛑 Circuit Breaker:** If by Week 8 you have not completed Phase 1 (core build), do NOT proceed to launch. Stop, audit what took longest, cut one feature, and reset the Week 8 deadline by 2 weeks max. Do not keep adding time indefinitely.

***

### 4.5 — Progress Tracking System

**Tool:** GitHub Projects (free, lives next to your code, zero context switching)

- Create 4 columns: `To Do` / `In Progress` / `Done This Week` / `Blocked`
- Every Monday: drag tasks from `To Do` into `In Progress` (max 3 at a time)

**Weekly Sunday Check-in Template (copy into Notion, fill in 10 min):**

```
## Week [N] Review — [Date]

✅ Shipped This Week:
- [specific thing 1]
- [specific thing 2]

🔴 What Blocked Me:
- [specific blocker]

📅 Next Week's 3 Goals:
1. [specific deliverable]
2. [specific deliverable]
3. [specific deliverable]

📊 OKR Status: 🟢 Green / 🟡 Yellow / 🔴 Red
[one sentence on why if Yellow/Red]
```


***

## PILLAR 5 — Go-To-Market Strategy

### 5.1 — Launch Strategy Type

**Recommended: Soft Launch → Community-First → Public Launch**

**Reasoning:** TriageAI is a health-adjacent product. A Big Bang launch risks backlash ("AI shouldn't do medical triage") before you've had a chance to shape the narrative. The smarter move is:

1. Share the live demo number quietly in tech communities first (r/ontario, LinkedIn connections)
2. Collect 50+ call logs and feedback — use real data to frame the story
3. Then go public with "here's what 200 Ontario residents said when they called our AI triage system"

**Risk of Big Bang launch:** One viral negative tweet ("this AI told someone to stay home and they needed an ER") can kill the project's credibility. Soft launch lets you catch edge cases first.

***

### 5.2 — Pre-Launch Playbook (Weeks 7–10)

**Week 7 — Build in Public begins:**

- Post on LinkedIn: *"I'm building an AI that answers medical calls in Ontario because 2.3 million people have no family doctor and Health 811 has a 40-minute hold time. Here's the architecture. Week 1 update 🧵"*
- Share the GitHub repo (even if incomplete) — stars early signal credibility

**Week 8 — Demo video:**

- Record a 90-second Loom: show a real call from "Hi, I have chest pain" → AI asking 5 questions → "This sounds urgent. I'm connecting you to a nurse now" → warm transfer
- Post on LinkedIn + X with caption: *"Built this in 6 weeks. Ontario healthcare is broken — this is what an AI fix looks like."*

**Week 9 — Community seeding (post in these specific communities BEFORE launch):**

1. r/ontario — "Built an AI triage system for Ontario's health access crisis — would love feedback from people who've struggled with 811 wait times"
2. r/learnmachinelearning — technical post on voice AI architecture
3. LinkedIn (Toronto health-tech network) — tag MaRS, CAN Health Network
4. Indie Hackers — "Building in public: week 8 update on TriageAI"
5. Hacker News "Show HN" — post when demo is stable

**Week 10 — Early access number:**

- Set up a Typeform (free) for 20 beta testers to sign up and call the demo number
- Use Tally.so to collect structured feedback post-call (5 questions, 2 min)

**Build-in-Public Post Templates:**

- *"Problem I'm solving: [stat]. What I built: [1 sentence]. What surprised me: [insight]. Link: [demo]. What do you think? 🇨🇦"*
- *"Week [N] of building TriageAI. This week I learned that [technical insight]. Here's why it matters for voice AI in healthcare: [thread]"*

***

### 5.3 — Launch Day Playbook (Week 11)

**Hour-by-hour plan:**


| Time | Action |
| :-- | :-- |
| 7:00 AM | Post on Product Hunt (submissions go live at 12:01 AM PST — schedule the night before) |
| 8:00 AM | LinkedIn launch post (personal, story-driven — "Here's why I built this") |
| 9:00 AM | Post on r/ontario, r/canadahealthcare, r/learnmachinelearning |
| 10:00 AM | Tweet thread on X with demo video embed |
| 11:00 AM | Post on Indie Hackers + Hacker News "Show HN" |
| 12:00 PM | Email 10 pre-warmed contacts (CHC directors, health-tech connections) personally |
| 2:00 PM onwards | Respond to EVERY comment/reply within 2 hours — this is your most important job today |

**Platform-specific tone:**

- **LinkedIn:** Personal story + mission driven. *"Over 2 million Ontarians have no family doctor..."*
- **Reddit:** Transparent builder tone. *"I built this, here's what works and what doesn't yet. Honest feedback welcome."*
- **Hacker News:** Technical-first. Lead with architecture, not mission.
- **Product Hunt:** Tagline: *"Answer every medical call. Instantly. In any language. No hold times."*

**"Successful launch day" in real numbers for a solo developer:**

- Product Hunt: top 10 of the day in Health category ✅
- 50+ demo calls made ✅
- 3+ genuine inbound emails from potential users/partners ✅
- 0 critical bugs that break the demo ✅

***

### 5.4 — Post-Launch Growth Engine (First 30 Days)

**3 zero-budget growth channels:**

1. **LinkedIn Build-in-Public (3 posts/week)**
    - What: One architecture insight, one user feedback story, one "what I'm building next" update
    - Expected output: 1,000–5,000 impressions/post in Toronto health-tech network
    - Time investment: 3 hrs/week
2. **Cold email to Ontario CHCs and FHTs (Family Health Teams)**
    - What: Personalized 5-sentence email to clinic directors linking to the live demo number
    - Expected output: 5–10% response rate → 1–2 warm conversations from 20 emails
    - Time investment: 2 hrs total to write, 30 min/week to follow up
3. **GitHub SEO + Documentation**
    - What: Write a detailed README with keywords like "Ontario health triage AI", "CTAS voice agent", "Health 811 alternative" — GitHub indexes publicly and researchers/developers find it
    - Expected output: 5–10 organic stars/week from AI developers and health-tech researchers
    - Time investment: 2 hrs one-time + 30 min/week responding to issues

**The ONE metric to obsess over in 30 days:** **Call completion rate** — what % of callers who connect to the AI stay on the call through to a routing decision. If this is below 60%, the conversation flow is broken. Everything else is secondary.

**Feedback loop:**

- Post-call Tally form (linked in a Twilio post-call SMS to demo users who opt in)
- Weekly manual review of 10 session logs — read the transcript, spot where conversations go wrong
- GitHub Issues for developer feedback on the open-source repo

***

### 5.5 — Regional / Audience Rollout Plan

**Launch niche-first, not globally.** The product is inherently Ontario-specific (OHIP context, Health 811, Ontario CHC network) — don't dilute the message by marketing it as "global telehealth."

**Ideal First 50 Users — be specific:**

- Ontarians aged 25–45 in the GTA without a family doctor who follow health/tech content on LinkedIn
- Final-year nursing/medical students at U of T and McMaster (they'll validate the clinical logic AND share it)
- Tech workers in Toronto (r/toronto, r/learnmachinelearning) who understand AI and have personally felt the Health 811 pain
- **Where to find them:** r/ontario, r/askTO, LinkedIn Toronto tech community, U of T/McMaster health informatics LinkedIn groups

**Expansion sequence after initial audience:**

1. **Phase 1 (Weeks 1–12):** GTA-based tech-savvy Ontarians → validate call quality and triage accuracy
2. **Phase 2 (Month 4–5):** Community Health Centres in Ontario (institutional B2B) → first pilot conversations
3. **Phase 3 (Month 6+):** Other provinces (BC's 811 has the same problem — CAN Health Network operates nationally)
4. **Phase 4 (Year 2):** White-label the triage engine to telehealth companies (Maple, WELL Health)

***

## PILLAR 6 — Decision Framework \& Solo Developer Survival Kit

### 6.1 — Decision Heuristics (Your 5 Rules When Stuck)

1. **"Does this ship faster or slower?"** — When choosing between two implementation approaches, always pick the one that gets working code in front of a real caller sooner. A working Twilio+GPT-4o integration beats a perfectly architected system that launches 3 weeks later.
2. **"Is this a Core or a Delight?"** — If a feature idea isn't on the MUST-have list, it's a Delight. Write it down in the "NOT Now" list and close the tab. You can always add it later; you can't get back the hours you spent building it in Week 3.
3. **"Would a CHC director care about this?"** — Your north star user for B2B is a clinic director who needs to trust this system. If a feature doesn't make the system safer, faster, or more trustworthy to that person, it's not worth building right now.
4. **"Can I use an API for this?"** — Before writing any custom logic (language detection, symptom parsing, clinic lookup), spend 20 minutes checking if Twilio, OpenAI, Infermedica, or Ontario Health's open data already solves it. Never build what you can call.
5. **"What does the session log tell me?"** — Never make a product decision based on what you *think* users want. Read 10 actual call transcripts first. The data is in your own database; use it.

***

### 6.2 — Burnout Prevention Protocol

**Your risk:** You're job searching AND building simultaneously. Two high-stakes, outcome-uncertain activities running in parallel is a recipe for burnout by Week 6 if you don't design for sustainability now.

**Sustainable rhythm:**

- TriageAI gets **Saturday morning (sacred)** + **2 weekday evenings** — that's it. Job search owns the rest.
- On weeks with interviews, TriageAI gets Saturday only. No guilt. One focused session is enough to maintain momentum.

**Minimum Viable Progress (low-energy weeks):**

- Write 10 lines of code OR fix 1 bug OR write 1 test case OR post 1 LinkedIn update
- Even one small forward step breaks the "I haven't touched it in 2 weeks" spiral that kills projects

**Accountability mechanisms:**

1. **Build-in-public on LinkedIn** — public commitments are the most effective accountability tool that costs \$0
2. **GitHub commit streak** — even a README edit counts; the green squares are motivating
3. **Weekly Sunday OKR review** — 10 minutes of structured reflection prevents the silent drift where the project dies without you noticing

***

### 6.3 — Kill Criteria

These are objective, emotionless exit conditions. Hitting one doesn't mean you failed — it means you're being smart with your time.


| Condition | Threshold | Action |
| :-- | :-- | :-- |
| **Zero institutional interest after outreach** | After 30 cold emails to Ontario CHCs, zero responses after 2 follow-ups | Pivot to consumer-facing (direct-to-patient web app) instead of B2B clinic model |
| **Demo call completion rate below 40%** | After 100 calls, fewer than 40 make it to a routing decision | The triage conversation flow is fundamentally broken — do a full rewrite before any more marketing |
| **Job offer with no time remaining** | Offer accepted that requires full-time focus + 60+ hr weeks | Park the project on GitHub with a clear README, document the architecture, and return in 3 months — a well-documented paused project is still a portfolio asset |
| **No user return or re-engagement after 8 weeks** | Fewer than 5 people mention they'd call the number again | Product-market fit is absent; run 5 user interviews before writing another line of code |
| **API costs exceed \$200/month with no revenue signal** | Month 3 burn with zero monetization conversation initiated | Add a usage cap + waitlist immediately; do not let costs scale without a corresponding revenue experiment |


***

## ⚡ Execution Kickoff — Do These TODAY

1. **Create the GitHub repo `triageai-ontario` right now** — public, with a one-paragraph README describing what the project is and that it's under active development. First commit in the next 60 minutes.
2. **Sign up for Twilio** (twilio.com) — create a free account, provision a Canadian phone number (\$1/month), and follow the "Receive a Phone Call" Python quickstart. Your goal: have a call connect and return any voice response tonight.
3. **Create your `triage_config.json` file** — write the 5 CTAS triage questions right now as a structured JSON. This is the clinical brain of your product and you can design it entirely offline, no API needed.
4. **Set up your Notion OKR tracker** — copy the 12 KRs from Pillar 1 into a Notion table with columns: KR, Baseline, Target, Current, Status (🟢🟡🔴), Deadline. Takes 15 minutes and creates the discipline backbone for the whole build.
5. **Write your first LinkedIn post tonight** — *"I'm building an AI to fix Ontario's medical triage problem. 2.3M Ontarians have no family doctor. Health 811 has a 40-minute hold time. I'm building TriageAI — a voice AI that answers calls instantly and routes you to the right care in under 3 minutes. Build journal starts today. 🇨🇦 \#BuiltInPublic \#HealthTech \#AI"* — Post it. The public commitment changes how seriously you take tomorrow morning's coding session.
<span style="display:none">[^1]</span>

<div align="center">⁂</div>

[^1]: 02-strategic-roadmap-prompt-template.md

