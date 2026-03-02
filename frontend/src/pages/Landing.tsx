import { PhoneCall, ShieldCheck, CheckCircle2, Activity, Zap } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "../lib/utils"

export function Landing() {
  const scrollToDemo = () => {
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-neutral-900 selection:bg-primary-500 selection:text-neutral-950 font-sans">
      {/* Sticky Nav */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 z-50 transition-colors">
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="text-[18px] font-semibold text-white tracking-tight">
            TriageAI
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <button className="text-[13px] text-neutral-400 hover:text-neutral-100 transition-colors">How It Works</button>
            <button onClick={scrollToDemo} className="text-[13px] text-neutral-400 hover:text-neutral-100 transition-colors">Demo</button>
            <button className="text-[13px] text-neutral-400 hover:text-neutral-100 transition-colors">Privacy</button>
          </div>
          <Link 
            to="/login"
            className="border border-primary-500 rounded-sm text-primary-500 text-[13px] font-medium px-4 py-2 hover:bg-primary-500/10 transition-colors"
          >
            Clinic Login →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center pt-24 pb-16 px-6">
        {/* Radial Green Glow */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.12) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 max-w-[800px] w-full flex flex-col items-center text-center animate-fade-in">
          <div className="inline-flex items-center bg-primary-900 text-primary-400 border border-primary-500/30 rounded-full px-3 py-1 text-[11px] font-medium mb-6">
            For Ontario
          </div>
          
          <h1 className="text-[40px] md:text-[56px] font-extrabold leading-[1.05] tracking-[-0.03em] mb-6">
            <span className="text-neutral-50 block">Answer every medical call.</span>
            <span className="text-primary-500 block">Instantly.</span>
          </h1>

          <p className="text-[16px] md:text-[18px] text-neutral-400 max-w-[560px] leading-[1.6] mb-10">
            2.3 million Ontarians have no family doctor. Health 811 has a 40-minute hold time. TriageAI answers in 0 seconds — 24/7, free, in any language.
          </p>

          <a 
            href="tel:+16475550199"
            className="flex items-center gap-2 bg-primary-500 text-neutral-950 rounded-md px-7 py-3.5 text-[15px] font-semibold hover:bg-primary-400 hover:-translate-y-[1px] hover:shadow-md transition-all active:bg-primary-600 active:translate-y-0"
          >
            <PhoneCall className="w-[18px] h-[18px]" />
            Call +1 (647) 555-0199 — Free demo
          </a>
          
          <button onClick={scrollToDemo} className="mt-4 text-[13px] text-neutral-400 hover:text-neutral-200 transition-colors">
            ↓ See how it works
          </button>

          <div className="flex flex-wrap justify-center gap-3 md:gap-6 mt-12">
            {[
              { icon: ShieldCheck, text: "PIPEDA Compliant" },
              { icon: Activity, text: "CTAS Standard" },
              { icon: CheckCircle2, text: "Ontario-built" },
              { icon: Zap, text: "Open Source" }
            ].map((Badge, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-600 text-neutral-500 text-[11px] font-medium">
                <Badge.icon className="w-3.5 h-3.5" />
                {Badge.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="max-w-[1000px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: "2.3M+", label: "Ontarians without a family doctor", color: "text-neutral-50" },
            { value: "40 min", label: "avg wait on Health 811", color: "text-[#f59e0b]" },
            { value: "$800+", label: "per avoidable ER visit", color: "text-[#ef4444]" },
          ].map((stat, i) => (
            <div key={i} className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 md:p-8 text-center">
              <div className={cn("text-[32px] md:text-[36px] font-extrabold mb-2", stat.color)}>{stat.value}</div>
              <div className="text-[13px] text-neutral-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-neutral-950 py-24 px-6 mt-12">
        <div className="max-w-[1000px] mx-auto text-center">
          <h2 className="text-[24px] font-bold text-neutral-50 mb-16">How TriageAI Works</h2>
          <div className="flex flex-col md:flex-row items-start justify-center gap-12 md:gap-0 relative">
            
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-6 left-[15%] right-[15%] h-[1px] bg-neutral-800" />

            {[
              { num: "1", title: "You Call", desc: "Any phone, any time. No app needed.", icon: PhoneCall },
              { num: "2", title: "AI Triages", desc: "5 CTAS questions in under 3 minutes.", icon: Activity },
              { num: "3", title: "Routed Right", desc: "Directed to care or escalated to human.", icon: CheckCircle2 },
            ].map((step, i) => (
              <div key={i} className="flex-1 flex flex-col items-center relative z-10 w-full">
                <div className="w-12 h-12 rounded-full bg-primary-500 text-neutral-950 flex items-center justify-center text-[18px] font-bold mb-6">
                  {step.num}
                </div>
                <h3 className="text-[20px] font-semibold text-neutral-100 mb-3">{step.title}</h3>
                <p className="text-[15px] text-neutral-400 max-w-[200px] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Block */}
      <section id="demo" className="py-24 px-6">
        <div className="max-w-[720px] mx-auto rounded-2xl p-10 md:p-16 text-center border border-primary-500/20 shadow-2xl shadow-primary-900/10"
             style={{ background: 'linear-gradient(135deg, #1e293b 0%, rgba(20,83,45,0.3) 100%)' }}>
          <h2 className="text-[24px] font-bold text-neutral-50 mb-4">Try it right now</h2>
          <p className="text-[18px] text-neutral-400 mb-8">Call our Ontario demo line — it takes 3 minutes.</p>
          
          <a href="tel:+16475550199" className="inline-block text-[32px] md:text-[40px] font-mono font-bold text-primary-500 hover:text-primary-400 hover:scale-105 transition-all mb-4">
            +1 (647) 555-0199
          </a>
          <p className="text-[11px] text-neutral-500">Demo line — no personal data stored</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-12 px-6 text-center text-neutral-500 text-[13px]">
        <div className="flex justify-center gap-6 mb-6">
          <button className="hover:text-neutral-300">Privacy Policy</button>
          <button className="hover:text-neutral-300">GitHub</button>
          <button className="hover:text-neutral-300">Contact</button>
        </div>
        <p>Built in Toronto 🇨🇦 — Not a medical device</p>
      </footer>
    </div>
  )
}
