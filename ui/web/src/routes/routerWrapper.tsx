import { Landing } from "@landing/landing";
import { Navigation } from "@navigation/navigation";
import { AuthService } from "@services/authService";
import { Outlet } from "@tanstack/react-router";

export function RouterWrapper() {
  if (AuthService.isAuthenticated()) {
    return <Landing />;
  }

  return (
    <div className="w-full h-full flex">
      <Navigation />
      <div className="flex-1 overflow-hidden h-full">
        <Outlet />
      </div>
    </div>
  );
}
