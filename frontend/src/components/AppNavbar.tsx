import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Droplets,
  Cpu,
  Menu,
  X,
  History as HistoryIcon,
  Calculator,
  LayoutDashboard,
  ShieldCheck,
  LogIn,
  LogOut,
  ChevronDown,
  Trash2,
  Lock,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAppContext } from '../context/AppContext'

interface AppNavbarProps {
  onOpenPrivacy: () => void
  onDeleteAccount: () => void
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  onOpenPrivacy,
  onDeleteAccount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const { user, isGuest, logout } = useAuth()
  const {
    health,
    healthLoading,
    healthError,
    history,
    setShowMLModal,
  } = useAppContext()

  const isHealthy = !healthLoading && !healthError && health?.status === 'ok'

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const handleLogout = async () => {
    setUserDropdownOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo (Links to Dashboard in App Shell) */}
        <Link
          to={user ? '/dashboard' : '/'}
          className="flex items-center space-x-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 rounded-xl"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-forest-700 text-white shadow-sm group-hover:bg-forest-800 transition-colors flex-shrink-0">
            <Droplets className="h-5 w-5 text-water-200" />
          </div>
          <div className="min-w-0">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
              RainHarvest <span className="text-forest-700">AI</span>
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-slate-400 block -mt-0.5 truncate">
              Hydrological Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Application Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 text-xs font-semibold">
          {user && (
            <Link
              to="/dashboard"
              className={`h-9 px-3 rounded-lg transition-all flex items-center space-x-1.5 border ${
                isActive('/dashboard')
                  ? 'border-slate-200 bg-slate-100 text-forest-900 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-slate-400" />
              <span>Dashboard</span>
            </Link>
          )}

          <Link
            to="/analyze"
            className={`h-9 px-3 rounded-lg transition-all flex items-center space-x-1.5 border ${
              isActive('/analyze')
                ? 'border-forest-200/80 bg-forest-50 text-forest-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calculator className="h-4 w-4 text-forest-600" />
            <span>Analyze Property</span>
          </Link>

          {user && (
            <Link
              to="/history"
              className={`h-9 px-3 rounded-lg transition-all flex items-center space-x-1.5 border ${
                isActive('/history')
                  ? 'border-slate-200 bg-slate-100 text-forest-900 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <HistoryIcon className="h-4 w-4 text-slate-400" />
              <span>History</span>
              {history.length > 0 && (
                <span className="ml-1 bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                  {history.length}
                </span>
              )}
            </Link>
          )}

          <Link
            to="/about"
            className={`h-9 px-3 rounded-lg transition-all flex items-center space-x-1.5 border ${
              isActive('/about')
                ? 'border-slate-200 bg-slate-100 text-forest-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <span>About</span>
          </Link>
        </nav>

        {/* Right Action & Status Area */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Functional Audited ML Telemetry trigger */}
          <button
            type="button"
            onClick={() => setShowMLModal(true)}
            className="hidden sm:inline-flex h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-subtle items-center space-x-1.5 transition-colors"
          >
            <Cpu className="h-3.5 w-3.5 text-forest-600" />
            <span>ML Telemetry</span>
          </button>

          {/* Engine Connectivity Status Indicator */}
          <div className="hidden sm:flex h-9 px-2.5 sm:px-3 rounded-xl border border-slate-200/80 bg-slate-50 items-center space-x-2 text-[11px] sm:text-xs">
            <span className="flex h-2 w-2 relative flex-shrink-0">
              {isHealthy ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-forest-600"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              )}
            </span>
            <span className="font-medium text-slate-700 whitespace-nowrap">
              {healthLoading ? 'Probing...' : isHealthy ? 'Engine Active' : 'Offline Mode'}
            </span>
          </div>

          {/* User Auth Section */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="h-9 px-2.5 sm:px-3 rounded-xl border border-forest-200 bg-forest-50/80 hover:bg-forest-100 text-forest-900 text-xs font-semibold flex items-center space-x-2 transition-colors focus:outline-none focus:ring-2 focus:ring-forest-500"
                aria-expanded={userDropdownOpen}
                aria-label="User profile menu"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-700 text-white text-[10px] font-bold">
                  {(user.fullName || user.email)[0].toUpperCase()}
                </div>
                <span className="hidden md:inline max-w-[120px] truncate">
                  {user.fullName || user.email.split('@')[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-forest-700" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {user.fullName || 'Signed-in User'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate font-mono">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/history"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <HistoryIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span>Analysis History</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false)
                      onOpenPrivacy()
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Data Privacy Notice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false)
                      onDeleteAccount()
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                    <span>Delete Account & Data</span>
                  </button>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <LogOut className="h-3.5 w-3.5 text-slate-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              {isGuest && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                  Guest Mode
                </span>
              )}
              <Link
                to="/login"
                state={{ from: location }}
                className="h-9 px-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          )}

          {/* Mobile / Tablet menu toggle button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
          >
            <Droplets className="h-4 w-4 text-forest-600" />
            <span>Public Home</span>
          </Link>

          {user && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 ${
                isActive('/dashboard') ? 'bg-forest-50 text-forest-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-slate-400" />
              <span>Dashboard</span>
            </Link>
          )}

          <Link
            to="/analyze"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 ${
              isActive('/analyze') ? 'bg-forest-50 text-forest-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Calculator className="h-4 w-4 text-forest-600" />
            <span>Analyze Property</span>
          </Link>

          {user && (
            <Link
              to="/history"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                isActive('/history') ? 'bg-forest-50 text-forest-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <HistoryIcon className="h-4 w-4 text-slate-400" />
                <span>History</span>
              </div>
              {history.length > 0 && (
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-mono">
                  {history.length}
                </span>
              )}
            </Link>
          )}

          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 ${
              isActive('/about') ? 'bg-forest-50 text-forest-800' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <span>About & Engineering Principles</span>
          </Link>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs px-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                setShowMLModal(true)
              }}
              className="text-forest-700 font-semibold flex items-center space-x-1"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Audited ML Telemetry</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenPrivacy()
              }}
              className="text-slate-500 hover:text-slate-700 font-medium"
            >
              Privacy Notice
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
