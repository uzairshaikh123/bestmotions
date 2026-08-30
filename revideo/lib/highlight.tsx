/** @jsxImportSource @revideo/2d/lib */
/**
 * Blend highlighter: one Txt for the whole line (same as masthead/body),
 * plus a marker Rect painted behind the matched substring.
 *
 * Do not split the line into before/mid/after Txt nodes. Revideo Txt always
 * participates in layout and TxtLeaf segments graphemes when wrapping — nested
 * Layouts then draw every word at the same origin.
 */
import { Layout, Rect, Txt } from "@revideo/2d";
import { easeOutCubic } from "./helpers";

export const HIGHLIGHTER = "#FAFF00";

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

/** Approximate glyph run width for Libre Baskerville / similar serifs. */
export function blendMarkWidth(phrase: string, size: number) {
  const clean = phrase.trim();
  if (!clean) return 0;
  return Math.max(24, clean.length * size * 0.56 + size * 0.35);
}

export function blendPhrase(
  text: string,
  highlight: string,
  mark: any,
  opts: {
    font: string;
    size: number;
    fill: string;
    marker?: string;
    weight?: number;
    width?: number;
    align?: "start" | "center";
    gap?: number;
  },
) {
  const { before, mid } = splitPhrase(text, highlight);
  const markH = Math.round(opts.size * 1.2);
  const fullW = Math.max(blendMarkWidth(text, opts.size), 1);
  const beforeW = before ? blendMarkWidth(before, opts.size) * 0.92 : 0;
  const boxW = opts.width && opts.width > 0 ? opts.width : fullW;
  const textLeft =
    opts.align === "start" ? -boxW / 2 : -fullW / 2;
  const markX = textLeft + beforeW;
  const radius = Math.round(markH * 0.42);

  return (
    <Layout
      layout={false}
      textWrap={false}
      width={boxW}
      height={Math.round(opts.size * 1.45)}
    >
      {mid ? (
        <Rect
          ref={mark}
          width={0}
          height={markH}
          fill={opts.marker || HIGHLIGHTER}
          opacity={0.78}
          offset={[-1, 0]}
          x={markX}
          y={opts.size * 0.08}
          radius={radius}
        />
      ) : null}
      <Txt
        text={text}
        fill={opts.fill}
        fontFamily={opts.font}
        fontSize={opts.size}
        fontWeight={opts.weight ?? 700}
        textWrap={false}
        textAlign={opts.align === "start" ? "left" : "center"}
        width={boxW}
      />
    </Layout>
  );
}

export function* paintBlend(mark: any, phrase: string, size: number, duration: number) {
  const clean = phrase.trim();
  if (!clean) return;
  let node: any;
  try {
    node = mark();
  } catch {
    return;
  }
  if (!node) return;
  yield* node.width(blendMarkWidth(clean, size), duration, easeOutCubic);
}
