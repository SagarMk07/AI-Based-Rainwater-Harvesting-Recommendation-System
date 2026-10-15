import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
import { useAuth } from '../context/useAuth'
import { useAppContext } from '../context/useAppContext'

interface AppNavbarProps {
  onOpenPrivacy: () => void
  onDeleteAccount: () => void
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  onOpenPrivacy,
  onDeleteAccount,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { user, isGuest, logout } = useAuth()
  const { history, health, healthLoading, setShowMLModal } = useAppContext()

  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const isHealthy = health?.status === 'ok'

  const handleLogout = async () => {
    setUserDropdownOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F4F4F0]/95 backdrop-blur-md border-b border-[#DEDFD8] shadow-[0_3px_10px_rgba(80,82,78,0.06)] transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          to={user ? '/dashboard' : '/'}
          className="flex items-center space-x-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 rounded-xl"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-600 text-white shadow-[2px_2px_6px_rgba(22,132,71,0.25),-2px_-2px_6px_rgba(255,255,255,0.7)] group-hover:bg-forest-700 transition-colors flex-shrink-0">
            <Droplets className="h-5 w-5 text-emerald-100" />
          </div>
          <div className="min-w-0">
            <span className="text-base sm:text-lg font-black text-[#252B26] tracking-tight flex items-center gap-1">
              RainHarvest <span className="text-forest-600">AI</span>
            </span>
            <span className="text-[9px] uppercase font-mono tracking-wider text-[#687068] block -mt-0.5 truncate">
              Hydrological Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Application Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1.5 text-xs font-semibold">
          {user && (
            <Link
              to="/dashboard"
              className={`h-9 px-3.5 rounded-xl transition-all flex items-center space-x-1.5 border ${
                isActive('/dashboard')
                  ? 'border-forest-600/30 bg-[#EEEEEA] text-forest-700 shadow-neu-inset-sm font-bold'
                  : 'border-transparent text-[#687068] hover:text-[#252B26] hover:bg-[#EEEEEA]'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-[#687068]" />
              <span>Dashboard</span>
            </Link>
          )}

          <Link
            to="/analyze"
            className={`h-9 px-3.5 rounded-xl transition-all flex items-center space-x-1.5 border ${
              isActive('/analyze')
                ? 'border-forest-600/30 bg-[#EEEEEA] text-forest-700 shadow-neu-inset-sm font-bold'
                : 'border-transparent text-[#687068] hover:text-[#252B26] hover:bg-[#EEEEEA]'
            }`}
          >
            <Calculator className="h-4 w-4 text-forest-600" />
            <span>Analyze Property</span>
          </Link>

          {user && (
            <Link
              to="/history"
              className={`h-9 px-3.5 rounded-xl transition-all flex items-center space-x-1.5 border ${
                isActive('/history')
                  ? 'border-forest-600/30 bg-[#EEEEEA] text-forest-700 shadow-neu-inset-sm font-bold'
                  : 'border-transparent text-[#687068] hover:text-[#252B26] hover:bg-[#EEEEEA]'
              }`}
            >
              <HistoryIcon className="h-4 w-4 text-[#687068]" />
              <span>History</span>
              {history.length > 0 && (
                <span className="ml-1 bg-[#E3E4DE] text-[#252B26] px-1.5 py-0.2 rounded-full text-[10px] font-mono shadow-neu-inset-sm">
                  {history.length}
                </span>
              )}
            </Link>
          )}

          <Link
            to="/about"
            className={`h-9 px-3.5 rounded-xl transition-all flex items-center space-x-1.5 border ${
              isActive('/about')
                ? 'border-forest-600/30 bg-[#EEEEEA] text-forest-700 shadow-neu-inset-sm font-bold'
                : 'border-transparent text-[#687068] hover:text-[#252B26] hover:bg-[#EEEEEA]'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-[#687068]" />
            <span>Principles</span>
          </Link>
        </nav>

        {/* Right Action & Status Area */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Functional Audited ML Telemetry trigger */}
          <button
            type="button"
            onClick={() => setShowMLModal(true)}
            className="hidden sm:inline-flex neu-btn-secondary h-9 px-3 text-xs space-x-1.5"
          >
            <Cpu className="h-3.5 w-3.5 text-forest-600" />
            <span>ML Telemetry</span>
          </button>

          {/* Engine Connectivity Status Indicator */}
          <div className="hidden sm:flex neu-inset h-9 px-3 items-center space-x-2 text-xs">
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
            <span className="font-semibold text-[#252B26] whitespace-nowrap text-[11px]">
              {healthLoading ? 'Probing...' : isHealthy ? 'Engine Active' : 'Offline Mode'}
            </span>
          </div>

          {/* User Auth Section */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="neu-raised-sm h-9 px-3 text-[#252B26] text-xs font-semibold flex items-center space-x-2 transition-colors focus:outline-none focus:ring-2 focus:ring-forest-500"
                aria-expanded={userDropdownOpen}
                aria-label="User profile menu"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-600 text-white text-[10px] font-bold">
                  {(user.fullName || user.email)[0].toUpperCase()}
                </div>
                <span className="hidden md:inline max-w-[120px] truncate text-xs font-bold">
                  {user.fullName || user.email.split('@')[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-[#687068]" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 neu-card p-2 z-50 shadow-neu animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-[#DEDFD8]">
                    <p className="text-xs font-bold text-[#252B26] truncate">
                      {user.fullName || 'Signed-in User'}
                    </p>
                    <p className="text-[11px] text-[#687068] truncate font-mono">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#252B26] hover:bg-[#EEEEEA] flex items-center space-x-2 transition-colors"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-[#687068]" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/history"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#252B26] hover:bg-[#EEEEEA] flex items-center space-x-2 transition-colors"
                  >
                    <HistoryIcon className="h-3.5 w-3.5 text-[#687068]" />
                    <span>Analysis History</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false)
                      onOpenPrivacy()
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#252B26] hover:bg-[#EEEEEA] flex items-center space-x-2 transition-colors"
                  >
                    <Lock className="h-3.5 w-3.5 text-[#687068]" />
                    <span>Data Privacy Notice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false)
                      onDeleteAccount()
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-700 hover:bg-rose-50 flex items-center space-x-2 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                    <span>Delete Account & Data</span>
                  </button>

                  <div className="border-t border-[#DEDFD8] mt-1 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#252B26] hover:bg-[#EEEEEA] flex items-center space-x-2 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5 text-[#687068]" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {isGuest && (
                <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#E3E4DE] text-[#252B26] border border-[#DEDFD8] shadow-neu-inset-sm">
                  Guest Mode
                </span>
              )}
              <Link
                to="/login"
                state={{ from: location }}
                className="neu-btn-primary h-9 px-3.5 text-xs space-x-1.5"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden neu-raised-sm h-9 w-9 flex items-center justify-center text-[#252B26]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#DEDFD8] bg-[#F4F4F0] px-4 pt-2 pb-4 space-y-1.5 shadow-[0_8px_16px_rgba(80,82,78,0.10)] animate-in slide-in-from-top-2 duration-200">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#252B26] hover:bg-[#EEEEEA] flex items-center space-x-2 transition-colors"
          >
            <Droplets className="h-4 w-4 text-forest-600" />
            <span>Public Home</span>
          </Link>

          {user && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                isActive('/dashboard') ? 'bg-[#EEEEEA] text-forest-700 font-bold shadow-neu-inset-sm' : 'text-[#252B26] hover:bg-[#EEEEEA]'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-[#687068]" />
              <span>Dashboard</span>
            </Link>
          )}

          <Link
            to="/analyze"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
              isActive('/analyze') ? 'bg-[#EEEEEA] text-forest-700 font-bold shadow-neu-inset-sm' : 'text-[#252B26] hover:bg-[#EEEEEA]'
            }`}
          >
            <Calculator className="h-4 w-4 text-forest-600" />
            <span>Analyze Property</span>
          </Link>

          {user && (
            <Link
              to="/history"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                isActive('/history') ? 'bg-[#EEEEEA] text-forest-700 font-bold shadow-neu-inset-sm' : 'text-[#252B26] hover:bg-[#EEEEEA]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <HistoryIcon className="h-4 w-4 text-[#687068]" />
                <span>History</span>
              </div>
              {history.length > 0 && (
                <span className="bg-[#E3E4DE] text-[#252B26] px-2 py-0.5 rounded-full text-[10px] font-mono shadow-neu-inset-sm">
                  {history.length}
                </span>
              )}
            </Link>
          )}

          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
              isActive('/about') ? 'bg-[#EEEEEA] text-forest-700 font-bold shadow-neu-inset-sm' : 'text-[#252B26] hover:bg-[#EEEEEA]'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-[#687068]" />
            <span>Principles</span>
          </Link>

          <div className="pt-2 border-t border-[#DEDFD8] flex items-center justify-between text-xs px-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                setShowMLModal(true)
              }}
              className="text-forest-700 font-semibold flex items-center space-x-1"
            >
              <Cpu className="h-3.5 w-3.5 text-forest-600" />
              <span>Audited ML Telemetry</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenPrivacy()
              }}
              className="text-[#687068] hover:text-[#252B26] font-medium"
            >
              Privacy Notice
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

export default AppNavbar
