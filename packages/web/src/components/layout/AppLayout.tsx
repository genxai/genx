import * as React from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { authClient } from "@/lib/auth-client"

// Main navigation sections
const navSections = [
  { path: "/", label: "Learn" },
  { path: "/research", label: "Research" },
  { path: "/models", label: "Models" },
  { path: "/infra", label: "Infra" },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [user, setUser] = React.useState<{ email?: string } | null>(null)

  React.useEffect(() => {
    authClient.getSession().then(({ data }) => {
      setUser(data?.user || null)
    })
  }, [])

  const handleSignOut = async () => {
    await authClient.signOut()
    setUser(null)
  }

  // Determine active section
  const activeSection = navSections.find((s) =>
    s.path === "/" ? location.pathname === "/" : location.pathname.startsWith(s.path)
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center font-bold text-black">
                G
              </div>
              <span className="text-xl font-semibold tracking-tight">GenX</span>
            </Link>
            <nav className="flex gap-1">
              {navSections.map((item) => {
                const isActive = activeSection?.path === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white text-black"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-white/50">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 text-sm text-white/70 hover:text-white"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  step,
  totalSteps,
  action,
}: {
  title: string
  subtitle?: string
  step?: number
  totalSteps?: number
  action?: React.ReactNode
}) {
  return (
    <div className="border-b border-white/10 px-6 py-8 bg-gradient-to-b from-white/5 to-transparent">
      <div className="max-w-7xl mx-auto flex items-start justify-between">
        <div>
          {step && totalSteps && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-cyan-400 font-mono">
                Step {step} of {totalSteps}
              </span>
              <div className="flex-1 max-w-xs h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-white/60 mt-2">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}

export function Card({
  children,
  className = "",
  onClick,
  selected,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  selected?: boolean
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/5 rounded-xl border transition-all ${
        selected
          ? "border-cyan-400 bg-cyan-400/10"
          : "border-white/10 hover:border-white/20"
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  )
}

export function InfoBox({
  title,
  children,
  variant = "info",
}: {
  title: string
  children: React.ReactNode
  variant?: "info" | "warning" | "success"
}) {
  const colors = {
    info: "border-cyan-500/30 bg-cyan-500/10",
    warning: "border-yellow-500/30 bg-yellow-500/10",
    success: "border-green-500/30 bg-green-500/10",
  }

  return (
    <div className={`rounded-lg border p-4 ${colors[variant]}`}>
      <h4 className="font-semibold mb-2">{title}</h4>
      <div className="text-sm text-white/70">{children}</div>
    </div>
  )
}

// Auth guard component
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true)
  const [authenticated, setAuthenticated] = React.useState(false)

  React.useEffect(() => {
    authClient.getSession().then(({ data }) => {
      setAuthenticated(!!data?.session)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-6">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Sign in required</h2>
        <p className="text-white/60 mb-6">
          You need to sign in to access the infrastructure section.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90"
        >
          Sign in
        </Link>
      </div>
    )
  }

  return <>{children}</>
}
