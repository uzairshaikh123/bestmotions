/** Lightweight place lookup — no topojson / world-atlas (keeps real-maps pack fast). */

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
