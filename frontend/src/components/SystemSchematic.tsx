import { Home, Filter, Database, Waves } from 'lucide-react'

interface Props {
  roofType: string
  roofArea: number
  tankCapacity: number
  rechargeName: string
  rechargeDimensions?: string
}

export const SystemSchematic: React.FC<Props> = ({
  roofType,
  roofArea,
  tankCapacity,
  rechargeName,
  rechargeDimensions,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900">Engineering System Architecture & Hydraulic Flow</h3>
        <p className="text-xs text-slate-500">
          Schematic representation of catchment runoff routing, primary filtration, buffer storage, and sub-surface aquifer recharge.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative py-2">
        {/* Stage 1: Rooftop Catchment */}
        <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 text-center space-y-2 relative">
          <div className="h-10 w-10 mx-auto rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-sm">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Catchment</h4>
            <p className="text-[11px] text-slate-600 mt-1">
              {roofArea} m² ({roofType.toUpperCase().replace('_', ' ')})
            </p>
            <span className="text-[10px] text-sky-700 font-mono block mt-1">Gutter Conveyance</span>
          </div>
        </div>

        {/* Stage 2: Filtration & First Flush */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-center space-y-2 relative">
          <div className="h-10 w-10 mx-auto rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Filter className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. First-Flush & Filter</h4>
            <p className="text-[11px] text-slate-600 mt-1">1-2 mm First-Flush Diverter</p>
            <span className="text-[10px] text-emerald-700 font-mono block mt-1">100µ SS Mesh Filter</span>
          </div>
        </div>

        {/* Stage 3: Buffer Storage Tank */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 text-center space-y-2 relative">
          <div className="h-10 w-10 mx-auto rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. Buffer Storage</h4>
            <p className="text-[11px] font-bold text-indigo-950 mt-1">{tankCapacity.toLocaleString()} Litres</p>
            <span className="text-[10px] text-indigo-700 font-mono block mt-1">Daily Household Supply</span>
          </div>
        </div>

        {/* Stage 4: Groundwater Recharge */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-center space-y-2 relative">
          <div className="h-10 w-10 mx-auto rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm">
            <Waves className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">4. Aquifer Recharge</h4>
            <p className="text-[11px] text-slate-700 mt-1 font-semibold">{rechargeName}</p>
            {rechargeDimensions && (
              <span className="text-[10px] text-amber-800 font-mono block mt-1 truncate" title={rechargeDimensions}>
                {rechargeDimensions}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
