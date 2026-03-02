import { useState, type FormEvent } from "react"
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
            // In development mode, use dev-token for instant access
            if (import.meta.env.DEV) {
                setAuthToken("dev-token")
                window.location.href = "/dashboard"
                return
            }

            // Production: Supabase Auth
            const res = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
                    },
                    body: JSON.stringify({ email, password }),
                }
            )

            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body?.error_description || body?.msg || "Invalid credentials")
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
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
            {/* Background gradient */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-[420px]">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">TriageAI</span>
                    </div>
                    <p className="text-neutral-400 text-sm">Sign in to the admin dashboard</p>
                </div>

                {/* Card */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl shadow-black/30">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-[13px] font-medium text-neutral-300 mb-1.5">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@clinic.ca"
                                required
                                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-[15px]"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-[13px] font-medium text-neutral-300 mb-1.5">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-[15px]"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                                <span className="text-[13px] text-red-400">{error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-[15px] shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 active:scale-[0.98]"
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
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Dev mode hint */}
                    {import.meta.env.DEV && (
                        <div className="mt-5 pt-5 border-t border-neutral-800">
                            <p className="text-[11px] text-neutral-500 text-center">
                                Development mode — any credentials will work
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-[11px] text-neutral-600 mt-6">
                    TriageAI — Ontario Medical Triage System
                </p>
            </div>
        </div>
    )
}
