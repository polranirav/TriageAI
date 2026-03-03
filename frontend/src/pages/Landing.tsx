import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  PhoneCall, ShieldCheck, CheckCircle2, Activity, Lock, Code2,
  ArrowRight, Menu, X, BarChart3, Clock, AlertTriangle, Globe,
} from "lucide-react"
import { cn } from "../lib/utils"

const DEMO_TEL = "tel:+12262128564"
const DEMO_NUM = "+1 (226) 212-8564"
const PILOT_EMAIL = "mailto:pilot@triageai.ca?subject=TriageAI%20Pilot%20Request"

// ── Animated waveform ──────────────────────────────────────────────────────────
function Waveform({ color = "#3b82f6" }: { color?: string }) {
  const heights = [28, 44, 36, 56, 42, 50, 30, 60, 46, 36, 54, 40, 50, 32, 44, 38, 58, 40, 52, 30, 62, 46, 36]
  return (
    <div className="flex items-center gap-[3px] h-10">
      {heights.map((h, i) => (
        <div
          key={i}
          className="rounded-sm"
          style={{
            width: 3,
            height: `${h * 0.6}px`,
            background: color,
            animation: `waveBar ${0.55 + (i % 5) * 0.15}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.06}s`,
          }}
        />
      ))}
    </div>
  )
}

// ── Mini waveform for logo ─────────────────────────────────────────────────────
function LogoWave() {
  return (
    <div className="flex items-center gap-[2px] h-4">
      {[3, 5, 4, 6, 3].map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-blue-500"
          style={{
            height: `${h * 3}px`,
            animation: `waveBar 1s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    setMobileOpen(false)
  }

  return (
    <div className="min-h-screen font-sans" style={{ background: "#0A0F1E", color: "#F0F4FF" }}>

      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300",
        scrolled ? "bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-[#1F2D40]" : "bg-transparent",
      )}>
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LogoWave />
            <span className="text-[18px] font-semibold text-white">TriageAI</span>
            <span className="hidden sm:inline text-[10px] font-medium px-1.5 py-0.5 rounded border border-emerald-500/40 text-emerald-400 uppercase tracking-wide">
              Ontario
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "How It Works", id: "how-it-works" },
              { label: "For Clinics",  id: "for-clinics" },
              { label: "Pricing",      id: "pricing" },
              { label: "Compliance",   id: "compliance" },
            ].map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-[13px] transition-colors hover:text-white"
                style={{ color: "#8B9BB4" }}
              >
                {label}
              </button>
            ))}
            <a
              href="https://github.com/triageai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] transition-colors hover:text-white"
              style={{ color: "#8B9BB4" }}
            >
              GitHub
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a
              href={PILOT_EMAIL}
              className="text-[13px] font-medium px-4 py-2 rounded border border-blue-500/60 text-blue-400 hover:bg-blue-500/10 transition-all"
            >
              Request Pilot
            </a>
            <Link
              to="/login"
              className="text-[13px] font-medium px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            >
              Clinic Login
            </Link>
          </div>

          <button className="md:hidden hover:text-white" style={{ color: "#8B9BB4" }} onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col p-6" style={{ background: "rgba(10,15,30,0.98)" }}>
          <div className="flex justify-between items-center mb-12">
            <span className="text-[18px] font-semibold text-white">TriageAI</span>
            <button onClick={() => setMobileOpen(false)}><X className="w-6 h-6" style={{ color: "#8B9BB4" }} /></button>
          </div>
          <div className="flex flex-col gap-6 flex-1">
            {[
              { label: "How It Works", id: "how-it-works" },
              { label: "For Clinics",  id: "for-clinics" },
              { label: "Pricing",      id: "pricing" },
              { label: "Compliance",   id: "compliance" },
            ].map(({ label, id }) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-left text-[20px] text-white font-medium">
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 mt-8">
            <a href={PILOT_EMAIL} className="w-full text-center py-3 rounded border border-blue-500 text-blue-400 font-medium">
              Request Pilot
            </a>
            <Link to="/login" className="w-full text-center py-3 rounded bg-blue-600 text-white font-medium">
              Clinic Login
            </Link>
          </div>
        </div>
      )}

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100vh] flex items-center pt-16 px-6 overflow-hidden">
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(#8B9BB4 1px, transparent 1px), linear-gradient(90deg, #8B9BB4 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Blue radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 65% 40%, rgba(59,130,246,0.07) 0%, transparent 55%)" }}
        />

        <div className="relative z-10 max-w-[1280px] mx-auto w-full py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 items-center">

            {/* Left */}
            <div>
              {/* Live badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
                style={{ background: "rgba(255,59,59,0.08)", border: "1px solid rgba(255,59,59,0.25)" }}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">
                  Live — 847 calls triaged this week
                </span>
              </div>

              <h1
                className="text-[48px] md:text-[64px] lg:text-[72px] font-extrabold leading-[1.05] tracking-[-0.025em] mb-6"
                style={{ color: "#F0F4FF" }}
              >
                Ontario patients call.<br />
                TriageAI answers.<br />
                <span className="text-blue-400">Every time.</span>
              </h1>

              <p
                className="text-[18px] md:text-[20px] leading-[1.7] mb-8 max-w-[540px]"
                style={{ color: "#8B9BB4" }}
              >
                A 24/7 AI voice triage service for Ontario Community Health Centres.
                Patients call one number — TriageAI triages their symptoms, classifies
                by CTAS level, and routes them to the right care in under 3 minutes.
                Free for callers. Zero wait time.
              </p>

              {/* Proof strip */}
              <div className="flex gap-8 mb-10">
                {[
                  { val: "< 3 sec",  label: "Answer Time" },
                  { val: "100%",     label: "Escalation Accuracy" },
                  { val: "$0",       label: "For Callers" },
                ].map((s, i) => (
                  <div key={i} className={cn("pr-8", i < 2 && "border-r border-[#1F2D40]")}>
                    <div className="text-[28px] font-bold text-white leading-none mb-1">{s.val}</div>
                    <div className="text-[11px] uppercase tracking-wide" style={{ color: "#8B9BB4" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <a
                  href={DEMO_TEL}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-lg text-[16px] font-semibold text-white transition-transform hover:scale-[1.02]"
                  style={{ background: "linear-gradient(90deg, #3b82f6, #2563eb)" }}
                >
                  <PhoneCall className="w-5 h-5" />
                  Call the Live Demo: {DEMO_NUM}
                </a>
                <a
                  href={PILOT_EMAIL}
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg text-[15px] font-medium text-blue-400 border border-blue-500/50 hover:bg-blue-500/10 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  Request a Free 60-Day Pilot
                </a>
              </div>

              <p className="text-[12px]" style={{ color: "#4A5568" }}>
                🔒 PHIPA compliant · Data stays in Canada · Open source on GitHub · No credit card required
              </p>
            </div>

            {/* Right: Live call card */}
            <div className="hidden lg:block">
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "#111827",
                  border: "1px solid #1F2D40",
                  animation: "borderGlow 3s ease-in-out infinite",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wide">Live Call in Progress</span>
                  </div>
                  <span className="text-[11px] font-mono" style={{ color: "#4A5568" }}>2:34 elapsed</span>
                </div>

                <div className="py-2 flex justify-center">
                  <Waveform />
                </div>

                <div className="border-t border-[#1F2D40] my-4" />

                <div className="space-y-3">
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: "#4A5568" }}>AI Triage Assessment</div>

                  <div>
                    <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: "#8B9BB4" }}>Chief Complaint</div>
                    <div className="text-[14px] text-white font-medium">"Chest tightness, left arm pain"</div>
                  </div>

                  <div
                    className="rounded-lg p-3"
                    style={{ background: "rgba(255,122,0,0.08)", border: "1px solid rgba(255,122,0,0.30)" }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-[12px] font-bold text-orange-400 uppercase tracking-wide">CTAS Level 2 — Emergent</span>
                    </div>
                    <div className="text-[12px]" style={{ color: "#8B9BB4" }}>ER within 15 min · Escalating now</div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1.5" style={{ color: "#4A5568" }}>
                      <span>Question 4 of 5</span>
                      <span>Escalating: YES</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "#1F2D40" }}>
                      <div className="h-full w-4/5 rounded-full bg-orange-500" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#1F2D40] my-4" />

                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#4A5568" }}>Routing Decision</div>
                  <div className="text-[12px]" style={{ color: "#8B9BB4" }}>→ Emergency: Warm transfer initiating...</div>
                  <div className="text-[12px]" style={{ color: "#8B9BB4" }}>→ On-call coordinator: being connected</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM SECTION ────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "#111827" }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] uppercase tracking-widest text-blue-400 font-medium mb-4">The Crisis No One Is Solving</div>
            <h2 className="text-[40px] md:text-[48px] font-bold tracking-[-0.02em] mb-6" style={{ color: "#F0F4FF" }}>
              2.3 million Ontarians have<br />no family doctor.
            </h2>
            <p className="text-[17px] max-w-[620px] mx-auto leading-[1.7]" style={{ color: "#8B9BB4" }}>
              When something feels wrong, they have three options: call Health 811 and wait, drive
              to the ER and wait, or do nothing. TriageAI is the fourth option — available
              immediately, free, and specifically built for them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                iconColor: "text-orange-400",
                iconBg: "rgba(255,122,0,0.1)",
                title: "Health 811 Wait Times",
                desc: "Official target: under 1 minute. Real world: unpredictable. A patient in pain waits — anxiety growing.",
                stat: "Variable hold times reported by Ontario callers",
              },
              {
                icon: Activity,
                iconColor: "text-red-400",
                iconBg: "rgba(255,59,59,0.1)",
                title: "Unnecessary ER Visits",
                desc: "60% of ER visits in Ontario are non-emergency. Each one costs the system ~$1,000. Each patient waits 4+ hours.",
                stat: "~$600M/year in preventable Ontario ER costs",
              },
              {
                icon: X,
                iconColor: "text-neutral-500",
                iconBg: "rgba(100,116,139,0.1)",
                title: "After-Hours Silence",
                desc: "Most CHC intake lines go to voicemail at 5pm. Patients with evening symptoms have nowhere to turn until morning.",
                stat: "0 hours of AI triage available today at most CHCs",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="rounded-xl p-8 border border-[#1F2D40] hover:border-blue-500/30 hover:-translate-y-0.5 transition-all"
                style={{ background: "#0A0F1E" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: card.iconBg }}
                >
                  <card.icon className={cn("w-5 h-5", card.iconColor)} />
                </div>
                <h3 className="text-[16px] font-semibold text-white mb-3">{card.title}</h3>
                <p className="text-[14px] leading-relaxed mb-4" style={{ color: "#8B9BB4" }}>{card.desc}</p>
                <div className="text-[12px] font-medium" style={{ color: "#4A5568" }}>{card.stat}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] uppercase tracking-widest text-blue-400 font-medium mb-4">How It Works</div>
            <h2 className="text-[40px] md:text-[48px] font-bold tracking-[-0.02em]" style={{ color: "#F0F4FF" }}>
              Three minutes from symptom<br />to care direction.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Step timeline */}
            <div className="space-y-8">
              {[
                {
                  num: "01", icon: PhoneCall,
                  title: "Patient Calls One Number",
                  desc: "No app download. No account. No waiting room. Just dial the TriageAI number on your clinic's after-hours message.",
                },
                {
                  num: "02", icon: Activity,
                  title: "AI Greets in Under 3 Seconds",
                  desc: "TriageAI answers immediately. PIPEDA consent disclosure is the first thing the caller hears.",
                },
                {
                  num: "03", icon: BarChart3,
                  title: "5 Structured CTAS Questions",
                  desc: "Chief complaint, severity (1–10), onset duration, age, relevant history. Consistent every time.",
                },
                {
                  num: "04", icon: CheckCircle2,
                  title: "CTAS Classification (L1–L5)",
                  desc: "Every call is classified against the Canadian Triage and Acuity Scale — the same standard used in every Ontario ER.",
                },
                {
                  num: "05", icon: ArrowRight,
                  title: "Precise Routing Decision",
                  desc: "Caller receives a specific instruction: 'Call 911 now' / 'ER in 30 min' / 'Walk-in today' / 'Rest at home'.",
                },
                {
                  num: "06", icon: PhoneCall,
                  title: "Emergency Escalation (L1/L2)",
                  desc: "For CTAS Level 1–2, TriageAI bridges the caller to your on-call coordinator. A human joins within 10 seconds.",
                },
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border"
                    style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.3)", color: "#3b82f6" }}
                  >
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-white mb-1">{step.title}</h3>
                    <p className="text-[13px] leading-relaxed" style={{ color: "#8B9BB4" }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Sample call result card */}
            <div className="sticky top-24 rounded-2xl p-6" style={{ background: "#111827", border: "1px solid #1F2D40" }}>
              <div className="text-[10px] uppercase tracking-widest mb-4" style={{ color: "#4A5568" }}>Sample Call Result</div>
              <div className="space-y-0">
                {[
                  { label: "Status",        value: "CALL COMPLETE",         green: true },
                  { label: "Duration",      value: "2:47" },
                  { label: "CTAS Level",    value: "4 — Less Urgent" },
                  { label: "Routing",       value: "Walk-in Clinic Today" },
                  { label: "Escalated",     value: "No" },
                  { label: "Session logged", value: "✓ Zero PII stored" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-[#1F2D40] last:border-0">
                    <span className="text-[13px]" style={{ color: "#8B9BB4" }}>{row.label}</span>
                    <span className={cn("text-[13px] font-medium font-mono", row.green ? "text-emerald-400" : "text-white")}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <a
                  href={DEMO_TEL}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-blue-600 text-white text-[14px] font-medium hover:bg-blue-500 transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  Try it now: {DEMO_NUM}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTAS EXPLAINER ─────────────────────────────────────────────────── */}
      <section id="for-clinics" className="py-24 px-6" style={{ background: "#111827" }}>
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] uppercase tracking-widest text-blue-400 font-medium mb-4">Clinical Standard</div>
            <h2 className="text-[40px] md:text-[48px] font-bold tracking-[-0.02em] mb-4" style={{ color: "#F0F4FF" }}>
              Built on the Canadian Triage<br />and Acuity Scale.
            </h2>
            <p className="text-[17px] max-w-[600px] mx-auto leading-[1.7]" style={{ color: "#8B9BB4" }}>
              CTAS is the classification system used in every emergency department in Canada.
              TriageAI applies the same standard to every call — producing structured, consistent,
              auditable triage decisions.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#1F2D40]">
            {[
              { level: 1, name: "Resuscitation", routing: "Call 911 immediately",   pct: "~2%",  color: "#FF3B3B", bg: "rgba(255,59,59,0.05)"  },
              { level: 2, name: "Emergent",      routing: "ER within 15 minutes",   pct: "~8%",  color: "#FF7A00", bg: "rgba(255,122,0,0.05)" },
              { level: 3, name: "Urgent",        routing: "ER within 30 minutes",   pct: "~25%", color: "#F5C518", bg: "rgba(245,197,24,0.05)" },
              { level: 4, name: "Less Urgent",   routing: "Walk-in clinic today",   pct: "~35%", color: "#3B82F6", bg: "rgba(59,130,246,0.05)" },
              { level: 5, name: "Non-Urgent",    routing: "Home care / monitor",    pct: "~30%", color: "#10B981", bg: "rgba(16,185,129,0.05)" },
            ].map((row) => (
              <div
                key={row.level}
                className="flex items-center gap-4 px-6 py-4 border-b border-[#1F2D40] last:border-0"
                style={{ background: row.bg }}
              >
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold border"
                  style={{ background: `${row.color}18`, borderColor: `${row.color}40`, color: row.color }}
                >
                  L{row.level}
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                  <span className="text-[14px] font-semibold text-white">{row.name}</span>
                  <span className="text-[13px]" style={{ color: "#8B9BB4" }}>{row.routing}</span>
                  <span className="text-[12px] font-mono sm:text-right" style={{ color: "#4A5568" }}>{row.pct} of calls</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPLIANCE ─────────────────────────────────────────────────────── */}
      <section id="compliance" className="py-24 px-6" style={{ background: "#0D1219" }}>
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] uppercase tracking-widest text-blue-400 font-medium mb-4">Privacy Architecture</div>
            <h2 className="text-[40px] md:text-[48px] font-bold tracking-[-0.02em] mb-4" style={{ color: "#F0F4FF" }}>
              Zero patient data stored.<br />By design, not by policy.
            </h2>
            <p className="text-[17px] max-w-[600px] mx-auto leading-[1.7]" style={{ color: "#8B9BB4" }}>
              TriageAI doesn't promise PHIPA compliance — it's structurally impossible to breach.
              No voice audio recorded. No transcript stored. Our database has no column that
              could hold a caller's name, phone number, or health statement.{" "}
              <a href="https://github.com/triageai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                Read the code.
              </a>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {[
              {
                icon: Lock,
                title: "PHIPA Compliant",
                desc: "Ontario's health privacy standard. No personal health information ever stored.",
              },
              {
                icon: Globe,
                title: "Canadian Data Residency",
                desc: "All data stored on AWS ca-central-1 (Canada). Never leaves Canadian jurisdiction.",
              },
              {
                icon: Code2,
                title: "Open Source Architecture",
                desc: "The full codebase is public on GitHub. Any IT team can audit exactly what we store — and verify what we don't.",
              },
              {
                icon: ShieldCheck,
                title: "PIPEDA Consent Built-In",
                desc: "Every call begins with a spoken consent disclosure as the first words the caller hears.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="rounded-xl p-6 border border-[#1F2D40] hover:border-blue-500/30 transition-all"
                style={{ background: "#111827" }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 border"
                  style={{ background: "rgba(59,130,246,0.12)", borderColor: "rgba(59,130,246,0.25)" }}
                >
                  <card.icon className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "#8B9BB4" }}>{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="https://github.com/triageai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 text-[14px] font-medium hover:text-blue-300 transition-colors"
            >
              View Privacy Architecture on GitHub <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] uppercase tracking-widest text-blue-400 font-medium mb-4">Pricing</div>
            <h2 className="text-[40px] md:text-[48px] font-bold tracking-[-0.02em] mb-4" style={{ color: "#F0F4FF" }}>
              Start free. Stay affordable.
            </h2>
            <p className="text-[17px]" style={{ color: "#8B9BB4" }}>
              TriageAI is free for callers — always. Clinics pay for the managed service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Pilot */}
            <div className="rounded-xl p-8 border border-[#1F2D40]" style={{ background: "#111827" }}>
              <div className="text-[13px] font-semibold text-white mb-1">Pilot</div>
              <div className="text-[40px] font-bold text-white leading-none mb-1">$0</div>
              <div className="text-[13px] mb-6" style={{ color: "#8B9BB4" }}>60-day free trial</div>
              <div className="space-y-2.5 mb-8">
                {["100 triage calls", "CTAS classification", "Admin dashboard", "Emergency escalation", "PHIPA architecture"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[13px] text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> {f}
                  </div>
                ))}
                {["White-label number", "CSV export"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[13px]" style={{ color: "#4A5568" }}>
                    <span className="w-3.5 flex-shrink-0 text-center">–</span> {f}
                  </div>
                ))}
              </div>
              <a
                href={PILOT_EMAIL}
                className="block w-full text-center py-3 rounded-lg border border-blue-500/60 text-blue-400 text-[14px] font-medium hover:bg-blue-500/10 transition-colors"
              >
                Request Pilot
              </a>
              <p className="text-[11px] text-center mt-2" style={{ color: "#4A5568" }}>No credit card. No commitment.</p>
            </div>

            {/* Clinic — highlighted */}
            <div
              className="rounded-xl p-8 relative border"
              style={{ background: "#111827", borderColor: "#3b82f6", boxShadow: "0 0 40px rgba(59,130,246,0.12)" }}
            >
              <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wide">
                Most Popular
              </div>
              <div className="text-[13px] font-semibold text-white mb-1">Clinic</div>
              <div className="text-[40px] font-bold text-white leading-none mb-1">
                $249<span className="text-[18px] font-normal">/mo</span>
              </div>
              <div className="text-[12px] mb-6" style={{ color: "#8B9BB4" }}>or $199/mo billed annually — save 20%</div>
              <div className="space-y-2.5 mb-8">
                {[
                  "200 calls/month included",
                  "$1.75/call over limit",
                  "Full CTAS dashboard",
                  "CSV export",
                  "Emergency escalation",
                  "PIPEDA/PHIPA compliance docs",
                  "Email support",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[13px] text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> {f}
                  </div>
                ))}
              </div>
              <a
                href={PILOT_EMAIL}
                className="block w-full text-center py-3 rounded-lg bg-blue-600 text-white text-[14px] font-medium hover:bg-blue-500 transition-colors"
              >
                Start Free Pilot
              </a>
              <p className="text-[11px] text-center mt-2" style={{ color: "#4A5568" }}>60-day free trial included</p>
            </div>

            {/* CHC Growth */}
            <div className="rounded-xl p-8 border border-[#1F2D40]" style={{ background: "#111827" }}>
              <div className="text-[13px] font-semibold text-white mb-1">CHC Growth</div>
              <div className="text-[40px] font-bold text-white leading-none mb-1">
                $599<span className="text-[18px] font-normal">/mo</span>
              </div>
              <div className="text-[13px] mb-6" style={{ color: "#8B9BB4" }}>or $479/mo billed annually</div>
              <div className="space-y-2.5 mb-8">
                {[
                  "600 calls/month included",
                  "Up to 3 clinic phone lines",
                  "White-label (your clinic name)",
                  "Custom clinic phone number",
                  "Weekly automated reports",
                  "Priority support",
                  "Quarterly clinical review call",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[13px] text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> {f}
                  </div>
                ))}
              </div>
              <a
                href="mailto:hello@triageai.ca"
                className="block w-full text-center py-3 rounded-lg border border-[#1F2D40] text-white text-[14px] font-medium hover:border-blue-500/50 transition-colors"
              >
                Talk to Us
              </a>
            </div>
          </div>

          {/* ROI callout */}
          <div
            className="mt-8 rounded-xl px-8 py-6 border border-[#1F2D40] text-center"
            style={{ background: "#111827" }}
          >
            <p className="text-[15px] italic" style={{ color: "#8B9BB4" }}>
              "At $249/month, TriageAI costs less than one after-hours nursing shift — and works every night, every weekend, forever."
            </p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0D1B2E 0%, #0A0F1E 100%)" }}>
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(#8B9BB4 1px, transparent 1px), linear-gradient(90deg, #8B9BB4 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative z-10 max-w-[680px] mx-auto text-center">
          <div className="text-[11px] uppercase tracking-widest text-blue-400 font-medium mb-6">Ready to Launch?</div>
          <h2 className="text-[44px] md:text-[52px] font-bold tracking-[-0.02em] mb-6" style={{ color: "#F0F4FF" }}>
            Your clinic's AI triage line<br />can be live tomorrow.
          </h2>
          <p className="text-[18px] leading-[1.7] mb-10" style={{ color: "#8B9BB4" }}>
            60-day pilot. Zero cost. No integration required.<br />
            Just a phone number and 30 minutes of setup.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href={DEMO_TEL}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-lg text-[16px] font-semibold text-white"
              style={{ background: "linear-gradient(90deg, #3b82f6, #2563eb)" }}
            >
              <PhoneCall className="w-5 h-5" />
              Call the Demo: {DEMO_NUM}
            </a>
            <a
              href={PILOT_EMAIL}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg text-[15px] font-medium text-blue-400 border border-blue-500/50 hover:bg-blue-500/10 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              Request Your Free Pilot
            </a>
          </div>

          <p className="text-[14px]" style={{ color: "#4A5568" }}>
            Or email{" "}
            <a href="mailto:hello@triageai.ca" className="text-blue-400 hover:text-blue-300 transition-colors">
              hello@triageai.ca
            </a>{" "}
            — we respond within 24 hours
          </p>

          <div className="flex flex-wrap justify-center gap-6 mt-10 text-[12px]" style={{ color: "#4A5568" }}>
            {["🔒 PHIPA Compliant", "🇨🇦 Built in Canada", "📂 Open Source", "⚡ Live in 24 Hours"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#1F2D40] px-6 py-16" style={{ background: "#080D18" }}>
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LogoWave />
              <span className="text-[16px] font-semibold text-white">TriageAI</span>
            </div>
            <p className="text-[13px] leading-relaxed mb-4" style={{ color: "#8B9BB4" }}>
              AI-powered medical triage for Ontario Community Health Centres.
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: "#4A5568" }}>
              TriageAI is a triage routing service only. It is not a substitute for medical advice,
              diagnosis, or treatment. For emergencies, call 911.
            </p>
          </div>

          {/* Product */}
          <div>
            <div className="text-[11px] uppercase tracking-widest mb-4" style={{ color: "#4A5568" }}>Product</div>
            <div className="space-y-2.5">
              {[
                { label: "How It Works",        action: () => scrollTo("how-it-works") },
                { label: "For Clinics",          action: () => scrollTo("for-clinics") },
                { label: "Pricing",              action: () => scrollTo("pricing") },
              ].map((item) => (
                <div key={item.label}>
                  <button
                    onClick={item.action}
                    className="text-[13px] hover:text-white transition-colors"
                    style={{ color: "#8B9BB4" }}
                  >
                    {item.label}
                  </button>
                </div>
              ))}
              <div>
                <a
                  href="https://github.com/triageai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] hover:text-white transition-colors"
                  style={{ color: "#8B9BB4" }}
                >
                  Open Source (GitHub)
                </a>
              </div>
            </div>
          </div>

          {/* Trust & Legal */}
          <div>
            <div className="text-[11px] uppercase tracking-widest mb-4" style={{ color: "#4A5568" }}>Trust & Legal</div>
            <div className="space-y-2.5">
              {[
                { label: "Privacy Architecture", to: "/privacy" },
                { label: "PHIPA Compliance",     to: "/privacy" },
                { label: "Terms of Service",      to: "/privacy" },
              ].map((item) => (
                <div key={item.label}>
                  <Link to={item.to} className="text-[13px] hover:text-white transition-colors" style={{ color: "#8B9BB4" }}>
                    {item.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="text-[11px] uppercase tracking-widest mb-4" style={{ color: "#4A5568" }}>Contact</div>
            <div className="space-y-2.5 mb-6">
              <a href="mailto:hello@triageai.ca" className="block text-[13px] text-blue-400 hover:text-blue-300 transition-colors">
                hello@triageai.ca
              </a>
              <a href={PILOT_EMAIL} className="block text-[13px] text-blue-400 hover:text-blue-300 transition-colors">
                Book a Demo →
              </a>
            </div>
            <p className="text-[12px] text-red-400 font-medium">Emergency? Call 911.</p>
            <p className="text-[12px] mt-1" style={{ color: "#4A5568" }}>Non-urgent triage: call Health 811.</p>
          </div>
        </div>

        <div
          className="max-w-[1100px] mx-auto mt-12 pt-6 border-t border-[#1F2D40] flex flex-col sm:flex-row justify-between gap-2 text-[12px]"
          style={{ color: "#4A5568" }}
        >
          <span>© 2026 TriageAI. Built in Toronto, Ontario.</span>
          <span>PHIPA · PIPEDA · AWS ca-central-1</span>
        </div>
      </footer>
    </div>
  )
}
