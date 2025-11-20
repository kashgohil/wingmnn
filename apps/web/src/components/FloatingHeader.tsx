import { Link } from "@tanstack/react-router";
import { LogIn, Moon, Sun, UserPlus } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../hooks/use-theme";
import { AuthDialog } from "./AuthDialog";
import { Button } from "./ui/button";

function LogoIcon({ color }: { color: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill={color}
			className="h-6 w-6"
		>
			<title>Wingmnn Logo</title>
			<path d="M2 3 L8 3 L12 12 L8 21 L2 21 Z" />
			<path d="M22 3 L16 3 L12 12 L16 21 L22 21 Z" />
		</svg>
	);
}

export function FloatingHeader() {
	const { theme, setTheme } = useTheme();
	const [authDialogOpen, setAuthDialogOpen] = useState(false);
	const [authMode, setAuthMode] = useState<"login" | "signup">("login");

	// Use primary color for consistent legibility
	const logoColor = "var(--primary)";

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
			<header className="sticky top-4 z-50 mx-auto w-full max-w-6xl bg-card/80 backdrop-blur-sm retro-border rounded-none overflow-hidden">
				{/* Retro background pattern overlay */}
				<div className="absolute inset-0 opacity-5 pointer-events-none">
					<div
						className="absolute inset-0"
						style={{
							backgroundImage: `
								linear-gradient(var(--border) 1px, transparent 1px),
								linear-gradient(90deg, var(--border) 1px, transparent 1px)
							`,
							backgroundSize: "20px 20px",
						}}
					/>
				</div>

				{/* Color accent bars on all four borders */}
				{/* Top border */}
				<div className="absolute top-0 left-0 right-0 flex h-1">
					{topColors.map((color, idx) => (
						<div
							key={`top-${idx}`}
							className="flex-1"
							style={{ backgroundColor: color }}
						/>
					))}
				</div>

				{/* Right border */}
				<div className="absolute top-0 right-0 bottom-0 flex flex-col w-1">
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
				<div className="absolute top-0 left-0 bottom-0 flex flex-col w-1">
					{leftColors.map((color, idx) => (
						<div
							key={`left-${idx}`}
							className="flex-1"
							style={{ backgroundColor: color }}
						/>
					))}
				</div>

				<div className="relative flex items-center justify-between pl-9 pr-9 pt-5 pb-5">
					{/* Logo with retro styling */}
					<Link
						to="/"
						className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
					>
						<LogoIcon color={logoColor} />
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
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setAuthMode("login");
								setAuthDialogOpen(true);
							}}
							className="gap-2"
						>
							<LogIn className="h-4 w-4" />
							Log in
						</Button>
						<Button
							size="sm"
							onClick={() => {
								setAuthMode("signup");
								setAuthDialogOpen(true);
							}}
							className="gap-2"
						>
							<UserPlus className="h-4 w-4" />
							Sign up
						</Button>
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
