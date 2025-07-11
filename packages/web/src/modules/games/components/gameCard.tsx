import type { Game } from "@games/types";
import { Card, CardContent, CardTitle, Typography } from "@wingmnn/components";

interface GameCardProps {
  game: Game;
}

export function GameCard(props: GameCardProps) {
  const { game } = props;

  return (
    <Card>
      <CardTitle>
        <Typography.H1>{game.title}</Typography.H1>
        <Typography.Paragraph>{game.description}</Typography.Paragraph>
      </CardTitle>
      <CardContent></CardContent>
    </Card>
  );
}
