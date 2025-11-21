# Authentication API

A comprehensive authentication system supporting both email/password authentication and OAuth-based Single Sign-On (SSO) with Google.

## Features

- **Email/Password Authentication**: Traditional registration and login
- **OAuth SSO**: Google authentication (extensible to other providers)
- **Secure Session Management**: 30-day sessions with automatic extension
- **Token Rotation**: Automatic refresh token rotation for enhanced security
- **Multi-Device Support**: Manage sessions across multiple devices
- **CSRF Protection**: State parameter validation for OAuth flows
- **Rate Limiting**: Protection against brute force attacks

## Getting Started

### Development

To start the development server run:

```bash
bun run dev
```

The API will be available at http://localhost:3000/

### API Documentation

**Interactive Swagger UI** is available at:

```
http://localhost:3000/swagger
```

The Swagger UI provides:

- Complete API endpoint documentation with request/response examples
- Interactive API testing interface
- Authentication flow explanations
- Client implementation examples
- Security considerations
- Error code reference

You can also access the raw OpenAPI JSON specification at:

```
http://localhost:3000/swagger/json
```

## Environment Variables

Create a `.env` file in the `apps/api` directory with the following variables:

```bash
# Server
PORT=3000

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=15m

# Encryption
ENCRYPTION_KEY=your-encryption-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Session Configuration
SESSION_EXPIRATION_DAYS=30
SESSION_EXTENSION_THRESHOLD_DAYS=7

# Rate Limiting
LOGIN_RATE_LIMIT=5
LOGIN_RATE_WINDOW=15m

# CORS (Production)
ALLOWED_ORIGINS=https://yourdomain.com
```

## Additional Resources

- **Security Guide**: [SECURITY.md](./SECURITY.md)
- **Database Schema**: See `packages/db/schema` for data models
