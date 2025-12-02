import * as React from "react"
import { Link, useLocation } from "@tanstack/react-router"

const navItems = [
  { path: "/", label: "Learn", icon: "BookOpen" },
  { path: "/datasets", label: "Datasets", icon: "Database" },
  { path: "/models", label: "Models", icon: "Cpu" },
  { path: "/train", label: "Train", icon: "Zap" },
  { path: "/dashboard", label: "Dashboard", icon: "BarChart" },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center font-bold text-black">
              G
            </div>
            <span className="text-xl font-semibold tracking-tight">GenX</span>
          </Link>
          <nav className="flex gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
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
}: {
  title: string
  subtitle?: string
  step?: number
  totalSteps?: number
}) {
  return (
    <div className="border-b border-white/10 px-6 py-8 bg-gradient-to-b from-white/5 to-transparent">
      <div className="max-w-7xl mx-auto">
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
