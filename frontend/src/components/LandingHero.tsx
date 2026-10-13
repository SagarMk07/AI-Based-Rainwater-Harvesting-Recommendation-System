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
  Clock,
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
    const el = document.getElementById('how-it-works')
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="space-y-16 py-2 sm:py-6">
      {/* Editorial Contrasting Hero Surface */}
      <section className="relative overflow-hidden rounded-3xl bg-[#132018] text-white shadow-2xl border border-white/10 p-6 sm:p-10 lg:p-12">
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 rounded-full bg-[#1C2C22] px-3.5 py-1 text-xs font-semibold text-[#EEEEEA] border border-white/15">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>AI-Powered Water Intelligence</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Turn Rainfall Into a{' '}
                <span className="text-emerald-400">Reliable Water Source</span>
              </h1>

              <p className="text-sm sm:text-base text-[#D4D6D2] leading-relaxed max-w-2xl font-normal">
                Analyze your property, estimate rainwater potential, and receive an AI-powered
                harvesting recommendation designed around your water needs. Combining physical
                hydrological formulas with chronological machine learning forecasting.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onStartAnalysis}
                  className="h-11 px-6 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm shadow-[3px_3px_10px_rgba(22,132,71,0.35),-2px_-2px_6px_rgba(255,255,255,0.2)] transition-all inline-flex items-center space-x-2"
                >
                  <span>Analyze My Property</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={scrollToHowItWorks}
                  className="h-11 px-5 rounded-xl bg-[#1C2C22] hover:bg-[#23372B] text-[#EEEEEA] border border-white/10 font-semibold text-sm transition-colors inline-flex items-center"
                >
                  See How It Works
                </button>
              </div>

              {/* Verified Product Metrics */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-white block">
                    15
                  </span>
                  <span className="text-[11px] text-[#A8ACA8] font-medium">
                    IMD Climate Zones
                  </span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 block">
                    93.05%
                  </span>
                  <span className="text-[11px] text-[#A8ACA8] font-medium">
                    ML Regressor R²
                  </span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-sky-300 block">
                    12-Month
                  </span>
                  <span className="text-[11px] text-[#A8ACA8] font-medium">
                    Water-Balance Cycle
                  </span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-amber-300 block">
                    100%
                  </span>
                  <span className="text-[11px] text-[#A8ACA8] font-medium">
                    Deterministic Runoff
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: Engineering Hydraulic Flow Pipeline */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/10 bg-[#17251C]/90 p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#EEEEEA]">
                      Physical Hydraulic Flow Process
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#0B150F] text-emerald-400 border border-emerald-900/60 px-2 py-0.5 rounded">
                    IS 15797 / CPWD
                  </span>
                </div>

                {/* 4 Flow Stages */}
                <div className="space-y-3 text-xs">
                  {/* Step 1: Precipitation */}
                  <div className="flex items-center space-x-3.5 p-3 rounded-xl bg-[#101B14] border border-white/5">
                    <div className="h-9 w-9 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center flex-shrink-0">
                      <CloudRain className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <span className="font-semibold text-white">1. Local Rainfall Inflow</span>
                        <span className="font-mono text-sky-400 text-[11px]">900–2200 mm</span>
                      </div>
                      <span className="text-[11px] text-[#A5B8AC] block truncate">
                        Climate-calibrated IMD precipitation normals
                      </span>
                    </div>
                  </div>

                  {/* Step 2: Catchment */}
                  <div className="flex items-center space-x-3.5 p-3 rounded-xl bg-[#101B14] border border-white/5">
                    <div className="h-9 w-9 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                      <Home className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <span className="font-semibold text-white">2. Rooftop Interception</span>
                        <span className="font-mono text-indigo-400 text-[11px]">C = 0.75–0.90</span>
                      </div>
                      <span className="text-[11px] text-[#A5B8AC] block truncate">
                        Surface material runoff coefficient factor
                      </span>
                    </div>
                  </div>

                  {/* Step 3: First-Flush */}
                  <div className="flex items-center space-x-3.5 p-3 rounded-xl bg-[#101B14] border border-white/5">
                    <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                      <Filter className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <span className="font-semibold text-white">3. First-Flush & Filter</span>
                        <span className="font-mono text-emerald-400 text-[11px]">1–1.5 mm Purge</span>
                      </div>
                      <span className="text-[11px] text-[#A5B8AC] block truncate">
                        Automated diversion of early atmospheric dust
                      </span>
                    </div>
                  </div>

                  {/* Step 4: Storage & Recharge */}
                  <div className="flex items-center space-x-3.5 p-3 rounded-xl bg-[#101B14] border border-white/5">
                    <div className="h-9 w-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                      <Database className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <span className="font-semibold text-white">4. Buffer Storage & Aquifer</span>
                        <span className="font-mono text-amber-400 text-[11px]">Optimal Sizing</span>
                      </div>
                      <span className="text-[11px] text-[#A5B8AC] block truncate">
                        Simulation-guided capacity vs recharge
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-[#A5B8AC] border-t border-white/10">
                  <span>Traceable physical logic</span>
                  <button
                    onClick={onOpenTelemetry}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
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
          <h2 className="text-2xl sm:text-3xl font-black text-[#252B26]">
            How the Intelligence System Works
          </h2>
          <p className="text-xs sm:text-sm text-[#687068]">
            From physical catchment inputs to optimized tank and aquifer recharge designs in four steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="neu-card-interactive p-6 flex flex-col justify-between h-full space-y-3 min-w-0">
            <div>
              <span className="text-2xl font-black font-mono text-forest-700 block mb-2">01</span>
              <h3 className="text-base font-bold text-[#252B26]">Enter Property Details</h3>
              <p className="text-xs text-[#687068] leading-relaxed mt-1">
                Specify your city, roof material (RCC, sheet, tiles), catchment area in m², and household water usage.
              </p>
            </div>
          </div>

          <div className="neu-card-interactive p-6 flex flex-col justify-between h-full space-y-3 min-w-0">
            <div>
              <span className="text-2xl font-black font-mono text-water-600 block mb-2">02</span>
              <h3 className="text-base font-bold text-[#252B26]">Analyze Rainfall</h3>
              <p className="text-xs text-[#687068] leading-relaxed mt-1">
                The engine accesses 30-year IMD climatological normals or runs the trained ML time-series model for your zone.
              </p>
            </div>
          </div>

          <div className="neu-card-interactive p-6 flex flex-col justify-between h-full space-y-3 min-w-0">
            <div>
              <span className="text-2xl font-black font-mono text-forest-600 block mb-2">03</span>
              <h3 className="text-base font-bold text-[#252B26]">AI Evaluates Options</h3>
              <p className="text-xs text-[#687068] leading-relaxed mt-1">
                A 12-month iterative water balance tests multiple tank capacities (500 L to 50,000 L) against budget and overflow.
              </p>
            </div>
          </div>

          <div className="neu-card-interactive p-6 flex flex-col justify-between h-full space-y-3 min-w-0">
            <div>
              <span className="text-2xl font-black font-mono text-[#252B26] block mb-2">04</span>
              <h3 className="text-base font-bold text-[#252B26]">Get Recommendation</h3>
              <p className="text-xs text-[#687068] leading-relaxed mt-1">
                Receive a complete engineering report: recommended system (Storage, Pit, Trench, or Hybrid), cost, and dynamic rationale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section (6 Tactile Neumorphic Cards) */}
      <section id="features" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-mono font-bold text-forest-700 tracking-wider">
            System Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#252B26]">
            Real Engineering Features Built into the Platform
          </h2>
          <p className="text-xs sm:text-sm text-[#687068]">
            No mock calculations or artificial stats. Every feature is backed by proven formulas and ML models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="neu-card-interactive p-6 flex flex-col justify-between h-full space-y-3 min-w-0">
            <div>
              <div className="h-10 w-10 rounded-xl bg-[#EEEEEA] text-water-600 border border-[#DEDFD8] shadow-neu-sm flex items-center justify-center mb-3">
                <CloudRain className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#252B26]">Rainfall Analysis</h3>
              <p className="text-xs text-[#687068] leading-relaxed mt-1">
                Analyzes historical monthly distribution and seasonal monsoon surges across 15 climate stations using IMD climatological normals.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="neu-card-interactive p-6 flex flex-col justify-between h-full space-y-3 min-w-0">
            <div>
              <div className="h-10 w-10 rounded-xl bg-[#EEEEEA] text-forest-600 border border-[#DEDFD8] shadow-neu-sm flex items-center justify-center mb-3">
                <Home className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#252B26]">Harvest Potential</h3>
              <p className="text-xs text-[#687068] leading-relaxed mt-1">
                Calculates theoretical Gross Harvest and net Collectable Water using standard runoff coefficients for RCC, metal sheets, and clay tiles.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="neu-card-interactive p-6 flex flex-col justify-between h-full space-y-3 min-w-0">
            <div>
              <div className="h-10 w-10 rounded-xl bg-[#EEEEEA] text-forest-600 border border-[#DEDFD8] shadow-neu-sm flex items-center justify-center mb-3">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#252B26]">AI Recommendation</h3>
              <p className="text-xs text-[#687068] leading-relaxed mt-1">
                Synthesizes site constraints (soil percolation, open area, demand, existing borewell) to determine whether storage, recharge, or hybrid is optimal.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="neu-card-interactive p-6 flex flex-col justify-between h-full space-y-3 min-w-0">
            <div>
              <div className="h-10 w-10 rounded-xl bg-[#EEEEEA] text-amber-600 border border-[#DEDFD8] shadow-neu-sm flex items-center justify-center mb-3">
                <Sliders className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#252B26]">Storage Planning</h3>
              <p className="text-xs text-[#687068] leading-relaxed mt-1">
                Simulates candidate capacities from 500L to 50,000L with an objective function balancing shortage penalty, overflow, and budget constraints.
              </p>
            </div>
          </div>

          {/* Card 5 */}
          <div className="neu-card-interactive p-6 flex flex-col justify-between h-full space-y-3 min-w-0">
            <div>
              <div className="h-10 w-10 rounded-xl bg-[#EEEEEA] text-forest-700 border border-[#DEDFD8] shadow-neu-sm flex items-center justify-center mb-3">
                <Waves className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#252B26]">Groundwater Recharge</h3>
              <p className="text-xs text-[#687068] leading-relaxed mt-1">
                Evaluates infiltration suitability across sandy, loamy, silty, and clay soils to recommend sizing for recharge pits, trenches, or injection shafts.
              </p>
            </div>
          </div>

          {/* Card 6 */}
          <div className="neu-card-interactive p-6 flex flex-col justify-between h-full space-y-3 min-w-0">
            <div>
              <div className="h-10 w-10 rounded-xl bg-[#EEEEEA] text-[#252B26] border border-[#DEDFD8] shadow-neu-sm flex items-center justify-center mb-3">
                <DollarSign className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#252B26]">Savings & Payback Estimation</h3>
              <p className="text-xs text-[#687068] leading-relaxed mt-1">
                Estimates capital expenditure (tank, filter, piping, excavation) and computes annual financial savings against municipal water tariffs.
              </p>
            </div>
          </div>

          {/* Card 7: Analysis History */}
          <div className="neu-card-interactive p-6 flex flex-col justify-between h-full space-y-3 min-w-0">
            <div>
              <div className="h-10 w-10 rounded-xl bg-[#EEEEEA] text-forest-700 border border-[#DEDFD8] shadow-neu-sm flex items-center justify-center mb-3">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#252B26]">Analysis History</h3>
              <p className="text-xs text-[#687068] leading-relaxed mt-1">
                Reopen and review completed property assessments without recalculation. Seamlessly track sizing recommendations and historical metrics across sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default LandingHero
