import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, X } from 'lucide-react'
import { HistorySection } from '../components/HistorySection'
import { useAppContext } from '../context/useAppContext'
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
  const [actionError, setActionError] = useState<string | null>(null)

  // Use ref for contextHistory fallback to avoid unnecessary fetchHistoryPage re-triggers
  const contextHistoryRef = useRef(contextHistory)
  useEffect(() => {
    contextHistoryRef.current = contextHistory
  }, [contextHistory])

  const fetchHistoryPage = useCallback(async (targetPage: number) => {
    queueMicrotask(() => {
      setLoading(true)
      setError(null)
    })
    try {
      const data = await analysisService.getHistory(targetPage, pageSize)
      setPaginatedHistory(data.analyses || [])
      setTotalPages(data.total_pages || 1)
      setTotalCount(data.total || data.count || 0)
    } catch (err: any) {
      console.warn('Backend history pagination failed, falling back to cached context history:', err)
      const cached = contextHistoryRef.current
      if (cached.length > 0) {
        const total = cached.length
        const pages = Math.max(1, Math.ceil(total / pageSize))
        const start = (targetPage - 1) * pageSize
        setPaginatedHistory(cached.slice(start, start + pageSize))
        setTotalPages(pages)
        setTotalCount(total)
      } else {
        setError(err?.response?.data?.detail?.message || err?.message || 'Could not load analysis history')
      }
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      if (isMounted) {
        await fetchHistoryPage(page)
      }
    }
    load()
    return () => {
      isMounted = false
    }
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
    setActionError(null)
    try {
      // 1. Delete from backend persistent storage first (throws on failure)
      await deleteFromHistory(requestId)
      // 2. Only on confirmed success, update displayed paginated list and count
      setPaginatedHistory((prev) => prev.filter((item) => item.request_id !== requestId))
      setTotalCount((prev) => Math.max(0, prev - 1))
      // If last item on page was deleted and page > 1, navigate to previous page
      if (paginatedHistory.length <= 1 && page > 1) {
        setPage((prev) => Math.max(1, prev - 1))
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail?.message || err?.message || 'Failed to delete analysis from storage.'
      setActionError(msg)
      console.error('Delete analysis failed:', err)
    }
  }

  const handleClear = async () => {
    setActionError(null)
    try {
      await clearHistory()
      setPaginatedHistory([])
      setTotalCount(0)
      setTotalPages(1)
    } catch (err: any) {
      setActionError('Failed to clear saved analyses from storage.')
      console.error('Clear history failed:', err)
    }
  }

  // Display authoritative paginated history, falling back to context only on network error
  const displayedHistory = error
    ? (paginatedHistory.length > 0 ? paginatedHistory : contextHistory)
    : paginatedHistory

  return (
    <div className="py-6 sm:py-8 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
        {actionError && (
          <div className="neu-card p-4 text-xs text-rose-900 border border-rose-300 bg-rose-50 rounded-2xl flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span className="font-medium">{actionError}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="p-1 text-rose-700 hover:text-rose-900 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <HistorySection
          history={displayedHistory}
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
