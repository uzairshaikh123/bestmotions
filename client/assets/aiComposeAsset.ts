import type { AssetDefinition, AssetField } from "./types";
import {
  AI_COMPOSE_ASSET_ID,
  AI_COMPOSE_TEMPLATE,
  defaultComposition,
  stringifyComposition,
} from "../../shared/ai/compose";

const timingFields: AssetField[] = [
  { key: "startDelay", label: "Start delay (sec)", type: "number", hint: "Wait before the first beat", step: 0.01, min: 0 },
  { key: "stepDelay", label: "Step delay (sec)", type: "number", hint: "Pause between items", step: 0.01, min: 0 },
  { key: "connectDelay", label: "Connector delay (sec)", type: "number", hint: "Wait before connectors", step: 0.01, min: 0 },
  { key: "lineDuration", label: "Line draw time (sec)", type: "number", hint: "Bar / line animation length", step: 0.01, min: 0.05 },
  { key: "revealDuration", label: "Reveal time (sec)", type: "number", hint: "How long each beat fades in", step: 0.01, min: 0.08 },
  { key: "itemDelays", label: "Per-item extra delays", type: "text", hint: "Optional extra pause before each item", placeholder: "0, 0.4, 0.1" },
  { key: "sound", label: "Sound", type: "select", options: [{ label: "On (CC0)", value: "on" }, { label: "Off", value: "off" }] },
];

const timingDefaults = {
  startDelay: 0.1,
  stepDelay: 0.12,
  connectDelay: 0.08,
  lineDuration: 0.55,
  revealDuration: 0.35,
  itemDelays: "",
  sound: "on",
};

const seed = defaultComposition();

/** Generative / freeform AI motion — not limited to fixed pack layouts. */
export const AI_COMPOSE_ASSET: AssetDefinition = {
  id: AI_COMPOSE_ASSET_ID,
  name: "AI Compose (custom)",
  description:
    "Invent any motion graphic from a prompt — title cards, stats, bars, timelines, cards, quotes, comparisons. Fully editable JSON beats.",
  category: "ui",
  template: AI_COMPOSE_TEMPLATE,
  // Catalog estimate only — live duration comes from composeJson beats.
  durationInFrames: 900,
  fps: 30,
  width: 1280,
  height: 720,
  accent: seed.accent,
  fields: [
    { key: "title", label: "Working title", type: "text", hint: "Shown in the editor; also used as a fallback title beat" },
    { key: "subtitle", label: "Working subtitle", type: "text" },
    { key: "accent", label: "Accent", type: "color" },
    { key: "bg", label: "Background", type: "color" },
    { key: "ink", label: "Text color", type: "color" },
    { key: "muted", label: "Muted text", type: "text", hint: "CSS color for secondary copy" },
    {
      key: "composeJson",
      label: "Composition (editable)",
      type: "textarea",
      hint: "JSON beats: title, bullets, stats, bars, cards, timeline, quote, compare, outro. Edit freely after generation.",
    },
    ...timingFields,
  ],
  defaults: {
    title: "Custom AI motion",
    subtitle: "Generated layout — edit any field",
    accent: seed.accent,
    bg: seed.bg,
    ink: seed.ink || "#f4f0e6",
    muted: seed.muted || "rgba(244,240,230,0.62)",
    composeJson: stringifyComposition(seed),
    ...timingDefaults,
  },
};
