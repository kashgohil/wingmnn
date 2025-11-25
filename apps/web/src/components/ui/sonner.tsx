import { useTheme } from "@/hooks/use-theme";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			toastOptions={{
				classNames: {
					toast:
						"group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:retro-border group-[.toaster]:rounded-none group-[.toaster]:shadow-lg group-[.toaster]:font-mono group-[.toaster]:text-sm",
					description:
						"group-[.toast]:text-muted-foreground group-[.toast]:text-sm group-[.toast]:font-mono",
					actionButton:
						"group-[.toast]:retro-button group-[.toast]:retro-button-primary group-[.toast]:text-primary-foreground group-[.toast]:font-mono group-[.toast]:uppercase group-[.toast]:tracking-wider group-[.toast]:text-xs group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:h-auto",
					cancelButton:
						"group-[.toast]:retro-button group-[.toast]:retro-button-outline group-[.toast]:font-mono group-[.toast]:uppercase group-[.toast]:tracking-wider group-[.toast]:text-xs group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:h-auto",
					title:
						"group-[.toast]:font-mono group-[.toast]:font-bold group-[.toast]:uppercase group-[.toast]:tracking-wider",
					closeButton:
						"group-[.toast]:text-card-foreground group-[.toast]:hover:bg-accent group-[.toast]:rounded-none",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
