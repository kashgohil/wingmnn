import { Button } from "@components/button/button";
import { useRouter } from "@frameworks/router/useRouter";
import { Wingmnn } from "@icons/wingmnn";
import { Landing } from "@landing/landing";
import { Navigation } from "@navigation/navigation";
import { AuthService } from "@services/authService";
import { ROUTES_CONFIG } from "./config";

export function AuthRouter() {
  const Component = useRouter(ROUTES_CONFIG);

  if (!AuthService.isAuthenticated()) {
    return <Landing />;
  }

  if (!Component) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-4xl">You look lost, my friend</div>
        <div className="text-2xl">Let's get you to where all the fun stuff is!!</div>
        <Button className="center-y space-y-2" size="sm">
          <Wingmnn className="animate-slow-spin" /> Take me Home, Country Roads
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex p-2">
      <Navigation />
      <div className="flex-1 overflow-hidden pl-2 h-full">
        <Component />
      </div>
    </div>
  );
}
