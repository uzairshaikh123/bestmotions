/** @jsxImportSource @revideo/2d/lib */
/**
 * Blend highlighter: one Txt for the whole line (same as masthead/body),
 * plus a marker / underline / ring painted over the matched substring.
 *
 * Do not split the line into before/mid/after Txt nodes. Revideo Txt always
 * participates in layout and TxtLeaf segments graphemes when wrapping — nested
 * Layouts then draw every word at the same origin.
 */
import { Layout, Rect, Txt } from "@revideo/2d";
import { all, easeOutCubic } from "./helpers";

export const HIGHLIGHTER = "#FAFF00";

const FALLBACK_ADVANCE = 0.56;

export function splitPhrase(text: string, highlight: string) {
  const source = text ?? "";
  const h = highlight.trim();
  if (!h) return { before: source, mid: "", after: "" };
  const i = source.toLowerCase().indexOf(h.toLowerCase());
  if (i < 0) return { before: source, mid: "", after: "" };
  return {
    before: source.slice(0, i),
    mid: source.slice(i, i + h.length),
    after: source.slice(i + h.length),
  };
}

function fallbackWidth(phrase: string, size: number) {
  const clean = phrase;
  if (!clean) return 0;
  return Math.max(8, clean.length * size * FALLBACK_ADVANCE + size * 0.08);
}

/** Measured glyph run width for the live preview font. */
export function measureGlyphs(
  phrase: string,
  size: number,
  fontFamily = "Libre Baskerville, Georgia, serif",
  weight: number | string = 700,
  italic = false,
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
    const style = italic ? "italic " : "";
    ctx.font = `${style}${weight} ${size}px ${family}`;
    const width = ctx.measureText(phrase).width;
    return width > 0 ? width : fallbackWidth(phrase, size);
  } catch {
    return fallbackWidth(phrase, size);
  }
}

/** Approximate glyph run width for Libre Baskerville / similar serifs. */
export function blendMarkWidth(
  phrase: string,
  size: number,
  fontFamily?: string,
  weight?: number | string,
) {
  return measureGlyphs(phrase, size, fontFamily, weight ?? 700);
}

export type PhraseMarkOpts = {
  font: string;
  size: number;
  fill: string;
  marker?: string;
  weight?: number;
  width?: number;
  align?: "start" | "center";
  gap?: number;
  italic?: boolean;
  underline?: any;
  ring?: any;
  ringShape?: "circle" | "box";
  ringColor?: string;
  underlineColor?: string;
};

export function phraseBounds(
  text: string,
  highlight: string,
  opts: Pick<PhraseMarkOpts, "font" | "size" | "weight" | "width" | "align" | "italic">,
) {
  const { before, mid } = splitPhrase(text, highlight);
  const weight = opts.weight ?? 700;
  const fullW = Math.max(
    measureGlyphs(text, opts.size, opts.font, weight, opts.italic),
    1,
  );
  const beforeW = before
    ? measureGlyphs(before, opts.size, opts.font, weight, opts.italic)
    : 0;
  const midW = mid
    ? measureGlyphs(mid, opts.size, opts.font, weight, opts.italic)
    : 0;
  const boxW = opts.width && opts.width > 0 ? opts.width : fullW;
  const textLeft = opts.align === "start" ? -boxW / 2 : -fullW / 2;
  return {
    before,
    mid,
    beforeW,
    midW,
    fullW,
    boxW,
    textLeft,
    markX: textLeft + beforeW,
  };
}

export function blendPhrase(
  text: string,
  highlight: string,
  mark: any,
  opts: PhraseMarkOpts,
) {
  const weight = opts.weight ?? 700;
  const bounds = phraseBounds(text, highlight, opts);
  const { mid, midW, boxW, markX } = bounds;
  const markH = Math.round(opts.size * 1.18);
  const radius = Math.round(markH * 0.42);
  const ringPadX = Math.round(opts.size * 0.28);
  const ringPadY = Math.round(opts.size * 0.22);
  const ringW = Math.max(28, midW + ringPadX * 2);
  const ringH = Math.round(opts.size * 1.35 + ringPadY);
  const underlineY = opts.size * 0.58;

  return (
    <Layout
      layout={false}
      textWrap={false}
      width={boxW}
      height={Math.round(opts.size * 1.55)}
    >
      {mid && mark ? (
        <Rect
          ref={mark}
          width={0}
          height={markH}
          fill={opts.marker || HIGHLIGHTER}
          opacity={0.78}
          offset={[-1, 0]}
          x={markX}
          y={opts.size * 0.06}
          radius={radius}
        />
      ) : null}
      {mid && opts.underline ? (
        <Rect
          ref={opts.underline}
          width={0}
          height={Math.max(3, Math.round(opts.size * 0.08))}
          fill={opts.underlineColor || opts.marker || HIGHLIGHTER}
          offset={[-1, 0]}
          x={markX}
          y={underlineY}
          radius={2}
        />
      ) : null}
      {mid && opts.ring ? (
        <Rect
          ref={opts.ring}
          width={ringW}
          height={ringH}
          stroke={opts.ringColor || opts.underlineColor || "#e63946"}
          lineWidth={0}
          fill={null}
          radius={opts.ringShape === "box" ? 4 : Math.round(ringH / 2)}
          x={markX + midW / 2}
          y={opts.size * 0.04}
          opacity={0}
          scale={0.86}
        />
      ) : null}
      <Txt
        text={text}
        fill={opts.fill}
        fontFamily={opts.font}
        fontSize={opts.size}
        fontWeight={weight}
        fontStyle={opts.italic ? "italic" : "normal"}
        textWrap={false}
        textAlign={opts.align === "start" ? "left" : "center"}
        width={boxW}
      />
    </Layout>
  );
}

export function* paintBlend(
  mark: any,
  phrase: string,
  size: number,
  duration: number,
  fontFamily?: string,
  weight?: number | string,
) {
  const clean = phrase.trim();
  if (!clean) return;
  let node: any;
  try {
    node = mark();
  } catch {
    return;
  }
  if (!node) return;
  const width = measureGlyphs(clean, size, fontFamily, weight ?? 700);
  yield* node.width(width, duration, easeOutCubic);
}

export function* paintUnderline(
  rule: any,
  phrase: string,
  size: number,
  duration: number,
  fontFamily?: string,
  weight?: number | string,
) {
  const clean = phrase.trim();
  if (!clean) return;
  let node: any;
  try {
    node = rule();
  } catch {
    return;
  }
  if (!node) return;
  const width = measureGlyphs(clean, size, fontFamily, weight ?? 700);
  yield* node.width(width, duration, easeOutCubic);
}

export function* paintRing(ring: any, duration: number) {
  let node: any;
  try {
    node = ring();
  } catch {
    return;
  }
  if (!node) return;
  yield* all(
    node.opacity(1, duration * 0.45),
    node.lineWidth(3.5, duration, easeOutCubic),
    node.scale(1, duration, easeOutCubic),
  );
}
