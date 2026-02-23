import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'

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
  const [authToken, setAuthToken] = useKV<string | null>('auth-token', null)
  const [authUser, setAuthUser] = useKV<AuthUser | null>('auth-user', null)

  const checkAuth = async () => {
    setIsLoading(true)
    try {
      if (authToken && authUser) {
        setUser(authUser)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setAuthToken(null)
      setAuthUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('https://api.irlobby.com/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const data = await response.json()
      
      const userData: AuthUser = {
        id: data.user.id,
        login: data.user.username || data.user.email,
        email: data.user.email,
        avatarUrl: data.user.avatarUrl || '',
        isOwner: data.user.role === 'admin',
        role: data.user.role,
      }

      setAuthToken(() => data.token)
      setAuthUser(() => userData)
      setUser(userData)
      setIsLoading(false)
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
      throw error
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      if (authToken) {
        await fetch('https://api.irlobby.com/admin/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }).catch(() => {})
      }
      
      setAuthToken(() => null)
      setAuthUser(() => null)
      setUser(null)
    } finally {
      setIsLoading(false)
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
