import { z } from "zod";

/**
 * Validation schemas for authentication endpoints
 * Using Zod for runtime type validation and user-friendly error messages
 */

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format");

/**
 * Password validation schema
 * Minimum 8 characters as per requirements
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters");

/**
 * Registration request body schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login request body schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * OAuth provider parameter schema
 */
export const oauthProviderSchema = z.enum(
  ["google", "github", "microsoft", "facebook"],
  {
    errorMap: () => ({ message: "Invalid OAuth provider" }),
  }
);

export type OAuthProvider = z.infer<typeof oauthProviderSchema>;

/**
 * OAuth callback query parameters schema
 */
export const oauthCallbackSchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export type OAuthCallbackQuery = z.infer<typeof oauthCallbackSchema>;

/**
 * Session ID parameter schema
 */
export const sessionIdSchema = z.object({
  id: z.string().uuid("Invalid session ID format"),
});

export type SessionIdParam = z.infer<typeof sessionIdSchema>;
