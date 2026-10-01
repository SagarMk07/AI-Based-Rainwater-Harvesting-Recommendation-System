import { apiClient } from './api'
import type { AnalysisFormData, AnalysisResponse, CityRainfallProfile } from '../types/analysis'

export const analysisService = {
  async runAnalysis(formData: AnalysisFormData): Promise<AnalysisResponse> {
    const response = await apiClient.post<AnalysisResponse>('/analyze', formData)
    return response.data
  },

  async getCityWeather(city: string): Promise<CityRainfallProfile> {
    const response = await apiClient.get<CityRainfallProfile>(`/weather/${encodeURIComponent(city)}`)
    return response.data
  },

  async getMLMetrics(): Promise<any> {
    const response = await apiClient.get('/ml/metrics')
    return response.data
  },
}
