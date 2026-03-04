import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  HelpCircle, Search, PhoneCall, AlertTriangle, BarChart3, ShieldCheck,
  Settings, Rocket, Stethoscope, Lock, FileText, Pin, Play,
  ChevronDown, ChevronRight, Download,
  ExternalLink, Rss
} from "lucide-react"
import { cn } from "../lib/utils"

export function Help() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  // Quick action handlers
  const quickActions = [
    { icon: PhoneCall, color: "#3B82F6", title: "Test My Triage Line", desc: "Dial and verify AI answers correctly", link: "Open Guide", action: () => window.open("tel:+12262128564", "_self") },
    { icon: AlertTriangle, color: "#FF6B00", title: "Escalation Not Working", desc: "Bridge failed or coordinator not reached", link: "Troubleshoot", action: () => navigate("/dashboard/settings") },
    { icon: BarChart3, color: "#10B981", title: "Export My Session Data", desc: "Download CSV or PDF of all triage calls", link: "Go to Reports", action: () => navigate("/dashboard/reports") },
    {
      icon: Lock, color: "#A78BFA", title: "PHIPA & Privacy", desc: "Understand what data we store and why", link: "Read More", action: () => {
        const el = document.getElementById("privacy-section")
        if (el) el.scrollIntoView({ behavior: "smooth" })
      }
    },
    { icon: Settings, color: "#F0B429", title: "Update Emergency Contact", desc: "Change who receives L1/L2 bridge calls", link: "Go to Config", action: () => navigate("/dashboard/settings") },
  ]

  // Filter FAQ items based on search
  const faqItems = [
    {
      q: "What is CTAS and why does TriageAI use it?",
      a: "The Canadian Triage and Acuity Scale (CTAS) is the national standard for emergency triage used in every hospital emergency department in Canada. It classifies patients from Level 1 (immediate resuscitation) to Level 5 (non-urgent).\n\nTriageAI uses CTAS because it is the established clinical benchmark in Ontario. By producing a CTAS level on every call, TriageAI creates a structured, auditable record that is immediately understood by any healthcare professional who reviews it."
    },
    { q: "Can callers be charged for using the triage line?", a: "No. TriageAI is strictly B2B. Clinics pay for the infrastructure, and patients call for free." },
    { q: "What happens if a caller has a real emergency?", a: "If the AI detects Level 1 or Level 2 symptoms, it bridges the call directly to your designated on-call human coordinator." },
    { q: "Is TriageAI PHIPA compliant?", a: "Yes. TriageAI uses a Zero-PII architecture where no identifying health information is ever stored in our database." },
    { q: "How long does a typical triage call take?", a: "The average triage call takes between 2 minutes and 15 seconds to 3 minutes, entirely dependent on how fast the caller answers the 5 required questions." },
    { q: "Can I use my own phone number?", a: "Yes, on the Growth plan, we can port your existing clinic number or provide a localized white-label number." },
  ]

  const filteredFaqs = searchQuery.trim()
    ? faqItems.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()))
    : faqItems

  // Doc categories with navigation actions
  type DocLink = { text: string; action: () => void; isNew?: boolean }
  const docCategories: { title: string; icon: typeof Rocket; color: string; badge?: string; highlight?: boolean; links: DocLink[] }[] = [
    {
      title: "Getting Started", icon: Rocket, color: "#3B82F6", badge: "Start Here",
      links: [
        { text: "How TriageAI Works — 3 min read", action: () => { } },
        { text: "Setting Up Your Clinic's Triage Line", action: () => navigate("/dashboard/settings") },
        { text: "Making Your First Test Call", action: () => window.open("tel:+12262128564", "_self") },
        { text: "Understanding the Admin Dashboard", action: () => navigate("/dashboard") },
        { text: "Onboarding Your Clinic Staff", action: () => { }, isNew: true },
      ],
    },
    {
      title: "Triage & CTAS", icon: Stethoscope, color: "#10B981",
      links: [
        { text: "What is CTAS? The Canadian Triage Scale Explained", action: () => { } },
        { text: "How TriageAI Classifies Calls (L1–L5)", action: () => { } },
        { text: "The 5 Triage Questions — What the AI Asks", action: () => { } },
        { text: "Understanding Routing Decisions", action: () => { } },
        { text: "When Does the AI Escalate? (L1/L2 Logic)", action: () => navigate("/dashboard/escalations") },
        { text: "Clinical Accuracy & Limitations", action: () => { } },
      ],
    },
    {
      title: "Emergency Escalation", icon: AlertTriangle, color: "#FF6B00", badge: "Critical", highlight: true,
      links: [
        { text: "How the Emergency Bridge Works", action: () => { } },
        { text: "Testing Your Escalation Setup", action: () => navigate("/dashboard/settings") },
        { text: "Changing the On-Call Coordinator Number", action: () => navigate("/dashboard/settings") },
        { text: "What Happens If Bridge Fails?", action: () => { } },
        { text: "Escalation Audit Trail — Reading Logs", action: () => navigate("/dashboard/escalations") },
        { text: "Escalation Troubleshooting Guide", action: () => { } },
      ],
    },
    {
      title: "Privacy & Compliance", icon: ShieldCheck, color: "#A78BFA",
      links: [
        { text: "PHIPA Architecture — What We Store and Don't Store", action: () => { } },
        { text: "PIPEDA Consent — What Callers Hear", action: () => { } },
        { text: "Data Residency — Why AWS ca-central-1", action: () => { } },
        { text: "Running Your Own PHIPA Audit", action: () => { } },
        { text: "Data Processing Agreement (DPA) — Download", action: () => { } },
        { text: "What to Do If You Suspect a Privacy Issue", action: () => { } },
        { text: "Open Source Audit — Reading Our Code", action: () => window.open("https://github.com/triageai", "_blank") },
      ],
    },
    {
      title: "Reports & Data", icon: BarChart3, color: "#F0B429",
      links: [
        { text: "Exporting Session Data as CSV", action: () => navigate("/dashboard/reports") },
        { text: "Generating a Clinical Summary PDF", action: () => navigate("/dashboard/reports") },
        { text: "Understanding the Analytics Dashboard", action: () => navigate("/dashboard/analytics") },
        { text: "Setting Up Automated Weekly Emails", action: () => navigate("/dashboard/reports") },
        { text: "Reading the CTAS Distribution Chart", action: () => navigate("/dashboard/analytics") },
        { text: "ER Deflection Savings — How It's Calculated", action: () => navigate("/dashboard/analytics") },
        { text: "Using Data for Board Reports", action: () => navigate("/dashboard/reports") },
      ],
    },
    {
      title: "Configuration & Admin", icon: Settings, color: "#64748B",
      links: [
        { text: "Managing Your Clinic's Phone Line", action: () => navigate("/dashboard/settings") },
        { text: "Updating Routing Resources (walk-in hours, addresses)", action: () => navigate("/dashboard/settings") },
        { text: "Adding a Second Triage Line (Growth plan)", action: () => { } },
        { text: "White-Label Setup — Your Clinic's Name on Calls", action: () => { } },
        { text: "Managing Admin User Access", action: () => navigate("/dashboard/settings") },
        { text: "Activating the Fallback Message", action: () => { } },
        { text: "Billing & Subscription Management", action: () => { } },
      ],
    },
  ]

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto animate-fade-in font-sans" style={{ color: "#E8F0FE" }}>

      {/* ── Page Header ── */}
      <div className="text-[13px] mb-6" style={{ color: "#7A8FA8" }}>
        <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate("/dashboard")}>Dashboard</span>
        <span className="mx-2">›</span>
        <span>Help & Docs</span>
      </div>

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="w-7 h-7" style={{ color: "#3B82F6" }} />
          <h1 className="text-[32px] font-bold tracking-tight">Help & Documentation</h1>
          <span className="ml-2 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10B981" }}>
            What's New
          </span>
        </div>
        <p className="text-[16px] leading-relaxed max-w-[600px]" style={{ color: "#7A8FA8" }}>
          Everything you need to run TriageAI with confidence. All guides are specific to your clinic deployment.
        </p>
      </header>

      {/* ── Search Bar ── */}
      <div className="relative mb-10 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#3D5068" }} />
        <input
          type="text"
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-[52px] pl-12 pr-16 rounded-[10px] text-[15px] focus:outline-none focus:ring-1 transition-shadow"
          style={{ background: "#162033", border: "1px solid #243554", color: "#E8F0FE", outlineColor: "#3B82F6" }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] px-2 py-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: "#7A8FA8" }}
          >
            Clear
          </button>
        )}
        {!searchQuery && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
            <kbd className="font-sans px-1.5 py-0.5 rounded text-[11px] border" style={{ borderColor: "#3D5068", color: "#E8F0FE" }}>Cmd</kbd>
            <kbd className="font-sans px-1.5 py-0.5 rounded text-[11px] border" style={{ borderColor: "#3D5068", color: "#E8F0FE" }}>K</kbd>
          </div>
        )}
      </div>

      {/* ── System Status Banner ── */}
      <div className="flex items-center justify-between p-4 rounded-[10px] mb-12 border transition-all"
        style={{ background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.3)" }}>
        <div className="flex items-center gap-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <div className="text-[14px] font-bold" style={{ color: "#10B981" }}>All Systems Operational</div>
            <div className="text-[12px] mt-0.5" style={{ color: "#7A8FA8" }}>
              Triage Line · Dashboard · Escalation Bridge · Data Logging
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <button
            onClick={() => navigate("/dashboard/live")}
            className="text-[12px] mt-1 hover:underline" style={{ color: "#10B981" }}
          >
            View Live Monitor →
          </button>
        </div>
      </div>

      {/* Show filtered FAQ results when searching */}
      {searchQuery.trim() && (
        <div className="mb-12">
          <h2 className="text-[13px] font-bold uppercase tracking-widest mb-4" style={{ color: "#7A8FA8" }}>
            Search Results ({filteredFaqs.length} found)
          </h2>
          {filteredFaqs.length === 0 ? (
            <div className="rounded-xl border p-8 text-center" style={{ background: "#162033", borderColor: "#243554" }}>
              <p className="text-[14px]" style={{ color: "#7A8FA8" }}>No results found for "{searchQuery}"</p>
              <p className="text-[13px] mt-2" style={{ color: "#3D5068" }}>Try different keywords or contact support</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, i) => (
                <div key={i} className="rounded-xl border p-4 cursor-pointer hover:border-blue-500/40 transition-colors"
                  style={{ background: "#162033", borderColor: "#243554" }}
                  onClick={() => { setSearchQuery(""); setOpenFaq(faqItems.indexOf(faq)); }}>
                  <h3 className="text-[14px] font-medium" style={{ color: "#E8F0FE" }}>{faq.q}</h3>
                  <p className="text-[13px] mt-1 line-clamp-2" style={{ color: "#7A8FA8" }}>{faq.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!searchQuery.trim() && (
        <>
          {/* ── Quick Actions Bar ── */}
          <div className="mb-14">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1" style={{ background: "#243554" }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#7A8FA8" }}>Quick Actions</span>
              <div className="h-px flex-1" style={{ background: "#243554" }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {quickActions.map((action, i) => (
                <div key={i} className="group rounded-xl p-5 border cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
                  style={{ background: "#162033", borderColor: "#243554" }}
                  onClick={action.action}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${action.color}1A` }}>
                    <action.icon className="w-7 h-7" style={{ color: action.color }} />
                  </div>
                  <h3 className="text-[15px] font-semibold mb-1.5" style={{ color: "#E8F0FE" }}>{action.title}</h3>
                  <p className="text-[13px] leading-relaxed mb-4 h-10" style={{ color: "#7A8FA8" }}>{action.desc}</p>
                  <div className="text-[13px] font-medium flex items-center gap-1 group-hover:underline" style={{ color: "#3B82F6" }}>
                    {action.link} <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Pinned: Escalation Procedure ── */}
          <div className="mb-14 rounded-xl p-6 md:p-8 relative overflow-hidden"
            style={{ background: "#1A1208", border: "1px solid rgba(255,107,0,0.25)", borderLeft: "4px solid #FF6B00" }}>

            <div className="flex items-center justify-between border-b pb-4 mb-6" style={{ borderColor: "rgba(255,107,0,0.15)" }}>
              <div className="flex items-center gap-3">
                <Pin className="w-5 h-5" style={{ color: "#FF6B00" }} fill="#FF6B00" />
                <h2 className="text-[18px] font-bold tracking-wide uppercase" style={{ color: "#E8F0FE" }}>Emergency Escalation Procedure</h2>
              </div>
              <div className="text-[13px] font-medium" style={{ color: "#FF6B00" }}>5 min read</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-8">
              <div className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-[14px] font-mono font-bold" style={{ color: "#FF6B00" }}>01</span>
                    <h3 className="text-[15px] font-semibold" style={{ color: "#E8F0FE" }}>Verify the escalation fired correctly</h3>
                  </div>
                  <p className="text-[14px] pl-7" style={{ color: "#7A8FA8" }}>Go to Sessions → filter by Escalated = Yes → find the call. Look for <code>escalated: true</code> in the timeline.</p>
                </div>
                <div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-[14px] font-mono font-bold" style={{ color: "#FF6B00" }}>02</span>
                    <h3 className="text-[15px] font-semibold" style={{ color: "#E8F0FE" }}>Check if coordinator was reached</h3>
                  </div>
                  <p className="text-[14px] pl-7" style={{ color: "#7A8FA8" }}>Go to Configuration → Emergency Contact → Run Bridge Test. If test fails, the stored number is incorrect.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-[14px] font-mono font-bold" style={{ color: "#FF6B00" }}>03</span>
                    <h3 className="text-[15px] font-semibold" style={{ color: "#E8F0FE" }}>If bridge failed — immediate manual action</h3>
                  </div>
                  <p className="text-[14px] pl-7" style={{ color: "#7A8FA8" }}>Call your coordinator directly. Tell them: caller described symptoms. Advise them to call 911 or go to ER.</p>
                </div>
                <div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-[14px] font-mono font-bold" style={{ color: "#FF6B00" }}>04</span>
                    <h3 className="text-[15px] font-semibold" style={{ color: "#E8F0FE" }}>Report the incident to TriageAI</h3>
                  </div>
                  <p className="text-[14px] pl-7" style={{ color: "#7A8FA8" }}>Email incidents@triageai.ca with the Call SID. We review within 1 hr during business hours, 4 hrs overnight.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pl-7">
              <button
                onClick={() => window.location.href = "mailto:incidents@triageai.ca?subject=Escalation Support Request"}
                className="px-5 py-2.5 rounded text-[13px] font-bold text-neutral-900 transition-colors flex items-center justify-center gap-2 hover:opacity-90"
                style={{ background: "#FF6B00" }}>
                <PhoneCall className="w-4 h-4" /> Contact Support Now
              </button>
              <button
                onClick={() => navigate("/dashboard/escalations")}
                className="px-5 py-2.5 rounded text-[13px] font-bold transition-colors flex items-center justify-center gap-2 border hover:bg-white/5"
                style={{ borderColor: "rgba(255,107,0,0.3)", color: "#FF6B00" }}>
                View Escalation Logs <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Documentation Categories Grid ── */}
          <div className="mb-16">
            <h2 className="text-[13px] font-bold uppercase tracking-widest mb-6" style={{ color: "#7A8FA8" }}>Documentation</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {docCategories.map((cat, i) => (
                <div key={i} className={cn("rounded-xl p-6 border transition-all duration-200 group hover:-translate-y-0.5", cat.highlight ? "" : "hover:border-[#3B82F6]/40")}
                  style={{ background: "#162033", borderColor: cat.highlight ? "rgba(255,107,0,0.3)" : "#243554" }}>
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-[10px] flex items-center justify-center" style={{ background: `${cat.color}1A` }}>
                        <cat.icon className="w-6 h-6" style={{ color: cat.color }} />
                      </div>
                      <h3 className="text-[16px] font-semibold" style={{ color: "#E8F0FE" }}>{cat.title}</h3>
                    </div>
                    {cat.badge && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border"
                        style={{ color: cat.color, borderColor: `${cat.color}40`, background: `${cat.color}1A` }}>
                        {cat.badge}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-0 mb-5">
                    {cat.links.map((link, j) => (
                      <li key={j}
                        className="border-b last:border-0 py-2.5 flex justify-between items-center group/link cursor-pointer"
                        style={{ borderColor: "#1E2D45" }}
                        onClick={link.action}>
                        <div className="flex gap-2 items-start text-[13px] transition-colors group-hover/link:text-white" style={{ color: "#7A8FA8" }}>
                          <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-50" />
                          <span>{link.text}</span>
                        </div>
                        {link.isNew && (
                          <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#10B981", color: "#000" }}>NEW</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* ── Video Tutorials ── */}
          <div className="mb-16">
            <h2 className="text-[13px] font-bold uppercase tracking-widest mb-6" style={{ color: "#7A8FA8" }}>Video Walkthroughs</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Getting Started", desc: "Your first 30 minutes with TriageAI", time: "4:32", img: "linear-gradient(to bottom, #1E2D45, #0A0F1E)", action: () => navigate("/dashboard") },
                { title: "Reading Your Dashboard", desc: "Understanding CTAS charts and session data", time: "3:18", img: "linear-gradient(to bottom, #2D4A78, #0A0F1E)", action: () => navigate("/dashboard/analytics") },
                { title: "Escalation Setup", desc: "Testing and verifying your emergency bridge", time: "2:47", img: "linear-gradient(to bottom, #59351C, #0A0F1E)", action: () => navigate("/dashboard/settings") },
              ].map((vid, i) => (
                <div key={i} className="rounded-xl border overflow-hidden group cursor-pointer" style={{ background: "#162033", borderColor: "#243554" }}
                  onClick={vid.action}>
                  <div className="h-[180px] relative flex items-center justify-center" style={{ background: vid.img }}>
                    <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ background: "rgba(59,130,246,0.8)", borderColor: "#3B82F6" }}>
                      <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                    </div>
                    <div className="absolute bottom-3 right-3 px-1.5 py-0.5 bg-black/80 rounded text-[11px] font-mono text-white">
                      {vid.time}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-[15px] font-semibold mb-1" style={{ color: "#E8F0FE" }}>{vid.title}</h3>
                    <p className="text-[13px] mb-4" style={{ color: "#7A8FA8" }}>{vid.desc}</p>
                    <div className="text-[13px] font-medium flex items-center gap-1 group-hover:underline" style={{ color: "#3B82F6" }}>
                      Watch Now <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FAQ Accordion ── */}
          <div className="mb-16">
            <h2 className="text-[13px] font-bold uppercase tracking-widest mb-6" style={{ color: "#7A8FA8" }}>Frequently Asked Questions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {faqItems.map((faq, i) => (
                <div key={i} className="rounded-[10px] border overflow-hidden cursor-pointer transition-colors h-fit"
                  style={{
                    background: openFaq === i ? "#1A2438" : "#162033",
                    borderColor: openFaq === i ? "rgba(59,130,246,0.4)" : "#243554"
                  }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <div className="p-4 flex justify-between items-start gap-4">
                    <h3 className="text-[14px] font-medium leading-snug pt-0.5" style={{ color: "#E8F0FE" }}>{faq.q}</h3>
                    <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform duration-300 mt-1", openFaq === i ? "rotate-180" : "")} style={{ color: "#3B82F6" }} />
                  </div>
                  <div className={cn("px-4 overflow-hidden transition-all duration-300", openFaq === i ? "max-h-[500px] pb-5 opacity-100" : "max-h-0 opacity-0")}>
                    <p className="text-[13.5px] leading-[1.7] whitespace-pre-wrap" style={{ color: "#7A8FA8" }}>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Changelog / What's New ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[13px] font-bold uppercase tracking-widest" style={{ color: "#7A8FA8" }}>What's New</h2>
                <button className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: "#3B82F6" }}>
                  <Rss className="w-3.5 h-3.5" /> Subscribe
                </button>
              </div>

              <div className="relative pl-6 border-l" style={{ borderColor: "#243554" }}>
                {/* Entry 1 */}
                <div className="mb-10 relative">
                  <div className="absolute -left-[30px] w-[11px] h-[11px] rounded-full top-1 border-[2px] border-[#0A0F1E]" style={{ background: "#3B82F6" }} />
                  <div className="flex items-baseline gap-3 mb-3">
                    <h3 className="text-[14px] font-semibold" style={{ color: "#E8F0FE" }}>v1.2.0</h3>
                    <span className="text-[12px] font-mono" style={{ color: "#7A8FA8" }}>Feb 25, 2026</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>NEW</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-sm mb-1.5" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>IMPROVEMENT</span>
                      <div className="text-[14px] font-medium text-white mb-1">French language detection</div>
                      <div className="text-[13px] leading-relaxed" style={{ color: "#7A8FA8" }}>TriageAI now detects when a caller is speaking French and responds accordingly. Full bilingual triage available on all plans.</div>
                    </div>
                    <div>
                      <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-sm mb-1.5" style={{ background: "rgba(59,130,246,0.15)", color: "#3B82F6" }}>CHANGE</span>
                      <div className="text-[14px] font-medium text-white mb-1">Emergency bridge timeout reduced</div>
                      <div className="text-[13px] leading-relaxed" style={{ color: "#7A8FA8" }}>Bridge connection timeout reduced from 30s to 15s — faster escalation for L1 callers.</div>
                    </div>
                  </div>
                </div>

                {/* Entry 2 */}
                <div className="mb-6 relative">
                  <div className="absolute -left-[30px] w-[11px] h-[11px] rounded-full top-1 border-[2px] border-[#0A0F1E]" style={{ background: "#243554" }} />
                  <div className="flex items-baseline gap-3 mb-3">
                    <h3 className="text-[14px] font-semibold" style={{ color: "#E8F0FE" }}>v1.1.0</h3>
                    <span className="text-[12px] font-mono" style={{ color: "#7A8FA8" }}>Feb 10, 2026</span>
                  </div>
                  <div>
                    <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-sm mb-1.5" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>NEW FEATURE</span>
                    <div className="text-[14px] font-medium text-white mb-1">CSV Export with CTAS filters</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Downloadable Resources ── */}
            <div id="privacy-section">
              <h2 className="text-[13px] font-bold uppercase tracking-widest mb-6" style={{ color: "#7A8FA8" }}>Downloads</h2>
              <div className="space-y-3">
                {[
                  { type: "PDF", title: "Clinical Basis Document", desc: "The rationale behind CTAS implementation", meta: "v1.2 · 8 pages" },
                  { type: "PDF", title: "PHIPA Compliance Overview", desc: "Architecture doc for procurement teams", meta: "v1.0 · 4 pages" },
                  { type: "DOCX", title: "Data Processing Agreement", desc: "Pre-signed DPA template for legal", meta: "v1.0" },
                ].map((doc, i) => (
                  <div key={i} className="rounded-[10px] p-4 flex items-center gap-4 border group cursor-pointer hover:border-blue-500/40 transition-colors" style={{ background: "#162033", borderColor: "#243554" }}>
                    <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center border" style={{ background: "#0F172A", borderColor: "#243554" }}>
                      <span className="text-[10px] font-bold" style={{ color: "#E8F0FE" }}>{doc.type}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold truncate" style={{ color: "#E8F0FE" }}>{doc.title}</div>
                      <div className="text-[12px] truncate" style={{ color: "#7A8FA8" }}>{doc.desc}</div>
                    </div>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors group-hover:bg-blue-500/10" style={{ color: "#3B82F6" }}>
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <a href="https://github.com/triageai" target="_blank" rel="noopener noreferrer"
                  className="rounded-[10px] p-4 flex items-center gap-4 border group hover:border-blue-500/40 transition-colors" style={{ background: "#162033", borderColor: "#243554" }}>
                  <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center border" style={{ background: "#0F172A", borderColor: "#243554" }}>
                    <ExternalLink className="w-4 h-4" style={{ color: "#E8F0FE" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold truncate" style={{ color: "#E8F0FE" }}>Open Source Code</div>
                    <div className="text-[12px] truncate" style={{ color: "#7A8FA8" }}>Auditable by any IT team</div>
                  </div>
                  <span className="text-[13px] font-medium pr-1" style={{ color: "#3B82F6" }}>GitHub →</span>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
