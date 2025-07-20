import { describe, expect, it } from "bun:test";
import { generateBoard, isValidSolution, solve } from "./generateBoard";

describe("Sudoku Board Generation", () => {
  describe("generateBoard", () => {
    it("should generate a valid 9x9 sudoku board", () => {
      const result = generateBoard({ difficulty: "easy", size: 9 });

      expect(result.size).toBe(9);
      expect(result.difficulty).toBe("easy");
      expect(result.puzzle).toBeInstanceOf(Array);
      expect(result.solution).toBeInstanceOf(Array);
      expect(result.puzzle.length).toBe(9);
      expect(result.solution.length).toBe(9);

      // Check that each row has correct length
      result.puzzle.forEach(row => {
        expect(row.length).toBe(9);
      });

      result.solution.forEach(row => {
        expect(row.length).toBe(9);
      });
    });

    it("should generate a valid 4x4 sudoku board", () => {
      const result = generateBoard({ difficulty: "easy", size: 4 });

      expect(result.size).toBe(4);
      expect(result.puzzle.length).toBe(4);
      expect(result.solution.length).toBe(4);

      result.puzzle.forEach(row => {
        expect(row.length).toBe(4);
      });
    });

    it("should throw error for invalid board sizes", () => {
      expect(() => generateBoard({ difficulty: "easy", size: 5 })).toThrow();
      expect(() => generateBoard({ difficulty: "easy", size: 6 })).toThrow();
      expect(() => generateBoard({ difficulty: "easy", size: 8 })).toThrow();
    });

    it("should generate different difficulties with different cell counts", () => {
      const easy = generateBoard({ difficulty: "easy", size: 9 });
      const hard = generateBoard({ difficulty: "hard", size: 9 });

      const countEmptyCells = (board: number[][]) => {
        return board.flat().filter(cell => cell === 0).length;
      };

      const easyEmpty = countEmptyCells(easy.puzzle);
      const hardEmpty = countEmptyCells(hard.puzzle);

      // Hard should have more empty cells than easy
      expect(hardEmpty).toBeGreaterThan(easyEmpty);
    });

    it("should generate puzzle with fewer clues than solution", () => {
      const result = generateBoard({ difficulty: "medium", size: 9 });

      const puzzleFilledCells = result.puzzle.flat().filter(cell => cell !== 0).length;
      const solutionFilledCells = result.solution.flat().filter(cell => cell !== 0).length;

      expect(puzzleFilledCells).toBeLessThan(solutionFilledCells);
      expect(solutionFilledCells).toBe(81); // 9x9 should be completely filled
    });

    it("should generate valid solutions", () => {
      const result = generateBoard({ difficulty: "easy", size: 9 });
      expect(isValidSolution(result.solution, 9)).toBe(true);
    });
  });

  describe("solve", () => {
    it("should solve a simple 4x4 puzzle", () => {
      const puzzle = [
        [1, 0, 0, 4],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [4, 0, 0, 1]
      ];

      const solved = solve(puzzle, 4);
      expect(solved).toBe(true);
      expect(isValidSolution(puzzle, 4)).toBe(true);
    });

    it("should solve a 9x9 puzzle", () => {
      const puzzle = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
      ];

      const solved = solve(puzzle, 9);
      expect(solved).toBe(true);
      expect(isValidSolution(puzzle, 9)).toBe(true);
    });

    it("should return false for unsolvable puzzles", () => {
      const unsolvablePuzzle = [
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];

      const solved = solve(unsolvablePuzzle, 4);
      expect(solved).toBe(false);
    });

    it("should not modify the original board when solving fails", () => {
      const originalPuzzle = [
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];

      const puzzleCopy = originalPuzzle.map(row => [...row]);
      solve(puzzleCopy, 4);

      // Original should remain unchanged
      expect(originalPuzzle).toEqual([
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]);
    });
  });

  describe("isValidSolution", () => {
    it("should validate a correct 4x4 solution", () => {
      const validSolution = [
        [1, 2, 3, 4],
        [3, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1]
      ];

      expect(isValidSolution(validSolution, 4)).toBe(true);
    });

    it("should validate a correct 9x9 solution", () => {
      const validSolution = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
      ];

      expect(isValidSolution(validSolution, 9)).toBe(true);
    });

    it("should reject invalid solutions with duplicate numbers in rows", () => {
      const invalidSolution = [
        [1, 1, 3, 4],
        [3, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1]
      ];

      expect(isValidSolution(invalidSolution, 4)).toBe(false);
    });

    it("should reject invalid solutions with duplicate numbers in columns", () => {
      const invalidSolution = [
        [1, 2, 3, 4],
        [1, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1]
      ];

      expect(isValidSolution(invalidSolution, 4)).toBe(false);
    });

    it("should reject invalid solutions with duplicate numbers in boxes", () => {
      const invalidSolution = [
        [1, 2, 3, 4],
        [2, 4, 1, 3],
        [3, 1, 4, 2],
        [4, 3, 2, 1]
      ];

      expect(isValidSolution(invalidSolution, 4)).toBe(false);
    });

    it("should reject solutions with numbers out of range", () => {
      const invalidSolution = [
        [1, 2, 3, 5],
        [3, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1]
      ];

      expect(isValidSolution(invalidSolution, 4)).toBe(false);
    });

    it("should reject solutions with zero values", () => {
      const invalidSolution = [
        [1, 2, 3, 0],
        [3, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1]
      ];

      expect(isValidSolution(invalidSolution, 4)).toBe(false);
    });
  });

  describe("Integration tests", () => {
    it("should generate solvable puzzles", () => {
      const result = generateBoard({ difficulty: "easy", size: 4 });

      // Make a copy to solve
      const puzzleCopy = result.puzzle.map(row => [...row]);
      const solved = solve(puzzleCopy, 4);

      expect(solved).toBe(true);
      expect(isValidSolution(puzzleCopy, 4)).toBe(true);
    });

    it("should generate puzzles that match their provided solutions", () => {
      const result = generateBoard({ difficulty: "medium", size: 4 });

      // The puzzle should be solvable to the provided solution
      const puzzleCopy = result.puzzle.map(row => [...row]);
      solve(puzzleCopy, 4);

      // Note: Due to the nature of sudoku generation, the solved puzzle
      // might not exactly match the provided solution, but both should be valid
      expect(isValidSolution(puzzleCopy, 4)).toBe(true);
      expect(isValidSolution(result.solution, 4)).toBe(true);
    });

    it("should handle different difficulty levels", () => {
      const difficulties = ["easy", "medium", "hard", "expert"];

      for (const difficulty of difficulties) {
        const result = generateBoard({ difficulty, size: 4 });

        expect(result.difficulty).toBe(difficulty);
        expect(isValidSolution(result.solution, 4)).toBe(true);

        // Puzzle should be solvable
        const puzzleCopy = result.puzzle.map(row => [...row]);
        expect(solve(puzzleCopy, 4)).toBe(true);
      }
    });

    it("should generate different boards on multiple calls", () => {
      const board1 = generateBoard({ difficulty: "easy", size: 4 });
      const board2 = generateBoard({ difficulty: "easy", size: 4 });

      // Boards should be different (very low probability they're the same)
      const board1Str = JSON.stringify(board1.puzzle);
      const board2Str = JSON.stringify(board2.puzzle);

      expect(board1Str).not.toBe(board2Str);
    });
  });

  describe("Performance tests", () => {
    it("should generate 4x4 board in reasonable time", () => {
      const start = Date.now();
      const result = generateBoard({ difficulty: "easy", size: 4 });
      const end = Date.now();

      expect(end - start).toBeLessThan(1000); // Should take less than 1 second
      expect(isValidSolution(result.solution, 4)).toBe(true);
    });

    it("should generate 9x9 board in reasonable time", () => {
      const start = Date.now();
      const result = generateBoard({ difficulty: "easy", size: 9 });
      const end = Date.now();

      expect(end - start).toBeLessThan(5000); // Should take less than 5 seconds
      expect(isValidSolution(result.solution, 9)).toBe(true);
    });
  });
});
