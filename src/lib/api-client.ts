import { config } from './config'

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

class APIClient {
  private baseUrl: string
  private timeout: number

  constructor() {
    this.baseUrl = config.api.baseUrl
    this.timeout = config.api.timeout
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await window.spark.kv.get<string>('auth-token')
      return token ?? null
    } catch {
      return null
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const token = await this.getAuthToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (options.headers) {
        Object.assign(headers, options.headers)
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        if (response.status === 401) {
          await window.spark.kv.delete('auth-token')
          await window.spark.kv.delete('auth-user')
          window.location.reload()
        }
        
        throw new APIError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        )
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof APIError) {
        throw error
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new APIError('Request timeout', 408, 'TIMEOUT')
        }
        throw new APIError(error.message, undefined, 'NETWORK_ERROR')
      }

      throw new APIError('An unknown error occurred', undefined, 'UNKNOWN_ERROR')
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = params
      ? `${endpoint}?${new URLSearchParams(params)}`
      : endpoint

    return this.request<T>(url, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new APIClient()
