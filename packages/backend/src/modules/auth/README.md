# Authentication Module

## Overview

The authentication module provides secure user authentication for the Wingmnn application, supporting both email/password authentication and Google OAuth with comprehensive Google API access (Gmail, Calendar, Drive).

## Features

- **Email/Password Authentication**: Traditional login with secure password hashing
- **Google OAuth**: Single Sign-On with extensive Google API scopes
- **JWT Token Management**: Secure access/refresh token system with automatic renewal
- **Google API Integration**: Seamless access to Gmail, Calendar, and Drive APIs
- **Protected Routes**: Middleware for securing endpoints
- **Smart Redirects**: Context-aware user flow based on onboarding status

## Architecture

```
auth/
├── constants.ts          # Configuration constants
├── middleware.ts         # Authentication middleware
├── password.ts          # Password hashing utilities
├── router.ts            # Base router setup
├── routes/              # Route handlers
│   ├── heartbeat.ts     # Token refresh endpoint
│   ├── login.ts         # Email/password login
│   ├── logout.ts        # User logout
│   ├── register.ts      # User registration
│   └── sso.google.ts    # Google OAuth flow
└── utils/
    ├── google.ts        # Google OAuth utilities
    └── jwt.ts           # JWT token management
```

## API Endpoints

### Authentication Routes
- `POST /auth/login` - Email/password authentication
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/heartbeat` - Token refresh and user status

### Google OAuth Routes
- `POST /auth/sso/google` - Initiate Google OAuth flow
- `GET /auth/sso/google/callback` - Handle OAuth callback

## Authentication Flow

### Email/Password Flow

1. **Registration**: `POST /auth/register`
   - Validates email uniqueness
   - Hashes password with bcrypt
   - Creates user record with `isOnboarded: false`
   - Issues JWT tokens and sets secure cookies
   - Redirects to onboarding

2. **Login**: `POST /auth/login`
   - Validates credentials
   - Issues JWT tokens
   - Redirects based on onboarding status

### Google OAuth Flow

1. **Initiation**: `POST /auth/sso/google`
   - Generates secure state parameter
   - Redirects to Google with comprehensive scopes:
     - Profile & Email access
     - Gmail API (full access)
     - Calendar API
     - Drive API (including file metadata and photos)

2. **Callback**: `GET /auth/sso/google/callback`
   - Validates state parameter (CSRF protection)
   - Exchanges authorization code for tokens
   - Creates/updates user record
   - Stores Google tokens securely
   - Issues application JWT tokens
   - Redirects based on user status

## Token Management

### JWT Tokens
- **Access Token**: 15-minute lifespan for API authorization
- **Refresh Token**: 7-day lifespan, stored in database
- **Storage**: HTTP-only secure cookies + Authorization header support
- **Revocation**: Automatic cleanup on logout and refresh

### Google API Tokens
- **Access Token**: Short-lived Google API access
- **Refresh Token**: Long-lived token for automatic renewal
- **Auto-Refresh**: Seamless token renewal via `getValidGoogleAccessToken()`
- **Secure Storage**: Database storage with expiration tracking

## Security Features

- **Password Security**: bcrypt hashing with appropriate salt rounds
- **XSS Protection**: HTTP-only cookies prevent client-side access
- **CSRF Protection**: State parameter validation in OAuth flow
- **Token Revocation**: Refresh tokens revoked on logout
- **Audit Logging**: Comprehensive authentication event logging

## Usage Examples

### Protected Routes

```typescript
import { authenticate } from '@auth/middleware';

// Single protected route
app.get('/api/profile', authenticate, (c) => {
  const user = c.get('user');
  return c.json({ user });
});

// Protected route group
const protectedRoutes = new Hono();
protectedRoutes.use('*', authenticate);
protectedRoutes.get('/data', handler);
app.route('/api', protectedRoutes);
```

### Google API Access

```typescript
import { getValidGoogleAccessToken } from '@auth/utils/google';

// Get user's Gmail messages
app.get('/api/emails', authenticate, async (c) => {
  const user = c.get('user');
  const accessToken = await getValidGoogleAccessToken(user.id);
  
  if (!accessToken) {
    return c.json({ error: 'Google access not available' }, 401);
  }
  
  // Use token with Google APIs...
});
```

## Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8001/auth/sso/google/callback

# Application URLs
UI_URL=http://localhost:5173
```

### Google OAuth Scopes

The module requests comprehensive Google API access:
- **Profile**: Basic user information
- **Gmail**: Full email access (read, send, modify)
- **Calendar**: Calendar events management
- **Drive**: File access including metadata and photos

## Database Integration

The module integrates with the application's token management system:
- Refresh tokens stored with expiration tracking
- Google tokens stored with automatic refresh capability
- Token revocation and cleanup handled automatically

## Error Handling

- **Invalid Credentials**: Clear error messages with appropriate redirects
- **Token Expiration**: Automatic refresh with fallback to login
- **OAuth Failures**: Graceful error handling with user-friendly messages
- **API Errors**: Comprehensive logging for debugging

## Testing

The module includes comprehensive error handling and logging for easy debugging and monitoring of authentication flows.