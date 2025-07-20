/**
 * Utility functions for sudoku operations
 */

export {
  generateBoard,
  isValidSolution,
  solve,
  type SudokuBoard,
} from "./generateBoard";

/**
 * Print a sudoku board to console for debugging
 */
export function printBoard(board: number[][], size: number = 9): void {
  const boxSize = Math.sqrt(size);

  for (let row = 0; row < size; row++) {
    let line = "";

    for (let col = 0; col < size; col++) {
      const value = board[row][col] === 0 ? "." : board[row][col].toString();
      line += value;

      // Add vertical separator for boxes
      if ((col + 1) % boxSize === 0 && col < size - 1) {
        line += " | ";
      } else if (col < size - 1) {
        line += " ";
      }
    }

    console.log(line);

    // Add horizontal separator for boxes
    if ((row + 1) % boxSize === 0 && row < size - 1) {
      const separator = "-".repeat(line.length);
      console.log(separator);
    }
  }
}

/**
 * Get empty cells count in a sudoku board
 */
export function getEmptyCellsCount(board: number[][]): number {
  return board.flat().filter((cell) => cell === 0).length;
}

/**
 * Get filled cells count in a sudoku board
 */
export function getFilledCellsCount(board: number[][]): number {
  return board.flat().filter((cell) => cell !== 0).length;
}

/**
 * Check if a move is valid at a specific position
 */
export function isValidMove(
  board: number[][],
  row: number,
  col: number,
  num: number,
  size: number = 9,
): boolean {
  // Check if position is already filled
  if (board[row][col] !== 0) {
    return false;
  }

  const boxSize = Math.sqrt(size);

  // Check row
  for (let j = 0; j < size; j++) {
    if (board[row][j] === num) {
      return false;
    }
  }

  // Check column
  for (let i = 0; i < size; i++) {
    if (board[i][col] === num) {
      return false;
    }
  }

  // Check box
  const boxRow = Math.floor(row / boxSize) * boxSize;
  const boxCol = Math.floor(col / boxSize) * boxSize;

  for (let i = boxRow; i < boxRow + boxSize; i++) {
    for (let j = boxCol; j < boxCol + boxSize; j++) {
      if (board[i][j] === num) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Get all possible numbers for a specific position
 */
export function getPossibleNumbers(
  board: number[][],
  row: number,
  col: number,
  size: number = 9,
): number[] {
  if (board[row][col] !== 0) {
    return [];
  }

  const possible: number[] = [];

  for (let num = 1; num <= size; num++) {
    if (isValidMove(board, row, col, num, size)) {
      possible.push(num);
    }
  }

  return possible;
}

/**
 * Get all empty positions in the board
 */
export function getEmptyPositions(board: number[][]): Array<[number, number]> {
  const positions: Array<[number, number]> = [];

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === 0) {
        positions.push([row, col]);
      }
    }
  }

  return positions;
}

/**
 * Calculate the difficulty score of a sudoku puzzle
 * Returns a number between 0 and 1 (higher = more difficult)
 */
export function calculateDifficultyScore(
  board: number[][],
  size: number = 9,
): number {
  const totalCells = size * size;
  const emptyCells = getEmptyCellsCount(board);

  // If board is complete, return 0
  if (emptyCells === 0) {
    return 0;
  }

  const emptyRatio = emptyCells / totalCells;

  // Get positions with fewest possibilities (indicates constraint difficulty)
  const emptyPositions = getEmptyPositions(board);
  let totalPossibilities = 0;
  let minPossibilities = size;

  for (const [row, col] of emptyPositions) {
    const possibilities = getPossibleNumbers(board, row, col, size);
    totalPossibilities += possibilities.length;
    minPossibilities = Math.min(minPossibilities, possibilities.length);
  }

  const avgPossibilities =
    emptyPositions.length > 0 ? totalPossibilities / emptyPositions.length : 0;

  // Combine empty ratio and constraint difficulty
  // More empty cells = harder
  // Fewer possibilities per cell = harder
  const constraintScore = 1 - avgPossibilities / size;

  return Math.min(1, emptyRatio * 0.6 + constraintScore * 0.4);
}

/**
 * Get difficulty level based on score
 */
export function getDifficultyLevel(score: number): string {
  if (score < 0.3) return "easy";
  if (score < 0.5) return "medium";
  if (score < 0.7) return "hard";
  return "expert";
}

/**
 * Create a copy of a sudoku board
 */
export function cloneBoard(board: number[][]): number[][] {
  return board.map((row) => [...row]);
}

/**
 * Check if two boards are identical
 */
export function areBoardsEqual(
  board1: number[][],
  board2: number[][],
): boolean {
  if (board1.length !== board2.length) {
    return false;
  }

  for (let row = 0; row < board1.length; row++) {
    if (board1[row].length !== board2[row].length) {
      return false;
    }

    for (let col = 0; col < board1[row].length; col++) {
      if (board1[row][col] !== board2[row][col]) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Get progress percentage of a sudoku puzzle
 */
export function getProgressPercentage(
  board: number[][],
  size: number = 9,
): number {
  const totalCells = size * size;
  const filledCells = getFilledCellsCount(board);
  return Math.round((filledCells / totalCells) * 100);
}

/**
 * Validate board dimensions
 */
export function isValidBoardSize(size: number): boolean {
  const boxSize = Math.sqrt(size);
  return boxSize === Math.floor(boxSize) && size >= 4;
}

/**
 * Get box coordinates for a given position
 */
export function getBoxCoordinates(
  row: number,
  col: number,
  size: number,
): {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
} {
  const boxSize = Math.sqrt(size);
  const startRow = Math.floor(row / boxSize) * boxSize;
  const startCol = Math.floor(col / boxSize) * boxSize;

  return {
    startRow,
    endRow: startRow + boxSize,
    startCol,
    endCol: startCol + boxSize,
  };
}
