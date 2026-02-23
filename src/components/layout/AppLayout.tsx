import { useState } from 'react'
import { House, Users, Flag, ChartBar, Robot, SignOut, ShieldCheck } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/use-permissions'
import { getRoleBadgeColor, getRoleLabel } from '@/lib/permissions'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Permission } from '@/lib/permissions'

type Page = 'dashboard' | 'users' | 'moderation' | 'analytics' | 'ai' | 'admin'

interface AppLayoutProps {
  children: React.ReactNode
  currentPage: Page
  onNavigate: (page: Page) => void
}

export function AppLayout({ children, currentPage, onNavigate }: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const { can } = usePermissions()

  const navItems: Array<{
    id: Page
    label: string
    icon: typeof House
    badge?: number
    permission: Permission
  }> = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: House, permission: 'view_dashboard' },
    { id: 'users' as Page, label: 'Users', icon: Users, permission: 'view_users' },
    { id: 'moderation' as Page, label: 'Moderation', icon: Flag, badge: 23, permission: 'view_moderation' },
    { id: 'analytics' as Page, label: 'Analytics', icon: ChartBar, permission: 'view_analytics' },
    { id: 'ai' as Page, label: 'AI Assistant', icon: Robot, permission: 'view_ai_assistant' },
    { id: 'admin' as Page, label: 'Admin Panel', icon: ShieldCheck, permission: 'access_admin_panel' },
  ]

  const visibleNavItems = navItems.filter(item => can(item.permission))

  const handleLogout = async () => {
    await logout()
  }

  const getUserInitials = () => {
    if (!user) return 'U'
    const names = user.login.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return user.login.substring(0, 2).toUpperCase()
  }

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={cn(
          'border-r bg-card transition-all duration-300',
          isSidebarCollapsed ? 'w-20' : 'w-64'
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
          {visibleNavItems.map((item) => {
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-accent px-3 py-2 rounded-lg transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl} alt={user?.login} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm text-left">
                    <div className="font-medium">{user?.login || 'User'}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.login}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <div className={cn("w-fit mt-1 px-2 py-0.5 text-xs rounded-md", getRoleBadgeColor(user?.role || 'user'))}>
                      {getRoleLabel(user?.role || 'user')}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <SignOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
