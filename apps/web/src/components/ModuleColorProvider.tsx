/**
 * ModuleColorProvider Component
 *
 * Sets the primary color CSS variable to match the current module's color.
 * This cascades to all child components, so all primary-colored elements
 * will use the module's color instead of the default primary.
 *
 * Also provides the module color via context for portal-rendered components
 * like dialogs that are outside the normal DOM tree.
 */

import { ModuleColorProvider as ContextProvider } from "@/lib/ModuleColorContext";
import { getModuleBySlug } from "@/lib/modules";
import type { ReactNode } from "react";

interface ModuleColorProviderProps {
	moduleSlug: string;
	children: ReactNode;
}

export function ModuleColorProvider({
	moduleSlug,
	children,
}: ModuleColorProviderProps) {
	const module = getModuleBySlug(moduleSlug);
	const colorVar = module?.colorVar || "--primary";

	// Use CSS color-mix to compute darker/lighter shades for retro button borders
	return (
		<ContextProvider moduleColorVar={colorVar}>
			<div
				style={
					{
						// Override primary color with module color - cascades to all children
						"--primary": `var(${colorVar})`,
						"--ring": `var(${colorVar})`,
						"--chart-1": `var(${colorVar})`,
						// For retro button borders, we'll use a slightly darker version
						// Using CSS color-mix for modern browsers, with fallback
						"--primary-border-dark": `color-mix(in srgb, var(${colorVar}) 85%, black)`,
						"--primary-hover": `color-mix(in srgb, var(${colorVar}) 110%, white)`,
						"--primary-active": `color-mix(in srgb, var(${colorVar}) 95%, black)`,
					} as React.CSSProperties
				}
			>
				{children}
			</div>
		</ContextProvider>
	);
}
