import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { APIError } from '@/lib/api-client'
import type { User, ContentItem, Metric, AppStatus, AnalyticsDataPoint } from '@/types'

type UseQueryResult<T> = {
  data: T | null
  isLoading: boolean
  error: APIError | null
  refetch: () => Promise<void>
}

function useQuery<T>(
  queryFn: () => Promise<T>,
  deps: unknown[] = []
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<APIError | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await queryFn()
      setData(result)
    } catch (err) {
      setError(err instanceof APIError ? err : new APIError('An unknown error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [queryFn])

  useEffect(() => {
    fetchData()
  }, deps)

  return { data, isLoading, error, refetch: fetchData }
}

export function useUsers(params?: { search?: string; status?: string }) {
  return useQuery(
    () => api.users.list(params),
    [params?.search, params?.status]
  )
}

export function useUser(id: string) {
  return useQuery(() => api.users.getById(id), [id])
}

export function useContentItems(params?: { status?: string; type?: string }) {
  return useQuery(
    () => api.content.list(params),
    [params?.status, params?.type]
  )
}

export function useDashboardMetrics() {
  return useQuery<Metric[]>(() => api.metrics.getDashboard(), [])
}

export function useAppStatus() {
  return useQuery<AppStatus>(() => api.metrics.getStatus(), [])
}

export function useAnalyticsTimeSeries(params?: {
  startDate?: string
  endDate?: string
  metric?: string
}) {
  return useQuery<AnalyticsDataPoint[]>(
    () => api.analytics.getTimeSeries(params),
    [params?.startDate, params?.endDate, params?.metric]
  )
}

export function useEngagementMetrics() {
  return useQuery(
    () => api.analytics.getEngagement(),
    []
  )
}

type MutationResult<TData, TVariables> = {
  mutate: (variables: TVariables) => Promise<TData>
  isLoading: boolean
  error: APIError | null
  data: TData | null
}

function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
): MutationResult<TData, TVariables> {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<APIError | null>(null)
  const [data, setData] = useState<TData | null>(null)

  const mutate = useCallback(
    async (variables: TVariables) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await mutationFn(variables)
        setData(result)
        return result
      } catch (err) {
        const apiError = err instanceof APIError ? err : new APIError('An unknown error occurred')
        setError(apiError)
        throw apiError
      } finally {
        setIsLoading(false)
      }
    },
    [mutationFn]
  )

  return { mutate, isLoading, error, data }
}

export function useUpdateUser() {
  return useMutation<User, { id: string; data: Partial<User> }>(
    ({ id, data }) => api.users.update(id, data)
  )
}

export function useDeleteUser() {
  return useMutation<void, string>((id) => api.users.delete(id))
}

export function useModerateContent() {
  return useMutation<
    ContentItem,
    { id: string; action: 'approve' | 'reject'; reason?: string }
  >(({ id, action, reason }) => api.content.moderate(id, action, reason))
}
