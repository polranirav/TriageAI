import { Link } from "react-router-dom"
import { AlertTriangle } from "lucide-react"

export function NotFound() {
    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
            <div className="text-center animate-fade-in max-w-md">
                {/* Large 404 */}
                <div className="relative mb-8">
                    <span className="text-[120px] font-extrabold text-neutral-800/60 leading-none select-none">404</span>
                    <AlertTriangle className="w-12 h-12 text-primary-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>

                <h1 className="text-h2 text-neutral-100 mb-3">Page Not Found</h1>
                <p className="text-body text-neutral-400 mb-8">
                    The page you're looking for doesn't exist or you don't have access.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <Link
                        to="/"
                        className="px-5 py-2.5 text-body-sm font-medium text-neutral-950 bg-primary-500 rounded-md hover:bg-primary-400 transition-colors"
                    >
                        Go Home
                    </Link>
                    <Link
                        to="/dashboard"
                        className="px-5 py-2.5 text-body-sm font-medium text-neutral-300 border border-neutral-700 rounded-md hover:border-neutral-500 hover:text-neutral-100 transition-colors"
                    >
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}

export function SystemError() {
    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
            <div className="text-center animate-fade-in max-w-md">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>

                <h1 className="text-h2 text-neutral-100 mb-3">Something went wrong</h1>
                <p className="text-body text-neutral-400 mb-8">
                    We're experiencing technical difficulties. Our team has been notified.
                    Please try again in a few minutes.
                </p>

                <button
                    onClick={() => window.location.reload()}
                    className="px-5 py-2.5 text-body-sm font-medium text-neutral-950 bg-primary-500 rounded-md hover:bg-primary-400 transition-colors"
                >
                    Refresh Page
                </button>

                <p className="text-caption text-neutral-600 mt-6">
                    If this persists, call 911 for emergencies or contact{" "}
                    <a href="mailto:support@triageai.ca" className="text-primary-500 hover:underline">
                        support@triageai.ca
                    </a>
                </p>
            </div>
        </div>
    )
}
