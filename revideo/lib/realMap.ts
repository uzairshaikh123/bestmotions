import { getPlace } from "./earth";

export type MapStyle = "satellite" | "street" | "topo" | "dark";

export type BBox = {
  west: number;
  south: number;
  east: number;
  north: number;
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
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `${protocol}//${hostname}:3001`;
    }
    return "";
  }
  return "http://localhost:3001";
}

/** Lon/lat box centered on a point. `spanLat` is degrees of latitude height. */
export function bboxAround(
  lon: number,
  lat: number,
  spanLat: number,
): BBox {
  const halfLat = Math.max(0.01, spanLat / 2);
  const cos = Math.max(0.2, Math.cos((lat * Math.PI) / 180));
  const halfLon = halfLat / cos;
  return {
    west: lon - halfLon,
    south: lat - halfLat,
    east: lon + halfLon,
    north: lat + halfLat,
  };
}

export function bboxUnion(a: BBox, b: BBox, pad = 0.08): BBox {
  const west = Math.min(a.west, b.west);
  const south = Math.min(a.south, b.south);
  const east = Math.max(a.east, b.east);
  const north = Math.max(a.north, b.north);
  const dw = (east - west) * pad;
  const dh = (north - south) * pad;
  return {
    west: west - dw,
    south: south - dh,
    east: east + dw,
    north: north + dh,
  };
}

export function mapImageUrl(
  bbox: BBox,
  opts: { style?: MapStyle; w?: number; h?: number } = {},
): string {
  const style = opts.style || "satellite";
  const w = opts.w ?? 1280;
  const h = opts.h ?? 720;
  const q = new URLSearchParams({
    style,
    west: String(bbox.west),
    south: String(bbox.south),
    east: String(bbox.east),
    north: String(bbox.north),
    w: String(w),
    h: String(h),
  });
  const base = apiBase();
  return `${base}/api/map-image?${q.toString()}`;
}

export function placeBBox(placeKey: string, spanLat: number): BBox {
  const p = getPlace(placeKey);
  return bboxAround(p.capital[0], p.capital[1], spanLat);
}

/** Project lon/lat into image pixel space for a known bbox and image size. */
export function projectLonLat(
  lon: number,
  lat: number,
  bbox: BBox,
  width: number,
  height: number,
): [number, number] {
  const x = ((lon - bbox.west) / (bbox.east - bbox.west) - 0.5) * width;
  const y = (0.5 - (lat - bbox.south) / (bbox.north - bbox.south)) * height;
  return [x, y];
}

export const ZOOM_SPANS = {
  continent: 28,
  country: 10,
  region: 2.4,
  metro: 0.55,
  city: 0.22,
  street: 0.07,
} as const;
