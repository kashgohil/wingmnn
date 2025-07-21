import { AuthenticateEnv } from "@types";
import { DifficultyEnum, eq, Sudoku, sudokuTable } from "@wingmnn/db";
import {
  CreateSudokuPayload,
  ErrorWrapper,
  ResponseWrapper,
  SuccessWrapper,
} from "@wingmnn/types";
import { tryCatchAsync } from "@wingmnn/utils";
import { Hono } from "hono";
import { generateBoard } from "./utils/generateBoard";
import { sudokuQuery } from "./utils/query";

export const sudoku = new Hono<AuthenticateEnv>().basePath("/sudoku");

sudoku.get("/:id", async (c) => {
  const id = c.req.param("id");

  const { result: game, error } = await tryCatchAsync(
    sudokuQuery.get("id", id),
  );

  if (error || !game) {
    console.log(`[SUDOKU] No game found for id: ${id}`, error?.message);
    return c.json<ErrorWrapper>(
      {
        code: 404,
        message: error?.message || "Game not found",
      },
      404,
    );
  }

  return c.json<ResponseWrapper<Sudoku>>({
    count: 1,
    data: game,
  });
});

sudoku.post("/", async (c) => {
  const userId = c.var.user.id;
  const { difficulty, size } = await c.req.json<CreateSudokuPayload>();

  const difficultyLevel = difficulty || DifficultyEnum.enumValues[0];
  const boardSize = size || 9;

  const { puzzle, solution } = generateBoard({
    difficulty: difficultyLevel,
    size: boardSize,
  });

  const { result: game, error } = await tryCatchAsync(
    sudokuQuery.insert
      .values({
        puzzle,
        solution,
        difficulty: difficultyLevel as any,
        size: boardSize,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning(),
  );

  if (error) {
    console.log(`[SUDOKU] Failed to create game`, error?.message);
    return c.json<ErrorWrapper>(
      {
        code: 500,
        message:
          error instanceof Error ? error.message : "Failed to create game",
      },
      500,
    );
  }

  return c.json<ResponseWrapper<Sudoku>>({
    count: 1,
    data: game[0],
  });
});

sudoku.patch("/:id", async (c) => {
  const userId = c.var.user.id;
  const id = c.req.param("id");

  const { result, error: getError } = await tryCatchAsync(
    sudokuQuery.get("id", id),
  );

  if (getError || !result) {
    console.log(`[SUDOKU] Failed to update game`, getError?.message);
    return c.json<ErrorWrapper>(
      {
        code: 500,
        message: "Failed to update game",
      },
      500,
    );
  }

  const { attempts: previousAttempts, name: previousName } = result;
  const { attempts = [], name = previousName } =
    await c.req.json<Partial<Sudoku>>();

  const { result: game, error } = await tryCatchAsync(
    sudokuQuery.update
      .set({
        name,
        updatedBy: userId,
        updatedAt: new Date(),
        attempts: [...previousAttempts.slice(0, -1), ...attempts],
      })
      .where(eq(sudokuTable.id, id))
      .returning(),
  );

  if (error) {
    console.log(`[SUDOKU] Failed to update game`, error?.message);
    return c.json<ErrorWrapper>(
      {
        code: 500,
        message:
          error instanceof Error ? error.message : "Failed to update game",
      },
      500,
    );
  }

  return c.json<ResponseWrapper<Sudoku>>({
    count: 1,
    data: game[0],
  });
});

sudoku.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const userId = c.var.user.id;

  const { error } = await tryCatchAsync(
    sudokuQuery.update
      .set({
        deleted: true,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(sudokuTable.id, id)),
  );

  if (error) {
    console.log(`[SUDOKU] Failed to delete game`, error?.message);
    return c.json<ErrorWrapper>(
      {
        code: 500,
        message:
          error instanceof Error ? error.message : "Failed to delete game",
      },
      500,
    );
  }

  return c.json<SuccessWrapper>({
    message: "Game deleted successfully",
  });
});
