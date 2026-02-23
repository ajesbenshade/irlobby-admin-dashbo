import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.irlobby.com'

let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

export const getAccessToken = () => accessToken

export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token')
}

export const setRefreshToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('refresh_token', token)
  } else {
    localStorage.removeItem('refresh_token')
  }
}

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        processQueue(new Error('No refresh token'))
        setAccessToken(null)
        setRefreshToken(null)
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        const { access } = response.data
        setAccessToken(access)
        processQueue()

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`
        }

        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as Error)
        setAccessToken(null)
        setRefreshToken(null)
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const response = await apiClient.post('/api/auth/token/', {
        email,
        password,
      })
      return response.data
    },
    logout: async () => {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        await apiClient.post('/api/auth/token/blacklist/', {
          refresh: refreshToken,
        })
      }
    },
    refresh: async (refreshToken: string) => {
      const response = await apiClient.post('/api/auth/token/refresh/', {
        refresh: refreshToken,
      })
      return response.data
    },
  },

  users: {
    list: async (params?: { search?: string; status?: string }) => {
      const response = await apiClient.get('/api/users/', { params })
      return response.data
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/api/users/${id}/`)
      return response.data
    },
    update: async (id: string, data: unknown) => {
      const response = await apiClient.patch(`/api/users/${id}/`, data)
      return response.data
    },
    delete: async (id: string) => {
      const response = await apiClient.delete(`/api/users/${id}/`)
      return response.data
    },
  },

  content: {
    list: async (params?: { status?: string; type?: string }) => {
      const response = await apiClient.get('/api/content/', { params })
      return response.data
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/api/content/${id}/`)
      return response.data
    },
    moderate: async (id: string, action: 'approve' | 'reject', reason?: string) => {
      const response = await apiClient.post(`/api/content/${id}/moderate/`, {
        action,
        reason,
      })
      return response.data
    },
  },

  metrics: {
    getDashboard: async () => {
      const response = await apiClient.get('/api/metrics/dashboard/')
      return response.data
    },
    getStatus: async () => {
      const response = await apiClient.get('/api/metrics/status/')
      return response.data
    },
  },

  analytics: {
    getTimeSeries: async (params?: {
      startDate?: string
      endDate?: string
      metric?: string
    }) => {
      const response = await apiClient.get('/api/analytics/timeseries/', { params })
      return response.data
    },
    getEngagement: async () => {
      const response = await apiClient.get('/api/analytics/engagement/')
      return response.data
    },
  },
}

export default apiClient
