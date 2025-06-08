import { ErrorBoundary } from "@frameworks/monitoring/components/errorBoundary";

import { useHeartbeat } from "@hooks/useHeartbeat";
import { useSetup } from "@hooks/useSetup";
import { Wingmnn } from "@icons/wingmnn";
import { Landing } from "@landing/landing";
import { Modules } from "@navigation/constants";
import { Navigation } from "@navigation/navigation";
import { BaseRoutes } from "@navigation/routes";
import { useQuote } from "@quotes/useQuote";
import { AuthService } from "@services/authService";
import { Button, Typography } from "@wingmnn/components";
import { Link, useRouter } from "@wingmnn/router";
import { AnimatePresence, motion } from "motion/react";
import { ROUTES_CONFIG } from "./config";

export function AuthRouter() {
  const { isLoading } = useHeartbeat();
  useSetup();

  const isAuthenticated = AuthService.isAuthenticated();

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <Loading key="LOADING_PAGE_KEY" />
      ) : isAuthenticated ? (
        <Content key="CONTENT_KEY" />
      ) : (
        <Landing key="LANDING_KEY" />
      )}
    </AnimatePresence>
  );
}

function Loading() {
  const { quote, author, secondary = "" } = useQuote();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="w-full h-full flex items-center justify-center flex-col"
    >
      <div className="animate-pulse h-[25%] mb-15">
        <Wingmnn className="animate-slow-spin" height={"100%"} />
      </div>
      <Typography.H1 className="text-center mb-4 max-w-1/2">
        {quote}
      </Typography.H1>
      {secondary && (
        <Typography.H2 className="text-gray-400 text-center mb-4 max-w-1/2">
          {secondary}
        </Typography.H2>
      )}
      <Typography.H3 className="text-gray-400 text-center max-w-1/2">
        {author}
      </Typography.H3>
    </motion.div>
  );
}

function Content() {
  const { Component, id } = useRouter(ROUTES_CONFIG);

  function content() {
    if (!Component) {
      return (
        <motion.div
          className="w-full h-full flex flex-col items-center justify-center space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography.H2>You look lost</Typography.H2>
          <Typography.H4>
            Let's get you to where all the fun stuff is!!
          </Typography.H4>
          <Link to={BaseRoutes[Modules.HOME]}>
            <Button
              size="sm"
              variant="secondary"
              className="flex items-center space-x-3 mt-4"
            >
              <Wingmnn height={24} width={24} className="animate-slow-spin" />
              <span>Take me Home, Country Roads</span>
            </Button>
          </Link>
        </motion.div>
      );
    }

    return <Component />;
  }

  return (
    <motion.div
      className="w-full h-full flex p-2 bg-black-400"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence mode="wait">
        {id !== "ONBOARDING" ? <Navigation key="NAVIGATION" /> : null}
        <ErrorBoundary tree="AUTH_ROUTER">
          <motion.div
            key={id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 overflow-hidden h-full bg-black-300 rounded-lg"
          >
            {content()}
          </motion.div>
        </ErrorBoundary>
      </AnimatePresence>
    </motion.div>
  );
}
