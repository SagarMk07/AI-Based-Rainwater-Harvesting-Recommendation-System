import React, { useState } from 'react'
import {
  Droplets,
  Cpu,
  Menu,
  X,
  Compass,
  History as HistoryIcon,
  Calculator,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react'
import type { HealthResponse } from '../types/health'

export type NavTab = 'dashboard' | 'wizard' | 'results' | 'history' | 'about'

interface NavbarProps {
  health: HealthResponse | null
  loading: boolean
  error: string | null
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
  onOpenTelemetry: () => void
  historyCount: number
  hasResult: boolean
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  loading,
  error,
  activeTab,
  onTabChange,
  onOpenTelemetry,
  historyCount,
  hasResult,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isHealthy = !loading && !error && health?.status === 'ok'

  const handleNavClick = (tab: NavTab) => {
    onTabChange(tab)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-700 text-white shadow-sm group-hover:bg-forest-800 transition-colors">
            <Droplets className="h-5 w-5 text-water-200" />
          </div>
          <div>
            <span className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              RainHarvest <span className="text-forest-700">AI</span>
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block -mt-0.5">
              Hydrological Intelligence
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-semibold">
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-slate-100 text-forest-900 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 text-slate-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleNavClick('wizard')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'wizard'
                ? 'bg-forest-50 text-forest-800 border border-forest-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calculator className="h-4 w-4 text-forest-600" />
            <span>Analyze Property</span>
          </button>

          {hasResult && (
            <button
              onClick={() => handleNavClick('results')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'results'
                  ? 'bg-water-50 text-water-800 border border-water-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="h-4 w-4 text-water-600" />
              <span>Current Results</span>
              <span className="h-1.5 w-1.5 rounded-full bg-forest-500 animate-pulse"></span>
            </button>
          )}

          <button
            onClick={() => handleNavClick('history')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-slate-100 text-forest-900 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HistoryIcon className="h-4 w-4 text-slate-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="ml-1 bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavClick('about')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'about'
                ? 'bg-slate-100 text-forest-900 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <span>About</span>
          </button>
        </nav>

        {/* Right Action & Status Area */}
        <div className="hidden lg:flex items-center space-x-3">
          <button
            onClick={onOpenTelemetry}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-subtle flex items-center space-x-1.5 transition-colors"
          >
            <Cpu className="h-3.5 w-3.5 text-forest-600" />
            <span>ML Telemetry</span>
          </button>

          {/* Backend Connectivity Status Indicator */}
          <div className="flex items-center space-x-2 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[11px]">
            <span className="flex h-2 w-2 relative">
              {isHealthy ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-forest-600"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              )}
            </span>
            <span className="font-medium text-slate-700">
              {loading ? 'Probing...' : isHealthy ? 'Engine Active' : 'Offline Mode'}
            </span>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 ${
              activeTab === 'dashboard' ? 'bg-forest-50 text-forest-800' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 text-slate-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleNavClick('wizard')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 ${
              activeTab === 'wizard' ? 'bg-forest-50 text-forest-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Calculator className="h-4 w-4 text-forest-600" />
            <span>Analyze Property</span>
          </button>

          {hasResult && (
            <button
              onClick={() => handleNavClick('results')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 ${
                activeTab === 'results' ? 'bg-water-50 text-water-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Compass className="h-4 w-4 text-water-600" />
              <span>Current Results</span>
            </button>
          )}

          <button
            onClick={() => handleNavClick('history')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
              activeTab === 'history' ? 'bg-forest-50 text-forest-800' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <HistoryIcon className="h-4 w-4 text-slate-400" />
              <span>History</span>
            </div>
            {historyCount > 0 && (
              <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-mono">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavClick('about')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 ${
              activeTab === 'about' ? 'bg-forest-50 text-forest-800' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <span>About & Engineering Principles</span>
          </button>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs px-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenTelemetry()
              }}
              className="text-forest-700 font-semibold flex items-center space-x-1"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Audited ML Telemetry</span>
            </button>
            <span className="font-mono text-[10px] text-slate-500">
              {isHealthy ? 'FastAPI Active' : 'Offline'}
            </span>
          </div>
        </div>
      )}
    </header>
  )
}
