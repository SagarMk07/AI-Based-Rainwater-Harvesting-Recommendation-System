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
  Loader2,
  Droplets,
  Shield,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

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
    setMode(initialMode)
    setErrorMessage(null)
    setSuccessMessage(null)
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-700 text-white">
              <Droplets className="h-4 w-4 text-water-200" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-sm font-bold text-slate-900">
                {mode === 'login' && 'Sign in to RainHarvest'}
                {mode === 'signup' && 'Create your Account'}
                {mode === 'forgot' && 'Reset your Password'}
                {mode === 'session_expired' && 'Session Expired'}
                {mode === 'unauthorized' && 'Authentication Required'}
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">
                {mode === 'session_expired' ? 'Security Re-authentication' : 'Hydrological Workspace'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
            aria-label="Close authentication modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* Guest Save Context Banner */}
          {pendingAnalysis && mode !== 'forgot' && (
            <div className="mb-4 rounded-xl border border-water-200 bg-water-50/80 p-3 text-xs text-water-900 flex items-start space-x-2">
              <Shield className="h-4 w-4 text-water-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Preserving current analysis:</span> Sign in to automatically bind your {pendingAnalysis.weather.city} calculations ({pendingAnalysis.recommendation.optimal_tank_capacity_litres.toLocaleString()} L system) to your profile!
              </div>
            </div>
          )}

          {/* Session Expired / Unauthorized Alert */}
          {(mode === 'session_expired' || mode === 'unauthorized') && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start space-x-2">
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
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span className="flex-1 font-medium">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-start space-x-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="flex-1 font-medium">{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-full-name" className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name / Organisation
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="auth-full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sagar Patil"
                    className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@company.com"
                  className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-forest-700 hover:text-forest-900 font-medium"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
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
              className="w-full rounded-xl bg-forest-700 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-forest-800 disabled:opacity-60 transition-all flex items-center justify-center space-x-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>
                {mode === 'login' && (loading ? 'Signing in...' : 'Sign In')}
                {mode === 'signup' && (loading ? 'Creating account...' : 'Create Free Account')}
                {mode === 'forgot' && (loading ? 'Sending link...' : 'Send Reset Link')}
                {(mode === 'session_expired' || mode === 'unauthorized') && (loading ? 'Authenticating...' : 'Sign In')}
              </span>
            </button>
          </form>

          {/* Mode Switcher Footer */}
          <div className="mt-5 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            {mode === 'login' || mode === 'session_expired' || mode === 'unauthorized' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-bold text-forest-700 hover:underline"
                >
                  Create one now
                </button>
              </p>
            ) : mode === 'signup' ? (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-forest-700 hover:underline"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Remembered your password?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-forest-700 hover:underline"
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
