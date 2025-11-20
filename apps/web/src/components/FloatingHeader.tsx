import { useState } from "react";
import { LogIn, Moon, Sun, UserPlus } from "lucide-react";
import { useTheme } from "../hooks/use-theme";
import { Button } from "./ui/button";
import { AuthDialog } from "./AuthDialog";

export function FloatingHeader() {
	const { theme, setTheme } = useTheme();
	const [authDialogOpen, setAuthDialogOpen] = useState(false);
	const [authMode, setAuthMode] = useState<"login" | "signup">("login");

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
		<>
			<header className="sticky top-4 z-50 mx-auto w-full max-w-6xl flex items-center justify-between px-8 py-4 bg-card/80 backdrop-blur-sm retro-border rounded-xl">
				<h1 className="text-xl font-semibold text-primary">
					Wingmnn
				</h1>
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
			</header>
			<AuthDialog 
				open={authDialogOpen} 
				onOpenChange={setAuthDialogOpen}
				initialMode={authMode}
			/>
		</>
	);
}

