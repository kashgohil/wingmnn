import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  define: {
    STATIC_URL: JSON.stringify("https://static.wingmnn.com"),
  },
  server: {
    proxy: {
      "/api": {
        secure: false,
        changeOrigin: true,
        target: "http://localhost:8001",
      },
      "/auth": {
        secure: false,
        changeOrigin: true,
        target: "http://localhost:8001",
      },
    },
  },
  css: {
    transformer: "lightningcss",
  },
  build: {
    cssMinify: "lightningcss",
  },
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
    tsConfigPaths(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
