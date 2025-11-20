import { db, eq, sessions, users } from "@wingmnn/db";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";

const API_URL = "http://localhost:3000";

describe("Authentication API Endpoints", () => {
  let testEmail: string;
  let testPassword: string;
  let testName: string;

  beforeEach(() => {
    // Generate unique test data for each test
    testEmail = `test-${Date.now()}@example.com`;
    testPassword = "testpassword123";
    testName = "Test User";
  });

  afterEach(async () => {
    // Clean up test data
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, testEmail))
        .limit(1);

      if (user[0]) {
        // Delete sessions first (foreign key constraint)
        await db.delete(sessions).where(eq(sessions.userId, user[0].id));
        // Delete user
        await db.delete(users).where(eq(users.id, user[0].id));
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe("POST /auth/register", () => {
    it("should register a new user with valid credentials", async () => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: testName,
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("accessToken");
      expect(data).toHaveProperty("expiresIn");
      expect(data).toHaveProperty("user");
      expect(data.user.email).toBe(testEmail);
      expect(data.user.name).toBe(testName);

      // Check that refresh token cookie is set
      const cookies = response.headers.get("set-cookie");
      expect(cookies).toContain("refresh_token");
      expect(cookies).toContain("HttpOnly");
    });

    it("should reject registration with duplicate email", async () => {
      // First registration
      await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: testName,
        }),
      });

      // Second registration with same email
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: "Another User",
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("EMAIL_ALREADY_EXISTS");
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      // Register a user for login tests
      await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: testName,
        }),
      });
    });

    it("should login with valid credentials", async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("accessToken");
      expect(data).toHaveProperty("expiresIn");
      expect(data).toHaveProperty("user");
      expect(data.user.email).toBe(testEmail);

      // Check that refresh token cookie is set
      const cookies = response.headers.get("set-cookie");
      expect(cookies).toContain("refresh_token");
      expect(cookies).toContain("HttpOnly");
    });

    it("should reject login with invalid password", async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          password: "wrongpassword",
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("INVALID_CREDENTIALS");
    });
  });

  describe("POST /auth/logout", () => {
    let accessToken: string;
    let refreshTokenCookie: string;

    beforeEach(async () => {
      // Register and login to get tokens
      await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: testName,
        }),
      });

      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      const loginData = await loginResponse.json();
      accessToken = loginData.accessToken;

      // Extract refresh token cookie
      const cookies = loginResponse.headers.get("set-cookie");
      if (cookies) {
        const match = cookies.match(/refresh_token=([^;]+)/);
        if (match) {
          refreshTokenCookie = `refresh_token=${match[1]}`;
        }
      }
    });

    it("should logout successfully with valid session", async () => {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Cookie: refreshTokenCookie,
        },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toBe("Logged out successfully");

      // Check that refresh token cookie is cleared
      const cookies = response.headers.get("set-cookie");
      expect(cookies).toContain("refresh_token=");
      expect(cookies).toContain("Max-Age=0");
    });

    it("should reject logout without authentication", async () => {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
      });

      expect(response.status).toBe(401);
    });
  });
});
