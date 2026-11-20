import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Determine backend target (default 4000, fallback 4001)
const backendPort = process.env.VITE_BACKEND_PORT || 4000;
const targetUrl = `http://localhost:${backendPort}`;

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/feed": {
        target: targetUrl,
        changeOrigin: true
      },
      "/swipe": {
        target: targetUrl,
        changeOrigin: true
      },
      "/matches": {
        target: targetUrl,
        changeOrigin: true
      },
      "/reset": {
        target: targetUrl,
        changeOrigin: true
      },
      "/health": {
        target: targetUrl,
        changeOrigin: true
      }
    }
  }
});
