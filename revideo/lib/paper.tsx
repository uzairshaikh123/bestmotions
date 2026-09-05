/** @jsxImportSource @revideo/2d/lib */
/**
 * Production paper craft: jagged tears, fiber hairs, grain, creases, stacked clippings.
 * Edges must look ripped — never a clean rectangle.
 */
import { Line, Rect } from "@revideo/2d";

export const NEWS_INK = "#171310";
export const NEWS_PAPER = "#f2e8d4";
export const NEWS_DESK = "#0c0b09";

export function hash01(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Closed jagged outline of a torn clipping, origin at center. */
export function tornOutline(
  width: number,
  height: number,
  roughness: number,
  seed: number,
): [number, number][] {
  const jag = Math.max(5, Math.min(42, roughness));
  const pts: [number, number][] = [];
  const edge = (
    count: number,
    from: [number, number],
    to: [number, number],
    nx: number,
    ny: number,
    salt: number,
  ) => {
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const x = from[0] + (to[0] - from[0]) * t;
      const y = from[1] + (to[1] - from[1]) * t;
      const n = (hash01(seed * 13 + salt + i * 2.17) - 0.5) * jag;
      const bite = hash01(seed * 7 + salt + i * 5.3);
      const deep = bite > 0.88 ? jag * 0.85 : bite > 0.72 ? jag * 0.35 : 0;
      const notch = hash01(seed * 3 + salt + i * 11.1) > 0.93 ? jag * 1.15 : 0;
      pts.push([x + nx * (n - deep - notch), y + ny * (n - deep - notch)]);
    }
  };
  const l = -width / 2;
  const r = width / 2;
  const t = -height / 2;
  const b = height / 2;
  edge(26, [l, t], [r, t], 0, 1, 10);
  edge(18, [r, t], [r, b], -1, 0, 40);
  edge(26, [r, b], [l, b], 0, -1, 70);
  edge(18, [l, b], [l, t], 1, 0, 100);
  return pts;
}

/** Vertical torn edge used as a peel / rip front. */
export function tornRipEdge(
  height: number,
  roughness: number,
  seed: number,
): [number, number][] {
  const jag = Math.max(8, Math.min(48, roughness));
  const steps = 42;
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = -height / 2 + t * height;
    const n = (hash01(seed + i * 3.1) - 0.5) * jag;
    const fiber = hash01(seed + i * 9.4) > 0.78 ? jag * 0.95 : 0;
    const hook = hash01(seed + i * 17.2) > 0.91 ? jag * 1.2 : 0;
    pts.push([n - fiber - hook, y]);
  }
  return pts;
}

/** Closed peel sheet: jagged left edge, long rectangle to the right. */
export function tornPeelOutline(
  height: number,
  extend: number,
  roughness: number,
  seed: number,
): [number, number][] {
  const left = tornRipEdge(height, roughness, seed);
  const h = height / 2;
  return [...left, [extend, h], [extend, -h]];
}

function fiberHairs(
  pts: [number, number][],
  seed: number,
): { x: number; y: number; rot: number; len: number; key: string }[] {
  const hairs: { x: number; y: number; rot: number; len: number; key: string }[] = [];
  for (let i = 0; i < pts.length; i += 3) {
    if (hash01(seed + i * 4.4) < 0.55) continue;
    const [x, y] = pts[i];
    hairs.push({
      x,
      y,
      rot: (hash01(seed + i * 8.1) - 0.5) * 80,
      len: 7 + hash01(seed + i * 2.2) * 16,
      key: `h-${i}`,
    });
  }
  return hairs;
}

export function PaperSheet(opts: {
  width: number;
  height: number;
  fill: string;
  roughness?: number;
  seed?: number;
  shadow?: boolean;
}) {
  const pts = tornOutline(opts.width, opts.height, opts.roughness ?? 16, opts.seed ?? 7);
  const hairs = fiberHairs(pts, (opts.seed ?? 7) + 40);
  const rim = tornOutline(
    opts.width - 10,
    opts.height - 10,
    Math.max(4, (opts.roughness ?? 16) * 0.45),
    (opts.seed ?? 7) + 3,
  );
  return (
    <>
      {opts.shadow !== false ? (
        <Line
          points={pts.map(([x, y]) => [x + 11, y + 18])}
          closed
          fill={"#00000066"}
          opacity={0.5}
        />
      ) : null}
      <Line points={pts} closed fill={opts.fill} />
      <Line points={rim} closed fill={"#fff6e4"} opacity={0.14} />
      {hairs.map((h) => (
        <Rect
          key={h.key}
          width={h.len}
          height={1.1}
          fill={opts.fill}
          opacity={0.85}
          x={h.x}
          y={h.y}
          rotation={h.rot}
        />
      ))}
    </>
  );
}

export function PaperGrain(opts: { width: number; height: number; seed?: number }) {
  const w = opts.width;
  const h = opts.height;
  const seed = opts.seed ?? 3;
  const fibers = Array.from({ length: 18 }, (_, i) => {
    const x = (hash01(seed + i) - 0.5) * w * 0.88;
    const y = (hash01(seed + i + 20) - 0.5) * h * 0.88;
    const len = 16 + hash01(seed + i + 40) * 62;
    const rot = (hash01(seed + i + 60) - 0.5) * 55;
    return { x, y, len, rot, key: `g-${i}` };
  });
  return (
    <>
      <Rect width={w} height={h} fill={"#c9b48a"} opacity={0.08} />
      {fibers.map((f) => (
        <Rect
          key={f.key}
          width={f.len}
          height={1.15}
          fill={"#3a2c18"}
          opacity={0.065}
          x={f.x}
          y={f.y}
          rotation={f.rot}
        />
      ))}
    </>
  );
}

export function PaperCrease(opts: { width: number; y?: number; opacity?: number }) {
  return (
    <Rect
      width={opts.width * 0.86}
      height={2}
      fill={"#000000"}
      opacity={opts.opacity ?? 0.08}
      y={opts.y ?? 0}
    />
  );
}

export function ColumnRules(opts: {
  width: number;
  height: number;
  rows?: number;
  color?: string;
}) {
  const rows = opts.rows ?? 8;
  const gap = opts.height / (rows + 1);
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <Rect
          key={`rule-${i}`}
          width={opts.width}
          height={1}
          fill={opts.color ?? "#c4b49a"}
          opacity={0.55}
          y={-opts.height / 2 + gap * (i + 1)}
        />
      ))}
    </>
  );
}

export function DeskVignette() {
  return (
    <>
      <Rect width={1600} height={980} fill={"#070706"} />
      <Rect width={980} height={620} fill={"#16130e"} opacity={0.55} />
      <Rect width={1400} height={900} fill={"#000000"} opacity={0.28} />
    </>
  );
}

/** Paper-colored peel with a jagged leading edge — not a rectangular wipe. */
export function TornPeel(opts: {
  height: number;
  extend?: number;
  roughness?: number;
  seed?: number;
  fill?: string;
}) {
  const height = opts.height;
  const extend = opts.extend ?? 1100;
  const roughness = opts.roughness ?? 22;
  const seed = opts.seed ?? 11;
  const fill = opts.fill ?? "#e8d8b4";
  const pts = tornPeelOutline(height, extend, roughness, seed);
  const rip = tornRipEdge(height, roughness, seed);
  return (
    <>
      <Line points={pts} closed fill={fill} />
      <Line points={rip} stroke={"#c4b089"} lineWidth={10} lineCap={"round"} />
      <Line points={rip} stroke={"#2a2418"} lineWidth={4} opacity={0.45} x={6} />
    </>
  );
}
