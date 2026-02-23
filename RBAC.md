# Role-Based Access Control (RBAC) Documentation

## Overview

The IRLobby Admin Dashboard implements a comprehensive Role-Based Access Control system with three distinct roles and granular permissions.

## Roles

### User
- **Level**: 0 (Lowest)
- **Description**: Basic authenticated user with minimal permissions
- **Access**: Dashboard view only

### Moderator
- **Level**: 1 (Mid-tier)
- **Description**: Content moderators who manage user-generated content and basic user oversight
- **Access**: Dashboard, Users (view), Moderation, Analytics, AI Assistant

### Administrator
- **Level**: 2 (Highest)
- **Description**: Full system access with all administrative capabilities
- **Access**: All features including user management, deletion, and role assignments

## Permission Matrix

| Permission | User | Moderator | Admin |
|---|---|---|---|
| `view_dashboard` | ✓ | ✓ | ✓ |
| `view_users` | ✗ | ✓ | ✓ |
| `manage_users` | ✗ | ✗ | ✓ |
| `suspend_users` | ✗ | ✗ | ✓ |
| `ban_users` | ✗ | ✗ | ✓ |
| `delete_users` | ✗ | ✗ | ✓ |
| `view_moderation` | ✗ | ✓ | ✓ |
| `moderate_content` | ✗ | ✓ | ✓ |
| `delete_content` | ✗ | ✗ | ✓ |
| `view_analytics` | ✗ | ✓ | ✓ |
| `export_data` | ✗ | ✗ | ✓ |
| `view_ai_assistant` | ✗ | ✓ | ✓ |
| `access_admin_panel` | ✗ | ✗ | ✓ |
| `manage_roles` | ✗ | ✗ | ✓ |
| `view_audit_logs` | ✗ | ✗ | ✓ |

## Implementation

### Files Created

1. **`src/lib/permissions.ts`**
   - Core permission definitions and utility functions
   - Role hierarchy and permission mappings
   - Helper functions for permission checking

2. **`src/hooks/use-permissions.ts`**
   - React hook for permission checking in components
   - Provides `can`, `canAny`, `canAll`, `canAccessRole` helpers
   - Role convenience flags (`isAdmin`, `isModerator`, `isUser`)

3. **`src/components/auth/PermissionGate.tsx`**
   - Declarative component for conditional rendering based on permissions
   - Supports single permission, multiple permissions, or role-based access
   - Optional fallback UI for unauthorized users

### Usage Examples

#### Using the Permission Hook

```typescript
import { usePermissions } from '@/hooks/use-permissions'

function MyComponent() {
  const { can, isAdmin, canAccessRole } = usePermissions()
  
  if (can('manage_users')) {
    // Show user management UI
  }
  
  if (isAdmin) {
    // Show admin-only features
  }
  
  if (canAccessRole('moderator')) {
    // User is moderator or higher
  }
}
```

#### Using the PermissionGate Component

```typescript
import { PermissionGate } from '@/components/auth/PermissionGate'

function UserRow() {
  return (
    <div>
      {/* Always visible */}
      <ViewDetailsButton />
      
      {/* Only visible to users with 'manage_users' permission */}
      <PermissionGate permission="manage_users">
        <EditButton />
      </PermissionGate>
      
      {/* Only visible to admins */}
      <PermissionGate requiredRole="admin">
        <DeleteButton />
      </PermissionGate>
      
      {/* Multiple permissions - any one grants access */}
      <PermissionGate permissions={['suspend_users', 'ban_users']}>
        <SuspendButton />
      </PermissionGate>
      
      {/* Multiple permissions - all required */}
      <PermissionGate 
        permissions={['manage_users', 'delete_users']} 
        requireAll
      >
        <BulkDeleteButton />
      </PermissionGate>
    </div>
  )
}
```

#### Using ProtectedRoute with Role Requirements

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function App() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminPanel />
    </ProtectedRoute>
  )
}
```

### Navigation Filtering

The `AppLayout` component automatically filters navigation items based on user permissions. Users only see menu items they have access to.

```typescript
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: House, permission: 'view_dashboard' },
  { id: 'users', label: 'Users', icon: Users, permission: 'view_users' },
  // ... more items
]

const visibleNavItems = navItems.filter(item => can(item.permission))
```

### User Action Menus

In the Users page, action menus dynamically show/hide options based on permissions:

- **View Details**: Always visible
- **Edit User**: Requires `manage_users`
- **Suspend/Unsuspend**: Requires `suspend_users`
- **Ban/Unban**: Requires `ban_users`
- **Delete User**: Requires `delete_users`

## Backend Integration

### JWT Token Structure

The JWT tokens from `/api/auth/token/` must include the user's role:

```json
{
  "access": "eyJ...",
  "refresh": "eyJ...",
  "user": {
    "id": "123",
    "email": "admin@example.com",
    "username": "admin",
    "role": "admin",
    "avatar_url": "https://..."
  }
}
```

### Backend Permission Class (Django)

Create `users/permissions.py`:

```python
from rest_framework import permissions

class IsAdminOrModerator(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'moderator']

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'
```

### Protecting Endpoints

```python
from rest_framework.decorators import api_view, permission_classes
from users.permissions import IsAdmin, IsAdminOrModerator

@api_view(['GET'])
@permission_classes([IsAdminOrModerator])
def moderation_queue(request):
    # Only admins and moderators can access
    pass

@api_view(['DELETE'])
@permission_classes([IsAdmin])
def delete_user(request, user_id):
    # Only admins can delete users
    pass
```

## Security Considerations

1. **Client-Side vs Server-Side**: Remember that all permission checks in the frontend are for UX purposes only. Always enforce permissions on the backend.

2. **Token Refresh**: The role is embedded in the JWT and refreshed with the token. Role changes require a new login or token refresh.

3. **Permission Escalation**: The system uses a hierarchical model where higher roles inherit lower role permissions.

4. **API Protection**: Every sensitive API endpoint must have corresponding permission checks on the backend.

## Testing Permissions

### Test Users

Create test users with different roles:

```python
# Admin user
admin = User.objects.create_user(
    username='admin',
    email='admin@irlobby.com',
    password='admin123',
    role='admin'
)

# Moderator user
moderator = User.objects.create_user(
    username='moderator',
    email='moderator@irlobby.com',
    password='moderator123',
    role='moderator'
)

# Regular user
user = User.objects.create_user(
    username='user',
    email='user@irlobby.com',
    password='user123',
    role='user'
)
```

### Manual Testing Checklist

- [ ] Login as regular user - verify only dashboard is accessible
- [ ] Login as moderator - verify access to users (view only), moderation, analytics, AI
- [ ] Login as admin - verify full access to all features
- [ ] Verify user action menu items show/hide based on role
- [ ] Verify navigation items filter correctly per role
- [ ] Verify direct URL access is blocked for unauthorized pages
- [ ] Verify API calls return 403 for unauthorized actions

## Future Enhancements

### Planned Features

1. **Custom Roles**: Allow admins to create custom roles with specific permission sets
2. **Audit Logging**: Track all permission-based actions for compliance
3. **Permission Groups**: Group related permissions for easier management
4. **Temporary Permissions**: Grant time-limited access to specific features
5. **IP-Based Restrictions**: Additional security layer for sensitive operations

### Permission Additions

Consider adding these permissions in future iterations:

- `view_reports` - Access to reporting dashboard
- `manage_settings` - Modify system settings
- `view_api_keys` - View API credentials
- `manage_integrations` - Configure third-party integrations
- `bulk_actions` - Perform bulk operations on users/content

## Troubleshooting

### Common Issues

**Issue**: User sees features they shouldn't have access to
- **Cause**: Permission check might be missing
- **Solution**: Add `<PermissionGate>` wrapper or `usePermissions` check

**Issue**: Navigation shows empty after role change
- **Cause**: Token not refreshed
- **Solution**: Force logout and re-login to get new token with updated role

**Issue**: API returns 403 even with frontend permission
- **Cause**: Backend permission class missing or incorrect
- **Solution**: Verify backend has matching permission decorator

**Issue**: Permission check always returns false
- **Cause**: Permission name typo or not defined in permissions.ts
- **Solution**: Check permission name matches exactly with definitions

## Contact & Support

For questions or issues with the RBAC system:
- Create an issue in the repository
- Contact the development team
- Review the code in `src/lib/permissions.ts` for detailed permission logic
