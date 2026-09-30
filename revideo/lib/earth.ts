/**
 * Lightweight production maps for Revideo.
 *
 * Stack (all free / open-source, no API fees):
 *   d3-geo        — ISC
 *   topojson-client — BSD / ISC
 *   world-atlas   — BSD (Natural Earth 110m)
 *
 * Flat equirectangular only — draw paths once, animate via Layout
 * scale/position. Orthographic "3D globe" redraws are intentionally gone
 * so previews open instantly.
 */
import {
  geoCentroid,
  geoCircle,
  geoEquirectangular,
  geoGraticule10,
  geoInterpolate,
  geoPath,
} from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import worldAtlas from "world-atlas/countries-110m.json";
import { getPlace, type Place, type PlaceKey, PLACES } from "./places";

export type { Place, PlaceKey };
export { getPlace, PLACES };

type Feat = GeoJSON.Feature<GeoJSON.Geometry, { name?: string }>;
type FeatCol = GeoJSON.FeatureCollection<GeoJSON.Geometry, { name?: string }>;

let landFeat: Feat | null = null;
let nations: FeatCol | null = null;
const byIso = new Map<string, Feat>();

function atlas(): Topology {
  return worldAtlas as unknown as Topology;
}

export function loadEarth() {
  if (landFeat && nations) return;
  const topo = atlas();
  landFeat = feature(topo, topo.objects.land) as unknown as Feat;
  nations = feature(topo, topo.objects.countries) as unknown as FeatCol;
  for (const f of nations.features) {
    byIso.set(String(f.id), f);
  }
}

export function countryFeature(iso: string): Feat | undefined {
  loadEarth();
  return byIso.get(String(iso));
}

export function countryCentroid(iso: string): [number, number] {
  const f = countryFeature(iso);
  if (!f) return getPlace("india").capital;
  return geoCentroid(f) as [number, number];
}

/** Flat-map camera: Layout scale + translation (no path redraw). */
export type MapView = {
  /** Layout.scale */
  scale: number;
  /** Layout x — maps local point to screen center when x = -localX * scale */
  x: number;
  y: number;
};

export const COLORS = {
  void: "#071018",
  ocean: "#0d2433",
  land: "#1a455c",
  border: "#7aa3ba",
  graticule: "#16384a",
  rim: "#8ec9e0",
  glow: "#5ce1ff",
};

export type EarthDrawing = {
  projection: (point: [number, number]) => [number, number] | null;
  land: string;
  borders: string;
  graticule: string;
  country: string;
  ring: (lon: number, lat: number, radiusDeg: number) => string;
  route: (from: [number, number], to: [number, number]) => string;
};

const EMPTY = "M0,0";

/** Standard world plate — drawn once; camera moves the Layout. */
export const WORLD_SCALE = 155;
export const WORLD_TY = 18;

function baseProjection(centerLon = 20) {
  return geoEquirectangular()
    .rotate([-centerLon, 0, 0])
    .scale(WORLD_SCALE)
    .translate([0, WORLD_TY])
    .precision(1.5);
}

export function drawFlatWorld(opts?: {
  highlightIso?: string;
  centerLon?: number;
}): EarthDrawing {
  loadEarth();
  const projection = baseProjection(opts?.centerLon ?? 20);
  const path = geoPath(projection as any);
  const d = (obj: unknown) => (obj ? path(obj as never) || EMPTY : EMPTY);
  const hl = opts?.highlightIso ? countryFeature(opts.highlightIso) : undefined;

  return {
    projection: (point) => {
      const p = projection(point);
      return p ? [p[0], p[1]] : null;
    },
    land: d(landFeat),
    borders: d(nations),
    graticule: d(geoGraticule10()),
    country: hl ? d(hl) : EMPTY,
    ring: (lon, lat, radiusDeg) =>
      d(geoCircle().center([lon, lat]).radius(radiusDeg).precision(0.5)()),
    route: (from, to) => {
      const interp = geoInterpolate(from, to);
      const coordinates = Array.from({ length: 56 }, (_, i) => interp(i / 55));
      return d({ type: "LineString", coordinates });
    },
  };
}

/** Focus a lon/lat at screen center with the given zoom. */
export function viewAt(
  drawing: EarthDrawing,
  lon: number,
  lat: number,
  scale: number,
): MapView {
  const xy = drawing.projection([lon, lat]);
  if (!xy) return { scale: 1, x: 0, y: 0 };
  return { scale, x: -xy[0] * scale, y: -xy[1] * scale };
}

/** Frame two points (flight / region). */
export function viewSpan(
  drawing: EarthDrawing,
  a: [number, number],
  b: [number, number],
  padScale = 1.15,
): MapView {
  const pa = drawing.projection(a);
  const pb = drawing.projection(b);
  if (!pa || !pb) return { scale: 1, x: 0, y: 0 };
  const mid: [number, number] = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
  const dx = Math.abs(pb[0] - pa[0]);
  const dy = Math.abs(pb[1] - pa[1]);
  const fit = Math.min(980 / Math.max(dx, 80), 520 / Math.max(dy, 60));
  const scale = Math.max(0.85, Math.min(2.4, fit / padScale));
  return { scale, x: -mid[0] * scale, y: -mid[1] * scale };
}

export function worldView(): MapView {
  return { scale: 1, x: 0, y: 0 };
}

export function mixView(a: MapView, b: MapView, t: number): MapView {
  return {
    scale: a.scale + (b.scale - a.scale) * t,
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

export function easeOut3(t: number) {
  return 1 - (1 - t) ** 3;
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function geodesicMid(from: [number, number], to: [number, number]): [number, number] {
  return geoInterpolate(from, to)(0.5) as [number, number];
}

/** Great-circle distance in kilometres (WGS84 sphere). */
export function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.min(1, Math.sqrt(h))));
}

export function headingDeg(
  projection: EarthDrawing["projection"],
  interp: (t: number) => [number, number],
  t: number,
) {
  const a = interp(Math.max(0, t - 0.012));
  const b = interp(Math.min(1, t + 0.012));
  const pa = projection(a);
  const pb = projection(b);
  if (!pa || !pb) return 0;
  return (Math.atan2(pb[1] - pa[1], pb[0] - pa[0]) * 180) / Math.PI;
}

/** @deprecated Kept for any leftover imports — prefer drawFlatWorld + viewAt. */
export type Camera = {
  kind: "equirect";
  yaw: number;
  pitch: number;
  scale: number;
  tx: number;
  ty: number;
};

/** @deprecated */
export function drawEarth(_cam: Camera, highlightIso?: string): EarthDrawing {
  return drawFlatWorld({ highlightIso });
}

/** @deprecated */
export function mixCam(a: Camera, b: Camera, t: number): Camera {
  return {
    kind: "equirect",
    yaw: a.yaw + (b.yaw - a.yaw) * t,
    pitch: a.pitch + (b.pitch - a.pitch) * t,
    scale: a.scale + (b.scale - a.scale) * t,
    tx: a.tx + (b.tx - a.tx) * t,
    ty: a.ty + (b.ty - a.ty) * t,
  };
}

/** @deprecated */
export function centerOn(lon: number, _lat: number): Pick<Camera, "yaw" | "pitch"> {
  return { yaw: -lon, pitch: 0 };
}

/** @deprecated */
export function destCamera(iso: string, opts?: { scale?: number; tx?: number; ty?: number }): Camera {
  const [lon] = countryCentroid(iso);
  return {
    kind: "equirect",
    yaw: -lon,
    pitch: 0,
    scale: opts?.scale ?? WORLD_SCALE,
    tx: opts?.tx ?? 0,
    ty: opts?.ty ?? WORLD_TY,
  };
}

/** @deprecated */
export function worldCamera(opts?: Partial<Camera>): Camera {
  return {
    kind: "equirect",
    yaw: -20,
    pitch: 0,
    scale: WORLD_SCALE,
    tx: 0,
    ty: WORLD_TY,
    ...opts,
  };
}

/** @deprecated */
export function mapCamera(centerLon = 70): Camera {
  return {
    kind: "equirect",
    yaw: -centerLon,
    pitch: 0,
    scale: WORLD_SCALE,
    tx: 0,
    ty: WORLD_TY,
  };
}
