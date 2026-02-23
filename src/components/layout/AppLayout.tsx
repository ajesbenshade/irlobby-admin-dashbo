import { useState } from 'react'
import { House, Users, Flag, ChartBar, Robot } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type Page = 'dashboard' | 'users' | 'moderation' | 'analytics' | 'ai'

interface AppLayoutProps {
  children: React.ReactNode
  currentPage: Page
  onNavigate: (page: Page) => void
}

export function AppLayout({ children, currentPage, onNavigate }: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const navItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: House },
    { id: 'users' as Page, label: 'Users', icon: Users },
    { id: 'moderation' as Page, label: 'Moderation', icon: Flag, badge: 23 },
    { id: 'analytics' as Page, label: 'Analytics', icon: ChartBar },
    { id: 'ai' as Page, label: 'AI Assistant', icon: Robot },
  ]

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={cn(
          'border-r bg-card transition-all duration-200',
          isSidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {!isSidebarCollapsed && (
            <div>
              <h1 className="text-lg font-semibold">IRLobby Admin</h1>
              <p className="text-xs text-muted-foreground">Dashboard v1.0</p>
            </div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <svg
              className={cn('h-4 w-4 transition-transform', isSidebarCollapsed && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <>
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded-full',
                          isActive
                            ? 'bg-primary-foreground text-primary'
                            : 'bg-destructive text-destructive-foreground'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="h-16 border-b bg-card flex items-center justify-between px-6">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-accent rounded-lg transition-colors relative">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
            </button>

            <div className="h-8 w-px bg-border" />

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-medium text-primary-foreground">AD</span>
              </div>
              {!isSidebarCollapsed && (
                <div className="text-sm">
                  <div className="font-medium">Admin User</div>
                  <div className="text-xs text-muted-foreground">admin@irlobby.com</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
