import type { BoardElement, MarkStyle } from "./types";

const FALLBACK_ADVANCE = 0.56;

export function splitPhrase(text: string, highlight: string) {
  const source = text ?? "";
  const h = (highlight || "").trim();
  if (!h) return { before: source, mid: "", after: "", index: -1 };
  const i = source.toLowerCase().indexOf(h.toLowerCase());
  if (i < 0) return { before: source, mid: "", after: "", index: -1 };
  return {
    before: source.slice(0, i),
    mid: source.slice(i, i + h.length),
    after: source.slice(i + h.length),
    index: i,
  };
}

function fallbackWidth(phrase: string, size: number) {
  if (!phrase) return 0;
  return Math.max(8, phrase.length * size * FALLBACK_ADVANCE + size * 0.08);
}

export function measureGlyphs(
  phrase: string,
  size: number,
  fontFamily = "Sora, Segoe UI, sans-serif",
  weight: number | string = 600,
): number {
  if (!phrase) return 0;
  if (typeof document === "undefined") return fallbackWidth(phrase, size);
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return fallbackWidth(phrase, size);
    const family = fontFamily
      .split(",")
      .map((part) => part.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean)
      .map((part) => (/\s/.test(part) ? `"${part}"` : part))
      .join(", ");
    ctx.font = `${weight} ${size}px ${family}`;
    const width = ctx.measureText(phrase).width;
    return width > 0 ? width : fallbackWidth(phrase, size);
  } catch {
    return fallbackWidth(phrase, size);
  }
}

export type HighlightLayout = {
  beforeW: number;
  midW: number;
  afterW: number;
  mid: string;
  style: MarkStyle;
  color: string;
  fontSize: number;
};

export function highlightLayout(el: BoardElement): HighlightLayout | null {
  const text = el.content || "";
  const phrase = el.highlight || "";
  const style = el.markStyle || "none";
  if (!phrase || style === "none") return null;
  const parts = splitPhrase(text, phrase);
  if (!parts.mid) return null;
  const fontSize = el.fontSize || 28;
  const font = "Sora, Segoe UI, sans-serif";
  return {
    beforeW: measureGlyphs(parts.before, fontSize, font),
    midW: measureGlyphs(parts.mid, fontSize, font),
    afterW: measureGlyphs(parts.after, fontSize, font),
    mid: parts.mid,
    style,
    color: el.markerColor || "#FAFF00",
    fontSize,
  };
}

/** 0–1 paint progress for highlight / underline based on motion + playhead. */
export function markProgress(
  el: BoardElement,
  timeMs: number | null,
  playing: boolean,
): number {
  const layout = highlightLayout(el);
  if (!layout) return 0;
  if (!playing || timeMs == null) return 1;
  const delay = el.motion?.delayMs ?? 0;
  const dur = Math.max(el.motion?.durationMs ?? 1200, 1);
  const local = timeMs - delay;
  if (local <= 0) return 0;
  return Math.min(1, Math.max(0, local / dur));
}
