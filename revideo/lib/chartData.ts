export const CHART_PALETTE = [
  "#d8a11a",
  "#5ce1ff",
  "#7ddea2",
  "#ff8b7a",
  "#c089ff",
  "#f0d35a",
  "#ff9f43",
  "#54a0ff",
];

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export function isHexColor(value: string) {
  return HEX.test(String(value || "").trim());
}

export function defaultSwatch(index: number, accent = "") {
  if (index === 0 && isHexColor(accent)) return accent.trim();
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

function cellsOf(line: string) {
  return line.split("|").map((part) => part.trim());
}

function popHex(cells: string[]): string | undefined {
  const last = cells[cells.length - 1];
  if (last && isHexColor(last)) {
    cells.pop();
    return last;
  }
  return undefined;
}

export type Pair = { label: string; value: number; color: string };
export type Dual = {
  label: string;
  a: number;
  b: number;
  colorA: string;
  colorB: string;
};
export type Candle = {
  label: string;
  o: number;
  h: number;
  l: number;
  c: number;
  color: string;
};

export function parsePairs(
  raw: string,
  fallback: string,
  accent = "#d8a11a",
): Pair[] {
  return (raw || fallback)
    .trim()
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const cells = cellsOf(line);
      const color = popHex(cells);
      const [label = "", value = "0"] = cells;
      return {
        label,
        value: Number(value) || 0,
        color: color || defaultSwatch(i, accent),
      };
    })
    .slice(0, 8);
}

export function parseDual(
  raw: string,
  fallback: string,
  accent = "#d8a11a",
): Dual[] {
  return (raw || fallback)
    .trim()
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const cells = cellsOf(line);
      const colorB = popHex(cells);
      const colorA = popHex(cells);
      const [label = "", a = "0", b = "0"] = cells;
      return {
        label,
        a: Number(a) || 0,
        b: Number(b) || 0,
        colorA: colorA || defaultSwatch(i, accent),
        colorB: colorB || defaultSwatch(i + 1),
      };
    })
    .slice(0, 6);
}

export function parseCandles(raw: string, fallback: string): Candle[] {
  return (raw || fallback)
    .trim()
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const cells = cellsOf(line);
      const color = popHex(cells);
      const [label = "", o = "10", h = "14", l = "8", c = "12"] = cells;
      const open = Number(o) || 0;
      const close = Number(c) || 0;
      return {
        label,
        o: open,
        h: Number(h) || 0,
        l: Number(l) || 0,
        c: close,
        color: color || (close >= open ? "#7ddea2" : "#ff8b7a"),
      };
    })
    .slice(0, 8);
}

export function palette(
  accent: string,
  rows: { color?: string; colorA?: string }[] = [],
) {
  const base = [accent, ...CHART_PALETTE.filter((c) => c !== accent)];
  if (!rows.length) return base;
  return rows.map((row, i) => row.color || row.colorA || base[i % base.length]);
}

export function isTransparentBg(value: unknown) {
  const raw = String(value ?? "").trim().toLowerCase();
  return raw === "on" || raw === "true" || raw === "transparent" || raw === "none";
}

export function fillScene(view: { fill: (color: string) => void }, bg: string) {
  if (isTransparentBg(bg)) {
    view.fill("rgba(0,0,0,0)");
    return;
  }
  view.fill(bg);
}
