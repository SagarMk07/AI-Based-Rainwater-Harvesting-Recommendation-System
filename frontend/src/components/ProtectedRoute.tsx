import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Droplets } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-forest-600 border-t-transparent" />
          <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium">
            <Droplets className="h-4 w-4 text-forest-600 animate-bounce" />
            <span>Verifying session security...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    // Preserve the intended location so user can be redirected back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
