import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { HistorySection } from '../components/HistorySection'
import { useAppContext } from '../context/AppContext'
import { analysisService } from '../services/analysisService'
import type { AnalysisResponse } from '../types/analysis'

export const HistoryPage: React.FC = () => {
  const {
    history: contextHistory,
    setAnalysisResult,
    reopenAnalysis,
    clearHistory,
    deleteFromHistory,
  } = useAppContext()

  const navigate = useNavigate()

  const [page, setPage] = useState<number>(1)
  const pageSize = 10
  const [paginatedHistory, setPaginatedHistory] = useState<AnalysisResponse[]>([])
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistoryPage = useCallback(async (targetPage: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await analysisService.getHistory(targetPage, pageSize)
      setPaginatedHistory(data.analyses || [])
      setTotalPages(data.total_pages || 1)
      setTotalCount(data.total || data.count || 0)
      setPage(data.page || targetPage)
    } catch (err: any) {
      console.warn('Backend history pagination failed, falling back to cached context history:', err)
      // Graceful fallback to context history
      if (contextHistory.length > 0) {
        const total = contextHistory.length
        const pages = Math.max(1, Math.ceil(total / pageSize))
        const start = (targetPage - 1) * pageSize
        setPaginatedHistory(contextHistory.slice(start, start + pageSize))
        setTotalPages(pages)
        setTotalCount(total)
        setPage(targetPage)
      } else {
        setError(err?.response?.data?.detail?.message || err?.message || 'Could not load analysis history')
      }
    } finally {
      setLoading(false)
    }
  }, [contextHistory, pageSize])

  useEffect(() => {
    fetchHistoryPage(page)
  }, [fetchHistoryPage, page])

  const handleSelect = async (item: AnalysisResponse) => {
    // Reopen using immutable saved snapshot without rerunning calculation
    const reopened = await reopenAnalysis(item.request_id)
    if (!reopened) {
      setAnalysisResult(item)
    }
    navigate('/analyze')
  }

  const handleDelete = async (requestId: string) => {
    await deleteFromHistory(requestId)
    setPaginatedHistory((prev) => prev.filter((item) => item.request_id !== requestId))
    setTotalCount((prev) => Math.max(0, prev - 1))
  }

  const handleClear = () => {
    clearHistory()
    setPaginatedHistory([])
    setTotalCount(0)
    setTotalPages(1)
  }

  return (
    <div className="py-6 sm:py-8 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HistorySection
          history={paginatedHistory.length > 0 ? paginatedHistory : (loading ? [] : contextHistory)}
          loading={loading}
          error={error}
          onRetry={() => fetchHistoryPage(page)}
          onSelect={handleSelect}
          onClear={handleClear}
          onDelete={handleDelete}
          onStartNew={() => navigate('/analyze')}
          onBackToDashboard={() => navigate('/dashboard')}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    </div>
  )
}

export default HistoryPage
