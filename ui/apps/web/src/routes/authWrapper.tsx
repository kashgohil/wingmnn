import { AuthService } from "@services/authService";
import { Outlet } from "@tanstack/react-router";
import React from "react";

const Hero = React.lazy(() => import("@hero/index"));

export function AuthWrapper() {
  if (!AuthService.isAuthenticated()) {
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <Hero />
      </React.Suspense>
    );
  }

  return (
    <div className="h-screen w-full">
      <Outlet />
    </div>
  );
}
