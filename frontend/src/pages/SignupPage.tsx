import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Droplets, Lock, Mail, User, Eye, EyeOff, AlertCircle, ArrowRight, UserCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const destination = (location.state as any)?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await signup(email, password, fullName)
      if (res.success) {
        navigate(destination, { replace: true })
      } else {
        setError(res.error || 'Failed to create account.')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected registration error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2.5 text-ink group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest-700 text-white shadow-neu-sm group-hover:scale-105 transition-transform">
              <Droplets className="h-5 w-5 text-emerald-200" />
            </div>
            <span className="text-2xl font-black tracking-tight text-ink">
              RainHarvest <span className="text-forest-700">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-ink tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-ink-muted">
            Start modeling site hydrology, rainfall distribution, and optimal storage setups.
          </p>
        </div>

        <div className="neu-card p-6 sm:p-8 space-y-6">
          {error && (
            <div className="rounded-xl border border-rose-300/80 bg-rose-50 p-3 text-xs text-rose-800 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1" htmlFor="signup-name">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-muted">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Prof. Ramesh Sharma"
                  className="neu-input w-full pl-9 pr-3 py-2.5 text-xs text-ink"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1" htmlFor="signup-email">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-muted">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@domain.com"
                  className="neu-input w-full pl-9 pr-3 py-2.5 text-xs text-ink"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1" htmlFor="signup-password">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-muted">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="neu-input w-full pl-9 pr-10 py-2.5 text-xs text-ink"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-muted hover:text-ink"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1" htmlFor="signup-confirm-password">
                Confirm Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-muted">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="neu-input w-full pl-9 pr-3 py-2.5 text-xs text-ink"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neu-btn-primary w-full h-11 rounded-xl font-bold text-xs shadow-neu-sm hover:shadow-neu transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[#DEDFD8] flex flex-col space-y-3.5 text-center">
            <p className="text-xs text-ink-muted">
              Already have an account?{' '}
              <Link
                to="/login"
                state={{ from: location.state?.from }}
                className="font-bold text-forest-700 hover:text-forest-800 underline ml-1"
              >
                Sign in
              </Link>
            </p>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#DEDFD8]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono">
                <span className="bg-surface px-2.5 text-ink-muted">or</span>
              </div>
            </div>

            <Link
              to="/analyze"
              className="neu-btn-secondary w-full py-2.5 rounded-xl text-xs font-semibold inline-flex items-center justify-center space-x-2"
            >
              <UserCheck className="h-4 w-4 text-forest-700" />
              <span>Continue as Guest (No Account Required)</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
export default SignupPage
