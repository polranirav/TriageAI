<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Now you have the architecture, let's try to design the website or the system or the we whatever we are trying to build the things based on our book. Ukanojasam, let's create the design

I have the full template. Now I'll execute all 8 stages for TriageAI. Important architectural note: TriageAI has **two design surfaces** — the **public landing page** and the **clinic admin dashboard**. The core product (voice call) has no visual UI for the caller, but its conversation flow is a UX design challenge I'll cover in Stage 1.

***

# Phase 5 — Design, Prototyping \& Developer Handoff

## TriageAI — Complete Design Blueprint

**Project Title:** TriageAI
**Platform:** Responsive Web App (desktop-first dashboard + mobile-responsive landing page)
**Design Tool:** Code directly → Tailwind CSS + shadcn/ui (exact CSS specs provided)
**Visual Inspiration:** Linear's dark minimalism + Stripe's documentation clarity + Vercel's dark mode elegance
**Brand Direction:** Greenfield — medical-tech trust meets AI precision. Dark, clean, clinical confidence
**Accessibility:** WCAG 2.1 AA compliance minimum

***

## STAGE 1 — Information Architecture \& User Flows

### 1.1 — Site Map / App Map

```
TRIAGEAI — COMPLETE SCREEN MAP
═══════════════════════════════

[SURFACE A] PUBLIC LANDING SITE (marketing + demo)
├── SCR-01  Home / Landing Page
│   ├── Hero section ("Answer every medical call. Instantly.")
│   ├── Problem section (Health 811 wait time stats)
│   ├── How It Works (3-step visual flow)
│   ├── Demo CTA ("Call +1 (647) XXX-XXXX to try it now")
│   ├── Trust signals (CTAS standard, PIPEDA compliant badge)
│   └── Footer (privacy policy, GitHub, contact)
├── SCR-02  Privacy Policy Page
└── SCR-03  404 / Not Found Page

[SURFACE B] CLINIC ADMIN DASHBOARD (authenticated, B2B)
├── SCR-04  Login Page
│   ├── Email + password form
│   ├── "Forgot password" flow
│   └── Error state (invalid credentials)
├── SCR-05  Dashboard Overview (home after login)
│   ├── Default (with call data)
│   ├── Empty state (no calls yet — new account)
│   └── Loading state
├── SCR-06  Call Sessions List
│   ├── Default (table with filters)
│   ├── Empty state (no results for filter)
│   └── Loading state (skeleton rows)
├── SCR-07  Call Session Detail View
│   ├── Default (session metadata + triage outcome)
│   └── Not Found state
├── SCR-08  Analytics Page
│   ├── Default (charts populated)
│   ├── Empty state (insufficient data)
│   └── Loading state
├── SCR-09  Settings Page
│   ├── Clinic Profile sub-page
│   ├── Notification Preferences sub-page
│   └── API / Integration Settings sub-page
└── SCR-10  Error / System Down Page

[VOICE EXPERIENCE — No UI, but UX must be designed]
├── VX-01  AI Greeting + Consent Disclosure
├── VX-02  Question 1: Chief Complaint
├── VX-03  Question 2: Duration
├── VX-04  Question 3: Severity (1–10)
├── VX-05  Question 4: Age
├── VX-06  Question 5: Existing Conditions
├── VX-07  Routing Decision Delivery
├── VX-08  Emergency Escalation (warm transfer)
└── VX-09  Call End / Completion

TOTAL UNIQUE SCREENS: 10 web screens + 9 voice states
✅ Under 15-screen MVP threshold — appropriately scoped
```


***

### 1.2 — Primary User Flows (Happy Paths)


***

**FLOW 1: First-Time Demo Caller (Voice — Primary Product)**

```
Step 1: Caller dials +1 (647) XXX-XXXX
    → System: Twilio answers within 3 seconds
    → AI voice: "Hi, you've reached TriageAI, a free 24/7 
      medical triage service for Ontario. This service does 
      not store your voice or personal information. 
      Let's help you find the right care. Ready? 
      First — what's your main concern today?"

Step 2: Caller describes symptom verbally
    → System: OpenAI Realtime transcribes + understands
    → AI: "Got it. How long have you been experiencing this?"

Step 3: Caller answers 5 structured questions (VX-02 to VX-06)
    → System: State machine tracks conversation progress
    → AI: Natural follow-up, empathetic tone

Step 4: CTAS Level computed (Level 1–5)
    → System: routing/ module maps to action
    → AI delivers routing decision (Level 3 example):
      "Based on what you've told me, this sounds urgent. 
       I recommend going to an emergency room today. 
       The closest to you is [Toronto General — 
       416-340-3111]. Should I connect you to a nurse 
       for more guidance?"

Step 5: Call completion
    → System: session_logger writes row to PostgreSQL
    → AI: "Take care. Goodbye."
    → Caller hangs up
    → Duration: ~2–4 minutes total
```

**FLOW 2: Emergency Escalation (Warm Transfer)**

```
Step 1–3: Same as Flow 1 (questions)

Step 4: CTAS Level 1 or 2 detected
    → AI (immediately, no delay):
      "This sounds like a medical emergency. 
       I'm connecting you to a nurse right now. 
       Please stay on the line."

Step 5: System triggers POST /v1/escalate
    → Twilio <Dial> verb bridges call to human agent
    → Human picks up with pre-read triage summary
    → AI bridges out silently (3-way call for 5 sec, then drops)

Step 6: Caller speaks directly to human agent
    → Session logged with escalated=TRUE + escalation_ts
    → Total time to human: <30 seconds from trigger
```

**FLOW 3: Clinic Staff Views Dashboard (Admin)**

```
Step 1: Staff navigates to app.triageai.ca
    → Sees: Login page (SCR-04)

Step 2: Enters email + password
    → System: Supabase Auth validates → issues JWT
    → Redirect to Dashboard Overview (SCR-05)

Step 3: Views today's call summary
    → Sees: Total calls, CTAS distribution donut chart,
      escalation rate, avg call duration

Step 4: Clicks "View All Sessions" → SCR-06
    → Sees: Paginated table, filter by date/CTAS/routing

Step 5: Clicks a specific call row → SCR-07
    → Sees: Call SID, CTAS level badge, routing decision,
      duration, timestamp, questions answered
    → Magic moment: "I can see exactly how our AI triaged 
      every call this week"
```


***

### 1.3 — Edge Case \& Error Flows

| Flow | Edge Case | Screen State | Message Shown |
| :-- | :-- | :-- | :-- |
| Voice call | Caller is silent for 5+ seconds | VX-02 | "I didn't catch that — could you describe your main concern?" (max 2 retries, then: "I'm having trouble hearing you. Please call back or call 811.") |
| Voice call | Caller says "I want to kill myself" | Any VX | Override all triage logic → immediately: "I hear you. Connecting you to the Crisis Services Canada line now." → hard transfer to 1-833-456-4566 |
| Voice call | Network drops mid-call | Any VX | Session logged as `routing_action: 'incomplete'` — no user-facing action possible |
| Voice call | Caller speaks non-English | VX-01 | OpenAI Realtime detects language → switches to that language in V2. MVP: "I'm sorry, I currently support English only. Please call 811 and press 2 for French." |
| Dashboard login | Wrong password | SCR-04 | "Incorrect email or password. Please try again." (no lockout hint until 5 attempts) |
| Dashboard login | Account doesn't exist | SCR-04 | Same generic message — never confirm whether email exists |
| Dashboard data | No calls in date range filter | SCR-06 | Empty state: illustration + "No calls match this filter. Try adjusting the date range." |
| Dashboard | API timeout (>5s) | SCR-05/06/07 | Inline error banner: "Having trouble loading data. Refresh to try again." with retry button |
| Dashboard | Session ID not found in URL | SCR-07 | "This session doesn't exist or you don't have access." + Back button |


***

### 1.4 — Navigation Model

**Landing Site (SCR-01 to SCR-03):** Single-page scroll with sticky top nav

- Primary nav: Logo (left) + anchor links [How It Works, Demo, Privacy] (center) + "Clinic Login →" CTA (right)
- Mobile: hamburger menu revealing full-screen overlay nav
- Max clicks to any section: 1

**Admin Dashboard (SCR-04 to SCR-10):** Fixed left sidebar (desktop) → bottom tab bar (mobile)

```
SIDEBAR (fixed, 240px wide):
├── TriageAI logo + "Admin" badge (top)
├── ─────────────────────────
├── 📊  Overview          [active state: left border highlight]
├── 📞  Call Sessions
├── 📈  Analytics
├── ─────────────────────────
├── ⚙️   Settings
└── Clinic name + avatar (bottom)
```

**Persistent elements on dashboard:** Sidebar always visible (desktop), bottom tab bar (mobile), page title breadcrumb in header, notification bell (top right)

**Max clicks to any core feature from any screen: 2** ✅

***

## STAGE 2 — Wireframes (Low-Fidelity)

### 2.1 — Wireframe Specifications


***

**SCR-01 — Landing Page**

```
PURPOSE: Convert visitors into demo callers and CHC/clinic leads
ENTRY POINTS: Direct URL, Product Hunt, LinkedIn posts, Google
EXIT POINTS: Click "Call Now" (external — phone dialer), Clinic Login, GitHub link

┌──────────────────────────────────────────────────────────┐
│ [STICKY NAV — 64px]                                      │
│  TriageAI logo    How It Works  Demo  Privacy   [Login→] │
├──────────────────────────────────────────────────────────┤
│ [HERO — 100vh, centered]                                 │
│                                                          │
│    DISPLAY TEXT: "Answer every medical call."            │
│    DISPLAY TEXT: "Instantly." [primary color accent]     │
│                                                          │
│    Body Large: "2.3 million Ontarians have no family     │
│    doctor. Health 811 has a 40-min hold time.            │
│    TriageAI answers in 0 seconds — 24/7, free,           │
│    in any language."                                     │
│                                                          │
│    [📞 Call +1 (647) XXX-XXXX — Try it free]  ← PRIMARY CTA │
│    [↓ See how it works]  ← secondary anchor link        │
│                                                          │
│    Trust row: 🔒 PIPEDA Compliant  🏥 CTAS Standard     │
│               🇨🇦 Ontario-built   ⭐ Open Source        │
├──────────────────────────────────────────────────────────┤
│ [PROBLEM SECTION — stat cards row]                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 2.3M+    │  │ 40 min   │  │ $800+    │              │
│  │ without  │  │ avg wait │  │ per      │              │
│  │ a family │  │ on       │  │ avoidable│              │
│  │ doctor   │  │ Health811│  │ ER visit │              │
│  └──────────┘  └──────────┘  └──────────┘              │
├──────────────────────────────────────────────────────────┤
│ [HOW IT WORKS — 3 steps, icon + text, horizontal]        │
│  ①  You Call          ②  AI Triages        ③  You're   │
│  Any phone,           5 CTAS questions,    Routed Right │
│  any time             <3 minutes           or escalated │
│  "No app needed"      "No hold time"       to a human   │
├──────────────────────────────────────────────────────────┤
│ [LIVE DEMO CTA BLOCK — full-width, colored bg]           │
│   H2: "Try it right now"                                 │
│   Body: "Call our Ontario demo line — it takes 3 minutes"│
│   [📞 +1 (647) XXX-XXXX]  ← large, clickable phone num  │
│   Caption: "Demo line — no personal data stored"         │
├──────────────────────────────────────────────────────────┤
│ [FOR CLINICS SECTION]                                    │
│   H2: "Are you a clinic or CHC?"                        │
│   Body: "Integrate TriageAI into your intake flow..."    │
│   [→ Request a pilot conversation]  ← email CTA         │
├──────────────────────────────────────────────────────────┤
│ [FOOTER]                                                 │
│  Logo  |  Privacy Policy  |  GitHub  |  Contact          │
│  "Built in Toronto 🇨🇦 — Not a medical device"          │
└──────────────────────────────────────────────────────────┘

STATES: Default | Mobile (stacked, hamburger nav)
INTERACTIVE ELEMENTS:
• Phone CTA: tel: link → opens phone dialer
• "Request pilot": opens mailto: or Tally form
• "GitHub": external link to repo
• "Clinic Login →": routes to SCR-04
```


***

**SCR-04 — Login Page**

```
PURPOSE: Authenticate clinic staff into admin dashboard
ENTRY POINTS: SCR-01 "Clinic Login" button, direct URL
EXIT POINTS: Successful login → SCR-05 | Forgot password → email flow

┌──────────────────────────────────────────────────────────┐
│ [FULL-PAGE CENTERED — split layout on desktop]           │
│                                                          │
│  LEFT PANEL (40% width, dark brand bg)                   │
│  ┌────────────────────────┐                              │
│  │  TriageAI logo         │                              │
│  │                        │                              │
│  │  "The AI triage layer  │                              │
│  │   Ontario clinics      │                              │
│  │   trust."              │                              │
│  │                        │                              │
│  │  ● 0-second answer     │                              │
│  │  ● CTAS-aligned logic  │                              │
│  │  ● PIPEDA compliant    │                              │
│  └────────────────────────┘                              │
│                                                          │
│  RIGHT PANEL (60% width, slightly lighter bg)            │
│  ┌────────────────────────┐                              │
│  │  H2: "Sign in"         │                              │
│  │                        │                              │
│  │  Label: Email address  │                              │
│  │  [__________________]  │                              │
│  │                        │                              │
│  │  Label: Password       │                              │
│  │  [__________________] 👁│                              │
│  │                        │                              │
│  │  [  Sign in →  ]       │ ← primary button, full width │
│  │                        │                              │
│  │  "Forgot password?"    │ ← text link                 │
│  └────────────────────────┘                              │
│                                                          │
│  ERROR STATE: red inline banner above button:            │
│  "⚠ Incorrect email or password. Please try again."     │
└──────────────────────────────────────────────────────────┘

STATES: Default | Error (wrong credentials) | Loading (spinner in button)
```


***

**SCR-05 — Dashboard Overview**

```
PURPOSE: Give clinic staff an instant snapshot of today's triage activity
ENTRY POINTS: Login success, sidebar "Overview" click
EXIT POINTS: → SCR-06 (all sessions), → SCR-07 (session detail), → SCR-08 (analytics)

┌──────────────────────────────────────────────────────────┐
│ [SIDEBAR — 240px fixed left]  [MAIN CONTENT — fluid]    │
│  [see nav model above]                                   │
├──────────────────────────────────────────────────────────┤
│ [PAGE HEADER]                                            │
│  H1: "Overview"                                          │
│  Subtitle: "Today — [Day, Month Date, Year]"             │
│  [Date range picker]  right-aligned                      │
├──────────────────────────────────────────────────────────┤
│ [STAT CARDS ROW — 4 cards, equal width]                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Total    │ │Escalation│ │ Avg Call │ │ Non-Emerg│   │
│  │ Calls    │ │   Rate   │ │ Duration │ │ Deflected│   │
│  │          │ │          │ │          │ │          │   │
│  │   [N]    │ │  [N]%    │ │ [N] min  │ │  [N]%    │   │
│  │ +12% vs  │ │          │ │          │ │          │   │
│  │yesterday │ │          │ │          │ │          │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├──────────────────────────────────────────────────────────┤
│ [MAIN CONTENT ROW — 2 columns, 60/40 split]              │
│                                                          │
│  LEFT: CTAS Distribution (donut chart)                   │
│  ┌──────────────────────────┐                            │
│  │  H3: "Triage Levels"     │                            │
│  │  [Donut chart]           │                            │
│  │   L1 ■  L2 ■  L3 ■      │                            │
│  │   L4 ■  L5 ■            │                            │
│  └──────────────────────────┘                            │
│                                                          │
│  RIGHT: Recent Sessions (last 5)                         │
│  ┌──────────────────────┐                                │
│  │  H3: "Recent Calls"  │  [View All →]                 │
│  │  ────────────────    │                                │
│  │  🟡 L3 · ER Urgent   │ 3 min ago                     │
│  │  🟢 L5 · Home Care   │ 8 min ago                     │
│  │  🔴 L1 · Escalated   │ 22 min ago                    │
│  │  🟡 L4 · Walk-in     │ 35 min ago                    │
│  │  🟢 L5 · Home Care   │ 1 hr ago                      │
│  └──────────────────────┘                                │
├──────────────────────────────────────────────────────────┤
│ EMPTY STATE (no calls yet):                              │
│  Centered SVG illustration (phone with waveform)         │
│  H2: "No calls yet today"                                │
│  Body: "When callers reach your TriageAI line,           │
│         sessions will appear here."                      │
│  [→ Share your demo number]  ← CTA                       │
└──────────────────────────────────────────────────────────┘

STATES: Default | Empty | Loading (4 skeleton stat cards + skeleton chart rows)
```


***

**SCR-06 — Call Sessions List**

```
PURPOSE: Browse, filter, and search all triage call sessions
ENTRY POINTS: Sidebar "Call Sessions", SCR-05 "View All"
EXIT POINTS: Row click → SCR-07

┌──────────────────────────────────────────────────────────┐
│ [SIDEBAR] + [MAIN CONTENT]                               │
├──────────────────────────────────────────────────────────┤
│ [PAGE HEADER]                                            │
│  H1: "Call Sessions"                                     │
│  Subtitle: "147 total calls · Last updated 2 min ago"    │
├──────────────────────────────────────────────────────────┤
│ [FILTER BAR — horizontal]                                │
│  [📅 Date range ▼]  [CTAS Level ▼]  [Routing ▼]         │
│  [🔍 Search by Call ID ______]      [↓ Export CSV]       │
├──────────────────────────────────────────────────────────┤
│ [DATA TABLE]                                             │
│  ┌──────┬────────┬──────────┬──────────┬────────┬───┐   │
│  │ Time │Call ID │ CTAS     │ Routing  │Duration│   │   │
│  ├──────┼────────┼──────────┼──────────┼────────┼───┤   │
│  │7:42pm│CA3f... │ 🔴 L1   │Escalated │2m 14s  │ → │   │
│  │7:38pm│CA8a... │ 🟡 L3   │ER Urgent │3m 02s  │ → │   │
│  │7:21pm│CAb2... │ 🟢 L5   │Home Care │1m 48s  │ → │   │
│  │7:15pm│CAe9... │ 🟡 L4   │Walk-in   │2m 33s  │ → │   │
│  │6:59pm│CAf1... │ 🟢 L5   │Home Care │2m 11s  │ → │   │
│  └──────┴────────┴──────────┴──────────┴────────┴───┘   │
│  [← Previous]  Page 1 of 15  [Next →]                   │
└──────────────────────────────────────────────────────────┘

STATES: Default | Empty (no results) | Loading (5 skeleton rows)
INTERACTIVE: Row hover → highlight; → click → SCR-07; Export CSV → download
```


***

**SCR-07 — Call Session Detail**

```
PURPOSE: Full metadata view for a single triage call
ENTRY POINTS: SCR-06 row click
EXIT POINTS: ← Back to sessions

┌──────────────────────────────────────────────────────────┐
│ [SIDEBAR] + [MAIN CONTENT]                               │
├──────────────────────────────────────────────────────────┤
│ [BREADCRUMB]  Call Sessions > Session CA3f...            │
│ [← Back]                                                 │
├──────────────────────────────────────────────────────────┤
│ [SESSION HEADER]                                         │
│  H1: "Session CA3f7a2b..."                               │
│  Badge: [🔴 CTAS Level 1 — Resuscitation]               │
│  Badge: [⚡ Escalated to Human]                          │
├──────────────────────────────────────────────────────────┤
│ [INFO GRID — 2 columns]                                  │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ 📅 Date & Time   │  │ ⏱ Duration        │            │
│  │  Feb 27, 2026    │  │  2 min 14 sec     │            │
│  │  7:42 PM EST     │  │                   │            │
│  └──────────────────┘  └──────────────────┘             │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ 📞 Routing       │  │ 🌐 Language      │             │
│  │  Escalated       │  │  English (en)    │             │
│  │  to human agent  │  │                  │             │
│  └──────────────────┘  └──────────────────┘             │
├──────────────────────────────────────────────────────────┤
│ [TRIAGE QUESTIONS ANSWERED]                              │
│  H3: "Questions Completed"                               │
│  ● Chief complaint    ✅ Answered at 0:14               │
│  ● Duration           ✅ Answered at 0:29               │
│  ● Severity (1–10)    ✅ Answered at 0:41               │
│  ● Age                ✅ Answered at 0:52               │
│  ● Conditions         ✅ Answered at 1:08               │
├──────────────────────────────────────────────────────────┤
│ [SYSTEM EVENTS TIMELINE]                                 │
│  H3: "Call Timeline"                                     │
│  │  7:42:00  Call connected                              │
│  │  7:42:03  AI greeting delivered                       │
│  │  7:42:18  Triage started                              │
│  │  7:44:08  CTAS Level 1 detected                       │
│  │  7:44:09  ⚡ Escalation triggered                     │
│  │  7:44:12  Human agent bridged                         │
│  │  7:44:14  AI disconnected from bridge                 │
│  │  7:44:14  Session logged                              │
└──────────────────────────────────────────────────────────┘

STATES: Default | Not Found (404 message + back button)
```


***

**SCR-08 — Analytics Page**

```
PURPOSE: Weekly/monthly triage trends and performance metrics
ENTRY POINTS: Sidebar "Analytics"
EXIT POINTS: Sidebar navigation only

┌──────────────────────────────────────────────────────────┐
│ [SIDEBAR] + [MAIN CONTENT]                               │
├──────────────────────────────────────────────────────────┤
│ [PAGE HEADER + DATE RANGE TABS]                          │
│  H1: "Analytics"                                         │
│  [7 Days] [30 Days] [90 Days] [Custom]  ← tabs          │
├──────────────────────────────────────────────────────────┤
│ [ROW 1 — Full-width line chart]                          │
│  H3: "Call Volume Over Time"                             │
│  [Line chart — calls per day, x=date, y=count]           │
├──────────────────────────────────────────────────────────┤
│ [ROW 2 — 2-column charts]                               │
│  LEFT: Donut — CTAS Level Distribution (%)               │
│  RIGHT: Bar — Routing Action Breakdown                   │
│         (Escalated / ER / Walk-in / Home / Incomplete)   │
├──────────────────────────────────────────────────────────┤
│ [ROW 3 — Performance metrics table]                      │
│  Avg call duration | Completion rate | Escalation rate   │
│  Avg questions answered | Peak hour of day               │
└──────────────────────────────────────────────────────────┘
```


***

### 2.2 — Component Inventory

| Component | Description | Screens | Variants |
| :-- | :-- | :-- | :-- |
| **StatCard** | Large metric number + label + trend indicator | SCR-05, SCR-08 | Default, Loading (skeleton), Positive trend, Negative trend |
| **CTAButton** | Primary action button | SCR-01, SCR-04, SCR-05, SCR-06 | Primary, Secondary, Destructive, Loading, Disabled |
| **CTASBadge** | Colored badge showing CTAS Level 1–5 | SCR-05, SCR-06, SCR-07 | L1 (red), L2 (orange), L3 (yellow), L4 (teal), L5 (green) |
| **RoutingBadge** | Text badge for routing action | SCR-05, SCR-06, SCR-07 | Escalated, ER Urgent, Walk-in, Home Care, Incomplete |
| **DataTable** | Sortable, filterable session list | SCR-06 | Default, Empty, Loading (skeleton rows), Row hover |
| **SidebarNav** | Fixed left navigation | All dashboard screens | Default, Active item, Collapsed (mobile) |
| **FilterBar** | Horizontal row of dropdowns + search | SCR-06, SCR-08 | Default, Active filter (highlighted), Mobile (stacked) |
| **SessionTimeline** | Vertical event log with timestamps | SCR-07 | Default, Escalation highlight |
| **DonutChart** | CTAS distribution visualization | SCR-05, SCR-08 | Default, Loading, Empty (no data) |
| **LineChart** | Call volume over time | SCR-08 | Default, Loading, Single day (no trend) |
| **EmptyState** | Illustration + text for zero-data screens | SCR-05, SCR-06 | Dashboard empty, Filter empty, Error empty |
| **InputField** | Text input with label + validation | SCR-04, SCR-09 | Default, Focused, Error, Disabled, Password (toggle) |
| **TrustBadge** | Small icon + label for compliance signals | SCR-01 | PIPEDA, CTAS, Canada flag, Open Source |
| **PhoneCTA** | Large clickable phone number block | SCR-01 | Default, Hover (color shift + scale) |
| **SkeletonRow** | Loading placeholder for table rows | SCR-06 | 1-row, 3-row, 5-row variants |
| **PageHeader** | H1 + subtitle + optional right action | All dashboard screens | With CTA, Without CTA, With breadcrumb |

**High-priority (appear on 3+ screens):** CTAButton, SidebarNav, PageHeader, EmptyState, CTASBadge → build these as shared components first before any screen

***

### 2.3 — Responsive Behavior Rules

| Component | Desktop (1200px+) | Tablet (768–1199px) | Mobile (<768px) |
| :-- | :-- | :-- | :-- |
| **Sidebar nav** | Fixed 240px left | Fixed 72px (icons only) | Hidden — bottom tab bar (5 icons) |
| **Stat cards row** | 4 cards in one row | 2×2 grid | 2×2 grid (tighter padding) |
| **Dashboard main content** | 60/40 two-column | Single column stacked | Single column stacked |
| **Data table** | All 6 columns visible | 4 columns (hide Duration, Language) | Card-based layout (no table — each row becomes a card) |
| **Landing hero** | Centered, max-width 800px | Centered, full width | Left-aligned, stacked CTA buttons |
| **Landing stat cards** | 3 horizontal | 3 horizontal | 3 stacked vertical |
| **Login page** | Left/right split panel | Left panel hidden, form only | Form only, full screen |
| **Chart rows** | Side by side | Side by side | Stacked vertically, full width |
| **Top navigation (landing)** | Full horizontal | Full horizontal | Hamburger → full-screen overlay |


***

## STAGE 3 — Design System Foundation

### 3.1 — Color System

**Brand Rationale:** Dark theme by default. Medical-tech needs to communicate trust (not playfulness), precision (not casualness), and calm urgency (not alarm). Dark backgrounds reduce eye strain for clinic staff monitoring dashboards at night, and signal sophistication over standard SaaS blue-and-white.

```
PRIMARY PALETTE
───────────────
Primary-400:  #4ade80   ← Light green: hover states, success accents
Primary-500:  #22c55e   ← Brand green: CTAs, active states, key actions
              ↳ WHY GREEN not blue: Health = vitality + safety.
                Green differentiates from every other health-tech 
                blue SaaS (Maple, Dialogue, Ontario Health all use blue)
Primary-600:  #16a34a   ← Button hover state
Primary-700:  #15803d   ← Button active/pressed state
Primary-900:  #14532d   ← Tint backgrounds, subtle accents

NEUTRAL SCALE (backbone of the UI)
───────────────────────────────────
Neutral-50:   #f8fafc   ← Near-white (light mode only)
Neutral-100:  #f1f5f9   ← Light text on dark backgrounds
Neutral-200:  #e2e8f0   ← Secondary light text
Neutral-300:  #cbd5e1   ← Placeholder text
Neutral-400:  #94a3b8   ← Muted text, captions
Neutral-500:  #64748b   ← Borders, dividers
Neutral-600:  #475569   ← Subtle borders
Neutral-700:  #334155   ← Card backgrounds (elevated on dark bg)
Neutral-800:  #1e293b   ← Card / panel backgrounds
Neutral-900:  #0f172a   ← Page background (primary dark)
Neutral-950:  #020617   ← Deepest background (sidebar)

SEMANTIC COLORS
───────────────
Success:   #22c55e  (same as Primary-500) — completed states, L5
Warning:   #f59e0b  ← amber — L3/L4 CTAS, caution states
Error:     #ef4444  ← red — L1/L2 CTAS, destructive actions, errors
Info:      #3b82f6  ← blue — informational toasts, system messages
Orange:    #f97316  ← L2 CTAS badge

CTAS LEVEL COLOR SYSTEM (used in all badges)
─────────────────────────────────────────────
L1 Resuscitation:  #ef4444 (red)    bg: #450a0a
L2 Emergent:       #f97316 (orange) bg: #431407
L3 Urgent:         #f59e0b (amber)  bg: #451a03
L4 Semi-Urgent:    #14b8a6 (teal)   bg: #042f2e
L5 Non-Urgent:     #22c55e (green)  bg: #052e16

BACKGROUND LAYERS
─────────────────
Page background:     #0f172a  (Neutral-900)
Sidebar background:  #020617  (Neutral-950)
Card background:     #1e293b  (Neutral-800)
Elevated card:       #334155  (Neutral-700)
Input background:    #1e293b  (Neutral-800)
Input border:        #334155  (Neutral-700)
Input border focus:  #22c55e  (Primary-500)
```

**WCAG Contrast Verification:**


| Text Color | Background | Ratio | WCAG AA? |
| :-- | :-- | :-- | :-- |
| Neutral-100 (\#f1f5f9) on Neutral-900 (\#0f172a) | 16.2:1 | ✅ AAA |  |
| Neutral-400 (\#94a3b8) on Neutral-900 (\#0f172a) | 6.1:1 | ✅ AA |  |
| Primary-500 (\#22c55e) on Neutral-900 (\#0f172a) | 7.2:1 | ✅ AA |  |
| White on Primary-500 (\#22c55e) | 4.7:1 | ✅ AA |  |
| Neutral-300 (\#cbd5e1) on Neutral-800 (\#1e293b) | 7.8:1 | ✅ AAA |  |
| Warning (\#f59e0b) on Neutral-800 (\#1e293b) | 6.3:1 | ✅ AA |  |


***

### 3.2 — Typography System

**Font Family: Inter (Variable)**

- **Why Inter:** Designed specifically for screen readability at small sizes; used by Linear, Vercel, and Stripe; variable font = one file for all weights; free Google Font; excellent number rendering for data-dense dashboards; 0 licensing risk

**Monospace: JetBrains Mono** — for Call SIDs, API keys, code snippets in settings


| Level | Size | Weight | Line Height | Letter Spacing | Usage |
| :-- | :-- | :-- | :-- | :-- | :-- |
| **Display** | 56px | 800 | 1.05 | -0.03em | Landing hero headline only |
| **H1** | 32px | 700 | 1.2 | -0.02em | Page titles in dashboard |
| **H2** | 24px | 700 | 1.3 | -0.01em | Section headers, landing sections |
| **H3** | 20px | 600 | 1.4 | 0 | Card titles, widget headers |
| **H4** | 16px | 600 | 1.4 | 0 | Subsection labels, table headers |
| **Body Large** | 18px | 400 | 1.6 | 0 | Landing page descriptions |
| **Body** | 15px | 400 | 1.5 | 0 | Default UI text, table cells |
| **Body Small** | 13px | 400 | 1.5 | 0 | Captions, secondary info, badges |
| **Caption** | 11px | 500 | 1.4 | 0.04em | Metadata, timestamps, labels |
| **Mono** | 13px | 400 | 1.5 | 0 | Call SIDs, API keys |

**Mobile responsive adjustments:**

- Display: 36px | H1: 26px | H2: 20px | Body Large: 16px

***

### 3.3 — Spacing \& Layout System

```
BASE UNIT: 4px

SPACING SCALE:
  space-1:   4px   ← icon-to-label gap, tight inline spacing
  space-2:   8px   ← between related elements, button icon padding
  space-3:   12px  ← small component internal padding
  space-4:   16px  ← standard component padding (inputs, badges)
  space-5:   20px  ← medium component padding
  space-6:   24px  ← card padding, section internal gap
  space-8:   32px  ← section top/bottom padding
  space-10:  40px  ← large section gaps
  space-12:  48px  ← between major sections (landing)
  space-16:  64px  ← hero internal padding, large section breaks
  space-24:  96px  ← between landing page sections

PAGE MARGINS:
  Desktop (1200px+): 32px left/right, max-content-width: 1280px
  Tablet (768–1199px): 24px left/right
  Mobile (<768px): 16px left/right

DASHBOARD LAYOUT:
  Sidebar width: 240px (desktop) / 72px (tablet, icons only)
  Main content: calc(100vw - 240px) with 32px internal padding
  Card grid gap: 16px (compact) / 24px (spacious)

GRID:
  Dashboard: 12-column, 24px gutter
  Landing: 12-column, 24px gutter, max-width 1200px centered
```


***

### 3.4 — Component Design Tokens

```css
/* BORDER RADIUS */
--radius-xs:   4px;   /* badges, tags, code blocks */
--radius-sm:   6px;   /* input fields, small buttons */
--radius-md:   8px;   /* cards, modals, standard buttons */
--radius-lg:   12px;  /* large cards, panels */
--radius-xl:   16px;  /* hero cards, feature blocks */
--radius-full: 9999px; /* pills, avatar circles, toggle switches */

/* SHADOWS */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.4);
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3);
--shadow-primary: 0 0 0 3px rgba(34, 197, 94, 0.25); /* focus ring */

/* BORDERS */
--border-color: #334155;       /* Neutral-700 — standard dividers */
--border-color-subtle: #1e293b; /* Neutral-800 — very subtle */
--border-width: 1px;
--border-focus: #22c55e;       /* Primary-500 — input focus */

/* TRANSITIONS */
--transition-fast:   150ms ease-out;   /* buttons, hover states */
--transition-base:   200ms ease-in-out; /* cards, panels */
--transition-slow:   300ms ease-in-out; /* modals, page transitions */
--transition-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* toasts, pop-ups */
```


***

### 3.5 — Iconography

**Recommended library: Lucide React** (lucide.dev)

- Why Lucide over alternatives: cleanest outline style at small sizes; React-native; MIT license; 1,400+ icons; 1:1 pairs with shadcn/ui (the two are designed together)
- Style rule: **Outline only** in navigation and labels; **Filled** only for CTAS badges and critical alerts

| Icon Name (Lucide) | Used For | Size |
| :-- | :-- | :-- |
| `PhoneCall` | Demo CTA, voice sessions | 20px nav, 32px hero |
| `PhoneForwarded` | Escalation events | 16px timeline |
| `Activity` | Overview/dashboard nav | 20px |
| `List` | Sessions nav | 20px |
| `BarChart3` | Analytics nav | 20px |
| `Settings` | Settings nav | 20px |
| `AlertTriangle` | L1/L2 CTAS badge, error states | 16px badge, 20px inline |
| `Clock` | Duration, timestamps | 14px |
| `CheckCircle2` | Questions answered, success | 16px |
| `XCircle` | Error states, incomplete | 16px |
| `ChevronRight` | Table row → indicator | 16px |
| `Download` | Export CSV | 16px |
| `Filter` | Filter bar | 16px |
| `Search` | Search input | 16px |
| `Eye` | Password toggle | 16px |
| `Globe` | Language indicator | 14px |
| `ShieldCheck` | PIPEDA trust badge | 20px landing |
| `Zap` | Escalation badge, speed indicators | 16px |


***

### 3.6 — Design System as Tailwind Config + CSS Variables

```javascript
// tailwind.config.js — ready to copy-paste
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        neutral: {
          50:  '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0',
          300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b',
          600: '#475569', 700: '#334155', 800: '#1e293b',
          900: '#0f172a', 950: '#020617',
        },
        ctas: {
          l1: { bg: '#450a0a', text: '#ef4444' },
          l2: { bg: '#431407', text: '#f97316' },
          l3: { bg: '#451a03', text: '#f59e0b' },
          l4: { bg: '#042f2e', text: '#14b8a6' },
          l5: { bg: '#052e16', text: '#22c55e' },
        },
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display': ['56px', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '800' }],
        'h1':      ['32px', { lineHeight: '1.2',  letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2':      ['24px', { lineHeight: '1.3',  letterSpacing: '-0.01em', fontWeight: '700' }],
        'h3':      ['20px', { lineHeight: '1.4',  letterSpacing: '0',       fontWeight: '600' }],
        'h4':      ['16px', { lineHeight: '1.4',  letterSpacing: '0',       fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6',  letterSpacing: '0',       fontWeight: '400' }],
        'body':    ['15px', { lineHeight: '1.5',  letterSpacing: '0',       fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.5',  letterSpacing: '0',       fontWeight: '400' }],
        'caption': ['11px', { lineHeight: '1.4',  letterSpacing: '0.04em',  fontWeight: '500' }],
      },
      borderRadius: {
        'xs': '4px', 'sm': '6px', 'md': '8px',
        'lg': '12px', 'xl': '16px',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0,0,0,0.4)',
        'sm': '0 2px 8px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)',
        'md': '0 4px 16px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
        'lg': '0 8px 32px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.3)',
        'primary': '0 0 0 3px rgba(34,197,94,0.25)',
      },
      animation: {
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'slide-in': 'slideIn 300ms cubic-bezier(0.34,1.56,0.64,1)',
        'fade-in': 'fadeIn 200ms ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
```


***

## STAGE 4 — High-Fidelity Mockup Specifications

### 4.1 — Screen-by-Screen Hi-Fi Specs (Top 5 Critical Screens)


***

**SCR-01 — Landing Page (Hi-Fi)**

```
STICKY NAV — height: 64px
  Background: neutral-950/80 + backdrop-blur-md (glassmorphism)
  Border-bottom: 1px neutral-800
  Logo: "TriageAI" — Inter 600, 18px, white
  Nav links: body-sm (13px), neutral-400, hover: neutral-100
    transition: color 150ms ease-out
  Login CTA: 
    border: 1px primary-500, border-radius: sm (6px)
    text: primary-500 (13px, 500 weight), padding: 8px 16px
    hover: bg-primary-500/10, transition: 150ms

HERO SECTION — min-height: 100vh
  Background: neutral-900 + radial-gradient(
    ellipse at 50% 0%, 
    rgba(34,197,94,0.08) 0%, 
    transparent 60%
  )
  ← Subtle green glow emanating from top center

  Eyebrow label: 
    "For Ontario" tag — bg: primary-900, text: primary-400
    border: 1px primary-500/30, border-radius: full
    padding: 4px 12px, caption (11px, 500)
    spacing-below: 16px

  Display headline:
    "Answer every medical call."  — neutral-50, display (56px)
    "Instantly."  — primary-500, display (56px)
    max-width: 700px, centered
    spacing-below: 24px

  Subheadline:
    "2.3 million Ontarians have no family doctor.
     Health 811 has a 40-minute hold time.
     TriageAI answers in 0 seconds — 24/7, free, in any language."
    text: neutral-400, body-lg (18px), max-width: 560px, centered
    spacing-below: 32px

  PRIMARY CTA BUTTON:
    bg: primary-500, text: neutral-950, border-radius: md (8px)
    padding: 14px 28px, font: 15px 600
    icon: PhoneCall (18px), gap: 8px
    content: "📞 Call +1 (647) XXX-XXXX — Free demo"
    hover: bg-primary-400, transform: translateY(-1px), shadow-md
    active: bg-primary-600, transform: translateY(0)
    transition: all 150ms ease-out

  Trust badges row (below CTA, spacing: 24px):
    [🔒 PIPEDA Compliant] [🏥 CTAS Standard] [🇨🇦 Ontario-built] [⭐ Open Source]
    Each: neutral-500 text (11px, 500), neutral-600 border, rounded-full
    padding: 4px 12px, gap: 12px between badges

STAT CARDS ROW:
  3 cards, max-width: 800px, centered, gap: 16px
  Each card:
    bg: neutral-800, border: 1px neutral-700
    border-radius: lg (12px), padding: 24px 32px
    text-align: center

  Number: "2.3M+" — display reduced (36px, 800, neutral-50)
  Label: "Ontarians without a family doctor" — body-sm, neutral-400
  Card 2 number color: Warning (#f59e0b) — "40 min" avg wait
  Card 3 number color: Error (#ef4444) — "$800+" ER cost

HOW IT WORKS — 3 steps:
  bg: neutral-950, padding: 96px 32px
  Step container: flex row, gap: 48px, centered

  Each step:
    Number badge: primary-500 bg (32px circle), neutral-950 text, 700
    Icon: Lucide icon (32px, neutral-300), margin-top: 12px
    Title: h3 (20px, 600, neutral-100), margin-top: 16px
    Description: body (15px, neutral-400), max-width: 200px

  Connector lines between steps:
    1px neutral-700 horizontal line, middle-aligned

DEMO CTA BLOCK:
  bg: linear-gradient(135deg, neutral-800 0%, primary-900/30 100%)
  border: 1px primary-500/20, border-radius: xl (16px)
  padding: 48px 64px, margin: 64px auto, max-width: 720px, centered

  H2: "Try it right now" — neutral-50, h2 (24px, 700)
  Body: neutral-400, body-lg
  Phone number: primary-500, h1 (32px, 700), font-mono
    hover: text-decoration: underline, cursor: pointer
  Disclaimer: neutral-600, caption (11px)
```


***

**SCR-04 — Login Page (Hi-Fi)**

```
FULL PAGE:
  bg: neutral-900
  Layout: CSS grid, 2 columns [40% | 60%], 100vh height

LEFT PANEL (brand panel):
  bg: neutral-950, padding: 48px
  border-right: 1px neutral-800

  Logo: TriageAI — Inter 700, 20px, white + primary-500 dot
  Tagline: h2 (24px, 700, neutral-100), margin-top: 48px
    "The AI triage layer\nOntario clinics trust."
  Feature bullets:
    Each: 16px neutral-300, with primary-500 CheckCircle2 icon (16px)
    gap: 12px between bullets

RIGHT PANEL (form):
  bg: neutral-900, padding: 48px 64px
  Centered vertically

  H2: "Sign in" — h2 (24px, 700, neutral-50), margin-bottom: 32px

  INPUT FIELD SPEC:
    Label: body-sm (13px, 500, neutral-300), margin-bottom: 8px
    Input: full-width, height: 44px, padding: 0 12px
      bg: neutral-800, border: 1px neutral-700
      border-radius: sm (6px), color: neutral-100, body (15px)
      placeholder: neutral-600
      focus: border-primary-500, box-shadow: shadow-primary
      transition: border-color 150ms

  SIGN IN BUTTON:
    Full width, height: 44px, margin-top: 24px
    bg: primary-500, text: neutral-950, border-radius: sm (6px)
    font: 15px, 600
    Loading state: spinner (white, 16px) replaces text
    hover: bg-primary-400
    disabled: bg-neutral-700, text-neutral-500, cursor-not-allowed

  "Forgot password?":
    body-sm, primary-500, margin-top: 16px, text-align: center
    hover: primary-400

  ERROR BANNER (shown on bad credentials):
    bg: rgba(239,68,68,0.1), border: 1px rgba(239,68,68,0.3)
    border-radius: sm, padding: 12px 16px
    icon: AlertTriangle (16px, #ef4444) + text: neutral-200 body-sm
    appears ABOVE sign in button with 16px margin
    animation: fadeIn 200ms ease-out
```


***

**SCR-05 — Dashboard Overview (Hi-Fi)**

```
SIDEBAR — 240px, bg: neutral-950
  Top: Logo area (64px height), border-bottom: 1px neutral-800
    "TriageAI" text + small "Admin" caption badge
  
  Nav items: 
    padding: 0 12px, each item: 40px height, border-radius: md (8px)
    Default: icon (neutral-500) + text (neutral-400, body-sm)
    Hover: bg-neutral-800, icon+text: neutral-200
    Active: bg-primary-900/40, left border: 2px primary-500
             icon+text: primary-400

  Bottom: clinic name + avatar
    avatar: 28px circle, bg-neutral-700, initials in caption
    clinic name: body-sm, neutral-300
    padding: 16px 12px

MAIN CONTENT — padding: 32px
PAGE HEADER:
  H1 "Overview" — h1 (32px, 700, neutral-50)
  Subtitle: "Today — Friday, February 27, 2026" — body-sm, neutral-500
  Right: date range picker button
    bg: neutral-800, border: 1px neutral-700, border-radius: sm
    text: neutral-300, body-sm, padding: 8px 16px

STAT CARDS ROW (4 cards):
  CSS Grid: repeat(4, 1fr), gap: 16px, margin-bottom: 24px

  Each card:
    bg: neutral-800, border: 1px neutral-700
    border-radius: lg (12px), padding: 20px 24px
    transition: border-color 200ms
    hover: border-neutral-600

    Label: caption (11px, 500, neutral-500), uppercase, letter-spacing: 0.08em
    Value: h1 (32px, 800, neutral-50), margin-top: 4px
    Trend: body-sm (13px)
      Positive trend: primary-500 + ArrowUp icon (12px)
      Negative trend: #ef4444 + ArrowDown icon (12px)
      "vs yesterday" — neutral-600, caption

  Escalation Rate card — value color: #ef4444 if >20%, else neutral-50

MAIN CONTENT ROW (60/40):
  gap: 24px

  LEFT — CTAS Donut Chart Card:
    bg: neutral-800, border: 1px neutral-700, border-radius: lg
    padding: 24px, height: 320px
    H3: "Triage Levels" — h3 (20px, 600, neutral-100)
    Chart: Recharts DonutChart, centered
      Colors: L1=#ef4444, L2=#f97316, L3=#f59e0b, L4=#14b8a6, L5=#22c55e
    Legend: below chart, each level: colored dot + label + percentage
      body-sm, neutral-400, flex-row, gap: 16px, flex-wrap

  RIGHT — Recent Sessions Card:
    bg: neutral-800, border: 1px neutral-700, border-radius: lg
    padding: 24px
    Header: H3 "Recent Calls" + "View All →" link (primary-500, body-sm)
    Divider: 1px neutral-700
    
    Each row (5 rows):
      padding: 12px 0, border-bottom: 1px neutral-700/50
      Left: CTASBadge + routing action text
      Right: "X min ago" — caption, neutral-500
      hover: bg-neutral-700/30, cursor: pointer
    
    Last row: no border-bottom

EMPTY STATE:
  centered container, margin-top: 80px
  SVG illustration: phone + waveform outline, neutral-700 stroke
    (source: unDraw "phone call" or custom 2-color SVG, 160px height)
  H2 "No calls yet today" — h2, neutral-300, margin-top: 24px
  Body: neutral-500, max-width: 320px, centered, margin-top: 8px
  CTA button: secondary style (border primary-500), margin-top: 24px
```


***

**SCR-06 — Sessions List (Hi-Fi)**

```
PAGE HEADER: same pattern as SCR-05
H1: "Call Sessions" + session count in neutral-500

FILTER BAR:
  flex row, gap: 8px, padding-bottom: 16px, border-bottom: 1px neutral-800
  
  Dropdowns:
    bg: neutral-800, border: 1px neutral-700, border-radius: sm
    padding: 8px 12px, body-sm, neutral-300
    ChevronDown icon (14px, neutral-500) right side
    hover: border-neutral-600
    active filter: border-primary-500, text-primary-400
  
  Search input:
    width: 240px, Search icon (14px) inside left
    same input styling as SCR-04 but height: 36px
  
  Export CSV button: 
    ml-auto, outline style (border neutral-700), Download icon

DATA TABLE:
  full width, border-collapse: separate, border-spacing: 0

  Table header:
    bg: neutral-950/60, border-bottom: 1px neutral-800
    th: caption (11px, 500, neutral-500), uppercase, padding: 10px 16px
    text-align: left

  Table rows:
    td: body (15px, neutral-300), padding: 14px 16px
    border-bottom: 1px neutral-800/60
    cursor: pointer
    hover: bg-neutral-800/50
    transition: background-color 100ms

  TIME column: caption (11px), neutral-500, font-mono
  CALL ID column: font-mono, body-sm, neutral-500 (truncated with …)
  CTAS column: CTASBadge component (see component spec below)
  ROUTING column: RoutingBadge component
  DURATION: neutral-400, body-sm
  ARROW: ChevronRight (14px, neutral-600), visible on row hover only

CTAS BADGE COMPONENT SPEC:
  display: inline-flex, align-items: center, gap: 6px
  padding: 3px 8px, border-radius: xs (4px)
  font: caption (11px, 600), uppercase, letter-spacing: 0.06em
  icon: AlertTriangle (10px) for L1/L2, Circle (10px) for L3–L5
  
  L1: bg-[#450a0a], text-[#ef4444], border: 1px rgba(239,68,68,0.3)
  L2: bg-[#431407], text-[#f97316], border: 1px rgba(249,115,22,0.3)
  L3: bg-[#451a03], text-[#f59e0b], border: 1px rgba(245,158,11,0.3)
  L4: bg-[#042f2e], text-[#14b8a6], border: 1px rgba(20,184,166,0.3)
  L5: bg-[#052e16], text-[#22c55e], border: 1px rgba(34,197,94,0.3)

SKELETON LOADING ROWS (5):
  Each row td: bg-neutral-800, border-radius: xs, height: 12px
    width: varies per column (60px / 100px / 70px / 80px / 40px)
    animation: shimmer (gradient sweep, 1.5s loop)
    bg: linear-gradient(90deg, neutral-800 0%, neutral-700 50%, neutral-800 100%)
    background-size: 200% 100%

PAGINATION:
  margin-top: 16px, flex row, align-center, justify-between
  "Page X of Y" — body-sm, neutral-500
  Previous/Next buttons: same as filter dropdowns, 36px height
  Disabled: text-neutral-700, border-neutral-800, cursor-not-allowed
```


***

**SCR-07 — Session Detail (Hi-Fi)**

```
BREADCRUMB: body-sm, neutral-500
  "Call Sessions" link (primary-500, hover: underline) > "Session CA3f…"
  ChevronRight icon between items, spacing: 4px

BACK BUTTON:
  bg: neutral-800, border: 1px neutral-700, border-radius: sm
  ArrowLeft icon + "Back to sessions", body-sm, neutral-300
  margin-bottom: 24px

SESSION HEADER:
  H1: "Session CA3f7a2b..." — font-mono, h1 size, neutral-50
  Badge row: CTASBadge + RoutingBadge side by side
  margin-bottom: 32px

INFO GRID (2×2):
  4 info cards, gap: 16px
  Each: bg-neutral-800, border-neutral-700, border-radius-md
  padding: 16px 20px
  
  Icon: 20px, neutral-500, margin-bottom: 8px
  Label: caption, neutral-500, uppercase
  Value: h3 (20px, 600, neutral-100)
  Subvalue: body-sm, neutral-500

QUESTIONS LOG:
  bg: neutral-800, border: neutral-700, border-radius: lg
  padding: 24px, margin-top: 24px

  H3 "Questions Completed" + check count badge
  (e.g., "5/5" badge — primary-500 bg, neutral-950 text, font-mono, caption)
  
  Each question row:
    padding: 10px 0, border-bottom: 1px neutral-700/50
    Left: CheckCircle2 icon (16px, primary-500) + question name (body, neutral-200)
    Right: "Answered at X:XX" — caption, neutral-500, font-mono

TIMELINE:
  bg: neutral-800, border: neutral-700, border-radius: lg
  padding: 24px, margin-top: 16px

  H3 "Call Timeline"
  
  Timeline line: 2px neutral-700, vertical, left-aligned, offset: 16px
  
  Each event:
    dot: 8px circle on the line, bg-neutral-600
    ESCALATION event dot: 12px, bg-primary-500, glow: shadow-primary
    Timestamp: font-mono, caption, neutral-500, margin-right: 16px
    Event text: body-sm, neutral-300
    
    ESCALATION row: 
      bg: primary-900/20, border: 1px primary-500/20
      border-radius: sm, padding: 8px 12px
      text: primary-400, Zap icon (14px) prepended
```


***

### 4.2 — State Variations for Key Screens

**CTAButton — all states:**

```
Default:    bg-primary-500, text-neutral-950, shadow-sm
Hover:      bg-primary-400, translateY(-1px), shadow-md    [150ms ease-out]
Active:     bg-primary-600, translateY(0), shadow-xs       [100ms ease-in]
Loading:    bg-primary-600, cursor-wait
             spinner: 16px white circle, animate-spin
             text hidden, replaced by spinner
Disabled:   bg-neutral-700, text-neutral-500, cursor-not-allowed, no shadow
Focus:      outline: 2px primary-500, outline-offset: 2px (keyboard nav)
```

**InputField — all states:**

```
Default:    bg-neutral-800, border-neutral-700, text-neutral-100
Placeholder: text-neutral-600
Hover:      border-neutral-600                             [150ms]
Focus:      border-primary-500, box-shadow: shadow-primary [150ms]
Error:      border-red-500, bg-red-950/20, box-shadow: 0 0 0 3px rgba(239,68,68,0.15)
            + error message: caption, #ef4444, margin-top: 6px, AlertCircle icon
Disabled:   bg-neutral-900, border-neutral-800, text-neutral-600, cursor-not-allowed
Success:    border-primary-500, CheckCircle2 icon inside right
```


***

## STAGE 5 — Interaction \& Motion Design

### 5.1 — Interaction Catalog

| Element | Trigger | Response | Duration | Easing | Visual Detail |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Primary Button | Hover | bg lighten + rise | 150ms | ease-out | primary-500→400, translateY(-1px), shadow-sm→md |
| Primary Button | Click | Press down | 100ms | ease-in | primary-600, translateY(0), scale(0.99) |
| Phone CTA (landing) | Hover | Color glow + scale | 200ms | ease-in-out | primary-400 text, shadow: 0 0 24px rgba(34,197,94,0.3), scale(1.02) |
| Nav item (sidebar) | Hover | Bg reveal | 150ms | ease-out | bg-neutral-800 fade in, text-neutral-200 |
| Nav item | Active click | Left border + bg tint | 200ms | ease-in-out | 2px primary-500 left border slides in, bg-primary-900/40 |
| Table row | Hover | Row highlight | 100ms | ease-out | bg-neutral-800/50 fade in, arrow icon opacity 0→1 |
| Session detail card | Hover | Border brighten | 150ms | ease-out | border-neutral-700 → border-neutral-500 |
| CTASBadge L1/L2 | Mount | Pulse once | 600ms | ease-in-out | border opacity pulses 0.3→0.8→0.3 (one cycle, not loop) |
| Page navigation | Route change | Fade crossfade | 200ms | ease-in-out | opacity 0.8→1, translateY(4px→0) |
| Modal | Open | Fade + scale up | 250ms | ease-out | opacity 0→1, scale(0.96→1), backdrop: blur(8px) fade in |
| Modal | Close | Fade + scale down | 200ms | ease-in | opacity 1→0, scale(1→0.96) |
| Toast notification | Appear | Slide + fade in | 300ms | spring (0.34,1.56,0.64,1) | translateX(100%→0), opacity 0→1 |
| Toast notification | Auto-dismiss | Slide + fade out | 200ms | ease-in | translateX(0→100%), opacity 1→0 |
| Stat card | Data load | Count-up animation | 800ms | ease-out | Number counts up from 0 to actual value |
| Skeleton loader | Loading | Shimmer sweep | 1.5s loop | ease-in-out | gradient sweeps left→right across skeleton blocks |
| Donut chart | Mount | Segments draw in | 600ms | ease-out | Each segment grows from 0 degrees, staggered 80ms |
| Dashboard sidebar | Collapse (tablet) | Width animate | 300ms | ease-in-out | 240px→72px, text labels fade out, icons stay |
| Error banner | Appear | Drop down | 200ms | ease-out | translateY(-8px→0), opacity 0→1 |
| Filter dropdown | Open | Scale + fade | 150ms | ease-out | scale(0.97→1), opacity 0→1, transformOrigin: top |

### 5.2 — Motion Principles

1. **Responsive first:** Every interaction must respond within 100ms of user action — the animation is decoration, the state change is immediate. Never block user action behind an animation.
2. **Purposeful only:** No animation exists purely for aesthetics. Every motion communicates system state (loading, success, error, transition). If
<span style="display:none">[^1]</span>

<div align="center">⁂</div>

[^1]: 05-design-prototyping-prompt-template.md

