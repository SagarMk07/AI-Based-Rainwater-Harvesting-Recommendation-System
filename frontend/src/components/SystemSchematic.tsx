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
    <div className="neu-card p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEDFD8] pb-3">
        <div>
          <span className="text-xs uppercase font-mono font-bold text-forest-700 tracking-wider">
            Hydraulic Conveyance
          </span>
          <h3 className="text-base font-bold text-ink mt-0.5">
            Water Flow Architecture & Treatment Train
          </h3>
          <p className="text-xs text-ink-muted">
            End-to-end routing from atmospheric precipitation to filtration, buffer storage, household end-use, and aquifer recharge.
          </p>
        </div>
        <span className="text-xs font-mono bg-surface border border-white/80 text-ink-secondary px-3 py-1 rounded-full font-semibold shadow-neu-sm self-start sm:self-auto">
          Gravity + First-Flush Flow
        </span>
      </div>

      {/* Responsive Visual Flow Process */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 relative py-1">
        {/* Stage 1: Rain */}
        <div className="neu-card-interactive p-4 text-center space-y-2 rounded-2xl">
          <div className="h-11 w-11 mx-auto rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-neu-sm">
            <CloudRain className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-sky-800 font-bold block uppercase tracking-wider">
              Stage 1
            </span>
            <h4 className="text-xs font-bold text-ink mt-0.5">Atmospheric Rain</h4>
            <p className="text-[11px] text-ink-secondary mt-1">Precipitation Inflow</p>
            <span className="text-[10px] text-sky-900 font-mono block mt-0.5 font-semibold">Raw Catchment Input</span>
          </div>
        </div>

        {/* Stage 2: Roof */}
        <div className="neu-card-interactive p-4 text-center space-y-2 rounded-2xl">
          <div className="h-11 w-11 mx-auto rounded-xl bg-indigo-700 text-white flex items-center justify-center shadow-neu-sm">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-indigo-800 font-bold block uppercase tracking-wider">
              Stage 2
            </span>
            <h4 className="text-xs font-bold text-ink mt-0.5">Roof Catchment</h4>
            <p className="text-[11px] text-ink-secondary mt-1 font-medium">
              {roofArea} m² ({roofType.replace('_', ' ')})
            </p>
            <span className="text-[10px] text-indigo-900 font-mono block mt-0.5 font-semibold">Gutters & Downspouts</span>
          </div>
        </div>

        {/* Stage 3: Filter */}
        <div className="neu-card-interactive p-4 text-center space-y-2 rounded-2xl">
          <div className="h-11 w-11 mx-auto rounded-xl bg-forest-600 text-white flex items-center justify-center shadow-neu-sm">
            <Filter className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-forest-800 font-bold block uppercase tracking-wider">
              Stage 3
            </span>
            <h4 className="text-xs font-bold text-ink mt-0.5">First-Flush & Filter</h4>
            <p className="text-[11px] text-ink-secondary mt-1">1-2 mm Purge Diverter</p>
            <span className="text-[10px] text-forest-900 font-mono block mt-0.5 font-semibold">100µ SS Mesh Filtration</span>
          </div>
        </div>

        {/* Stage 4: Storage Tank */}
        <div className="neu-card-interactive p-4 text-center space-y-2 rounded-2xl">
          <div className="h-11 w-11 mx-auto rounded-xl bg-[#1C2C23] text-white flex items-center justify-center shadow-neu-sm">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-ink-muted font-bold block uppercase tracking-wider">
              Stage 4
            </span>
            <h4 className="text-xs font-bold text-ink mt-0.5">Buffer Storage</h4>
            <p className="text-[11px] font-bold text-forest-800 mt-1">
              {tankCapacity.toLocaleString()} Litres
            </p>
            <span className="text-[10px] text-ink-secondary font-mono block mt-0.5 font-semibold">HDPE / Roto Cistern</span>
          </div>
        </div>

        {/* Stage 5: Dual Destination */}
        <div className="neu-card-interactive p-4 text-center space-y-2 rounded-2xl">
          <div className="h-11 w-11 mx-auto rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-neu-sm">
            {hasRecharge ? <Waves className="h-5 w-5" /> : <Droplet className="h-5 w-5" />}
          </div>
          <div>
            <span className="text-[10px] font-mono text-amber-800 font-bold block uppercase tracking-wider">
              Stage 5
            </span>
            <h4 className="text-xs font-bold text-ink mt-0.5">
              {hasRecharge ? 'Household + Recharge' : 'Household End-Use'}
            </h4>
            <p className="text-[11px] text-ink-secondary mt-1 font-semibold truncate" title={rechargeName}>
              {rechargeName}
            </p>
            {rechargeDimensions && (
              <span className="text-[10px] text-amber-900 font-mono block mt-0.5 truncate font-semibold" title={rechargeDimensions}>
                {rechargeDimensions}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hydraulic note */}
      <div className="neu-inset p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-ink-secondary">
        <span className="font-bold text-ink flex items-center gap-1.5 flex-shrink-0">
          <Droplet className="h-4 w-4 text-forest-700" />
          Conveyance Principle:
        </span>
        <span className="text-xs text-ink-secondary leading-relaxed">
          Rooftop stormwater flows by gravity through the first-flush diverter into the buffer tank. Tank overflow is channeled directly into the groundwater recharge pit.
        </span>
      </div>
    </div>
  )
}
export default SystemSchematic
