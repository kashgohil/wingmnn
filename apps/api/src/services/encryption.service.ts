import bcrypt from "bcrypt";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";
import { config } from "../config";

/**
 * Encryption service for handling password hashing, OAuth token encryption,
 * and token hashing utilities
 */
export class EncryptionService {
  private readonly BCRYPT_WORK_FACTOR = 12;
  private readonly ALGORITHM = "aes-256-gcm";
  private readonly IV_LENGTH = 16; // 128 bits for GCM
  private readonly AUTH_TAG_LENGTH = 16; // 128 bits for GCM
  private readonly encryptionKey: Buffer;

  constructor() {
    // Derive a 32-byte key from the ENCRYPTION_KEY environment variable
    this.encryptionKey = this.deriveKey(config.ENCRYPTION_KEY);
  }

  /**
   * Derive a 32-byte encryption key from the provided key string
   */
  private deriveKey(key: string): Buffer {
    return createHash("sha256").update(key).digest();
  }

  /**
   * Hash a password using bcrypt with work factor 12
   * @param password - Plain text password to hash
   * @returns Promise resolving to the hashed password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_WORK_FACTOR);
  }

  /**
   * Verify a password against a bcrypt hash
   * @param password - Plain text password to verify
   * @param hash - Bcrypt hash to compare against
   * @returns Promise resolving to true if password matches, false otherwise
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Encrypt an OAuth refresh token using AES-256-GCM
   * @param token - Plain text token to encrypt
   * @returns Encrypted token in format: iv:authTag:encryptedData (hex encoded)
   */
  encryptRefreshToken(token: string): string {
    // Generate a random initialization vector
    const iv = randomBytes(this.IV_LENGTH);

    // Create cipher
    const cipher = createCipheriv(this.ALGORITHM, this.encryptionKey, iv);

    // Encrypt the token
    let encrypted = cipher.update(token, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Get the authentication tag
    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:encryptedData (all hex encoded)
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  }

  /**
   * Decrypt an OAuth refresh token encrypted with AES-256-GCM
   * @param encryptedToken - Encrypted token in format: iv:authTag:encryptedData
   * @returns Decrypted plain text token
   * @throws Error if decryption fails or format is invalid
   */
  decryptRefreshToken(encryptedToken: string): string {
    try {
      // Parse the encrypted token format
      const parts = encryptedToken.split(":");
      if (parts.length !== 3) {
        throw new Error("Invalid encrypted token format");
      }

      const [ivHex, authTagHex, encryptedData] = parts;

      // Convert hex strings back to buffers
      const iv = Buffer.from(ivHex, "hex");
      const authTag = Buffer.from(authTagHex, "hex");

      // Validate lengths
      if (iv.length !== this.IV_LENGTH) {
        throw new Error("Invalid IV length");
      }
      if (authTag.length !== this.AUTH_TAG_LENGTH) {
        throw new Error("Invalid auth tag length");
      }

      // Create decipher
      const decipher = createDecipheriv(this.ALGORITHM, this.encryptionKey, iv);
      decipher.setAuthTag(authTag);

      // Decrypt the token
      let decrypted = decipher.update(encryptedData, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      throw new Error(
        `Failed to decrypt token: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Hash a token using SHA-256
   * Used for storing refresh tokens securely in the database
   * @param token - Plain text token to hash
   * @returns Hex-encoded SHA-256 hash of the token
   */
  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  /**
   * Generate a cryptographically secure random token
   * @param bytes - Number of random bytes to generate (default: 32 for 256 bits)
   * @returns Hex-encoded random token
   */
  generateRandomToken(bytes: number = 32): string {
    return randomBytes(bytes).toString("hex");
  }
}

// Export a singleton instance
export const encryptionService = new EncryptionService();
