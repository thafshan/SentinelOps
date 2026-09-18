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

  const [showForm, setShowForm] = useState(false)
  const [editingVulnerability, setEditingVulnerability] =
    useState<Vulnerability | null>(null)
  const [selectedVulnerability, setSelectedVulnerability] =
    useState<Vulnerability | null>(null)

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const [assetId, setAssetId] = useState("")
  const [cveId, setCveId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState("medium")
  const [cvssScore, setCvssScore] = useState("")
  const [status, setStatus] = useState("open")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("")

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

  const getSeverityStyle = (value: string) => {
    switch (value.toLowerCase()) {
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

  const getStatusStyle = (value: string) => {
    switch (value.toLowerCase()) {
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

  const getAsset = (id: number) => {
    return assets.find((asset) => asset.id === id)
  }

  const resetForm = () => {
    setAssetId("")
    setCveId("")
    setTitle("")
    setDescription("")
    setSeverity("medium")
    setCvssScore("")
    setStatus("open")
    setShowForm(false)
    setEditingVulnerability(null)
  }

  const openCreateForm = () => {
    setError("")
    resetForm()
    setShowForm(true)
  }

  const startEditing = (vulnerability: Vulnerability) => {
    setError("")
    setEditingVulnerability(vulnerability)
    setShowForm(false)

    setAssetId(String(vulnerability.asset_id))
    setCveId(vulnerability.cve_id || "")
    setTitle(vulnerability.title)
    setDescription(vulnerability.description || "")
    setSeverity(vulnerability.severity)
    setCvssScore(
      vulnerability.cvss_score !== null
        ? String(vulnerability.cvss_score)
        : "",
    )
    setStatus(vulnerability.status)
  }

  const handleCreate = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!assetId) {
      setError("Please select an asset.")
      return
    }

    try {
      setError("")
      setSaving(true)

      const response = await api.post("/vulnerabilities/", {
        asset_id: Number(assetId),
        cve_id: cveId || null,
        title,
        description: description || null,
        severity,
        cvss_score: cvssScore ? Number(cvssScore) : null,
        status,
      })

      setVulnerabilities((current) => [
        response.data,
        ...current,
      ])

      resetForm()
    } catch {
      setError("Unable to create vulnerability.")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!editingVulnerability) {
      return
    }

    if (!assetId) {
      setError("Please select an asset.")
      return
    }

    try {
      setError("")
      setSaving(true)

      const response = await api.put(
        `/vulnerabilities/${editingVulnerability.id}`,
        {
          asset_id: Number(assetId),
          cve_id: cveId || null,
          title,
          description: description || null,
          severity,
          cvss_score: cvssScore ? Number(cvssScore) : null,
          status,
        },
      )

      setVulnerabilities((current) =>
        current.map((vulnerability) =>
          vulnerability.id === editingVulnerability.id
            ? response.data
            : vulnerability,
        ),
      )

      resetForm()
    } catch {
      setError("Unable to update vulnerability.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (
    vulnerability: Vulnerability,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${vulnerability.title}"?`,
    )

    if (!confirmed) {
      return
    }

    try {
      setError("")
      setDeletingId(vulnerability.id)

      await api.delete(
        `/vulnerabilities/${vulnerability.id}`,
      )

      setVulnerabilities((current) =>
        current.filter(
          (item) => item.id !== vulnerability.id,
        ),
      )

      if (
        selectedVulnerability?.id === vulnerability.id
      ) {
        setSelectedVulnerability(null)
      }

      if (
        editingVulnerability?.id === vulnerability.id
      ) {
        resetForm()
      }
    } catch {
      setError("Unable to delete vulnerability.")
    } finally {
      setDeletingId(null)
    }
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

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/5 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" />

            <span className="text-xs font-medium uppercase tracking-wider text-red-300">
              Vulnerability Management
            </span>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Add Vulnerability
          </button>
        </div>
      </div>

      {/* Form */}
      {(showForm || editingVulnerability) && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {editingVulnerability
                  ? "Edit Vulnerability"
                  : "Add New Vulnerability"}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {editingVulnerability
                  ? `Update ${editingVulnerability.title}.`
                  : "Record a new security finding."}
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          <form
            className="mt-6"
            onSubmit={
              editingVulnerability
                ? handleUpdate
                : handleCreate
            }
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Asset
                </label>

                <select
                  value={assetId}
                  onChange={(event) =>
                    setAssetId(event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                >
                  <option value="">Select an asset</option>

                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  CVE ID
                </label>

                <input
                  type="text"
                  value={cveId}
                  onChange={(event) =>
                    setCveId(event.target.value)
                  }
                  placeholder="e.g. CVE-2026-12345"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Remote Code Execution in Web Application"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Severity
                </label>

                <select
                  value={severity}
                  onChange={(event) =>
                    setSeverity(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  CVSS Score
                </label>

                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={cvssScore}
                  onChange={(event) =>
                    setCvssScore(event.target.value)
                  }
                  placeholder="e.g. 9.8"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">
                    In Progress
                  </option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe the vulnerability and its potential impact..."
                  rows={5}
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-6">
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? editingVulnerability
                    ? "Saving..."
                    : "Creating..."
                  : editingVulnerability
                    ? "Save Changes"
                    : "Create Vulnerability"}
              </button>
            </div>
          </form>
        </div>
      )}

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

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left text-sm">
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

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {vulnerabilities.map((vulnerability) => {
                      const asset = getAsset(
                        vulnerability.asset_id,
                      )

                      return (
                        <tr
                          key={vulnerability.id}
                          className="group border-b border-slate-800/80 transition duration-200 last:border-b-0 hover:bg-slate-800/30"
                        >
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
                                  {vulnerability.cve_id ||
                                    "No CVE assigned"}
                                </p>

                                <p className="mt-1.5 max-w-sm truncate text-xs text-slate-600">
                                  {vulnerability.description ||
                                    "No description available"}
                                </p>
                              </div>
                            </div>
                          </td>

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

                          <td className="px-6 py-5">
                            {vulnerability.cvss_score !== null ? (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-semibold text-white">
                                  {vulnerability.cvss_score.toFixed(
                                    1,
                                  )}
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

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedVulnerability(
                                    vulnerability,
                                  )
                                }
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400"
                              >
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  startEditing(vulnerability)
                                }
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                disabled={
                                  deletingId ===
                                  vulnerability.id
                                }
                                onClick={() =>
                                  handleDelete(vulnerability)
                                }
                                className="rounded-md border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingId ===
                                vulnerability.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
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

      {/* View Modal */}
      {selectedVulnerability && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-red-400">
                  Vulnerability Details
                </p>

                <h3 className="mt-2 text-2xl font-bold text-white">
                  {selectedVulnerability.title}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Finding #{selectedVulnerability.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedVulnerability(null)
                }
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Asset
                </p>

                <p className="mt-1 text-sm text-white">
                  {getAsset(
                    selectedVulnerability.asset_id,
                  )?.name ||
                    `Asset #${selectedVulnerability.asset_id}`}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  CVE ID
                </p>

                <p className="mt-1 text-sm text-white">
                  {selectedVulnerability.cve_id || "—"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Severity
                </p>

                <p className="mt-1 text-sm capitalize text-white">
                  {selectedVulnerability.severity}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  CVSS Score
                </p>

                <p className="mt-1 text-sm text-white">
                  {selectedVulnerability.cvss_score !== null
                    ? `${selectedVulnerability.cvss_score.toFixed(
                        1,
                      )} / 10`
                    : "Not scored"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Status
                </p>

                <p className="mt-1 text-sm capitalize text-white">
                  {selectedVulnerability.status.replaceAll(
                    "_",
                    " ",
                  )}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Discovered
                </p>

                <p className="mt-1 text-sm text-white">
                  {new Date(
                    selectedVulnerability.discovered_at,
                  ).toLocaleString()}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 sm:col-span-2">
                <p className="text-xs text-slate-500">
                  Description
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-300">
                  {selectedVulnerability.description ||
                    "No description provided."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Vulnerabilities