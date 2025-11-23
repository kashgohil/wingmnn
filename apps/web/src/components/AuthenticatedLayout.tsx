import { useAuth } from "@/lib/auth/auth-context";
import { useState, type ReactNode } from "react";
import { ModuleSidebar } from "./ModuleSidebar";

interface AuthenticatedLayoutProps {
	children: ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
	const { isAuthenticated } = useAuth();
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	if (!isAuthenticated) {
		return <>{children}</>;
	}

	return (
		<div className="flex min-h-screen bg-background">
			<ModuleSidebar
				isCollapsed={sidebarCollapsed}
				onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
			/>
			<main
				className={`flex-1 transition-all duration-300 ${
					sidebarCollapsed ? "ml-16" : "ml-64"
				}`}
			>
				{children}
			</main>
		</div>
	);
}
