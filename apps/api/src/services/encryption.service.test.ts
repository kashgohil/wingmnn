import { describe, expect, test } from "bun:test";
import { EncryptionService } from "./encryption.service";

describe("EncryptionService", () => {
  const service = new EncryptionService();

  describe("Password Hashing", () => {
    test("should hash a password", async () => {
      const password = "mySecurePassword123";
      const hash = await service.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith("$2b$")).toBe(true); // bcrypt hash format
    });

    test("should verify correct password", async () => {
      const password = "mySecurePassword123";
      const hash = await service.hashPassword(password);
      const isValid = await service.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    test("should reject incorrect password", async () => {
      const password = "mySecurePassword123";
      const wrongPassword = "wrongPassword";
      const hash = await service.hashPassword(password);
      const isValid = await service.verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });
  });

  describe("OAuth Token Encryption", () => {
    test("should encrypt and decrypt a token", () => {
      const token = "ya29.a0AfH6SMBx...sample_oauth_token";
      const encrypted = service.encryptRefreshToken(token);
      const decrypted = service.decryptRefreshToken(encrypted);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(token);
      expect(encrypted.split(":").length).toBe(3); // iv:authTag:data format
      expect(decrypted).toBe(token);
    });

    test("should produce different encrypted values for same token", () => {
      const token = "ya29.a0AfH6SMBx...sample_oauth_token";
      const encrypted1 = service.encryptRefreshToken(token);
      const encrypted2 = service.encryptRefreshToken(token);

      expect(encrypted1).not.toBe(encrypted2); // Different IVs
      expect(service.decryptRefreshToken(encrypted1)).toBe(token);
      expect(service.decryptRefreshToken(encrypted2)).toBe(token);
    });

    test("should throw error for invalid encrypted token format", () => {
      expect(() => service.decryptRefreshToken("invalid")).toThrow();
      expect(() => service.decryptRefreshToken("a:b")).toThrow();
    });

    test("should throw error for tampered encrypted token", () => {
      const token = "ya29.a0AfH6SMBx...sample_oauth_token";
      const encrypted = service.encryptRefreshToken(token);
      const tampered = encrypted.replace(/.$/, "0"); // Change last character

      expect(() => service.decryptRefreshToken(tampered)).toThrow();
    });
  });

  describe("Token Hashing", () => {
    test("should hash a token with SHA-256", () => {
      const token = "myRefreshToken123";
      const hash = service.hashToken(token);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(token);
      expect(hash.length).toBe(64); // SHA-256 produces 64 hex characters
    });

    test("should produce consistent hashes for same token", () => {
      const token = "myRefreshToken123";
      const hash1 = service.hashToken(token);
      const hash2 = service.hashToken(token);

      expect(hash1).toBe(hash2);
    });

    test("should produce different hashes for different tokens", () => {
      const token1 = "myRefreshToken123";
      const token2 = "myRefreshToken456";
      const hash1 = service.hashToken(token1);
      const hash2 = service.hashToken(token2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("Random Token Generation", () => {
    test("should generate a random token", () => {
      const token = service.generateRandomToken();

      expect(token).toBeDefined();
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters
    });

    test("should generate unique tokens", () => {
      const token1 = service.generateRandomToken();
      const token2 = service.generateRandomToken();

      expect(token1).not.toBe(token2);
    });

    test("should generate token with custom byte length", () => {
      const token = service.generateRandomToken(16);

      expect(token.length).toBe(32); // 16 bytes = 32 hex characters
    });
  });
});
