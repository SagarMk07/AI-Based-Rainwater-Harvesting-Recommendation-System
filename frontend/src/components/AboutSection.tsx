import React from 'react'
import { Cpu, Calculator, Sliders, Compass, AlertTriangle, BookOpen } from 'lucide-react'
import { PageHeader } from './ui/PageHeader'

export const AboutSection: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-[#EEEEEA] px-3 py-1 text-xs font-semibold text-forest-700 border border-forest-600/30">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Engineering Methodology</span>
          </span>
        }
        title="Core Architectural Principles & Scientific Foundations"
        description="Designed as an engineering-grade environmental intelligence system. We enforce a strict separation between data-driven machine learning and deterministic physical civil formulas."
      />

      {/* Core Principle Callout */}
      <div className="neu-card p-5 sm:p-6 space-y-2 rounded-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-forest-700 font-mono">
          Primary Axiom
        </span>
        <p className="text-sm sm:text-base font-black text-ink leading-relaxed">
          &ldquo;Do NOT use machine learning for calculations that can be accurately performed using engineering formulas.&rdquo;
        </p>
        <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
          Rule-based physical calculations are never mislabeled as &ldquo;AI&rdquo;. Machine learning is strictly deployed for
          uncertain time-series weather patterns where empirical data is required.
        </p>
      </div>

      {/* 4 Pillars Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar A */}
        <div className="neu-card p-5 sm:p-6 space-y-3.5 rounded-3xl">
          <div className="flex items-center space-x-2.5">
            <div className="h-10 w-10 rounded-2xl bg-surface border border-white/80 shadow-neu-sm text-forest-700 flex items-center justify-center">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-forest-700 uppercase">Module A</span>
              <h3 className="text-sm font-bold text-ink">Machine Learning Rainfall Forecasting</h3>
            </div>
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Time-series forecasting trained on 3,600 monthly samples across 15 Indian climatic regions (2005–2024).
            Evaluated on a strictly chronological test split (2020–2024) to eliminate future data leakage.
            Models: Random Forest Regressor (R² = 0.9305, MAE = 19.07 mm) validated against
            Ordinary Least Squares Linear Regression baseline.
          </p>
          <div className="p-3 rounded-xl neu-inset text-[11px] font-mono text-ink">
            Features: [Lag 1–3, Rolling Mean 3–6, Fourier Sine/Cosine, Elevation, Lat/Lon]
          </div>
        </div>

        {/* Pillar B */}
        <div className="neu-card p-5 sm:p-6 space-y-3.5 rounded-3xl">
          <div className="flex items-center space-x-2.5">
            <div className="h-10 w-10 rounded-2xl bg-surface border border-white/80 shadow-neu-sm text-sky-700 flex items-center justify-center">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-sky-800 uppercase">Module B</span>
              <h3 className="text-sm font-bold text-ink">Deterministic Civil Hydrology</h3>
            </div>
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Standard physical formulas compliant with IS 15797:2008 &amp; CPWD standards.
            Because 1 mm over 1 m² = 1 Litre, gross harvest is calculated directly:
          </p>
          <div className="p-3 rounded-xl neu-inset text-[11px] font-mono text-ink">
            V_gross = Rainfall (mm) × Roof Area (m²) × Runoff Coeff C
          </div>
          <p className="text-[11px] text-ink-muted">
            Net collectable water subtracts 1.0 mm first-flush diversion for dirt rejection and incorporates 90% filter conveyance efficiency.
          </p>
        </div>

        {/* Pillar C */}
        <div className="neu-card p-5 sm:p-6 space-y-3.5 rounded-3xl">
          <div className="flex items-center space-x-2.5">
            <div className="h-10 w-10 rounded-2xl bg-surface border border-white/80 shadow-neu-sm text-indigo-700 flex items-center justify-center">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-800 uppercase">Module C</span>
              <h3 className="text-sm font-bold text-ink">12-Month Water Balance &amp; Tank Optimization</h3>
            </div>
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Iterative monthly mass conservation tracking inflows, monthly demand, supplied volumes, and uncaptured overflow:
          </p>
          <div className="p-3 rounded-xl neu-inset text-[11px] font-mono text-ink">
            Storage(t) = min(Storage(t-1) + Inflow(t) - Supplied(t), Tank Capacity)
          </div>
          <p className="text-[11px] text-ink-muted">
            Evaluates 10 discrete candidate tank sizes (500 L to 50,000 L) to identify optimal capacity balancing capital expenditure vs demand coverage.
          </p>
        </div>

        {/* Pillar D */}
        <div className="neu-card p-5 sm:p-6 space-y-3.5 rounded-3xl">
          <div className="flex items-center space-x-2.5">
            <div className="h-10 w-10 rounded-2xl bg-surface border border-white/80 shadow-neu-sm text-amber-700 flex items-center justify-center">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-800 uppercase">Module D</span>
              <h3 className="text-sm font-bold text-ink">Multi-Criteria Decision &amp; Explainable AI</h3>
            </div>
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Multi-factor synthesis evaluating soil percolation rates (sandy 35 mm/hr vs clay 2 mm/hr), open ground space, existing borewells, and budget.
          </p>
          <div className="p-3 rounded-xl neu-inset text-[11px] font-mono text-ink">
            Output: Storage-Only | Artificial Recharge | Hybrid Dual-System
          </div>
          <p className="text-[11px] text-ink-muted">
            Provides full transparency checklist answering &ldquo;Why did the system recommend this?&rdquo; with civil trade-offs.
          </p>
        </div>
      </div>

      {/* Academic Limitations */}
      <div className="neu-card p-5 sm:p-6 space-y-2 text-xs text-amber-900 rounded-3xl border border-amber-300/80 bg-amber-50/50">
        <div className="flex items-center space-x-2 text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-bold uppercase tracking-wider text-[11px]">Academic &amp; Engineering Limitations</span>
        </div>
        <p className="leading-relaxed text-amber-950">
          This platform is an automated preliminary feasibility and decision-support prototype. It does not replace
          detailed structural roof load certifications, on-site geotechnical soil percolation testing, groundwater hydrological surveys,
          or local municipal building approvals. Recharge pit and trench dimensions are preliminary sizing estimates.
        </p>
      </div>
    </div>
  )
}
export default AboutSection
