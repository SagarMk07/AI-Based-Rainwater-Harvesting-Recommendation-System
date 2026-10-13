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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#252B26]/40 p-4 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-choice-title"
    >
      <div className="relative w-full max-w-lg rounded-3xl neu-card bg-[#F4F4F0] text-ink p-6 sm:p-8 shadow-neu-lg space-y-6 border border-[#DEDFD8]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-ink-muted hover:text-ink hover:bg-[#EEEEEA] transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 pr-6">
          <div className="inline-flex items-center space-x-2 rounded-full bg-[#EEEEEA] px-3 py-1 text-xs font-semibold text-forest-700 border border-forest-600/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Hydrological Assessment</span>
          </div>
          <h2 id="guest-choice-title" className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
            How would you like to proceed?
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            Run an instant anonymous assessment or sign in to save your property
            records and historical runoff charts.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3.5">
          {/* Option 1: Continue as Guest (RECOMMENDED / PRIMARY) */}
          <button
            type="button"
            onClick={handleGuestContinue}
            className="w-full text-left p-4 sm:p-5 rounded-2xl bg-[#F4F4F0] border-2 border-forest-600 shadow-neu hover:shadow-neu-sm active:shadow-neu-inset-sm transition-all group flex items-start space-x-3.5 relative"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-600 text-white flex-shrink-0 shadow-sm">
              <UserCheck className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-ink group-hover:text-forest-700 transition-colors">
                  Continue as Guest
                </span>
                <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-forest-600 text-white font-bold tracking-wider shadow-sm">
                  Instant Access
                </span>
              </div>
              <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                Run the complete 5-step property analysis and 12-month water balance simulation immediately. No registration needed.
              </p>
            </div>
          </button>

          {/* Option 2: Sign In (SECONDARY) */}
          <button
            type="button"
            onClick={handleSignIn}
            className="w-full text-left p-3.5 sm:p-4 rounded-2xl bg-[#EEEEEA] hover:bg-[#F4F4F0] border border-[#DEDFD8] hover:shadow-neu-sm transition-all group flex items-start space-x-3.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3E4DE] text-ink-secondary flex-shrink-0">
              <LogIn className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs sm:text-sm text-ink">
                  Sign In to Existing Account
                </span>
                <ArrowRight className="h-4 w-4 text-ink-muted group-hover:text-ink group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-ink-muted mt-0.5">
                Load your saved properties, benchmark comparisons, and past reports.
              </p>
            </div>
          </button>

          {/* Option 3: Create Account (TERTIARY) */}
          <button
            type="button"
            onClick={handleSignUp}
            className="w-full text-left p-3.5 sm:p-4 rounded-2xl bg-[#EEEEEA] hover:bg-[#F4F4F0] border border-[#DEDFD8] hover:shadow-neu-sm transition-all group flex items-start space-x-3.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3E4DE] text-ink-secondary flex-shrink-0">
              <Shield className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs sm:text-sm text-ink">
                  Create a New Free Account
                </span>
                <ArrowRight className="h-4 w-4 text-ink-muted group-hover:text-ink group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-ink-muted mt-0.5">
                Register to track long-term rainfall yields and claim guest calculations later.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
export default GuestChoiceModal
