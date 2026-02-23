# API Integration Guide

This document describes the API integration architecture for the IRLobby Admin Dashboard.

## Architecture Overview

The application uses a layered architecture for API communication:

1. **API Client Layer** (`src/lib/api-client.ts`) - Low-level HTTP client with error handling
2. **API Service Layer** (`src/lib/api.ts`) - Type-safe API endpoint definitions
3. **React Hooks Layer** (`src/hooks/use-api.ts`) - React hooks for data fetching with loading/error states
4. **Component Layer** - UI components that consume the hooks

## Configuration

### Environment Variables

The API base URL can be configured via environment variable:

```env
VITE_API_BASE_URL=https://api.irlobby.com
```

If not set, it defaults to `https://api.irlobby.com` as defined in `src/lib/config.ts`.

### Timeout

The default API timeout is 30 seconds and can be adjusted in `src/lib/config.ts`:

```typescript
api: {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.irlobby.com',
  timeout: 30000, // 30 seconds
}
```

## API Endpoints

### Users

- `GET /api/users` - List users with optional search and status filters
  - Query params: `search`, `status`
  - Returns: `{ users: User[], total: number }`

- `GET /api/users/:id` - Get user by ID
  - Returns: `User`

- `PATCH /api/users/:id` - Update user
  - Body: `Partial<User>`
  - Returns: `User`

- `DELETE /api/users/:id` - Delete user
  - Returns: `void`

### Content Moderation

- `GET /api/content` - List content items with optional filters
  - Query params: `status`, `type`
  - Returns: `{ items: ContentItem[], total: number }`

- `GET /api/content/:id` - Get content item by ID
  - Returns: `ContentItem`

- `POST /api/content/:id/moderate` - Moderate content
  - Body: `{ action: 'approve' | 'reject', reason?: string }`
  - Returns: `ContentItem`

### Metrics

- `GET /api/metrics/dashboard` - Get dashboard metrics
  - Returns: `Metric[]`

- `GET /api/metrics/status` - Get system status
  - Returns: `AppStatus`

### Analytics

- `GET /api/analytics/timeseries` - Get time series data
  - Query params: `startDate`, `endDate`, `metric`
  - Returns: `AnalyticsDataPoint[]`

- `GET /api/analytics/engagement` - Get engagement metrics
  - Returns: `{ avgSessionDuration: number, contentPosts: number, userInteractions: number, retentionRate: number }`

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

function ModerationButton({ contentId }) {
  const { mutate, isLoading } = useModerateContent()

  const handleApprove = async () => {
    try {
      await mutate({ id: contentId, action: 'approve' })
      toast.success('Content approved')
    } catch (error) {
      toast.error('Failed to approve content')
    }
  }

  return (
    <Button onClick={handleApprove} disabled={isLoading}>
      Approve
    </Button>
  )
}
```

## Error Handling

The API client handles errors in multiple ways:

### APIError Class

All API errors are wrapped in the `APIError` class with the following properties:

```typescript
class APIError extends Error {
  message: string  // Human-readable error message
  status?: number  // HTTP status code (e.g., 404, 500)
  code?: string    // Error code (e.g., 'TIMEOUT', 'NETWORK_ERROR')
}
```

### Error Types

- **HTTP Errors** (4xx, 5xx): Status code and server message
- **Timeout Errors**: `status: 408`, `code: 'TIMEOUT'`
- **Network Errors**: `code: 'NETWORK_ERROR'`
- **Unknown Errors**: `code: 'UNKNOWN_ERROR'`

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

## Development with Mock Data

During development or when the API is unavailable, you can temporarily use mock data by importing from `@/lib/mock-data`:

```typescript
// For development only
import { mockUsers } from '@/lib/mock-data'

// Production
import { useUsers } from '@/hooks/use-api'
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
         return apiClient.get<ResourceType[]>('/api/resources')
       },
     },
   }
   ```

2. **Create a React hook** (`src/hooks/use-api.ts`):
   ```typescript
   export function useResources() {
     return useQuery<ResourceType[]>(() => api.newResource.list(), [])
   }
   ```

3. **Use in components**:
   ```typescript
   const { data, isLoading, error } = useResources()
   ```
