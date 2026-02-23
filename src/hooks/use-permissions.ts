import { useAuth } from '@/contexts/AuthContext'
import {
  Permission,
  Role,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessRole,
} from '@/lib/permissions'

export function usePermissions() {
  const { user } = useAuth()
  const role: Role = user?.role ?? 'user'

  return {
    role,
    can: (permission: Permission) => hasPermission(role, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(role, permissions),
    canAccessRole: (requiredRole: Role) => canAccessRole(role, requiredRole),
    isAdmin: role === 'admin',
    isModerator: role === 'moderator' || role === 'admin',
    isUser: role === 'user',
  }
}
