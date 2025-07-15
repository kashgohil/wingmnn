import { Typography } from "@wingmnn/components";

export function ChartView() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Typography.H2 className="text-xl font-spicy-rice tracking-wide text-accent">
        Sudoku
      </Typography.H2>
      <Typography.Caption className="text-accent/80">
        Classic Sudoku game
      </Typography.Caption>
    </div>
  );
}
