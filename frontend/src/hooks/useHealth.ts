import { useState, useEffect, useCallback } from 'react'
import { healthService } from '../services/healthService'
import type { HealthResponse } from '../types/health'

export function useHealth(pollIntervalMs?: number) {
  const [data, setData] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true)
      const result = await healthService.getHealth()
      setData(result)
      setError(null)
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to backend server')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHealth()
    if (pollIntervalMs && pollIntervalMs > 0) {
      const interval = setInterval(fetchHealth, pollIntervalMs)
      return () => clearInterval(interval)
    }
  }, [fetchHealth, pollIntervalMs])

  return { data, loading, error, refetch: fetchHealth }
}
