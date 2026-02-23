# IRLobby Admin Dashboard - PRD

A web-based administration and analytics companion for the IRLobby mobile app, designed for desktop workflows with focus on clarity and extensibility.

**Experience Qualities**:
1. **Professional** - Interface conveys authority and capability through clean typography, organized layouts, and purposeful hierarchy
2. **Efficient** - Information density balanced with scanability; common tasks are 1-2 clicks away with clear navigation
3. **Trustworthy** - Consistent patterns, clear feedback, and stable interactions build confidence in administrative actions

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a multi-view admin dashboard with user management, content moderation, analytics visualization, and AI-assisted workflows. It requires sophisticated state management, data visualization, and modular architecture to support incremental feature additions.

## Architecture

The application uses a layered architecture with clear separation of concerns:

### API Integration Layer
- **API Client** (`src/lib/api-client.ts`): HTTP client with timeout, error handling, and request/response interceptors
- **API Services** (`src/lib/api.ts`): Type-safe endpoint definitions organized by resource
- **React Hooks** (`src/hooks/use-api.ts`): Custom hooks for data fetching and mutations with loading/error states
- **Configuration** (`src/lib/config.ts`): Environment-based configuration for API endpoints and app settings

### Data Flow
1. Components use React hooks (`useUsers`, `useDashboardMetrics`, etc.)
2. Hooks call API service functions
3. API services use the API client for HTTP communication
4. Responses are typed and returned to components
5. Components render data with proper loading and error states

See `API_INTEGRATION.md` for detailed documentation on the API layer.

## Essential Features

### Authentication-Aware Layout
- **Functionality**: Displays different UI states based on user authentication and role
- **Purpose**: Ensures secure access and appropriate feature visibility for different user types
- **Trigger**: App initialization and route changes
- **Progression**: App loads → Check auth state → Show login prompt or authenticated shell → Route to appropriate view
- **Success criteria**: Correct UI renders for authenticated/unauthenticated states; auth state persists across sessions
- **Implementation Status**: ✅ Complete - Uses Spark's `spark.user()` API for authentication awareness

### Dashboard Home
- **Functionality**: Central overview displaying app health, user activity, and key performance indicators
- **Purpose**: Provides at-a-glance insight into IRLobby's operational status
- **Trigger**: User navigates to home route or completes login
- **Progression**: Navigate to dashboard → Load metrics → Render status cards and charts → Enable drill-down interactions
- **Success criteria**: Metrics display within 500ms; cards are clickable and navigate to detail views
- **Implementation Status**: ✅ Complete - Real API integration with `useDashboardMetrics` and `useAppStatus` hooks

### User Management
- **Functionality**: View, search, filter, and moderate user accounts
- **Purpose**: Enable administrators to manage the user base and handle account issues
- **Trigger**: Navigate to Users section from sidebar
- **Progression**: Open users view → Load user list → Apply filters/search → Select user → View details → Take moderation action
- **Success criteria**: List renders with sorting/filtering; search returns results in <200ms; actions provide confirmation
- **Implementation Status**: ✅ Complete - Real API integration with `useUsers` hook, debounced search, and error handling

### Content Moderation Panel
- **Functionality**: Review flagged content, apply moderation actions, and track moderation history
- **Purpose**: Maintain community standards and handle reported content efficiently
- **Trigger**: Navigate to Moderation section or click flagged content alert
- **Progression**: Open moderation queue → Review item → View context/reports → Make decision → Apply action → Log outcome
- **Success criteria**: Queue displays prioritized items; actions are reversible; audit trail is maintained
- **Implementation Status**: ✅ Complete - Real API integration with `useContentItems` and `useModerateContent` hooks, toast notifications

### Analytics Section
- **Functionality**: Visualize app usage patterns, engagement metrics, and growth trends
- **Purpose**: Inform strategic decisions with data-driven insights
- **Trigger**: Navigate to Analytics section
- **Progression**: Select analytics view → Choose date range → Load data → Render charts → Enable metric comparisons
- **Success criteria**: Charts render smoothly; date pickers work intuitively; data exports are available
- **Implementation Status**: ✅ Complete - Real API integration with `useAnalyticsTimeSeries` and `useEngagementMetrics` hooks, Recharts visualization

### AI Assistant Panel
- **Functionality**: Chat interface for AI-assisted administrative tasks and insights
- **Purpose**: Accelerate workflows through natural language commands and intelligent suggestions
- **Trigger**: Click AI assistant icon or use keyboard shortcut
- **Progression**: Open assistant → Type query → Receive response → Execute suggested actions → Close or continue conversation
- **Success criteria**: Responses appear within 2s; context is maintained across conversation; actions integrate with dashboard
- **Implementation Status**: ⏳ Pending - UI scaffold ready, awaits AI integration

## Edge Case Handling

- **Network Failures**: ✅ Graceful error states with user-friendly messages and retry buttons
- **Empty States**: ✅ Helpful messages for sections with no data (implemented in all list views)
- **Unauthorized Access**: ⏳ Planned - Redirect to login with preserved destination; clear error messaging
- **Invalid Data**: ✅ Type-safe parsing of API responses via TypeScript interfaces
- **Long Operations**: ✅ Loading states with skeleton loaders; mutation indicators with disabled buttons
- **Concurrent Edits**: ⏳ Planned - Optimistic updates with conflict resolution
- **API Timeouts**: ✅ 30-second timeout with TIMEOUT error code and retry functionality
- **Debounced Search**: ✅ 300ms debounce on search inputs to reduce API calls

## Design Direction

The design should evoke precision, control, and intelligence. Think control room meets modern SaaS dashboard - clean information architecture with purposeful visual hierarchy. The interface should feel sophisticated without being cold, data-rich without being overwhelming.

## Color Selection

A refined tech-forward palette with strong contrast for readability during extended admin sessions.

- **Primary Color**: Deep indigo (#4338ca / oklch(0.45 0.15 277)) - Conveys authority and technology; used for primary actions and navigation highlights
- **Secondary Colors**: 
  - Slate grays for backgrounds and surfaces (#f8fafc to #1e293b) - Create visual depth and hierarchy
  - Neutral blues for secondary UI elements
- **Accent Color**: Electric cyan (#06b6d4 / oklch(0.7 0.13 209)) - Draws attention to interactive elements, notifications, and key metrics
- **Foreground/Background Pairings**:
  - Primary (Deep Indigo #4338ca): White text (#FFFFFF) - Ratio 8.2:1 ✓
  - Accent (Cyan #06b6d4): Dark slate text (#0f172a) - Ratio 8.9:1 ✓
  - Background (Warm white #fafaf9): Slate text (#0f172a) - Ratio 15.8:1 ✓
  - Card (Pure white #ffffff): Slate text (#1e293b) - Ratio 14.2:1 ✓

## Font Selection

Typography should balance technical precision with contemporary professionalism, prioritizing readability in data-dense contexts.

- **Primary Typeface**: Inter (system-ui fallback) - Clean geometric sans with excellent legibility at all sizes; widely used in modern SaaS products
- **Monospace**: JetBrains Mono - For data tables, IDs, timestamps, and code snippets
- **Typographic Hierarchy**:
  - Page Title: Inter Semibold / 32px / -0.02em tracking / 1.2 line-height
  - Section Heading: Inter Semibold / 24px / -0.01em tracking / 1.3 line-height
  - Card Title: Inter Medium / 18px / normal tracking / 1.4 line-height
  - Body Text: Inter Regular / 14px / normal tracking / 1.5 line-height
  - Small Text: Inter Regular / 12px / 0.01em tracking / 1.4 line-height
  - Data/Mono: JetBrains Mono Regular / 13px / normal tracking / 1.5 line-height

## Animations

Animations should be efficient and purposeful - reinforcing spatial relationships and providing feedback without slowing workflows. Use subtle motion to guide attention and confirm actions. Sidebar transitions at 200ms, dropdown menus at 150ms, data loading skeletons with gentle pulse, and success confirmations with brief check animations.

## Component Selection

- **Layout**: Sidebar component for persistent navigation with collapsible state
- **Cards**: Card, CardHeader, CardTitle, CardContent for metric displays and content grouping
- **Tables**: Table with sorting, filtering, and pagination for user/content lists
- **Forms**: Form, Input, Label, Select, Textarea for data entry and filters
- **Dialogs**: Dialog and AlertDialog for confirmations and detail views
- **Dropdowns**: DropdownMenu for actions and options
- **Charts**: Recharts integration for analytics visualization (line, bar, area charts)
- **Navigation**: Tabs for view switching within sections
- **Feedback**: Sonner toasts for action confirmations and errors
- **Loading**: Skeleton for content loading states
- **Icons**: Phosphor icons throughout (House, Users, Flag, ChartBar, Robot, MagnifyingGlass, Bell, GearSix)
- **States**: 
  - Hover: Subtle background color shift (50ms)
  - Active: Deeper background, slight scale reduction
  - Focus: Visible ring with accent color
  - Disabled: Reduced opacity (0.5), no pointer events
- **Spacing**: Consistent 4px base unit - gaps of 4/8/12/16/24/32px
- **Mobile**: Sidebar collapses to icon-only or drawer; tables scroll horizontally; cards stack vertically; navigation moves to bottom sheet
