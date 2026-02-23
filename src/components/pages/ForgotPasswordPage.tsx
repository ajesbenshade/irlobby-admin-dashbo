import { useState, FormEvent, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, EnvelopeSimple, Warning } from '@phosphor-icons/react'
import { rateLimiter, formatTimeRemaining } from '@/lib/rate-limiter'

type ForgotPasswordPageProps = {
  onBackToLogin: () => void
  onCodeSent: (email: string) => void
}

export function ForgotPasswordPage({ onBackToLogin, onCodeSent }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTimeRemaining, setBlockTimeRemaining] = useState<string>('')

  useEffect(() => {
    const checkRateLimit = () => {
      const remaining = rateLimiter.getRemainingTime('password-reset')
      if (remaining && remaining > 0) {
        setIsBlocked(true)
        setBlockTimeRemaining(formatTimeRemaining(remaining))
      } else {
        setIsBlocked(false)
        setBlockTimeRemaining('')
      }
    }

    checkRateLimit()
    const interval = setInterval(checkRateLimit, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!email) {
      setError('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    const rateLimitCheck = rateLimiter.checkLimit('password-reset', {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
      blockDurationMs: 30 * 60 * 1000,
    })

    if (!rateLimitCheck.allowed) {
      if (rateLimitCheck.blockedUntil) {
        const remaining = rateLimitCheck.blockedUntil - Date.now()
        setError(`Too many password reset attempts. Please try again in ${formatTimeRemaining(remaining)}.`)
        setIsBlocked(true)
      } else if (rateLimitCheck.resetTime) {
        const remaining = rateLimitCheck.resetTime - Date.now()
        setError(`Rate limit exceeded. Please try again in ${formatTimeRemaining(remaining)}.`)
      }
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('https://api.irlobby.com/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        rateLimiter.recordAttempt('password-reset', {
          maxAttempts: 5,
          windowMs: 15 * 60 * 1000,
          blockDurationMs: 30 * 60 * 1000,
        })
        throw new Error(errorData.message || 'Failed to send reset code')
      }

      rateLimiter.recordAttempt('password-reset', {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000,
        blockDurationMs: 30 * 60 * 1000,
      })
      
      setSuccess(true)
      setTimeout(() => {
        onCodeSent(email)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
            IRLobby Admin
          </h1>
          <p className="text-muted-foreground">
            Reset your password
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a verification code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isBlocked && blockTimeRemaining && (
                <Alert variant="destructive" className="bg-destructive/10">
                  <Warning size={20} className="text-destructive" />
                  <AlertDescription>
                    Too many attempts. Account temporarily locked for {blockTimeRemaining}.
                  </AlertDescription>
                </Alert>
              )}

              {error && !isBlocked && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-accent/10 border-accent text-accent-foreground">
                  <AlertDescription>
                    Verification code sent! Check your email.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@irlobby.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || success || isBlocked}
                  autoComplete="email"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || success || isBlocked}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Sending code...
                  </>
                ) : success ? (
                  <>
                    <span className="mr-2">✓</span>
                    Code sent!
                  </>
                ) : (
                  <>
                    <EnvelopeSimple size={20} className="mr-2" />
                    Send Verification Code
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={onBackToLogin}
                disabled={isLoading}
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Limited to 5 attempts per 15 minutes for security
        </p>
      </div>
    </div>
  )
}
