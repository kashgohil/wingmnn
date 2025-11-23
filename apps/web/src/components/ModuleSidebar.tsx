import { modules } from "@/lib/modules";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ModuleSidebarProps {
	isCollapsed: boolean;
	onToggleCollapse: () => void;
}

export function ModuleSidebar({
	isCollapsed,
	onToggleCollapse,
}: ModuleSidebarProps) {
	const location = useLocation();

	return (
		<aside
			className={cn(
				"fixed left-0 top-0 h-screen bg-card/80 backdrop-blur-sm retro-border border-r-2 transition-all duration-300 z-40 flex flex-col",
				isCollapsed ? "w-16" : "w-64",
			)}
		>
			{/* Collapse/Expand Button */}
			<button
				onClick={onToggleCollapse}
				className="absolute -right-3 top-4 z-50 h-6 w-6 rounded-full retro-border bg-card flex items-center justify-center hover:bg-accent transition-colors"
				aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
			>
				{isCollapsed ? (
					<ChevronRight className="h-4 w-4" />
				) : (
					<ChevronDown className="h-4 w-4 -rotate-90" />
				)}
			</button>

			{/* Sidebar Content */}
			<div className="flex flex-col h-full overflow-y-auto">
				{/* Header */}
				<div className="p-4 border-b border-border">
					{!isCollapsed && (
						<h2 className="text-lg font-bold font-mono uppercase tracking-wider">
							Modules
						</h2>
					)}
				</div>

				{/* Module List */}
				<nav className="flex-1 p-2 space-y-1">
					{modules.map((module) => {
						const Icon = module.icon;
						const isActive = location.pathname === `/${module.slug}`;

						return (
							<Link
								key={module.slug}
								to={`/${module.slug}` as any}
								className={cn(
									"flex items-center gap-3 px-3 py-2 rounded-none retro-border transition-all group relative",
									"hover:bg-accent/50",
									isActive && "bg-accent",
									isCollapsed && "justify-center",
								)}
								style={{
									borderLeftColor: `var(${module.colorVar})`,
									borderLeftWidth: isActive ? "4px" : "2px",
								}}
								title={isCollapsed ? module.name : undefined}
							>
								<div
									className={cn(
										"p-2 retro-border rounded-none shrink-0 transition-all",
										isActive && "opacity-100",
									)}
									style={{
										backgroundColor: isActive
											? `var(${module.colorVar})`
											: `var(${module.colorVar})`,
										opacity: isActive ? 1 : 0.3,
									}}
								>
									<Icon
										className={cn(
											"h-5 w-5 transition-colors",
											isActive ? "text-primary-foreground" : "text-foreground",
										)}
									/>
								</div>
								{!isCollapsed && (
									<span className="font-mono text-sm uppercase tracking-wider truncate">
										{module.name}
									</span>
								)}
							</Link>
						);
					})}
				</nav>
			</div>
		</aside>
	);
}
