/** @jsxImportSource @revideo/2d/lib */
import { Layout, Rect, Txt } from "@revideo/2d";
import { all, createRef, easeOutBack, easeOutCubic, num, str, waitFor } from "./helpers";
import { itemDelays, pause, timing } from "./timing";

export const SERIF = "Libre Baskerville, Georgia, serif";
export const SANS = "Sora, Helvetica, sans-serif";

export type Ev = { label: string; title: string; detail: string };

export function parseEvents(raw: string, fallback: string): Ev[] {
  const text = (raw || fallback).trim();
  return text
    .split(/\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.includes("|")) {
        const [label = "", title = "", detail = ""] = line.split("|").map((p) => p.trim());
        return { label, title: title || label, detail };
      }
      return { label: "", title: line, detail: "" };
    })
    .slice(0, 8);
}

export const DEFAULT_EVENTS = `1947|Independence|Freedom at midnight
1950|Republic|Constitution adopted
1991|Reforms|Economy opens
2014|Mandate|A new chapter
2024|Present|Looking ahead`;

export function colors() {
  return {
    title: str("title", ""),
    label: str("label", ""),
    caption: str("caption", ""),
    note: str("note", ""),
    accent: str("accent", "#c084fc"),
    bg: str("bg", "#0a0c12"),
    eyebrow: str("eyebrow", ""),
    claim: str("claim", ""),
    highlight: str("highlight", ""),
    leftTitle: str("leftTitle", "A"),
    leftText: str("leftText", ""),
    rightTitle: str("rightTitle", "B"),
    rightText: str("rightText", ""),
    prefix: str("prefix", "₹"),
    suffix: str("suffix", ""),
    value: num("value", 100),
    year: num("year", 1991),
    startYear: num("startYear", 1947),
    endYear: num("endYear", 2026),
    percent: num("percent", 72),
    era: str("era", "2014 — 2024"),
    subtitle: str("subtitle", ""),
    markerYears: str("markerYears", ""),
    events: str("events", DEFAULT_EVENTS),
    t: timing(),
  };
}

export function* hold(sec = 1.15) {
  yield* waitFor(sec);
}

export function* fadeInTxt(
  view: any,
  text: string,
  opts: {
    fill?: string;
    size?: number;
    x?: number;
    y?: number;
    weight?: number;
    letterSpacing?: number;
    width?: number;
    align?: "left" | "center" | "right";
    font?: string;
    duration?: number;
  } = {},
) {
  const ref = createRef<Txt>();
  yield view.add(
    <Txt
      ref={ref}
      text={text}
      fill={opts.fill ?? "#ffffff"}
      fontFamily={opts.font ?? SERIF}
      fontSize={opts.size ?? 24}
      fontWeight={opts.weight ?? 700}
      letterSpacing={opts.letterSpacing ?? 0}
      x={opts.x ?? 0}
      y={opts.y ?? 0}
      width={opts.width}
      textAlign={opts.align ?? "center"}
      textWrap={Boolean(opts.width)}
      opacity={0}
    />,
  );
  yield* ref().opacity(1, opts.duration ?? 0.35, easeOutCubic);
  return ref;
}

export function* countText(ref: { (): Txt }, from: number, to: number, steps: number, stepTime: number, fmt: (n: number) => string) {
  for (let i = 1; i <= steps; i++) {
    const n = from + ((to - from) * i) / steps;
    ref().text(fmt(n));
    yield* waitFor(stepTime);
  }
}

export function* growBar(
  view: any,
  opts: { x: number; y: number; maxH: number; w?: number; fill: string; duration: number },
) {
  const bar = createRef<Rect>();
  yield view.add(
    <Rect ref={bar} width={opts.w ?? 36} height={0} fill={opts.fill} x={opts.x} y={opts.y} radius={4} />,
  );
  yield* all(
    bar().height(opts.maxH, opts.duration, easeOutCubic),
    bar().y(opts.y - opts.maxH / 2, opts.duration, easeOutCubic),
  );
  return bar;
}

export function* slideCard(
  view: any,
  opts: {
    fromX: number;
    toX: number;
    y: number;
    w: number;
    h: number;
    fill: string;
    duration: number;
    children?: any;
  },
) {
  const card = createRef<Layout>();
  yield view.add(
    <Layout ref={card} x={opts.fromX} y={opts.y} opacity={0}>
      <Rect width={opts.w} height={opts.h} fill={opts.fill} radius={10} />
      {opts.children}
    </Layout>,
  );
  yield* all(
    card().opacity(1, opts.duration * 0.7, easeOutCubic),
    card().x(opts.toX, opts.duration, easeOutBack),
  );
  return card;
}

export { all, createRef, easeOutBack, easeOutCubic, waitFor, itemDelays, pause, timing, Layout, Rect, Txt };
