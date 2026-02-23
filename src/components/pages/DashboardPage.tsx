import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PulseIcon as Activity, Users, Flag, Clock } from '@phosphor-icons/react'
import { mockMetrics, mockAppStatus } from '@/lib/mock-data'
import type { Metric } from '@/types'

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back. Here's what's happening with IRLobby today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {mockMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SystemStatusCard />
        <QuickActionsCard />
      </div>
    </div>
  )
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = getMetricIcon(metric.label)
  const changeColor = metric.trend === 'up' ? 'text-green-600' : 'text-red-600'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{metric.value}</div>
        {metric.change !== undefined && (
          <p className={`text-xs ${changeColor} mt-1`}>
            {metric.change > 0 ? '+' : ''}
            {metric.change}% from last week
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function SystemStatusCard() {
  const status = mockAppStatus

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Real-time application health metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">API Status</span>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                status.isHealthy ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-muted-foreground">
              {status.isHealthy ? 'Operational' : 'Degraded'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">API Latency</span>
          <span className="text-sm text-muted-foreground font-mono">
            {status.apiLatency}ms
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Error Rate</span>
          <span className="text-sm text-muted-foreground font-mono">
            {status.errorRate.toFixed(2)}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Active Users</span>
          <span className="text-sm text-muted-foreground font-mono">
            {status.activeUsers.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common administrative tasks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <button className="w-full text-left px-4 py-3 rounded-lg border hover:bg-accent transition-colors">
          <div className="font-medium text-sm">Review Pending Reports</div>
          <div className="text-xs text-muted-foreground mt-1">
            23 items awaiting moderation
          </div>
        </button>

        <button className="w-full text-left px-4 py-3 rounded-lg border hover:bg-accent transition-colors">
          <div className="font-medium text-sm">Manage User Accounts</div>
          <div className="text-xs text-muted-foreground mt-1">
            View and modify user permissions
          </div>
        </button>

        <button className="w-full text-left px-4 py-3 rounded-lg border hover:bg-accent transition-colors">
          <div className="font-medium text-sm">View Analytics</div>
          <div className="text-xs text-muted-foreground mt-1">
            Detailed usage and engagement data
          </div>
        </button>
      </CardContent>
    </Card>
  )
}

function getMetricIcon(label: string) {
  switch (label) {
    case 'Total Users':
      return Users
    case 'Active Today':
      return Activity
    case 'Pending Reports':
      return Flag
    case 'Avg. Response Time':
      return Clock
    default:
      return Activity
  }
}
