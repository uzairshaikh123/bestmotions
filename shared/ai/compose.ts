/** Editable AI motion composition — not tied to a fixed catalog pack. */

export type ComposeBeat =
  | {
      type: "title";
      eyebrow?: string;
      title: string;
      subtitle?: string;
    }
  | {
      type: "bullets";
      title?: string;
      items: string[];
    }
  | {
      type: "stats";
      title?: string;
      items: Array<{ label: string; value: string }>;
    }
  | {
      type: "bars";
      title?: string;
      items: Array<{ label: string; value: number }>;
    }
  | {
      type: "cards";
      title?: string;
      items: Array<{ title: string; body: string }>;
    }
  | {
      type: "timeline";
      title?: string;
      items: Array<{ when: string; label: string; detail?: string }>;
    }
  | {
      type: "quote";
      text: string;
      attribution?: string;
    }
  | {
      type: "compare";
      title?: string;
      left: { title: string; points: string[] };
      right: { title: string; points: string[] };
    }
  | {
      type: "outro";
      title: string;
      subtitle?: string;
      icons?: string[];
    }
  | {
      /** One year enters while the previous exits — prompt-faithful counters. */
      type: "year_flip";
      years: string[];
      holdSec: number;
      direction?: "vertical" | "horizontal";
      finaleTitle: string;
      finaleSubtitle?: string;
      icons?: string[];
    };

export type CompositionSpec = {
  bg: string;
  accent: string;
  ink?: string;
  muted?: string;
  beats: ComposeBeat[];
};

export const AI_COMPOSE_ASSET_ID = "ai-compose";
export const AI_COMPOSE_TEMPLATE = "ai-compose";

const BEAT_TYPES = new Set([
  "title",
  "bullets",
  "stats",
  "bars",
  "cards",
  "timeline",
  "quote",
  "compare",
  "outro",
  "year_flip",
]);

function asString(value: unknown, fallback = ""): string {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function cleanStrings(list: unknown, limit = 8): string[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => asString(item).trim())
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeBeat(raw: unknown): ComposeBeat | null {
  if (!raw || typeof raw !== "object") return null;
  const beat = raw as Record<string, unknown>;
  const type = asString(beat.type).toLowerCase();
  if (!BEAT_TYPES.has(type)) return null;

  const lines = cleanStrings(
    Array.isArray(beat.lines)
      ? beat.lines
      : Array.isArray(beat.items)
        ? beat.items.map((item) => {
            if (typeof item === "string") return item;
            if (item && typeof item === "object") {
              const row = item as Record<string, unknown>;
              return [
                row.when,
                row.label,
                row.value,
                row.title,
                row.body,
                row.detail,
                row.text,
              ]
                .map((part) => asString(part).trim())
                .filter(Boolean)
                .join("|");
            }
            return "";
          })
        : [],
    8,
  );

  switch (type) {
    case "title": {
      const title =
        asString(beat.title).trim() || lines[0] || "Untitled";
      const subtitle =
        asString(beat.subtitle).trim() || lines[1] || undefined;
      return {
        type: "title",
        eyebrow: asString(beat.eyebrow).trim() || undefined,
        title,
        subtitle,
      };
    }
    case "bullets": {
      const items =
        lines.length > 0
          ? lines
          : Array.isArray(beat.items)
            ? beat.items
                .map((item) => {
                  if (typeof item === "string") return item.trim();
                  if (item && typeof item === "object") {
                    const row = item as Record<string, unknown>;
                    return asString(
                      row.text || row.label || row.title || row.body,
                    ).trim();
                  }
                  return "";
                })
                .filter(Boolean)
                .slice(0, 6)
            : [];
      if (!items.length) return null;
      return {
        type: "bullets",
        title: asString(beat.title).trim() || undefined,
        items,
      };
    }
    case "stats": {
      const fromLines = lines
        .map((line) => {
          const [label, value] = line.split("|").map((s) => s.trim());
          return { label: label || "", value: value || label || "" };
        })
        .filter((row) => row.label || row.value)
        .slice(0, 4);
      const fromItems = Array.isArray(beat.items)
        ? beat.items
            .map((row) => {
              const r = (row || {}) as Record<string, unknown>;
              return {
                label: asString(r.label).trim(),
                value: asString(r.value).trim(),
              };
            })
            .filter((row) => row.label || row.value)
            .slice(0, 4)
        : [];
      const items = fromLines.length ? fromLines : fromItems;
      if (!items.length) return null;
      return {
        type: "stats",
        title: asString(beat.title).trim() || undefined,
        items,
      };
    }
    case "bars": {
      const fromLines = lines
        .map((line) => {
          const [label, valueRaw] = line.split("|").map((s) => s.trim());
          return {
            label: label || "Item",
            value: Math.max(0, asNumber(valueRaw, 0)),
          };
        })
        .slice(0, 6);
      const fromItems = Array.isArray(beat.items)
        ? beat.items
            .map((row) => {
              const r = (row || {}) as Record<string, unknown>;
              return {
                label: asString(r.label).trim() || "Item",
                value: Math.max(0, asNumber(r.value, 0)),
              };
            })
            .slice(0, 6)
        : [];
      const items = fromLines.length ? fromLines : fromItems;
      if (!items.length) return null;
      return {
        type: "bars",
        title: asString(beat.title).trim() || undefined,
        items,
      };
    }
    case "cards": {
      const fromLines = lines
        .map((line) => {
          const [title, body] = line.split("|").map((s) => s.trim());
          return { title: title || "Card", body: body || "" };
        })
        .slice(0, 4);
      const fromItems = Array.isArray(beat.items)
        ? beat.items
            .map((row) => {
              const r = (row || {}) as Record<string, unknown>;
              return {
                title: asString(r.title).trim() || "Card",
                body: asString(r.body).trim(),
              };
            })
            .slice(0, 4)
        : [];
      const items = fromLines.length ? fromLines : fromItems;
      if (!items.length) return null;
      return {
        type: "cards",
        title: asString(beat.title).trim() || undefined,
        items,
      };
    }
    case "timeline": {
      const fromLines = lines
        .map((line) => {
          const [when, label, detail] = line.split("|").map((s) => s.trim());
          return {
            when: when || "—",
            label: label || when || "Event",
            detail: detail || undefined,
          };
        })
        .slice(0, 6);
      const fromItems = Array.isArray(beat.items)
        ? beat.items
            .map((row) => {
              const r = (row || {}) as Record<string, unknown>;
              return {
                when: asString(r.when).trim() || "—",
                label: asString(r.label).trim() || "Event",
                detail: asString(r.detail).trim() || undefined,
              };
            })
            .slice(0, 6)
        : [];
      const items = fromLines.length ? fromLines : fromItems;
      if (!items.length) return null;
      return {
        type: "timeline",
        title: asString(beat.title).trim() || undefined,
        items,
      };
    }
    case "quote": {
      const text =
        asString(beat.text).trim() || lines[0] || "";
      if (!text) return null;
      return {
        type: "quote",
        text,
        attribution:
          asString(beat.attribution).trim() || lines[1] || undefined,
      };
    }
    case "compare": {
      const left = (beat.left || {}) as Record<string, unknown>;
      const right = (beat.right || {}) as Record<string, unknown>;
      const leftPoints =
        cleanStrings(left.points, 4).length > 0
          ? cleanStrings(left.points, 4)
          : lines.filter((l) => l.startsWith("L|")).map((l) => l.slice(2));
      const rightPoints =
        cleanStrings(right.points, 4).length > 0
          ? cleanStrings(right.points, 4)
          : lines.filter((l) => l.startsWith("R|")).map((l) => l.slice(2));
      if (!leftPoints.length && !rightPoints.length) return null;
      return {
        type: "compare",
        title: asString(beat.title).trim() || undefined,
        left: {
          title: asString(left.title, "A").trim() || "A",
          points: leftPoints.length ? leftPoints : ["—"],
        },
        right: {
          title: asString(right.title, "B").trim() || "B",
          points: rightPoints.length ? rightPoints : ["—"],
        },
      };
    }
    case "outro":
      return {
        type: "outro",
        title: asString(beat.title, lines[0] || "Thanks").trim() || "Thanks",
        subtitle: asString(beat.subtitle).trim() || lines[1] || undefined,
        icons: cleanStrings(beat.icons, 4),
      };
    case "year_flip": {
      const fromYears = Array.isArray(beat.years)
        ? beat.years.map((y) => asString(y).trim()).filter(Boolean)
        : [];
      const fromLines = lines
        .map((line) => line.replace(/[^\d]/g, "").slice(0, 4))
        .filter((y) => /^\d{4}$/.test(y));
      let years = fromYears.length ? fromYears : fromLines;
      if (years.length < 2) {
        const start = asNumber(beat.startYear, 0);
        const end = asNumber(beat.endYear, 0);
        if (start >= 1800 && end >= 1800) {
          const a = Math.min(start, end);
          const b = Math.min(Math.max(start, end), a + 40);
          years = [];
          for (let y = a; y <= b; y++) years.push(String(y));
        }
      }
      if (years.length < 2) return null;
      years = years.slice(0, 41);
      const holdSec = Math.min(
        3,
        Math.max(0.35, asNumber(beat.holdSec ?? beat.interval, 1)),
      );
      const direction =
        asString(beat.direction).toLowerCase() === "horizontal"
          ? "horizontal"
          : "vertical";
      const finaleTitle =
        asString(beat.finaleTitle || beat.title).trim() ||
        lines.find((l) => !/^\d{4}$/.test(l)) ||
        `The year ${years[years.length - 1]}`;
      return {
        type: "year_flip",
        years,
        holdSec,
        direction,
        finaleTitle,
        finaleSubtitle:
          asString(beat.finaleSubtitle || beat.subtitle).trim() || undefined,
        icons: cleanStrings(beat.icons, 4),
      };
    }
    default:
      return null;
  }
}

export function defaultComposition(): CompositionSpec {
  return {
    bg: "#0b0d12",
    accent: "#c084fc",
    ink: "#f4f0e6",
    muted: "rgba(244,240,230,0.62)",
    beats: [
      {
        type: "title",
        eyebrow: "CUSTOM MOTION",
        title: "Describe any graphic",
        subtitle: "AI builds a new layout you can edit",
      },
      {
        type: "bullets",
        title: "What you can invent",
        items: [
          "Title cards and outros",
          "Stat rows and bar charts",
          "Timelines, cards, comparisons",
        ],
      },
      {
        type: "outro",
        title: "Edit every field",
        subtitle: "Open in editor to tweak colors, beats, and copy",
      },
    ],
  };
}

export function normalizeComposition(raw: unknown): CompositionSpec {
  const base = defaultComposition();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;
  const beats = Array.isArray(obj.beats)
    ? obj.beats.map(normalizeBeat).filter((b): b is ComposeBeat => Boolean(b))
    : [];
  return {
    bg: asString(obj.bg, base.bg) || base.bg,
    accent: asString(obj.accent, base.accent) || base.accent,
    ink: asString(obj.ink, base.ink) || base.ink,
    muted: asString(obj.muted, base.muted) || base.muted,
    beats: beats.length ? beats.slice(0, 10) : base.beats,
  };
}

export function parseComposeJson(raw: unknown): CompositionSpec {
  if (typeof raw === "string") {
    const text = raw.trim();
    if (!text) return defaultComposition();
    try {
      return normalizeComposition(JSON.parse(text));
    } catch {
      return defaultComposition();
    }
  }
  return normalizeComposition(raw);
}

export function stringifyComposition(spec: CompositionSpec): string {
  return JSON.stringify(normalizeComposition(spec), null, 2);
}

/** Rough hold time so preview/export length feels right. */
export function estimateComposeSeconds(spec: CompositionSpec): number {
  let seconds = 0.4;
  let maxCap = 45;
  for (const beat of spec.beats) {
    switch (beat.type) {
      case "title":
      case "outro":
      case "quote":
        seconds += 2.4;
        break;
      case "bullets":
        seconds += 1.2 + beat.items.length * 0.45;
        break;
      case "stats":
        seconds += 1.4 + beat.items.length * 0.35;
        break;
      case "bars":
        seconds += 1.6 + beat.items.length * 0.4;
        break;
      case "cards":
        seconds += 1.5 + beat.items.length * 0.5;
        break;
      case "timeline":
        seconds += 1.4 + beat.items.length * 0.55;
        break;
      case "compare":
        seconds += 2.8;
        break;
      case "year_flip":
        seconds += 1.2 + beat.years.length * beat.holdSec + 3.2;
        maxCap = Math.max(maxCap, 90);
        break;
      default:
        seconds += 2;
    }
  }
  return Math.max(6, Math.min(maxCap, seconds));
}
