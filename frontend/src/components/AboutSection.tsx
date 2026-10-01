import React from 'react'
import { Cpu, Calculator, Sliders, Compass, AlertTriangle, BookOpen } from 'lucide-react'

export const AboutSection: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-10 space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-5">
        <div className="inline-flex items-center space-x-2 rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700 border border-forest-200 mb-2">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Engineering Methodology</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Core Architectural Principles & Scientific Foundations
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Designed as an engineering-grade environmental intelligence system. We enforce a strict separation
          between data-driven machine learning and deterministic physical civil formulas.
        </p>
      </div>

      {/* Core Principle Callout */}
      <div className="p-5 rounded-2xl bg-forest-50/70 border border-forest-200 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-forest-900 font-mono">
          Primary Axiom
        </span>
        <p className="text-sm font-semibold text-forest-950 leading-relaxed">
          &ldquo;Do NOT use machine learning for calculations that can be accurately performed using engineering formulas.&rdquo;
        </p>
        <p className="text-xs text-forest-800 leading-relaxed">
          Rule-based physical calculations are never mislabeled as &ldquo;AI&rdquo;. Machine learning is strictly deployed for
          uncertain time-series weather patterns where empirical data is required.
        </p>
      </div>

      {/* 4 Pillars Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar A */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Module A</span>
              <h3 className="text-sm font-bold text-slate-900">Machine Learning Rainfall Forecasting</h3>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Time-series forecasting trained on 3,600 monthly samples across 15 Indian climatic regions (2005–2024).
            Evaluated on a strictly chronological test split (2020–2024) to eliminate future data leakage.
            Models: Random Forest Regressor (R² = 0.9305, MAE = 19.07 mm) validated against
            Ordinary Least Squares Linear Regression baseline.
          </p>
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-700">
            Features: [Lag 1–3, Rolling Mean 3–6, Fourier Sine/Cosine, Elevation, Lat/Lon]
          </div>
        </div>

        {/* Pillar B */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Module B</span>
              <h3 className="text-sm font-bold text-slate-900">Deterministic Civil Hydrology</h3>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Standard physical formulas compliant with IS 15797:2008 &amp; CPWD standards.
            Because 1 mm over 1 m² = 1 Litre, gross harvest is calculated directly:
          </p>
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-700">
            V_gross = Rainfall (mm) × Roof Area (m²) × Runoff Coeff C
          </div>
          <p className="text-[11px] text-slate-500">
            Net collectable water subtracts 1.0 mm first-flush diversion for dirt rejection and incorporates 90% filter conveyance efficiency.
          </p>
        </div>

        {/* Pillar C */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Module C</span>
              <h3 className="text-sm font-bold text-slate-900">12-Month Water Balance &amp; Tank Optimization</h3>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Iterative monthly mass conservation tracking inflows, monthly demand, supplied volumes, and uncaptured overflow:
          </p>
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-700">
            Storage(t) = min(Storage(t-1) + Inflow(t) - Supplied(t), Tank Capacity)
          </div>
          <p className="text-[11px] text-slate-500">
            Evaluates 10 discrete candidate tank sizes (500 L to 50,000 L) to identify optimal capacity balancing capital expenditure vs demand coverage.
          </p>
        </div>

        {/* Pillar D */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Module D</span>
              <h3 className="text-sm font-bold text-slate-900">Multi-Criteria Decision &amp; Explainable AI</h3>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Multi-factor synthesis evaluating soil percolation rates (sandy 35 mm/hr vs clay 2 mm/hr), open ground space, existing borewells, and budget.
          </p>
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-700">
            Output: Storage-Only | Artificial Recharge | Hybrid Dual-System
          </div>
          <p className="text-[11px] text-slate-500">
            Provides full transparency checklist answering &ldquo;Why did the system recommend this?&rdquo; with civil trade-offs.
          </p>
        </div>
      </div>

      {/* Academic Limitations */}
      <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/60 space-y-2 text-xs text-amber-900">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="font-bold uppercase tracking-wider text-[11px]">Academic &amp; Engineering Limitations</span>
        </div>
        <p className="leading-relaxed">
          This platform is an automated preliminary feasibility and decision-support prototype. It does not replace
          detailed structural roof load certifications, on-site geotechnical soil percolation testing, groundwater hydrological surveys,
          or local municipal building approvals. Recharge pit and trench dimensions are preliminary sizing estimates.
        </p>
      </div>
    </div>
  )
}
export default AboutSection
