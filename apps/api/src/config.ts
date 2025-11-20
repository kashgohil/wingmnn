import { z } from "zod";

// Environment variable schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string(),

  // JWT Configuration
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRATION: z.string().default("15m"),

  // Encryption
  ENCRYPTION_KEY: z.string().min(32),

  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string().url(),

  // Session Configuration
  SESSION_EXPIRATION_DAYS: z.coerce.number().default(30),
  SESSION_EXTENSION_THRESHOLD_DAYS: z.coerce.number().default(7),

  // Rate Limiting
  LOGIN_RATE_LIMIT: z.coerce.number().default(5),
  LOGIN_RATE_WINDOW: z.string().default("15m"),

  // Server
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:");
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const config = parseEnv();

// Helper to check if running in production
export const isProduction = config.NODE_ENV === "production";

// Helper to check if running in development
export const isDevelopment = config.NODE_ENV === "development";
