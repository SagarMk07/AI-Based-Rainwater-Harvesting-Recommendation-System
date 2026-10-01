import React from 'react'
import { Droplets, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react'
import type { NavTab } from './Navbar'

interface FooterProps {
  onTabChange?: (tab: NavTab) => void
  onOpenTelemetry?: () => void
}

export const Footer: React.FC<FooterProps> = ({ onTabChange, onOpenTelemetry }) => {
  return (
    <footer className="w-full border-t border-slate-200/90 bg-white py-10 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-700 text-white shadow-sm">
                <Droplets className="h-4 w-4 text-water-200" />
              </div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight">
                RainHarvest <span className="text-forest-700">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              AI-Based Rainwater Harvesting Intelligence & Optimization System.
              Engineered with deterministic civil calculations (IS 15797:2008 & CPWD), 12-month iterative
              water-balance continuity simulations, and chronological machine learning forecasting.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-slate-500">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                <ShieldCheck className="h-3 w-3 text-forest-600" />
                <span>IS 15797:2008 Compliant</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                <Cpu className="h-3 w-3 text-water-600" />
                <span>Audited Pure NumPy ML</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                Engineering-Grade
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Platform Modules
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => onTabChange?.('dashboard')}
                  className="hover:text-forest-700 transition-colors"
                >
                  Overview & Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onTabChange?.('wizard')}
                  className="hover:text-forest-700 transition-colors"
                >
                  5-Step Property Wizard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onTabChange?.('history')}
                  className="hover:text-forest-700 transition-colors"
                >
                  Saved Analyses History
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onTabChange?.('about')}
                  className="hover:text-forest-700 transition-colors"
                >
                  Hydrological Methodology & Principles
                </button>
              </li>
            </ul>
          </div>

          {/* Technical Telemetry & Standards */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Scientific Assurance
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Strict architectural separation: Machine learning is reserved for stochastic time-series rainfall
              prediction. All hydraulic yields, demand met, and tank balances use deterministic physics.
            </p>
            {onOpenTelemetry && (
              <button
                type="button"
                onClick={onOpenTelemetry}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-forest-700 hover:text-forest-800 pt-1"
              >
                <span>Inspect ML Model Telemetry</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} RainHarvest AI. Senior Environmental & AIML Engineering System.</p>
          <div className="flex items-center space-x-4 text-[11px] font-mono">
            <span>FastAPI v0.115</span>
            <span>•</span>
            <span>React 19 + TypeScript</span>
            <span>•</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
