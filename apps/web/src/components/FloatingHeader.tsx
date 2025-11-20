import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/use-theme";
import { Button } from "./ui/button";

export function FloatingHeader() {
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
		<header className="sticky top-4 z-50 mx-auto w-full max-w-6xl flex items-center justify-between px-8 py-4 bg-card/80 backdrop-blur-sm border border-border rounded-xl shadow-lg">
			<h1 className="text-xl font-semibold text-foreground">Wingmnn</h1>
			<Button
				variant="ghost"
				size="icon"
				onClick={cycleTheme}
				aria-label={`Current theme: ${theme}. Click to cycle theme.`}
			>
				{getThemeIcon()}
			</Button>
		</header>
	);
}

