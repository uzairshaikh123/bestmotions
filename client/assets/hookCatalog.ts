import type { AssetDefinition, AssetField } from "./types";

const timingFields: AssetField[] = [
  { key: "startDelay", label: "Start delay (sec)", type: "number", hint: "Wait before the first animation", step: 0.01, min: 0 },
  { key: "stepDelay", label: "Step delay (sec)", type: "number", hint: "Pause between each beat", step: 0.01, min: 0 },
  { key: "connectDelay", label: "Connector delay (sec)", type: "number", hint: "Wait before secondary motion", step: 0.01, min: 0 },
  { key: "lineDuration", label: "Line draw time (sec)", type: "number", hint: "How long wipes and bars take", step: 0.01, min: 0.05 },
  { key: "revealDuration", label: "Reveal time (sec)", type: "number", hint: "How long text takes to pop in", step: 0.01, min: 0.08 },
  { key: "itemDelays", label: "Per-item extra delays", type: "text", hint: "Optional extra pauses, comma-separated seconds", placeholder: "0, 0.4, 0.1" },
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

const base = {
  fps: 30,
  width: 1280,
  height: 720,
  durationInFrames: 160,
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
    durationInFrames: partial.durationInFrames ?? 160,
    id: partial.id,
    name: partial.name,
    description: partial.description,
    category: "hooks",
    accent: partial.accent,
    template: partial.template,
    fields: [...partial.fields, ...timingFields],
    defaults: { ...partial.defaults, ...timingDefaults },
  };
}

const colors = (accent = "#e63946", bg = "#05070b"): AssetField[] => [
  { key: "accent", label: "Accent", type: "color" },
  { key: "bg", label: "Background", type: "color" },
];

/** Question & hook beats — each template has a unique motion. */
export const HOOK_ASSETS: AssetDefinition[] = [
  make({
    id: "hook-but-why",
    name: "But Why?",
    description: "Split slam — BUT left, WHY? right, giant question mark blooms.",
    accent: "#e63946",
    template: "hook-but-why",
    fields: [
      { key: "prefix", label: "Left word", type: "text" },
      { key: "question", label: "Right word", type: "text" },
      { key: "support", label: "Support line", type: "textarea" },
      ...colors(),
    ],
    defaults: {
      prefix: "BUT",
      question: "WHY?",
      support: "Why did nobody stop it?",
      accent: "#e63946",
      bg: "#05070b",
    },
  }),
  make({
    id: "hook-real-question",
    name: "The Real Question",
    description: "Typewriter question with blinking cursor, then underline.",
    accent: "#e63946",
    template: "hook-real-question",
    durationInFrames: 180,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Question", type: "textarea" },
      ...colors(),
    ],
    defaults: {
      eyebrow: "THE REAL QUESTION",
      title: "Who actually made the call?",
      accent: "#e63946",
      bg: "#07090e",
    },
  }),
  make({
    id: "hook-how-did-this-happen",
    name: "How Did This Happen?",
    description: "Scanline wipe + glitch shake on the title.",
    accent: "#e63946",
    template: "hook-how-did-this-happen",
    fields: [
      { key: "part", label: "Label", type: "text" },
      { key: "title", label: "Title", type: "textarea" },
      ...colors(),
    ],
    defaults: {
      part: "CHAPTER",
      title: "How did this happen?",
      accent: "#e63946",
      bg: "#05070b",
    },
  }),
  make({
    id: "hook-what-happened-next",
    name: "What Happened Next?",
    description: "Arrow wipe reveals the next-beat title.",
    accent: "#fb7185",
    template: "hook-what-happened-next",
    fields: [
      { key: "part", label: "Label", type: "text" },
      { key: "title", label: "Title", type: "textarea" },
      ...colors("#fb7185"),
    ],
    defaults: {
      part: "NEXT",
      title: "What happened next?",
      accent: "#fb7185",
      bg: "#05070b",
    },
  }),
  make({
    id: "hook-heres-the-problem",
    name: "Here's The Problem",
    description: "Problem cards stack in with red ✕ marks.",
    accent: "#f59e0b",
    template: "hook-heres-the-problem",
    durationInFrames: 180,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Hook", type: "textarea" },
      { key: "items", label: "Problems (one per line)", type: "textarea" },
      ...colors("#f59e0b"),
    ],
    defaults: {
      eyebrow: "HERE'S THE PROBLEM",
      title: "The numbers never added up.",
      items: "Missing pages\nConflicting timelines\nSilent witnesses",
      accent: "#f59e0b",
      bg: "#07090e",
    },
  }),
  make({
    id: "hook-shocking-truth",
    name: "The Shocking Truth",
    description: "Black redaction bars peel away to reveal the truth.",
    accent: "#e63946",
    template: "hook-shocking-truth",
    fields: [
      { key: "stamp", label: "Headline", type: "text" },
      { key: "line", label: "Support line", type: "textarea" },
      ...colors(),
    ],
    defaults: {
      stamp: "THE TRUTH",
      line: "What the cameras didn't show",
      accent: "#e63946",
      bg: "#05070b",
    },
  }),
  make({
    id: "hook-theres-a-catch",
    name: "But There's A Catch",
    description: "Fine-print zooms from tiny to full-frame catch.",
    accent: "#e63946",
    template: "hook-theres-a-catch",
    fields: [
      { key: "prefix", label: "Prefix", type: "text" },
      { key: "question", label: "Catch line", type: "textarea" },
      ...colors(),
    ],
    defaults: {
      prefix: "BUT",
      question: "There's a catch.",
      accent: "#e63946",
      bg: "#05070b",
    },
  }),
  make({
    id: "hook-biggest-mistake",
    name: "The Biggest Mistake",
    description: "Correct line gets struck through; the mistake highlights.",
    accent: "#ef4444",
    template: "hook-biggest-mistake",
    fields: [
      { key: "correct", label: "Struck-through line", type: "text" },
      { key: "line", label: "Mistake line", type: "textarea" },
      { key: "stamp", label: "Badge", type: "text" },
      ...colors("#ef4444"),
    ],
    defaults: {
      correct: "They waited for confirmation",
      line: "They moved before anyone checked",
      stamp: "MISTAKE",
      accent: "#ef4444",
      bg: "#05070b",
    },
  }),
  make({
    id: "hook-nobody-expected",
    name: "Nobody Expected This",
    description: "3-2-1 countdown, then UNEXPECTED slam.",
    accent: "#a855f7",
    template: "hook-nobody-expected",
    durationInFrames: 170,
    fields: [
      { key: "stamp", label: "Stamp", type: "text" },
      { key: "line", label: "Support line", type: "textarea" },
      ...colors("#a855f7", "#07060c"),
    ],
    defaults: {
      stamp: "UNEXPECTED",
      line: "Nobody saw this coming",
      accent: "#a855f7",
      bg: "#07060c",
    },
  }),
  make({
    id: "hook-what-they-didnt-know",
    name: "What They Didn't Know",
    description: "Fog lifts off the secret line.",
    accent: "#38bdf8",
    template: "hook-what-they-didnt-know",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Hook", type: "textarea" },
      ...colors("#38bdf8", "#05080d"),
    ],
    defaults: {
      eyebrow: "WHAT THEY DIDN'T KNOW",
      title: "The file was never meant to surface.",
      accent: "#38bdf8",
      bg: "#05080d",
    },
  }),
  make({
    id: "hook-hidden-problem",
    name: "The Hidden Problem",
    description: "Magnifier lens zooms tiny buried text into focus.",
    accent: "#f59e0b",
    template: "hook-hidden-problem",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Hook", type: "textarea" },
      ...colors("#f59e0b"),
    ],
    defaults: {
      eyebrow: "THE HIDDEN PROBLEM",
      title: "It was buried in the footnotes.",
      accent: "#f59e0b",
      bg: "#07090e",
    },
  }),
  make({
    id: "hook-everything-changed",
    name: "Everything Changed When",
    description: "Before / After split with a dividing wipe.",
    accent: "#e63946",
    template: "hook-everything-changed",
    fields: [
      { key: "before", label: "Before label", type: "text" },
      { key: "after", label: "After label", type: "text" },
      { key: "title", label: "Title", type: "textarea" },
      ...colors(),
    ],
    defaults: {
      before: "BEFORE",
      after: "AFTER",
      title: "Everything changed when…",
      accent: "#e63946",
      bg: "#05070b",
    },
  }),
  make({
    id: "hook-and-then",
    name: "And Then…",
    description: "Ellipsis builds beat-by-beat, then hard-cuts to the line.",
    accent: "#fb7185",
    template: "hook-and-then",
    fields: [
      { key: "prefix", label: "Prefix", type: "text" },
      { key: "question", label: "Line", type: "textarea" },
      ...colors("#fb7185"),
    ],
    defaults: {
      prefix: "AND THEN",
      question: "…everything went quiet.",
      accent: "#fb7185",
      bg: "#05070b",
    },
  }),
  make({
    id: "hook-the-answer-is",
    name: "The Answer Is",
    description: "Question fades out; answer slams in.",
    accent: "#22c55e",
    template: "hook-the-answer-is",
    fields: [
      { key: "ask", label: "Question first", type: "textarea" },
      { key: "prefix", label: "Answer label", type: "text" },
      { key: "question", label: "Answer", type: "textarea" },
      ...colors("#22c55e", "#050a08"),
    ],
    defaults: {
      ask: "So what was it really about?",
      prefix: "THE ANSWER IS",
      question: "It was never about the money.",
      accent: "#22c55e",
      bg: "#050a08",
    },
  }),
  make({
    id: "hook-but-wait",
    name: "But Wait",
    description: "Full-width interrupt banner drops over “Continuing…”.",
    accent: "#e63946",
    template: "hook-but-wait",
    fields: [
      { key: "prefix", label: "Banner title", type: "text" },
      { key: "question", label: "Banner line", type: "textarea" },
      ...colors(),
    ],
    defaults: {
      prefix: "BUT WAIT",
      question: "That's not the full story.",
      accent: "#e63946",
      bg: "#05070b",
    },
  }),
  make({
    id: "hook-plot-twist",
    name: "The Plot Twist",
    description: "Expected card flips into the twist reveal.",
    accent: "#e63946",
    template: "hook-plot-twist",
    fields: [
      { key: "stamp", label: "Twist stamp", type: "text" },
      { key: "line", label: "Twist line", type: "textarea" },
      ...colors(),
    ],
    defaults: {
      stamp: "PLOT TWIST",
      line: "The suspect was never alone",
      accent: "#e63946",
      bg: "#05070b",
    },
  }),
  make({
    id: "hook-things-changed",
    name: "This Is Where Things Changed",
    description: "Timeline rail draws; pin drops on the pivot.",
    accent: "#c084fc",
    template: "hook-things-changed",
    fields: [
      { key: "part", label: "Label", type: "text" },
      { key: "title", label: "Title", type: "textarea" },
      ...colors("#c084fc", "#08060f"),
    ],
    defaults: {
      part: "ACT II",
      title: "This is where things changed",
      accent: "#c084fc",
      bg: "#08060f",
    },
  }),
  make({
    id: "hook-heres-what-happened",
    name: "Here's What Happened",
    description: "Numbered recap steps cascade in.",
    accent: "#38bdf8",
    template: "hook-heres-what-happened",
    durationInFrames: 180,
    fields: [
      { key: "part", label: "Label", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "steps", label: "Steps (one per line)", type: "textarea" },
      ...colors("#38bdf8", "#05080d"),
    ],
    defaults: {
      part: "RECAP",
      title: "Here's what happened",
      steps: "The tip came in\nCameras went dark\nThe story flipped",
      accent: "#38bdf8",
      bg: "#05080d",
    },
  }),
  make({
    id: "hook-why-this-matters",
    name: "Why Does This Matter?",
    description: "Stakes bars rise — Local → National → You.",
    accent: "#f59e0b",
    template: "hook-why-this-matters",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Hook", type: "textarea" },
      ...colors("#f59e0b"),
    ],
    defaults: {
      eyebrow: "WHY THIS MATTERS",
      title: "Because it can happen again.",
      accent: "#f59e0b",
      bg: "#07090e",
    },
  }),
  make({
    id: "hook-real-story",
    name: "The Real Story",
    description: "Cinema letterbox bars + film title card.",
    accent: "#e63946",
    template: "hook-real-story",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Hook", type: "textarea" },
      ...colors(),
    ],
    defaults: {
      eyebrow: "THE REAL STORY",
      title: "What was really happening?",
      accent: "#e63946",
      bg: "#07090e",
    },
  }),
];
