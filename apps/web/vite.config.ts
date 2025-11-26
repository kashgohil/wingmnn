import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	plugins: [
		devtools(),
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart({
			router: {
				experimental: {
					nonNestedRoutes: true,
				},
			},
		}),
		viteReact({
			babel: {
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
	],
	server: {
		port: 3001,
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Separate vendor chunks
					if (id.includes("node_modules")) {
						// React and core dependencies
						if (
							id.includes("react") ||
							id.includes("react-dom") ||
							id.includes("react-router")
						) {
							return "vendor-react";
						}
						// TanStack libraries
						if (id.includes("@tanstack")) {
							return "vendor-tanstack";
						}
						// UI libraries
						if (
							id.includes("@radix-ui") ||
							id.includes("lucide-react") ||
							id.includes("tailwind")
						) {
							return "vendor-ui";
						}
						// Other vendors
						return "vendor-other";
					}
					// Separate landing page from app
					if (id.includes("/routes/index")) {
						return "landing";
					}
					// Separate authenticated app routes
					if (id.includes("/routes/dashboard")) {
						return "app-dashboard";
					}
					// Shared components
					if (id.includes("/components/")) {
						return "components-shared";
					}
				},
			},
		},
	},
});

export default config;
