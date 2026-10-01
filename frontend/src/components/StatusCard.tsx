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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/75 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Server className="h-5 w-5 text-slate-700" />
          <h2 className="text-sm font-semibold text-slate-900">
            System Foundation & Connectivity Status
          </h2>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Probing...' : 'Probe API'}</span>
        </button>
      </div>

      <div className="p-6">
        {error ? (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Backend Unreachable</p>
              <p className="text-xs text-amber-700 mt-1 font-mono">{error}</p>
              <p className="text-xs text-amber-600 mt-2">
                Make sure the FastAPI backend server is running on <code className="bg-amber-100 px-1 py-0.5 rounded">http://127.0.0.1:8000</code>.
              </p>
            </div>
          </div>
        ) : health ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Backend Environment */}
            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
              <div className="flex items-center space-x-2 mb-3">
                <Code2 className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Backend Runtime
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-medium text-slate-800 text-right truncate max-w-[150px]">
                    FastAPI Server
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Environment:</span>
                  <span className="font-mono text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                    {health.environment.app_env}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Python:</span>
                  <span className="font-mono text-slate-700">
                    v{health.environment.python_version}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Debug Mode:</span>
                  <span className="font-mono text-slate-700">
                    {health.environment.debug ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Database & Persistence */}
            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
              <div className="flex items-center space-x-2 mb-3">
                <Database className="h-4 w-4 text-sky-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Database & Storage
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Provider:</span>
                  <span className="font-medium text-slate-800">
                    {health.database.provider}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">State:</span>
                  <span
                    className={`font-mono px-2 py-0.5 rounded text-[11px] font-semibold ${
                      health.database.connected
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {health.database.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2 bg-white p-2 rounded border border-slate-200">
                  {health.database.message}
                </div>
              </div>
            </div>

            {/* Pipeline Readiness */}
            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
              <div className="flex items-center space-x-2 mb-3">
                <Layers className="h-4 w-4 text-purple-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Pipeline Subsystems
                </h3>
              </div>
              <div className="space-y-1.5 text-xs">
                {Object.entries(health.pipelines).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-slate-500 capitalize">
                      {key.replace('_', ' ')}:
                    </span>
                    <span className="inline-flex items-center space-x-1 font-mono text-[11px] text-emerald-700">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <span>{val}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {health && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Response Timestamp:</span>
              <span className="font-mono text-slate-500">{health.timestamp}</span>
            </div>
            <span className="text-emerald-700 font-medium">HTTP 200 OK · Healthy</span>
          </div>
        )}
      </div>
    </div>
  )
}
