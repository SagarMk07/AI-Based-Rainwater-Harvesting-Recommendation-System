import React from 'react'
import { useNavigate } from 'react-router-dom'
import { HistorySection } from '../components/HistorySection'
import { useAppContext } from '../context/AppContext'

export const HistoryPage: React.FC = () => {
  const {
    history,
    setAnalysisResult,
    clearHistory,
    deleteFromHistory,
  } = useAppContext()

  const navigate = useNavigate()

  return (
    <div className="py-6 sm:py-8 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HistorySection
          history={history}
          onSelect={(item) => {
            setAnalysisResult(item)
            navigate('/analyze')
          }}
          onClear={clearHistory}
          onDelete={deleteFromHistory}
          onStartNew={() => navigate('/analyze')}
        />
      </div>
    </div>
  )
}

export default HistoryPage
