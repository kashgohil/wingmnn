import { LONG_STALE } from "@frameworks/query/constants";
import { useMutation, useQuery } from "@frameworks/query/hook";
import { Games } from "@games/constants";
import { SudokuService } from "@games/services/sudokuService";
import { Wingmnn } from "@icons/wingmnn";
import {
  Button,
  Input,
  Tabs,
  Typography,
  useToast,
  type Tab,
} from "@wingmnn/components";
import { RouterUtils } from "@wingmnn/router";
import type { CreateSudokuPayload, Difficulty } from "@wingmnn/types";
import React from "react";
import { GameError } from "../error";
import { GameLoading } from "../loading";
import { SudokuBoard } from "./sudokuBoard";

interface SudokuProps {
  gameId: string;
}

export function Sudoku(props: SudokuProps) {
  const { gameId } = props;

  const queryKey = React.useMemo(
    () => ({
      primaryKey: gameId,
    }),
    [gameId],
  );

  const {
    error,
    isLoading,
    result: game,
  } = useQuery({
    key: queryKey,
    queryFn: () => {
      return SudokuService.get(gameId);
    },
    staleTime: LONG_STALE,
    selector: (res) => res.data,
    enabled: !!gameId,
  });

  if (isLoading) {
    return <GameLoading game={Games.SUDOKU} />;
  }

  if (!gameId) {
    return <Create />;
  }

  if (error || !game) {
    return <GameError game={Games.SUDOKU} />;
  }

  return <SudokuBoard game={game} />;
}

const DIFFICULTIES: Array<Tab<Difficulty>> = [
  { id: "easy", name: "Easy", description: "" },
  { id: "medium", name: "Medium", description: "" },
  { id: "hard", name: "Hard", description: "" },
];

function Create() {
  const [size, setSize] = React.useState<number>(9);
  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");

  const toast = useToast();

  const queryKey = React.useMemo(
    () => ({ primaryKey: "SUDOKU", params: { size, difficulty } }),
    [size, difficulty],
  );

  const { isMutating, mutate: create } = useMutation({
    key: queryKey,
    staleTime: 0,
    mutationFn: () => {
      return SudokuService.create<CreateSudokuPayload>({
        size,
        difficulty,
      });
    },
    onResolve: (res) => {
      toast({
        type: "success",
        title: "Success",
        description: "Game created!",
      });
      RouterUtils.goTo(`/games/sudoku/${res.data.id}`);
    },
    onReject: (error) => {
      toast({
        type: "error",
        title: "Uh Oh!!",
        description: error.message || "Something went wrong",
      });
    },
  });

  return (
    <div className="h-2/3 w-full flex flex-col items-center justify-center gap-4">
      <Typography.H1 className="font-spicy-rice text-accent">
        How brave are you?
      </Typography.H1>
      <Tabs<Difficulty>
        tabs={DIFFICULTIES}
        tabClassName="text-sm"
        activeTab={difficulty}
        onChange={setDifficulty}
      />
      <Typography.H1 className="font-spicy-rice text-accent">
        What grid size you wanna try?
      </Typography.H1>
      <Input
        min={1}
        max={9}
        value={size}
        type="number"
        onChange={setSize}
        variant="outlined"
        placeholder="Grid Size"
        className="text-center appearance-none"
      />
      <Button
        onClick={create}
        disabled={isMutating}
        className="flex items-center gap-2"
      >
        {isMutating && <Wingmnn size={12} className="animate-spin" />}
        Let's Play
      </Button>
    </div>
  );
}
