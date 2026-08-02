import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "client",
  resolve: {
    dedupe: ["react", "react-dom", "@revideo/core", "@revideo/2d"],
  },
  server: {
    port: 5173,
    proxy: {
      "/api/": "http://localhost:3001",
      "/videos": "http://localhost:3001",
    },
  },
  optimizeDeps: {
    include: ["@revideo/core", "@revideo/2d", "@revideo/player-react"],
  },
  build: {
    outDir: "../dist/client",
    emptyOutDir: true,
  },
});
