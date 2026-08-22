import {
  geoCentroid,
  geoCircle,
  geoEquirectangular,
  geoGraticule10,
  geoInterpolate,
  geoOrthographic,
  geoPath,
} from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import worldAtlas from "world-atlas/countries-110m.json";

export type PlaceKey =
  | "india"
  | "usa"
  | "uk"
  | "china"
  | "russia"
  | "pakistan"
  | "bangladesh"
  | "japan"
  | "france"
  | "germany"
  | "australia"
  | "brazil"
  | "south-africa"
  | "uae"
  | "israel";

export type Place = {
  key: PlaceKey;
  name: string;
  iso: string;
  /** Capital [lon, lat] — used for pins and flight paths. */
  capital: [number, number];
};

export const PLACES: Record<string, Place> = {
  india: { key: "india", name: "India", iso: "356", capital: [77.209, 28.614] },
  usa: { key: "usa", name: "USA", iso: "840", capital: [-77.037, 38.907] },
  uk: { key: "uk", name: "United Kingdom", iso: "826", capital: [-0.128, 51.507] },
  china: { key: "china", name: "China", iso: "156", capital: [116.407, 39.904] },
  russia: { key: "russia", name: "Russia", iso: "643", capital: [37.617, 55.756] },
  pakistan: { key: "pakistan", name: "Pakistan", iso: "586", capital: [73.048, 33.684] },
  bangladesh: { key: "bangladesh", name: "Bangladesh", iso: "50", capital: [90.413, 23.81] },
  japan: { key: "japan", name: "Japan", iso: "392", capital: [139.65, 35.676] },
  france: { key: "france", name: "France", iso: "250", capital: [2.352, 48.857] },
  germany: { key: "germany", name: "Germany", iso: "276", capital: [13.405, 52.52] },
  australia: { key: "australia", name: "Australia", iso: "36", capital: [149.13, -35.281] },
  brazil: { key: "brazil", name: "Brazil", iso: "76", capital: [-47.892, -15.798] },
  "south-africa": {
    key: "south-africa",
    name: "South Africa",
    iso: "710",
    capital: [28.229, -25.748],
  },
  uae: { key: "uae", name: "UAE", iso: "784", capital: [54.377, 24.454] },
  israel: { key: "israel", name: "Israel", iso: "376", capital: [35.214, 31.768] },
};

export function getPlace(key: string): Place {
  return PLACES[key] || PLACES.india;
}

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

export type Camera = {
  kind: "ortho" | "equirect";
  /** d3-geo rotate X (degrees). Center longitude at lon with yaw = -lon. */
  yaw: number;
  pitch: number;
  scale: number;
  tx: number;
  ty: number;
};

export const COLORS = {
  void: "#05080d",
  ocean: "#0b1c28",
  land: "#1c3a50",
  border: "#6d93ab",
  graticule: "#1a3a4c",
  rim: "#7ec8e3",
};

export type EarthDrawing = {
  projection: (point: [number, number]) => [number, number] | null;
  sphere: string;
  land: string;
  borders: string;
  graticule: string;
  country: string;
  ring: (lon: number, lat: number, radiusDeg: number) => string;
  route: (from: [number, number], to: [number, number]) => string;
};

const EMPTY = "M0,0";

export function drawEarth(cam: Camera, highlightIso?: string): EarthDrawing {
  loadEarth();
  const projection =
    cam.kind === "equirect"
      ? geoEquirectangular()
          .rotate([cam.yaw, cam.pitch, 0])
          .scale(cam.scale)
          .translate([cam.tx, cam.ty])
          .precision(0.5)
      : geoOrthographic()
          .rotate([cam.yaw, cam.pitch, 0])
          .scale(cam.scale)
          .translate([cam.tx, cam.ty])
          .clipAngle(90)
          .precision(0.5);

  const path = geoPath(projection as any);
  const d = (obj: unknown) => (obj ? path(obj as never) || EMPTY : EMPTY);
  const hl = highlightIso ? countryFeature(highlightIso) : undefined;

  return {
    projection: (point) => {
      const p = projection(point);
      return p ? [p[0], p[1]] : null;
    },
    sphere: d({ type: "Sphere" }),
    land: d(landFeat),
    borders: d(nations),
    graticule: d(geoGraticule10()),
    country: hl ? d(hl) : EMPTY,
    ring: (lon, lat, radiusDeg) =>
      d(geoCircle().center([lon, lat]).radius(radiusDeg).precision(0.4)()),
    route: (from, to) => {
      const interp = geoInterpolate(from, to);
      const coordinates = Array.from({ length: 96 }, (_, i) => interp(i / 95));
      return d({ type: "LineString", coordinates });
    },
  };
}

export function centerOn(lon: number, lat: number): Pick<Camera, "yaw" | "pitch"> {
  return { yaw: -lon, pitch: -lat };
}

export function mixCam(a: Camera, b: Camera, t: number): Camera {
  return {
    kind: b.kind,
    yaw: a.yaw + (b.yaw - a.yaw) * t,
    pitch: a.pitch + (b.pitch - a.pitch) * t,
    scale: a.scale + (b.scale - a.scale) * t,
    tx: a.tx + (b.tx - a.tx) * t,
    ty: a.ty + (b.ty - a.ty) * t,
  };
}

export function easeOut3(t: number) {
  return 1 - (1 - t) ** 3;
}

/** Midpoint along the geodesic, for framing a flight. */
export function geodesicMid(from: [number, number], to: [number, number]): [number, number] {
  return geoInterpolate(from, to)(0.5) as [number, number];
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

export function destCamera(iso: string, opts?: { scale?: number; tx?: number; ty?: number }): Camera {
  const [lon, lat] = countryCentroid(iso);
  return {
    kind: "ortho",
    ...centerOn(lon, lat),
    scale: opts?.scale ?? 280,
    tx: opts?.tx ?? 0,
    ty: opts?.ty ?? 0,
  };
}

export function worldCamera(opts?: Partial<Camera>): Camera {
  return {
    kind: "ortho",
    yaw: 20,
    pitch: -12,
    scale: 220,
    tx: 0,
    ty: 0,
    ...opts,
  };
}

export function mapCamera(centerLon = 70): Camera {
  return {
    kind: "equirect",
    yaw: -centerLon,
    pitch: 0,
    scale: 155,
    tx: 0,
    ty: 24,
  };
}
