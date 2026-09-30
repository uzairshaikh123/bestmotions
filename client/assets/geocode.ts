import { apiUrl } from "../backend";

export type GeocodeResult = {
  ok: true;
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  spanLat: number;
};

export async function geocodeLocation(query: string): Promise<GeocodeResult | null> {
  const q = query.trim();
  if (!q) return null;
  try {
    const res = await fetch(apiUrl(`/api/geocode?q=${encodeURIComponent(q)}`));
    if (!res.ok) return null;
    const data = (await res.json()) as GeocodeResult & { ok?: boolean };
    if (!data?.ok) return null;
    return data;
  } catch {
    return null;
  }
}
