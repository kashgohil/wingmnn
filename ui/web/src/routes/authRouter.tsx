import { Button } from "@components/button/button";
import { ErrorBoundary } from "@frameworks/monitoring/components/errorBoundary";
import { Link } from "@frameworks/router/Link";
import { useRouter } from "@frameworks/router/useRouter";
import { Wingmnn } from "@icons/wingmnn";
import { Landing } from "@landing/landing";
import { Modules } from "@navigation/constants";
import { Navigation } from "@navigation/navigation";
import { BaseRoutes } from "@navigation/routes";
import { AuthService } from "@services/authService";
import { ROUTES_CONFIG } from "./config";

export function AuthRouter() {
  const Component = useRouter(ROUTES_CONFIG);

  if (!AuthService.isAuthenticated()) {
    return <Landing />;
  }

  function content() {
    if (!Component) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
          <div className="text-2xl">You look lost</div>
          <div className="text-lg">
            Let's get you to where all the fun stuff is!!
          </div>
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
    <div className="w-full h-full flex pt-2">
      <Navigation key="NAVIGATION" />
      <ErrorBoundary tree="AUTH_ROUTER">
        <div className="flex-1 overflow-hidden h-full bg-black-100 rounded-tl-lg">
          {content()}
        </div>
      </ErrorBoundary>
    </div>
  );
}
