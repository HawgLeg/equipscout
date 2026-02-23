import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { vibecodePlugin } from "@vibecodeapp/webapp/plugin";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8000,
    allowedHosts: true, // Allow all hosts
  },
  build: {
    sourcemap: true,
  },
  plugins: [
    react(),
    mode === "development" && vibecodePlugin(),
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "o4510936311644672",
      project: "javascript",
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
