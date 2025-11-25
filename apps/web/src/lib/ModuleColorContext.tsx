/**
 * ModuleColorContext
 *
 * Provides the current module's color to components that need it,
 * especially for dialogs and other portal-rendered components.
 */

import { createContext, useContext } from "react";

interface ModuleColorContextValue {
	moduleColorVar: string;
}

const ModuleColorContext = createContext<ModuleColorContextValue | null>(null);

export function useModuleColorStyles() {
	const context = useContext(ModuleColorContext);
	const moduleColorVar = context?.moduleColorVar;

	return moduleColorVar
		? ({
				"--primary": `var(${moduleColorVar})`,
				"--ring": `var(${moduleColorVar})`,
				"--chart-1": `var(${moduleColorVar})`,
				"--primary-border-dark": `color-mix(in srgb, var(${moduleColorVar}) 85%, black)`,
				"--primary-hover": `color-mix(in srgb, var(${moduleColorVar}) 110%, white)`,
				"--primary-active": `color-mix(in srgb, var(${moduleColorVar}) 95%, black)`,
		  } as React.CSSProperties)
		: undefined;
}

export function ModuleColorProvider({
	moduleColorVar,
	children,
}: {
	moduleColorVar: string;
	children: React.ReactNode;
}) {
	return (
		<ModuleColorContext.Provider value={{ moduleColorVar }}>
			{children}
		</ModuleColorContext.Provider>
	);
}
