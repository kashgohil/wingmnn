import {
  useMutation,
  useQueryState,
  useQueryStateWithAction,
} from "@frameworks/query/hook";
import { Modules } from "@navigation/constants";
import { BaseRoutes } from "@navigation/routes";
import { ME_QUERY_KEY } from "@queryKeys";
import { UserService } from "@services/userService";
import {
  Button,
  Card,
  Confetti,
  CurvedText,
  Input,
  Typography,
} from "@wingmnn/components";
import type { User } from "@wingmnn/db";
import { Link } from "@wingmnn/router";
import { click } from "@wingmnn/utils/interactivity";
import { AnimatePresence, motion } from "motion/react";
import React from "react";

enum Steps {
  WELCOME = "WELCOME",
  MODULES = "MODULES",
}

export function Onboarding() {
  const [step, setStep] = React.useState<Steps>(Steps.WELCOME);

  const goToModules = React.useCallback(() => setStep(Steps.MODULES), []);

  function content() {
    switch (step) {
      case Steps.WELCOME:
        return <WelcomeCard submit={goToModules} />;
      case Steps.MODULES:
        return <ConfirmationCard />;
    }
  }

  return (
    <div className="h-full w-full flex items-center justify-center relative">
      <Confetti className="bg-black-400 z-0" />
      <Card
        size="lg"
        className="p-20 relative bg-black-200"
        animate={{ opacity: 1, translateY: 0 }}
        initial={{ opacity: 0.2, translateY: 20 }}
      >
        <AnimatePresence mode="wait">{content()}</AnimatePresence>
      </Card>
    </div>
  );
}

function WelcomeCard(props: { submit(): void }) {
  const { submit } = props;

  const [user, , setUserKey] = useQueryStateWithAction<User>(ME_QUERY_KEY);

  const { mutate: update, isMutating } = useMutation({
    key: ME_QUERY_KEY,
    mutationFn: () =>
      UserService.update(user!.id, {
        assistantName: user?.assistantName,
        isOnboarded: true,
      }),
    onMutate: () => {
      return { ...user, assistantName: user?.assistantName, isOnboarded: true };
    },
    onResolve: submit,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-8"
    >
      <CurvedText
        text="Hurray!"
        fontSize={32}
        fontFamily="var(--font-spicy-rice)"
      />
      <Typography.H2 className="text-center w-fit">
        Welcome, <span className="font-spicy-rice">{user?.name}</span>.
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
        variant="outlined"
        disabled={isMutating}
        value={user?.assistantName}
        wrapperClassName="z-1 font-spicy-rice"
        onKeyDown={click(update)}
        onChange={setUserKey("assistantName")}
        className="text-center text-2xl w-fit"
      />
    </motion.div>
  );
}

function ConfirmationCard() {
  const user = useQueryState<User>(ME_QUERY_KEY);

  const { name, assistantName } = user || {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-8"
    >
      <Typography.H1 className="text-center w-fit font-spicy-rice text-7xl">
        {assistantName}
      </Typography.H1>
      <div className="flex flex-col items-center">
        <Typography.Paragraph className="text-center w-fit">
          I like this name.
        </Typography.Paragraph>
        <Typography.Paragraph className="text-center w-fit">
          Okay, let me re-inroduce myself.
        </Typography.Paragraph>
      </div>
      <Typography.H3 className="text-center w-fit">
        Hi, <span className="font-spicy-rice">{name}</span>, it's me, your
        friend, <span className="font-spicy-rice">{assistantName}</span>
      </Typography.H3>
      <Typography.Paragraph className="text-center w-fit">
        I'll be helping you with all your tasks - mails, notes, finances,
        messages and much more. we are gonna have a wonderful time together. i'm
        sure of it.
      </Typography.Paragraph>
      <Link to={BaseRoutes[Modules.HOME]}>
        <Button className="bg-black-400">Let's get started</Button>
      </Link>
    </motion.div>
  );
}
