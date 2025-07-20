export interface SudokuBoard {
  puzzle: number[][];
  solution: number[][];
  difficulty: string;
  size: number;
}

export function generateBoard(params: {
  difficulty: string;
  size: number;
}): SudokuBoard {
  const { difficulty, size } = params;

  // Validate size (must be a perfect square)
  const boxSize = Math.sqrt(size);
  if (boxSize !== Math.floor(boxSize)) {
    throw new Error("Board size must be a perfect square (4, 9, 16, 25, etc.)");
  }

  const solution = generateCompleteBoard(size);
  const puzzle = createPuzzle(solution, difficulty, size);

  return {
    puzzle,
    solution,
    difficulty,
    size,
  };
}

function generateCompleteBoard(size: number): number[][] {
  const board = createEmptyBoard(size);

  // Fill the board using backtracking with randomization
  fillBoard(board, 0, 0, size);

  return board;
}

function createEmptyBoard(size: number): number[][] {
  const board: number[][] = [];
  for (let row = 0; row < size; row++) {
    board[row] = [];
    for (let col = 0; col < size; col++) {
      board[row][col] = 0;
    }
  }
  return board;
}

function fillBoard(
  board: number[][],
  row: number,
  col: number,
  size: number,
): boolean {
  // If we've filled all rows, we're done
  if (row === size) {
    return true;
  }

  // Move to next row if we've filled this row
  if (col === size) {
    return fillBoard(board, row + 1, 0, size);
  }

  // Try numbers 1 to size in random order
  const numbers = Array.from({ length: size }, (_, i) => i + 1);
  shuffle(numbers);

  for (const num of numbers) {
    if (isValid(board, row, col, num, size)) {
      board[row][col] = num;

      if (fillBoard(board, row, col + 1, size)) {
        return true;
      }

      board[row][col] = 0;
    }
  }

  return false;
}

function isValid(
  board: number[][],
  row: number,
  col: number,
  num: number,
  size: number,
): boolean {
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

// Fisher Yates algorithm for inplace shuffle
function shuffle<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function createPuzzle(
  solution: number[][],
  difficulty: string,
  size: number,
): number[][] {
  const puzzle = solution.map((row) => [...row]);

  const cellsToRemove = getCellsToRemove(difficulty, size);

  const positions: Array<[number, number]> = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      positions.push([row, col]);
    }
  }

  shuffle(positions);

  let removed = 0;
  for (const [row, col] of positions) {
    if (removed >= cellsToRemove) break;

    const originalValue = puzzle[row][col];
    puzzle[row][col] = 0;

    if (hasUniqueSolution(puzzle, size)) {
      removed++;
    } else {
      puzzle[row][col] = originalValue;
    }
  }

  return puzzle;
}

function getCellsToRemove(difficulty: string, size: number): number {
  const totalCells = size * size;

  switch (difficulty.toLowerCase()) {
    case "medium":
      return Math.floor(totalCells * 0.5); // 50% empty cells
    case "hard":
      return Math.floor(totalCells * 0.6); // 60% empty cells
    case "expert":
      return Math.floor(totalCells * 0.7); // 70% empty cells
    case "easy":
    default:
      return Math.floor(totalCells * 0.4); // 40% empty cells - default to easy
  }
}

function hasUniqueSolution(puzzle: number[][], size: number): boolean {
  const board = puzzle.map((row) => [...row]);
  const solutions: number[][][] = [];

  // Find all solutions (limit to 2 to check uniqueness)
  findAllSolutions(board, 0, 0, size, solutions, 2);

  return solutions.length === 1;
}

function findAllSolutions(
  board: number[][],
  row: number,
  col: number,
  size: number,
  solutions: number[][][],
  maxSolutions: number,
): void {
  if (solutions.length >= maxSolutions) return;

  if (row === size) {
    solutions.push(board.map((row) => [...row]));
    return;
  }

  if (col === size) {
    findAllSolutions(board, row + 1, 0, size, solutions, maxSolutions);
    return;
  }

  if (board[row][col] !== 0) {
    findAllSolutions(board, row, col + 1, size, solutions, maxSolutions);
    return;
  }

  for (let num = 1; num <= size; num++) {
    if (isValid(board, row, col, num, size)) {
      board[row][col] = num;
      findAllSolutions(board, row, col + 1, size, solutions, maxSolutions);
      board[row][col] = 0;
    }
  }
}

export function solve(board: number[][], size: number = 9): boolean {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= size; num++) {
          if (isValid(board, row, col, num, size)) {
            board[row][col] = num;

            if (solve(board, size)) {
              return true;
            }

            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export function isValidSolution(board: number[][], size: number = 9): boolean {
  const boxSize = Math.sqrt(size);

  // Check each row
  for (let row = 0; row < size; row++) {
    const seen = new Set<number>();
    for (let col = 0; col < size; col++) {
      const num = board[row][col];
      if (num < 1 || num > size || seen.has(num)) {
        return false;
      }
      seen.add(num);
    }
  }

  // Check each column
  for (let col = 0; col < size; col++) {
    const seen = new Set<number>();
    for (let row = 0; row < size; row++) {
      const num = board[row][col];
      if (seen.has(num)) {
        return false;
      }
      seen.add(num);
    }
  }

  // Check each box
  for (let boxRow = 0; boxRow < size; boxRow += boxSize) {
    for (let boxCol = 0; boxCol < size; boxCol += boxSize) {
      const seen = new Set<number>();
      for (let row = boxRow; row < boxRow + boxSize; row++) {
        for (let col = boxCol; col < boxCol + boxSize; col++) {
          const num = board[row][col];
          if (seen.has(num)) {
            return false;
          }
          seen.add(num);
        }
      }
    }
  }

  return true;
}
