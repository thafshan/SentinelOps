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
  }
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
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Assets
          </h2>

          <p className="mt-2 text-slate-400">
            Manage and monitor infrastructure assets.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Add Asset
        </button>
      </div>

      {showForm && (
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">
                Add New Asset
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Register a new infrastructure asset.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <form className="mt-6"
                onSubmit={handleCreateAsset}>
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
                  onChange={(event) => setOperatingSystem(event.target.value)}
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
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
              >
                Create Asset
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        {loading && (
          <div className="p-6 text-slate-400">
            Loading assets...
          </div>
        )}

        {error && (
          <div className="p-6 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && assets.length === 0 && (
          <div className="p-6 text-slate-400">
            No assets found.
          </div>
        )}

        {!loading && !error && assets.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
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
                </tr>
              </thead>

              <tbody>
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="border-b border-slate-800"
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

                    <td className="px-6 py-5 capitalize text-slate-300">
                      {asset.asset_type}
                    </td>

                    <td className="px-6 py-5 capitalize text-slate-300">
                      {asset.environment}
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium capitalize text-red-400">
                        {asset.criticality}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium capitalize text-green-400">
                        {asset.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Assets
