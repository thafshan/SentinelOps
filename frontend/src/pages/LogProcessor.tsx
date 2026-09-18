import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import api from "../api"

interface Asset {
  id: number
  name: string
  hostname: string | null
}

interface SecurityEvent {
  asset_id: number
  event_type: string
  severity: string
  source_ip: string | null
  message: string
  status: string
  detected_at: string
  resolved_at: string | null
  id: number
  created_at: string
  updated_at: string
}

interface ProcessResponse {
  message: string
  event: SecurityEvent
}

function LogProcessor() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [assetId, setAssetId] = useState("")
  const [logLine, setLogLine] = useState(
    "2026-09-18 11:00:00 | 10.0.0.120 | BRUTE_FORCE | Multiple failed login attempts detected",
  )

  const [result, setResult] = useState<SecurityEvent | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingAssets, setLoadingAssets] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await api.get("/assets/")
        setAssets(response.data)

        if (response.data.length > 0) {
          setAssetId(String(response.data[0].id))
        }
      } catch {
        setError("Unable to load assets.")
      } finally {
        setLoadingAssets(false)
      }
    }

    fetchAssets()
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    setLoading(true)
    setError("")
    setSuccess("")
    setResult(null)

    try {
      const response = await api.post<ProcessResponse>(
        "/security-events/process",
        {
          asset_id: Number(assetId),
          log_line: logLine,
        },
      )

      setSuccess(response.data.message)
      setResult(response.data.event)
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Unable to process security log.",
      )
    } finally {
      setLoading(false)
    }
  }

  const getSeverityClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "high":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      default:
        return "bg-green-500/10 text-green-400 border-green-500/20"
    }
  }

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "investigating":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    }
  }

  const getAssetName = (id: number) => {
    const asset = assets.find((item) => item.id === id)

    return asset
      ? asset.name
      : `Asset #${id}`
  }

  return (
    <div>
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
              Security Intelligence
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white">
              Log Processor
            </h2>

            <p className="mt-2 max-w-2xl text-slate-400">
              Ingest security logs, detect suspicious activity, and
              automatically create security events.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Processing Engine
            </p>

            <p className="mt-1 text-sm font-medium text-green-400">
              Operational
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white">
                Process Security Log
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Submit a raw security log for parsing and event
                detection.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="asset"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Target Asset
                </label>

                <select
                  id="asset"
                  value={assetId}
                  onChange={(event) => setAssetId(event.target.value)}
                  disabled={loadingAssets || assets.length === 0}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {assets.length === 0 ? (
                    <option value="">
                      No assets available
                    </option>
                  ) : (
                    assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name}
                        {asset.hostname
                          ? ` — ${asset.hostname}`
                          : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="log"
                    className="block text-sm font-medium text-slate-300"
                  >
                    Security Log
                  </label>

                  <span className="text-xs text-slate-500">
                    Format: timestamp | IP | event | message
                  </span>
                </div>

                <textarea
                  id="log"
                  value={logLine}
                  onChange={(event) => setLogLine(event.target.value)}
                  rows={6}
                  placeholder="2026-09-18 11:00:00 | 10.0.0.120 | BRUTE_FORCE | Multiple failed login attempts detected"
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm leading-6 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Supported events include FAILED_LOGIN, BRUTE_FORCE,
                  SUSPICIOUS_IP, PRIVILEGE_ESCALATION, MALWARE_DETECTED,
                  and UNAUTHORIZED_ACCESS.
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  loadingAssets ||
                  !assetId ||
                  !logLine.trim()
                }
                className="w-full rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Processing Log..." : "Process Security Log"}
              </button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="h-full rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white">
                Processing Pipeline
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                How SentinelOps handles incoming security logs.
              </p>
            </div>

            <div className="space-y-3">
              {[
                ["01", "Raw Security Log"],
                ["02", "Parse & Validate"],
                ["03", "Detect Event"],
                ["04", "Store in PostgreSQL"],
                ["05", "Update Risk Intelligence"],
              ].map(([number, label], index) => (
                <div key={number}>
                  <div className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-950 px-4 py-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-xs font-bold text-cyan-400">
                      {number}
                    </div>

                    <p className="text-sm font-medium text-slate-200">
                      {label}
                    </p>
                  </div>

                  {index < 4 && (
                    <div className="ml-8 h-3 border-l border-dashed border-slate-700" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Detected Security Event
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                The log was successfully parsed and stored as a
                security event.
              </p>
            </div>

            <span
              className={`w-fit rounded-full border px-3 py-1 text-xs font-medium uppercase ${getSeverityClass(
                result.severity,
              )}`}
            >
              {result.severity}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Event Type
              </p>

              <p className="mt-2 font-medium capitalize text-white">
                {result.event_type.replaceAll("_", " ")}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Asset
              </p>

              <p className="mt-2 truncate font-medium text-white">
                {getAssetName(result.asset_id)}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Source IP
              </p>

              <p className="mt-2 font-mono text-sm text-cyan-400">
                {result.source_ip || "—"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Status
              </p>

              <span
                className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusClass(
                  result.status,
                )}`}
              >
                {result.status}
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Detection Message
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {result.message}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default LogProcessor