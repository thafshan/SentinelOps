import { useEffect, useState } from "react"
import api from "../api"

interface Incident {
  id: number
  asset_id: number
  event_id: number | null
  assigned_to: number | null
  title: string
  description: string | null
  severity: string
  priority: string
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

interface SecurityEvent {
  id: number
  asset_id: number
  event_type: string
  severity: string
  status: string
}

interface User {
  id: number
  full_name: string
  email: string
}

function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [users, setUsers] = useState<User[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [editingIncident, setEditingIncident] =
    useState<Incident | null>(null)
  const [selectedIncident, setSelectedIncident] =
    useState<Incident | null>(null)

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const [assetId, setAssetId] = useState("")
  const [eventId, setEventId] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState("medium")
  const [priority, setPriority] = useState("medium")
  const [status, setStatus] = useState("open")

  useEffect(() => {
    const fetchData = async () => {
      setError("")

      try {
        const response = await api.get("/incidents/")
        setIncidents(response.data)
      } catch {
        setError("Unable to load incidents.")
      }

      try {
        const response = await api.get("/assets/")
        setAssets(response.data)
      } catch {
        setError((current) =>
          current
            ? `${current} Unable to load assets.`
            : "Unable to load assets.",
        )
      }

      try {
        const response = await api.get("/security-events/")
        setSecurityEvents(response.data)
      } catch {
        setError((current) =>
          current
            ? `${current} Unable to load security events.`
            : "Unable to load security events.",
        )
      }

      try {
        const response = await api.get("/auth/users")
        setUsers(response.data)
      } catch {
        // Users endpoint will be added separately.
        setUsers([])
      }

      setLoading(false)
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

  const getPriorityStyle = (value: string) => {
    switch (value.toLowerCase()) {
      case "critical":
      case "urgent":
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

      case "investigating":
      case "in_progress":
        return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300"

      default:
        return "border-slate-700 bg-slate-800 text-slate-400"
    }
  }

  const getAsset = (id: number) => {
    return assets.find((asset) => asset.id === id)
  }

  const getUser = (id: number | null) => {
    if (id === null) {
      return undefined
    }

    return users.find((user) => user.id === id)
  }

  const resetForm = () => {
    setAssetId("")
    setEventId("")
    setAssignedTo("")
    setTitle("")
    setDescription("")
    setSeverity("medium")
    setPriority("medium")
    setStatus("open")
    setShowForm(false)
    setEditingIncident(null)
  }

  const openCreateForm = () => {
    setError("")
    resetForm()
    setShowForm(true)
  }

  const startEditing = (incident: Incident) => {
    setError("")
    setEditingIncident(incident)
    setShowForm(false)

    setAssetId(String(incident.asset_id))

    setEventId(
      incident.event_id !== null
        ? String(incident.event_id)
        : "",
    )

    setAssignedTo(
      incident.assigned_to !== null
        ? String(incident.assigned_to)
        : "",
    )

    setTitle(incident.title)
    setDescription(incident.description || "")
    setSeverity(incident.severity)
    setPriority(incident.priority)
    setStatus(incident.status)
  }

  const handleCreate = async (
    formEvent: React.FormEvent<HTMLFormElement>,
  ) => {
    formEvent.preventDefault()

    if (!assetId) {
      setError("Please select an asset.")
      return
    }

    if (!title.trim()) {
      setError("Please enter an incident title.")
      return
    }

    if (!description.trim()) {
      setError("Please enter an incident description.")
      return
    }

    try {
      setError("")
      setSaving(true)

      const response = await api.post("/incidents/", {
        asset_id: Number(assetId),
        event_id: eventId ? Number(eventId) : null,
        assigned_to: assignedTo
          ? Number(assignedTo)
          : null,
        title,
        description,
        severity,
        priority,
        status,
      })

      setIncidents((current) => [
        response.data,
        ...current,
      ])

      resetForm()
    } catch {
      setError("Unable to create incident.")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (
    formEvent: React.FormEvent<HTMLFormElement>,
  ) => {
    formEvent.preventDefault()

    if (!editingIncident) {
      return
    }

    if (!assetId) {
      setError("Please select an asset.")
      return
    }

    if (!title.trim()) {
      setError("Please enter an incident title.")
      return
    }

    if (!description.trim()) {
      setError("Please enter an incident description.")
      return
    }

    try {
      setError("")
      setSaving(true)

      const response = await api.put(
        `/incidents/${editingIncident.id}`,
        {
          asset_id: Number(assetId),
          event_id: eventId ? Number(eventId) : null,
          assigned_to: assignedTo
            ? Number(assignedTo)
            : null,
          title,
          description,
          severity,
          priority,
          status,
        },
      )

      setIncidents((current) =>
        current.map((incident) =>
          incident.id === editingIncident.id
            ? response.data
            : incident,
        ),
      )

      resetForm()
    } catch {
      setError("Unable to update incident.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (incident: Incident) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${incident.title}"?`,
    )

    if (!confirmed) {
      return
    }

    try {
      setError("")
      setDeletingId(incident.id)

      await api.delete(`/incidents/${incident.id}`)

      setIncidents((current) =>
        current.filter(
          (item) => item.id !== incident.id,
        ),
      )

      if (selectedIncident?.id === incident.id) {
        setSelectedIncident(null)
      }

      if (editingIncident?.id === incident.id) {
        resetForm()
      }
    } catch {
      setError("Unable to delete incident.")
    } finally {
      setDeletingId(null)
    }
  }

  const activeIncidents = incidents.filter(
    (incident) =>
      incident.status.toLowerCase() !== "resolved",
  ).length

  const criticalHighIncidents = incidents.filter((incident) =>
    ["critical", "high"].includes(
      incident.severity.toLowerCase(),
    ),
  ).length

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-yellow-400" />

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Incidents
              </h2>

              <p className="mt-2 text-sm text-slate-400 sm:text-base">
                Investigate and manage security incidents across your
                infrastructure.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/5 px-3 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />

            <span className="text-xs font-medium uppercase tracking-wider text-yellow-300">
              Incident Response
            </span>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Add Incident
          </button>
        </div>
      </div>

      {/* Form */}
      {(showForm || editingIncident) && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {editingIncident
                  ? "Edit Incident"
                  : "Add New Incident"}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {editingIncident
                  ? `Update ${editingIncident.title}.`
                  : "Record a security incident requiring investigation."}
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
              editingIncident
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

              {/* Security Event */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Related Security Event
                </label>

                <select
                  value={eventId}
                  onChange={(event) =>
                    setEventId(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                >
                  <option value="">
                    No related event
                  </option>

                  {securityEvents.map((event) => (
                    <option
                      key={event.id}
                      value={event.id}
                    >
                      #{event.id} —{" "}
                      {event.event_type.replaceAll(
                        "_",
                        " ",
                      )}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Incident Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Production API Account Compromise"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
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

              {/* Priority */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                >
                  <option value="urgent">
                    Urgent
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
                  <option value="open">Open</option>

                  <option value="investigating">
                    Investigating
                  </option>

                  <option value="in_progress">
                    In Progress
                  </option>

                  <option value="resolved">
                    Resolved
                  </option>
                </select>
              </div>

              {/* Assigned To */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Assigned To
                </label>

                <select
                  value={assignedTo}
                  onChange={(event) =>
                    setAssignedTo(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                >
                  <option value="">
                    Unassigned
                  </option>

                  {users.map((user) => (
                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {user.full_name} — {user.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe the incident, affected systems, and observed impact..."
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
                  ? editingIncident
                    ? "Saving..."
                    : "Creating..."
                  : editingIncident
                    ? "Save Changes"
                    : "Create Incident"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-cyan-400/20 bg-slate-900 p-5 transition duration-300 hover:border-cyan-400/40">
          <p className="text-sm font-medium text-slate-400">
            Total Incidents
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {incidents.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Recorded security incidents
          </p>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-slate-900 p-5 transition duration-300 hover:border-red-500/40">
          <p className="text-sm font-medium text-slate-400">
            Active Incidents
          </p>

          <p className="mt-2 text-3xl font-bold text-red-400">
            {activeIncidents}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                activeIncidents > 0
                  ? "animate-pulse bg-red-400"
                  : "bg-green-400"
              }`}
            />

            <p className="text-xs text-slate-500">
              {activeIncidents > 0
                ? "Requires investigation"
                : "No active incidents"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-yellow-400/20 bg-slate-900 p-5 transition duration-300 hover:border-yellow-400/40">
          <p className="text-sm font-medium text-slate-400">
            Critical / High
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-300">
            {criticalHighIncidents}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Higher-severity incidents
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

            <p className="text-sm text-slate-400">
              Loading incidents...
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

      {/* Incidents */}
      {!loading && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {incidents.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-green-400/20 bg-green-400/10">
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>

              <p className="mt-4 font-medium text-white">
                No security incidents
              </p>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                Your monitored environment currently has no recorded
                security incidents requiring investigation.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-950/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Incident Queue
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Security incidents currently recorded by SentinelOps
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />

                  <span className="text-xs font-medium text-slate-400">
                    {incidents.length}{" "}
                    {incidents.length === 1
                      ? "incident"
                      : "incidents"}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px] text-left text-sm">
                  <thead className="border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Incident
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Asset
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Severity
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Priority
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Assigned
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
                    {incidents.map((incident) => {
                      const asset = getAsset(incident.asset_id)
                      const assignedUser = getUser(
                        incident.assigned_to,
                      )

                      return (
                        <tr
                          key={incident.id}
                          className="group border-b border-slate-800/80 transition duration-200 last:border-b-0 hover:bg-slate-800/30"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-3">
                              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-yellow-400/20 bg-yellow-400/10">
                                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-white">
                                  {incident.title}
                                </p>

                                <p className="mt-1 max-w-sm truncate text-xs text-slate-500">
                                  {incident.description ||
                                    "No description available"}
                                </p>

                                <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-600">
                                  Incident #{incident.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <p className="font-medium text-slate-200">
                              {asset?.name ||
                                `Asset #${incident.asset_id}`}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {asset?.hostname ||
                                `Asset ID ${incident.asset_id}`}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getSeverityStyle(
                                incident.severity,
                              )}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {incident.severity}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getPriorityStyle(
                                incident.priority,
                              )}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {incident.priority}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${getStatusStyle(
                                incident.status,
                              )}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />

                              {incident.status.replaceAll(
                                "_",
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <p className="text-sm text-slate-300">
                              {assignedUser?.full_name ||
                                "Unassigned"}
                            </p>

                            {assignedUser && (
                              <p className="mt-1 text-xs text-slate-500">
                                {assignedUser.email}
                              </p>
                            )}
                          </td>

                          <td className="whitespace-nowrap px-6 py-5">
                            <p className="text-xs font-medium text-slate-300">
                              {new Date(
                                incident.detected_at,
                              ).toLocaleDateString()}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(
                                incident.detected_at,
                              ).toLocaleTimeString()}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedIncident(
                                    incident,
                                  )
                                }
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400"
                              >
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  startEditing(incident)
                                }
                                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                disabled={
                                  deletingId === incident.id
                                }
                                onClick={() =>
                                  handleDelete(incident)
                                }
                                className="rounded-md border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingId === incident.id
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
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-yellow-400">
                  Incident Details
                </p>

                <h3 className="mt-2 text-2xl font-bold text-white">
                  {selectedIncident.title}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Incident #{selectedIncident.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedIncident(null)
                }
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">Asset</p>

                <p className="mt-1 text-sm text-white">
                  {getAsset(
                    selectedIncident.asset_id,
                  )?.name ||
                    `Asset #${selectedIncident.asset_id}`}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Related Security Event
                </p>

                <p className="mt-1 text-sm capitalize text-white">
                  {selectedIncident.event_id !== null
                    ? `Event #${selectedIncident.event_id}`
                    : "No related event"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Severity
                </p>

                <p className="mt-1 text-sm capitalize text-white">
                  {selectedIncident.severity}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Priority
                </p>

                <p className="mt-1 text-sm capitalize text-white">
                  {selectedIncident.priority}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Status
                </p>

                <p className="mt-1 text-sm capitalize text-white">
                  {selectedIncident.status.replaceAll(
                    "_",
                    " ",
                  )}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Assigned To
                </p>

                <p className="mt-1 text-sm text-white">
                  {getUser(
                    selectedIncident.assigned_to,
                  )?.full_name || "Unassigned"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Detected
                </p>

                <p className="mt-1 text-sm text-white">
                  {new Date(
                    selectedIncident.detected_at,
                  ).toLocaleString()}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Resolved
                </p>

                <p className="mt-1 text-sm text-white">
                  {selectedIncident.resolved_at
                    ? new Date(
                        selectedIncident.resolved_at,
                      ).toLocaleString()
                    : "Not resolved"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 sm:col-span-2">
                <p className="text-xs text-slate-500">
                  Description
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-300">
                  {selectedIncident.description ||
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

export default Incidents
