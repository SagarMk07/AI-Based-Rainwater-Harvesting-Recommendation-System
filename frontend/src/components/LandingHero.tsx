import React from 'react'
import {
  ArrowRight,
  CloudRain,
  Home,
  Filter,
  Database,
  Waves,
  Sparkles,
  Sliders,
  DollarSign,
  Activity,
} from 'lucide-react'

interface LandingHeroProps {
  onStartAnalysis: () => void
  onOpenTelemetry: () => void
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartAnalysis,
  onOpenTelemetry,
}) => {
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-elevated border border-slate-800">
        {/* Subtle background ambient gradients */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-forest-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-water-500/15 blur-3xl pointer-events-none" />

        <div className="relative px-6 py-12 sm:px-12 sm:py-16 lg:py-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 rounded-full bg-forest-500/10 px-3.5 py-1 text-xs font-semibold text-forest-400 border border-forest-500/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="tracking-wide uppercase font-mono text-[11px]">
                  AI-Powered Water Intelligence
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                Turn Rainfall Into a Reliable Water Source
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Analyze your property, estimate rainwater potential, and receive an AI-powered
                harvesting recommendation designed around your water needs. Combining physical
                hydrological formulas with chronological machine learning forecasting.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onStartAnalysis}
                  className="px-6 py-3.5 rounded-xl bg-forest-600 hover:bg-forest-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <span>Analyze My Property</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={scrollToHowItWorks}
                  className="px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 font-semibold text-sm transition-colors"
                >
                  See How It Works
                </button>
              </div>

              {/* Verified Product Metrics */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-white block">
                    15
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    IMD Climate Zones
                  </span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-forest-400 block">
                    93.05%
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    ML Regressor R²
                  </span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-water-300 block">
                    12-Month
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Water-Balance Cycle
                  </span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-amber-300 block">
                    100%
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Deterministic Runoff
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: Engineering Hydraulic Flow Pipeline */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-700/80 bg-slate-800/60 backdrop-blur-md p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-forest-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Physical Hydraulic Flow Process
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-forest-950 text-forest-400 border border-forest-800 px-2 py-0.5 rounded">
                    IS 15797 / CPWD
                  </span>
                </div>

                {/* 4 Flow Stages */}
                <div className="space-y-3 text-xs">
                  {/* Step 1: Precipitation */}
                  <div className="flex items-center space-x-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    <div className="h-9 w-9 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center flex-shrink-0">
                      <CloudRain className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <span className="font-semibold text-white">1. Local Rainfall Inflow</span>
                        <span className="font-mono text-sky-400 text-[11px]">900–2200 mm</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate">
                        Chronological time-series prediction
                      </span>
                    </div>
                  </div>

                  {/* Step 2: Catchment */}
                  <div className="flex items-center space-x-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    <div className="h-9 w-9 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                      <Home className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <span className="font-semibold text-white">2. Catchment Runoff</span>
                        <span className="font-mono text-indigo-400 text-[11px]">C = 0.85 (RCC)</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate">
                        Gross Harvest = Rain × Area × Coeff
                      </span>
                    </div>
                  </div>

                  {/* Step 3: First Flush & Filtration */}
                  <div className="flex items-center space-x-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    <div className="h-9 w-9 rounded-lg bg-forest-500/20 text-forest-400 border border-forest-500/30 flex items-center justify-center flex-shrink-0">
                      <Filter className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <span className="font-semibold text-white">3. First-Flush & Mesh Filter</span>
                        <span className="font-mono text-forest-400 text-[11px]">η = 90%</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate">
                        1-2 mm initial roof dirt diversion
                      </span>
                    </div>
                  </div>

                  {/* Step 4: Storage or Recharge */}
                  <div className="flex items-center space-x-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    <div className="h-9 w-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                      <Database className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <span className="font-semibold text-white">4. Buffer Storage & Aquifer</span>
                        <span className="font-mono text-amber-400 text-[11px]">Optimal Sizing</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate">
                        Simulation-guided capacity vs recharge
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700/60">
                  <span>Traceable physical logic</span>
                  <button
                    onClick={onOpenTelemetry}
                    className="text-forest-400 hover:text-forest-300 font-semibold transition-colors"
                  >
                    Inspect Model Verification →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-mono font-bold text-forest-700 tracking-wider">
            Assessment Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How the Intelligence System Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            From physical catchment inputs to optimized tank and aquifer recharge designs in four steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle hover:shadow-card transition-shadow space-y-3">
            <span className="text-2xl font-black font-mono text-forest-700">01</span>
            <h3 className="text-base font-bold text-slate-900">Enter Property Details</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Specify your city, roof material (RCC, sheet, tiles), catchment area in m², and household water usage.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle hover:shadow-card transition-shadow space-y-3">
            <span className="text-2xl font-black font-mono text-water-600">02</span>
            <h3 className="text-base font-bold text-slate-900">Analyze Rainfall</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The engine accesses 30-year IMD climatological normals or runs the trained ML time-series model for your zone.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle hover:shadow-card transition-shadow space-y-3">
            <span className="text-2xl font-black font-mono text-indigo-600">03</span>
            <h3 className="text-base font-bold text-slate-900">AI Evaluates Options</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A 12-month iterative water balance tests multiple tank capacities (500 L to 50,000 L) against budget and overflow.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle hover:shadow-card transition-shadow space-y-3">
            <span className="text-2xl font-black font-mono text-amber-600">04</span>
            <h3 className="text-base font-bold text-slate-900">Get Recommendation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive a complete engineering report: recommended system (Storage, Pit, Trench, or Hybrid), cost, and dynamic rationale.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Section (6 Clean Cards) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-mono font-bold text-forest-700 tracking-wider">
            System Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Real Engineering Features Built into the Platform
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            No mock calculations or artificial stats. Every feature is backed by proven formulas and ML models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle hover:shadow-card transition-shadow space-y-3">
            <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center">
              <CloudRain className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Rainfall Analysis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Analyzes historical monthly distribution and seasonal monsoon surges across 15 climate stations using IMD climatological normals.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle hover:shadow-card transition-shadow space-y-3">
            <div className="h-10 w-10 rounded-xl bg-forest-50 text-forest-700 border border-forest-100 flex items-center justify-center">
              <Home className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Harvest Potential</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates theoretical Gross Harvest and net Collectable Water using standard runoff coefficients for RCC, metal sheets, and clay tiles.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle hover:shadow-card transition-shadow space-y-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">AI Recommendation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Synthesizes site constraints (soil percolation, open area, demand, existing borewell) to determine whether storage, recharge, or hybrid is optimal.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle hover:shadow-card transition-shadow space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center">
              <Sliders className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Storage Planning</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Simulates candidate capacities from 500L to 50,000L with an objective function balancing shortage penalty, overflow, and budget constraints.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle hover:shadow-card transition-shadow space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
              <Waves className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Groundwater Recharge</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Evaluates infiltration suitability across sandy, loamy, silty, and clay soils to recommend sizing for recharge pits, trenches, or injection shafts.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle hover:shadow-card transition-shadow space-y-3">
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Savings & Payback Estimation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Estimates capital expenditure (tank, filter, piping, excavation) and computes annual financial savings against municipal water tariffs.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
