import type { FC } from 'react'
import { Droplets } from 'lucide-react'
import type { HealthResponse } from '../types/health'

interface NavbarProps {
  health: HealthResponse | null
  loading: boolean
  error: string | null
}

export const Navbar: FC<NavbarProps> = ({ health, loading, error }) => {
  const isHealthy = !loading && !error && health?.status === 'ok'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <Droplets className="h-6 w-6" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight block sm:inline">
              Rainwater AI
            </span>
            <span className="hidden sm:inline text-xs font-medium text-slate-500 ml-2">
              Intelligence & Optimization System
            </span>
            <div className="text-[10px] text-emerald-700 font-mono sm:hidden">
              v1.0.0 · Foundation Active
            </div>
          </div>
        </div>

        {/* Backend Connectivity Status Indicator */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs">
            <span className="flex h-2 w-2 relative">
              {isHealthy ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              )}
            </span>
            <span className="font-medium text-slate-700">
              {loading
                ? 'Connecting...'
                : isHealthy
                ? 'Backend Live'
                : 'Offline / Standalone'}
            </span>
          </div>

          <div className="hidden md:flex items-center text-xs text-slate-500 space-x-1 font-mono">
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              FastAPI v{health?.environment.app_version || '1.0.0'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
