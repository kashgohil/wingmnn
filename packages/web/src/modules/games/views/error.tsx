import { GAMES_CONFIG } from "@games/config";
import { Games } from "@games/constants";
import { Wingmnn } from "@icons/wingmnn";
import { Button, Typography } from "@wingmnn/components";
import { Link } from "@wingmnn/router";

interface GameErrorProps {
  game: Games;
}

export function GameError(props: GameErrorProps) {
  const { game } = props;
  const { to } = GAMES_CONFIG[game];

  return (
    <div className="h-full w-full p-4 flex flex-col items-center justify-center gap-2">
      <div className="flex flex-col text-center">
        <Typography.H1 className="text-accent">Nope!</Typography.H1>
        <Typography.Paragraph>
          Looks like things are not so smooth out here!
        </Typography.Paragraph>
      </div>
      <Link to={to}>
        <Button size="sm" className="flex items-center space-x-3 mt-4">
          <Wingmnn height={20} width={20} className="animate-slow-spin" />
          <span>Let's get you on track!</span>
        </Button>
      </Link>
    </div>
  );
}
