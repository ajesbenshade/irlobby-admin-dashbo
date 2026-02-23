import { apiClient } from './api-client'
import type { User, ContentItem, Metric, AppStatus, AnalyticsDataPoint } from '@/types'

export const api = {
  users: {
    list: async (params?: { search?: string; status?: string }) => {
      return apiClient.get<{ users: User[]; total: number }>('/api/users', params)
    },
    
    getById: async (id: string) => {
      return apiClient.get<User>(`/api/users/${id}`)
    },
    
    update: async (id: string, data: Partial<User>) => {
      return apiClient.patch<User>(`/api/users/${id}`, data)
    },
    
    delete: async (id: string) => {
      return apiClient.delete<void>(`/api/users/${id}`)
    },
  },

  content: {
    list: async (params?: { status?: string; type?: string }) => {
      return apiClient.get<{ items: ContentItem[]; total: number }>('/api/content', params)
    },
    
    getById: async (id: string) => {
      return apiClient.get<ContentItem>(`/api/content/${id}`)
    },
    
    moderate: async (id: string, action: 'approve' | 'reject', reason?: string) => {
      return apiClient.post<ContentItem>(`/api/content/${id}/moderate`, { action, reason })
    },
  },

  metrics: {
    getDashboard: async () => {
      return apiClient.get<Metric[]>('/api/metrics/dashboard')
    },
    
    getStatus: async () => {
      return apiClient.get<AppStatus>('/api/metrics/status')
    },
  },

  analytics: {
    getTimeSeries: async (params?: { startDate?: string; endDate?: string; metric?: string }) => {
      return apiClient.get<AnalyticsDataPoint[]>('/api/analytics/timeseries', params)
    },
    
    getEngagement: async () => {
      return apiClient.get<{
        avgSessionDuration: number
        contentPosts: number
        userInteractions: number
        retentionRate: number
      }>('/api/analytics/engagement')
    },
  },
}
