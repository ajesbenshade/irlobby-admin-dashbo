# IRLobby Admin Dashboard

A professional web-based administration companion for the IRLobby mobile app, built with React, TypeScript, and integrated with the IRLobby Django REST Framework backend.

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx       # Route protection wrapper
│   ├── layout/
│   │   └── AppLayout.tsx           # Main layout with sidebar navigation
│   ├── pages/
│   │   ├── LoginPage.tsx           # Authentication page
│   │   ├── DashboardPage.tsx       # Overview dashboard with metrics
│   │   ├── UsersPage.tsx           # User management and search
│   │   ├── ModerationPage.tsx      # Content moderation queue
│   │   ├── AnalyticsPage.tsx       # Charts and engagement metrics
│   │   └── AIAssistantPage.tsx     # AI-powered chat assistant
│   └── ui/                         # shadcn/ui components (pre-installed)
├── contexts/
│   └── AuthContext.tsx             # Authentication context and hooks
├── hooks/
│   └── use-api.ts                  # TanStack Query hooks for API calls
├── lib/
│   ├── api.ts                      # Axios client with JWT token management
│   ├── config.ts                   # App configuration and constants
│   └── utils.ts                    # Utility functions
├── types/
│   └── index.ts                    # TypeScript type definitions
├── App.tsx                         # Main app component with QueryClient
└── index.css                       # Custom theme and styles
```

## Features

### Dashboard
- Real-time system status monitoring
- Key metrics with trend indicators
- Quick action shortcuts
- App health visualization

### User Management
- Search and filter users
- View user details and activity
- Role and status management
- Report tracking

### Content Moderation
- Review flagged content queue
- Approve/reject moderation actions
- Filter by status (pending/reviewed)
- Context viewing for reported items

### Analytics
- Daily active users chart
- User growth trends
- Engagement metrics
- Responsive visualizations with Recharts

### AI Assistant
- Chat-based interface for admin tasks
- Powered by Spark AI (gpt-4o-mini)
- Conversation history persistence
- Example prompts for common queries

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **TanStack Query** - Server state management and caching
- **Axios** - HTTP client with interceptors
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Recharts** - Data visualization
- **Phosphor Icons** - Icon set
- **Spark APIs** - AI capabilities
- **Sonner** - Toast notifications

## Setup

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your API URL:
   ```env
   VITE_API_URL=https://api.irlobby.com
   ```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Building for Production

Build the application:

```bash
npm run build
```

The built files will be in the `dist/` directory.

Preview the production build locally:

```bash
npm run preview
```

## Deployment

### Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_API_URL=https://api.irlobby.com`
5. Deploy!

### Vercel

1. Connect your repository to Vercel
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://api.irlobby.com`
6. Deploy!

### Other Platforms

Any static hosting platform that supports Node.js builds will work. Ensure you:
- Run `npm run build`
- Serve files from the `dist/` directory
- Set the `VITE_API_URL` environment variable

## Authentication

The dashboard uses JWT authentication:
- **Access tokens** are stored in memory (not persisted)
- **Refresh tokens** are stored in localStorage
- Automatic token refresh on 401 responses
- Secure logout with token blacklisting

See [AUTHENTICATION.md](./AUTHENTICATION.md) for detailed authentication flow.

## API Integration

The app integrates with the IRLobby Django REST Framework backend using:
- Axios for HTTP requests
- TanStack Query for data fetching and caching
- Automatic retry and error handling

See [API_INTEGRATION.md](./API_INTEGRATION.md) for detailed API documentation.

## Backend Requirements

The IRLobby backend must provide:

1. **JWT Authentication** endpoints:
   - `POST /api/auth/token/` - Login
   - `POST /api/auth/token/refresh/` - Refresh token
   - `POST /api/auth/token/blacklist/` - Logout

2. **CORS Configuration**:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "https://admin.irlobby.com",  # Your deployed URL
       "http://localhost:5173",       # Local development
   ]
   ```

3. **API Endpoints**:
   - `/api/users/` - User management
   - `/api/content/` - Content moderation
   - `/api/metrics/` - Dashboard metrics
   - `/api/analytics/` - Analytics data

See [API_INTEGRATION.md](./API_INTEGRATION.md) for complete endpoint specifications.

## Development Patterns

**State Management:**
- Use TanStack Query hooks for server state (API data)
- Use `useKV` hook for persistent client state (chat messages, preferences)
- Use `useState` for transient UI state

**Navigation:**
- Client-side routing via state management
- Page components in `src/components/pages/`

**Styling:**
- Custom indigo/cyan theme in `index.css`
- Tailwind utility classes throughout
- Inter font for UI, JetBrains Mono for data

**Error Handling:**
- Display errors with retry functionality
- Use skeleton loaders for loading states
- Toast notifications for user feedback

## Security

- Access tokens stored in memory only (cleared on page refresh)
- Refresh tokens in localStorage (httpOnly not available in SPA)
- Automatic token refresh before expiration
- Token blacklisting on logout
- Protected routes require authentication

## Future Enhancements

- [ ] Real-time updates via WebSockets
- [ ] Role-based access control (admin/moderator)
- [ ] Bulk operations for users/content
- [ ] Export analytics to CSV
- [ ] Dark mode toggle
- [ ] Advanced filtering with TanStack Table
- [ ] Mobile responsive sidebar

## License

Private - IRLobby Inc.
