# IRLobby Admin Dashboard - Security Documentation

This document outlines the security measures implemented in the IRLobby Admin Dashboard to protect against common web application vulnerabilities.

## Rate Limiting Protection

### Overview
The dashboard implements client-side rate limiting to prevent brute force attacks on authentication endpoints. Rate limits are enforced using a persistent storage mechanism that survives page reloads.

### Implementation Details

#### Rate Limiter Module (`src/lib/rate-limiter.ts`)
- **Storage**: Uses localStorage to persist rate limit data across sessions
- **Automatic Cleanup**: Runs periodic cleanup (every 60 seconds) to remove expired entries
- **Configuration**: Supports customizable limits for different endpoints

#### Protected Endpoints

1. **Login Attempts**
   - **Limit**: 5 attempts per 15 minutes
   - **Block Duration**: 30 minutes
   - **Key**: `login`
   - **Behavior**: Tracks failed login attempts; successful login resets the counter

2. **Password Reset Requests**
   - **Limit**: 5 attempts per 15 minutes
   - **Block Duration**: 30 minutes
   - **Key**: `password-reset`
   - **Behavior**: Limits how often a user can request password reset codes

3. **Code Verification**
   - **Limit**: 10 attempts per 15 minutes
   - **Block Duration**: 60 minutes
   - **Key**: `code-verify-{email}`
   - **Behavior**: Per-email rate limiting on verification code attempts; successful verification resets the counter

### User Experience

When rate limits are exceeded:
- Clear error messages display the remaining lockout time
- Form inputs are disabled during the lockout period
- A live countdown timer updates every second
- Visual warning indicators (Alert components) inform users of the situation

### Configuration Options

Each rate limit can be configured with:
```typescript
{
  maxAttempts: number,      // Maximum attempts allowed
  windowMs: number,         // Time window in milliseconds
  blockDurationMs: number   // How long to block after exceeding limit
}
```

### API Integration

The rate limiter provides:
- `checkLimit(key, config)`: Check if an action is allowed
- `recordAttempt(key, config)`: Record an attempt
- `reset(key)`: Clear rate limit for a specific key
- `getRemainingTime(key)`: Get remaining block time
- `formatTimeRemaining(ms)`: Format milliseconds into user-friendly string

## Password Security

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Password Strength Indicator
Visual feedback shows password strength:
- **Weak**: < 3 requirements met (red)
- **Medium**: 3-4 requirements met (yellow)
- **Strong**: 5+ requirements met including special characters (green)

### Password Reset Flow
1. User requests reset → Rate limited to prevent spam
2. Server sends 6-digit verification code → Rate limited
3. Code expires after 15 minutes
4. Code verification → Rate limited to prevent brute force
5. New password must meet security requirements

## Session Management

### Storage
- Authentication tokens stored using Spark's `useKV` hook
- Tokens persist across page reloads
- Automatic cleanup on logout

### Token Lifecycle
- Tokens are validated on app initialization
- Invalid or expired tokens trigger automatic logout
- Protected routes check authentication status

## Best Practices Implemented

1. **No Sensitive Data in Errors**: Error messages never reveal whether an email exists
2. **Client-Side Validation**: Immediate feedback without server round trips
3. **Persistent Rate Limits**: Limits survive page reloads and browser restarts
4. **Per-Resource Limits**: Different endpoints have appropriate limits
5. **User-Friendly Feedback**: Clear messaging about security actions
6. **Automatic Cleanup**: Rate limit data is automatically purged when expired

## Security Considerations

### Client-Side vs Server-Side
**Note**: This implementation provides client-side rate limiting as an additional layer of protection. Production deployments should **always** implement server-side rate limiting as the primary defense mechanism, as client-side limits can be bypassed by:
- Clearing localStorage
- Using different browsers or devices
- Manipulating browser developer tools

### Recommended Server-Side Protections
1. IP-based rate limiting
2. Account lockout after failed attempts
3. CAPTCHA after multiple failures
4. Email verification for password resets
5. Secure token generation and validation
6. Request signature validation

## Monitoring and Logging

### Client-Side Logging
Rate limit violations are logged to console (in development) for debugging purposes.

### Recommended Server-Side Monitoring
- Track failed authentication attempts
- Alert on unusual patterns (many failures from one IP)
- Log all password reset requests
- Monitor for distributed attacks

## Future Enhancements

Potential security improvements:
- [ ] CAPTCHA integration after multiple failed attempts
- [ ] Email notifications on account lockout
- [ ] Two-factor authentication (2FA)
- [ ] Security audit logging
- [ ] Anomaly detection for login patterns
- [ ] Device fingerprinting
- [ ] IP geolocation validation

## Compliance

This implementation follows OWASP guidelines for:
- Broken Authentication prevention
- Brute force protection
- Account lockout mechanisms
- Password strength requirements

## Testing Rate Limits

To test rate limiting behavior:
1. Attempt 5 failed logins → Should trigger lockout
2. Check that countdown timer displays correctly
3. Verify localStorage persistence across page reloads
4. Confirm automatic unblock after cooldown period
5. Test that successful login resets the counter
