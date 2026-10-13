import type { FC } from 'react'
import {
  Server,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Code2,
} from 'lucide-react'
import type { HealthResponse } from '../types/health'

interface StatusCardProps {
  health: HealthResponse | null
  loading: boolean
  error: string | null
  onRefresh: () => void
}

export const StatusCard: FC<StatusCardProps> = ({
  health,
  loading,
  error,
  onRefresh,
}) => {
  return (
    <div className="neu-card overflow-hidden rounded-3xl">
      <div className="border-b border-[#DEDFD8] bg-[#EEEEEA] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-xl bg-surface border border-white/80 shadow-neu-sm flex items-center justify-center text-forest-700">
            <Server className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink">
              System Foundation & Connectivity Status
            </h2>
            <p className="text-[10px] text-ink-muted font-mono">Backend Microservices & Database Health</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="neu-btn-secondary h-9 px-3.5 text-xs font-semibold inline-flex items-center space-x-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Probing...' : 'Probe API'}</span>
        </button>
      </div>

      <div className="p-6">
        {error ? (
          <div className="rounded-2xl bg-amber-50 border border-amber-300 p-4 text-xs text-amber-900 flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Backend Unreachable</p>
              <p className="text-xs text-amber-800 mt-1 font-mono">{error}</p>
              <p className="text-xs text-amber-700 mt-2">
                Make sure the FastAPI backend server is running on <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">http://127.0.0.1:8000</code>.
              </p>
            </div>
          </div>
        ) : health ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Backend Environment */}
            <div className="neu-card-sm p-4.5 space-y-3 rounded-2xl">
              <div className="flex items-center space-x-2 mb-2">
                <Code2 className="h-4 w-4 text-forest-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-secondary">
                  Backend Runtime
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Service:</span>
                  <span className="font-semibold text-ink text-right truncate max-w-[150px]">
                    FastAPI Server
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Environment:</span>
                  <span className="font-mono text-forest-700 font-bold bg-[#EEEEEA] border border-forest-600/30 px-1.5 py-0.5 rounded">
                    {health.environment.app_env}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Python:</span>
                  <span className="font-mono text-ink font-semibold">
                    v{health.environment.python_version}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Debug Mode:</span>
                  <span className="font-mono text-ink">
                    {health.environment.debug ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Database & Persistence */}
            <div className="neu-card-sm p-4.5 space-y-3 rounded-2xl">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-4 w-4 text-sky-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-secondary">
                  Database & Storage
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-ink-muted">Provider:</span>
                  <span className="font-semibold text-ink">
                    {health.database.provider}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-muted">State:</span>
                  <span
                    className={`font-mono px-2 py-0.5 rounded text-[11px] font-bold ${
                      health.database.connected
                        ? 'bg-[#EEEEEA] text-forest-700 border border-forest-600/30'
                        : 'bg-[#E3E4DE] text-ink-muted'
                    }`}
                  >
                    {health.database.status}
                  </span>
                </div>
                <div className="text-[11px] text-ink-secondary mt-2 neu-inset p-2.5 rounded-xl font-mono">
                  {health.database.message}
                </div>
              </div>
            </div>

            {/* Pipeline Readiness */}
            <div className="neu-card-sm p-4.5 space-y-3 rounded-2xl">
              <div className="flex items-center space-x-2 mb-2">
                <Layers className="h-4 w-4 text-indigo-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-secondary">
                  Pipeline Subsystems
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                {Object.entries(health.pipelines).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-ink-muted capitalize">
                      {key.replace('_', ' ')}:
                    </span>
                    <span className="inline-flex items-center space-x-1 font-mono text-[11px] text-forest-700 font-bold">
                      <CheckCircle2 className="h-3 w-3 text-forest-600" />
                      <span>{val}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {health && (
          <div className="mt-5 pt-3.5 border-t border-[#DEDFD8] flex items-center justify-between text-[11px] text-ink-muted">
            <div className="flex items-center space-x-1.5 font-mono">
              <Clock className="h-3.5 w-3.5" />
              <span>Response Timestamp:</span>
              <span className="font-bold text-ink">{health.timestamp}</span>
            </div>
            <span className="text-forest-700 font-bold font-mono">HTTP 200 OK · Healthy</span>
          </div>
        )}
      </div>
    </div>
  )
}
export default StatusCard
