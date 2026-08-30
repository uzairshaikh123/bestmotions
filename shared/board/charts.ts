import type { BoardElement, ChartKind } from "./types";

export type ChartPair = { label: string; value: number };

export const CHART_PALETTE = [
  "#7c5cfc",
  "#5ce1ff",
  "#7ddea2",
  "#ff8b7a",
  "#f0d35a",
  "#c089ff",
];

export const DEFAULT_CHART_DATA: Record<ChartKind, string> = {
  bar: "Q1|42\nQ2|65\nQ3|54\nQ4|80",
  pie: "Health|32\nEducation|24\nDefense|18\nOther|26",
  line: "Mon|22\nTue|38\nWed|30\nThu|52\nFri|70",
  stat: "75",
};

export function parseChartPairs(raw?: string, fallback = DEFAULT_CHART_DATA.bar): ChartPair[] {
  const text = (raw || fallback).trim();
  const rows = text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label = "", value = "0"] = line.split("|").map((s) => s.trim());
      const n = Number(value);
      return { label: label || value, value: Number.isFinite(n) ? n : 0 };
    })
    .slice(0, 8);
  return rows.length ? rows : parseChartPairs(fallback, "A|1");
}

export function chartProgress(el: BoardElement, timeMs: number): number {
  const delay = el.motion?.delayMs ?? 0;
  const dur = Math.max(el.motion?.durationMs && el.motion.durationMs > 0 ? el.motion.durationMs : 1400, 1);
  const t = (timeMs - delay) / dur;
  return Math.min(1, Math.max(0, t));
}

function easeOut(u: number): number {
  return 1 - (1 - u) * (1 - u);
}

export function barRects(
  width: number,
  height: number,
  pairs: ChartPair[],
  progress: number,
): { x: number; y: number; w: number; h: number; color: string; label: string }[] {
  const max = Math.max(...pairs.map((p) => p.value), 1);
  const gap = 10;
  const plotH = height - 36;
  const plotY = 8;
  const n = Math.max(pairs.length, 1);
  const w = Math.max(8, (width - gap * (n + 1)) / n);
  const u = easeOut(progress);
  return pairs.map((p, i) => {
    const h = Math.max(2, (p.value / max) * plotH * u);
    return {
      x: gap + i * (w + gap),
      y: plotY + plotH - h,
      w,
      h,
      color: CHART_PALETTE[i % CHART_PALETTE.length],
      label: p.label,
    };
  });
}

export function pieSlices(
  width: number,
  height: number,
  pairs: ChartPair[],
  progress: number,
): { rotation: number; angle: number; color: string; label: string; cx: number; cy: number; radius: number }[] {
  const total = pairs.reduce((s, p) => s + Math.max(0, p.value), 0) || 1;
  const cx = width / 2;
  const cy = height / 2 - 6;
  const radius = Math.max(16, Math.min(width, height) * 0.36);
  const u = easeOut(progress);
  let acc = -90;
  return pairs.map((p, i) => {
    const full = (Math.max(0, p.value) / total) * 360;
    const angle = full * u;
    const slice = {
      rotation: acc,
      angle,
      color: CHART_PALETTE[i % CHART_PALETTE.length],
      label: p.label,
      cx,
      cy,
      radius,
    };
    acc += full;
    return slice;
  });
}

export function linePoints(
  width: number,
  height: number,
  pairs: ChartPair[],
  progress: number,
): { x: number; y: number }[] {
  const max = Math.max(...pairs.map((p) => p.value), 1);
  const padX = 18;
  const padY = 22;
  const n = Math.max(pairs.length - 1, 1);
  const shown = Math.max(2, Math.ceil(pairs.length * Math.max(progress, 0.04)));
  return pairs.slice(0, shown).map((p, i) => ({
    x: padX + (i / n) * (width - padX * 2),
    y: height - padY - (p.value / max) * (height - padY * 2),
  }));
}

export function statNumber(el: BoardElement, progress: number): string {
  const pairs = parseChartPairs(el.chartData, DEFAULT_CHART_DATA.stat);
  const target = pairs[0]?.value ?? 0;
  const n = Math.round(target * easeOut(progress));
  const suffix = (el.content || "").replace(/^\d+/, "") || (String(el.chartData || "").includes("%") ? "%" : "");
  return `${n}${suffix}`;
}
