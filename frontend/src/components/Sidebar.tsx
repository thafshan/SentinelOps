import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"

const navigation = [
  {
    name: "Dashboard",
    path: "/",
    icon: "▦",
  },
  {
    name: "Assets",
    path: "/assets",
    icon: "◈",
  },
  {
    name: "Vulnerabilities",
    path: "/vulnerabilities",
    icon: "△",
  },
  {
    name: "Security Events",
    path: "/security-events",
    icon: "◉",
  },
  {
    name: "Incidents",
    path: "/incidents",
    icon: "!",
  },
  {
    name: "Audit Logs",
    path: "/audit-logs",
    icon: "≡",
  },
  {
    name: "Log Processor",
    path: "/log-processor",
    icon: "↯",
  },
]

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    navigate("/login")
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Top Navigation */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-sm font-bold text-cyan-400">
            S
          </div>

          <div>
            <p className="text-sm font-bold text-white">
              SentinelOps
            </p>

            <p className="text-[10px] text-slate-500">
              Security Operations
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-lg text-slate-300 transition hover:border-cyan-500/30 hover:text-cyan-400"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? "×" : "☰"}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="fixed inset-x-0 top-16 z-40 border-b border-slate-800 bg-slate-900 px-3 py-4 shadow-2xl md:hidden">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                      : "border border-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${
                        isActive
                          ? "bg-cyan-500/10 text-cyan-400"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {item.icon}
                    </span>

                    <span>{item.name}</span>

                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-3 text-left text-sm font-medium text-slate-400 transition hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800">
              →
            </span>

            Sign out
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900 md:flex">
        <div className="border-b border-slate-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-lg font-bold text-cyan-400">
              S
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                SentinelOps
              </h1>

              <p className="mt-0.5 text-[11px] text-slate-500">
                Security Operations
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 pt-6">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Operations
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-3">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                    : "border border-transparent text-slate-400 hover:bg-slate-800/70 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-md text-sm transition ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "bg-slate-800 text-slate-500 group-hover:text-slate-300"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span>{item.name}</span>

                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="group w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-left transition hover:border-red-500/20 hover:bg-red-500/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-semibold text-cyan-400">
                A
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-white">
                  Analyst
                </p>

                <p className="truncate text-xs text-slate-500 group-hover:text-red-400">
                  Sign out
                </p>
              </div>

              <span className="ml-auto text-xs text-slate-600 transition group-hover:text-red-400">
                →
              </span>
            </div>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
