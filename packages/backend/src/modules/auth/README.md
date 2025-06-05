# Authentication System Documentation

## Overview

This authentication system provides a secure and flexible way to handle user authentication in the Wingmnn application. It supports both email/password-based authentication and Google SSO (Single Sign-On) with access to Google APIs (Gmail, Calendar, and Drive).

## Features

- Email/password authentication
- Google OAuth authentication with Gmail, Calendar, and Drive scope access
- JWT-based authentication with access and refresh tokens
- Google API integration with automatic token refresh handling
- Secure password hashing with bcrypt
- Protected routes middleware
- Seamless redirection based on user state (new user, onboarding required, etc.)

## Architecture

The authentication system is organized into the following components:

### Constants (`constants.ts`)
Contains configuration values for JWT, cookies, routes, and Google OAuth settings.

### JWT Utilities (`jwt.ts`)
Handles generation, verification, and revocation of JWT tokens. Manages both access and refresh tokens.

### Password Utilities (`password.ts`)
Provides functions for hashing and verifying passwords using bcrypt.

### Google OAuth Utilities (`google.ts`)
Handles Google OAuth flow including authorization URL generation, token exchange, and user info retrieval. Includes expanded scopes for Gmail, Calendar, and Drive API access.

### Google API Utilities (`googleApi.ts`)
Provides utilities for making authenticated requests to Google APIs with automatic token refresh handling. Includes wrapper functions for Gmail, Calendar, and Drive APIs.

### Google API Routes (`googleApiRoutes.ts`)
Implements endpoints for testing and using Google APIs through our backend service.

### Middleware (`middleware.ts`)
Provides middleware for authenticating requests:
- `authenticate`: Required authentication middleware for protected routes
- `optionalAuthenticate`: Optional authentication that doesn't block unauthenticated users

### Routes (`routes.ts`)
Implements authentication endpoints:
- `/login`: Email/password login
- `/register`: User registration
- `/google`: Google OAuth initiation
- `/google/callback`: Google OAuth callback handling
- `/refresh`: Refresh token endpoint
- `/logout`: User logout
- `/me`: Get current user info

## Authentication Flow

### Email/Password Authentication

1. User submits email and password to `/api/auth/login`
2. System verifies credentials and issues access and refresh tokens
3. Based on user state:
   - If new user: Redirected to signup page
   - If onboarding incomplete: Redirected to onboarding page
   - If fully registered: Redirected to home page

### Google SSO Authentication

1. User clicks "Login with Google" which redirects to `/api/auth/google`
2. User is redirected to Google for authentication and authorization of scopes (Profile, Email, Gmail, Calendar, Drive)
3. Google redirects back to our callback URL with an authorization code
4. System exchanges code for Google access and refresh tokens
5. System stores Google tokens securely in our database for future API access
6. System creates or updates user record based on Google profile
7. System issues our own JWT tokens for API authentication
8. Based on user state:
   - If new user: Redirected to onboarding page
   - If fully registered: Redirected to home page

### Protected Routes

Protected routes are secured by the `authenticate` middleware which:
1. Checks for a valid access token in Authorization header or cookies
2. Verifies the token signature and expiration
3. Adds the user information to the request context
4. If authentication fails, returns 401 Unauthorized or redirects to login page

## Token Management

- **Access Token**: Short-lived token (15 minutes) used for API authorization
- **Refresh Token**: Long-lived token (7 days) used to obtain new access tokens
- Tokens are stored in HTTP-only cookies for web clients
- API clients can use Authorization header with Bearer scheme
- **Google Tokens**: Access and refresh tokens issued by Google are stored securely in the database
- Google tokens are automatically refreshed when making API requests if they've expired

## Security Considerations

- Passwords are hashed using bcrypt with appropriate salt rounds
- Tokens are stored as HTTP-only cookies to prevent XSS attacks
- CSRF protection for Google OAuth flow using state parameter
- Refresh tokens are revoked on logout and when issuing new tokens
- All token operations are logged for audit purposes

## Integration

To protect a route with authentication:

```typescript
import { authenticate } from './auth/middleware';

// For a single route
app.get('/protected-route', authenticate, (c) => {
  const user = c.get('user');
  return c.json({ message: `Hello, ${user.name}!` });
});

// For a group of routes
const protectedRoutes = new Hono();
protectedRoutes.use('*', authenticate);
protectedRoutes.get('/resource1', handler1);
protectedRoutes.get('/resource2', handler2);

app.route('/api', protectedRoutes);
```

## Google API Integration

To use Google APIs on behalf of a user:

```typescript
import { GmailApi, CalendarApi, DriveApi } from './auth';

// Gmail example
app.get('/api/emails', authenticate, async (c) => {
  const user = c.get('user');
  const messages = await GmailApi.listMessages(user.id);
  return c.json(messages);
});

// Calendar example
app.get('/api/events', authenticate, async (c) => {
  const user = c.get('user');
  const today = new Date().toISOString();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const events = await CalendarApi.listEvents(user.id, today, nextWeek);
  return c.json(events);
});

// Drive example
app.get('/api/files', authenticate, async (c) => {
  const user = c.get('user');
  const files = await DriveApi.listFiles(user.id);
  return c.json(files);
});
```

The system will automatically handle token refresh when necessary, ensuring continuous access to Google APIs without manual intervention.