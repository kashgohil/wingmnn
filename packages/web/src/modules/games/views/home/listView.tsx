import { GAMES_CONFIG } from "@games/config";
import { Typography } from "@wingmnn/components";
import { mapObj } from "@wingmnn/utils";

export function ListView() {
  return (
    <div className="flex flex-col p-4 gap-2 overflow-y-auto flex-1">
      {mapObj(GAMES_CONFIG, (game) => (
        <div
          key={game.id}
          className="flex gap-2 items-center border-b border-accent/20 p-2"
        >
          <img
            src={game.picture}
            alt={game.name}
            className="h-20 object-cover rounded-lg mb-2"
          />
          <div className="flex flex-col">
            <Typography.H3 className="font-spicy-rice tracking-wide text-accent">
              {game.name}
            </Typography.H3>
            <Typography.Caption className="tracking-wide">
              {game.description}
            </Typography.Caption>
          </div>
        </div>
      ))}
    </div>
  );
}
