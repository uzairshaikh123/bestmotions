import { ASSETS } from "../../client/assets/catalog.js";
import type { AssetDefinition, AssetField } from "../../client/assets/types.js";
import type { AiStyle } from "../../shared/ai/types.js";

export type CatalogSummary = {
  id: string;
  name: string;
  category: string;
  description: string;
  template: string;
};

export type FieldSchema = {
  key: string;
  type: AssetField["type"];
  label: string;
  hint?: string;
  options?: string[];
  default?: string | number;
};

const STYLE_CATEGORIES: Record<Exclude<AiStyle, "any">, string[]> = {
  news: ["newspaper"],
  doc: ["timeline", "time", "money", "comparison", "rise", "crime", "documentary", "hooks", "social"],
  chart: ["charts"],
  map: ["maps"],
  yt: ["yt", "crime", "hooks", "social"],
  shorts: ["shorts"],
  books: ["books"],
  "3d": ["3d"],
};

const byId = new Map(ASSETS.map((asset) => [asset.id, asset]));

export function getAsset(id: string): AssetDefinition | undefined {
  return byId.get(id);
}

export function listSummaries(): CatalogSummary[] {
  return ASSETS.map((asset) => ({
    id: asset.id,
    name: asset.name,
    category: asset.category,
    description: asset.description,
    template: asset.template,
  }));
}

export function fieldSchemas(asset: AssetDefinition): FieldSchema[] {
  return asset.fields
    .filter((field) => field.key !== "sound")
    .map((field) => ({
      key: field.key,
      type: field.type,
      label: field.label,
      hint: field.hint,
      options: field.options?.map((o) => o.value),
      default: asset.defaults[field.key],
    }));
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((t) => t.length > 2);
}

export function retrieveCandidates(
  prompt: string,
  style: AiStyle = "any",
  limit = 14,
): AssetDefinition[] {
  const tokens = tokenize(prompt);
  const preferred =
    style !== "any" ? new Set(STYLE_CATEGORIES[style] ?? []) : null;

  const scored = ASSETS.map((asset) => {
    const hay = `${asset.name} ${asset.description} ${asset.category} ${asset.template} ${asset.id}`.toLowerCase();
    let score = 0;
    for (const token of tokens) {
      if (hay.includes(token)) score += 1;
    }
    if (preferred?.has(asset.category)) score += 4;
    if (style === "news" && asset.template.startsWith("news")) score += 2;
    if (style === "map" && asset.template.startsWith("real-")) score += 2;
    return { asset, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  const picked = scored.slice(0, limit).map((row) => row.asset);
  if (picked.length >= Math.min(6, limit)) return picked;

  // Fallback: style-filtered or popular head of catalog
  const fallback = preferred
    ? ASSETS.filter((a) => preferred.has(a.category)).slice(0, limit)
    : ASSETS.slice(0, limit);
  const ids = new Set(picked.map((a) => a.id));
  for (const asset of fallback) {
    if (ids.has(asset.id)) continue;
    picked.push(asset);
    if (picked.length >= limit) break;
  }
  return picked;
}

export function sanitizeProps(
  asset: AssetDefinition,
  raw: Record<string, unknown>,
): Record<string, string | number> {
  const allowed = new Set(asset.fields.map((f) => f.key));
  const next: Record<string, string | number> = { ...asset.defaults };

  for (const [key, value] of Object.entries(raw || {})) {
    if (!allowed.has(key)) continue;
    if (value === undefined || value === null) continue;
    const field = asset.fields.find((f) => f.key === key);
    if (!field) continue;

    if (field.type === "number") {
      const n = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(n)) continue;
      let clamped = n;
      if (typeof field.min === "number") clamped = Math.max(field.min, clamped);
      if (typeof field.max === "number") clamped = Math.min(field.max, clamped);
      next[key] = clamped;
      continue;
    }

    const str = String(value);
    if (field.type === "select" && field.options?.length) {
      const ok = field.options.some((o) => o.value === str);
      if (!ok) continue;
    }
    if (field.type === "image" && !str.startsWith("data:") && !/^https?:\/\//i.test(str)) {
      continue;
    }
    next[key] = str;
  }

  return next;
}
