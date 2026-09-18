import { useEffect, useState } from "react"
import api from "../api"

interface SecurityEvent {
  id: number
  asset_id: number
  event_type: string
  severity: string
  source_ip: string | null
  message: string
  status: string
  detected_at: string
  resolved_at: string | null
  created_at: string
  updated_at: string
}

interface Asset {
  id: number
  name: string
  hostname: string | null
}

function SecurityEvents() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsResponse, assetsResponse] = await Promise.all([
          api.get("/security-events/"),
          api.get("/assets/"),
        ])

        setEvents(eventsResponse.data)
        setAssets(assetsResponse.data)
      } catch {
        setError("Unable to load security events.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getSeverityStyle = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "border-red-500/30 bg-red-500/10 text-red-400"

      case "high":
        return "border-orange-400/30 bg-orange-400/10 text-orange-300"

      case "medium":
        return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300"

      case "low":
        return "border-green-400/30 bg-green-400/10 text-green-400"

      default:
        return "border-slate-700 bg-slate-800 text-slate-400"
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "border-green-400/20 bg-green-400/10 text-green-400"

      case "new":
        return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"

      case "investigating":
        return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300"

      default:
        return "border-slate-700 bg-slate-800 text-slate-400"
    }
  }

  const getAsset = (assetId: number) => {
    return assets.find((asset) => asset.id === assetId)
  }

  const activeEvents = events.filter(
    (event) => event.status.toLowerCase() !== "resolved",
  ).length

  const criticalHighEvents = events.filter((event) =>
    ["critical", "high"].includes(event.severity.toLowerCase()),
  ).length

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-cyan-400" />

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Security Events
              </h2>

              <p className="mt-2 text-sm text-slate-400 sm:text-base">
                Monitor detected security activity across your infrastructure.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-red-400/20 bg-red-400/5 px-3 py-1.5 sm:self-auto">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />

          <span className="text-xs font-medium uppercase tracking-wider text-red-300">
            Live Events
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-cyan-400/20 bg-slate-900 p-5 transition duration-300 hover:border-cyan-400/40">
          <p className="text-sm font-medium text-slate-400">
            Total Events
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {events.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Recorded security activity
          </p>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-slate-900 p-5 transition duration-300 hover:border-red-500/40">
          <p className="text-sm font-medium text-slate-400">
            Active Events
          </p>

          <p className="mt-2 text-3xl font-bold text-red-400">
            {activeEvents}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                activeEvents > 0
                  ? "animate-pulse bg-red-400"
                  : "bg-green-400"
              }`}
            />

            <p className="text-xs text-slate-500">
              {activeEvents > 0
                ? "Requires monitoring"
                : "No active events"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-yellow-400/20 bg-slate-900 p-5 transition duration-300 hover:border-yellow-400/40">
          <p className="text-sm font-medium text-slate-400">
            Critical / High
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-300">
            {criticalHighEvents}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Higher-severity events
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

            <p className="text-sm text-slate-400">
              Loading security events...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
          <p className="text-sm font-medium text-red-400">
            {error}
          </p>
        </div>
      )}

      {/* Events */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {events.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-green-400/20 bg-green-400/10">
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>

              <p className="mt-4 font-medium text-white">
                No security events detected
              </p>

              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Your monitored environment currently has no recorded security
                events.
              </p>
            </div>
          ) : (
            <>
              {/* Section Header */}
              <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-950/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Detected Activity
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Security events currently recorded by SentinelOps
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

                  <span className="text-xs font-medium text-slate-400">
                    {events.length} event{events.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Event
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Asset
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Severity
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Source
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Detected
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {events.map((event) => {
                      const asset = getAsset(event.asset_id)
                      const severity = event.severity.toLowerCase()

                      return (
                        <tr
                          key={event.id}
                          className="group border-b border-slate-800/80 transition duration-200 last:border-b-0 hover:bg-slate-800/30"
                        >
                          {/* Event */}
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                                  severity === "critical"
                                    ? "border-red-500/20 bg-red-500/10"
                                    : severity === "high"
                                      ? "border-orange-400/20 bg-orange-400/10"
                                      : "border-cyan-400/20 bg-cyan-400/10"
                                }`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    severity === "critical"
                                      ? "bg-red-400"
                                      : severity === "high"
                                        ? "bg-orange-400"
                                        : "bg-cyan-400"
                                  }`}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold capitalize text-white">
                                  {event.event_type.replaceAll("_", " ")}
                                </p>

                                <p className="mt-1 max-w-sm truncate text-xs text-slate-500">
                                  {event.message}
                                </p>

                                <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-600">
                                  Event #{event.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Asset */}
                          <td className="px-6 py-5">
                            <p className="font-medium text-slate-200">
                              {asset?.name || `Asset #${event.asset_id}`}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {asset?.hostname || `Asset ID ${event.asset_id}`}
                            </p>
                          </td>

                          {/* Severity */}
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getSeverityStyle(
                                event.severity,
                              )}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />

                              {event.severity}
                            </span>
                          </td>

                          {/* Source */}
                          <td className="px-6 py-5">
                            <div className="inline-flex items-center rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-3 py-2">
                              <span className="font-mono text-xs text-cyan-300">
                                {event.source_ip || "Unknown"}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${getStatusStyle(
                                event.status,
                              )}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />

                              {event.status.replaceAll("_", " ")}
                            </span>
                          </td>

                          {/* Detected */}
                          <td className="whitespace-nowrap px-6 py-5">
                            <p className="text-xs font-medium text-slate-300">
                              {new Date(
                                event.detected_at,
                              ).toLocaleDateString()}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(
                                event.detected_at,
                              ).toLocaleTimeString()}
                            </p>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SecurityEvents
