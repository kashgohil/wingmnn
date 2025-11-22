import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { tokenManager } from "../../../lib/auth/token-manager";

export const Route = createFileRoute("/auth/google/callback")({
  component: OAuthCallback,
});

function OAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      // Parse URL parameters
      const params = new URLSearchParams(window.location.search);
      const success = params.get("success");
      const accessToken = params.get("access_token");
      const errorParam = params.get("error");
      const errorDescription = params.get("error_description");

      // Handle error from OAuth provider or backend
      if (errorParam) {
        const errorMessage =
          errorDescription ||
          errorParam
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
        setError(`Authentication failed: ${errorMessage}`);
        setIsProcessing(false);

        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate({ to: "/" });
        }, 3000);
        return;
      }

      // Handle successful authentication
      if (success === "true" && accessToken) {
        // Store the access token
        tokenManager.setAccessToken(accessToken);

        // Get intended destination or default to home
        const redirectTo = sessionStorage.getItem("auth_redirect") || "/";
        sessionStorage.removeItem("auth_redirect");

        // Redirect immediately - the auth context will pick up the token on the next page
        navigate({ to: redirectTo });
        return;
      }

      // If we get here, something unexpected happened
      setError("Authentication failed: Invalid callback parameters");
      setIsProcessing(false);

      setTimeout(() => {
        navigate({ to: "/" });
      }, 3000);
    };

    processCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6">
          <div className="mb-4 text-destructive text-lg font-semibold">
            {error}
          </div>
          <p className="text-sm text-muted-foreground">
            Redirecting to home page...
          </p>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
          <p className="text-lg font-medium">Completing authentication...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please wait while we sign you in
          </p>
        </div>
      </div>
    );
  }

  return null;
}
