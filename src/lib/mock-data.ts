import type { User, ContentItem, Metric, AppStatus, AnalyticsDataPoint } from '@/types'

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'alex_rivera',
    email: 'alex@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    status: 'active',
    role: 'user',
    createdAt: '2024-01-15T10:30:00Z',
    lastActiveAt: '2024-03-20T14:22:00Z',
    reportCount: 0,
  },
  {
    id: '2',
    username: 'jordan_smith',
    email: 'jordan@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
    status: 'active',
    role: 'moderator',
    createdAt: '2024-01-10T08:15:00Z',
    lastActiveAt: '2024-03-20T16:45:00Z',
    reportCount: 0,
  },
  {
    id: '3',
    username: 'casey_lee',
    email: 'casey@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=casey',
    status: 'suspended',
    role: 'user',
    createdAt: '2024-02-20T12:00:00Z',
    lastActiveAt: '2024-03-18T09:30:00Z',
    reportCount: 3,
  },
  {
    id: '4',
    username: 'morgan_blake',
    email: 'morgan@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=morgan',
    status: 'active',
    role: 'user',
    createdAt: '2024-03-01T14:20:00Z',
    lastActiveAt: '2024-03-20T11:15:00Z',
    reportCount: 0,
  },
  {
    id: '5',
    username: 'taylor_chen',
    email: 'taylor@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=taylor',
    status: 'banned',
    role: 'user',
    createdAt: '2024-02-05T09:45:00Z',
    lastActiveAt: '2024-03-10T13:00:00Z',
    reportCount: 8,
  },
]

export const mockContentItems: ContentItem[] = [
  {
    id: 'c1',
    type: 'post',
    content: 'Check out this amazing event happening downtown!',
    authorId: '1',
    authorUsername: 'alex_rivera',
    createdAt: '2024-03-20T10:00:00Z',
    flagCount: 0,
    status: 'approved',
  },
  {
    id: 'c2',
    type: 'comment',
    content: 'This is inappropriate and violates community guidelines.',
    authorId: '3',
    authorUsername: 'casey_lee',
    createdAt: '2024-03-19T15:30:00Z',
    flagCount: 5,
    status: 'pending',
  },
  {
    id: 'c3',
    type: 'post',
    content: 'Looking for recommendations on local coffee shops.',
    authorId: '4',
    authorUsername: 'morgan_blake',
    createdAt: '2024-03-20T08:45:00Z',
    flagCount: 0,
    status: 'approved',
  },
  {
    id: 'c4',
    type: 'comment',
    content: 'Spam content with external links.',
    authorId: '5',
    authorUsername: 'taylor_chen',
    createdAt: '2024-03-18T12:15:00Z',
    flagCount: 12,
    status: 'rejected',
    moderatedBy: 'jordan_smith',
    moderatedAt: '2024-03-18T14:00:00Z',
  },
]

export const mockMetrics: Metric[] = [
  {
    label: 'Total Users',
    value: '12,458',
    change: 12.5,
    trend: 'up',
  },
  {
    label: 'Active Today',
    value: '3,247',
    change: 5.2,
    trend: 'up',
  },
  {
    label: 'Pending Reports',
    value: '23',
    change: -15.3,
    trend: 'down',
  },
  {
    label: 'Avg. Response Time',
    value: '4.2h',
    change: -8.1,
    trend: 'down',
  },
]

export const mockAppStatus: AppStatus = {
  isHealthy: true,
  lastCheck: new Date().toISOString(),
  apiLatency: 145,
  activeUsers: 3247,
  errorRate: 0.12,
}

export const mockAnalyticsData: AnalyticsDataPoint[] = [
  { date: '2024-03-14', value: 2847 },
  { date: '2024-03-15', value: 3012 },
  { date: '2024-03-16', value: 2934 },
  { date: '2024-03-17', value: 3156 },
  { date: '2024-03-18', value: 3289 },
  { date: '2024-03-19', value: 3421 },
  { date: '2024-03-20', value: 3247 },
]
