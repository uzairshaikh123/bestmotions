import type { Request, Response } from "express";

type GeoHit = {
  ok: true;
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  spanLat: number;
};

type CacheEntry = { at: number; hit: GeoHit | null };

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_VER = "v2";
const UA = "BestMotions/1.0 (https://bestmotions.com; maps@bestmotions.com)";

function num(v: unknown, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/** Derive a sensible camera span from Nominatim bounding box + place type. */
function spanFromPlace(place: {
  boundingbox?: string[];
  type?: string;
  class?: string;
  place_rank?: number | string;
}): number {
  const bbox = place.boundingbox;
  const south = bbox ? num(bbox[0], 0) : 0;
  const north = bbox ? num(bbox[1], 0) : 0;
  const latDiff = bbox ? Math.abs(north - south) : 1;
  const type = String(place.type || "").toLowerCase();
  const cls = String(place.class || "").toLowerCase();
  const rank = num(place.place_rank, 20);

  const isLandmark =
    rank >= 26 ||
    /monument|attraction|memorial|museum|temple|church|mosque|synagogue|cathedral|palace|fort|castle|stadium|airport|station|hotel|hospital|university|building|house|yes|tower|bridge|fountain|park|zoo|viewpoint|artwork|ruins/.test(
      type,
    ) ||
    /tourism|historic|amenity|building|leisure|man_made|aeroway/.test(cls);

  // Full close-up for gates, monuments, buildings, POIs
  if (isLandmark || latDiff < 0.015) return 0.018;
  if (latDiff < 0.04) return 0.045;
  if (latDiff < 0.1) return 0.1;
  if (latDiff > 5) return clamp(latDiff * 1.1, 8, 28);
  if (latDiff > 1) return clamp(latDiff * 1.2, 2.4, 12);
  if (latDiff > 0.1) return clamp(latDiff * 1.35, 0.35, 2.4);
  return 0.22;
}

function shortName(display: string): string {
  return display
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");
}

async function lookupNominatim(query: string): Promise<GeoHit | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "0");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8_000);
  const remote = await fetch(url.toString(), {
    signal: ctrl.signal,
    headers: {
      Accept: "application/json",
      "User-Agent": UA,
    },
  });
  clearTimeout(timer);

  if (!remote.ok) return null;
  const data = (await remote.json()) as Array<{
    lat?: string;
    lon?: string;
    display_name?: string;
    boundingbox?: string[];
    type?: string;
    class?: string;
    place_rank?: number | string;
  }>;
  if (!Array.isArray(data) || data.length === 0) return null;

  const place = data[0];
  const lat = num(place.lat, NaN);
  const lon = num(place.lon, NaN);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const displayName = String(place.display_name || query);
  return {
    ok: true,
    name: shortName(displayName),
    displayName,
    lat,
    lon,
    spanLat: spanFromPlace(place),
  };
}

/** Same-origin Nominatim proxy — any city / village / landmark → lat/lon + zoom span. */
export function registerGeocodeRoute(app: {
  get: (path: string, handler: (req: Request, res: Response) => void) => void;
}) {
  app.get("/api/geocode", async (req, res) => {
    try {
      const q = String(req.query.q || "").trim();
      if (!q) {
        res.status(400).json({ ok: false, error: "q required" });
        return;
      }

      const key = `${CACHE_VER}:${q.toLowerCase()}`;
      const cached = cache.get(key);
      if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
        if (!cached.hit) {
          res.status(404).json({ ok: false, error: "Location not found" });
          return;
        }
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.json(cached.hit);
        return;
      }

      const hit = await lookupNominatim(q);
      cache.set(key, { at: Date.now(), hit });

      if (!hit) {
        res.status(404).json({ ok: false, error: "Location not found" });
        return;
      }

      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(hit);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Geocode failed";
      res.status(504).json({ ok: false, error: message });
    }
  });
}
