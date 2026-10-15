import React from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardSummary } from '../components/DashboardSummary'
import { StatusCard } from '../components/StatusCard'
import { useAppContext } from '../context/useAppContext'

export const DashboardPage: React.FC = () => {
  const {
    history,
    recentAnalyses,
    recentLoading,
    recentError,
    refetchRecent,
    reopenAnalysis,
    analysisResult,
    setAnalysisResult,
    setShowMLModal,
    health,
    healthLoading,
    healthError,
    refetchHealth,
  } = useAppContext()

  const navigate = useNavigate()

  return (
    <div className="py-6 sm:py-8 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <DashboardSummary
          recentAnalyses={recentAnalyses}
          recentLoading={recentLoading}
          recentError={recentError}
          onRetryRecent={refetchRecent}
          totalCount={history.length}
          history={history}
          latestAnalysis={analysisResult}
          onStartNew={() => navigate('/analyze')}
          onSelectAnalysis={async (item) => {
            const reloaded = await reopenAnalysis(item.request_id)
            if (!reloaded) {
              setAnalysisResult(item)
            }
            navigate('/analyze')
          }}
          onOpenTelemetry={() => setShowMLModal(true)}
          onViewAllHistory={() => navigate('/history')}
        />

        {/* Real-time System Connectivity Telemetry */}
        <section className="pt-8 border-t border-[#DEDFD8]">
          <StatusCard
            health={health}
            loading={healthLoading}
            error={healthError}
            onRefresh={refetchHealth}
          />
        </section>
      </div>
    </div>
  )
}


export default DashboardPage
