import { useEffect, useState } from "react"
import api from "../api"

interface Vulnerability {
  id: number
  asset_id: number
  cve_id: string | null
  title: string
  description: string | null
  severity: string
  cvss_score: number | null
  status: string
  discovered_at: string
  resolved_at: string | null
  created_at: string
  updated_at: string
}

interface Asset {
  id: number
  name: string
  hostname: string | null
}

function Vulnerabilities() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vulnerabilitiesResponse, assetsResponse] =
          await Promise.all([
            api.get("/vulnerabilities/"),
            api.get("/assets/"),
          ])

        setVulnerabilities(vulnerabilitiesResponse.data)
        setAssets(assetsResponse.data)
      } catch {
        setError("Unable to load vulnerabilities.")
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

      case "open":
        return "border-red-400/20 bg-red-400/10 text-red-400"

      case "in_progress":
        return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300"

      default:
        return "border-slate-700 bg-slate-800 text-slate-400"
    }
  }

  const getAsset = (assetId: number) => {
    return assets.find((asset) => asset.id === assetId)
  }

  const openVulnerabilities = vulnerabilities.filter(
    (vulnerability) =>
      vulnerability.status.toLowerCase() !== "resolved",
  ).length

  const criticalHighVulnerabilities = vulnerabilities.filter(
    (vulnerability) =>
      ["critical", "high"].includes(
        vulnerability.severity.toLowerCase(),
      ),
  ).length

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-red-400" />

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Vulnerabilities
              </h2>

              <p className="mt-2 text-sm text-slate-400 sm:text-base">
                Track and manage security vulnerabilities across your
                infrastructure.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-red-400/20 bg-red-400/5 px-3 py-1.5 sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-red-400" />

          <span className="text-xs font-medium uppercase tracking-wider text-red-300">
            Vulnerability Management
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-cyan-400/20 bg-slate-900 p-5 transition duration-300 hover:border-cyan-400/40">
          <p className="text-sm font-medium text-slate-400">
            Total Vulnerabilities
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {vulnerabilities.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Recorded security findings
          </p>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-slate-900 p-5 transition duration-300 hover:border-red-500/40">
          <p className="text-sm font-medium text-slate-400">
            Open Vulnerabilities
          </p>

          <p className="mt-2 text-3xl font-bold text-red-400">
            {openVulnerabilities}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                openVulnerabilities > 0
                  ? "animate-pulse bg-red-400"
                  : "bg-green-400"
              }`}
            />

            <p className="text-xs text-slate-500">
              {openVulnerabilities > 0
                ? "Requires remediation"
                : "No open vulnerabilities"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-yellow-400/20 bg-slate-900 p-5 transition duration-300 hover:border-yellow-400/40">
          <p className="text-sm font-medium text-slate-400">
            Critical / High
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-300">
            {criticalHighVulnerabilities}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Higher-severity findings
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

            <p className="text-sm text-slate-400">
              Loading vulnerabilities...
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

      {/* Vulnerabilities */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {vulnerabilities.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-green-400/20 bg-green-400/10">
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>

              <p className="mt-4 font-medium text-white">
                No vulnerabilities detected
              </p>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                Your monitored environment currently has no recorded
                vulnerabilities.
              </p>
            </div>
          ) : (
            <>
              {/* Section Header */}
              <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-950/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Vulnerability Findings
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Security vulnerabilities currently recorded by
                    SentinelOps
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />

                  <span className="text-xs font-medium text-slate-400">
                    {vulnerabilities.length}{" "}
                    {vulnerabilities.length === 1
                      ? "finding"
                      : "findings"}
                  </span>
                </div>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Vulnerability
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Asset
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Severity
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        CVSS
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Discovered
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {vulnerabilities.map((vulnerability) => {
                      const asset = getAsset(vulnerability.asset_id)

                      return (
                        <tr
                          key={vulnerability.id}
                          className="group border-b border-slate-800/80 transition duration-200 last:border-b-0 hover:bg-slate-800/30"
                        >
                          {/* Vulnerability */}
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-3">
                              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-400/20 bg-red-400/10">
                                <span className="h-2 w-2 rounded-full bg-red-400" />
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-white">
                                  {vulnerability.title}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {vulnerability.cve_id || "No CVE assigned"}
                                </p>

                                <p className="mt-1.5 max-w-sm truncate text-xs text-slate-600">
                                  {vulnerability.description ||
                                    "No description available"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Asset */}
                          <td className="px-6 py-5">
                            <p className="font-medium text-slate-200">
                              {asset?.name ||
                                `Asset #${vulnerability.asset_id}`}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {asset?.hostname ||
                                `Asset ID ${vulnerability.asset_id}`}
                            </p>
                          </td>

                          {/* Severity */}
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getSeverityStyle(
                                vulnerability.severity,
                              )}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />

                              {vulnerability.severity}
                            </span>
                          </td>

                          {/* CVSS */}
                          <td className="px-6 py-5">
                            {vulnerability.cvss_score !== null ? (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-semibold text-white">
                                  {vulnerability.cvss_score.toFixed(1)}
                                </span>

                                <span className="text-[10px] uppercase tracking-wider text-slate-600">
                                  / 10
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-600">
                                Not scored
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${getStatusStyle(
                                vulnerability.status,
                              )}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />

                              {vulnerability.status.replaceAll(
                                "_",
                                " ",
                              )}
                            </span>
                          </td>

                          {/* Discovered */}
                          <td className="whitespace-nowrap px-6 py-5">
                            <p className="text-xs font-medium text-slate-300">
                              {new Date(
                                vulnerability.discovered_at,
                              ).toLocaleDateString()}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(
                                vulnerability.discovered_at,
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

export default Vulnerabilities