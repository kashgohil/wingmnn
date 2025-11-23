// Test setup file - sets environment variables before any imports
// This file should be imported first in test files

// Set NODE_ENV to test FIRST - this is critical for config.ts to use test defaults
process.env.NODE_ENV = "test";

// Set up test environment variables (these will use defaults from config.ts in test mode)
// But we set them explicitly here to ensure they're available
// Force override DATABASE_URL for tests
process.env.DATABASE_URL =
  "postgresql://wingmnn:wingmnn@localhost:5432/wingmnn?sslmode=disable";

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test-jwt-secret-key-minimum-32-characters-long";
}
if (!process.env.ENCRYPTION_KEY) {
  process.env.ENCRYPTION_KEY = "test-encryption-key-minimum-32-characters-long";
}
if (!process.env.GOOGLE_CLIENT_ID) {
  process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  process.env.GOOGLE_CLIENT_SECRET = "test-google-client-secret";
}
if (!process.env.GOOGLE_REDIRECT_URI) {
  process.env.GOOGLE_REDIRECT_URI =
    "http://localhost:3000/auth/google/callback";
}
