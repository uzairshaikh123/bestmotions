/**
 * API origin for Express.
 * - Dev: empty string → same-origin `/api` + `/videos` via Vite proxy
 *   (works when opening the UI from localhost OR a LAN IP).
 * - Prod: set VITE_API_BASE if the API is on another host.
 */
export const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "";

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE) return normalized;
  return `${API_BASE.replace(/\/$/, "")}${normalized}`;
}
