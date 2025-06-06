import { useQueryState } from "@frameworks/query/hook";
import { ME_QUERY_KEY } from "@queryKeys";
import {
  Card,
  Confetti,
  CurvedText,
  Input,
  Typography,
} from "@wingmnn/components";
import type { User } from "@wingmnn/db";
import React from "react";

export function Onboarding() {
  const user = useQueryState<User>(ME_QUERY_KEY);
  const [name, setName] = React.useState<string>("");

  return (
    <div className="h-full w-full flex items-center justify-center relative">
      <Confetti className="bg-black-300 z-0" />
      <Card
        size="lg"
        className="flex flex-col items-center justify-center p-20 gap-8 relative overflow-hidden bg-black-100"
        animate={{ opacity: 1, translateY: 0 }}
        initial={{ opacity: 0.2, translateY: 20 }}
      >
        <CurvedText
          text="Hurray!"
          fontSize={32}
          fontFamily="var(--font-spicy-rice)"
        />
        <Typography.H2 className="text-center w-fit">
          Welcome, {user?.name}.
        </Typography.H2>
        <Typography.H3 className="text-center w-fit">
          it's me, your wingmnn!!
        </Typography.H3>
        <div className="flex flex-col items-center">
          <Typography.Paragraph className="text-center w-fit">
            I know, it's weird talking to someone with no name, right?
          </Typography.Paragraph>
          <Typography.Paragraph className="text-center w-fit">
            what would you like to call me?
          </Typography.Paragraph>
        </div>

        <Input
          autoFocus
          value={name}
          variant="outlined"
          onChange={setName}
          wrapperClassName="z-1"
          className="text-center text-2xl w-fit"
        />
      </Card>
    </div>
  );
}
