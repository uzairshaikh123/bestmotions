import type { AssetDefinition, AssetField } from "./types";

const base = {
  fps: 30,
  width: 1280,
  height: 720,
  durationInFrames: 140,
};

const timingFields: AssetField[] = [
  { key: "startDelay", label: "Start delay (sec)", type: "number", step: 0.01, min: 0 },
  { key: "stepDelay", label: "Step delay (sec)", type: "number", step: 0.01, min: 0 },
  { key: "connectDelay", label: "Connector delay (sec)", type: "number", step: 0.01, min: 0 },
  { key: "lineDuration", label: "Mark draw time (sec)", type: "number", step: 0.01, min: 0.05 },
  { key: "revealDuration", label: "Reveal time (sec)", type: "number", step: 0.01, min: 0.08 },
  { key: "itemDelays", label: "Per-item extra delays", type: "text", placeholder: "0, 0.4" },
  { key: "sound", label: "Sound", type: "select", options: [{ label: "On (CC0)", value: "on" }, { label: "Off", value: "off" }] },
];

const timingDefaults = {
  startDelay: 0,
  stepDelay: 0.12,
  connectDelay: 0.1,
  lineDuration: 0.55,
  revealDuration: 0.4,
  itemDelays: "",
  sound: "on",
};

const MARK_STYLE = [
  { label: "Highlighter", value: "highlight" },
  { label: "Underline", value: "underline" },
  { label: "Both", value: "both" },
];

const sharedFields: AssetField[] = [
  { key: "masthead", label: "Masthead", type: "text" },
  { key: "date", label: "Date line", type: "text" },
  { key: "headline", label: "Headline", type: "textarea" },
  { key: "highlight", label: "Phrase to mark", type: "text", hint: "Must appear inside the headline" },
  { key: "body", label: "Body copy", type: "textarea" },
  { key: "paperColor", label: "Newspaper color", type: "color" },
  { key: "ink", label: "Ink color", type: "color" },
  { key: "mastheadColor", label: "Masthead color", type: "color" },
  { key: "markerColor", label: "Highlighter color", type: "color" },
  { key: "underlineColor", label: "Underline color", type: "color" },
  {
    key: "markStyle",
    label: "Mark style",
    type: "select",
    options: MARK_STYLE,
    hint: "Highlighter wash, underline, or both",
  },
  { key: "tilt", label: "Settle tilt (degrees)", type: "number", step: 0.5 },
  { key: "flipAmount", label: "3D foreshorten", type: "number", hint: "0 = flat, higher = more edge-on feel", step: 0.01, min: 0, max: 0.4 },
  { key: "deskColor", label: "Desk / background", type: "color" },
];

const sharedDefaults: Record<string, string | number> = {
  masthead: "THE DAILY CHRONICLE",
  date: "Saturday, September 5, 2026",
  headline: "A defining moment for the nation",
  highlight: "defining moment",
  body: "In a landmark development, leaders gathered as history turned a new page. Analysts say the decision will reshape the decade ahead.",
  paperColor: "#f4ead8",
  ink: "#171310",
  mastheadColor: "#8b1e1e",
  markerColor: "#FAFF00",
  underlineColor: "#e63946",
  markStyle: "highlight",
  tilt: -4,
  flipAmount: 0.12,
  deskColor: "#0a0c12",
  ...timingDefaults,
};

function news3d(
  id: string,
  name: string,
  description: string,
  accent: string,
  extraFields: AssetField[] = [],
  extraDefaults: Record<string, string | number> = {},
): AssetDefinition {
  return {
    ...base,
    id,
    name,
    description,
    category: "newspaper",
    accent,
    template: id,
    fields: [...sharedFields, ...extraFields, ...timingFields],
    defaults: { ...sharedDefaults, ...extraDefaults },
  };
}

export const NEWS_3D_ASSETS: AssetDefinition[] = [
  news3d(
    "news-3d-flip",
    "3D page flip (clean)",
    "Clean rectangular newspaper flips from edge-on onto the desk — no tears. Customize paper color, then highlighter or underline.",
    "#f5d76e",
    [],
    { markStyle: "both", paperColor: "#f7efe0" },
  ),
  news3d(
    "news-3d-tilt-rotate",
    "3D tilt rotate",
    "Paper rocks in fake 3D (scale foreshortening + rotation). Change newspaper color, tilt, and mark style.",
    "#7ec8e3",
    [],
    { markStyle: "underline", underlineColor: "#1d6fd8", tilt: -6, flipAmount: 0.18 },
  ),
  news3d(
    "news-3d-spin-desk",
    "3D spin onto desk",
    "Clean sheet spins and lands on the desk, then paints the phrase. Full paper / ink / marker colors.",
    "#e07040",
    [],
    { paperColor: "#efe4cc", markStyle: "highlight", markerColor: "#ffe566" },
  ),
  news3d(
    "news-3d-card-float",
    "3D floating plate",
    "Floating clean newspaper card with a gentle perspective rock, then highlight or underline.",
    "#b090e0",
    [],
    { paperColor: "#f2e8f4", markStyle: "both", markerColor: "#e8b4ff" },
  ),
  news3d(
    "news-3d-open-fold",
    "3D center unfold",
    "Sheet opens from a thin center fold (no rip). Color the paper and choose highlighter / underline.",
    "#5cbf6a",
    [],
    { paperColor: "#eef6ea", markStyle: "highlight" },
  ),
  news3d(
    "news-3d-stack-rotate",
    "3D stack rotate",
    "Clean stack underneath; top sheet rotates into place in 3D. Tint the top and under sheets.",
    "#c9893d",
    [
      { key: "paperColorAlt", label: "Under sheet color", type: "color" },
      { key: "paperColorAlt2", label: "Bottom sheet color", type: "color" },
    ],
    {
      paperColor: "#f4ead8",
      paperColorAlt: "#ebe0cc",
      paperColorAlt2: "#e4d8c0",
      markStyle: "both",
    },
  ),
  news3d(
    "news-3d-underline-sweep",
    "Clean underline sweep",
    "No tears — sharp sheet on desk. Underline (or highlighter) sweeps the phrase. Recolor the paper freely.",
    "#e63946",
    [],
    { markStyle: "underline", underlineColor: "#e63946", paperColor: "#faf6ee" },
  ),
  news3d(
    "news-3d-marker-pass",
    "Clean marker pass",
    "Ken-Burns push on a clean sheet, then a highlighter pass. Paper, ink, and marker colors are all editable.",
    "#FAFF00",
    [],
    { markStyle: "highlight", markerColor: "#FAFF00", paperColor: "#f1e6d0" },
  ),
  news3d(
    "news-3d-hero-plate",
    "3D hero front plate",
    "Large clean front page settles from depth into place, then marks the headline phrase.",
    "#8b1e1e",
    [],
    { markStyle: "both", paperColor: "#f8f0e2", tilt: -2 },
  ),
  news3d(
    "news-3d-side-turn",
    "3D side page turn",
    "Page turns in from the side over a clean under-sheet — rotatable 3D feel, no tears.",
    "#4ec4ff",
    [{ key: "paperColorAlt", label: "Back page color", type: "color" }],
    {
      paperColor: "#f4ead8",
      paperColorAlt: "#e8dcc8",
      markStyle: "underline",
      underlineColor: "#0d6efd",
    },
  ),
];
