import { generateMetadata } from "@/lib/metadata";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth/auth-context";
import { tokenManager } from "../../../lib/auth/token-manager";

export const Route = createFileRoute("/auth/google/callback")({
  component: OAuthCallback,
  head: () =>
    generateMetadata({
      title: "Authentication",
      description: "Completing authentication",
      noindex: true,
    }),
});

/**
 * OAuth Callback Component
 *
 * Handles the OAuth callback from Google authentication.
 * Extracts tokens from URL parameters, updates auth state,
 * and redirects to the intended destination.
 */
function OAuthCallback() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
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

        // Extract and store user data from URL parameter
        const userParam = params.get("user");
        if (userParam) {
          try {
            const userData = JSON.parse(decodeURIComponent(userParam));
            tokenManager.setUserData(userData);
          } catch (error) {
            console.error("[OAuth] Failed to parse user data:", error);
          }
        }

        // Invalidate auth query to trigger refetch with new token
        await queryClient.invalidateQueries({ queryKey: ["auth", "user"] });

        // Get intended destination or default to home
        const redirectTo = sessionStorage.getItem("auth_redirect") || "/";
        sessionStorage.removeItem("auth_redirect");

        // Redirect - the auth context will have the user data
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
  }, [navigate, queryClient, isAuthenticated]);

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
