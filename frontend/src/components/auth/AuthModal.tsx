import React, { useState } from 'react'
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Droplets,
  Shield,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'

export type AuthMode = 'login' | 'signup' | 'forgot' | 'session_expired' | 'unauthorized'

interface AuthModalProps {
  isOpen: boolean
  initialMode?: AuthMode
  onClose: () => void
  onSuccess?: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const { login, signup, resetPassword, pendingAnalysis } = useAuth()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Sync mode when initialMode prop changes
  React.useEffect(() => {
    queueMicrotask(() => {
      setMode(initialMode)
      setErrorMessage(null)
      setSuccessMessage(null)
    })
  }, [initialMode, isOpen])

  if (!isOpen) return null

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    if (mode === 'forgot') {
      setLoading(true)
      const res = await resetPassword(email)
      setLoading(false)
      if (res.success) {
        setSuccessMessage(res.message)
      } else {
        setErrorMessage(res.error || 'Failed to dispatch reset email.')
      }
      return
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.')
      return
    }

    setLoading(true)
    if (mode === 'signup') {
      const res = await signup(email, password, fullName)
      setLoading(false)
      if (res.success) {
        setSuccessMessage('Account registered successfully! You are now logged in.')
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 800)
      } else {
        setErrorMessage(res.error || 'Registration failed.')
      }
    } else {
      // login / session_expired / unauthorized
      const res = await login(email, password)
      setLoading(false)
      if (res.success) {
        setSuccessMessage('Successfully signed in!')
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 600)
      } else {
        setErrorMessage(res.error || 'Invalid email or password.')
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#252B26]/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl neu-card bg-[#F4F4F0] border border-[#DEDFD8] shadow-neu-lg text-ink">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#DEDFD8] bg-[#EEEEEA] px-6 py-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest-600 text-white shadow-sm">
              <Droplets className="h-4 w-4 text-emerald-100" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-sm font-bold text-ink">
                {mode === 'login' && 'Sign in to RainHarvest'}
                {mode === 'signup' && 'Create your Account'}
                {mode === 'forgot' && 'Reset your Password'}
                {mode === 'session_expired' && 'Session Expired'}
                {mode === 'unauthorized' && 'Authentication Required'}
              </h2>
              <span className="text-[10px] text-ink-muted font-mono">
                {mode === 'session_expired' ? 'Security Re-authentication' : 'Hydrological Workspace'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-ink-muted hover:bg-[#EEEEEA] hover:text-ink transition-colors"
            aria-label="Close authentication modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Guest Save Context Banner */}
          {pendingAnalysis && mode !== 'forgot' && (
            <div className="rounded-xl border border-sky-300/60 bg-sky-50/80 p-3 text-xs text-sky-900 flex items-start space-x-2">
              <Shield className="h-4 w-4 text-sky-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Preserving current analysis:</span> Sign in to automatically bind your {pendingAnalysis.weather.city} calculations ({pendingAnalysis.recommendation.optimal_tank_capacity_litres.toLocaleString()} L system) to your profile!
              </div>
            </div>
          )}

          {/* Session Expired / Unauthorized Alert */}
          {(mode === 'session_expired' || mode === 'unauthorized') && (
            <div className="rounded-xl border border-amber-300/80 bg-amber-50 p-3 text-xs text-amber-900 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                {mode === 'session_expired'
                  ? 'Your security session has expired. Please enter your credentials to resume.'
                  : 'This resource is private. Please sign in to verify property ownership.'}
              </div>
            </div>
          )}

          {/* Error & Success Alerts */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-300/80 bg-rose-50 p-3 text-xs text-rose-800 flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span className="flex-1 font-medium">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-emerald-300/80 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-start space-x-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="flex-1 font-medium">{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-full-name" className="block text-xs font-semibold text-ink mb-1">
                  Full Name / Organisation
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
                  <input
                    id="auth-full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sagar Patil"
                    className="neu-input w-full py-2 pl-9 pr-3 text-xs"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-semibold text-ink mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@domain.com"
                  className="neu-input w-full py-2 pl-9 pr-3 text-xs"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="auth-password" className="block text-xs font-semibold text-ink">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot')
                        setErrorMessage(null)
                        setSuccessMessage(null)
                      }}
                      className="text-[11px] font-semibold text-forest-700 hover:text-forest-900 transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="neu-input w-full py-2 pl-9 pr-10 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-ink-muted hover:text-ink"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="neu-btn-primary w-full h-10 rounded-xl font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : (
                <span>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Password Reset Link'}
                  {mode === 'session_expired' && 'Re-authenticate Session'}
                  {mode === 'unauthorized' && 'Sign In to Proceed'}
                </span>
              )}
            </button>
          </form>

          {/* Mode Switchers */}
          <div className="pt-3 border-t border-[#DEDFD8] text-center text-xs text-ink-muted space-y-2">
            {mode === 'login' && (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup')
                    setErrorMessage(null)
                    setSuccessMessage(null)
                  }}
                  className="font-bold text-forest-700 hover:text-forest-900 underline"
                >
                  Create free account
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setErrorMessage(null)
                    setSuccessMessage(null)
                  }}
                  className="font-bold text-forest-700 hover:text-forest-900 underline"
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <p>
                Remembered your credentials?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setErrorMessage(null)
                    setSuccessMessage(null)
                  }}
                  className="font-bold text-forest-700 hover:text-forest-900 underline"
                >
                  Back to login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default AuthModal
