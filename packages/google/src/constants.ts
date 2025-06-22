import { env } from "bun";

export const CONSTANTS = {
  // Google OAuth constants
  GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_REDIRECT_URI:
    env.GOOGLE_REDIRECT_URI || "http://localhost:8001/auth/sso/google/callback",
};
