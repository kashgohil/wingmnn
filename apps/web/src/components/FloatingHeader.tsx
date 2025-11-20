import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../hooks/use-theme";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

export function FloatingHeader() {
	const { theme, setTheme } = useTheme();

	const getThemeIcon = () => {
		switch (theme) {
			case "light":
				return <Sun className="h-4 w-4" />;
			case "dark":
				return <Moon className="h-4 w-4" />;
			case "system":
				return <Monitor className="h-4 w-4" />;
		}
	};

	const getThemeLabel = () => {
		switch (theme) {
			case "light":
				return "Light";
			case "dark":
				return "Dark";
			case "system":
				return "System";
		}
	};

	return (
		<header className="fixed top-4 right-4 z-50 flex items-center gap-2">
			<Select
				value={theme}
				onValueChange={(value) =>
					setTheme(value as "light" | "dark" | "system")
				}
			>
				<SelectTrigger className="bg-card border-border shadow-lg w-32">
					<div className="flex items-center gap-2">
						{getThemeIcon()}
						<SelectValue>{getThemeLabel()}</SelectValue>
					</div>
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="light">
						<div className="flex items-center gap-2">
							<Sun className="h-4 w-4" />
							<span>Light</span>
						</div>
					</SelectItem>
					<SelectItem value="dark">
						<div className="flex items-center gap-2">
							<Moon className="h-4 w-4" />
							<span>Dark</span>
						</div>
					</SelectItem>
					<SelectItem value="system">
						<div className="flex items-center gap-2">
							<Monitor className="h-4 w-4" />
							<span>System</span>
						</div>
					</SelectItem>
				</SelectContent>
			</Select>
		</header>
	);
}

