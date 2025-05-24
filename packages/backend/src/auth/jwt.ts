import { db } from "@db";
import { tokensTable } from "@schema/tokens";
import { User } from "@schema/users";
import { eq } from "drizzle-orm";
import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { CONSTANTS } from "./constants";

interface TokenPayload extends JWTPayload {
  sub: string;
  name: string;
  email: string;
  type: "refresh" | "access";
}

const secret = new TextEncoder().encode(CONSTANTS.JWT_SECRET);

export async function generateTokens(user: User) {
  const accessTokenPayload: TokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    type: "access",
  };

  const refreshTokenPayload: TokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    type: "refresh",
  };

  const accessTokenExpiry =
    Math.floor(Date.now() / 1000) + CONSTANTS.ACCESS_TOKEN_EXPIRES_IN;
  const refreshTokenExpiry =
    Math.floor(Date.now() / 1000) + CONSTANTS.REFRESH_TOKEN_EXPIRES_IN;

  let accessTokenPromise = new SignJWT(accessTokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(accessTokenExpiry)
    .sign(secret);

  let refreshTokenPromise = new SignJWT(refreshTokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(refreshTokenExpiry)
    .sign(secret);

  const [accessToken, refreshToken] = await Promise.all([
    accessTokenPromise,
    refreshTokenPromise,
  ]);

  // Store refresh token in database

  await db.insert(tokensTable).values({
    userId: user.id,
    type: "refresh",
    value: refreshToken,
    expiresAt: new Date(refreshTokenExpiry * 1000),
  });

  return {
    accessToken,
    refreshToken,
    accessTokenExpiry: new Date(accessTokenExpiry * 1000),
    refreshTokenExpiry: new Date(refreshTokenExpiry * 1000),
  };
}

/**
 * Verify a token and return its payload.
 * @param token The token to verify.
 * @param type The type of token to verify.
 * @returns The payload of the token.
 * @throws Error if the token is invalid or revoked.
 */
export async function verifyToken(token: string, type: "access" | "refresh") {
  try {
    const { payload } = await jwtVerify<TokenPayload>(token, secret);

    if (payload.type !== type) {
      throw new Error("Invalid token type");
    }

    if (type === "refresh") {
      // Check if refresh token exists in database and is not revoked
      const tokenRecord = await db.query.tokensTable.findFirst({
        where: eq(tokensTable.value, token),
      });

      if (!tokenRecord || tokenRecord.isRevoked) {
        throw new Error("Invalid or revoked refresh token");
      }

      // Update last used timestamp

      await db
        .update(tokensTable)
        .set({ lastUsed: new Date() })
        .where(eq(tokensTable.value, token));
    }

    return payload;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

/**
 * Revoke a token by setting its isRevoked flag to true.
 * @param token The token to revoke.
 * @returns True if the token was successfully revoked, false otherwise.
 */
export async function revokeToken(token: string) {
  try {
    await db
      .update(tokensTable)
      .set({ isRevoked: true })
      .where(eq(tokensTable.value, token));

    return true;
  } catch (error) {
    return false;
  }
}
