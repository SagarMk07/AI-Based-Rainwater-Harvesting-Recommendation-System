import { apiClient } from './api'
import type {
  AnalysisFormData,
  AnalysisResponse,
  CityRainfallProfile,
  GeocodeResult,
  PaginatedHistoryResponse,
} from '../types/analysis'

export const analysisService = {
  async runAnalysis(formData: AnalysisFormData): Promise<AnalysisResponse> {
    const response = await apiClient.post<AnalysisResponse>('/analyze', formData)
    return response.data
  },

  async getRecentAnalyses(limit = 5): Promise<AnalysisResponse[]> {
    const response = await apiClient.get<PaginatedHistoryResponse>(`/analysis/history?limit=${limit}`)
    return response.data.analyses || []
  },

  async getHistory(page = 1, pageSize = 10): Promise<PaginatedHistoryResponse> {
    const response = await apiClient.get<PaginatedHistoryResponse>(
      `/analysis/history?page=${page}&page_size=${pageSize}`
    )
    return response.data
  },

  async getAnalysisById(analysisId: string): Promise<AnalysisResponse> {
    const response = await apiClient.get<AnalysisResponse>(`/analysis/${analysisId}`)
    return response.data
  },

  async deleteAnalysis(analysisId: string): Promise<void> {
    await apiClient.delete(`/analysis/${analysisId}`)
  },

  async getCityWeather(
    city?: string,
    lat?: number,
    lon?: number,
  ): Promise<CityRainfallProfile> {
    const params = new URLSearchParams()
    if (city) params.append('city', city)
    if (lat !== undefined && lat !== null) params.append('lat', lat.toString())
    if (lon !== undefined && lon !== null) params.append('lon', lon.toString())

    const url = params.toString() ? `/weather?${params.toString()}` : '/weather'
    const response = await apiClient.get<CityRainfallProfile>(url)
    return response.data
  },

  async geocode(query: string): Promise<GeocodeResult[]> {
    if (!query.trim()) return []
    const response = await apiClient.get<{ query: string; results: GeocodeResult[]; count: number }>(
      `/location/geocode?q=${encodeURIComponent(query)}`,
    )
    return response.data.results || []
  },

  async reverseGeocode(lat: number, lon: number): Promise<any> {
    const response = await apiClient.get(`/location/reverse?lat=${lat}&lon=${lon}`)
    return response.data
  },

  async getHistoricalRainfall(lat: number, lon: number, startYear = 2021, endYear = 2023): Promise<any> {
    const response = await apiClient.get(`/weather/historical?lat=${lat}&lon=${lon}&start_year=${startYear}&end_year=${endYear}`)
    return response.data
  },

  async getMLMetrics(): Promise<any> {
    const response = await apiClient.get('/ml/metrics')
    return response.data
  },
}

