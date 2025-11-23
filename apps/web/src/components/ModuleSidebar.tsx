import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/lib/auth/auth-context";
import { modules } from "@/lib/modules";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { catchError } from "@wingmnn/utils/catch-error";
import {
	HelpCircle,
	LayoutDashboard,
	LogOut,
	Moon,
	Sun,
	UserCircle,
} from "lucide-react";
import { WingmnnIcon } from "./icons/wingmnnIcon";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";

export function ModuleSidebar() {
	const location = useLocation();
	const { user, logout } = useAuth();
	const { theme, setTheme } = useTheme();

	const getThemeIcon = () => {
		return theme === "light" ? (
			<Sun className="h-5 w-5" />
		) : (
			<Moon className="h-5 w-5" />
		);
	};

	const cycleTheme = () => {
		setTheme(theme === "light" ? "dark" : "light");
	};

	return (
		<TooltipProvider>
			<aside className="h-screen bg-card/80 backdrop-blur-sm border-r-2 z-40 flex flex-col">
				{/* Sidebar Content */}
				<div className="flex flex-col h-full overflow-y-auto">
					{/* Header */}
					<div className="p-4 flex items-center justify-center">
						<Tooltip>
							<TooltipTrigger asChild>
								<Link
									to="/dashboard"
									className="cursor-pointer flex items-center justify-center"
								>
									<WingmnnIcon
										color="var(--primary)"
										className="h-10 w-10"
									/>
								</Link>
							</TooltipTrigger>
							<TooltipContent side="right">
								<p>Go to Dashboard</p>
							</TooltipContent>
						</Tooltip>
					</div>

					{/* Module List */}
					<nav className="flex-1 flex flex-col p-3 gap-1">
						{modules.map((module) => {
							const Icon = module.icon;
							const isActive = location.pathname === `/${module.slug}`;

							return (
								<Tooltip key={module.slug}>
									<TooltipTrigger asChild>
										<Link
											to={`/${module.slug}` as any}
											className="w-full"
										>
											<div
												className={cn(
													"w-full flex items-center justify-center p-2 retro-border rounded-none transition-all opacity-70",
													isActive && "opacity-100",
												)}
												style={{
													background: `var(${module.colorVar})`,
												}}
											>
												<Icon
													className={cn(
														"h-5 w-5 transition-colors",
														isActive
															? "text-primary-foreground"
															: "text-foreground",
													)}
												/>
											</div>
										</Link>
									</TooltipTrigger>
									<TooltipContent side="right">
										<p>{module.name}</p>
									</TooltipContent>
								</Tooltip>
							);
						})}
					</nav>

					{/* Bottom Actions */}
					<div className="p-2 space-y-1">
						{/* Help */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="menu"
									asChild
									className="justify-center p-2!"
								>
									<Link to="/help">
										<HelpCircle className="h-5 w-5" />
									</Link>
								</Button>
							</TooltipTrigger>
							<TooltipContent side="right">
								<p>Help</p>
							</TooltipContent>
						</Tooltip>

						{/* Theme Switcher */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="menu"
									onClick={cycleTheme}
									className="justify-center p-2!"
									aria-label={`Current theme: ${theme}. Click to switch to ${
										theme === "light" ? "dark" : "light"
									} mode.`}
								>
									{getThemeIcon()}
								</Button>
							</TooltipTrigger>
							<TooltipContent side="right">
								<p>Switch to {theme === "light" ? "dark" : "light"} mode</p>
							</TooltipContent>
						</Tooltip>

						{/* Profile */}
						<Popover>
							<Tooltip>
								<TooltipTrigger asChild>
									<PopoverTrigger asChild>
										<Button
											variant="menu"
											className="justify-center p-1!"
										>
											<Avatar
												name={user?.name || "User"}
												size="sm"
												style={{ border: "none", boxShadow: "none" }}
											/>
										</Button>
									</PopoverTrigger>
								</TooltipTrigger>
								<TooltipContent side="right">
									<p>{user?.name || "Profile"}</p>
								</TooltipContent>
							</Tooltip>

							<PopoverContent
								side="right"
								align="start"
								className="w-56 p-0"
							>
								<div className="p-4 border-b border-border flex items-center gap-3">
									<Avatar
										name={user?.name || "User"}
										size="md"
									/>
									<p className="font-semibold text-foreground font-mono uppercase tracking-wider">
										{user?.name}
									</p>
								</div>
								<div className="p-2">
									<Button
										variant="menu-item"
										asChild
										className="justify-start text-left"
									>
										<Link to="/dashboard">
											<LayoutDashboard className="h-4 w-4" />
											Dashboard
										</Link>
									</Button>
									<Button
										variant="menu-item"
										asChild
										className="justify-start text-left"
									>
										<Link to="/profile">
											<UserCircle className="h-4 w-4" />
											Profile
										</Link>
									</Button>
									<Button
										variant="menu-item"
										type="button"
										className="justify-start text-left"
										onClick={async () => {
											const [, error] = await catchError(logout());
											if (error) {
												console.error("Logout failed:", error);
											}
										}}
									>
										<LogOut className="h-4 w-4" />
										Logout
									</Button>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</div>
			</aside>
		</TooltipProvider>
	);
}
