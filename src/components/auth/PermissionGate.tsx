import { ReactNode } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { Permission, Role } from '@/lib/permissions'

type PermissionGateProps = {
  children: ReactNode
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  requiredRole?: Role
  fallback?: ReactNode
}

export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  requiredRole,
  fallback = null,
}: PermissionGateProps) {
  const { can, canAny, canAll, canAccessRole } = usePermissions()

  let hasAccess = true

  if (requiredRole) {
    hasAccess = canAccessRole(requiredRole)
  } else if (permission) {
    hasAccess = can(permission)
  } else if (permissions) {
    hasAccess = requireAll ? canAll(permissions) : canAny(permissions)
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
