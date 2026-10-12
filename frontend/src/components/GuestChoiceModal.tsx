import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, UserCheck, LogIn, ArrowRight, X, Shield } from 'lucide-react'

interface GuestChoiceModalProps {
  isOpen: boolean
  onClose: () => void
}

export const GuestChoiceModal: React.FC<GuestChoiceModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleGuestContinue = () => {
    onClose()
    navigate('/analyze')
  }

  const handleSignIn = () => {
    onClose()
    navigate('/login', { state: { from: { pathname: '/analyze' } } })
  }

  const handleSignUp = () => {
    onClose()
    navigate('/signup', { state: { from: { pathname: '/analyze' } } })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-choice-title"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-700/80 bg-slate-900 text-white p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 pr-6">
          <div className="inline-flex items-center space-x-2 rounded-full bg-forest-500/10 px-3 py-1 text-xs font-semibold text-forest-400 border border-forest-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Hydrological Assessment</span>
          </div>
          <h2 id="guest-choice-title" className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            How would you like to proceed?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Choose whether to run an instant anonymous assessment or sign in to save your property
            records and historical runoff charts.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {/* Option 1: Continue as Guest */}
          <button
            type="button"
            onClick={handleGuestContinue}
            className="w-full text-left p-4 rounded-2xl border border-forest-500/30 bg-forest-950/40 hover:bg-forest-900/40 hover:border-forest-400/50 transition-all group flex items-start space-x-3.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-600 text-white flex-shrink-0 group-hover:scale-105 transition-transform">
              <UserCheck className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white group-hover:text-forest-300 transition-colors">
                  Continue as Guest
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-forest-500/20 text-forest-300 border border-forest-500/30">
                  Instant Access
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Run the complete 5-step property analysis and 12-month water balance simulation immediately. No registration needed.
              </p>
            </div>
          </button>

          {/* Option 2: Sign In */}
          <button
            type="button"
            onClick={handleSignIn}
            className="w-full text-left p-4 rounded-2xl border border-slate-800 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-700 transition-all group flex items-start space-x-3.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700 text-white flex-shrink-0 group-hover:scale-105 transition-transform">
              <LogIn className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white group-hover:text-slate-200 transition-colors">
                  Sign In to Existing Account
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Load your saved properties, benchmark comparisons, and past engineering reports.
              </p>
            </div>
          </button>

          {/* Option 3: Create Account */}
          <button
            type="button"
            onClick={handleSignUp}
            className="w-full text-left p-4 rounded-2xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700 transition-all group flex items-start space-x-3.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-water-700 text-white flex-shrink-0 group-hover:scale-105 transition-transform">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white group-hover:text-water-300 transition-colors">
                  Create a Free Account
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-water-900/60 text-water-300 border border-water-700">
                  Save Results
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Save multi-year precipitation analyses, export PDF reports, and sync across devices.
              </p>
            </div>
          </button>
        </div>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-slate-500">
            Guest sessions can be optionally linked to an account after calculation.
          </p>
        </div>
      </div>
    </div>
  )
}
