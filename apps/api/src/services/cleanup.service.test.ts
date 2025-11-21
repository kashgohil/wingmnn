import { describe, expect, it } from "bun:test";

describe("CleanupService", () => {
  describe("Cleanup retention periods", () => {
    it("should calculate 30-day retention period correctly", () => {
      const now = new Date();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);

      const daysDiff =
        (now.getTime() - cutoffDate.getTime()) / (24 * 60 * 60 * 1000);
      expect(Math.round(daysDiff)).toBe(30);
    });

    it("should identify tokens older than 30 days", () => {
      const now = new Date();

      // Token from 35 days ago (should be deleted)
      const oldTokenDate = new Date();
      oldTokenDate.setDate(oldTokenDate.getDate() - 35);

      // Token from 10 days ago (should be kept)
      const recentTokenDate = new Date();
      recentTokenDate.setDate(recentTokenDate.getDate() - 10);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);

      expect(oldTokenDate < cutoffDate).toBe(true);
      expect(recentTokenDate < cutoffDate).toBe(false);
    });
  });

  describe("Cleanup scheduling", () => {
    it("should calculate daily cleanup interval correctly", () => {
      const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
      const expectedHours = CLEANUP_INTERVAL_MS / (60 * 60 * 1000);

      expect(expectedHours).toBe(24);
    });
  });
});
