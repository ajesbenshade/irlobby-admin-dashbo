# Authentication System Documentation

## Overview

The IRLobby Admin Dashboard implements a comprehensive authentication system with login, logout, session persistence, and role-based access control. The system uses the Spark KV store for persistent sessions and provides a clean separation between authenticated and unauthenticated states.

## Architecture

### Components

1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Central authentication state management
   - Provides auth methods to entire application
   - Handles session persistence via Spark KV

2. **LoginPage** (`src/components/pages/LoginPage.tsx`)
   - User-facing login form
   - Email/password authentication
   - Error handling and validation
   - Demo credentials display

3. **ProtectedRoute** (`src/components/auth/ProtectedRoute.tsx`)
   - Wraps protected content
   - Enforces authentication requirements
   - Implements role-based access control
   - Shows loading states during auth check

4. **AppLayout** (`src/components/layout/AppLayout.tsx`)
   - Displays authenticated user information
   - Provides logout functionality
   - Shows user avatar, email, and role badge

## Authentication Flow

### Initial Load
1. App renders with `AuthProvider` wrapper
2. `AuthContext` checks for stored credentials in Spark KV
3. If credentials exist, user is automatically logged in
4. If not, `ProtectedRoute` redirects to `LoginPage`

### Login Process
1. User enters email and password
2. Credentials sent to `/admin/auth/login` endpoint
3. On success:
   - Auth token stored in KV as `auth-token`
   - User data stored in KV as `auth-user`
   - User is redirected to dashboard
4. On failure:
   - Error message displayed
   - User remains on login page

### Logout Process
1. User clicks logout in header dropdown
2. Logout request sent to `/admin/auth/logout` endpoint
3. Auth token and user data cleared from KV
4. User redirected to login page

### Session Persistence
- Uses Spark's `useKV` hook for reactive state management
- Credentials persist across page reloads
- Automatic re-authentication on app start

## API Integration

### Login Endpoint
```typescript
POST https://api.irlobby.com/admin/auth/login
Content-Type: application/json

{
  "email": "admin@irlobby.com",
  "password": "admin123"
}

Response:
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "admin",
    "email": "admin@irlobby.com",
    "avatarUrl": "https://...",
    "role": "admin"
  }
}
```

### Logout Endpoint
```typescript
POST https://api.irlobby.com/admin/auth/logout
Authorization: Bearer {token}

Response: 200 OK
```

## Role-Based Access Control

### User Roles
- **user**: Basic access level
- **moderator**: Can access moderation tools
- **admin**: Full system access

### Role Hierarchy
```typescript
const roleHierarchy = { 
  user: 0, 
  moderator: 1, 
  admin: 2 
}
```

### Implementing Protected Routes
```typescript
// Require any authenticated user
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Require specific role
<ProtectedRoute requiredRole="admin">
  <AdminSettingsPage />
</ProtectedRoute>
```

## Using the Auth Context

### Accessing Auth State
```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()
  
  if (isLoading) return <LoadingSpinner />
  if (!isAuthenticated) return <LoginPrompt />
  
  return (
    <div>
      <p>Welcome, {user?.login}!</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  )
}
```

### Auth Context API
```typescript
type AuthContextType = {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

type AuthUser = {
  id: string
  login: string
  email: string
  avatarUrl: string
  isOwner: boolean
  role: 'user' | 'moderator' | 'admin'
}
```

## Security Considerations

### What's Protected
✅ Authentication tokens stored securely in Spark KV
✅ Role-based access control enforced at component level
✅ Automatic logout on token expiry
✅ No sensitive data in error messages
✅ Session persistence with secure storage

### Important Notes
⚠️ This is a client-side implementation - the backend API must also enforce authentication and authorization
⚠️ Tokens should have appropriate expiration times
⚠️ Backend should validate all requests regardless of client-side checks
⚠️ Use HTTPS in production to protect credentials in transit

## Testing the Authentication

### Demo Credentials
For development and testing, use:
- Email: `admin@irlobby.com`
- Password: `admin123`

These credentials are displayed on the login page for convenience.

### Testing Different Roles
To test role-based access:
1. Modify the mock user role in the API response
2. Or update the stored user in KV: `spark.kv.set('auth-user', { ...user, role: 'moderator' })`

## Troubleshooting

### User can't log in
- Check API endpoint is accessible
- Verify credentials are correct
- Check network tab for error responses
- Ensure API returns expected response format

### Session not persisting
- Check Spark KV is working: `await spark.kv.keys()`
- Verify `useKV` hooks are properly configured
- Check browser console for errors

### Access denied on valid role
- Verify role hierarchy in `ProtectedRoute.tsx`
- Check user object has correct role property
- Ensure role comparison logic is correct

## Future Enhancements

Potential improvements to consider:
- [ ] Refresh token mechanism for long-lived sessions
- [ ] "Remember me" option for extended sessions
- [ ] Two-factor authentication support
- [ ] Password reset flow
- [ ] Account lockout after failed attempts
- [ ] Session management (view/revoke active sessions)
- [ ] Audit log for authentication events
