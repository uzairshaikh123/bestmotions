import type { AssetDefinition, AssetField } from "./types";

const timingFields: AssetField[] = [
  { key: "startDelay", label: "Start delay (sec)", type: "number", step: 0.01, min: 0 },
  { key: "stepDelay", label: "Step delay (sec)", type: "number", step: 0.01, min: 0 },
  { key: "connectDelay", label: "Connector delay (sec)", type: "number", step: 0.01, min: 0 },
  { key: "lineDuration", label: "Type time (sec)", type: "number", step: 0.01, min: 0.05 },
  { key: "revealDuration", label: "Reveal time (sec)", type: "number", step: 0.01, min: 0.08 },
  { key: "itemDelays", label: "Per-item extra delays", type: "text", placeholder: "0, 0.3" },
  { key: "sound", label: "Sound", type: "select", options: [{ label: "On (CC0)", value: "on" }, { label: "Off", value: "off" }] },
];

const timingDefaults = {
  startDelay: 0,
  stepDelay: 0.1,
  connectDelay: 0.08,
  lineDuration: 1.5,
  revealDuration: 0.36,
  itemDelays: "",
  sound: "on",
};

const base = {
  fps: 30,
  width: 1280,
  height: 720,
  category: "search" as const,
  isNew: true,
};

function make(partial: {
  id: string;
  name: string;
  description: string;
  accent: string;
  template: string;
  fields: AssetField[];
  defaults: Record<string, string | number>;
  durationInFrames?: number;
}): AssetDefinition {
  return {
    ...base,
    durationInFrames: partial.durationInFrames ?? 180,
    id: partial.id,
    name: partial.name,
    description: partial.description,
    accent: partial.accent,
    template: partial.template,
    fields: [...partial.fields, ...timingFields],
    defaults: { ...partial.defaults, ...timingDefaults },
  };
}

/** Uppbeat-style search bar title pack + moved Google search templates. */
export const SEARCH_ASSETS: AssetDefinition[] = [
  make({
    id: "search-bar-soft",
    name: "Soft search title",
    description:
      "Neumorph search pill: query types in with a measured caret, then the search icon pops — clean title opener.",
    accent: "#3b82f6",
    template: "search-bar-soft",
    durationInFrames: 170,
    fields: [
      { key: "query", label: "Search title", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
      { key: "barFill", label: "Bar fill", type: "color" },
    ],
    defaults: {
      query: "Search Bar Titles",
      accent: "#3b82f6",
      bg: "#e8eef6",
      barFill: "#f4f7fb",
      lineDuration: 1.4,
    },
  }),
  make({
    id: "search-bar-dark",
    name: "Dark glass search",
    description: "Dark glassmorphic search field with typing caret and accent search button.",
    accent: "#60a5fa",
    template: "search-bar-dark",
    durationInFrames: 170,
    fields: [
      { key: "query", label: "Search title", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      query: "Find your next motion",
      accent: "#60a5fa",
      bg: "#07090e",
      lineDuration: 1.5,
    },
  }),
  make({
    id: "search-bar-underline",
    name: "Underline search title",
    description: "Minimal typewriter title with search icon and underline draw — great for explainers.",
    accent: "#111827",
    template: "search-bar-underline",
    durationInFrames: 180,
    fields: [
      { key: "query", label: "Title / query", type: "text" },
      { key: "accent", label: "Ink", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      query: "What is a cold open?",
      accent: "#111827",
      bg: "#fafafa",
      lineDuration: 1.6,
    },
  }),
  make({
    id: "search-bar-hero",
    name: "Hero search title",
    description: "Oversized search bar as a title card — type a bold phrase, blink caret, hold.",
    accent: "#2563eb",
    template: "search-bar-hero",
    durationInFrames: 190,
    fields: [
      { key: "query", label: "Hero title", type: "text" },
      { key: "tag", label: "Tag line", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      query: "SEARCH BAR TITLES",
      tag: "TYPE · REVEAL · CUT",
      accent: "#2563eb",
      bg: "#0b1220",
      lineDuration: 1.7,
    },
  }),
  make({
    id: "search-bar-results",
    name: "Search + results",
    description: "Type a query, then result rows cascade in — Uppbeat search-titles energy.",
    accent: "#4285f4",
    template: "search-bar-results",
    durationInFrames: 220,
    fields: [
      { key: "query", label: "Search query", type: "text" },
      { key: "result1", label: "Result 1", type: "text" },
      { key: "result2", label: "Result 2", type: "text" },
      { key: "result3", label: "Result 3", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      query: "motion graphics titles",
      result1: "Search Bar Titles Pack",
      result2: "Clean Typing Intro",
      result3: "UI Search Reveal",
      accent: "#4285f4",
      bg: "#f8f9fa",
      lineDuration: 1.4,
      stepDelay: 0.1,
    },
  }),
  make({
    id: "search-bar-pulse",
    name: "Search enter pulse",
    description: "Type into a dark field, then the search button pulses with a ripple — submit feel.",
    accent: "#22c55e",
    template: "search-bar-pulse",
    durationInFrames: 180,
    fields: [
      { key: "query", label: "Search query", type: "text" },
      { key: "accent", label: "Button accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      query: "best motion templates",
      accent: "#22c55e",
      bg: "#0c1118",
      lineDuration: 1.5,
    },
  }),
  make({
    id: "search-bar-pill",
    name: "Pill search title",
    description: "Centered soft pill search bar — types a title and holds with a blinking caret.",
    accent: "#0ea5e9",
    template: "search-bar-pill",
    durationInFrames: 170,
    fields: [
      { key: "query", label: "Search title", type: "text" },
      { key: "accent", label: "Caret accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      query: "Animated Search Titles",
      accent: "#0ea5e9",
      bg: "#ffffff",
      lineDuration: 1.45,
    },
  }),
];
