export type Role = 'user' | 'moderator' | 'admin'

export type Permission =
  | 'view_dashboard'
  | 'view_users'
  | 'manage_users'
  | 'suspend_users'
  | 'ban_users'
  | 'delete_users'
  | 'view_moderation'
  | 'moderate_content'
  | 'delete_content'
  | 'view_analytics'
  | 'export_data'
  | 'view_ai_assistant'
  | 'access_admin_panel'
  | 'manage_roles'
  | 'view_audit_logs'

const rolePermissions: Record<Role, Permission[]> = {
  user: ['view_dashboard'],
  moderator: [
    'view_dashboard',
    'view_users',
    'view_moderation',
    'moderate_content',
    'view_analytics',
    'view_ai_assistant',
  ],
  admin: [
    'view_dashboard',
    'view_users',
    'manage_users',
    'suspend_users',
    'ban_users',
    'delete_users',
    'view_moderation',
    'moderate_content',
    'delete_content',
    'view_analytics',
    'export_data',
    'view_ai_assistant',
    'access_admin_panel',
    'manage_roles',
    'view_audit_logs',
  ],
}

export const hasPermission = (role: Role, permission: Permission): boolean => {
  return rolePermissions[role]?.includes(permission) ?? false
}

export const hasAnyPermission = (role: Role, permissions: Permission[]): boolean => {
  return permissions.some((permission) => hasPermission(role, permission))
}

export const hasAllPermissions = (role: Role, permissions: Permission[]): boolean => {
  return permissions.every((permission) => hasPermission(role, permission))
}

export const getRoleLevel = (role: Role): number => {
  const levels: Record<Role, number> = {
    user: 0,
    moderator: 1,
    admin: 2,
  }
  return levels[role] ?? 0
}

export const canAccessRole = (userRole: Role, requiredRole: Role): boolean => {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole)
}

export const getRoleLabel = (role: Role): string => {
  const labels: Record<Role, string> = {
    user: 'User',
    moderator: 'Moderator',
    admin: 'Administrator',
  }
  return labels[role] ?? 'Unknown'
}

export const getRoleBadgeColor = (role: Role): string => {
  const colors: Record<Role, string> = {
    user: 'bg-secondary text-secondary-foreground',
    moderator: 'bg-accent text-accent-foreground',
    admin: 'bg-primary text-primary-foreground',
  }
  return colors[role] ?? 'bg-muted text-muted-foreground'
}
