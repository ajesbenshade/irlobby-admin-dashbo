import { useState, FormEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SignIn, Eye, EyeSlash } from '@phosphor-icons/react'
import { ForgotPasswordPage } from './ForgotPasswordPage'
import { VerifyCodePage } from './VerifyCodePage'
import { ResetPasswordPage } from './ResetPasswordPage'
import { toast } from 'sonner'

type AuthView = 'login' | 'forgot-password' | 'verify-code' | 'reset-password'

export function LoginPage() {
  const { login, isLoading } = useAuth()
  const [view, setView] = useState<AuthView>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetEmail, setResetEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.')
    }
  }

  const handleForgotPassword = () => {
    setView('forgot-password')
    setError(null)
  }

  const handleBackToLogin = () => {
    setView('login')
    setError(null)
  }

  const handleCodeSent = (sentToEmail: string) => {
    setResetEmail(sentToEmail)
    setView('verify-code')
  }

  const handleCodeVerified = (verifiedEmail: string, code: string) => {
    setResetEmail(verifiedEmail)
    setVerificationCode(code)
    setView('reset-password')
  }

  const handlePasswordReset = () => {
    toast.success('Password reset successfully! Please sign in with your new password.')
    setView('login')
    setResetEmail('')
    setVerificationCode('')
  }

  if (view === 'forgot-password') {
    return (
      <ForgotPasswordPage
        onBackToLogin={handleBackToLogin}
        onCodeSent={handleCodeSent}
      />
    )
  }

  if (view === 'verify-code') {
    return (
      <VerifyCodePage
        email={resetEmail}
        onBackToForgotPassword={() => setView('forgot-password')}
        onCodeVerified={handleCodeVerified}
      />
    )
  }

  if (view === 'reset-password') {
    return (
      <ResetPasswordPage
        email={resetEmail}
        verificationCode={verificationCode}
        onPasswordReset={handlePasswordReset}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
            IRLobby Admin
          </h1>
          <p className="text-muted-foreground">
            Sign in to access the admin dashboard
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@irlobby.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeSlash size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end mb-4">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-accent hover:text-accent-foreground transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <SignIn size={20} className="mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Demo credentials for testing:</p>
              <p className="font-mono text-xs mt-1">
                admin@irlobby.com / admin123
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected admin area. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  )
}
