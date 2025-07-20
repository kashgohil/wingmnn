import { describe, expect, it } from "bun:test";
import {
  areBoardsEqual,
  calculateDifficultyScore,
  cloneBoard,
  getBoxCoordinates,
  getDifficultyLevel,
  getEmptyCellsCount,
  getEmptyPositions,
  getFilledCellsCount,
  getPossibleNumbers,
  getProgressPercentage,
  isValidBoardSize,
  isValidMove,
  printBoard,
} from "./index";

describe("Sudoku Utility Functions", () => {
  const sample4x4Board = [
    [1, 2, 0, 0],
    [0, 0, 0, 2],
    [0, 0, 0, 0],
    [0, 0, 2, 1],
  ];

  const sample9x9Board = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ];

  const completedBoard = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1],
  ];

  describe("getEmptyCellsCount", () => {
    it("should count empty cells correctly", () => {
      expect(getEmptyCellsCount(sample4x4Board)).toBe(11);
      expect(getEmptyCellsCount(completedBoard)).toBe(0);
    });

    it("should handle empty board", () => {
      const emptyBoard = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      expect(getEmptyCellsCount(emptyBoard)).toBe(16);
    });
  });

  describe("getFilledCellsCount", () => {
    it("should count filled cells correctly", () => {
      expect(getFilledCellsCount(sample4x4Board)).toBe(5);
      expect(getFilledCellsCount(completedBoard)).toBe(16);
    });

    it("should handle empty board", () => {
      const emptyBoard = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      expect(getFilledCellsCount(emptyBoard)).toBe(0);
    });
  });

  describe("isValidMove", () => {
    it("should validate moves correctly for 4x4 board", () => {
      expect(isValidMove(sample4x4Board, 0, 2, 3, 4)).toBe(true);
      expect(isValidMove(sample4x4Board, 0, 2, 4, 4)).toBe(true);
      expect(isValidMove(sample4x4Board, 0, 2, 1, 4)).toBe(false); // Already in row
      expect(isValidMove(sample4x4Board, 0, 2, 2, 4)).toBe(false); // Already in column
    });

    it("should reject moves on filled cells", () => {
      expect(isValidMove(sample4x4Board, 0, 0, 3, 4)).toBe(false);
      expect(isValidMove(sample4x4Board, 0, 1, 3, 4)).toBe(false);
    });

    it("should validate box constraints", () => {
      expect(isValidMove(sample4x4Board, 1, 0, 1, 4)).toBe(false); // 1 already in box
      expect(isValidMove(sample4x4Board, 1, 0, 3, 4)).toBe(true); // 3 not in box
    });
  });

  describe("getPossibleNumbers", () => {
    it("should return all possible numbers for empty cell", () => {
      const possible = getPossibleNumbers(sample4x4Board, 0, 2, 4);
      expect(possible).toContain(3);
      expect(possible).toContain(4);
      expect(possible).not.toContain(1);
      expect(possible).not.toContain(2);
    });

    it("should return empty array for filled cell", () => {
      const possible = getPossibleNumbers(sample4x4Board, 0, 0, 4);
      expect(possible).toEqual([]);
    });

    it("should handle cells with no possibilities", () => {
      const constrainedBoard = [
        [1, 2, 3, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 4],
      ];
      const possible = getPossibleNumbers(constrainedBoard, 0, 3, 4);
      expect(possible).toEqual([]);
    });
  });

  describe("getEmptyPositions", () => {
    it("should return all empty positions", () => {
      const positions = getEmptyPositions(sample4x4Board);
      expect(positions).toHaveLength(11);
      expect(positions).toContainEqual([0, 2]);
      expect(positions).toContainEqual([0, 3]);
      expect(positions).not.toContainEqual([0, 0]);
      expect(positions).not.toContainEqual([0, 1]);
    });

    it("should return empty array for completed board", () => {
      const positions = getEmptyPositions(completedBoard);
      expect(positions).toEqual([]);
    });
  });

  describe("calculateDifficultyScore", () => {
    it("should calculate difficulty score for boards", () => {
      const score = calculateDifficultyScore(sample4x4Board, 4);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it("should give higher score for boards with more empty cells", () => {
      const sparseBoard = [
        [1, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      const denseBoard = [
        [1, 2, 3, 0],
        [3, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1],
      ];

      const sparseScore = calculateDifficultyScore(sparseBoard, 4);
      const denseScore = calculateDifficultyScore(denseBoard, 4);

      expect(sparseScore).toBeGreaterThan(denseScore);
    });

    it("should return low score for completed board", () => {
      const score = calculateDifficultyScore(completedBoard, 4);
      expect(score).toBeLessThan(0.1);
    });
  });

  describe("getDifficultyLevel", () => {
    it("should return correct difficulty levels", () => {
      expect(getDifficultyLevel(0.2)).toBe("easy");
      expect(getDifficultyLevel(0.4)).toBe("medium");
      expect(getDifficultyLevel(0.6)).toBe("hard");
      expect(getDifficultyLevel(0.8)).toBe("expert");
    });

    it("should handle boundary values", () => {
      expect(getDifficultyLevel(0.3)).toBe("medium");
      expect(getDifficultyLevel(0.5)).toBe("hard");
      expect(getDifficultyLevel(0.7)).toBe("expert");
    });
  });

  describe("cloneBoard", () => {
    it("should create a deep copy of the board", () => {
      const clone = cloneBoard(sample4x4Board);
      expect(clone).toEqual(sample4x4Board);
      expect(clone).not.toBe(sample4x4Board);
      expect(clone[0]).not.toBe(sample4x4Board[0]);
    });

    it("should not affect original when clone is modified", () => {
      const original = [
        [1, 2],
        [3, 4],
      ];
      const clone = cloneBoard(original);
      clone[0][0] = 99;

      expect(original[0][0]).toBe(1);
      expect(clone[0][0]).toBe(99);
    });
  });

  describe("areBoardsEqual", () => {
    it("should return true for identical boards", () => {
      const board1 = [
        [1, 2],
        [3, 4],
      ];
      const board2 = [
        [1, 2],
        [3, 4],
      ];
      expect(areBoardsEqual(board1, board2)).toBe(true);
    });

    it("should return false for different boards", () => {
      const board1 = [
        [1, 2],
        [3, 4],
      ];
      const board2 = [
        [1, 2],
        [3, 5],
      ];
      expect(areBoardsEqual(board1, board2)).toBe(false);
    });

    it("should return false for boards with different dimensions", () => {
      const board1 = [
        [1, 2],
        [3, 4],
      ];
      const board2 = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      expect(areBoardsEqual(board1, board2)).toBe(false);
    });

    it("should return false for boards with different row lengths", () => {
      const board1 = [
        [1, 2],
        [3, 4],
      ];
      const board2 = [
        [1, 2, 3],
        [4, 5],
      ];
      expect(areBoardsEqual(board1, board2)).toBe(false);
    });
  });

  describe("getProgressPercentage", () => {
    it("should calculate progress percentage correctly", () => {
      expect(getProgressPercentage(sample4x4Board, 4)).toBe(31); // 5/16 * 100 = 31.25, rounded = 31
      expect(getProgressPercentage(completedBoard, 4)).toBe(100);
    });

    it("should handle empty board", () => {
      const emptyBoard = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      expect(getProgressPercentage(emptyBoard, 4)).toBe(0);
    });
  });

  describe("isValidBoardSize", () => {
    it("should validate valid board sizes", () => {
      expect(isValidBoardSize(4)).toBe(true);
      expect(isValidBoardSize(9)).toBe(true);
      expect(isValidBoardSize(16)).toBe(true);
      expect(isValidBoardSize(25)).toBe(true);
    });

    it("should reject invalid board sizes", () => {
      expect(isValidBoardSize(3)).toBe(false);
      expect(isValidBoardSize(5)).toBe(false);
      expect(isValidBoardSize(6)).toBe(false);
      expect(isValidBoardSize(8)).toBe(false);
      expect(isValidBoardSize(10)).toBe(false);
    });

    it("should reject sizes less than 4", () => {
      expect(isValidBoardSize(1)).toBe(false);
      expect(isValidBoardSize(2)).toBe(false);
      expect(isValidBoardSize(3)).toBe(false);
    });
  });

  describe("getBoxCoordinates", () => {
    it("should calculate box coordinates for 4x4 board", () => {
      const coords = getBoxCoordinates(0, 0, 4);
      expect(coords).toEqual({
        startRow: 0,
        endRow: 2,
        startCol: 0,
        endCol: 2,
      });
    });

    it("should calculate box coordinates for different positions", () => {
      const coords1 = getBoxCoordinates(0, 2, 4);
      expect(coords1).toEqual({
        startRow: 0,
        endRow: 2,
        startCol: 2,
        endCol: 4,
      });

      const coords2 = getBoxCoordinates(2, 0, 4);
      expect(coords2).toEqual({
        startRow: 2,
        endRow: 4,
        startCol: 0,
        endCol: 2,
      });
    });

    it("should calculate box coordinates for 9x9 board", () => {
      const coords = getBoxCoordinates(4, 4, 9);
      expect(coords).toEqual({
        startRow: 3,
        endRow: 6,
        startCol: 3,
        endCol: 6,
      });
    });
  });

  describe("printBoard", () => {
    it("should not throw when printing board", () => {
      // We can't easily test console output, but we can ensure it doesn't throw
      expect(() => printBoard(sample4x4Board, 4)).not.toThrow();
      expect(() => printBoard(sample9x9Board, 9)).not.toThrow();
    });
  });
});
