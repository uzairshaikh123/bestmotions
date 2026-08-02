/** Backend Express server (not the Vite UI port). */
export const API_BASE = "http://localhost:3001";

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}
