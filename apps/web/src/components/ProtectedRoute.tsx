/**
 * ProtectedRoute Component
 *
 * A wrapper component that protects routes requiring authentication.
 * Redirects unauthenticated users to the home page and shows the auth dialog.
 * Stores the intended destination in query params for redirect after successful login.
 */

import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth/auth-context";
import { AuthDialog } from "./AuthDialog";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store intended destination in query params
      const currentPath = window.location.pathname;

      // Show auth dialog
      setShowAuthDialog(true);

      // Redirect to home with redirect query param
      navigate({ to: "/", search: { redirect: currentPath } });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading indicator during auth verification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
          <p className="text-lg font-medium">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show auth dialog for unauthenticated users
  if (!isAuthenticated) {
    return (
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        initialMode="login"
      />
    );
  }

  // Render children for authenticated users
  return <>{children}</>;
}
