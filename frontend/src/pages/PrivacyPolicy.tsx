import { Link } from "react-router-dom"
import { ShieldCheck, ArrowLeft } from "lucide-react"

export function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-neutral-950">
            {/* Nav */}
            <nav className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-[800px] items-center justify-between px-6">
                    <Link to="/" className="font-sans text-lg font-bold text-white">TriageAI</Link>
                    <Link to="/" className="flex items-center gap-1.5 text-body-sm text-neutral-400 hover:text-neutral-200 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Home
                    </Link>
                </div>
            </nav>

            <main className="mx-auto max-w-[800px] px-6 py-16 animate-fade-in">
                <div className="flex items-center gap-3 mb-8">
                    <ShieldCheck className="w-8 h-8 text-primary-500" />
                    <h1 className="text-h1 text-neutral-50">Privacy Policy</h1>
                </div>

                <p className="text-body-sm text-neutral-500 mb-10">
                    Last updated: February 27, 2026 — Effective for all Ontario users.
                </p>

                <div className="space-y-10 text-body text-neutral-300 leading-relaxed">
                    <Section title="Overview">
                        TriageAI is an AI-powered medical call triage system built for Ontario, Canada.
                        We are committed to protecting your privacy in compliance with the
                        <strong className="text-neutral-100"> Personal Information Protection and Electronic Documents Act (PIPEDA)</strong> and
                        Ontario's <strong className="text-neutral-100">Personal Health Information Protection Act (PHIPA)</strong>.
                    </Section>

                    <Section title="Information We Do NOT Collect">
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>We do <strong className="text-neutral-100">not</strong> record your voice or store audio</li>
                            <li>We do <strong className="text-neutral-100">not</strong> collect your name, phone number, or any caller identity</li>
                            <li>We do <strong className="text-neutral-100">not</strong> store medical symptoms, conditions, or diagnoses</li>
                            <li>We do <strong className="text-neutral-100">not</strong> use cookies or tracking pixels on voice calls</li>
                        </ul>
                    </Section>

                    <Section title="Information We DO Collect">
                        We store only <strong className="text-neutral-100">de-identified, structural metadata</strong> for system improvement:
                        <ul className="list-disc pl-5 space-y-2 mt-3">
                            <li><strong className="text-neutral-100">CTAS Level (1-5)</strong> — the triage classification result</li>
                            <li><strong className="text-neutral-100">Routing action</strong> — where the caller was directed (e.g., ER, home care)</li>
                            <li><strong className="text-neutral-100">Call duration</strong> — how long the triage conversation lasted</li>
                            <li><strong className="text-neutral-100">Timestamp</strong> — when the call occurred</li>
                            <li><strong className="text-neutral-100">Questions completed</strong> — how many triage questions were answered (count only)</li>
                        </ul>
                    </Section>

                    <Section title="How We Protect Your Data">
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                            <li>Database hosted on Supabase (SOC 2 Type II certified) in Canada</li>
                            <li>No data is shared with third parties for marketing purposes</li>
                            <li>Access to admin dashboards requires authenticated JWT tokens</li>
                        </ul>
                    </Section>

                    <Section title="Your Rights">
                        Under PIPEDA and PHIPA, you have the right to:
                        <ul className="list-disc pl-5 space-y-2 mt-3">
                            <li>Request information about what data we hold (note: we hold no PII)</li>
                            <li>File a complaint with the Office of the Privacy Commissioner of Canada</li>
                            <li>Contact us with any privacy concerns</li>
                        </ul>
                    </Section>

                    <Section title="Contact">
                        For privacy inquiries, contact:{" "}
                        <a href="mailto:privacy@triageai.ca" className="text-primary-500 hover:underline">
                            privacy@triageai.ca
                        </a>
                    </Section>

                    <Section title="Disclaimer">
                        <p className="text-neutral-400 text-body-sm italic">
                            TriageAI is not a medical device. It does not provide medical diagnoses.
                            Always call 911 in a life-threatening emergency. TriageAI provides routing
                            guidance based on the CTAS (Canadian Triage and Acuity Scale) standard.
                        </p>
                    </Section>
                </div>
            </main>
        </div>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="text-h3 text-neutral-100 mb-3">{title}</h2>
            <div className="text-body text-neutral-300">{children}</div>
        </section>
    )
}
