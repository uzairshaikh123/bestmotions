export type GeoHit = {
  lat: number;
  lon: number;
  name: string;
  spanLat: number;
};

function apiBase(): string {
  try {
    const fromEnv = String(
      (import.meta as ImportMeta & { env?: Record<string, string> }).env
        ?.VITE_API_BASE || "",
    ).replace(/\/$/, "");
    if (fromEnv) return fromEnv;
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") return "";
  return "http://localhost:3001";
}

async function fetchGeocode(query: string, ms = 4000): Promise<GeoHit | null> {
  const q = query.trim();
  if (!q) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    const res = await fetch(
      `${apiBase()}/api/geocode?q=${encodeURIComponent(q)}`,
      { signal: ctrl.signal, mode: "cors" },
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      ok?: boolean;
      lat?: number;
      lon?: number;
      name?: string;
      spanLat?: number;
    };
    if (!data?.ok) return null;
    const lat = Number(data.lat);
    const lon = Number(data.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return {
      lat,
      lon,
      name: String(data.name || q),
      spanLat: Number(data.spanLat) || 0.55,
    };
  } catch {
    return null;
  }
}

/** Await geocode (or null) — used by any-place map scenes. */
export function* geocodeSrc(
  query: string,
): Generator<Promise<GeoHit | null>, GeoHit | null, GeoHit | null> {
  return yield fetchGeocode(query);
}
