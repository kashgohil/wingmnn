import { z } from "zod";

export type Difficulty = "easy" | "medium" | "hard";

export const CreateSudokuSchema = z.object({
  difficulty: z.enum(["easy", "medium", "hard"]),
  size: z.number().min(3).max(9),
});

export type CreateSudokuPayload = z.infer<typeof CreateSudokuSchema>;
