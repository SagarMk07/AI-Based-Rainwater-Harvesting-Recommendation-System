export interface DatabaseStatus {
  connected: boolean
  status: string
  provider: string
  message: string
}

export interface EnvironmentInfo {
  app_name: string
  app_version: string
  app_env: string
  debug: boolean
  python_version: string
}

export interface PipelineStatus {
  data_pipeline: string
  ml_models: string
  calculation_engine: string
  water_balance: string
  optimization: string
}

export interface HealthResponse {
  status: string
  timestamp: string
  environment: EnvironmentInfo
  database: DatabaseStatus
  pipelines: PipelineStatus
}
