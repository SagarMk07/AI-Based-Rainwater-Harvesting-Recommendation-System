import React from 'react'
import { CloudRain, Home, Filter, Database, Droplet, Waves } from 'lucide-react'

interface Props {
  roofType: string
  roofArea: number
  tankCapacity: number
  rechargeName: string
  rechargeDimensions?: string
  hasRecharge?: boolean
}

export const SystemSchematic: React.FC<Props> = ({
  roofType,
  roofArea,
  tankCapacity,
  rechargeName,
  rechargeDimensions,
  hasRecharge = true,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-subtle space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <span className="text-xs uppercase font-mono font-bold text-forest-700 tracking-wider">
            Hydraulic Conveyance
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
            Water Flow Architecture & Treatment Train
          </h3>
          <p className="text-xs text-slate-500">
            End-to-end routing from atmospheric precipitation to filtration, buffer storage, household end-use, and aquifer recharge.
          </p>
        </div>
        <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium self-start sm:self-auto">
          Gravity + First-Flush Flow
        </span>
      </div>

      {/* Responsive Visual Flow Process */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative py-1">
        {/* Stage 1: Rain */}
        <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 text-center space-y-2 relative group hover:border-sky-300 transition-colors">
          <div className="h-10 w-10 mx-auto rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-sm">
            <CloudRain className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-sky-700 font-bold block uppercase tracking-wider">
              Stage 1
            </span>
            <h4 className="text-xs font-bold text-slate-900 mt-0.5">Rainfall</h4>
            <p className="text-[11px] text-slate-600 mt-1">Atmospheric Inflow</p>
            <span className="text-[10px] text-sky-800 font-mono block mt-0.5">Hydrological Input</span>
          </div>
        </div>

        {/* Stage 2: Roof */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 text-center space-y-2 relative group hover:border-indigo-300 transition-colors">
          <div className="h-10 w-10 mx-auto rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-indigo-700 font-bold block uppercase tracking-wider">
              Stage 2
            </span>
            <h4 className="text-xs font-bold text-slate-900 mt-0.5">Roof Catchment</h4>
            <p className="text-[11px] text-slate-600 mt-1">
              {roofArea} m² ({roofType.replace('_', ' ')})
            </p>
            <span className="text-[10px] text-indigo-800 font-mono block mt-0.5">Gutters & Downspouts</span>
          </div>
        </div>

        {/* Stage 3: Filter */}
        <div className="rounded-xl border border-forest-200 bg-forest-50/40 p-4 text-center space-y-2 relative group hover:border-forest-300 transition-colors">
          <div className="h-10 w-10 mx-auto rounded-xl bg-forest-600 text-white flex items-center justify-center shadow-sm">
            <Filter className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-forest-700 font-bold block uppercase tracking-wider">
              Stage 3
            </span>
            <h4 className="text-xs font-bold text-slate-900 mt-0.5">First-Flush & Filter</h4>
            <p className="text-[11px] text-slate-600 mt-1">1-2 mm Purge Diverter</p>
            <span className="text-[10px] text-forest-800 font-mono block mt-0.5">100µ SS Mesh Filtration</span>
          </div>
        </div>

        {/* Stage 4: Storage Tank */}
        <div className="rounded-xl border border-slate-300 bg-slate-50/60 p-4 text-center space-y-2 relative group hover:border-slate-400 transition-colors">
          <div className="h-10 w-10 mx-auto rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-sm">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-600 font-bold block uppercase tracking-wider">
              Stage 4
            </span>
            <h4 className="text-xs font-bold text-slate-900 mt-0.5">Buffer Storage</h4>
            <p className="text-[11px] font-bold text-forest-800 mt-1">
              {tankCapacity.toLocaleString()} Litres
            </p>
            <span className="text-[10px] text-slate-600 font-mono block mt-0.5">Multi-Layer HDPE / Roto</span>
          </div>
        </div>

        {/* Stage 5: Dual Destination (Household Supply or Recharge) */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-center space-y-2 relative group hover:border-amber-300 transition-colors">
          <div className="h-10 w-10 mx-auto rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
            {hasRecharge ? <Waves className="h-5 w-5" /> : <Droplet className="h-5 w-5" />}
          </div>
          <div>
            <span className="text-[10px] font-mono text-amber-700 font-bold block uppercase tracking-wider">
              Stage 5
            </span>
            <h4 className="text-xs font-bold text-slate-900 mt-0.5">
              {hasRecharge ? 'Household + Aquifer' : 'Household End-Use'}
            </h4>
            <p className="text-[11px] text-slate-700 mt-1 font-medium truncate" title={rechargeName}>
              {rechargeName}
            </p>
            {rechargeDimensions && (
              <span className="text-[10px] text-amber-800 font-mono block mt-0.5 truncate" title={rechargeDimensions}>
                {rechargeDimensions}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hydraulic note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600">
        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
          <Droplet className="h-3.5 w-3.5 text-water-600" />
          Conveyance Principle:
        </span>
        <span>
          Rooftop stormwater flows by gravity through the first-flush diverter into the buffer tank. Tank overflow is channeled directly into the groundwater recharge pit.
        </span>
      </div>
    </div>
  )
}
