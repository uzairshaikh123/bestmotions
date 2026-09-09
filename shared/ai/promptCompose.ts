import type { CompositionSpec } from "./compose.js";

const CUSTOM_MOTION_RE =
  /\b(one by one|one come|one go|vertically|horizontally|interval|every\s+\d|\d+\s*sec|second(?:s)?\s+each|count(?:ing)?\s+up|year(?:s)?\s+(?:from|flip|roll|counter)|custom|invent|brand[- ]?new|does not exist|unique animation|slide in|slide out)\b/i;

const YEAR_RANGE_RE =
  /(?:from\s+)?(19\d{2}|20\d{2})\s*(?:to|-|–|—)\s*(19\d{2}|20\d{2})/i;

const HOLD_RE =
  /(?:in|every|each|interval(?:\s+of)?|for)\s+(\d+(?:\.\d+)?)\s*(?:sec(?:ond)?s?|s)\b/i;

const FINALE_RE =
  /(?:at\s+the\s+last|finally|at\s+the\s+end|ending\s+with|end\s+with|then\s+show|last(?:ly)?(?:\s+show)?)\s+(?:show\s+)?(.+)$/i;

/** True when the prompt describes choreography a fixed catalog pack can't faithfully do. */
export function needsCustomMotion(prompt: string): boolean {
  const text = prompt.trim();
  if (!text) return false;
  if (CUSTOM_MOTION_RE.test(text)) return true;
  if (YEAR_RANGE_RE.test(text) && /\b(year|timeline|animation|vertically|one by one)\b/i.test(text)) {
    return true;
  }
  return false;
}

function pickIcons(prompt: string): string[] {
  const icons: string[] = [];
  const lower = prompt.toLowerCase();
  if (/global|world|trade|liberal/i.test(lower)) icons.push("🌐");
  if (/india|indian|delhi|rupee/i.test(lower)) icons.push("🇮🇳");
  if (/prime\s*minister|government|policy|reform/i.test(lower)) icons.push("🏛️");
  if (/econom|market|gdp|business/i.test(lower)) icons.push("📈");
  if (/year|timeline|history|decade/i.test(lower)) icons.push("📅");
  if (!icons.length) icons.push("✨", "▶");
  return icons.slice(0, 4);
}

function yearsBetween(start: number, end: number): string[] {
  const a = Math.min(start, end);
  const b = Math.max(start, end);
  const out: string[] = [];
  // Cap so a bad parse can't create a 200-year clip
  const max = Math.min(b, a + 40);
  for (let y = a; y <= max; y++) out.push(String(y));
  return out;
}

function extractFinale(prompt: string): { title: string; subtitle?: string } {
  const match = prompt.match(FINALE_RE);
  const raw = (match?.[1] || "").replace(/\s+/g, " ").trim();
  if (!raw) {
    return {
      title: "A defining year",
      subtitle: prompt.slice(0, 120),
    };
  }
  const cleaned = raw
    .replace(/^(?:show\s+)+/i, "")
    .replace(/^this is the year when\s+/i, "")
    .replace(/\s*use the suitable icons.*$/i, "")
    .replace(/\s*with suitable icons.*$/i, "")
    .trim();
  if (!cleaned) {
    return { title: "A defining year" };
  }
  // Prefer a crisp title; keep remainder as subtitle
  if (cleaned.length <= 88) {
    return {
      title: cleaned.charAt(0).toUpperCase() + cleaned.slice(1),
    };
  }
  const cut = cleaned.slice(0, 88);
  const at = Math.max(cut.lastIndexOf(" "), 48);
  return {
    title: cut.slice(0, at).trim(),
    subtitle: cleaned.slice(at).trim() || undefined,
  };
}

/**
 * Deterministic, prompt-faithful composition for known unique choreography patterns.
 * Returns null when the prompt doesn't match a structured custom pattern.
 */
export function compositionFromPrompt(prompt: string): CompositionSpec | null {
  const text = prompt.trim();
  if (!text) return null;

  const range = text.match(YEAR_RANGE_RE);
  if (range) {
    const start = Number(range[1]);
    const end = Number(range[2]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;

    const holdMatch = text.match(HOLD_RE);
    const holdSec = Math.min(
      3,
      Math.max(0.4, holdMatch ? Number(holdMatch[1]) : 1),
    );
    const direction = /\bhorizont/i.test(text) ? "horizontal" : "vertical";
    const finale = extractFinale(text);
    const icons = pickIcons(text);
    const years = yearsBetween(start, end);

    return {
      bg: "#07090f",
      accent: "#f0b429",
      ink: "#f7f3ea",
      muted: "rgba(247,243,234,0.62)",
      beats: [
        {
          type: "title",
          eyebrow: "YEAR TIMELINE",
          title: `${start} → ${end}`,
          subtitle: direction === "vertical" ? "One year at a time" : "Years roll across",
        },
        {
          type: "year_flip",
          years,
          holdSec,
          direction,
          finaleTitle: finale.title,
          finaleSubtitle: finale.subtitle,
          icons,
        },
      ],
    };
  }

  if (!needsCustomMotion(text)) return null;

  // Generic custom motion: keep the user's words front-and-center (not stock copy).
  const sentences = text
    .split(/[.!?]\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8)
    .slice(0, 5);

  return {
    bg: "#0b0d12",
    accent: "#38bdf8",
    ink: "#f4f0e6",
    muted: "rgba(244,240,230,0.62)",
    beats: [
      {
        type: "title",
        eyebrow: "CUSTOM MOTION",
        title: sentences[0]?.slice(0, 64) || text.slice(0, 64),
        subtitle: sentences[1]?.slice(0, 90),
      },
      {
        type: "bullets",
        title: "From your prompt",
        items: (sentences.length > 1 ? sentences.slice(1) : sentences).slice(0, 4),
      },
      {
        type: "outro",
        title: sentences[sentences.length - 1]?.slice(0, 72) || "Continue in editor",
        subtitle: "Edit composition JSON to refine every beat",
      },
    ],
  };
}
