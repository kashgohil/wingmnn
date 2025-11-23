import { useAuth } from "@/lib/auth/auth-context";
import { getModuleByPathname } from "@/lib/modules";
import { Link, useLocation } from "@tanstack/react-router";
import { catchError } from "@wingmnn/utils/catch-error";
import {
	LayoutDashboard,
	LogIn,
	LogOut,
	Moon,
	Sun,
	User,
	UserCircle,
	UserPlus,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../hooks/use-theme";
import { getAllModuleSlugs } from "../lib/modules";
import { AuthDialog } from "./AuthDialog";
import { WingmnnIcon } from "./icons/wingmnnIcon";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

// Protected routes that should not show header/footer
const PROTECTED_ROUTES = [
	"/dashboard",
	...getAllModuleSlugs().map((slug) => `/${slug}`),
];

function isProtectedRoute(pathname: string): boolean {
	return PROTECTED_ROUTES.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);
}

export function FloatingHeader() {
	const { theme, setTheme } = useTheme();
	const { isAuthenticated, user, logout } = useAuth();

	// Get location - useLocation() should work in route components
	// If router context isn't available, this will throw, but that's expected
	// as these components should only be used within route components
	const location = useLocation();

	const [authDialogOpen, setAuthDialogOpen] = useState(false);
	const [authMode, setAuthMode] = useState<"login" | "signup">("login");

	// Don't show header on protected routes
	if (isProtectedRoute(location.pathname)) {
		return null;
	}

	// Get current module to determine icon color (for consistency, even though header doesn't show on module routes)
	const currentModule = getModuleByPathname(location.pathname);
	const logoColor = currentModule
		? `var(${currentModule.colorVar})`
		: "var(--primary)";

	// All module colors for border decorations
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

	// Shuffle function
	const shuffle = <T,>(array: T[]): T[] => {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	};

	// Randomize color order for each border
	// Top and bottom use all module colors
	const topColors = shuffle(allModuleColors);
	const bottomColors = shuffle(allModuleColors);

	// Left and right use only 2 colors (randomly selected)
	const selectedSideColors = shuffle(allModuleColors).slice(0, 2);
	const leftColors = shuffle(selectedSideColors);
	const rightColors = shuffle(selectedSideColors);

	return (
		<>
			<header className="fixed sm:sticky top-0 left-0 z-50 w-full bg-card/80 backdrop-blur-sm sm:retro-border rounded-none">
				{/* Color accent bars on all four borders */}
				{/* Top border */}
				<div className="hidden sm:flex absolute top-0 left-0 right-0 h-1">
					{topColors.map((color, idx) => (
						<div
							key={`top-${idx}`}
							className="flex-1"
							style={{ backgroundColor: color }}
						/>
					))}
				</div>

				{/* Right border */}
				<div className="hidden sm:flex absolute top-0 right-0 bottom-0 flex-col w-1">
					{rightColors.map((color, idx) => (
						<div
							key={`right-${idx}`}
							className="flex-1"
							style={{ backgroundColor: color }}
						/>
					))}
				</div>

				{/* Bottom border */}
				<div className="absolute bottom-0 left-0 right-0 flex h-1">
					{bottomColors.map((color, idx) => (
						<div
							key={`bottom-${idx}`}
							className="flex-1"
							style={{ backgroundColor: color }}
						/>
					))}
				</div>

				{/* Left border */}
				<div className="hidden sm:flex absolute top-0 left-0 bottom-0 flex-col w-1">
					{leftColors.map((color, idx) => (
						<div
							key={`left-${idx}`}
							className="flex-1"
							style={{ backgroundColor: color }}
						/>
					))}
				</div>

				<div className="relative flex items-center justify-between w-full px-4 py-4 md:px-9 md:py-5 md:max-w-7xl md:mx-auto">
					{/* Logo with retro styling */}
					<Link
						to="/"
						className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
					>
						<WingmnnIcon color={logoColor} />
						<h1
							className="text-xl font-bold font-mono uppercase tracking-wider relative"
							style={{ color: logoColor }}
						>
							<span className="relative z-10">WINGMNN</span>
							<span className="absolute inset-0 text-foreground/20 blur-sm">
								WINGMNN
							</span>
						</h1>
					</Link>

					<div className="flex items-center gap-2">
						{isAuthenticated ? (
							<>
								{/* User Profile Menu */}
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className="flex items-center gap-2"
										>
											<User className="h-4 w-4" />
											<span className="hidden md:inline">{user?.name}</span>
										</Button>
									</PopoverTrigger>

									<PopoverContent
										align="end"
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
							</>
						) : (
							<>
								{/* Login/Signup Buttons */}
								<Button
									variant="outline"
									size="icon"
									onClick={() => {
										setAuthMode("login");
										setAuthDialogOpen(true);
									}}
									className="md:hidden"
									aria-label="Log in"
								>
									<LogIn className="h-4 w-4" />
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setAuthMode("login");
										setAuthDialogOpen(true);
									}}
									className="hidden md:inline-flex gap-2"
								>
									<LogIn className="h-4 w-4" />
									Log in
								</Button>
								<Button
									size="icon"
									onClick={() => {
										setAuthMode("signup");
										setAuthDialogOpen(true);
									}}
									className="md:hidden"
									aria-label="Sign up"
								>
									<UserPlus className="h-4 w-4" />
								</Button>
								<Button
									size="sm"
									onClick={() => {
										setAuthMode("signup");
										setAuthDialogOpen(true);
									}}
									className="hidden md:inline-flex gap-2"
								>
									<UserPlus className="h-4 w-4" />
									Sign up
								</Button>
							</>
						)}

						{/* Theme Toggle */}
						<Button
							variant="ghost"
							size="icon"
							onClick={cycleTheme}
							aria-label={`Current theme: ${theme}. Click to cycle theme.`}
						>
							{getThemeIcon()}
						</Button>
					</div>
				</div>
			</header>
			<AuthDialog
				open={authDialogOpen}
				onOpenChange={setAuthDialogOpen}
				initialMode={authMode}
			/>
		</>
	);
}
