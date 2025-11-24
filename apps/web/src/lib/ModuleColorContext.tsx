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

export function useModuleColor() {
	const context = useContext(ModuleColorContext);
	return context?.moduleColorVar || "--primary";
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

