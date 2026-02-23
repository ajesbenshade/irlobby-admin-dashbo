export type User = {
  id: string
  username: string
  email: string
  avatarUrl?: string
  status: 'active' | 'suspended' | 'banned'
  role: 'user' | 'moderator' | 'admin'
  createdAt: string
  lastActiveAt: string
  reportCount: number
}

export type ContentItem = {
  id: string
  type: 'post' | 'comment' | 'profile' | 'message'
  content: string
  authorId: string
  authorUsername: string
  createdAt: string
  flagCount: number
  status: 'pending' | 'approved' | 'rejected'
  moderatedBy?: string
  moderatedAt?: string
}

export type Metric = {
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
}

export type AppStatus = {
  isHealthy: boolean
  lastCheck: string
  apiLatency: number
  activeUsers: number
  errorRate: number
}

export type AnalyticsDataPoint = {
  date: string
  value: number
  label?: string
}

export type AuthUser = {
  id: string
  login: string
  email: string
  avatarUrl: string
  isOwner: boolean
}

export type NavigationItem = {
  id: string
  label: string
  icon: string
  path: string
  badge?: number
}
