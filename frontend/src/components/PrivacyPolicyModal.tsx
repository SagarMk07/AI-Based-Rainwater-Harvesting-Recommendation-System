import React from 'react'
import { X, ShieldCheck, MapPin, Home, Droplets, Database, Lock } from 'lucide-react'

interface PrivacyPolicyModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#252B26]/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl neu-card bg-[#F4F4F0] border border-[#DEDFD8] shadow-neu-lg p-6 sm:p-8 text-ink">
        <div className="flex items-center justify-between border-b border-[#DEDFD8] pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEEEEA] border border-[#DEDFD8] shadow-neu-sm text-forest-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 id="privacy-modal-title" className="text-base font-bold text-ink">
                Data Privacy & Hydrological Governance
              </h2>
              <p className="text-xs text-ink-muted">
                Transparent data practices for engineering intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-ink-muted hover:bg-[#EEEEEA] hover:text-ink transition-colors"
            aria-label="Close privacy notice"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-5 text-xs text-ink-secondary leading-relaxed">
          <p className="text-sm font-semibold text-ink">
            RainHarvest AI is built with privacy-by-design. We only process data strictly necessary to compute accurate rainwater harvesting sizing, groundwater recharge rates, and financial feasibility.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="neu-card-sm p-4 space-y-1.5 rounded-2xl">
              <div className="flex items-center space-x-2 text-ink font-bold">
                <Home className="h-4 w-4 text-forest-700" />
                <span>Property Parameters</span>
              </div>
              <p className="text-[11px] text-ink-muted">
                Rooftop area (m²), catchment surface material, unpaved open space, and building occupant counts are processed solely for volumetric runoff calculation.
              </p>
            </div>

            <div className="neu-card-sm p-4 space-y-1.5 rounded-2xl">
              <div className="flex items-center space-x-2 text-ink font-bold">
                <MapPin className="h-4 w-4 text-sky-700" />
                <span>Geographical Location</span>
              </div>
              <p className="text-[11px] text-ink-muted">
                City name or GPS coordinates are used exclusively to query official IMD (India Meteorological Department) rainfall normals and reanalysis data.
              </p>
            </div>

            <div className="neu-card-sm p-4 space-y-1.5 rounded-2xl">
              <div className="flex items-center space-x-2 text-ink font-bold">
                <Droplets className="h-4 w-4 text-forest-600" />
                <span>Water Consumption</span>
              </div>
              <p className="text-[11px] text-ink-muted">
                Daily and seasonal consumption numbers are modeled against Bureau of Indian Standards (IS 1172:1993) benchmarks to simulate dry-period water balance.
              </p>
            </div>

            <div className="neu-card-sm p-4 space-y-1.5 rounded-2xl">
              <div className="flex items-center space-x-2 text-ink font-bold">
                <Database className="h-4 w-4 text-ink-muted" />
                <span>Analysis History</span>
              </div>
              <p className="text-[11px] text-ink-muted">
                Logged-in users retain private calculation histories protected by PostgreSQL Row-Level Security (RLS). Guest calculations are strictly ephemeral.
              </p>
            </div>
          </div>

          <div className="neu-inset p-4 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-forest-800 font-bold text-xs">
              <Lock className="h-4 w-4 text-forest-700" />
              <span>Security Guarantee</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-ink-secondary">
              <li>No personal information is sold, shared with advertisers, or leveraged for commercial tracking.</li>
              <li>Row-Level Security guarantees cross-tenant isolation: other users cannot inspect your properties or tank sizing.</li>
              <li>You may request complete account and data deletion at any time using the &quot;Delete Account&quot; option in your profile.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
export default PrivacyPolicyModal
