import { Card } from "@components/card/card";
import { Input } from "@components/input/input";
import { Typography } from "@components/Typography/typography";
import React from "react";

export function Onboarding() {
  const [name, setName] = React.useState<string>("");

  return (
    <div className="h-full w-full flex items-center justify-center">
      <Card
        size="lg"
        className="bg-black-300 p-20 flex flex-col gap-8"
        animate={{ opacity: 1, translateY: 0 }}
        initial={{ opacity: 0.2, translateY: 20 }}
      >
        <Typography.H1 className="text-center">Hurray!</Typography.H1>
        <Typography.H2 className="text-center">
          You are most welcome, Kash.
        </Typography.H2>
        <Typography.Paragraph className="text-center">
          it's me, your wingmnn!!
        </Typography.Paragraph>
        <Typography.Paragraph className="text-center">
          I know it's weird to call someone who doesn't have any name, right?
          let's decide what you would like to call me:
        </Typography.Paragraph>
        <Input
          autoFocus
          value={name}
          variant="outlined"
          onChange={setName}
          className="text-center text-2xl"
        />
      </Card>
    </div>
  );
}
