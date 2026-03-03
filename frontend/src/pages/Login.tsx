import { useState, type FormEvent } from "react"
import { CheckCircle2 } from "lucide-react"
import { setAuthToken } from "../lib/api"

export function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            // Dev shortcut
            if (import.meta.env.DEV) {
                setAuthToken("dev-token")
                window.location.href = "/dashboard"
                return
            }

            // Production: backend JWT auth
            const res = await fetch("/v1/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body?.error?.message || "Invalid credentials")
            }

            const data = await res.json()
            setAuthToken(data.access_token)
            window.location.href = "/dashboard"
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Login failed. Please try again."
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-900 grid grid-cols-1 lg:grid-cols-[40%_60%]">
            {/* ── LEFT: Brand Panel ──────────────────────────────── */}
            <div className="hidden lg:flex flex-col justify-between bg-neutral-950 border-r border-neutral-800 p-12">
                <div>
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 mb-16">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">TriageAI</span>
                    </div>

                    {/* Tagline */}
                    <h2 className="text-h2 text-neutral-100 leading-snug mb-10">
                        The AI triage layer
                        <br />
                        Ontario clinics trust.
                    </h2>

                    {/* Feature bullets */}
                    <div className="space-y-4">
                        {[
                            "0-second answer time",
                            "CTAS-aligned triage logic",
                            "PIPEDA & PHIPA compliant",
                            "24/7 automated escalation",
                        ].map((feature) => (
                            <div key={feature} className="flex items-center gap-3">
                                <CheckCircle2 className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                <span className="text-body text-neutral-300">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom disclaimer */}
                <p className="text-caption text-neutral-600 mt-auto pt-8">
                    Built in Toronto 🇨🇦 — Not a medical device
                </p>
            </div>

            {/* ── RIGHT: Sign-In Form ────────────────────────────── */}
            <div className="flex items-center justify-center p-6 lg:p-16">
                <div className="w-full max-w-[400px] animate-fade-in">
                    {/* Mobile logo (hidden on desktop where brand panel shows) */}
                    <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">TriageAI</span>
                    </div>

                    <h2 className="text-h2 text-neutral-50 mb-8">Sign in</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-body-sm font-medium text-neutral-300 mb-2">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@clinic.ca"
                                required
                                className="w-full h-11 px-3 bg-neutral-800 border border-neutral-700 rounded-sm text-neutral-100 text-body placeholder:text-neutral-600 focus:outline-none focus:border-primary-500 focus:shadow-primary transition-[border-color] duration-150"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-body-sm font-medium text-neutral-300 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full h-11 px-3 bg-neutral-800 border border-neutral-700 rounded-sm text-neutral-100 text-body placeholder:text-neutral-600 focus:outline-none focus:border-primary-500 focus:shadow-primary transition-[border-color] duration-150"
                            />
                        </div>

                        {/* Error banner */}
                        {error && (
                            <div className="flex items-center gap-2.5 p-3 bg-red-500/10 border border-red-500/30 rounded-sm animate-fade-in">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                <span className="text-body-sm text-neutral-200">{error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-primary-500 text-neutral-950 font-semibold text-body rounded-sm hover:bg-primary-400 active:bg-primary-600 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed transition-colors duration-150"
                        >
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign in →"
                            )}
                        </button>
                    </form>

                    {/* Forgot password */}
                    <p className="text-center mt-4">
                        <a href="#" className="text-body-sm text-primary-500 hover:text-primary-400 transition-colors">
                            Forgot password?
                        </a>
                    </p>

                    {/* Dev mode hint */}
                    {import.meta.env.DEV && (
                        <div className="mt-8 pt-5 border-t border-neutral-800">
                            <p className="text-caption text-neutral-500 text-center">
                                Development mode — any credentials will work
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
