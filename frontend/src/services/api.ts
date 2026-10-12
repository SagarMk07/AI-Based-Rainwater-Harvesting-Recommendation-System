import axios, { type AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export interface ApiErrorDetail {
  code: string
  message: string
}

export class ApiError extends Error {
  status: number
  code: string
  constructor(message: string, status: number = 500, code: string = 'API_ERROR') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Custom callback listener for 401 session expiration
let onSessionExpiredCallback: (() => void) | null = null

export function registerSessionExpiredHandler(cb: () => void) {
  onSessionExpiredCallback = cb
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const status = error.response?.status || 0
    const responseData = error.response?.data
    const serverMessage = responseData?.error?.message || responseData?.detail

    let userFriendlyMessage = serverMessage
    let errorCode = responseData?.error?.code || 'NETWORK_ERROR'

    switch (status) {
      case 400:
        userFriendlyMessage = serverMessage || 'Invalid request parameters. Please verify your property inputs.'
        errorCode = errorCode || 'BAD_REQUEST'
        break
      case 401:
        userFriendlyMessage = 'Your session has expired. Please sign in again.'
        errorCode = 'UNAUTHORIZED'
        if (onSessionExpiredCallback) {
          onSessionExpiredCallback()
        }
        break
      case 403:
        userFriendlyMessage = serverMessage || 'Access restricted. You do not have permission to view or modify this analysis.'
        errorCode = 'FORBIDDEN'
        break
      case 404:
        userFriendlyMessage = serverMessage || 'The requested property analysis or record was not found.'
        errorCode = 'NOT_FOUND'
        break
      case 409:
        userFriendlyMessage = serverMessage || 'A data conflict occurred. Please review your submitted property details.'
        errorCode = 'CONFLICT'
        break
      case 422:
        userFriendlyMessage = serverMessage || 'Input validation failed. Please ensure numeric fields exceed minimum limits.'
        errorCode = 'VALIDATION_ERROR'
        break
      case 429:
        userFriendlyMessage = 'Too many requests. Please wait a moment before trying again.'
        errorCode = 'RATE_LIMIT_EXCEEDED'
        break
      case 500:
        userFriendlyMessage = 'The engineering calculation engine encountered an internal error. Please try again later.'
        errorCode = 'INTERNAL_SERVER_ERROR'
        break
      case 502:
        userFriendlyMessage = 'Calculation engine service is unreachable or restarting. Please ensure the backend server is running on port 8000.'
        errorCode = 'BAD_GATEWAY'
        break
      case 503:
        userFriendlyMessage = 'The calculation service is temporarily unavailable. We can use available historical data instead.'
        errorCode = 'SERVICE_UNAVAILABLE'
        break
      case 504:
        userFriendlyMessage = 'Calculation engine timed out waiting for meteorological or simulation response.'
        errorCode = 'GATEWAY_TIMEOUT'
        break
      default:
        if (!error.response) {
          userFriendlyMessage = 'Unable to connect to calculation service. Please verify your internet or local server connection.'
          errorCode = 'CONNECTION_FAILED'
        } else {
          userFriendlyMessage = serverMessage || error.message || 'An unexpected communication error occurred.'
        }
    }

    return Promise.reject(new ApiError(userFriendlyMessage, status, errorCode))
  }
)
