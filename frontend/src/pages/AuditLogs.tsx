import { useEffect, useState } from "react"
import api from "../api"

interface AuditLog {
  user_id: number | null
  action: string
  entity_type: string
  entity_id: number | null
  description: string
  ip_address: string | null
  id: number
  created_at: string
}

function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get("/audit-logs/")
        setLogs(response.data)
      } catch {
        setError("Unable to load audit logs.")
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const getActionStyle = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "border-green-400/20 bg-green-400/10 text-green-400"

      case "update":
        return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300"

      case "delete":
        return "border-red-400/20 bg-red-400/10 text-red-400"

      default:
        return "border-slate-700 bg-slate-800 text-slate-400"
    }
  }

  const getEntityStyle = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case "asset":
        return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"

      case "vulnerability":
        return "border-red-400/20 bg-red-400/10 text-red-300"

      case "security_event":
        return "border-orange-400/20 bg-orange-400/10 text-orange-300"

      case "incident":
        return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300"

      default:
        return "border-slate-700 bg-slate-800 text-slate-400"
    }
  }

  const createActions = logs.filter(
    (log) => log.action.toLowerCase() === "create",
  ).length

  const updateActions = logs.filter(
    (log) => log.action.toLowerCase() === "update",
  ).length

  const deleteActions = logs.filter(
    (log) => log.action.toLowerCase() === "delete",
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
                Audit Logs
              </h2>

              <p className="mt-2 text-sm text-slate-400 sm:text-base">
                Review security-relevant actions performed across
                SentinelOps.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />

          <span className="text-xs font-medium uppercase tracking-wider text-cyan-300">
            Activity Monitoring
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-cyan-400/20 bg-slate-900 p-5 transition duration-300 hover:border-cyan-400/40">
          <p className="text-sm font-medium text-slate-400">
            Total Logs
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {logs.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Recorded system activity
          </p>
        </div>

        <div className="rounded-2xl border border-green-400/20 bg-slate-900 p-5 transition duration-300 hover:border-green-400/40">
          <p className="text-sm font-medium text-slate-400">
            Create
          </p>

          <p className="mt-2 text-3xl font-bold text-green-400">
            {createActions}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Creation actions
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-400/20 bg-slate-900 p-5 transition duration-300 hover:border-yellow-400/40">
          <p className="text-sm font-medium text-slate-400">
            Update
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-300">
            {updateActions}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Modification actions
          </p>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-slate-900 p-5 transition duration-300 hover:border-red-500/40">
          <p className="text-sm font-medium text-slate-400">
            Delete
          </p>

          <p className="mt-2 text-3xl font-bold text-red-400">
            {deleteActions}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Deletion actions
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

            <p className="text-sm text-slate-400">
              Loading audit logs...
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
          <p className="text-sm font-medium text-red-400">
            {error}
          </p>
        </div>
      )}

      {/* Logs */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {logs.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-green-400/20 bg-green-400/10">
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>

              <p className="mt-4 font-medium text-white">
                No audit activity
              </p>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                No security-relevant actions have been recorded by
                SentinelOps.
              </p>
            </div>
          ) : (
            <>
              {/* Section Header */}
              <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-950/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Activity History
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Security and administrative actions recorded by the
                    platform
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

                  <span className="text-xs font-medium text-slate-400">
                    {logs.length}{" "}
                    {logs.length === 1 ? "entry" : "entries"}
                  </span>
                </div>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1150px] text-left text-sm">
                  <thead className="border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Action
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Entity
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Description
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        User
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Source IP
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Timestamp
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="group border-b border-slate-800/80 transition duration-200 last:border-b-0 hover:bg-slate-800/30"
                      >
                        {/* Action */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getActionStyle(
                              log.action,
                            )}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />

                            {log.action}
                          </span>
                        </td>

                        {/* Entity */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${getEntityStyle(
                              log.entity_type,
                            )}`}
                          >
                            {log.entity_type.replaceAll("_", " ")}
                          </span>

                          {log.entity_id !== null && (
                            <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-slate-600">
                              ID #{log.entity_id}
                            </p>
                          )}
                        </td>

                        {/* Description */}
                        <td className="px-6 py-5">
                          <p className="max-w-lg text-sm leading-6 text-slate-300">
                            {log.description}
                          </p>

                          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-600">
                            Log #{log.id}
                          </p>
                        </td>

                        {/* User */}
                        <td className="px-6 py-5">
                          {log.user_id !== null ? (
                            <div>
                              <p className="font-medium text-slate-200">
                                User #{log.user_id}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Authenticated user
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-600">
                              System
                            </span>
                          )}
                        </td>

                        {/* IP */}
                        <td className="px-6 py-5">
                          {log.ip_address ? (
                            <span className="inline-flex rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 font-mono text-xs text-cyan-300">
                              {log.ip_address}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-600">
                              Not recorded
                            </span>
                          )}
                        </td>

                        {/* Timestamp */}
                        <td className="whitespace-nowrap px-6 py-5">
                          <p className="text-xs font-medium text-slate-300">
                            {new Date(
                              log.created_at,
                            ).toLocaleDateString()}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(
                              log.created_at,
                            ).toLocaleTimeString()}
                          </p>
                        </td>
                      </tr>
                    ))}
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

export default AuditLogs
