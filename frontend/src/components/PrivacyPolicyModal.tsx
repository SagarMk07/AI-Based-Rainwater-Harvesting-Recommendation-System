import { X, ShieldCheck, MapPin, Home, Droplets, Database, Lock } from 'lucide-react'

interface PrivacyPolicyModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-100 text-forest-800">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 id="privacy-modal-title" className="text-base font-bold text-slate-900">
                Data Privacy & Hydrological Governance
              </h2>
              <p className="text-xs text-slate-500">
                Transparent data practices for engineering intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close privacy notice"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-5 text-xs text-slate-600 leading-relaxed">
          <p className="text-sm font-medium text-slate-800">
            RainHarvest AI is built with privacy-by-design. We only process data strictly necessary to compute accurate rainwater harvesting sizing, groundwater recharge rates, and financial feasibility.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-800 font-bold">
                <Home className="h-4 w-4 text-forest-700" />
                <span>Property Parameters</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Rooftop area (m²), catchment surface material, unpaved open space, and building occupant counts are processed solely for volumetric runoff calculation.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-800 font-bold">
                <MapPin className="h-4 w-4 text-water-700" />
                <span>Geographical Location</span>
              </div>
              <p className="text-[11px] text-slate-500">
                City name or GPS coordinates are used exclusively to query official IMD (India Meteorological Department) rainfall normals and reanalysis data.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-800 font-bold">
                <Droplets className="h-4 w-4 text-water-600" />
                <span>Water Consumption</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Daily and seasonal consumption numbers are modeled against Bureau of Indian Standards (IS 1172:1993) benchmarks to simulate dry-period water balance.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-800 font-bold">
                <Database className="h-4 w-4 text-slate-700" />
                <span>Analysis History</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Logged-in users retain private calculation histories protected by PostgreSQL Row-Level Security (RLS). Guest calculations are strictly ephemeral.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold">
              <Lock className="h-4 w-4 text-emerald-700" />
              <span>Security Guarantee</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-emerald-800">
              <li>No personal information is sold, shared with advertisers, or leveraged for commercial tracking.</li>
              <li>Row-Level Security guarantees cross-tenant isolation: other users cannot inspect your properties or tank sizing.</li>
              <li>You may request complete account and data deletion at any time using the "Delete Account" option in your profile.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  )
}
