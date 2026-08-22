/**
 * Express API origin from VITE_API_BASE (.env / Vercel env).
 * Falls back to local backend in dev so download always has a target.
 */
function resolveApiBase(): string {
  const fromEnv = String(import.meta.env.VITE_API_BASE || "")
    .trim()
    .replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) return "http://localhost:3001";
  return "";
}

export const API_BASE = resolveApiBase();

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE) {
    throw new Error(
      "VITE_API_BASE is missing. Set it in Vercel env to your Render URL.",
    );
  }
  return `${API_BASE}${normalized}`;
}
