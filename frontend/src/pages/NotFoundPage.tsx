import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export const NotFoundPage: FC = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="neu-card p-10 max-w-md w-full text-center rounded-3xl space-y-4">
        <h1 className="text-5xl font-black text-ink font-mono">404</h1>
        <p className="text-sm text-ink-muted">The requested resource could not be found.</p>
        <div className="pt-2">
          <Link
            to="/"
            className="neu-btn-primary inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
