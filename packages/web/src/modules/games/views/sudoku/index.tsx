import { useQuery } from "@frameworks/query/hook";
import { Games } from "@games/constants";
import { SudokuService } from "@games/services/sudokuService";
import { Button, Tabs, Typography } from "@wingmnn/components";
import React from "react";
import { GameError } from "../error";

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

  const { error, result: game } = useQuery({
    key: queryKey,
    queryFn: () => {
      return SudokuService.get(gameId);
    },
    enabled: !!gameId,
  });

  if (error) {
    return <GameError game={Games.SUDOKU} />;
  }

  if (!gameId) {
    return <Create />;
  }

  return <div className="p-4 h-full w-full"></div>;
}

const DIFFICULTIES = [
  { id: "easy", name: "Easy", description: "" },
  { id: "medium", name: "Medium", description: "" },
  { id: "hard", name: "Hard", description: "" },
];

function Create() {
  const [difficulty, setDifficulty] = React.useState<string>("easy");

  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-4">
      <Typography.H1 className="font-spicy-rice text-accent">
        How brave are you?
      </Typography.H1>
      <Tabs
        activeTab={difficulty}
        onChange={setDifficulty}
        tabClassName="text-sm"
        tabs={DIFFICULTIES}
      />
      <Button size="sm">Let's Play</Button>
    </div>
  );
}
