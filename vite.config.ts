import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Always load repo-root .env (Vite would otherwise look under client/)
  const env = loadEnv(mode, __dirname, "");

  return {
    plugins: [react()],
    root: "client",
    envDir: __dirname,
    define: {
      // Ensure client always sees the value even if envDir quirks remain
      "import.meta.env.VITE_API_BASE": JSON.stringify(
        env.VITE_API_BASE || "http://localhost:3001",
      ),
      "import.meta.env.VITE_FEATURE_VIDEO_SOUND": JSON.stringify(
        env.VITE_FEATURE_VIDEO_SOUND || "false",
      ),
      "import.meta.env.VITE_FEATURE_BOARD": JSON.stringify(
        env.VITE_FEATURE_BOARD ?? "",
      ),
    },
    resolve: {
      alias: {
        "@shared": path.resolve(__dirname, "shared"),
      },
      dedupe: ["react", "react-dom", "@revideo/core", "@revideo/2d"],
    },
    server: {
      port: 5173,
      host: true,
      fs: {
        allow: [path.resolve(__dirname)],
      },
      proxy: {
        "/api/": env.VITE_API_BASE || "http://localhost:3001",
        "/videos": env.VITE_API_BASE || "http://localhost:3001",
      },
    },
    optimizeDeps: {
      include: [
        "@revideo/core",
        "@revideo/2d",
        "@revideo/player-react",
        "d3-geo",
        "topojson-client",
        "konva",
        "react-konva",
        "gsap",
      ],
    },
    build: {
      outDir: "../dist/client",
      emptyOutDir: true,
    },
  };
});
