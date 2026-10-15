import React from 'react'
import { Link } from 'react-router-dom'
import { Droplets, ShieldCheck, Cpu } from 'lucide-react'
import type { NavTab } from './Navbar'
import { useAuth } from '../context/useAuth'

interface FooterProps {
  onTabChange?: (tab: NavTab) => void
  onOpenTelemetry?: () => void
}

const CURRENT_YEAR = new Date().getFullYear()

export const Footer: React.FC<FooterProps> = ({ onTabChange, onOpenTelemetry }) => {
  const { user } = useAuth()

  return (
    <footer className="w-full border-t border-[#DEDFD8] bg-[#EEEEEA] py-10 shadow-[0_-3px_10px_rgba(80,82,78,0.04)] transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest-600 text-white shadow-[2px_2px_6px_rgba(22,132,71,0.25),-2px_-2px_6px_rgba(255,255,255,0.7)]">
                <Droplets className="h-4 w-4 text-emerald-100" />
              </div>
              <span className="text-base font-extrabold text-[#252B26] tracking-tight">
                RainHarvest <span className="text-forest-600">AI</span>
              </span>
            </div>
            <p className="text-xs text-[#687068] max-w-md leading-relaxed">
              AI-Based Rainwater Harvesting Intelligence & Optimization System.
              Engineered with deterministic civil calculations (IS 15797:2008 & CPWD), 12-month iterative
              water-balance continuity simulations, and chronological machine learning forecasting.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-[#687068]">
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#E3E4DE] text-[#252B26] border border-[#DEDFD8] shadow-neu-inset-sm">
                <ShieldCheck className="h-3 w-3 text-forest-600" />
                <span>IS 15797:2008 Compliant</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#E3E4DE] text-[#252B26] border border-[#DEDFD8] shadow-neu-inset-sm">
                <Cpu className="h-3 w-3 text-water-600" />
                <span>Audited Pure NumPy ML</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#EEEEEA] text-[#252B26] border border-[#DEDFD8] font-semibold shadow-neu-sm">
                Engineering-Grade
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#252B26] font-mono">
              Platform Modules
            </h4>
            <ul className="space-y-1.5 text-xs text-[#687068]">
              <li>
                <Link
                  to={user ? '/dashboard' : '/'}
                  onClick={() => onTabChange?.('dashboard')}
                  className="hover:text-forest-700 transition-colors"
                >
                  {user ? 'Hydrological Dashboard' : 'Public Overview'}
                </Link>
              </li>
              <li>
                <Link
                  to="/analyze"
                  onClick={() => onTabChange?.('wizard')}
                  className="hover:text-forest-700 transition-colors"
                >
                  5-Step Property Analysis
                </Link>
              </li>
              {user && (
                <li>
                  <Link
                    to="/history"
                    onClick={() => onTabChange?.('history')}
                    className="hover:text-forest-700 transition-colors"
                  >
                    Historical Assessments
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/about"
                  onClick={() => onTabChange?.('about')}
                  className="hover:text-forest-700 transition-colors"
                >
                  Engineering Methodology
                </Link>
              </li>
            </ul>
          </div>

          {/* Technical Standards & Telemetry */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#252B26] font-mono">
              Transparency
            </h4>
            <p className="text-xs text-[#687068] leading-relaxed">
              Models evaluate 3,600 monthly samples across 15 climate zones without data leakage.
            </p>
            {onOpenTelemetry && (
              <button
                type="button"
                onClick={onOpenTelemetry}
                className="neu-btn-secondary px-3 py-1.5 text-xs font-semibold space-x-1.5 text-forest-700"
              >
                <Cpu className="h-3.5 w-3.5" />
                <span>Inspect ML Verification</span>
              </button>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-[#DEDFD8] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C948C] gap-2">
          <span>&copy; {CURRENT_YEAR} RainHarvest AI. All rights reserved.</span>
          <div className="flex items-center space-x-4">
            <Link to="/about" className="hover:text-[#252B26] transition-colors">
              Documentation
            </Link>
            <Link to="/about" className="hover:text-[#252B26] transition-colors">
              Civil Standards
            </Link>
            <Link to="/about" className="hover:text-[#252B26] transition-colors">
              Privacy Notice
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
