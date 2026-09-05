import type { AssetField, AssetFieldColumn } from "./types";

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

const NUMERIC_COL =
  /^(value|open|high|low|close|seriesa|seriesb|percent|actual|target|a|b)$/i;
const COLOR_COL = /color/i;
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export const TIMING_FIELD_KEYS = new Set([
  "startDelay",
  "stepDelay",
  "connectDelay",
  "lineDuration",
  "revealDuration",
  "itemDelays",
  "sound",
]);

export function isHexColor(value: string) {
  return HEX.test(String(value || "").trim());
}

export function columnsForField(field: AssetField): AssetFieldColumn[] | null {
  if (field.columns && field.columns.length > 1) {
    return field.columns;
  }
  const hint = field.hint || "";
  if (!hint.includes("|")) return null;
  const match = hint.match(
    /([A-Za-z][A-Za-z0-9 /.+-]*)(?:\|[A-Za-z][A-Za-z0-9 /.+-]*)+/,
  );
  if (!match) return null;
  const labels = match[0]
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
  if (labels.length < 2) return null;
  const columns = labels.map((label) => ({
    label,
    kind: COLOR_COL.test(label)
      ? ("color" as const)
      : NUMERIC_COL.test(label.replace(/\s+/g, ""))
        ? ("number" as const)
        : ("text" as const),
  }));
  if (!columns.some((col) => col.kind === "color")) {
    columns.push({ label: "Color", kind: "color" });
  }
  return columns;
}

export function parsePipeRows(
  raw: string,
  columns: AssetFieldColumn[],
): string[][] {
  const columnCount = columns.length;
  const lines = String(raw ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return [
      columns.map((col, i) =>
        col.kind === "color" ? CHART_PALETTE[i % CHART_PALETTE.length] : "",
      ),
    ];
  }
  return lines.map((line, rowIndex) => {
    const cells = line.split("|").map((cell) => cell.trim());
    while (cells.length < columnCount) cells.push("");
    const sliced = cells.slice(0, columnCount);
    columns.forEach((col, colIndex) => {
      if (col.kind === "color" && !isHexColor(sliced[colIndex] || "")) {
        sliced[colIndex] = CHART_PALETTE[rowIndex % CHART_PALETTE.length];
      }
    });
    return sliced;
  });
}

export function serializePipeRows(rows: string[][]): string {
  return rows
    .map((row) => row.map((cell) => String(cell ?? "").trim()).join("|"))
    .filter((line) => line.replace(/\|/g, "").trim().length > 0)
    .join("\n");
}

export function emptyPipeRow(
  columns: AssetFieldColumn[],
  index: number,
): string[] {
  return columns.map((col) =>
    col.kind === "color" ? CHART_PALETTE[index % CHART_PALETTE.length] : "",
  );
}

