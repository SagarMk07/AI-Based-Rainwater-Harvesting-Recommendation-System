import type { FC } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Cpu,
  Calculator,
  Sliders,
  CheckCircle,
  ShieldCheck,
  Compass,
} from 'lucide-react'
import { StatusCard } from '../components/StatusCard'
import type { HealthResponse } from '../types/health'

interface OutletContextType {
  health: HealthResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export const HomePage: FC = () => {
  const { health, loading, error, refetch } = useOutletContext<OutletContextType>()

  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Hero Section */}
        <section className="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white p-8 sm:p-12 shadow-xl border border-slate-700/50">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Phase 1 Verified · Engineering Foundation Active</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Turn Rainfall Into a Reliable Water Resource
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              An engineering-grade intelligence and optimization system that blends deterministic
              civil hydrology, time-series machine learning, dynamic water-balance simulation,
              and multi-criteria optimization.
            </p>
            <div className="pt-2 flex flex-wrap gap-3 text-xs">
              <span className="bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700 text-slate-300 font-mono">
                No Fake Numbers
              </span>
              <span className="bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700 text-slate-300 font-mono">
                Physical Runoff Formulas
              </span>
              <span className="bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700 text-slate-300 font-mono">
                Explainable ML
              </span>
            </div>
          </div>
        </section>

        {/* Real-Time System Connectivity Telemetry */}
        <section>
          <StatusCard
            health={health}
            loading={loading}
            error={error}
            onRefresh={refetch}
          />
        </section>

        {/* Core Architectural Separation Pillars */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">
              Architectural Separation of Concerns
            </h2>
            <p className="text-xs text-slate-500">
              Machine learning is strictly applied to uncertain time-series tasks, while physical laws govern water calculations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">A. Machine Learning</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rainfall time-series forecasting using chronological splitting (Random Forest & Linear Regression baseline). Validated with MAE, RMSE, and R².
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="h-9 w-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                <Calculator className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">B. Engineering Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standard hydrological formulas calculating Gross Harvest Potential, Collectable Water, and Net Usable Water based on roof material coefficients.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                <Sliders className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">C. Optimization</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                12-month iterative water-balance simulation testing candidate capacities (500L to 50,000L) against shortage, overflow, and budget penalties.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="h-9 w-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">D. Recommender</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-criteria synthesis evaluating storage vs recharge (pits, trenches, wells, hybrid) with dynamic explanations and cost-benefit trade-offs.
              </p>
            </div>
          </div>
        </section>

        {/* Phased Roadmap Progress */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Engineering Development Roadmap
              </h3>
              <p className="text-xs text-slate-500">
                Controlled phase-by-phase implementation adhering to strict stop rules.
              </p>
            </div>
            <span className="font-mono text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full">
              Phase 1 Complete
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-emerald-300 bg-emerald-50/50 flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-emerald-900 block">Phase 1: Foundation</span>
                <span className="text-[11px] text-emerald-700">Architecture, Backend, Frontend, Health API</span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start space-x-2 opacity-75">
              <div className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-500 mt-0.5 flex-shrink-0">
                2
              </div>
              <div>
                <span className="font-semibold text-slate-700 block">Phase 2: Data Pipeline</span>
                <span className="text-[11px] text-slate-500">Ingestion, Validation, Time-Series Preprocessing</span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start space-x-2 opacity-75">
              <div className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-500 mt-0.5 flex-shrink-0">
                3
              </div>
              <div>
                <span className="font-semibold text-slate-700 block">Phase 3: Rainfall ML</span>
                <span className="text-[11px] text-slate-500">Chronological Split, RF Regressor, Evaluation</span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start space-x-2 opacity-75">
              <div className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-500 mt-0.5 flex-shrink-0">
                4-16
              </div>
              <div>
                <span className="font-semibold text-slate-700 block">Subsequent Phases</span>
                <span className="text-[11px] text-slate-500">Water Engine, Optimization, Wizard UI, Polish</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
