import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import api from "../api"

interface RiskOverview {
  overall_risk_score: number
  risk_level: string
  total_assets: number
  critical_assets: number
  open_vulnerabilities: number
  active_security_events: number
  open_incidents: number
}

function Dashboard() {
  const [overview, setOverview] = useState<RiskOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await api.get("/risk/overview")
        setOverview(response.data)
      } catch {
        setError("Unable to load security overview.")
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [])

  const riskLevel = overview?.risk_level ?? "unknown"

  const riskColor =
    overview && overview.overall_risk_score >= 75
      ? "text-red-400"
      : overview && overview.overall_risk_score >= 50
        ? "text-orange-400"
        : overview && overview.overall_risk_score >= 25
          ? "text-yellow-400"
          : "text-green-400"

  const riskBorder =
    overview && overview.overall_risk_score >= 75
      ? "border-red-500/30"
      : overview && overview.overall_risk_score >= 50
        ? "border-orange-400/30"
        : overview && overview.overall_risk_score >= 25
          ? "border-yellow-400/30"
          : "border-green-400/30"

  const postureData = overview
    ? [
        {
          name: "Critical Assets",
          value: overview.critical_assets,
        },
        {
          name: "Vulnerabilities",
          value: overview.open_vulnerabilities,
        },
        {
          name: "Security Events",
          value: overview.active_security_events,
        },
        {
          name: "Incidents",
          value: overview.open_incidents,
        },
      ]
    : []

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-cyan-400" />

            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Security Dashboard
            </h2>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Monitor assets, vulnerabilities, security events, incidents,
            and overall security risk.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 sm:self-auto">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />

          <span className="text-xs font-medium uppercase tracking-wider text-cyan-300">
            System Monitoring
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
          Loading security overview...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && overview && (
        <>
          {/* Primary Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Risk Score */}
            <div className="group relative overflow-hidden rounded-2xl border border-yellow-400/20 bg-slate-900 p-5 transition duration-300 hover:border-yellow-400/40 hover:shadow-[0_0_25px_rgba(250,204,21,0.08)]">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-yellow-400/5 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-400">
                    Overall Risk
                  </p>

                  <span className="rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-2 py-1 text-xs font-semibold text-yellow-300">
                    RISK
                  </span>
                </div>

                <div className="mt-5 flex items-end gap-3">
                  <p className="text-4xl font-bold tracking-tight text-white">
                    {overview.overall_risk_score}
                  </p>

                  <p className="mb-1 text-sm capitalize text-yellow-300">
                    {riskLevel}
                  </p>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-yellow-400 transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        overview.overall_risk_score,
                        100,
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Security risk score out of 100
                </p>
              </div>
            </div>

            {/* Assets */}
            <div className="group relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-900 p-5 transition duration-300 hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(34,211,238,0.08)]">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-cyan-400/5 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-400">
                    Monitored Assets
                  </p>

                  <span className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-xs font-semibold text-cyan-300">
                    ASSETS
                  </span>
                </div>

                <p className="mt-5 text-4xl font-bold tracking-tight text-white">
                  {overview.total_assets}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Infrastructure assets
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />

                  <span className="text-xs text-slate-400">
                    {overview.critical_assets} critical
                  </span>
                </div>
              </div>
            </div>

            {/* Vulnerabilities */}
            <div className="group relative overflow-hidden rounded-2xl border border-red-500/20 bg-slate-900 p-5 transition duration-300 hover:border-red-500/40 hover:shadow-[0_0_25px_rgba(239,68,68,0.08)]">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-red-500/5 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-400">
                    Vulnerabilities
                  </p>

                  <span className="rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-400">
                    THREATS
                  </span>
                </div>

                <p className="mt-5 text-4xl font-bold tracking-tight text-white">
                  {overview.open_vulnerabilities}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Open vulnerabilities
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      overview.open_vulnerabilities > 0
                        ? "animate-pulse bg-red-400"
                        : "bg-green-400"
                    }`}
                  />

                  <span className="text-xs text-slate-400">
                    {overview.open_vulnerabilities > 0
                      ? "Requires attention"
                      : "No open vulnerabilities"}
                  </span>
                </div>
              </div>
            </div>

            {/* Security Events */}
            <div className="group relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-900 p-5 transition duration-300 hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(34,211,238,0.08)]">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-cyan-400/5 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-400">
                    Security Events
                  </p>

                  <span className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-xs font-semibold text-cyan-300">
                    EVENTS
                  </span>
                </div>

                <p className="mt-5 text-4xl font-bold tracking-tight text-white">
                  {overview.active_security_events}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Active security events
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      overview.active_security_events > 0
                        ? "animate-pulse bg-red-400"
                        : "bg-green-400"
                    }`}
                  />

                  <span className="text-xs text-slate-400">
                    {overview.active_security_events > 0
                      ? "Active monitoring"
                      : "No active events"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Intelligence */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {/* Risk Overview */}
            <div
              className={`relative overflow-hidden rounded-2xl border ${riskBorder} bg-slate-900 p-6 sm:p-8`}
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/5 blur-3xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-wider text-slate-400">
                      Risk Intelligence
                    </p>

                    <h3 className="mt-1 text-xl font-semibold text-white">
                      Overall Security Risk
                    </h3>
                  </div>

                  <div className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
                    <span className="text-xs font-medium text-slate-400">
                      SCORE
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center justify-center sm:flex-row sm:gap-10">
                  <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-8 border-slate-800">
                    <div
                      className={`absolute inset-0 rounded-full border-8 ${riskBorder}`}
                    />

                    <div className="text-center">
                      <p className={`text-4xl font-bold ${riskColor}`}>
                        {overview.overall_risk_score}
                      </p>

                      <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">
                        / 100
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 text-center sm:mt-0 sm:text-left">
                    <p className={`text-2xl font-bold uppercase ${riskColor}`}>
                      {riskLevel}
                    </p>

                    <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
                      Current risk level calculated from vulnerabilities,
                      security events, and incidents across monitored assets.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-500">
                      Critical Assets
                    </p>

                    <p className="mt-2 text-xl font-bold text-red-400">
                      {overview.critical_assets}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-500">
                      Open Incidents
                    </p>

                    <p className="mt-2 text-xl font-bold text-yellow-400">
                      {overview.open_incidents}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Status */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-slate-400">
                  Security Status
                </p>

                <h3 className="mt-1 text-xl font-semibold text-white">
                  Current Environment
                </h3>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />

                    <div>
                      <p className="text-sm font-medium text-white">
                        Monitored Assets
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Infrastructure under monitoring
                      </p>
                    </div>
                  </div>

                  <span className="text-lg font-bold text-cyan-300">
                    {overview.total_assets}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 ${
                        overview.open_vulnerabilities > 0
                          ? "animate-pulse rounded-full bg-red-400"
                          : "rounded-full bg-green-400"
                      }`}
                    />

                    <div>
                      <p className="text-sm font-medium text-white">
                        Open Vulnerabilities
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Vulnerabilities requiring remediation
                      </p>
                    </div>
                  </div>

                  <span className="text-lg font-bold text-red-400">
                    {overview.open_vulnerabilities}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 ${
                        overview.active_security_events > 0
                          ? "animate-pulse rounded-full bg-red-400"
                          : "rounded-full bg-green-400"
                      }`}
                    />

                    <div>
                      <p className="text-sm font-medium text-white">
                        Active Security Events
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Events currently being monitored
                      </p>
                    </div>
                  </div>

                  <span className="text-lg font-bold text-red-400">
                    {overview.active_security_events}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 ${
                        overview.open_incidents > 0
                          ? "animate-pulse rounded-full bg-yellow-400"
                          : "rounded-full bg-green-400"
                      }`}
                    />

                    <div>
                      <p className="text-sm font-medium text-white">
                        Open Incidents
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Incidents requiring investigation
                      </p>
                    </div>
                  </div>

                  <span className="text-lg font-bold text-yellow-400">
                    {overview.open_incidents}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Posture */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-slate-400">
                  Security Analytics
                </p>

                <h3 className="mt-1 text-xl font-semibold text-white">
                  Current Security Posture
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Current security findings across the monitored environment.
                </p>
              </div>

              <span className="self-start rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-cyan-300 sm:self-auto">
                Live Data
              </span>
            </div>

            <div className="mt-8 h-72 w-full sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={postureData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -10,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148, 163, 184, 0.12)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{
                      fill: "rgba(34, 211, 238, 0.04)",
                    }}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(34, 211, 238, 0.2)",
                      borderRadius: "12px",
                      color: "#ffffff",
                    }}
                    labelStyle={{
                      color: "#94a3b8",
                    }}
                  />

                  <Bar
                    dataKey="value"
                    fill="#22d3ee"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={55}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
