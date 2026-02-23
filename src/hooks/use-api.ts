import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { User, ContentItem, Metric, AppStatus, AnalyticsDataPoint } from '@/types'

export function useUsers(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => api.users.list(params),
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => api.users.getById(id),
    enabled: !!id,
  })
}

export function useContentItems(params?: { status?: string; type?: string }) {
  return useQuery({
    queryKey: ['content', params],
    queryFn: () => api.content.list(params),
  })
}

export function useDashboardMetrics() {
  return useQuery<Metric[]>({
    queryKey: ['metrics', 'dashboard'],
    queryFn: () => api.metrics.getDashboard(),
  })
}

export function useAppStatus() {
  return useQuery<AppStatus>({
    queryKey: ['metrics', 'status'],
    queryFn: () => api.metrics.getStatus(),
  })
}

export function useAnalyticsTimeSeries(params?: {
  startDate?: string
  endDate?: string
  metric?: string
}) {
  return useQuery<AnalyticsDataPoint[]>({
    queryKey: ['analytics', 'timeseries', params],
    queryFn: () => api.analytics.getTimeSeries(params),
  })
}

export function useEngagementMetrics() {
  return useQuery({
    queryKey: ['analytics', 'engagement'],
    queryFn: () => api.analytics.getEngagement(),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      api.users.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useModerateContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string
      action: 'approve' | 'reject'
      reason?: string
    }) => api.content.moderate(id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] })
    },
  })
}
