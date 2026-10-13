import React, { useEffect, useState } from 'react'
import { Cpu, X, BarChart3 } from 'lucide-react'
import { analysisService } from '../services/analysisService'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const MLTelemetryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || metrics) return
    let isMounted = true
    analysisService
      .getMLMetrics()
      .then((res) => {
        if (isMounted) {
          setMetrics(res)
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, metrics])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252B26]/40 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl rounded-3xl neu-card bg-[#F4F4F0] border border-[#DEDFD8] p-6 sm:p-7 shadow-neu-lg max-h-[90vh] overflow-y-auto space-y-5 text-ink">
        <div className="flex items-center justify-between border-b border-[#DEDFD8] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#EEEEEA] border border-[#DEDFD8] shadow-neu-sm text-forest-700 flex items-center justify-center">
              <Cpu className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Machine Learning Telemetry & Validation</h3>
              <p className="text-xs text-ink-muted">
                Audited metrics on chronological test split (2020-2024) strictly preventing data leakage.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-ink-muted hover:text-ink hover:bg-[#EEEEEA] transition-colors"
            aria-label="Close telemetry modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-ink-muted font-mono">Loading model telemetry...</div>
        ) : metrics ? (
          <div className="space-y-5 text-xs">
            {/* Top Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="neu-card-sm p-3.5 space-y-1">
                <span className="text-[10px] text-ink-muted block uppercase font-bold tracking-wider">Dataset Size</span>
                <span className="text-base font-bold text-ink">{metrics.dataset_size} samples</span>
                <span className="text-[10px] text-ink-secondary block">15 climate stations</span>
              </div>
              <div className="neu-card-sm p-3.5 space-y-1">
                <span className="text-[10px] text-ink-muted block uppercase font-bold tracking-wider">Train / Test Split</span>
                <span className="text-base font-bold text-ink">
                  {metrics.train_size} / {metrics.test_size}
                </span>
                <span className="text-[10px] text-forest-700 font-semibold block">Chronological (05-19 / 20-24)</span>
              </div>
              <div className="neu-card-sm p-3.5 space-y-1">
                <span className="text-[10px] text-ink-muted block uppercase font-bold tracking-wider">RF Regressor R²</span>
                <span className="text-base font-bold text-forest-700">
                  {metrics.regression_metrics?.random_forest_regressor?.r2}
                </span>
                <span className="text-[10px] text-ink-muted block">
                  MAE: {metrics.regression_metrics?.random_forest_regressor?.mae} mm
                </span>
              </div>
              <div className="neu-card-sm p-3.5 space-y-1">
                <span className="text-[10px] text-ink-muted block uppercase font-bold tracking-wider">Classifier Accuracy</span>
                <span className="text-base font-bold text-sky-700">
                  {(metrics.classification_metrics?.accuracy * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-ink-muted block">
                  F1: {metrics.classification_metrics?.f1_score}
                </span>
              </div>
            </div>

            {/* Regression Comparison */}
            <div className="neu-card p-4 space-y-2.5">
              <h4 className="font-bold text-ink flex items-center space-x-1.5 text-xs">
                <BarChart3 className="h-4 w-4 text-forest-700" />
                <span>Forecasting Regression Benchmarking</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-[#DEDFD8] text-ink-muted">
                      <th className="py-1.5">Model Architecture</th>
                      <th className="py-1.5">R² Score</th>
                      <th className="py-1.5">MAE (mm)</th>
                      <th className="py-1.5">RMSE (mm)</th>
                      <th className="py-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DEDFD8]">
                    <tr>
                      <td className="py-2 font-bold text-forest-700">Random Forest Regressor (100 Trees)</td>
                      <td className="py-2 text-forest-700 font-bold">{metrics.regression_metrics?.random_forest_regressor?.r2}</td>
                      <td className="py-2">{metrics.regression_metrics?.random_forest_regressor?.mae}</td>
                      <td className="py-2">{metrics.regression_metrics?.random_forest_regressor?.rmse}</td>
                      <td className="py-2">
                        <span className="bg-[#EEEEEA] text-forest-700 border border-forest-600/30 px-2 py-0.5 rounded text-[10px] font-bold">Production</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-ink-secondary">Linear Regression (Baseline)</td>
                      <td className="py-2">{metrics.regression_metrics?.linear_regression?.r2}</td>
                      <td className="py-2">{metrics.regression_metrics?.linear_regression?.mae}</td>
                      <td className="py-2">{metrics.regression_metrics?.linear_regression?.rmse}</td>
                      <td className="py-2">
                        <span className="bg-[#E3E4DE] text-ink-muted px-2 py-0.5 rounded text-[10px]">Benchmark</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Classification Breakdown */}
            <div className="neu-card p-4 space-y-2">
              <h4 className="font-bold text-ink text-xs">System Classification Matrix</h4>
              <div className="grid grid-cols-3 gap-3 font-mono text-[11px]">
                <div className="neu-inset p-2.5 rounded-xl">
                  <span className="text-ink-muted block text-[10px]">Accuracy</span>
                  <span className="font-bold text-ink">{(metrics.classification_metrics?.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="neu-inset p-2.5 rounded-xl">
                  <span className="text-ink-muted block text-[10px]">Precision</span>
                  <span className="font-bold text-ink">{metrics.classification_metrics?.precision}</span>
                </div>
                <div className="neu-inset p-2.5 rounded-xl">
                  <span className="text-ink-muted block text-[10px]">F1 Score</span>
                  <span className="font-bold text-ink">{metrics.classification_metrics?.f1_score}</span>
                </div>
              </div>
            </div>

            {/* Engineering Boundaries */}
            <div className="neu-inset p-3.5 rounded-2xl text-[11px] text-ink-secondary space-y-1">
              <span className="font-bold text-ink block">Physical Constraint Protection:</span>
              <p>
                ML models are strictly bounded to empirical precipitation forecasting. All volumetric yields,
                filter sizing, first-flush reject rates, and groundwater recharge velocities are computed
                via deterministic civil engineering formulas (IS 15797:2008 &amp; CPWD).
              </p>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-rose-700">Failed to load model metrics.</div>
        )}
      </div>
    </div>
  )
}
export default MLTelemetryModal
