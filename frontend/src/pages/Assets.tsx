import { useEffect, useState } from "react"
import api from "../api"

interface Asset {
  id: number
  name: string
  hostname: string | null
  ip_address: string | null
  asset_type: string
  operating_system: string | null
  environment: string
  criticality: string
  status: string
  owner_id: number | null
  description: string | null
  created_at: string
  updated_at: string
}

function Assets() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [deletingAssetId, setDeletingAssetId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState("")
  const [hostname, setHostname] = useState("")
  const [ipAddress, setIpAddress] = useState("")
  const [assetType, setAssetType] = useState("server")
  const [operatingSystem, setOperatingSystem] = useState("")
  const [environment, setEnvironment] = useState("development")
  const [criticality, setCriticality] = useState("medium")
  const [status, setStatus] = useState("active")
  const [description, setDescription] = useState("")

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setError("")

        const response = await api.get("/assets/")
        setAssets(response.data)
      } catch {
        setError("Unable to load assets.")
      } finally {
        setLoading(false)
      }
    }

    fetchAssets()
  }, [])

  const handleCreateAsset = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    try {
      setError("")
      setSaving(true)

      const response = await api.post("/assets/", {
        name,
        hostname: hostname || null,
        ip_address: ipAddress || null,
        asset_type: assetType,
        operating_system: operatingSystem || null,
        environment,
        criticality,
        status,
        owner_id: null,
        description: description || null,
      })

      setAssets((currentAssets) => [
        response.data,
        ...currentAssets,
      ])

      resetForm()
    } catch {
      setError("Unable to create asset.")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateAsset = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!editingAsset) {
      return
    }

    try {
      setError("")
      setSaving(true)

      const response = await api.put(
        `/assets/${editingAsset.id}`,
        {
          name,
          hostname: hostname || null,
          ip_address: ipAddress || null,
          asset_type: assetType,
          operating_system: operatingSystem || null,
          environment,
          criticality,
          status,
          owner_id: editingAsset.owner_id,
          description: description || null,
        },
      )

      setAssets((currentAssets) =>
        currentAssets.map((asset) =>
          asset.id === editingAsset.id
            ? response.data
            : asset,
        ),
      )

      setEditingAsset(null)
      resetForm()
    } catch {
      setError("Unable to update asset.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAsset = async (asset: Asset) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${asset.name}"?`,
    )

    if (!confirmed) {
      return
    }

    try {
      setError("")
      setDeletingAssetId(asset.id)

      await api.delete(`/assets/${asset.id}`)

      setAssets((currentAssets) =>
        currentAssets.filter(
          (currentAsset) => currentAsset.id !== asset.id,
        ),
      )

      if (selectedAsset?.id === asset.id) {
        setSelectedAsset(null)
      }

      if (editingAsset?.id === asset.id) {
        setEditingAsset(null)
        resetForm()
      }
    } catch {
      setError("Unable to delete asset.")
    } finally {
      setDeletingAssetId(null)
    }
  }

  const startEditing = (asset: Asset) => {
    setError("")
    setEditingAsset(asset)
    setShowForm(false)

    setName(asset.name)
    setHostname(asset.hostname || "")
    setIpAddress(asset.ip_address || "")
    setAssetType(asset.asset_type)
    setOperatingSystem(asset.operating_system || "")
    setEnvironment(asset.environment)
    setCriticality(asset.criticality)
    setStatus(asset.status)
    setDescription(asset.description || "")
  }

  const openCreateForm = () => {
    setError("")
    setEditingAsset(null)

    setName("")
    setHostname("")
    setIpAddress("")
    setAssetType("server")
    setOperatingSystem("")
    setEnvironment("development")
    setCriticality("medium")
    setStatus("active")
    setDescription("")

    setShowForm(true)
  }

  const resetForm = () => {
    setName("")
    setHostname("")
    setIpAddress("")
    setAssetType("server")
    setOperatingSystem("")
    setEnvironment("development")
    setCriticality("medium")
    setStatus("active")
    setDescription("")
    setShowForm(false)
    setEditingAsset(null)
  }

  const formatAssetType = (value: string) => {
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase())
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Assets
          </h2>

          <p className="mt-2 text-slate-400">
            Manage and monitor infrastructure assets.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Add Asset
        </button>
      </div>

      {(showForm || editingAsset) && (
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {editingAsset ? "Edit Asset" : "Add New Asset"}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {editingAsset
                  ? `Update ${editingAsset.name}.`
                  : "Register a new infrastructure asset."}
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
              editingAsset
                ? handleUpdateAsset
                : handleCreateAsset
            }
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Asset Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Production Web Server"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Hostname
                </label>

                <input
                  type="text"
                  value={hostname}
                  onChange={(event) => setHostname(event.target.value)}
                  placeholder="e.g. web-server-01"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  IP Address
                </label>

                <input
                  type="text"
                  value={ipAddress}
                  onChange={(event) => setIpAddress(event.target.value)}
                  placeholder="e.g. 192.168.1.10"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Asset Type
                </label>

                <select
                  value={assetType}
                  onChange={(event) => setAssetType(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                >
                  <option value="server">Server</option>
                  <option value="workstation">Workstation</option>
                  <option value="laptop">Laptop</option>
                  <option value="network_device">Network Device</option>
                  <option value="database">Database</option>
                  <option value="application">Application</option>
                  <option value="cloud">Cloud</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Operating System
                </label>

                <input
                  type="text"
                  value={operatingSystem}
                  onChange={(event) =>
                    setOperatingSystem(event.target.value)
                  }
                  placeholder="e.g. Ubuntu 24.04"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Environment
                </label>

                <select
                  value={environment}
                  onChange={(event) => setEnvironment(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                  <option value="testing">Testing</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Criticality
                </label>

                <select
                  value={criticality}
                  onChange={(event) => setCriticality(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="decommissioned">Decommissioned</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add a description for this asset..."
                  rows={4}
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
                  ? editingAsset
                    ? "Saving..."
                    : "Creating..."
                  : editingAsset
                    ? "Save Changes"
                    : "Create Asset"}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        {loading && (
          <div className="p-6 text-slate-400">
            Loading assets...
          </div>
        )}

        {!loading && !error && assets.length === 0 && (
          <div className="p-6 text-slate-400">
            No assets found.
          </div>
        )}

        {!loading && assets.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-950">
                <tr>
                  <th className="px-6 py-4 font-medium text-slate-400">
                    Asset
                  </th>

                  <th className="px-6 py-4 font-medium text-slate-400">
                    IP Address
                  </th>

                  <th className="px-6 py-4 font-medium text-slate-400">
                    Type
                  </th>

                  <th className="px-6 py-4 font-medium text-slate-400">
                    Environment
                  </th>

                  <th className="px-6 py-4 font-medium text-slate-400">
                    Criticality
                  </th>

                  <th className="px-6 py-4 font-medium text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right font-medium text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="border-b border-slate-800 transition hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-5">
                      <p className="font-medium text-white">
                        {asset.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {asset.hostname || "No hostname"}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {asset.ip_address || "—"}
                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {formatAssetType(asset.asset_type)}
                    </td>

                    <td className="px-6 py-5 capitalize text-slate-300">
                      {asset.environment}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          asset.criticality === "critical"
                            ? "bg-red-500/10 text-red-400"
                            : asset.criticality === "high"
                              ? "bg-orange-500/10 text-orange-400"
                              : asset.criticality === "medium"
                                ? "bg-yellow-500/10 text-yellow-400"
                                : "bg-green-500/10 text-green-400"
                        }`}
                      >
                        {asset.criticality}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          asset.status === "active"
                            ? "bg-green-500/10 text-green-400"
                            : asset.status === "maintenance"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : asset.status === "inactive"
                                ? "bg-slate-500/10 text-slate-400"
                                : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {asset.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedAsset(asset)}
                          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => startEditing(asset)}
                          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={deletingAssetId === asset.id}
                          onClick={() => handleDeleteAsset(asset)}
                          className="rounded-md border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingAssetId === asset.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
                  Asset Details
                </p>

                <h3 className="mt-2 text-2xl font-bold text-white">
                  {selectedAsset.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Asset ID #{selectedAsset.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">Hostname</p>
                <p className="mt-1 text-sm text-white">
                  {selectedAsset.hostname || "—"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">IP Address</p>
                <p className="mt-1 text-sm text-white">
                  {selectedAsset.ip_address || "—"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">Asset Type</p>
                <p className="mt-1 text-sm text-white">
                  {formatAssetType(selectedAsset.asset_type)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">Operating System</p>
                <p className="mt-1 text-sm text-white">
                  {selectedAsset.operating_system || "—"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">Environment</p>
                <p className="mt-1 text-sm capitalize text-white">
                  {selectedAsset.environment}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">Criticality</p>
                <p className="mt-1 text-sm capitalize text-white">
                  {selectedAsset.criticality}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">Status</p>
                <p className="mt-1 text-sm capitalize text-white">
                  {selectedAsset.status}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">Owner ID</p>
                <p className="mt-1 text-sm text-white">
                  {selectedAsset.owner_id ?? "Unassigned"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 sm:col-span-2">
                <p className="text-xs text-slate-500">Description</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  {selectedAsset.description ||
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

export default Assets
