import type { FC } from 'react'

export const Footer: FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <span className="font-semibold text-slate-700">
            AI-Based Rainwater Harvesting Intelligence & Optimization System
          </span>
          <span className="hidden sm:inline">|</span>
          <span>Phase 1: Project Foundation</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="font-mono text-slate-400">Deterministic Hydrology + Real ML</span>
          <span>•</span>
          <span className="font-mono text-slate-400">Strict Engineering Standard</span>
        </div>
      </div>
    </footer>
  )
}
