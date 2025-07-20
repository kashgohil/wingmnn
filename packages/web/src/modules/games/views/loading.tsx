import { GAMES_CONFIG } from "@games/config";
import type { Games } from "@games/constants";
import { Wingmnn } from "@icons/wingmnn";
import { Typography } from "@wingmnn/components";

export function GameLoading(props: { game: Games }) {
  const { game } = props;
  const { name } = GAMES_CONFIG[game];
  return (
    <div className="h-full w-full flex flex-col gap-4">
      <Wingmnn className="text-accent animate-slow-spin" />
      <Typography.H2 className="text-accent font-spicy-rice">
        Hang in there
      </Typography.H2>
      <Typography.Paragraph>
        We're loading your {name} game...
      </Typography.Paragraph>
    </div>
  );
}
