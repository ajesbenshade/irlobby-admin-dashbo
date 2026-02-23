type RateLimitEntry = {
  attempts: number
  firstAttemptTime: number
  blockedUntil?: number
}

type RateLimitConfig = {
  maxAttempts: number
  windowMs: number
  blockDurationMs: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
  blockDurationMs: 30 * 60 * 1000,
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map()
  private storageKey = 'rate-limits'

  constructor() {
    this.loadFromStorage()
    this.startCleanupInterval()
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        this.limits = new Map(Object.entries(data))
      }
    } catch (error) {
      console.error('Failed to load rate limits:', error)
    }
  }

  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.limits)
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save rate limits:', error)
    }
  }

  private startCleanupInterval() {
    setInterval(() => {
      const now = Date.now()
      let hasChanges = false

      for (const [key, entry] of this.limits.entries()) {
        if (entry.blockedUntil && entry.blockedUntil < now) {
          this.limits.delete(key)
          hasChanges = true
        } else if (!entry.blockedUntil && now - entry.firstAttemptTime > DEFAULT_CONFIG.windowMs) {
          this.limits.delete(key)
          hasChanges = true
        }
      }

      if (hasChanges) {
        this.saveToStorage()
      }
    }, 60 * 1000)
  }

  checkLimit(key: string, config: Partial<RateLimitConfig> = {}): {
    allowed: boolean
    remaining: number
    resetTime?: number
    blockedUntil?: number
  } {
    const cfg = { ...DEFAULT_CONFIG, ...config }
    const now = Date.now()
    const entry = this.limits.get(key)

    if (!entry) {
      return {
        allowed: true,
        remaining: cfg.maxAttempts - 1,
      }
    }

    if (entry.blockedUntil) {
      if (entry.blockedUntil > now) {
        return {
          allowed: false,
          remaining: 0,
          blockedUntil: entry.blockedUntil,
        }
      } else {
        this.limits.delete(key)
        this.saveToStorage()
        return {
          allowed: true,
          remaining: cfg.maxAttempts - 1,
        }
      }
    }

    const windowExpired = now - entry.firstAttemptTime > cfg.windowMs
    if (windowExpired) {
      this.limits.delete(key)
      this.saveToStorage()
      return {
        allowed: true,
        remaining: cfg.maxAttempts - 1,
      }
    }

    const remaining = cfg.maxAttempts - entry.attempts
    if (remaining <= 0) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.firstAttemptTime + cfg.windowMs,
      }
    }

    return {
      allowed: true,
      remaining: remaining - 1,
    }
  }

  recordAttempt(key: string, config: Partial<RateLimitConfig> = {}): void {
    const cfg = { ...DEFAULT_CONFIG, ...config }
    const now = Date.now()
    const entry = this.limits.get(key)

    if (!entry) {
      this.limits.set(key, {
        attempts: 1,
        firstAttemptTime: now,
      })
    } else if (now - entry.firstAttemptTime > cfg.windowMs) {
      this.limits.set(key, {
        attempts: 1,
        firstAttemptTime: now,
      })
    } else {
      entry.attempts++
      
      if (entry.attempts >= cfg.maxAttempts) {
        entry.blockedUntil = now + cfg.blockDurationMs
      }
    }

    this.saveToStorage()
  }

  reset(key: string): void {
    this.limits.delete(key)
    this.saveToStorage()
  }

  getRemainingTime(key: string): number | null {
    const entry = this.limits.get(key)
    if (!entry) return null

    if (entry.blockedUntil) {
      const remaining = entry.blockedUntil - Date.now()
      return remaining > 0 ? remaining : null
    }

    return null
  }
}

export const rateLimiter = new RateLimiter()

export function formatTimeRemaining(ms: number): string {
  const minutes = Math.ceil(ms / (60 * 1000))
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }
  const hours = Math.ceil(minutes / 60)
  return `${hours} hour${hours !== 1 ? 's' : ''}`
}
