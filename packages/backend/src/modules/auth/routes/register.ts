import { CONSTANTS, ROUTES } from "@auth/constants";
import { auth } from "@auth/router";
import { generateTokens } from "@auth/utils/jwt";
import { hashPassword } from "@auth/utils/password";
import { zValidator } from "@hono/zod-validator";
import { userQuery } from "@users/utils";
import { tryCatchAsync } from "@wingmnn/utils";
import { setCookie } from "hono/cookie";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

auth.post("/register", zValidator("form", registerSchema), async (c) => {
  const { name, email, password } = c.req.valid("form");

  console.log(`[AUTH] Registration attempt for email: ${email}`);

  // Check if user already exists
  const { result: existingUser, error } = await tryCatchAsync(
    userQuery.get("email", email),
  );

  if (error) {
    console.error("[AUTH][REGISTER] Something went wrong: ", error);
    return c.json({ message: "Cannot login" }, 401);
  }

  if (existingUser) {
    console.log(`[AUTH] User already exists for email: ${email}`);
    return c.json(
      {
        success: false,
        message: "Email already registered",
        redirectUrl: ROUTES.LOGIN_ROUTE,
      },
      409,
    );
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const { result, error: creationError } = await tryCatchAsync(
    userQuery.insert
      .values({
        name,
        email,
        password: hashedPassword,
        authProvider: "email",
        isOnboarded: false,
      })
      .returning(),
  );

  if (creationError) {
    console.error("[AUTH][REGISTER] Something went wrong: ", error);
    return c.json({ message: "Cannot create user" }, 401);
  }

  const [user] = result;

  console.log(`[AUTH] User registered successfully: ${user.id}`);

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user);

  // Set cookies
  setCookie(c, CONSTANTS.ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: CONSTANTS.ACCESS_TOKEN_EXPIRES_IN,
    path: "/",
  });

  setCookie(c, CONSTANTS.REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: CONSTANTS.REFRESH_TOKEN_EXPIRES_IN,
    path: "/",
  });

  setCookie(c, CONSTANTS.AUTHENTICATED, "true", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    maxAge: CONSTANTS.ACCESS_TOKEN_EXPIRES_IN,
    path: "/",
  });

  return c.json({
    success: true,
    message: "Registration successful, please complete onboarding",
    redirectUrl: ROUTES.ONBOARDING_ROUTE,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});
