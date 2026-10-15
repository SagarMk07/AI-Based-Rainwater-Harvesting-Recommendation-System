import { createContext } from 'react'
import type { HealthResponse } from '../types/health'
import type { AnalysisResponse } from '../types/analysis'

export interface AppContextType {
  health: HealthResponse | null
  healthLoading: boolean
  healthError: string | null
  refetchHealth: () => void
  analysisResult: AnalysisResponse | null
  setAnalysisResult: (result: AnalysisResponse | null) => void
  history: AnalysisResponse[]
  recentAnalyses: AnalysisResponse[]
  recentLoading: boolean
  recentError: string | null
  refetchRecent: () => Promise<void>
  reopenAnalysis: (id: string) => Promise<AnalysisResponse | null>
  saveToHistory: (item: AnalysisResponse) => Promise<void>
  deleteFromHistory: (id: string) => Promise<void>
  clearHistory: () => Promise<void>
  showMLModal: boolean
  setShowMLModal: (show: boolean) => void
  showPrivacyModal: boolean
  setShowPrivacyModal: (show: boolean) => void
}

export const AppContext = createContext<AppContextType | undefined>(undefined)
