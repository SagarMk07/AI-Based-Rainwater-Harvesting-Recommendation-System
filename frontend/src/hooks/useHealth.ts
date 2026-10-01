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
    let isMounted = true
    healthService.getHealth()
      .then((result) => {
        if (isMounted) {
          setData(result)
          setError(null)
          setLoading(false)
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err?.message || 'Failed to connect to backend server')
          setLoading(false)
        }
      })

    if (pollIntervalMs && pollIntervalMs > 0) {
      const interval = setInterval(() => {
        healthService.getHealth()
          .then((res) => { if (isMounted) setData(res) })
          .catch(() => {})
      }, pollIntervalMs)
      return () => {
        isMounted = false
        clearInterval(interval)
      }
    }

    return () => {
      isMounted = false
    }
  }, [pollIntervalMs])

  return { data, loading, error, refetch: fetchHealth }
}
