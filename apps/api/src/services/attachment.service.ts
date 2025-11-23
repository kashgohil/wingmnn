import { and, attachments, db, eq, sql, subtasks, tasks } from "@wingmnn/db";
import * as crypto from "crypto";
import * as fs from "fs/promises";
import * as path from "path";
import { projectService } from "./project.service";

/**
 * Attachment with relations
 */
export interface Attachment {
  id: string;
  relatedEntityType: "task" | "subtask";
  relatedEntityId: string;
  uploadedBy: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for uploading an attachment
 */
export interface UploadAttachmentInput {
  relatedEntityType: "task" | "subtask";
  relatedEntityId: string;
  file: File | Buffer;
  originalFilename: string;
  mimeType: string;
}

/**
 * Attachment error codes
 */
export enum AttachmentErrorCode {
  ATTACHMENT_NOT_FOUND = "ATTACHMENT_NOT_FOUND",
  TASK_NOT_FOUND = "TASK_NOT_FOUND",
  SUBTASK_NOT_FOUND = "SUBTASK_NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_MIME_TYPE = "INVALID_MIME_TYPE",
  UPLOAD_FAILED = "UPLOAD_FAILED",
  DELETE_FAILED = "DELETE_FAILED",
}

/**
 * Attachment error class
 */
export class AttachmentError extends Error {
  constructor(
    public code: AttachmentErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "AttachmentError";
  }
}

/**
 * Attachment Service
 * Handles file uploads, downloads, and deletion with local filesystem storage
 */
export class AttachmentService {
  // Maximum file size: 50MB
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024;

  // Allowed MIME types
  private readonly ALLOWED_MIME_TYPES = [
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // Text
    "text/plain",
    "text/csv",
    "text/markdown",
    // Archives
    "application/zip",
    "application/x-tar",
    "application/gzip",
    // Code
    "application/json",
    "application/xml",
    "text/html",
    "text/css",
    "text/javascript",
  ];

  // Storage base path
  private readonly STORAGE_BASE_PATH = path.join(
    process.cwd(),
    "uploads",
    "attachments"
  );

  /**
   * Validate that a task or subtask exists and user has access
   * @param entityType - Type of entity (task or subtask)
   * @param entityId - Entity ID
   * @param userId - User ID
   * @returns Project ID if valid
   */
  private async validateEntityAccess(
    entityType: "task" | "subtask",
    entityId: string,
    userId: string
  ): Promise<string> {
    if (entityType === "task") {
      const taskResult = await db
        .select({ projectId: tasks.projectId })
        .from(tasks)
        .where(and(eq(tasks.id, entityId), sql`${tasks.deletedAt} IS NULL`))
        .limit(1);

      if (taskResult.length === 0) {
        throw new AttachmentError(
          AttachmentErrorCode.TASK_NOT_FOUND,
          "Task not found",
          404
        );
      }

      const projectId = taskResult[0].projectId;
      const hasAccess = await projectService.checkAccess(projectId, userId);
      if (!hasAccess) {
        throw new AttachmentError(
          AttachmentErrorCode.FORBIDDEN,
          "You do not have access to this task",
          403
        );
      }

      return projectId;
    } else {
      // subtask
      const subtaskResult = await db
        .select({ taskId: subtasks.taskId })
        .from(subtasks)
        .where(
          and(eq(subtasks.id, entityId), sql`${subtasks.deletedAt} IS NULL`)
        )
        .limit(1);

      if (subtaskResult.length === 0) {
        throw new AttachmentError(
          AttachmentErrorCode.SUBTASK_NOT_FOUND,
          "Subtask not found",
          404
        );
      }

      const taskId = subtaskResult[0].taskId;
      const taskResult = await db
        .select({ projectId: tasks.projectId })
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

      if (taskResult.length === 0) {
        throw new AttachmentError(
          AttachmentErrorCode.TASK_NOT_FOUND,
          "Parent task not found",
          404
        );
      }

      const projectId = taskResult[0].projectId;
      const hasAccess = await projectService.checkAccess(projectId, userId);
      if (!hasAccess) {
        throw new AttachmentError(
          AttachmentErrorCode.FORBIDDEN,
          "You do not have access to this subtask",
          403
        );
      }

      return projectId;
    }
  }

  /**
   * Validate file size
   * @param fileSize - File size in bytes
   */
  private validateFileSize(fileSize: number): void {
    if (fileSize > this.MAX_FILE_SIZE) {
      throw new AttachmentError(
        AttachmentErrorCode.FILE_TOO_LARGE,
        `File size exceeds maximum allowed size of ${
          this.MAX_FILE_SIZE / 1024 / 1024
        }MB`,
        400
      );
    }
  }

  /**
   * Validate MIME type
   * @param mimeType - MIME type to validate
   */
  private validateMimeType(mimeType: string): void {
    if (!this.ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new AttachmentError(
        AttachmentErrorCode.INVALID_MIME_TYPE,
        `MIME type ${mimeType} is not allowed`,
        400
      );
    }
  }

  /**
   * Generate storage path for a file
   * @param filename - Generated filename
   * @returns Storage path
   */
  private generateStoragePath(filename: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return path.join(String(year), month, day, filename);
  }

  /**
   * Ensure directory exists
   * @param dirPath - Directory path
   */
  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new AttachmentError(
        AttachmentErrorCode.UPLOAD_FAILED,
        "Failed to create storage directory",
        500
      );
    }
  }

  /**
   * Upload an attachment
   * @param data - Upload data
   * @param userId - User ID uploading the file
   * @returns Created attachment
   */
  async uploadAttachment(
    data: UploadAttachmentInput,
    userId: string
  ): Promise<Attachment> {
    // Validate entity access
    await this.validateEntityAccess(
      data.relatedEntityType,
      data.relatedEntityId,
      userId
    );

    // Get file buffer
    let fileBuffer: Buffer;
    let fileSize: number;

    if (Buffer.isBuffer(data.file)) {
      fileBuffer = data.file;
      fileSize = fileBuffer.length;
    } else {
      // File object
      fileBuffer = Buffer.from(await data.file.arrayBuffer());
      fileSize = fileBuffer.length;
    }

    // Validate file size
    this.validateFileSize(fileSize);

    // Validate MIME type
    this.validateMimeType(data.mimeType);

    // Generate unique filename
    const ext = path.extname(data.originalFilename);
    const uniqueFilename = `${crypto.randomUUID()}${ext}`;

    // Generate storage path
    const storagePath = this.generateStoragePath(uniqueFilename);
    const fullPath = path.join(this.STORAGE_BASE_PATH, storagePath);

    // Ensure directory exists
    await this.ensureDirectory(path.dirname(fullPath));

    // Write file to disk
    try {
      await fs.writeFile(fullPath, fileBuffer);
    } catch (error) {
      throw new AttachmentError(
        AttachmentErrorCode.UPLOAD_FAILED,
        "Failed to write file to storage",
        500
      );
    }

    // Store metadata in database
    const result = await db
      .insert(attachments)
      .values({
        id: crypto.randomUUID(),
        relatedEntityType: data.relatedEntityType,
        relatedEntityId: data.relatedEntityId,
        uploadedBy: userId,
        filename: uniqueFilename,
        originalFilename: data.originalFilename,
        mimeType: data.mimeType,
        fileSize,
        storagePath,
      })
      .returning();

    return result[0];
  }

  /**
   * Generate a secure, time-limited URL for file access
   * @param attachmentId - Attachment ID
   * @param userId - User ID requesting access
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Secure URL with token
   */
  async getAttachmentUrl(
    attachmentId: string,
    userId: string,
    expiresIn: number = 3600
  ): Promise<string> {
    // Get attachment
    const attachmentResult = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, attachmentId))
      .limit(1);

    if (attachmentResult.length === 0) {
      throw new AttachmentError(
        AttachmentErrorCode.ATTACHMENT_NOT_FOUND,
        "Attachment not found",
        404
      );
    }

    const attachment = attachmentResult[0];

    // Validate access
    await this.validateEntityAccess(
      attachment.relatedEntityType,
      attachment.relatedEntityId,
      userId
    );

    // Generate secure token
    const expiresAt = Date.now() + expiresIn * 1000;
    const payload = `${attachmentId}:${expiresAt}`;
    const signature = crypto
      .createHmac("sha256", process.env.JWT_SECRET || "secret")
      .update(payload)
      .digest("hex");

    const token = Buffer.from(`${payload}:${signature}`).toString("base64url");

    // Return URL with token
    return `/api/attachments/${attachmentId}/download?token=${token}`;
  }

  /**
   * Verify a secure token and return attachment ID if valid
   * @param token - Secure token
   * @returns Attachment ID if valid, null otherwise
   */
  async verifyToken(token: string): Promise<string | null> {
    try {
      const decoded = Buffer.from(token, "base64url").toString();
      const [attachmentId, expiresAtStr, signature] = decoded.split(":");

      // Check expiration
      const expiresAt = parseInt(expiresAtStr, 10);
      if (Date.now() > expiresAt) {
        return null;
      }

      // Verify signature
      const payload = `${attachmentId}:${expiresAtStr}`;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.JWT_SECRET || "secret")
        .update(payload)
        .digest("hex");

      if (signature !== expectedSignature) {
        return null;
      }

      return attachmentId;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get attachment file path
   * @param attachmentId - Attachment ID
   * @returns Full file path
   */
  async getAttachmentFilePath(attachmentId: string): Promise<{
    filePath: string;
    attachment: Attachment;
  }> {
    const attachmentResult = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, attachmentId))
      .limit(1);

    if (attachmentResult.length === 0) {
      throw new AttachmentError(
        AttachmentErrorCode.ATTACHMENT_NOT_FOUND,
        "Attachment not found",
        404
      );
    }

    const attachment = attachmentResult[0];
    const filePath = path.join(this.STORAGE_BASE_PATH, attachment.storagePath);

    return { filePath, attachment };
  }

  /**
   * Delete an attachment
   * @param attachmentId - Attachment ID
   * @param userId - User ID requesting deletion
   */
  async deleteAttachment(attachmentId: string, userId: string): Promise<void> {
    // Get attachment
    const attachmentResult = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, attachmentId))
      .limit(1);

    if (attachmentResult.length === 0) {
      throw new AttachmentError(
        AttachmentErrorCode.ATTACHMENT_NOT_FOUND,
        "Attachment not found",
        404
      );
    }

    const attachment = attachmentResult[0];

    // Validate access
    await this.validateEntityAccess(
      attachment.relatedEntityType,
      attachment.relatedEntityId,
      userId
    );

    // Delete file from storage
    const filePath = path.join(this.STORAGE_BASE_PATH, attachment.storagePath);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Log error but continue with database deletion
      console.error(`Failed to delete file: ${filePath}`, error);
    }

    // Delete from database
    await db.delete(attachments).where(eq(attachments.id, attachmentId));
  }

  /**
   * List attachments for a task or subtask
   * @param relatedEntityType - Type of entity (task or subtask)
   * @param relatedEntityId - Entity ID
   * @param userId - User ID requesting the list
   * @returns List of attachments
   */
  async listAttachments(
    relatedEntityType: "task" | "subtask",
    relatedEntityId: string,
    userId: string
  ): Promise<Attachment[]> {
    // Validate access
    await this.validateEntityAccess(relatedEntityType, relatedEntityId, userId);

    // Get attachments
    const result = await db
      .select()
      .from(attachments)
      .where(
        and(
          eq(attachments.relatedEntityType, relatedEntityType),
          eq(attachments.relatedEntityId, relatedEntityId)
        )
      )
      .orderBy(sql`${attachments.createdAt} DESC`);

    return result;
  }

  /**
   * Get an attachment by ID
   * @param attachmentId - Attachment ID
   * @param userId - User ID requesting the attachment
   * @returns Attachment or null
   */
  async getAttachment(
    attachmentId: string,
    userId: string
  ): Promise<Attachment | null> {
    const attachmentResult = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, attachmentId))
      .limit(1);

    if (attachmentResult.length === 0) {
      return null;
    }

    const attachment = attachmentResult[0];

    // Validate access
    try {
      await this.validateEntityAccess(
        attachment.relatedEntityType,
        attachment.relatedEntityId,
        userId
      );
    } catch (error) {
      return null;
    }

    return attachment;
  }
}

// Export singleton instance
export const attachmentService = new AttachmentService();
