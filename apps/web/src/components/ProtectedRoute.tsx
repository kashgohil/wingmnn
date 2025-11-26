/**
 * ProtectedRoute Component
 *
 * A wrapper component that protects routes requiring authentication.
 * Redirects unauthenticated users to the home page and shows the auth dialog.
 * Stores the intended destination in query params for redirect after successful login.
 * Also provides the authenticated layout with sidebar and grid background.
 */

import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuth } from "../lib/auth/auth-context";
import { ModuleSidebar } from "./ModuleSidebar";
import { SoftRetroGridBackground } from "./backgrounds/RetroGridPatterns";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";

interface ProtectedRouteProps {
	children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			// Store intended destination in query params
			const redirectValue = `${window.location.pathname}${window.location.search}${window.location.hash}`;

			// Redirect to home with redirect query param
			navigate({ to: "/", search: { redirect: redirectValue } });
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

	// Show redirecting message for unauthenticated users
	if (!isAuthenticated) {
		return (
			<div className="flex h-screen bg-background">
				<SoftRetroGridBackground
					className="z-0 opacity-30"
					lineColor="var(--border)"
					backgroundSize="40px 40px"
				/>
				<main className="flex-1 overflow-y-auto relative flex items-center justify-center">
					<Card className="max-w-md mx-auto">
						<CardHeader>
							<CardTitle className="text-center">
								Redirecting to home page...
							</CardTitle>
							<CardDescription className="text-center">
								Please wait while we redirect you.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex justify-center">
							<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
						</CardContent>
					</Card>
				</main>
			</div>
		);
	}

	// Render authenticated layout with sidebar and grid background
	return (
		<div className="flex h-screen bg-background">
			<ModuleSidebar />
			<SoftRetroGridBackground
				className="z-0 opacity-30"
				lineColor="var(--border)"
				backgroundSize="40px 40px"
			/>
			<main className="flex-1 overflow-y-auto relative">{children}</main>
		</div>
	);
}
