import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoginPage } from '@/components/pages/LoginPage'

type ProtectedRouteProps = {
  children: ReactNode
  requiredRole?: 'user' | 'moderator' | 'admin'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  if (requiredRole && user) {
    const roleHierarchy = { user: 0, moderator: 1, admin: 2 }
    const userRoleLevel = roleHierarchy[user.role]
    const requiredRoleLevel = roleHierarchy[requiredRole]

    if (userRoleLevel < requiredRoleLevel) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-semibold">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access this page. 
              Required role: <span className="font-semibold">{requiredRole}</span>
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
