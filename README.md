# IRLobby Admin Dashboard

A professional web-based administration companion for the IRLobby mobile app, built with React, TypeScript, and Spark APIs.

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx          # Main layout with sidebar navigation
│   ├── pages/
│   │   ├── DashboardPage.tsx      # Overview dashboard with metrics
│   │   ├── UsersPage.tsx          # User management and search
│   │   ├── ModerationPage.tsx     # Content moderation queue
│   │   ├── AnalyticsPage.tsx      # Charts and engagement metrics
│   │   └── AIAssistantPage.tsx    # AI-powered chat assistant
│   └── ui/                        # shadcn/ui components (pre-installed)
├── lib/
│   ├── config.ts                  # App configuration and constants
│   ├── mock-data.ts               # Mock data for development
│   └── utils.ts                   # Utility functions
├── types/
│   └── index.ts                   # TypeScript type definitions
├── App.tsx                        # Main app component with routing
└── index.css                      # Custom theme and styles
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
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Recharts** - Data visualization
- **Phosphor Icons** - Icon set
- **Spark APIs** - AI and persistence (useKV hook)
- **Sonner** - Toast notifications

## Development

The app uses mock data for development. All data utilities are in `src/lib/mock-data.ts`.

### Key Patterns

**State Management:**
- Use `useKV` hook for persistent state (chat messages, etc.)
- Use `useState` for transient UI state

**Navigation:**
- Client-side routing via state management
- Page components in `src/components/pages/`

**Styling:**
- Custom indigo/cyan theme in `index.css`
- Tailwind utility classes throughout
- Inter font for UI, JetBrains Mono for data

## Next Steps

1. **API Integration**
   - Replace mock data with real API calls
   - Add error handling and loading states
   - Implement data fetching hooks

2. **Authentication**
   - Add login/logout flow
   - Implement role-based access control
   - Integrate with IRLobby auth system

3. **Real-time Features**
   - WebSocket connection for live updates
   - Real-time notification system
   - Live dashboard metric updates

4. **Enhanced Features**
   - Advanced filtering and sorting
   - Bulk operations for users/content
   - Export analytics data
   - Detailed audit logs

## Notes

- This is a desktop-first application
- All pages use placeholder data currently
- AI assistant requires Spark runtime environment
- Component architecture is modular and extensible
