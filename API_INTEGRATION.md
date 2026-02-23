# API Integration Guide

This document describes the API integration architecture for the IRLobby Admin Dashboard.

## Architecture Overview

The application uses a modern, production-ready architecture for API communication:

1. **Axios Client Layer** (`src/lib/api.ts`) - Axios-based HTTP client with automatic token refresh
2. **TanStack Query Layer** (`src/hooks/use-api.ts`) - React Query hooks for data fetching with caching, loading/error states
3. **Component Layer** - UI components that consume the hooks

## Configuration

### Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```env
VITE_API_URL=https://api.irlobby.com
```

If not set, it defaults to `https://api.irlobby.com`.

### Timeout

The default API timeout is 30 seconds and can be adjusted in the axios client configuration in `src/lib/api.ts`.

## Authentication

The admin dashboard uses JWT authentication with automatic token refresh.

### Token Storage

- **Access Token**: Stored in memory only (not persisted)
- **Refresh Token**: Stored in `localStorage` for session persistence

### Authentication Endpoints

- `POST /api/auth/token/` - Login (email/password → access/refresh tokens)
  - Body: `{ email: string, password: string }`
  - Returns: `{ access: string, refresh: string, user: {...} }`

- `POST /api/auth/token/refresh/` - Refresh access token
  - Body: `{ refresh: string }`
  - Returns: `{ access: string }`

- `POST /api/auth/token/blacklist/` - Logout (blacklist refresh token)
  - Body: `{ refresh: string }`

### Automatic Token Refresh

The axios client automatically:
1. Intercepts 401 responses
2. Attempts to refresh the access token
3. Retries the failed request with the new token
4. Redirects to login if refresh fails

## API Endpoints

### Users

- `GET /api/users/` - List users with optional search and status filters
  - Query params: `search`, `status`
  - Returns: `{ users: User[], total: number }`

- `GET /api/users/:id/` - Get user by ID
  - Returns: `User`

- `PATCH /api/users/:id/` - Update user
  - Body: `Partial<User>`
  - Returns: `User`

- `DELETE /api/users/:id/` - Delete user
  - Returns: `void`

### Content Moderation

- `GET /api/content/` - List content items with optional filters
  - Query params: `status`, `type`
  - Returns: `{ items: ContentItem[], total: number }`

- `GET /api/content/:id/` - Get content item by ID
  - Returns: `ContentItem`

- `POST /api/content/:id/moderate/` - Moderate content
  - Body: `{ action: 'approve' | 'reject', reason?: string }`
  - Returns: `ContentItem`

### Metrics

- `GET /api/metrics/dashboard/` - Get dashboard metrics
  - Returns: `Metric[]`

- `GET /api/metrics/status/` - Get system status
  - Returns: `AppStatus`

### Analytics

- `GET /api/analytics/timeseries/` - Get time series data
  - Query params: `startDate`, `endDate`, `metric`
  - Returns: `AnalyticsDataPoint[]`

- `GET /api/analytics/engagement/` - Get engagement metrics
  - Returns: `{ avgSessionDuration: number, contentPosts: number, userInteractions: number, retentionRate: number }`

## Connecting to IRLobby Backend

### Backend Requirements

The IRLobby Django backend should expose the following:

1. **JWT Authentication** using `djangorestframework-simplejwt`
2. **Token Blacklisting** for secure logout
3. **CORS Configuration** to allow the admin dashboard origin

### Example Django Settings

```python
# settings.py

INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... other middleware
]

CORS_ALLOWED_ORIGINS = [
    "https://admin.irlobby.com",  # Your deployed admin dashboard
    "http://localhost:5173",       # Local development
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

### Example Django URLs

```python
# urls.py

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

urlpatterns = [
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    
    # Your other API endpoints
    path('api/users/', include('users.urls')),
    path('api/content/', include('content.urls')),
    path('api/metrics/', include('metrics.urls')),
    path('api/analytics/', include('analytics.urls')),
]
```

## Usage Examples

### Fetching Data

```typescript
import { useUsers } from '@/hooks/use-api'

function MyComponent() {
  const { data, isLoading, error, refetch } = useUsers({ 
    search: 'john',
    status: 'active' 
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return (
    <div>
      {data?.users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
```

### Mutating Data

```typescript
import { useModerateContent } from '@/hooks/use-api'
import { toast } from 'sonner'

function ModerationButton({ contentId }: { contentId: string }) {
  const { mutate, isPending } = useModerateContent()

  const handleApprove = async () => {
    try {
      await mutate({ id: contentId, action: 'approve' })
      toast.success('Content approved')
    } catch (error) {
      toast.error('Failed to approve content')
    }
  }

  return (
    <Button onClick={handleApprove} disabled={isPending}>
      Approve
    </Button>
  )
}
```

## Error Handling

The API client handles errors automatically:

### Error Types

- **HTTP Errors** (4xx, 5xx): Axios error with response data
- **Network Errors**: Connection failures
- **Timeout Errors**: Request timeout after 30 seconds
- **401 Unauthorized**: Triggers automatic token refresh or redirect to login

### Displaying Errors

Components should display errors to users and provide retry functionality:

```typescript
{error && (
  <Card className="border-destructive">
    <CardContent className="flex items-center gap-3 pt-6">
      <Warning className="h-5 w-5 text-destructive" />
      <div className="flex-1">
        <p className="font-medium text-destructive">Failed to load data</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
      <button onClick={() => refetch()} className="text-sm font-medium text-primary hover:underline">
        Retry
      </button>
    </CardContent>
  </Card>
)}
```

## Loading States

All data-fetching hooks return an `isLoading` boolean. Components should display skeleton loaders:

```typescript
{isLoading ? (
  <Skeleton className="h-8 w-48" />
) : (
  <h1>{data.title}</h1>
)}
```

## Caching and Refetching

TanStack Query automatically caches responses and provides intelligent refetching:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,  // Don't refetch on window focus
      retry: 1,                      // Retry failed requests once
      staleTime: 5 * 60 * 1000,     // Consider data fresh for 5 minutes
    },
  },
})
```

### Manual Refetching

```typescript
const { data, refetch } = useUsers()

// Refetch manually
refetch()
```

### Query Invalidation

Mutations automatically invalidate related queries:

```typescript
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => api.users.update(id, data),
    onSuccess: () => {
      // Automatically refetch all user queries
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

## Debouncing

For search inputs, use debouncing to avoid excessive API calls:

```typescript
const [searchQuery, setSearchQuery] = useState('')
const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedSearch(searchQuery)
  }, 300)

  return () => clearTimeout(handler)
}, [searchQuery])

const { data } = useUsers({ search: debouncedSearch })
```

## Type Safety

All API responses are typed using TypeScript interfaces defined in `src/types/index.ts`:

- `User`
- `ContentItem`
- `Metric`
- `AppStatus`
- `AnalyticsDataPoint`

This ensures type safety throughout the application and provides autocomplete in your IDE.

## Adding New Endpoints

To add a new API endpoint:

1. **Add the endpoint to the API service** (`src/lib/api.ts`):
   ```typescript
   export const api = {
     // ... existing endpoints
     newResource: {
       list: async () => {
         const response = await apiClient.get('/api/resources/')
         return response.data
       },
     },
   }
   ```

2. **Create a React Query hook** (`src/hooks/use-api.ts`):
   ```typescript
   export function useResources() {
     return useQuery({
       queryKey: ['resources'],
       queryFn: () => api.newResource.list(),
     })
   }
   ```

3. **Use in components**:
   ```typescript
   const { data, isLoading, error } = useResources()
   ```

## Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables for Production

Ensure `VITE_API_URL` is set to your production API URL in your deployment environment (Netlify, Vercel, etc.).

### CORS Configuration

Coordinate with the backend team to add your deployed admin dashboard URL to `CORS_ALLOWED_ORIGINS` in the Django settings.
