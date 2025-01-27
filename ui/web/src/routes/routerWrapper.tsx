import { Landing } from "@landing/landing";
import { Outlet } from "@tanstack/react-router";
import { Navigation } from "@navigation/navigation";
import { AuthService } from "@services/authService";

export function RouterWrapper() {
  if (AuthService.isAuthenticated()) {
    return (
      <div className="w-full h-screen flex">
        <Landing />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex">
      <Navigation />
      <div className="flex-1 overflow-hidden h-full">
        <Outlet />
      </div>
    </div>
  );
}
