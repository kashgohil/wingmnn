# Sudoku Module

A comprehensive sudoku puzzle generator and solver for the Wingmnn backend.

## Features

- **Puzzle Generation**: Generate valid sudoku puzzles with customizable difficulty levels
- **Puzzle Solving**: Solve existing sudoku puzzles using backtracking algorithm
- **Solution Validation**: Verify if a completed sudoku board is correct
- **Multiple Board Sizes**: Support for 4x4, 9x9, 16x16, and other perfect square sizes
- **Difficulty Levels**: Easy, Medium, Hard, and Expert difficulty settings
- **Utility Functions**: Helper functions for board manipulation and analysis

## API Endpoints

### Generate Puzzle
```
GET /sudoku/generate?difficulty=easy&size=9
```

**Query Parameters:**
- `difficulty` (optional): `easy`, `medium`, `hard`, `expert` (default: `easy`)
- `size` (optional): Board size - must be perfect square (default: `9`)

**Response:**
```json
{
  "success": true,
  "data": {
    "puzzle": [[1, 2, 0, 0], [0, 0, 0, 2], [0, 0, 0, 0], [0, 0, 2, 1]],
    "solution": [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]],
    "difficulty": "easy",
    "size": 4
  }
}
```

### Solve Puzzle
```
POST /sudoku/solve
```

**Request Body:**
```json
{
  "board": [[1, 2, 0, 0], [0, 0, 0, 2], [0, 0, 0, 0], [0, 0, 2, 1]]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "solution": [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]],
    "solvable": true
  }
}
```

### Validate Solution
```
POST /sudoku/validate
```

**Request Body:**
```json
{
  "board": [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true
  }
}
```

## Core Functions

### `generateBoard(params)`
Generates a complete sudoku puzzle with solution.

**Parameters:**
- `difficulty`: String - difficulty level
- `size`: Number - board size (must be perfect square)

**Returns:** `SudokuBoard` object containing puzzle, solution, difficulty, and size.

### `solve(board, size)`
Solves a sudoku puzzle using backtracking algorithm.

**Parameters:**
- `board`: 2D array representing the puzzle
- `size`: Number - board size

**Returns:** Boolean indicating if puzzle was solved successfully.

### `isValidSolution(board, size)`
Validates if a completed sudoku board follows all rules.

**Parameters:**
- `board`: 2D array representing the completed puzzle
- `size`: Number - board size

**Returns:** Boolean indicating if the solution is valid.

## Utility Functions

### Board Analysis
- `getEmptyCellsCount(board)`: Count empty cells (0 values)
- `getFilledCellsCount(board)`: Count filled cells (non-zero values)
- `getEmptyPositions(board)`: Get array of empty cell coordinates
- `getProgressPercentage(board, size)`: Calculate completion percentage

### Move Validation
- `isValidMove(board, row, col, num, size)`: Check if placing a number is valid
- `getPossibleNumbers(board, row, col, size)`: Get all valid numbers for a position

### Difficulty Analysis
- `calculateDifficultyScore(board, size)`: Calculate difficulty score (0-1)
- `getDifficultyLevel(score)`: Convert score to difficulty level string

### Board Operations
- `cloneBoard(board)`: Create deep copy of board
- `areBoardsEqual(board1, board2)`: Compare two boards for equality
- `printBoard(board, size)`: Print formatted board to console

### Validation
- `isValidBoardSize(size)`: Check if size is valid (perfect square >= 4)
- `getBoxCoordinates(row, col, size)`: Get box boundaries for position

## Board Format

Sudoku boards are represented as 2D arrays where:
- `0` represents an empty cell
- Numbers `1` to `size` represent filled cells
- Each row is an array of numbers
- The board is an array of rows

**Example 4x4 board:**
```javascript
[
  [1, 2, 0, 0],
  [0, 0, 0, 2],
  [0, 0, 0, 0],
  [0, 0, 2, 1]
]
```

## Difficulty Levels

- **Easy**: ~40% of cells removed
- **Medium**: ~50% of cells removed  
- **Hard**: ~60% of cells removed
- **Expert**: ~70% of cells removed

Difficulty also considers constraint complexity (number of possible moves per empty cell).

## Supported Board Sizes

- 4x4 (2x2 boxes)
- 9x9 (3x3 boxes) - Classic sudoku
- 16x16 (4x4 boxes)
- 25x25 (5x5 boxes)
- Any perfect square >= 4

## Algorithm Details

### Generation Algorithm
1. Create empty board
2. Fill board using backtracking with randomization
3. Remove cells based on difficulty while maintaining unique solution
4. Verify puzzle has exactly one solution

### Solving Algorithm
- Backtracking algorithm with constraint propagation
- Tries numbers 1 to size for each empty cell
- Validates against row, column, and box constraints
- Backtracks when no valid moves available

### Validation Rules
- Each row contains numbers 1 to size exactly once
- Each column contains numbers 1 to size exactly once  
- Each box contains numbers 1 to size exactly once
- No duplicate numbers in any constraint group

## Performance

- 4x4 boards: Generate in <1 second
- 9x9 boards: Generate in <5 seconds
- Solving is typically faster than generation
- Memory usage scales with board size squared

## Testing

Run the test suite:
```bash
bun test src/modules/games/sudoku/utils/
```

The module includes comprehensive tests for:
- Board generation across different sizes and difficulties
- Puzzle solving with various scenarios
- Solution validation with edge cases
- Utility functions with boundary conditions
- Performance benchmarks
- Error handling

## Error Handling

The module handles various error conditions:
- Invalid board sizes (non-perfect squares)
- Malformed board data
- Unsolvable puzzles
- Invalid API parameters

All API endpoints return structured error responses with appropriate HTTP status codes.