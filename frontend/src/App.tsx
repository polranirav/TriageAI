import { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { isAuthenticated } from "./lib/api"

const DashboardLayout = lazy(() =>
  import("./components/layout/DashboardLayout").then((module) => ({ default: module.DashboardLayout })),
)
const Overview = lazy(() => import("./pages/Overview").then((module) => ({ default: module.Overview })))
const Sessions = lazy(() => import("./pages/Sessions").then((module) => ({ default: module.Sessions })))
const Analytics = lazy(() => import("./pages/Analytics").then((module) => ({ default: module.Analytics })))
const Settings = lazy(() => import("./pages/Settings").then((module) => ({ default: module.Settings })))
const SessionDetail = lazy(() => import("./pages/SessionDetail").then((module) => ({ default: module.SessionDetail })))
const Landing = lazy(() => import("./pages/Landing").then((module) => ({ default: module.Landing })))
const Login = lazy(() => import("./pages/Login").then((module) => ({ default: module.Login })))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="sessions" element={<Sessions />} />
          <Route path="sessions/:id" element={<SessionDetail />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Suspense>
  )
}

function RouteFallback() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="inline-flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-300">
        <span className="h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse" />
        Loading TriageAI interface...
      </div>
    </div>
  )
}

export default App
