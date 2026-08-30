import "dotenv/config";
import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  getPublicFlags,
  setFlagEnabled,
} from "./featureFlags.js";
import { registerBoardRoutes } from "./boards.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const clientDist = path.join(rootDir, "dist", "client");

const app = express();
const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "0.0.0.0";
const serveFrontend = process.env.SERVE_FRONTEND === "true";

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use("/videos", express.static(path.join(rootDir, "public", "videos")));

registerBoardRoutes(app, rootDir);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/feature-flags", (_req, res) => {
  res.json(getPublicFlags());
});

app.put("/api/admin/feature-flags", (req, res) => {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || req.header("x-admin-secret") !== secret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const key = String(req.body?.key || "");
  if (!key) {
    res.status(400).json({ error: "key required" });
    return;
  }
  // Env-backed flags cannot be mutated at runtime.
  res.status(405).json(setFlagEnabled(key, Boolean(req.body?.enabled)));
});

app.post("/api/revideo-render", (_req, res) => {
  res.status(410).json({
    error:
      "Server Chromium export was removed. Download records the live preview in the browser.",
  });
});

if (serveFrontend && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/videos")) {
      next();
      return;
    }
    res.sendFile(path.join(clientDist, "index.html"));
  });
} else if (serveFrontend) {
  console.warn(
    "SERVE_FRONTEND=true was set, but no built frontend was found in dist/client. " +
      "Deploy the frontend separately and set VITE_API_BASE to the backend URL.",
  );
}

app.listen(port, host, () => {
  console.log(`BestMotions server listening on http://${host}:${port}`);
});
