# Security Features

This document outlines the security features implemented in the authentication system.

## 1. Rate Limiting

**Location**: `src/middleware/rate-limit.ts`

### Configuration

- **Login endpoint**: 5 attempts per 15 minutes per IP address
- **Configurable**: Can be adjusted via environment variables (`LOGIN_RATE_LIMIT`, `LOGIN_RATE_WINDOW`)

### Features

- In-memory rate limiting (suitable for development)
- Per-IP address tracking
- Automatic cleanup of expired entries
- Standard rate limit headers:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in window
  - `X-RateLimit-Reset`: Timestamp when limit resets
  - `Retry-After`: Seconds until retry is allowed (when rate limited)

### Production Considerations

For production environments with multiple server instances, consider replacing the in-memory store with Redis-based rate limiting for distributed rate limiting across servers.

## 2. Password Strength Validation

**Location**: `src/services/auth.service.ts`

### Requirements

- Minimum password length: 8 characters
- Enforced during user registration
- Returns clear error message: `WEAK_PASSWORD`

### Implementation

The password validation is performed in the `AuthService.validatePassword()` method before password hashing occurs.

## 3. CORS Configuration

**Location**: `src/index.ts` (using `@elysiajs/cors` plugin)

### Features

- **Development**: Allows all origins (`origin: true`)
- **Production**: Configurable via `ALLOWED_ORIGINS` environment variable
- **Credentials**: Enabled for cookie-based authentication
- **Allowed Headers**: Content-Type, Authorization, X-CSRF-Token, X-Forwarded-For, X-Real-IP, User-Agent
- **Exposed Headers**: X-Access-Token, X-RateLimit-\*, Retry-After
- **Preflight Handling**: Automatic OPTIONS request handling with 24-hour cache
- **Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS

### Configuration

The CORS plugin is configured in `src/index.ts`:

```typescript
cors({
  origin: isProduction
    ? process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) || []
    : true, // Allow all origins in development
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-CSRF-Token", // CSRF protection
    "X-Forwarded-For", // IP forwarding (proxy support)
    "X-Real-IP", // Alternative IP header
    "User-Agent", // Client identification
  ],
  exposeHeaders: [
    "X-Access-Token", // New access token after refresh
    "X-RateLimit-Limit", // Rate limit maximum
    "X-RateLimit-Remaining", // Rate limit remaining
    "X-RateLimit-Reset", // Rate limit reset time
    "Retry-After", // Retry after rate limit
  ],
  maxAge: 86400, // 24 hours
});
```

Set the `ALLOWED_ORIGINS` environment variable in production:

```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

## 4. HTTPS-Only Cookies

**Location**: `src/index.ts`

### Configuration

Refresh tokens are stored in HTTP-only cookies with the following security settings:

```typescript
{
  httpOnly: true,           // Prevents JavaScript access (XSS protection)
  secure: isProduction,     // HTTPS-only in production
  sameSite: "strict",       // CSRF protection
  path: "/",
  maxAge: 30 * 24 * 60 * 60 // 30 days
}
```

### Environment Detection

The `secure` flag is automatically set based on the `NODE_ENV` environment variable:

- **Development**: `secure: false` (allows HTTP)
- **Production**: `secure: true` (requires HTTPS)

## Security Best Practices

### 1. Token Security

- Access tokens: JWT with 15-minute expiration
- Refresh tokens: 256-bit random strings, hashed before storage
- Token rotation: New refresh token issued on every refresh
- Reuse detection: Automatic session revocation on token reuse

### 2. Password Security

- bcrypt hashing with work factor 12
- Minimum 8 character requirement
- Generic error messages to prevent user enumeration

### 3. Session Security

- 30-day expiration with automatic extension on activity
- IP address and user agent tracking
- Support for session revocation (individual and bulk)

### 4. OAuth Security

- State parameter for CSRF protection
- Token encryption using AES-256-GCM
- Secure token storage in database

## Testing

Security features are tested in:

- `src/middleware/rate-limit.test.ts` - Rate limiting tests
- `src/services/password-validation.test.ts` - Password validation tests
- `src/security-features.test.ts` - Integration tests

Run tests with:

```bash
bun test apps/api/src/security-features.test.ts
```

## Environment Variables

Required security-related environment variables:

```bash
# JWT Configuration
JWT_SECRET=<random-256-bit-secret>
JWT_EXPIRATION=15m

# Encryption
ENCRYPTION_KEY=<random-256-bit-key>

# Rate Limiting
LOGIN_RATE_LIMIT=5
LOGIN_RATE_WINDOW=15m

# CORS (Production)
ALLOWED_ORIGINS=https://yourdomain.com

# Environment
NODE_ENV=production  # Enables HTTPS-only cookies
```

## Future Enhancements

1. **Redis-based Rate Limiting**: For distributed systems
2. **Advanced Password Requirements**: Special characters, numbers, uppercase
3. **Account Lockout**: Temporary lockout after repeated failed attempts
4. **IP Whitelisting**: For administrative endpoints
5. **Security Headers**: Helmet.js or similar for additional headers
6. **Audit Logging**: Track all authentication events
