import { apiClient } from './api'
import type { HealthResponse } from '../types/health'

export const healthService = {
  async getHealth(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>('/health')
    return response.data
  },
}
