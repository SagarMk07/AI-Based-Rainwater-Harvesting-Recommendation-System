export interface CityRainfallProfile {
  city: string
  state: string
  annual_rainfall_mm: number
  monthly_rainfall_mm: number[]
  average_humidity_pct: number
  average_temperature_c: number
  is_fallback: boolean
  weather_source: string
  warning_notice: string | null
}

export interface RechargeStructureDesign {
  structure_type: string
  dimensions: string
  effective_volume_litres: number
  filter_media: string
  suitability_assessment: string
  estimated_cost_inr: number
}

export interface SystemRecommendation {
  system_type: string
  tagline: string
  annual_gross_harvest_litres: number
  annual_collectable_litres: number
  annual_usable_litres: number
  annual_demand_litres: number
  water_savings_percentage: number
  overflow_diverted_to_recharge_litres: number
  optimal_tank_capacity_litres: number
  tank_design_summary: string
  recharge_structure: RechargeStructureDesign | null
  total_estimated_cost_inr: number
  annual_financial_savings_inr: number
  payback_years: number
  explanation_points: string[]
  engineering_rationale: string
  suitability_score: number
}

export interface MonthlyBalanceStep {
  month_index: number
  month_name: string
  rainfall_mm: number
  inflow_litres: number
  demand_litres: number
  supplied_litres: number
  overflow_litres: number
  deficit_litres: number
  ending_storage_litres: number
  storage_utilization_pct: number
}

export interface WaterBalanceResult {
  tank_capacity_litres: number
  total_rainfall_mm: number
  total_inflow_litres: number
  total_demand_litres: number
  total_supplied_litres: number
  total_overflow_litres: number
  total_deficit_litres: number
  demand_met_percentage: number
  overflow_percentage: number
  average_storage_utilization_pct: number
  monthly_breakdown: MonthlyBalanceStep[]
}

export interface CandidateEvaluation {
  capacity_litres: number
  total_supplied_litres: number
  total_overflow_litres: number
  demand_met_percentage: number
  overflow_percentage: number
  average_storage_utilization_pct: number
  tank_cost_inr: number
  annual_savings_inr: number
  payback_years: number
  optimization_score: number
}

export interface ExplainabilityResponse {
  recommended_system: string
  headline_reason: string
  reasons: string[]
  engineering_factors: Record<string, any>
  trade_off_analysis: string
}

export interface AnalysisResponse {
  request_id: string
  timestamp: string
  weather: CityRainfallProfile
  recommendation: SystemRecommendation
  water_balance: WaterBalanceResult
  tank_optimization_candidates: CandidateEvaluation[]
  explainability: ExplainabilityResponse
  ml_forecast?: any
}

export interface AnalysisFormData {
  city: string
  annual_rainfall_mm: number
  roof_area_sqm: number
  roof_type: string
  occupants: number
  daily_demand_litres: number
  soil_type: string
  open_area_sqm: number
  has_existing_borewell: boolean
  budget_inr: number
  filter_efficiency: number
}
