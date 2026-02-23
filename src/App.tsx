import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/components/pages/DashboardPage'
import { UsersPage } from '@/components/pages/UsersPage'
import { ModerationPage } from '@/components/pages/ModerationPage'
import { AnalyticsPage } from '@/components/pages/AnalyticsPage'
import { AIAssistantPage } from '@/components/pages/AIAssistantPage'
import { AdminPanelPage } from '@/components/pages/AdminPanelPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

type Page = 'dashboard' | 'users' | 'moderation' | 'analytics' | 'ai' | 'admin'

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />
      case 'users':
        return <UsersPage />
      case 'moderation':
        return <ModerationPage />
      case 'analytics':
        return <AnalyticsPage />
      case 'ai':
        return <AIAssistantPage />
      case 'admin':
        return <AdminPanelPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <ProtectedRoute>
      <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </AppLayout>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App