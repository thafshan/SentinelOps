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

        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500">
          Add Asset
        </button>
      </div>

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