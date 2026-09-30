import type { AssetDefinition, AssetField } from "./types";

const timingFields: AssetField[] = [
  { key: "startDelay", label: "Start delay (sec)", type: "number", step: 0.01, min: 0 },
  { key: "stepDelay", label: "Step delay (sec)", type: "number", step: 0.01, min: 0 },
  { key: "connectDelay", label: "Connector delay (sec)", type: "number", step: 0.01, min: 0 },
  { key: "lineDuration", label: "Type / draw time (sec)", type: "number", step: 0.01, min: 0.05 },
  { key: "revealDuration", label: "Reveal time (sec)", type: "number", step: 0.01, min: 0.08 },
  { key: "itemDelays", label: "Per-item extra delays", type: "text", placeholder: "0, 0.3" },
  { key: "sound", label: "Sound", type: "select", options: [{ label: "On (CC0)", value: "on" }, { label: "Off", value: "off" }] },
];

const timingDefaults = {
  startDelay: 0,
  stepDelay: 0.1,
  connectDelay: 0.08,
  lineDuration: 1.4,
  revealDuration: 0.36,
  itemDelays: "",
  sound: "on",
};

const base = {
  fps: 30,
  width: 1280,
  height: 720,
  category: "ai" as const,
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
  category?: AssetDefinition["category"];
}): AssetDefinition {
  return {
    ...base,
    category: partial.category ?? base.category,
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

/** AI chat / search / streaming-title text animations — NEW category. */
export const AI_TEXT_ASSETS: AssetDefinition[] = [
  make({
    id: "ai-netflix-sting",
    name: "Stream title sting",
    description:
      "Netflix-style opener: letterbox bars, brand slam from overscale, soft settle. Lightweight, no heavy textures.",
    accent: "#e50914",
    template: "ai-netflix-sting",
    durationInFrames: 150,
    fields: [
      { key: "brand", label: "Brand / title", type: "text" },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      brand: "BESTMOTIONS",
      tagline: "A MOTION ORIGINAL",
      accent: "#e50914",
      bg: "#000000",
      lineDuration: 0.9,
      revealDuration: 0.55,
    },
  }),
  make({
    id: "ai-google-search",
    name: "Search bar typing",
    description:
      "Google logo search field: query types in, caret blinks, suggestion rows cascade.",
    accent: "#4285f4",
    template: "ai-google-search",
    category: "search",
    durationInFrames: 210,
    fields: [
      { key: "query", label: "Search query", type: "text" },
      { key: "suggest1", label: "Suggestion 1", type: "text" },
      { key: "suggest2", label: "Suggestion 2", type: "text" },
      { key: "suggest3", label: "Suggestion 3", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      query: "how do streaming title cards work",
      suggest1: "streaming title card animation",
      suggest2: "letterbox intro design",
      suggest3: "netflix style opener tutorial",
      accent: "#4285f4",
      bg: "#f8f9fa",
      lineDuration: 1.6,
    },
  }),
  make({
    id: "ai-claude-reply",
    name: "Claude-style reply",
    description:
      "Claude logo + warm assistant card, then response types with a soft caret.",
    accent: "#cc785c",
    template: "ai-claude-reply",
    durationInFrames: 220,
    fields: [
      { key: "label", label: "Assistant label", type: "text" },
      { key: "reply", label: "Reply text", type: "textarea" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
      { key: "card", label: "Card color", type: "color" },
    ],
    defaults: {
      label: "Claude",
      reply: "Here is a clear way to open your video: start with silence, then let the title settle.",
      accent: "#cc785c",
      bg: "#f5f0eb",
      card: "#ffffff",
      lineDuration: 2.0,
    },
  }),
  make({
    id: "ai-chatgpt-thread",
    name: "ChatGPT thread",
    description:
      "Real ChatGPT logo: user bubble lands, then assistant streams word-by-word with composer chrome.",
    accent: "#10a37f",
    template: "ai-chatgpt-thread",
    durationInFrames: 240,
    fields: [
      { key: "user", label: "User message", type: "textarea" },
      { key: "reply", label: "Assistant reply", type: "textarea" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      user: "Write a cold open for my documentary.",
      reply: "Open on black. One line of text. Hold. Then cut to the first image — no music yet.",
      accent: "#10a37f",
      bg: "#212121",
      lineDuration: 2.2,
      revealDuration: 0.3,
    },
  }),
  make({
    id: "ai-chat-conversation",
    name: "Chatbot conversation",
    description:
      "Real multi-turn chat (user → bot → user → bot) with selectable ChatGPT / Claude / Gemini / Perplexity logos.",
    accent: "#10a37f",
    template: "ai-chat-conversation",
    durationInFrames: 280,
    fields: [
      {
        key: "bot",
        label: "Chatbot",
        type: "select",
        options: [
          { label: "ChatGPT", value: "chatgpt" },
          { label: "Claude", value: "claude" },
          { label: "Gemini", value: "gemini" },
          { label: "Perplexity", value: "perplexity" },
          { label: "OpenAI", value: "openai" },
        ],
      },
      { key: "user1", label: "User message 1", type: "textarea" },
      { key: "reply1", label: "Bot reply 1", type: "textarea" },
      { key: "user2", label: "User message 2", type: "textarea" },
      { key: "reply2", label: "Bot reply 2", type: "textarea" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      bot: "chatgpt",
      user1: "Can you help me open my video?",
      reply1: "Yes — start on black, then land one title line.",
      user2: "Should there be music?",
      reply2: "Not yet. Hold silence for one beat after the title.",
      accent: "#10a37f",
      bg: "#212121",
      lineDuration: 1.8,
      stepDelay: 0.14,
    },
  }),
  make({
    id: "ai-multi-bot",
    name: "Two-bot compare",
    description:
      "Same prompt answered by two chatbots side-by-side with real logos (e.g. ChatGPT vs Claude).",
    accent: "#8b5cf6",
    template: "ai-multi-bot",
    durationInFrames: 260,
    fields: [
      { key: "prompt", label: "Shared prompt", type: "textarea" },
      {
        key: "botA",
        label: "Left bot",
        type: "select",
        options: [
          { label: "ChatGPT", value: "chatgpt" },
          { label: "Claude", value: "claude" },
          { label: "Gemini", value: "gemini" },
          { label: "Perplexity", value: "perplexity" },
        ],
      },
      { key: "replyA", label: "Left reply", type: "textarea" },
      {
        key: "botB",
        label: "Right bot",
        type: "select",
        options: [
          { label: "Claude", value: "claude" },
          { label: "ChatGPT", value: "chatgpt" },
          { label: "Gemini", value: "gemini" },
          { label: "Perplexity", value: "perplexity" },
        ],
      },
      { key: "replyB", label: "Right reply", type: "textarea" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      prompt: "Give me a 1-line cold open.",
      botA: "chatgpt",
      replyA: "Black frame. One sentence. Cut.",
      botB: "claude",
      replyB: "Start quiet — let the title arrive alone.",
      bg: "#0f1115",
      lineDuration: 1.6,
    },
  }),
  make({
    id: "ai-gemini-reply",
    name: "Gemini reply",
    description: "Google Gemini logo + streaming answer card on a dark UI shell.",
    accent: "#4285f4",
    template: "ai-gemini-reply",
    durationInFrames: 200,
    fields: [
      { key: "reply", label: "Reply text", type: "textarea" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      reply: "Here’s a clean structure: hook, proof, payoff — in that order.",
      accent: "#4285f4",
      bg: "#0b0f14",
      lineDuration: 1.8,
    },
  }),
  make({
    id: "ai-perplexity-answer",
    name: "Perplexity answer",
    description: "Perplexity logo + streamed answer with citation chips.",
    accent: "#22b8cd",
    template: "ai-perplexity-answer",
    durationInFrames: 210,
    fields: [
      { key: "reply", label: "Answer", type: "textarea" },
      { key: "cite1", label: "Citation 1", type: "text" },
      { key: "cite2", label: "Citation 2", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      reply: "Title stings work because they create a single focal point before the cut.",
      cite1: "motiondesign.archive",
      cite2: "editcraft.notes",
      accent: "#22b8cd",
      bg: "#0a0d12",
      lineDuration: 1.7,
    },
  }),
  make({
    id: "ai-prompt-box",
    name: "Prompt box typing",
    description:
      "Minimal composer: rounded prompt field, blinking caret, typed prompt, send pulse. Production UI, tiny footprint.",
    accent: "#8b5cf6",
    template: "ai-prompt-box",
    durationInFrames: 190,
    fields: [
      { key: "prompt", label: "Prompt", type: "textarea" },
      { key: "placeholder", label: "Placeholder", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      prompt: "Animate a Netflix-style title sting for BestMotions",
      placeholder: "Message an AI…",
      accent: "#8b5cf6",
      bg: "#0b0f14",
      lineDuration: 1.8,
    },
  }),
  make({
    id: "ai-word-stream",
    name: "AI word stream",
    description:
      "Word-by-word streaming answer (lighter than per-character). Clean serif on dark — great for explainers.",
    accent: "#e8c36a",
    template: "ai-word-stream",
    durationInFrames: 200,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "reply", label: "Streaming text", type: "textarea" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      eyebrow: "AI DRAFT",
      reply: "The best intros feel inevitable — not busy. One idea. One motion. Then breathe.",
      accent: "#e8c36a",
      bg: "#07090e",
      lineDuration: 2.0,
    },
  }),
  make({
    id: "ai-spotlight-title",
    name: "Spotlight title",
    description:
      "Cinematic spotlight: soft vignette, title rises and settles, tagline fades. Streaming drama without heavy assets.",
    accent: "#f4efe6",
    template: "ai-spotlight-title",
    durationInFrames: 160,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      title: "THE OPENING FRAME",
      subtitle: "Before the first cut",
      accent: "#f4efe6",
      bg: "#050508",
      revealDuration: 0.7,
    },
  }),
  make({
    id: "ai-suggest-cascade",
    name: "Suggestion cascade",
    description:
      "ChatGPT-style composer at the bottom with dark pill suggestion chips cascading above — not a Google dropdown.",
    accent: "#10a37f",
    template: "ai-suggest-cascade",
    category: "search",
    durationInFrames: 180,
    fields: [
      { key: "stub", label: "Typed stub", type: "text" },
      { key: "item1", label: "Chip 1", type: "text" },
      { key: "item2", label: "Chip 2", type: "text" },
      { key: "item3", label: "Chip 3", type: "text" },
      { key: "item4", label: "Chip 4", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      stub: "how to",
      item1: "how to write a cold open",
      item2: "how to pace a title card",
      item3: "how to type like ChatGPT",
      item4: "how to match Claude tone",
      accent: "#10a37f",
      bg: "#212121",
      lineDuration: 0.7,
      stepDelay: 0.08,
    },
  }),
];
