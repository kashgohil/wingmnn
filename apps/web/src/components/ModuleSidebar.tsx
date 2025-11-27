import { useTheme } from "@/hooks/use-theme";
import { listNotifications } from "@/lib/api/notifications.api";
import { useAuth } from "@/lib/auth/auth-context";
import { getModuleByPathname, modules } from "@/lib/modules";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { catchError } from "@wingmnn/utils/catch-error";
import {
	Bell,
	HelpCircle,
	LayoutDashboard,
	LogOut,
	Moon,
	Sun,
	UserCircle,
} from "lucide-react";
import { useState } from "react";
import { WingmnnIcon } from "./icons/wingmnnIcon";
import { NotificationsDrawer } from "./NotificationsDrawer";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

	// Fetch notifications to show unread count
	const { data: notifications = [] } = useQuery({
		queryKey: ["notifications"],
		queryFn: () => listNotifications({ unreadOnly: true }),
		staleTime: 30 * 1000, // 30 seconds
	});

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	// Get current module to determine icon color
	const currentModule = getModuleByPathname(location.pathname);
	const iconColor = currentModule
		? `var(${currentModule.colorVar})`
		: "var(--primary)";

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

	const handleLogout = async () => {
		const [, error] = await catchError(logout());
		if (error) {
			console.error("Logout failed:", error);
		}
		setLogoutDialogOpen(false);
	};

	// All module colors
	const allModuleColors = [
		"var(--module-mail)",
		"var(--module-notes)",
		"var(--module-finance)",
		"var(--module-feeds)",
		"var(--module-messages)",
		"var(--module-calendar)",
		"var(--module-wellness)",
		"var(--module-projects)",
		"var(--module-files)",
		"var(--module-fun)",
	];

	// Shuffle function
	const shuffle = <T,>(array: T[]): T[] => {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	};

	// Shuffled module colors for right border
	const rightBorderColors = shuffle(allModuleColors);

	return (
		<TooltipProvider>
			<aside className="h-screen bg-card/80 backdrop-blur-sm z-40 flex flex-col relative">
				{/* Color accent bars on right - using all module colors */}
				<div className="absolute left-full top-0 bottom-0 flex flex-col w-1">
					{rightBorderColors.map((color, idx) => (
						<div
							key={`right-${idx}`}
							className="flex-1"
							style={{ backgroundColor: color }}
						/>
					))}
				</div>
				{/* Sidebar Content */}
				<div className="flex flex-col h-full overflow-y-auto">
					{/* Header */}
					<div className="p-3 py-8 flex items-center justify-center">
						<Tooltip>
							<TooltipTrigger asChild>
								<Link
									to="/dashboard"
									className="cursor-pointer flex items-center justify-center"
								>
									<WingmnnIcon
										color={iconColor}
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
							const isActive = location.pathname.includes(`/${module.slug}`);

							return (
								<Tooltip key={module.slug}>
									<TooltipTrigger asChild>
										<Link
											to={`/${module.slug}` as any}
											className="w-full"
										>
											<div
												className={cn(
													"w-full flex items-center justify-center p-2 rounded-none transition-all opacity-70",
													isActive && "opacity-100",
												)}
												style={{
													boxSizing: "border-box",
													border: isActive
														? "3px solid var(--border)"
														: "3px solid transparent",
													boxShadow: isActive
														? "inset -2px -2px 0 rgba(0, 0, 0, 0.15), inset 2px 2px 0 rgba(255, 255, 255, 0.9), 0 2px 4px rgba(0, 0, 0, 0.15)"
														: "none",
													background: isActive
														? `var(${module.colorVar})`
														: "transparent",
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
					<div className="p-3 space-y-1">
						{/* Notifications */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="menu"
									onClick={() => setNotificationsOpen(true)}
									className="justify-center p-2! relative"
									aria-label={`Notifications${
										unreadCount > 0 ? ` (${unreadCount} unread)` : ""
									}`}
								>
									<Bell className="h-5 w-5" />
									{unreadCount > 0 && (
										<Badge
											variant="destructive"
											className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold rounded-full"
										>
											{unreadCount > 9 ? "9+" : unreadCount}
										</Badge>
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent side="right">
								<p>
									Notifications
									{unreadCount > 0 ? ` (${unreadCount} unread)` : ""}
								</p>
							</TooltipContent>
						</Tooltip>

						{/* Help */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="menu"
									asChild
									className="justify-center p-2!"
								>
									<a
										href="/help"
										target="_blank"
										rel="noopener noreferrer"
									>
										<HelpCircle className="h-5 w-5" />
									</a>
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
						<DropdownMenu>
							<Tooltip>
								<TooltipTrigger asChild>
									<DropdownMenuTrigger asChild>
										<Button
											variant="menu"
											className="justify-center p-0!"
										>
											<Avatar
												name={user?.name || "User"}
												size="sm"
												className="w-full"
												style={{ border: "none", boxShadow: "none" }}
											/>
										</Button>
									</DropdownMenuTrigger>
								</TooltipTrigger>
								<TooltipContent side="right">
									<p>{user?.name || "Profile"}</p>
								</TooltipContent>
							</Tooltip>

							<DropdownMenuContent
								side="right"
								align="end"
								className="w-56"
							>
								<div className="p-3 flex items-center gap-3">
									<Avatar
										name={user?.name || "User"}
										size="md"
									/>
									<p className="font-semibold text-foreground font-mono uppercase tracking-wider">
										{user?.name}
									</p>
								</div>
								<DropdownMenuSeparator />
								<div>
									<DropdownMenuGroup>
										<DropdownMenuItem
											asChild
											className="px-0 py-0"
										>
											<Link
												to="/dashboard"
												className="flex w-full items-center gap-2 px-3 py-2 text-left"
											>
												<LayoutDashboard className="h-4 w-4" />
												Dashboard
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem
											asChild
											className="px-0 py-0"
										>
											<Link
												to="/profile"
												className="flex w-full items-center gap-2 px-3 py-2 text-left"
											>
												<UserCircle className="h-4 w-4" />
												Profile
											</Link>
										</DropdownMenuItem>
									</DropdownMenuGroup>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="gap-2 text-destructive focus:text-destructive data-highlighted:text-destructive"
										onSelect={(event: Event) => {
											event.preventDefault();
											setLogoutDialogOpen(true);
										}}
									>
										<LogOut className="h-4 w-4" />
										Logout
									</DropdownMenuItem>
								</div>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</aside>
			<Dialog
				open={logoutDialogOpen}
				onOpenChange={setLogoutDialogOpen}
			>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>Log out?</DialogTitle>
						<DialogDescription>
							You will need to sign in again to access your workspace.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-2">
						<Button
							variant="outline"
							onClick={() => setLogoutDialogOpen(false)}
						>
							Stay signed in
						</Button>
						<Button
							variant="destructive"
							onClick={handleLogout}
						>
							Log out
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<NotificationsDrawer
				open={notificationsOpen}
				onOpenChange={setNotificationsOpen}
			/>
		</TooltipProvider>
	);
}
