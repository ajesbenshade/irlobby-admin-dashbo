import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Users as UsersIcon, Flag, Eye } from '@phosphor-icons/react'
import { usePermissions } from '@/hooks/use-permissions'
import { getRoleLabel, getRoleBadgeColor, type Role, type Permission } from '@/lib/permissions'
import { useAuth } from '@/contexts/AuthContext'

const roleDescriptions: Record<Role, string> = {
  user: 'Basic authenticated users with minimal permissions. Can only view their own dashboard.',
  moderator: 'Content moderators who manage user-generated content and provide basic user oversight.',
  admin: 'System administrators with full access to all features and user management capabilities.',
}

const permissionDescriptions: Record<Permission, string> = {
  view_dashboard: 'Access to the main dashboard overview',
  view_users: 'View the list of users and their details',
  manage_users: 'Edit user profiles and settings',
  suspend_users: 'Temporarily suspend user accounts',
  ban_users: 'Permanently ban user accounts',
  delete_users: 'Remove user accounts from the system',
  view_moderation: 'Access the content moderation queue',
  moderate_content: 'Approve or reject flagged content',
  delete_content: 'Permanently remove content from the platform',
  view_analytics: 'Access analytics and reporting data',
  export_data: 'Export data and generate reports',
  view_ai_assistant: 'Access the AI-powered assistant features',
  access_admin_panel: 'Access administrative configuration panels',
  manage_roles: 'Modify user roles and permissions',
  view_audit_logs: 'View system audit logs and user activity',
}

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

export function AdminPanelPage() {
  const { role } = usePermissions()
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">
          Role-based access control and permission management
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <ShieldCheck className="h-5 w-5 text-primary" weight="fill" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getRoleLabel(role)}</div>
            <div className={`mt-2 inline-flex px-2 py-1 text-xs rounded-md ${getRoleBadgeColor(role)}`}>
              Level {role === 'user' ? '0' : role === 'moderator' ? '1' : '2'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
            <Eye className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rolePermissions[role].length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active permissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account</CardTitle>
            <UsersIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium truncate">{user?.email}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Logged in user
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Hierarchy</CardTitle>
          <CardDescription>
            Understanding the permission levels in IRLobby Admin Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(['admin', 'moderator', 'user'] as Role[]).map((roleType) => (
            <div key={roleType} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-md font-medium ${getRoleBadgeColor(roleType)}`}>
                  {getRoleLabel(roleType)}
                </div>
                {roleType === role && (
                  <Badge variant="outline" className="text-xs">
                    Your Role
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {roleDescriptions[roleType]}
              </p>
              <div className="flex flex-wrap gap-2">
                {rolePermissions[roleType].map((permission) => (
                  <Badge key={permission} variant="secondary" className="text-xs">
                    {permission.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permission Reference</CardTitle>
          <CardDescription>
            Detailed description of all available permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(permissionDescriptions).map(([permission, description]) => {
              const hasPermission = rolePermissions[role].includes(permission as Permission)
              return (
                <div
                  key={permission}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    hasPermission ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                  }`}
                >
                  <div className="mt-0.5">
                    {hasPermission ? (
                      <ShieldCheck className="h-5 w-5 text-primary" weight="fill" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="font-medium font-mono text-sm">
                      {permission}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {description}
                    </div>
                  </div>
                  {hasPermission && (
                    <Badge variant="secondary" className="text-xs">
                      Granted
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-amber-600" weight="fill" />
            <CardTitle>Important Security Notes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-amber-900">
          <p>
            <strong>Client-side permissions are for UX only.</strong> All permission checks must be enforced on the backend API.
          </p>
          <p>
            Role changes require a new login or token refresh to take effect in the dashboard.
          </p>
          <p>
            Higher-level roles automatically inherit all permissions from lower-level roles.
          </p>
          <p>
            Sensitive operations should have additional verification steps beyond role checks.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
