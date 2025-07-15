import { GAMES_CONFIG } from "@games/config";
import { Card, CardContent, CardImage, Typography } from "@wingmnn/components";
import { mapObj } from "@wingmnn/utils";

export function GridView() {
  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))] overflow-y-auto p-4 flex-1">
      {mapObj(GAMES_CONFIG, (game) => (
        <Card
          whileHover={{ translateY: -10 }}
          transition={{ delay: 0 }}
          key={game.id}
          tabIndex={0}
          to={game.to}
          className="flex flex-col border border-accent/50 w-full p-0 overflow-clip cursor-pointer"
        >
          <CardImage
            alt={game.name}
            picture={game.picture}
            className="p-0 overflow-hidden rounded-t-lg"
          />
          <CardContent className="flex flex-col">
            <Typography.H2 className="font-spicy-rice text-accent">
              {game.name}
            </Typography.H2>
            <Typography.Caption>{game.description}</Typography.Caption>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
