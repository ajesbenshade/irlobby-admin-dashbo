import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api, setAccessToken, setRefreshToken, getRefreshToken } from '@/lib/api'

type AuthUser = {
  id: string
  login: string
  email: string
  avatarUrl: string
  isOwner: boolean
  role: 'user' | 'moderator' | 'admin'
}

type AuthContextType = {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    setIsLoading(true)
    try {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        const data = await api.auth.refresh(refreshToken)
        setAccessToken(data.access)
        
        const userData: AuthUser = {
          id: data.user?.id || '',
          login: data.user?.username || data.user?.email || '',
          email: data.user?.email || '',
          avatarUrl: data.user?.avatar_url || '',
          isOwner: data.user?.role === 'admin',
          role: data.user?.role || 'user',
        }
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setAccessToken(null)
      setRefreshToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const data = await api.auth.login(email, password)
      
      setAccessToken(data.access)
      setRefreshToken(data.refresh)
      
      const userData: AuthUser = {
        id: data.user?.id || '',
        login: data.user?.username || data.user?.email || '',
        email: data.user?.email || '',
        avatarUrl: data.user?.avatar_url || '',
        isOwner: data.user?.role === 'admin',
        role: data.user?.role || 'user',
      }

      setUser(userData)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await api.auth.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAccessToken(null)
      setRefreshToken(null)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
