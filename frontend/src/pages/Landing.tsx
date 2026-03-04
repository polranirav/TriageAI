import { PhoneCall, ShieldCheck, ArrowRight, Github, Clock, AlertTriangle, CheckCircle, Activity } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "../lib/utils"
import { useEffect, useState } from "react"

const DEMO_TEL = "tel:+12262128564"
const DEMO_NUM = "+1 (226) 212-8564"
const PILOT_EMAIL = "mailto:pilot@triageai.ca?subject=TriageAI%20Pilot%20Request"

export function Landing() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-[#F0F4FF] font-sans selection:bg-[#3B82F6] selection:text-white">

      {/* 1. Navigation Bar */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-300",
        scrolled ? "bg-[#0A0F1E]/80 backdrop-blur-[20px] border-b border-[#1F2D40]" : "bg-transparent"
      )}>
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-end gap-0.5 h-6">
              <div className="w-1 bg-[#3B82F6] h-3 animate-[pulse_1s_ease-in-out_infinite]" />
              <div className="w-1 bg-[#3B82F6] h-6 animate-[pulse_1.2s_ease-in-out_infinite]" />
              <div className="w-1 bg-[#3B82F6] h-4 animate-[pulse_0.8s_ease-in-out_infinite]" />
              <div className="w-1 bg-[#3B82F6] h-5 animate-[pulse_1.5s_ease-in-out_infinite]" />
            </div>
            <span className="text-[20px] font-semibold text-[#F0F4FF] tracking-tight">TriageAI</span>
            <span className="text-[11px] uppercase text-[#10B981] border border-[#10B981] rounded px-1.5 py-0.5 font-medium ml-2">Ontario</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[14px] text-[#8B9BB4] font-medium">
            <a href="#how-it-works" className="hover:text-[#F0F4FF] transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-[#F0F4FF] transition-colors">For Clinics</a>
            <a href="#pricing" className="hover:text-[#F0F4FF] transition-colors">Pricing</a>
            <a href="#compliance" className="hover:text-[#F0F4FF] transition-colors">Compliance</a>
            <a href="https://github.com" className="flex items-center gap-1.5 hover:text-[#F0F4FF] transition-colors"><Github className="w-4 h-4" /> Open Source</a>
          </div>

          <div className="flex items-center gap-4">
            <a href={PILOT_EMAIL} className="hidden md:block text-[#3B82F6] border border-[#3B82F6] px-6 py-2.5 rounded-md text-[14px] font-medium hover:bg-[#3B82F6]/10 transition-colors">
              Request Pilot
            </a>
            <Link to="/login" className="bg-[#3B82F6] text-white px-6 py-2.5 rounded-md text-[14px] font-medium hover:bg-[#2563EB] transition-colors">
              Clinic Login
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section
        className="relative min-h-screen pt-24 pb-16 flex items-center overflow-hidden"
        style={{ backgroundImage: "linear-gradient(135deg, #0A0F1E 0%, #0D1B2E 50%, #0A1628 100%)" }}
      >
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(#1F2D40_1px,transparent_1px),linear-gradient(90deg,#1F2D40_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="max-w-[1280px] mx-auto px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FF3B3B]/30 bg-[#FF3B3B]/10 text-[#FF3B3B] text-[12px] uppercase tracking-wider font-semibold mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3B3B] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF3B3B]" />
              </span>
              LIVE — 847 CALLS TRIAGED THIS WEEK
            </div>

            <h1 className="text-[56px] lg:text-[72px] font-[800] leading-[1.1] tracking-[-2px] text-[#F0F4FF] mb-6">
              Ontario patients call.<br />
              TriageAI answers.<br />
              <span className="text-[#3B82F6]">Every time.</span>
            </h1>

            <p className="text-[20px] text-[#8B9BB4] leading-[1.7] max-w-[520px] mb-12">
              A 24/7 AI voice triage service for Ontario Community Health Centres.
              Patients call one number — TriageAI triages their symptoms, classifies
              by CTAS level, and routes them to the right care in under 3 minutes.
              Free for callers. Zero wait time. Zero missed escalations.
            </p>

            <div className="flex items-center divide-x divide-[#1F2D40] border-y border-[#1F2D40] py-4 mb-10 w-full max-w-[520px]">
              <div className="flex-1 px-4 first:pl-0">
                <div className="text-[36px] font-bold text-[#F0F4FF]">&lt; 3 sec</div>
                <div className="text-[13px] text-[#8B9BB4] uppercase tracking-wide font-medium">Answer Time</div>
              </div>
              <div className="flex-1 px-4">
                <div className="text-[36px] font-bold text-[#F0F4FF]">100%</div>
                <div className="text-[13px] text-[#8B9BB4] uppercase tracking-wide font-medium">Escalation Accuracy</div>
              </div>
              <div className="flex-1 px-4">
                <div className="text-[36px] font-bold text-[#F0F4FF]">$0</div>
                <div className="text-[13px] text-[#8B9BB4] uppercase tracking-wide font-medium">For Callers Always</div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-4">
              <a
                href={DEMO_TEL}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 h-[56px] rounded-lg text-[17px] font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(59,130,246,0.4)]"
                style={{ background: "linear-gradient(90deg, #3B82F6, #2563EB)" }}
              >
                <PhoneCall className="w-5 h-5" />
                Call the Live Demo: {DEMO_NUM}
              </a>
              <a href={PILOT_EMAIL} className="inline-flex items-center gap-2 text-[#3B82F6] text-[16px] font-medium hover:text-[#2563EB] transition-colors px-2 py-1">
                Request a Free 60-Day Clinic Pilot <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-8 text-[12px] text-[#4A5568] font-mono uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> PHIPA compliant · Data stays in Canada · Open source · No credit card required
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="bg-[#111827] border border-[#1F2D40] rounded-[16px] p-8 shadow-2xl relative overflow-hidden hover:border-[#3B82F6]/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transition-all duration-500">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1F2D40]">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#10B981] uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" /> LIVE CALL IN PROGRESS
                </div>
                <div className="text-[13px] text-[#8B9BB4] font-mono">2:34 elapsed</div>
              </div>

              <div className="flex items-center justify-center h-24 mb-8">
                <div className="flex items-center gap-1.5 h-full">
                  {[40, 80, 55, 90, 35, 70, 60, 85, 45, 75, 50, 65].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-[#3B82F6] rounded-full animate-pulse"
                      style={{
                        height: `${h}%`,
                        animationDuration: `${0.6 + i * 0.1}s`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-[#1F2D40] pt-6 mb-6">
                <div className="text-[11px] text-[#8B9BB4] uppercase tracking-widest mb-2 font-semibold">AI TRIAGE ASSESSMENT</div>
                <div className="text-[14px] text-[#8B9BB4] mb-1">Chief Complaint:</div>
                <div className="text-[16px] text-[#F0F4FF] font-medium mb-6">"Chest tightness, left arm pain"</div>

                <div className="border border-[#FF7A00]/40 bg-[#FF7A00]/10 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-[#FF7A00] font-bold text-[15px] mb-1">
                    <AlertTriangle className="w-4 h-4" /> CTAS LEVEL 2
                  </div>
                  <div className="text-[14px] text-[#F0F4FF]">Urgent — ER Within 30 Min</div>
                  <div className="text-[13px] text-[#FF7A00] mt-1 font-medium">Escalating to on-call now</div>
                </div>

                <div className="flex items-center justify-between text-[13px] font-mono text-[#8B9BB4] mb-2">
                  <span>[████░░░░░░] Question 4 of 5</span>
                  <span>Duration: 2:34</span>
                </div>
              </div>

              <div className="border-t border-[#1F2D40] pt-6">
                <div className="text-[11px] text-[#8B9BB4] uppercase tracking-widest mb-3 font-semibold">ROUTING DECISION</div>
                <div className="space-y-2 font-mono text-[13px] text-[#10B981]">
                  <div>→ Emergency: Warm transfer initiating...</div>
                  <div>→ On-call coordinator: being connected</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Social Proof Bar */}
      <section className="bg-[#0D1219] border-y border-[#1F2D40] py-6 overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 text-[13px] font-medium text-[#8B9BB4] uppercase tracking-wider">
            <span>TRUSTED BY ONTARIO HEALTHCARE PROFESSIONALS</span>
            <div className="hidden md:block w-px h-6 bg-[#1F2D40]" />
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-[#1F2D40]" /> Pilot partner</span>
              <span className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-[#1F2D40]" /> Pilot partner</span>
              <span className="flex items-center gap-2 font-semibold text-[#F0F4FF]">CAN Health Network Innovator</span>
            </div>
          </div>
          <div className="hidden lg:block w-px h-10 bg-[#1F2D40]" />
          <div className="max-w-[320px] text-[13px] text-[#8B9BB4] italic">
            <div className="text-[#F5C518] text-[14px] not-italic tracking-widest mb-1">★★★★★</div>
            "It answered before I even expected it to. And it told me exactly where to go."<br />
            <span className="not-italic text-[#4A5568] mt-1 block">— Ontario resident, pilot caller</span>
          </div>
        </div>
      </section>

      {/* 4. The Problem Section */}
      <section className="bg-[#111827] py-32 px-6">
        <div className="max-w-[1280px] mx-auto text-center">
          <div className="text-[13px] font-semibold text-[#3B82F6] uppercase tracking-[0.1em] mb-4">THE CRISIS NO ONE IS SOLVING</div>
          <h2 className="text-[48px] font-bold text-[#F0F4FF] leading-[1.1] tracking-[-1px] mb-6">
            2.3 million Ontarians have<br />no family doctor.
          </h2>
          <p className="text-[20px] text-[#8B9BB4] leading-[1.6] max-w-[640px] mx-auto mb-16">
            When something feels wrong, they have three options: call Health 811 and wait, drive to the ER and wait, or do nothing. TriageAI is the fourth option — available immediately, free, and specifically built for them.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-[#0A0F1E] border border-[#1F2D40] rounded-[12px] p-8 hover:border-[#3B82F6]/30 hover:-translate-y-1 transition-all">
              <Clock className="w-8 h-8 text-[#FF7A00] mb-6" />
              <h3 className="text-[24px] font-semibold text-[#F0F4FF] mb-4">Health 811 Wait Times</h3>
              <p className="text-[16px] text-[#8B9BB4] leading-relaxed mb-8">
                Official target: under 1 minute. Real world: unpredictable. A patient in pain waits — anxiety growing.
              </p>
              <div className="text-[13px] font-medium text-[#FF7A00] uppercase tracking-wide">Variable hold times reported</div>
            </div>

            <div className="bg-[#0A0F1E] border border-[#1F2D40] rounded-[12px] p-8 hover:border-[#3B82F6]/30 hover:-translate-y-1 transition-all">
              <AlertTriangle className="w-8 h-8 text-[#FF3B3B] mb-6" />
              <h3 className="text-[24px] font-semibold text-[#F0F4FF] mb-4">Unnecessary ER Visits</h3>
              <p className="text-[16px] text-[#8B9BB4] leading-relaxed mb-8">
                60% of ER visits in Ontario are non-emergency. Each one costs the system ~$1,000. Each patient waits 4+ hours to be told to go home.
              </p>
              <div className="text-[13px] font-medium text-[#FF3B3B] uppercase tracking-wide">~$600M/year in preventable costs</div>
            </div>

            <div className="bg-[#0A0F1E] border border-[#1F2D40] rounded-[12px] p-8 hover:border-[#3B82F6]/30 hover:-translate-y-1 transition-all">
              <PhoneCall className="w-8 h-8 text-[#4A5568] mb-6" />
              <h3 className="text-[24px] font-semibold text-[#F0F4FF] mb-4">After-Hours Silence</h3>
              <p className="text-[16px] text-[#8B9BB4] leading-relaxed mb-8">
                Most CHC intake lines go to voicemail at 5pm. Patients with evening symptoms have nowhere to turn until morning.
              </p>
              <div className="text-[13px] font-medium text-[#8B9BB4] uppercase tracking-wide">0 hours AI-triage at most CHCs</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section id="how-it-works" className="py-32 px-6 bg-[#0A0F1E]">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-20">
            <div className="text-[13px] font-semibold text-[#3B82F6] uppercase tracking-[0.1em] mb-4">THE PROCESS</div>
            <h2 className="text-[48px] font-bold text-[#F0F4FF] leading-[1.1] tracking-[-1px] mb-6">
              From first ring to routed care<br />in under 3 minutes
            </h2>
            <p className="text-[20px] text-[#8B9BB4] max-w-[560px] mx-auto">
              A structured 5-question CTAS triage conducted entirely by voice. No app, no wait, no fee.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Patient Calls", desc: "The patient dials the clinic's dedicated TriageAI number. TriageAI answers in under 3 seconds — any time, any day.", color: "#3B82F6" },
              { step: "02", title: "Consent & Greeting", desc: "TriageAI introduces itself as an AI triage system and obtains verbal consent per PIPEDA guidelines before proceeding.", color: "#3B82F6" },
              { step: "03", title: "5-Question CTAS Assessment", desc: "The AI asks five targeted clinical questions about chief complaint, onset, severity, associated symptoms, and medical history.", color: "#3B82F6" },
              { step: "04", title: "CTAS Classification", desc: "Responses are analyzed and assigned a Canadian Triage and Acuity Scale level (L1–L5) in real time.", color: "#10B981" },
              { step: "05", title: "Intelligent Routing", desc: "L1–L2: warm transfer to on-call nurse. L3: urgent care guidance. L4–L5: walk-in or home-care instructions.", color: "#10B981" },
              { step: "06", title: "Session Logged", desc: "De-identified metadata (CTAS level, duration, routing action) is written to the clinic's dashboard. Zero PII stored.", color: "#10B981" },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="bg-[#111827] border border-[#1F2D40] rounded-[12px] p-8 hover:border-[#3B82F6]/30 hover:-translate-y-1 transition-all">
                <div className="text-[13px] font-mono font-bold mb-4" style={{ color }}>{step}</div>
                <h3 className="text-[20px] font-semibold text-[#F0F4FF] mb-3">{title}</h3>
                <p className="text-[15px] text-[#8B9BB4] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTAS Spectrum */}
      <section className="py-32 px-6 bg-[#111827]">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <div className="text-[13px] font-semibold text-[#3B82F6] uppercase tracking-[0.1em] mb-4">CLINICAL STANDARD</div>
            <h2 className="text-[48px] font-bold text-[#F0F4FF] leading-[1.1] tracking-[-1px] mb-6">
              Built on the Canadian Triage<br />and Acuity Scale
            </h2>
            <p className="text-[20px] text-[#8B9BB4] max-w-[560px] mx-auto">
              CTAS is the national standard used in every Canadian ER. TriageAI applies the same framework over voice.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#1F2D40]">
                  <th className="text-left py-4 px-6 text-[13px] font-semibold text-[#8B9BB4] uppercase tracking-wider">Level</th>
                  <th className="text-left py-4 px-6 text-[13px] font-semibold text-[#8B9BB4] uppercase tracking-wider">Classification</th>
                  <th className="text-left py-4 px-6 text-[13px] font-semibold text-[#8B9BB4] uppercase tracking-wider">Examples</th>
                  <th className="text-left py-4 px-6 text-[13px] font-semibold text-[#8B9BB4] uppercase tracking-wider">TriageAI Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { level: "L1", label: "Resuscitation", examples: "Cardiac arrest, anaphylaxis", action: "Immediate 911 escalation + on-call transfer", color: "#FF3B3B", bg: "rgba(255,59,59,0.06)" },
                  { level: "L2", label: "Emergent", examples: "Chest pain, stroke symptoms, severe breathing difficulty", action: "Warm transfer to on-call nurse — ER within 30 min", color: "#FF7A00", bg: "rgba(255,122,0,0.06)" },
                  { level: "L3", label: "Urgent", examples: "High fever, fracture, moderate pain", action: "Urgent care or ER — attend within 2 hours", color: "#F0B429", bg: "rgba(240,180,41,0.06)" },
                  { level: "L4", label: "Less Urgent", examples: "Earache, minor lacerations, UTI", action: "Walk-in clinic or next-day appointment", color: "#3B82F6", bg: "rgba(59,130,246,0.06)" },
                  { level: "L5", label: "Non-Urgent", examples: "Prescription refill, minor cold, insomnia", action: "Home care guidance + self-care instructions", color: "#10B981", bg: "rgba(16,185,129,0.06)" },
                ].map(({ level, label, examples, action, color, bg }) => (
                  <tr key={level} className="border-b border-[#1F2D40] hover:bg-[#0A0F1E]/50 transition-colors" style={{ background: bg }}>
                    <td className="py-5 px-6">
                      <span className="inline-flex items-center justify-center w-12 h-8 rounded-md text-[13px] font-bold" style={{ background: `${color}1A`, border: `1px solid ${color}40`, color }}>
                        {level}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-[15px] font-semibold text-[#F0F4FF]">{label}</td>
                    <td className="py-5 px-6 text-[14px] text-[#8B9BB4]">{examples}</td>
                    <td className="py-5 px-6 text-[14px] text-[#F0F4FF] font-medium">{action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. Compliance Section */}
      <section id="compliance" className="py-32 px-6 bg-[#0A0F1E]">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <div className="text-[13px] font-semibold text-[#10B981] uppercase tracking-[0.1em] mb-4">BUILT FOR ONTARIO HEALTHCARE</div>
            <h2 className="text-[48px] font-bold text-[#F0F4FF] leading-[1.1] tracking-[-1px] mb-6">
              Zero PII. Full compliance.<br />Data stays in Canada.
            </h2>
            <p className="text-[20px] text-[#8B9BB4] max-w-[560px] mx-auto">
              TriageAI was designed from day one for PHIPA and PIPEDA compliance — not retrofitted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <ShieldCheck className="w-7 h-7 text-[#10B981]" />, title: "Zero PII Stored", desc: "No phone numbers, names, transcripts, or audio are ever stored. Only de-identified metadata: CTAS level, duration, routing action, and timestamp." },
              { icon: <Activity className="w-7 h-7 text-[#3B82F6]" />, title: "PHIPA & PIPEDA Compliant", desc: "Every session begins with an explicit verbal consent disclosure as required under PHIPA for AI-assisted healthcare interactions in Ontario." },
              { icon: <CheckCircle className="w-7 h-7 text-[#3B82F6]" />, title: "Canadian Infrastructure", desc: "All compute, storage, and data processing runs on AWS ca-central-1 (Montreal). No data crosses Canadian borders." },
              { icon: <ShieldCheck className="w-7 h-7 text-[#F0B429]" />, title: "Twilio Signature Validation", desc: "Every incoming webhook is validated against Twilio's HMAC signature to prevent spoofing and unauthorized call injection." },
              { icon: <Activity className="w-7 h-7 text-[#F0B429]" />, title: "Triage Only — Never Diagnoses", desc: "TriageAI routes callers to appropriate care. It never names diagnoses, recommends medications, or provides medical advice." },
              { icon: <CheckCircle className="w-7 h-7 text-[#10B981]" />, title: "Open Source & Auditable", desc: "The full codebase is public on GitHub. Any clinic, researcher, or regulator can audit every decision the system makes." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-[#111827] border border-[#1F2D40] rounded-[12px] p-8 hover:border-[#3B82F6]/30 transition-all">
                <div className="mb-5">{icon}</div>
                <h3 className="text-[18px] font-semibold text-[#F0F4FF] mb-3">{title}</h3>
                <p className="text-[14px] text-[#8B9BB4] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Pricing */}
      <section id="pricing" className="py-32 px-6 bg-[#111827]">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <div className="text-[13px] font-semibold text-[#3B82F6] uppercase tracking-[0.1em] mb-4">TRANSPARENT PRICING</div>
            <h2 className="text-[48px] font-bold text-[#F0F4FF] leading-[1.1] tracking-[-1px] mb-6">
              One flat monthly fee.<br />No per-call surprises.
            </h2>
            <p className="text-[20px] text-[#8B9BB4] max-w-[480px] mx-auto">
              Priced for community health centre budgets. Always free for callers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1000px] mx-auto">
            {/* Starter */}
            <div className="bg-[#0A0F1E] border border-[#1F2D40] rounded-[16px] p-8 flex flex-col">
              <div className="text-[13px] font-semibold text-[#8B9BB4] uppercase tracking-wider mb-2">Starter</div>
              <div className="text-[48px] font-bold text-[#F0F4FF] leading-none mb-1">$299</div>
              <div className="text-[14px] text-[#8B9BB4] mb-8">/ month CAD</div>
              <ul className="space-y-3 flex-1 mb-8">
                {["Up to 500 calls/month", "1 clinic phone number", "CTAS triage (L1–L5)", "Admin dashboard", "Email support"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[14px] text-[#8B9BB4]">
                    <CheckCircle className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <a href={PILOT_EMAIL} className="w-full text-center border border-[#3B82F6] text-[#3B82F6] px-6 py-3 rounded-lg text-[15px] font-medium hover:bg-[#3B82F6]/10 transition-colors">
                Start Pilot
              </a>
            </div>

            {/* Growth — highlighted */}
            <div className="bg-[#0D1B2E] border-2 border-[#3B82F6] rounded-[16px] p-8 flex flex-col relative shadow-[0_0_40px_rgba(59,130,246,0.2)]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#3B82F6] text-white text-[12px] font-bold uppercase px-4 py-1 rounded-full tracking-wide">Most Popular</div>
              <div className="text-[13px] font-semibold text-[#3B82F6] uppercase tracking-wider mb-2">Growth</div>
              <div className="text-[48px] font-bold text-[#F0F4FF] leading-none mb-1">$599</div>
              <div className="text-[14px] text-[#8B9BB4] mb-8">/ month CAD</div>
              <ul className="space-y-3 flex-1 mb-8">
                {["Up to 2,000 calls/month", "3 clinic phone numbers", "Multilingual (EN + FR)", "Live monitor dashboard", "Priority support + SLA", "Escalation SMS alerts"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[14px] text-[#F0F4FF]">
                    <CheckCircle className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <a href={PILOT_EMAIL} className="w-full text-center bg-[#3B82F6] text-white px-6 py-3 rounded-lg text-[15px] font-medium hover:bg-[#2563EB] transition-colors">
                Start Pilot
              </a>
            </div>

            {/* Enterprise */}
            <div className="bg-[#0A0F1E] border border-[#1F2D40] rounded-[16px] p-8 flex flex-col">
              <div className="text-[13px] font-semibold text-[#8B9BB4] uppercase tracking-wider mb-2">Enterprise</div>
              <div className="text-[48px] font-bold text-[#F0F4FF] leading-none mb-1">Custom</div>
              <div className="text-[14px] text-[#8B9BB4] mb-8">multi-site</div>
              <ul className="space-y-3 flex-1 mb-8">
                {["Unlimited calls", "Unlimited sites", "White-label option", "Custom triage protocols", "Dedicated success manager", "Enterprise SLA + audit log"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[14px] text-[#8B9BB4]">
                    <CheckCircle className="w-4 h-4 text-[#8B9BB4] shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <a href="mailto:enterprise@triageai.ca" className="w-full text-center border border-[#1F2D40] text-[#8B9BB4] px-6 py-3 rounded-lg text-[15px] font-medium hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors">
                Contact Us
              </a>
            </div>
          </div>

          <p className="text-center text-[14px] text-[#4A5568] mt-10">
            All plans include a free 60-day pilot. No credit card required. Cancel any time.
          </p>
        </div>
      </section>

      {/* 9. Final CTA */}
      <section className="py-32 px-6 bg-[#0A0F1E] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(#1F2D40_1px,transparent_1px),linear-gradient(90deg,#1F2D40_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="max-w-[760px] mx-auto text-center relative z-10">
          <div className="text-[13px] font-semibold text-[#3B82F6] uppercase tracking-[0.1em] mb-6">READY TO DEPLOY?</div>
          <h2 className="text-[56px] font-[800] text-[#F0F4FF] leading-[1.1] tracking-[-2px] mb-6">
            Give your patients a line<br />that always answers.
          </h2>
          <p className="text-[20px] text-[#8B9BB4] mb-12 leading-relaxed">
            Set up in under an hour. We provision the phone number, configure the triage flow, and deploy. Your patients call — TriageAI handles the rest.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={DEMO_TEL}
              className="inline-flex items-center gap-3 px-8 h-[56px] rounded-lg text-[17px] font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(59,130,246,0.4)]"
              style={{ background: "linear-gradient(90deg, #3B82F6, #2563EB)" }}
            >
              <PhoneCall className="w-5 h-5" />
              Try Live Demo: {DEMO_NUM}
            </a>
            <a href={PILOT_EMAIL} className="inline-flex items-center gap-2 border border-[#1F2D40] text-[#F0F4FF] px-8 h-[56px] rounded-lg text-[17px] font-medium hover:border-[#3B82F6] transition-colors">
              Request 60-Day Pilot <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="bg-[#080D18] border-t border-[#1F2D40] py-16 px-6">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="text-[20px] font-bold text-[#F0F4FF] mb-4">TriageAI</div>
            <p className="text-[14px] text-[#8B9BB4] leading-relaxed mb-6">
              AI-powered medical triage for Ontario Community Health Centres.
            </p>
            <div className="flex items-center gap-4 mb-6">
              <a href="https://github.com" className="hover:text-white transition-colors">
                <Github className="w-5 h-5 text-[#8B9BB4]" />
              </a>
            </div>
            <p className="text-[12px] text-[#4A5568] leading-relaxed">
              TriageAI is a triage routing service only. It is not a substitute for medical advice, diagnosis, or treatment. For emergencies, call 911.
            </p>
          </div>

          <div>
            <div className="text-[14px] font-semibold text-[#F0F4FF] mb-6">Product</div>
            <ul className="space-y-4 text-[14px] text-[#8B9BB4]">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">For Clinics</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="https://github.com" className="hover:text-white transition-colors">Open Source</a></li>
            </ul>
          </div>

          <div>
            <div className="text-[14px] font-semibold text-[#F0F4FF] mb-6">Trust & Legal</div>
            <ul className="space-y-4 text-[14px] text-[#8B9BB4]">
              <li><a href="#compliance" className="hover:text-white transition-colors">Privacy Architecture</a></li>
              <li><a href="#compliance" className="hover:text-white transition-colors">PHIPA Compliance</a></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
            </ul>
          </div>

          <div>
            <div className="text-[14px] font-semibold text-[#F0F4FF] mb-6">Contact</div>
            <ul className="space-y-4 text-[14px] text-[#8B9BB4]">
              <li><a href="mailto:hello@triageai.ca" className="hover:text-white transition-colors">hello@triageai.ca</a></li>
              <li><a href={PILOT_EMAIL} className="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors">Book a Pilot →</a></li>
            </ul>
            <div className="mt-8 pt-6 border-t border-[#1F2D40] space-y-2">
              <p className="text-[13px] font-bold text-[#FF3B3B]">Emergency? Call 911.</p>
              <p className="text-[13px] text-[#8B9BB4]">Non-urgent triage: call Health 811.</p>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto pt-8 border-t border-[#1F2D40] flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-[#4A5568]">
          <div>© 2026 TriageAI. Built in Toronto, Ontario.</div>
          <div>PHIPA · PIPEDA · AWS ca-central-1</div>
        </div>
      </footer>
    </div>
  )
}
