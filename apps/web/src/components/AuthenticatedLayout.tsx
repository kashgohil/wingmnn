import { useAuth } from "@/lib/auth/auth-context";
import { type ReactNode } from "react";
import { ModuleSidebar } from "./ModuleSidebar";

interface AuthenticatedLayoutProps {
	children: ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <>{children}</>;
	}

	return (
		<div className="flex min-h-screen bg-background">
			<ModuleSidebar />
			<main className="flex-1">{children}</main>
		</div>
	);
}
