import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_TARGET = process.env.VITE_DEV_API_TARGET ?? "http://localhost:3000";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Listen on all local addresses so the app is reachable over both 127.0.0.1
    // and the IPv6 loopback (Node 17+ resolves "localhost" to ::1 on this machine).
    host: "0.0.0.0",
    // Proxy the API and uploaded files to the Express backend in development.
    // This keeps the browser on a single origin and mirrors production (Nginx).
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true },
      "/uploads": { target: API_TARGET, changeOrigin: true },
      "/health": { target: API_TARGET, changeOrigin: true },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
