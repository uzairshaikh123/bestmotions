import type { AssetDefinition, AssetField } from "./types";

const base = {
  fps: 30,
  width: 1280,
  height: 720,
  durationInFrames: 140,
};

const timingFields: AssetField[] = [
  { key: "startDelay", label: "Start delay (sec)", type: "number", hint: "Wait before the first animation", step: 0.01, min: 0 },
  { key: "stepDelay", label: "Step delay (sec)", type: "number", hint: "Pause between each event, node, chip, or bar", step: 0.01, min: 0 },
  { key: "connectDelay", label: "Connector delay (sec)", type: "number", hint: "Wait before drawing the line or link to the next item", step: 0.01, min: 0 },
  { key: "lineDuration", label: "Line draw time (sec)", type: "number", hint: "How long connectors, rails, spokes, and wipes take to draw", step: 0.01, min: 0.05 },
  { key: "revealDuration", label: "Reveal time (sec)", type: "number", hint: "How long each node, card, chip, or label takes to pop in", step: 0.01, min: 0.08 },
  { key: "itemDelays", label: "Per-item extra delays", type: "text", hint: "Optional extra pause before each item, comma-separated seconds", placeholder: "0, 0.4, 0.1" },
  { key: "sound", label: "Sound", type: "select", options: [{ label: "On (CC0)", value: "on" }, { label: "Off", value: "off" }] },
];

const timingDefaults = {
  startDelay: 0,
  stepDelay: 0.12,
  connectDelay: 0.08,
  lineDuration: 0.55,
  revealDuration: 0.32,
  itemDelays: "",
  sound: "on",
};

const pairHint = "One per line: Label|Value";
const dualHint = "One per line: Label|SeriesA|SeriesB";
const ohlcHint = "One per line: Label|Open|High|Low|Close";

export const CHART_SUBCATEGORIES: { id: string; label: string }[] = [
  { id: "all", label: "All charts" },
  { id: "pie", label: "Pie" },
  { id: "bar", label: "Bar" },
  { id: "dotted", label: "Dotted" },
  { id: "stock", label: "Stock" },
  { id: "revenue", label: "Revenue" },
];

function chart(
  sub: string,
  id: string,
  name: string,
  description: string,
  accent: string,
  extraFields: AssetField[],
  defaults: Record<string, string | number>,
): AssetDefinition {
  return {
    ...base,
    id,
    name,
    description,
    category: "charts",
    subcategory: sub,
    accent,
    template: id,
    fields: [
      { key: "title", label: "Title", type: "text" },
      ...extraFields,
      { key: "accent", label: "Accent color", type: "color" },
      { key: "bg", label: "Background", type: "color" },
      ...timingFields,
    ],
    defaults: {
      title: name,
      accent,
      bg: "#07080c",
      ...defaults,
      ...timingDefaults,
    },
  };
}

const pairField: AssetField = { key: "data", label: "Data", type: "textarea", hint: pairHint };
const dualField: AssetField = { key: "data", label: "Data", type: "textarea", hint: dualHint };
const ohlcField: AssetField = { key: "data", label: "Data", type: "textarea", hint: ohlcHint };

const pairData = "Health|32\nEducation|24\nDefense|18\nOther|26";
const barData = "2019|42\n2020|55\n2021|61\n2022|48\n2023|70";
const dualData = "Q1|40|28\nQ2|48|30\nQ3|55|33\nQ4|52|36";
const ohlcData = "Mon|100|112|96|108\nTue|108|118|104|110\nWed|110|122|101|116\nThu|116|124|108|109\nFri|109|119|102|118";

export const CHART_ASSETS: AssetDefinition[] = [
  chart("pie", "d3-pie", "Pie slices", "Classic pie — each slice draws in sequence.", "#d8a11a", [pairField], { data: pairData }),
  chart("pie", "d3-donut", "Donut ring", "Donut pie with a hollow center.", "#5ce1ff", [pairField], { data: pairData, title: "Share of total" }),
  chart("pie", "d3-gauge", "Progress gauge", "Single KPI arc gauge.", "#d8a11a", [{ key: "label", label: "Caption", type: "text" }, { key: "value", label: "Percent", type: "number" }], { title: "Completion", label: "Target met", value: 72 }),
  chart("pie", "chart-pie-explode", "Exploded pie", "Key slice offsets from the ring.", "#ff8b7a", [pairField], { data: pairData, title: "Lead slice" }),
  chart("pie", "chart-pie-legend", "Pie + legend", "Pie on the left, legend rows cascade in.", "#c089ff", [pairField], { data: pairData, title: "Budget mix" }),
  chart("pie", "chart-pie-half", "Semi-circle pie", "Half-pie along the baseline.", "#f0d35a", [pairField], { data: pairData, title: "Half share" }),
  chart("pie", "chart-pie-nested", "Nested rings", "Outer and inner rings compare two series.", "#5ce1ff", [dualField], { data: dualData, title: "This year vs last" }),
  chart("pie", "chart-pie-kpi", "Donut KPI", "Ring fills while the center percent counts up.", "#7ddea2", [{ key: "value", label: "Percent", type: "number" }], { value: 72, title: "Hit rate" }),
  chart("pie", "chart-pie-pop", "Slice pop", "Whole slices scale in from the center.", "#ff9f43", [pairField], { data: pairData, title: "Pop pie" }),
  chart("pie", "chart-pie-labels", "Callout pie", "Slices grow, then leader lines label each share.", "#54a0ff", [pairField], { data: pairData, title: "Labeled mix" }),

  chart("bar", "d3-bar", "Vertical bars", "Bars grow up from the baseline.", "#d8a11a", [pairField], { data: barData, title: "Year-over-year growth" }),
  chart("bar", "d3-hbar", "Horizontal bars", "Ranking bars grow from the left.", "#5ce1ff", [pairField], { data: pairData, title: "Category ranking" }),
  chart("bar", "d3-grouped-bar", "Grouped bars", "Two series side by side.", "#d8a11a", [{ key: "seriesA", label: "Series A", type: "text" }, { key: "seriesB", label: "Series B", type: "text" }, dualField], { data: dualData, seriesA: "Urban", seriesB: "Rural", title: "Urban vs rural" }),
  chart("bar", "d3-stacked-bar", "Stacked bars", "Stacked composition by year.", "#c089ff", [dualField], { data: dualData, title: "Stacked composition" }),
  chart("bar", "chart-bar-race", "Bar race", "Ranked bars with placing numbers.", "#ff8b7a", [pairField], { data: pairData, title: "Category race" }),
  chart("bar", "chart-bar-lollipop", "Lollipop bars", "Thin stems with popping heads.", "#7ddea2", [pairField], { data: barData, title: "Lollipop" }),
  chart("bar", "chart-bar-waterfall", "Waterfall bars", "Running total steps up and down.", "#f0d35a", [pairField], { data: "Start|40\nSales|18\nCost|-12\nTax|-6\nEnd|40", title: "Bridge" }),
  chart("bar", "chart-bar-rounded", "Pill bars", "Track + rounded fill pills.", "#54a0ff", [pairField], { data: pairData, title: "Completion bars" }),
  chart("bar", "chart-bar-diverge", "Diverging bars", "Two series grow left and right from center.", "#5ce1ff", [dualField], { data: dualData, title: "Split view" }),
  chart("bar", "chart-bar-cylinder", "Cylinder bars", "Columns with ellipse caps.", "#d8a11a", [pairField], { data: barData, title: "Volume columns" }),

  chart("dotted", "d3-line", "Dotted line", "Stroke draws along the path.", "#5ce1ff", [pairField], { data: barData, title: "Trend over time" }),
  chart("dotted", "d3-area", "Area fill", "Filled area then the outline.", "#7ddea2", [pairField], { data: barData, title: "Area trend" }),
  chart("dotted", "d3-multi-line", "Multi-line", "Two series draw one after the other.", "#ff8b7a", [dualField], { data: dualData, title: "Comparing trends" }),
  chart("dotted", "chart-dot-scatter", "Scatter dots", "Points pop onto the plot.", "#d8a11a", [pairField], { data: barData, title: "Scatter" }),
  chart("dotted", "chart-dot-bubble", "Bubble pack", "Sized bubbles around the origin.", "#c089ff", [pairField], { data: pairData, title: "Bubble mix" }),
  chart("dotted", "chart-dot-plot", "Cleveland dots", "Horizontal dot plot on rails.", "#5ce1ff", [pairField], { data: pairData, title: "Dot ranking" }),
  chart("dotted", "chart-dot-connect", "Connected dots", "Dashed path, then dots land.", "#7ddea2", [pairField], { data: barData, title: "Path + dots" }),
  chart("dotted", "chart-dot-grid", "Waffle dots", "Grid of dots fills to a count.", "#f0d35a", [{ key: "value", label: "Filled percent", type: "number" }], { value: 37, title: "Unit grid" }),
  chart("dotted", "chart-dot-radar", "Radar dots", "Polygon + vertex dots.", "#ff9f43", [pairField], { data: pairData, title: "Radar" }),
  chart("dotted", "chart-dot-spark", "Spark dots", "Sparkline with endpoint value.", "#54a0ff", [pairField], { data: barData, title: "Spark" }),

  chart("stock", "chart-stock-candle", "Candlesticks", "Wicks then bodies for each session.", "#7ddea2", [ohlcField], { data: ohlcData, title: "Daily candles" }),
  chart("stock", "chart-stock-ohlc", "OHLC ticks", "Open/close ticks on a high-low stem.", "#5ce1ff", [ohlcField], { data: ohlcData, title: "OHLC" }),
  chart("stock", "chart-stock-area", "Price mountain", "Close line with a filled mountain.", "#d8a11a", [ohlcField], { data: ohlcData, title: "Price area" }),
  chart("stock", "chart-stock-volume", "Price + volume", "Line on top, session volume below.", "#c089ff", [ohlcField], { data: ohlcData, title: "Volume" }),
  chart("stock", "chart-stock-compare", "Two tickers", "Overlay two close series.", "#ff8b7a", [{ key: "seriesA", label: "Ticker A", type: "text" }, { key: "seriesB", label: "Ticker B", type: "text" }, dualField], { data: dualData, seriesA: "AAPL", seriesB: "MSFT", title: "Head to head" }),
  chart("stock", "chart-stock-range", "High-low band", "Range envelope around close.", "#7ddea2", [ohlcField], { data: ohlcData, title: "Range" }),
  chart("stock", "chart-stock-spark", "Ticker spark", "Big last price plus a mini spark.", "#54a0ff", [{ key: "ticker", label: "Ticker", type: "text" }, ohlcField], { data: ohlcData, ticker: "BEST", title: "Quote" }),
  chart("stock", "chart-stock-drawdown", "Drawdown", "Underwater chart from peak.", "#ff8b7a", [ohlcField], { data: ohlcData, title: "Drawdown" }),
  chart("stock", "chart-stock-fill", "Last-price line", "Close path with a last-price guide.", "#5ce1ff", [ohlcField], { data: ohlcData, title: "Last print" }),
  chart("stock", "chart-stock-tape", "Ticker tape", "Quotes strip slides across.", "#d8a11a", [{ key: "quotes", label: "Tape text", type: "textarea" }], { quotes: "BEST +1.2%   NVDA +0.8%   AAPL -0.4%   MSFT +0.3%", title: "Tape" }),

  chart("revenue", "stat-counter", "Stat counter", "Big number counts up, then the note highlights.", "#d8a11a", [{ key: "label", label: "Label", type: "text" }, { key: "value", label: "Target number", type: "number" }, { key: "suffix", label: "Suffix", type: "text" }, { key: "note", label: "Note", type: "textarea" }, { key: "highlight", label: "Highlight phrase", type: "text" }, { key: "markerColor", label: "Highlight color", type: "color" }], { title: "People affected", label: "People affected", value: 75, suffix: "%", note: "Across major cities in 2024", highlight: "2024", markerColor: "#FAFF00" }),
  chart("revenue", "chart-rev-waterfall", "Revenue bridge", "Waterfall from start to end.", "#f0d35a", [pairField], { data: "Start|40\nSales|18\nCost|-12\nTax|-6\nEnd|40", title: "Revenue bridge" }),
  chart("revenue", "chart-rev-kpi", "Revenue KPI", "Large ARR-style count-up.", "#7ddea2", [{ key: "value", label: "Number", type: "number" }, { key: "suffix", label: "Suffix", type: "text" }, { key: "note", label: "Caption", type: "text" }], { value: 128, suffix: "M", note: "Annual recurring revenue", title: "ARR" }),
  chart("revenue", "chart-rev-funnel", "Revenue funnel", "Stages narrow as they convert.", "#ff9f43", [pairField], { data: "Leads|100\nQualified|62\nWon|28", title: "Pipeline" }),
  chart("revenue", "chart-rev-yoy", "YoY columns", "This year vs last, grouped.", "#5ce1ff", [dualField], { data: dualData, title: "Year on year" }),
  chart("revenue", "chart-rev-mix", "Mix bars", "100% stacked mix by period.", "#c089ff", [dualField], { data: dualData, title: "Revenue mix" }),
  chart("revenue", "chart-rev-cards", "KPI cards", "Three metric tiles pop in.", "#d8a11a", [{ key: "kpi1", label: "Card 1 label", type: "text" }, { key: "val1", label: "Card 1 value", type: "text" }, { key: "kpi2", label: "Card 2 label", type: "text" }, { key: "val2", label: "Card 2 value", type: "text" }, { key: "kpi3", label: "Card 3 label", type: "text" }, { key: "val3", label: "Card 3 value", type: "text" }], { kpi1: "Revenue", val1: "$128M", kpi2: "Margin", val2: "34%", kpi3: "Growth", val3: "+18%", title: "Scorecard" }),
  chart("revenue", "chart-rev-bullet", "Bullet target", "Actual fill vs a target tick.", "#7ddea2", [{ key: "value", label: "Actual", type: "number" }, { key: "target", label: "Target", type: "number" }], { value: 72, target: 90, title: "Vs target" }),
  chart("revenue", "chart-rev-runrate", "Run-rate", "Columns plus a run-rate line.", "#54a0ff", [pairField], { data: barData, title: "Run rate" }),
  chart("revenue", "chart-rev-treemap", "Treemap blocks", "Blocks sized by share.", "#ff8b7a", [pairField], { data: pairData, title: "Share blocks" }),

  {
    ...base,
    id: "timeline",
    name: "Timeline scrub",
    description: "Three-beat timeline for policy or product history.",
    category: "charts",
    subcategory: "revenue",
    accent: "#d8a11a",
    template: "timeline",
    durationInFrames: 120,
    fields: [
      { key: "year1", label: "Year 1", type: "text" },
      { key: "event1", label: "Event 1", type: "text" },
      { key: "year2", label: "Year 2", type: "text" },
      { key: "event2", label: "Event 2", type: "text" },
      { key: "year3", label: "Year 3", type: "text" },
      { key: "event3", label: "Event 3", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
      ...timingFields,
    ],
    defaults: {
      year1: "2019",
      event1: "Policy draft",
      year2: "2022",
      event2: "Public backlash",
      year3: "2025",
      event3: "Reform passed",
      accent: "#d8a11a",
      bg: "#07080c",
      ...timingDefaults,
    },
  },
];
