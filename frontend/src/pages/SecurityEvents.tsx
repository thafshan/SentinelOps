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

  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] =
    useState<SecurityEvent | null>(null)
  const [selectedEvent, setSelectedEvent] =
    useState<SecurityEvent | null>(null)

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const [assetId, setAssetId] = useState("")
  const [eventType, setEventType] = useState("failed_login")
  const [severity, setSeverity] = useState("medium")
  const [sourceIp, setSourceIp] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState("new")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("")

        const [eventsResponse, assetsResponse] =
          await Promise.all([
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

      case "new":
        return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"

      case "investigating":
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
    setEventType("failed_login")
    setSeverity("medium")
    setSourceIp("")
    setMessage("")
    setStatus("new")
    setShowForm(false)
    setEditingEvent(null)
  }

  const openCreateForm = () => {
    setError("")
    resetForm()
    setShowForm(true)
  }

  const startEditing = (event: SecurityEvent) => {
    setError("")
    setEditingEvent(event)
    setShowForm(false)

    setAssetId(String(event.asset_id))
    setEventType(event.event_type)
    setSeverity(event.severity)
    setSourceIp(event.source_ip || "")
    setMessage(event.message)
    setStatus(event.status)
  }

  const handleCreate = async (
    formEvent: React.FormEvent<HTMLFormElement>,
  ) => {
    formEvent.preventDefault()

    if (!assetId) {
      setError("Please select an asset.")
      return
    }

    if (!message.trim()) {
      setError("Please enter an event message.")
      return
    }

    try {
      setError("")
      setSaving(true)

      const response = await api.post("/security-events/", {
        asset_id: Number(assetId),
        event_type: eventType,
        severity,
        source_ip: sourceIp || null,
        message,
        status,
      })

      setEvents((current) => [
        response.data,
        ...current,
      ])

      resetForm()
    } catch {
      setError("Unable to create security event.")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (
    formEvent: React.FormEvent<HTMLFormElement>,
  ) => {
    formEvent.preventDefault()

    if (!editingEvent) {
      return
    }

    if (!assetId) {
      setError("Please select an asset.")
      return
    }

    if (!message.trim()) {
      setError("Please enter an event message.")
      return
    }

    try {
      setError("")
      setSaving(true)

      const response = await api.put(
        `/security-events/${editingEvent.id}`,
        {
          asset_id: Number(assetId),
          event_type: eventType,
          severity,
          source_ip: sourceIp || null,
          message,
          status,
        },
      )

      setEvents((current) =>
        current.map((event) =>
          event.id === editingEvent.id
            ? response.data
            : event,
        ),
      )

      resetForm()
    } catch {
      setError("Unable to update security event.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (event: SecurityEvent) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Event #${event.id}?`,
    )

    if (!confirmed) {
      return
    }

    try {
      setError("")
      setDeletingId(event.id)

      await api.delete(`/security-events/${event.id}`)

      setEvents((current) =>
        current.filter((item) => item.id !== event.id),
      )

      if (selectedEvent?.id === event.id) {
        setSelectedEvent(null)
      }

      if (editingEvent?.id === event.id) {
        resetForm()
      }
    } catch {
      setError("Unable to delete security event.")
    } finally {
      setDeletingId(null)
    }
  }

  const activeEvents = events.filter(
    (event) =>
      event.status.toLowerCase() !== "resolved",
  ).length

  const criticalHighEvents = events.filter((event) =>
    ["critical", "high"].includes(
      event.severity.toLowerCase(),
    ),
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

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/5 px-3 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />

            <span className="text-xs font-medium uppercase tracking-wider text-red-300">
              Live Events
            </span>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Add Security Event
          </button>
        </div>
      </div>

      {/* Form */}
      {(showForm || editingEvent) && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {editingEvent
                  ? "Edit Security Event"
                  : "Add New Security Event"}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {editingEvent
                  ? `Update Event #${editingEvent.id}.`
                  : "Record a detected security event."}
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
              editingEvent
                ? handleUpdate
                : handleCreate
            }
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Asset */}
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
                    <option
                      key={asset.id}
                      value={asset.id}
                    >
                      {asset.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Event Type
                </label>

                <select
                  value={eventType}
                  onChange={(event) =>
                    setEventType(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                >
                  <option value="failed_login">
                    Failed Login
                  </option>

                  <option value="successful_login">
                    Successful Login
                  </option>

                  <option value="brute_force">
                    Brute Force
                  </option>

                  <option value="suspicious_ip">
                    Suspicious IP
                  </option>

                  <option value="privilege_escalation">
                    Privilege Escalation
                  </option>

                  <option value="malware_detected">
                    Malware Detected
                  </option>

                  <option value="unauthorized_access">
                    Unauthorized Access
                  </option>
                </select>
              </div>

              {/* Severity */}
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
                  <option value="critical">
                    Critical
                  </option>

                  <option value="high">
                    High
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="low">
                    Low
                  </option>
                </select>
              </div>

              {/* Source IP */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Source IP
                </label>

                <input
                  type="text"
                  value={sourceIp}
                  onChange={(event) =>
                    setSourceIp(event.target.value)
                  }
                  placeholder="e.g. 185.220.101.45"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              {/* Status */}
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
                  <option value="new">New</option>

                  <option value="investigating">
                    Investigating
                  </option>

                  <option value="resolved">
                    Resolved
                  </option>
                </select>
              </div>

              {/* Message */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Event Message
                </label>

                <textarea
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  placeholder="Describe the detected security activity..."
                  rows={5}
                  required
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
                  ? editingEvent
                    ? "Saving..."
                    : "Creating..."
                  : editingEvent
                    ? "Save Changes"
                    : "Create Security Event"}
              </button>
            </div>
          </form>
        </div>
      )}

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
                    {events.length} event
                    {events.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left text-sm">
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

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {events.map((event) => {
                      const asset = getAsset(event.asset_id)
                      const severity =
                        event.severity.toLowerCase()

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
                                  {event.event_type.replaceAll(
                                    "_",
                                    " ",
                                  )}
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
                              {asset?.name ||
                                `Asset #${event.asset_id}`}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {asset?.hostname ||
                                `Asset ID ${event.asset_id}`}
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

                              {event.status.replaceAll(
                                "_",
                                " ",
                              )}
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

                          {/* Actions */}
                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedEvent(event)
                                }
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400"
                              >
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  startEditing(event)
                                }
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                disabled={
                                  deletingId === event.id
                                }
                                onClick={() =>
                                  handleDelete(event)
                                }
                                className="rounded-md border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingId === event.id
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
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-cyan-400">
                  Security Event Details
                </p>

                <h3 className="mt-2 text-2xl font-bold capitalize text-white">
                  {selectedEvent.event_type.replaceAll(
                    "_",
                    " ",
                  )}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Event #{selectedEvent.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
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
                  {getAsset(selectedEvent.asset_id)?.name ||
                    `Asset #${selectedEvent.asset_id}`}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Event Type
                </p>

                <p className="mt-1 text-sm capitalize text-white">
                  {selectedEvent.event_type.replaceAll(
                    "_",
                    " ",
                  )}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Severity
                </p>

                <p className="mt-1 text-sm capitalize text-white">
                  {selectedEvent.severity}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Status
                </p>

                <p className="mt-1 text-sm capitalize text-white">
                  {selectedEvent.status.replaceAll(
                    "_",
                    " ",
                  )}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Source IP
                </p>

                <p className="mt-1 font-mono text-sm text-cyan-300">
                  {selectedEvent.source_ip || "Unknown"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Detected
                </p>

                <p className="mt-1 text-sm text-white">
                  {new Date(
                    selectedEvent.detected_at,
                  ).toLocaleString()}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 sm:col-span-2">
                <p className="text-xs text-slate-500">
                  Message
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-300">
                  {selectedEvent.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SecurityEvents
