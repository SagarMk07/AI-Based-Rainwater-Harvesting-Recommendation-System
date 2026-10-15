import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Droplets, ArrowRight, LogIn, Menu, X, LayoutDashboard, User } from 'lucide-react'
import { useAuth } from '../context/useAuth'

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/analyze')
  }

  const handleScrollTo = (elementId: string) => {
    setMobileMenuOpen(false)
    if (window.location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(elementId)
        el?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      const el = document.getElementById(elementId)
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F4F4F0]/95 backdrop-blur-md border-b border-[#DEDFD8] shadow-[0_3px_10px_rgba(80,82,78,0.06)] transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Editorial Wordmark */}
        <Link
          to="/"
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

        {/* Public Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleScrollTo('how-it-works')}
            className="h-9 px-3.5 rounded-xl text-[#687068] hover:text-[#252B26] hover:bg-[#EEEEEA] transition-all"
          >
            How It Works
          </button>

          <button
            type="button"
            onClick={() => handleScrollTo('features')}
            className="h-9 px-3.5 rounded-xl text-[#687068] hover:text-[#252B26] hover:bg-[#EEEEEA] transition-all"
          >
            Capabilities
          </button>

          <Link
            to="/about"
            className="h-9 px-3.5 rounded-xl text-[#687068] hover:text-[#252B26] hover:bg-[#EEEEEA] transition-all inline-flex items-center"
          >
            Engineering Principles
          </Link>
        </nav>

        {/* Desktop CTA / Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="neu-btn-secondary h-9 px-3.5 text-xs font-semibold space-x-1.5"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-forest-600" />
                <span>Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={handleGetStarted}
                className="neu-btn-primary h-9 px-4 text-xs space-x-1.5"
              >
                <span>Analyze Property</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="neu-btn-secondary h-9 px-3.5 text-xs font-semibold space-x-1.5"
              >
                <LogIn className="h-3.5 w-3.5 text-[#687068]" />
                <span>Sign In</span>
              </Link>

              <button
                type="button"
                onClick={handleGetStarted}
                className="neu-btn-primary h-9 px-4 text-xs space-x-1.5"
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
              className="neu-raised-sm h-8 px-2.5 text-forest-700 text-xs font-bold flex items-center space-x-1"
            >
              <User className="h-3.5 w-3.5 text-forest-600" />
              <span>App</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="neu-raised-sm h-8 px-2.5 text-[#252B26] text-xs font-semibold flex items-center space-x-1"
            >
              <LogIn className="h-3.5 w-3.5 text-[#687068]" />
              <span>Sign In</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="neu-raised-sm h-9 w-9 flex items-center justify-center text-[#252B26]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#DEDFD8] bg-[#F4F4F0] px-4 pt-3 pb-5 space-y-2 shadow-[0_8px_16px_rgba(80,82,78,0.10)] animate-in slide-in-from-top-2 duration-200">
          <button
            type="button"
            onClick={() => handleScrollTo('how-it-works')}
            className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#252B26] hover:bg-[#EEEEEA] transition-colors"
          >
            How It Works
          </button>

          <button
            type="button"
            onClick={() => handleScrollTo('features')}
            className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#252B26] hover:bg-[#EEEEEA] transition-colors"
          >
            Capabilities
          </button>

          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#252B26] hover:bg-[#EEEEEA] transition-colors"
          >
            Engineering Principles
          </Link>

          <div className="pt-2 border-t border-[#DEDFD8] flex flex-col space-y-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="neu-btn-secondary w-full py-2.5 text-xs text-center"
                >
                  Go to Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="neu-btn-primary w-full py-2.5 text-xs"
                >
                  Analyze Property
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="neu-btn-secondary w-full py-2.5 text-xs text-center"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="neu-btn-primary w-full py-2.5 text-xs"
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

export default PublicNavbar
