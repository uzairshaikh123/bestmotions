import "dotenv/config";
import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { renderRevideoVideo } from "./revideoRender.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const clientDist = path.join(rootDir, "dist", "client");

const app = express();
const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "0.0.0.0";

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use("/videos", express.static(path.join(rootDir, "public", "videos")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

/** Render a Revideo scene (with variables) to MP4. */
app.post("/api/revideo-render", async (req, res) => {
  const variables =
    req.body?.variables && typeof req.body.variables === "object"
      ? req.body.variables
      : {};

  try {
    const id = `revideo-${Date.now()}`;
    const videoUrl = await renderRevideoVideo(id, variables);
    res.json({ videoUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/videos")) {
      next();
      return;
    }
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(port, host, () => {
  console.log(`BestMotions server listening on http://${host}:${port}`);
});
