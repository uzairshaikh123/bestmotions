/** @jsxImportSource @revideo/2d/lib */
/**
 * Blend highlighter: yellow marker sits *behind* the glyphs so the type stays
 * the original ink color (newspaper "Elon Musk" look). Capsule ends, slight
 * drop, left-to-right paint.
 */
import { Layout, Rect, Txt } from "@revideo/2d";
import { easeOutCubic } from "./helpers";

export const HIGHLIGHTER = "#FAFF00";

export function splitPhrase(text: string, highlight: string) {
  const h = highlight.trim();
  if (!h) return { before: text, mid: "", after: "" };
  const i = text.toLowerCase().indexOf(h.toLowerCase());
  if (i < 0) return { before: text, mid: "", after: "" };
  return {
    before: text.slice(0, i),
    mid: text.slice(i, i + h.length),
    after: text.slice(i + h.length),
  };
}

export function blendMarkWidth(phrase: string, size: number) {
  const clean = phrase.trim();
  return Math.max(56, clean.length * size * 0.58 + size * 0.55);
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
  const { before, mid, after } = splitPhrase(text, highlight);
  const markH = Math.round(opts.size * 1.12);
  const midW = blendMarkWidth(mid || highlight, opts.size);
  const radius = Math.round(markH * 0.42);
  return (
    <Layout
      layout
      direction={"row"}
      gap={opts.gap ?? 6}
      alignItems={"center"}
      justifyContent={opts.align === "center" ? "center" : "start"}
      width={opts.width}
    >
      {before ? (
        <Txt
          text={before}
          fill={opts.fill}
          fontFamily={opts.font}
          fontSize={opts.size}
          fontWeight={opts.weight}
        />
      ) : null}
      {mid ? (
        <Layout width={midW} height={markH} layout={false}>
          <Rect
            ref={mark}
            width={0}
            height={markH}
            fill={opts.marker || HIGHLIGHTER}
            opacity={0.78}
            offset={[-1, 0]}
            x={-midW / 2}
            y={opts.size * 0.08}
            radius={radius}
          />
          <Txt
            text={mid}
            fill={opts.fill}
            fontFamily={opts.font}
            fontSize={opts.size}
            fontWeight={700}
          />
        </Layout>
      ) : (
        <Txt
          text={text}
          fill={opts.fill}
          fontFamily={opts.font}
          fontSize={opts.size}
          fontWeight={opts.weight}
        />
      )}
      {after ? (
        <Txt
          text={after}
          fill={opts.fill}
          fontFamily={opts.font}
          fontSize={opts.size}
          fontWeight={opts.weight}
        />
      ) : null}
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
