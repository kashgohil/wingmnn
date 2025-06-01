import { Card } from "@components/card/card";
import ConfettiAnimation from "@components/confetti/confetti";
import { Input } from "@components/input/input";
import { Typography } from "@components/Typography/typography";
import React from "react";

export function Onboarding() {
  const [name, setName] = React.useState<string>("");

  return (
    <div className="h-full w-full flex items-center justify-center relative">
      <ConfettiAnimation className="bg-black-300 z-0" />
      <Card
        size="lg"
        className="flex flex-col items-center justify-center p-20 gap-8 relative overflow-hidden bg-black-100"
        animate={{ opacity: 1, translateY: 0 }}
        initial={{ opacity: 0.2, translateY: 20 }}
      >
        <Typography.H1 className="text-center w-fit">Hurray!</Typography.H1>
        <Typography.H2 className="text-center w-fit">
          You are most welcome, Kash.
        </Typography.H2>
        <Typography.Paragraph className="text-center w-fit">
          it's me, your wingmnn!!
        </Typography.Paragraph>
        <Typography.Paragraph className="text-center w-fit">
          I know it's weird to call someone who doesn't have any name, right?
          let's decide what you would like to call me:
        </Typography.Paragraph>
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
