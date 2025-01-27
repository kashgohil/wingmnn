import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
        viteReact({
            babel: {
                plugins: [
                    ["babel-plugin-react-compiler"]
                ]
            }
        }),
    tailwindcss(),
    tsConfigPaths(),
    TanStackRouterVite(),
  ],
});
