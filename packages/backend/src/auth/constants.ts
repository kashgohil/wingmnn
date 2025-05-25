import { env } from "bun";

export const CONSTANTS = {
  // JWT constants
  JWT_SECRET: env.JWT_SECRET || "development_jwt_secret_key",
  ACCESS_TOKEN_EXPIRES_IN: 15 * 60, // 15 minutes in seconds
  REFRESH_TOKEN_EXPIRES_IN: 7 * 24 * 60 * 60, // 7 days in seconds

  // Google OAuth constants
  GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_REDIRECT_URI:
    env.GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/sso/google/callback",

  // Cookies
  ACCESS_TOKEN_COOKIE: "access_token",
  REFRESH_TOKEN_COOKIE: "refresh_token",
  AUTHENTICATED: "authenticated",
};

export const ROUTES = {
  // Auth routes
  LOGIN_ROUTE: "/api/auth/login",
  REGISTER_ROUTE: "/api/auth/register",
  GOOGLE_AUTH_ROUTE: "/api/auth/google",
  GOOGLE_CALLBACK_ROUTE: "/api/auth/google/callback",
  REFRESH_TOKEN_ROUTE: "/api/auth/refresh",
  LOGOUT_ROUTE: "/api/auth/logout",
  UI_URL: env.UI_URL || "http://localhost:5173",

  // Redirect routes
  HOME_ROUTE: "/",
  ONBOARDING_ROUTE: "/onboarding",
  LOGIN_PAGE: "/login",
  SIGNUP_PAGE: "/signup",
};
