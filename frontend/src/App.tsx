import { useEffect, useState } from "react"
import { Route, Routes } from "react-router-dom"

import api from "./api"
import Sidebar from "./components/Sidebar"
import ProtectedRoute from "./components/ProtectedRoute"
import Dashboard from "./pages/Dashboard"
import Assets from "./pages/Assets"
import Login from "./pages/Login"
import Register from "./pages/Register"
import SecurityEvents from "./pages/SecurityEvents"
import Vulnerabilities from "./pages/Vulnerabilities"
import Incidents from "./pages/Incidents"
import AuditLogs from "./pages/AuditLogs"
import LogProcessor from "./pages/LogProcessor"

interface CurrentUser {
  user_id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
  organization_id: number
  organization_name: string
}

function AppLayout() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/auth/me")
        setCurrentUser(response.data)
      } catch {
        setCurrentUser(null)
      }
    }

    fetchCurrentUser()
  }, [])

  const userInitial = currentUser?.full_name?.charAt(0).toUpperCase() || "A"

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <main className="min-w-0 flex-1 pt-16 md:pt-0">
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-8">
          <div>
            <p className="text-sm font-semibold text-white">
              Security Operations Center
            </p>

            <p className="text-xs text-slate-500">
              SentinelOps Monitoring Console
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 px-4 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-semibold text-cyan-400">
              {userInitial}
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                {currentUser?.full_name || "Loading..."}
              </p>

              <p className="text-xs capitalize text-slate-500">
                {currentUser?.role || "Loading..."}
              </p>
            </div>
          </div>
        </header>

        <div className="p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/assets" element={<Assets />} />

            <Route
              path="/vulnerabilities"
              element={<Vulnerabilities />}
            />

            <Route
              path="/security-events"
              element={<SecurityEvents />}
            />

            <Route
              path="/incidents"
              element={<Incidents />}
            />

            <Route
              path="/audit-logs"
              element={<AuditLogs />}
            />

            <Route
              path="/log-processor"
              element={<LogProcessor />}
            />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<AppLayout />} />
      </Route>
    </Routes>
  )
}

export default App

