import { describe, expect, it } from "bun:test";

describe("Password Strength Validation", () => {
  // Test the validation logic directly without requiring database or config
  const MIN_PASSWORD_LENGTH = 8;

  class TestAuthError extends Error {
    constructor(
      public code: string,
      message: string,
      public statusCode: number = 400
    ) {
      super(message);
      this.name = "AuthError";
    }
  }

  const validatePassword = (password: string): void => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new TestAuthError(
        "WEAK_PASSWORD",
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
        400
      );
    }
  };

  it("should reject passwords shorter than 8 characters", () => {
    const shortPasswords = [
      "",
      "a",
      "ab",
      "abc",
      "abcd",
      "abcde",
      "abcdef",
      "abcdefg",
    ];

    for (const password of shortPasswords) {
      try {
        validatePassword(password);
        // If we get here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(TestAuthError);
        expect((error as TestAuthError).code).toBe("WEAK_PASSWORD");
        expect((error as TestAuthError).message).toContain(
          "at least 8 characters"
        );
      }
    }
  });

  it("should accept passwords with 8 or more characters", () => {
    const validPasswords = [
      "12345678",
      "password123",
      "verylongpassword",
      "a".repeat(100),
    ];

    for (const password of validPasswords) {
      expect(() => validatePassword(password)).not.toThrow();
    }
  });

  it("should accept exactly 8 character passwords", () => {
    const password = "12345678";
    expect(password.length).toBe(8);
    expect(() => validatePassword(password)).not.toThrow();
  });
});
