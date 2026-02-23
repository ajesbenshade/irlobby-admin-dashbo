import { useState, FormEvent, useRef, useEffect, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Key, Warning } from '@phosphor-icons/react'
import { rateLimiter, formatTimeRemaining } from '@/lib/rate-limiter'

type VerifyCodePageProps = {
  email: string
  onBackToForgotPassword: () => void
  onCodeVerified: (email: string, code: string) => void
}

export function VerifyCodePage({ email, onBackToForgotPassword, onCodeVerified }: VerifyCodePageProps) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTimeRemaining, setBlockTimeRemaining] = useState<string>('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    const checkRateLimit = () => {
      const remaining = rateLimiter.getRemainingTime(`code-verify-${email}`)
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
  }, [email])

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = [...code]
    
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i]
    }
    
    setCode(newCode)
    const nextEmpty = pastedData.length < 6 ? pastedData.length : 5
    inputRefs.current[nextEmpty]?.focus()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const verificationCode = code.join('')
    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    const rateLimitCheck = rateLimiter.checkLimit(`code-verify-${email}`, {
      maxAttempts: 10,
      windowMs: 15 * 60 * 1000,
      blockDurationMs: 60 * 60 * 1000,
    })

    if (!rateLimitCheck.allowed) {
      if (rateLimitCheck.blockedUntil) {
        const remaining = rateLimitCheck.blockedUntil - Date.now()
        setError(`Too many verification attempts. Please try again in ${formatTimeRemaining(remaining)}.`)
        setIsBlocked(true)
      } else if (rateLimitCheck.resetTime) {
        const remaining = rateLimitCheck.resetTime - Date.now()
        setError(`Rate limit exceeded. Please try again in ${formatTimeRemaining(remaining)}.`)
      }
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('https://api.irlobby.com/admin/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        rateLimiter.recordAttempt(`code-verify-${email}`, {
          maxAttempts: 10,
          windowMs: 15 * 60 * 1000,
          blockDurationMs: 60 * 60 * 1000,
        })
        throw new Error(errorData.message || 'Invalid verification code')
      }

      rateLimiter.reset(`code-verify-${email}`)
      onCodeVerified(email, verificationCode)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code. Please try again.')
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    setError(null)
    setResendCooldown(60)

    try {
      const response = await fetch('https://api.irlobby.com/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to resend code')
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.')
      setResendCooldown(0)
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
            Enter verification code
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Verify Code</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to <span className="font-semibold">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {isBlocked && blockTimeRemaining && (
                <Alert variant="destructive" className="bg-destructive/10">
                  <Warning size={20} className="text-destructive" />
                  <AlertDescription>
                    Too many attempts. Verification temporarily locked for {blockTimeRemaining}.
                  </AlertDescription>
                </Alert>
              )}

              {error && !isBlocked && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Verification Code</Label>
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      disabled={isLoading || isBlocked}
                      className="w-12 h-14 text-center text-2xl font-semibold border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || code.some(d => !d) || isBlocked}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Key size={20} className="mr-2" />
                    Verify Code
                  </>
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || isBlocked}
                >
                  {resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    'Resend Code'
                  )}
                </Button>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={onBackToForgotPassword}
                disabled={isLoading}
              >
                <ArrowLeft size={20} className="mr-2" />
                Back
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Code expires in 15 minutes. Limited to 10 attempts.
        </p>
      </div>
    </div>
  )
}
