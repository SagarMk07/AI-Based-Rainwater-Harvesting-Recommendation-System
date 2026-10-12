import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Droplets, Menu, X, ArrowRight, LayoutDashboard, LogIn, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleScrollTo = (sectionId: string) => {
    setMobileMenuOpen(false)
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    navigate(`/#${sectionId}`)
  }

  const handleGetStarted = () => {
    setMobileMenuOpen(false)
    if (user) {
      navigate('/analyze')
    } else {
      navigate('/signup')
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          to="/"
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

        {/* Public Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleScrollTo('how-it-works')}
            className="h-9 px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            How It Works
          </button>

          <button
            type="button"
            onClick={() => handleScrollTo('features')}
            className="h-9 px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            Features
          </button>

          <Link
            to="/about"
            className="h-9 px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors inline-flex items-center"
          >
            About
          </Link>
        </nav>

        {/* Desktop CTA / Auth Buttons */}
        <div className="hidden md:flex items-center space-x-2.5">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-subtle inline-flex items-center space-x-1.5 transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-forest-600" />
                <span>Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={handleGetStarted}
                className="h-9 px-4 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center space-x-1.5"
              >
                <span>Analyze Property</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-subtle inline-flex items-center space-x-1.5 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5 text-slate-500" />
                <span>Sign In</span>
              </Link>

              <button
                type="button"
                onClick={handleGetStarted}
                className="h-9 px-4 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center space-x-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center space-x-2">
          {user ? (
            <Link
              to="/dashboard"
              className="h-8 px-2.5 rounded-lg bg-forest-50 text-forest-800 text-xs font-semibold flex items-center space-x-1 border border-forest-200"
            >
              <User className="h-3.5 w-3.5 text-forest-700" />
              <span>App</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="h-8 px-2.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <button
            type="button"
            onClick={() => handleScrollTo('how-it-works')}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            How It Works
          </button>

          <button
            type="button"
            onClick={() => handleScrollTo('features')}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Features
          </button>

          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            About
          </Link>

          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold text-center block"
                >
                  Go to Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="w-full py-2.5 px-3 rounded-xl bg-forest-700 text-white text-xs font-bold text-center"
                >
                  Analyze Property
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold text-center block"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="w-full py-2.5 px-3 rounded-xl bg-forest-700 text-white text-xs font-bold text-center"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
