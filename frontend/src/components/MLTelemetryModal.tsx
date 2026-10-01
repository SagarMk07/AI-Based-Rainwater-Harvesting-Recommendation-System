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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Machine Learning Telemetry & Validation</h3>
              <p className="text-xs text-slate-500">
                Audited metrics on chronological test split (2020-2024) strictly preventing data leakage.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading model telemetry...</div>
        ) : metrics ? (
          <div className="space-y-5 text-xs">
            {/* Top Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Dataset Size</span>
                <span className="text-sm font-bold text-slate-800">{metrics.dataset_size} samples</span>
                <span className="text-[10px] text-slate-500 block">15 climate stations</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Train / Test Split</span>
                <span className="text-sm font-bold text-slate-800">
                  {metrics.train_size} / {metrics.test_size}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block">Chronological (05-19 / 20-24)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">RF Regressor R²</span>
                <span className="text-sm font-bold text-emerald-600">
                  {metrics.regression_metrics?.random_forest_regressor?.r2}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  MAE: {metrics.regression_metrics?.random_forest_regressor?.mae} mm
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Classifier Accuracy</span>
                <span className="text-sm font-bold text-sky-600">
                  {(metrics.classification_metrics?.accuracy * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500 block">
                  F1: {metrics.classification_metrics?.f1_score}
                </span>
              </div>
            </div>

            {/* Regression Comparison */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                <span>Forecasting Regression Benchmarking</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="font-bold block text-slate-800">Random Forest Regressor (Active)</span>
                  <p className="text-[11px] text-slate-500 mb-2">Non-linear seasonal & cyclical feature interactions</p>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mean Absolute Error (MAE):</span>
                      <span className="font-bold text-emerald-700">
                        {metrics.regression_metrics?.random_forest_regressor?.mae} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Root Mean Squared Error (RMSE):</span>
                      <span className="font-bold text-emerald-700">
                        {metrics.regression_metrics?.random_forest_regressor?.rmse} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Coefficient of Determination (R²):</span>
                      <span className="font-bold text-emerald-700">
                        {metrics.regression_metrics?.random_forest_regressor?.r2}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="font-bold block text-slate-800">Linear Regression (Baseline)</span>
                  <p className="text-[11px] text-slate-500 mb-2">Standard Ordinary Least Squares reference model</p>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">MAE:</span>
                      <span className="font-semibold text-slate-700">
                        {metrics.regression_metrics?.baseline_linear_regression?.mae} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">RMSE:</span>
                      <span className="font-semibold text-slate-700">
                        {metrics.regression_metrics?.baseline_linear_regression?.rmse} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">R²:</span>
                      <span className="font-semibold text-slate-700">
                        {metrics.regression_metrics?.baseline_linear_regression?.r2}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confusion Matrix */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="font-bold text-slate-900">Rainfall Regime Classifier & Confusion Matrix</h4>
              <p className="text-slate-500 text-[11px]">
                Classification into Deficit (&lt;40mm), Normal (40-150mm), and Excess (&gt;150mm).
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-center font-mono text-[11px] border border-slate-200">
                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-2 text-left">Actual \ Predicted</th>
                      {metrics.classes?.map((c: string) => (
                        <th key={c} className="p-2">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {metrics.classification_metrics?.confusion_matrix?.map((row: number[], rIdx: number) => (
                      <tr key={rIdx}>
                        <td className="p-2 text-left font-bold text-slate-700">{metrics.classes[rIdx]}</td>
                        {row.map((val: number, cIdx: number) => (
                          <td
                            key={cIdx}
                            className={`p-2 ${
                              rIdx === cIdx ? 'bg-emerald-50 font-bold text-emerald-800' : 'text-slate-400'
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature Importances */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="font-bold text-slate-900">Feature Importance Breakdown</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[10px]">
                {metrics.feature_importances &&
                  Object.entries(metrics.feature_importances).map(([feat, score]: [string, any]) => (
                    <div key={feat} className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-500 block truncate" title={feat}>
                        {feat}
                      </span>
                      <span className="font-bold text-emerald-700">{(score * 100).toFixed(1)}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400">Failed to load telemetry.</div>
        )}
      </div>
    </div>
  )
}
