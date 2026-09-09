import type { Request, Response } from "express";

const SERVICES: Record<string, string> = {
  satellite: "World_Imagery",
  street: "World_Street_Map",
  topo: "World_Topo_Map",
  dark: "Canvas/World_Dark_Gray_Base",
};

function num(v: unknown, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/** Same-origin proxy for Esri basemap exports — avoids CORS taint on canvas export. */
export function registerMapImageRoute(app: {
  get: (path: string, handler: (req: Request, res: Response) => void) => void;
}) {
  app.get("/api/map-image", async (req, res) => {
    try {
      const style = String(req.query.style || "satellite").toLowerCase();
      const service = SERVICES[style] || SERVICES.satellite;
      const west = clamp(num(req.query.west, 76.5), -180, 180);
      const south = clamp(num(req.query.south, 28.0), -85, 85);
      const east = clamp(num(req.query.east, 78.0), -180, 180);
      const north = clamp(num(req.query.north, 29.2), -85, 85);
      const width = clamp(Math.round(num(req.query.w, 1280)), 320, 1920);
      const height = clamp(Math.round(num(req.query.h, 720)), 180, 1080);

      if (east <= west || north <= south) {
        res.status(400).json({ error: "Invalid bbox" });
        return;
      }

      const bbox = `${west},${south},${east},${north}`;
      const upstream = new URL(
        `https://server.arcgisonline.com/ArcGIS/rest/services/${service}/MapServer/export`,
      );
      upstream.searchParams.set("bbox", bbox);
      upstream.searchParams.set("bboxSR", "4326");
      upstream.searchParams.set("imageSR", "4326");
      upstream.searchParams.set("size", `${width},${height}`);
      upstream.searchParams.set("format", "jpg");
      upstream.searchParams.set("f", "image");
      upstream.searchParams.set("transparent", "false");

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 12_000);
      const remote = await fetch(upstream.toString(), {
        signal: ctrl.signal,
        headers: { Accept: "image/jpeg,image/*" },
      });
      clearTimeout(timer);

      if (!remote.ok) {
        res.status(502).json({ error: `Upstream map failed (${remote.status})` });
        return;
      }

      const buf = Buffer.from(await remote.arrayBuffer());
      res.setHeader("Content-Type", remote.headers.get("content-type") || "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send(buf);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Map fetch failed";
      res.status(504).json({ error: message });
    }
  });
}
