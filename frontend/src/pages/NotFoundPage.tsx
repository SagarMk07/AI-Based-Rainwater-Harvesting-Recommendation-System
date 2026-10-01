import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export const NotFoundPage: FC = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <p className="mt-2 text-sm text-slate-600">The requested resource could not be found.</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  )
}
