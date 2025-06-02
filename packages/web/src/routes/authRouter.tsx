import { ErrorBoundary } from "@frameworks/monitoring/components/errorBoundary";

import { useHeartbeat } from "@hooks/useHeartbeat";
import { useSetup } from "@hooks/useSetup";
import { Wingmnn } from "@icons/wingmnn";
import { Landing } from "@landing/landing";
import { Modules } from "@navigation/constants";
import { Navigation } from "@navigation/navigation";
import { BaseRoutes } from "@navigation/routes";
import { AuthService } from "@services/authService";
import { Button, Typography } from "@wingmnn/components";
import { Link, useRouter } from "@wingmnn/router";
import { ROUTES_CONFIG } from "./config";

export function AuthRouter() {
  if (!AuthService.isAuthenticated()) {
    return <Landing />;
  }

  return <Content />;
}

function Content() {
  const Component = useRouter(ROUTES_CONFIG);

  useHeartbeat();
  useSetup();

  function content() {
    if (!Component) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
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
        </div>
      );
    }

    return <Component />;
  }

  return (
    <div className="w-full h-full flex p-2">
      <Navigation key="NAVIGATION" />
      <ErrorBoundary tree="AUTH_ROUTER">
        <div className="flex-1 overflow-hidden h-full bg-black-100 rounded-lg">
          {content()}
        </div>
      </ErrorBoundary>
    </div>
  );
}
