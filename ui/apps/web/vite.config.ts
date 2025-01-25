import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-expect-error
  plugins: [TanStackRouterVite(), react(), tailwindcss()],
});
