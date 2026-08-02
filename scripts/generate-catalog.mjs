import fs from "fs";

const data = JSON.parse(
  fs.readFileSync("scripts/recovered-assets.json", "utf8"),
);

const PLACE_OPTIONS = [
  { label: "India", value: "india" },
  { label: "USA", value: "usa" },
  { label: "United Kingdom", value: "uk" },
  { label: "China", value: "china" },
  { label: "Russia", value: "russia" },
  { label: "Pakistan", value: "pakistan" },
  { label: "Bangladesh", value: "bangladesh" },
  { label: "Japan", value: "japan" },
  { label: "France", value: "france" },
  { label: "Germany", value: "germany" },
  { label: "Australia", value: "australia" },
  { label: "Brazil", value: "brazil" },
  { label: "South Africa", value: "south-africa" },
  { label: "UAE", value: "uae" },
  { label: "Israel", value: "israel" },
];

const BOOK_TEMPLATE_MAP = {
  "book-cover-slam": "cover-slam",
  "book-spine-reveal": "spine-reveal",
  "book-open-spread": "open-spread",
  "book-page-flip": "page-flip",
  "book-stack": "book-stack",
  "book-quote": "quote",
  "book-float": "book-float",
  "book-source-cite": "source-cite",
  "book-tome": "tome",
  "book-cover-open": "cover-open",
  "book-marker-highlight": "marker-highlight",
  "book-area-highlight": "area-highlight",
  "book-line-scan": "line-scan",
  "book-text-underline": "text-underline",
  "book-thumb-through": "thumb-through",
};

const thumbThrough = {
  id: "book-thumb-through",
  name: "Thumb through pages",
  description:
    "Show the closed book, open it, then flip / thumb through pages — fully customizable.",
  category: "books",
  accent: "#e63946",
  durationInFrames: 240,
  fields: [
    { key: "coverTitle", label: "Cover title", type: "text" },
    { key: "subtitle", label: "Subtitle", type: "textarea" },
    { key: "author", label: "Author", type: "text" },
    { key: "page1", label: "Page 1", type: "textarea" },
    { key: "page2", label: "Page 2", type: "textarea" },
    { key: "page3", label: "Page 3", type: "textarea" },
    { key: "page4", label: "Page 4", type: "textarea" },
    { key: "coverColor", label: "Cover color", type: "color" },
    { key: "accent", label: "Accent", type: "color" },
    { key: "bg", label: "Background", type: "color" },
  ],
  defaults: {
    coverTitle: "The Hidden Files",
    subtitle: "What the records never said out loud",
    author: "A. RESEARCHER",
    page1:
      "The first documents appeared quietly — filed, stamped, and forgotten.",
    page2:
      "Names began to repeat. Dates refused to stay quiet in the margins.",
    page3:
      "Years later those same pages forced a rewriting of the official story.",
    page4: "What changed was not the ink. It was who was willing to read it.",
    coverColor: "#1e3a5f",
    accent: "#e63946",
    bg: "#07090e",
  },
};

function serialize(value, indent = 2) {
  return JSON.stringify(value, null, indent)
    .replace(/"([^"]+)":/g, "$1:")
    .replace(/"/g, '"');
}

function fieldToTs(field) {
  const parts = [
    `key: ${JSON.stringify(field.key)}`,
    `label: ${JSON.stringify(field.label)}`,
    `type: ${JSON.stringify(field.type)}`,
  ];
  if (field.hint) parts.push(`hint: ${JSON.stringify(field.hint)}`);
  if (field.placeholder)
    parts.push(`placeholder: ${JSON.stringify(field.placeholder)}`);
  if (
    field.type === "select" &&
    (field.key.includes("lace") ||
      field.key === "fromPlace" ||
      field.key === "toPlace" ||
      field.key === "placeKey")
  ) {
    parts.push(`options: PLACE_OPTIONS`);
  } else if (field.options?.length) {
    parts.push(`options: ${JSON.stringify(field.options)}`);
  }
  return `{ ${parts.join(", ")} }`;
}

const assets = [...data.assets];
if (!assets.some((a) => a.id === "book-thumb-through")) {
  // insert thumb-through at start of books
  const idx = assets.findIndex((a) => a.category === "books");
  assets.splice(idx >= 0 ? idx : assets.length, 0, thumbThrough);
}

const categoryOrder = [
  "books",
  "newspaper",
  "fire",
  "yt",
  "timeline",
  "india",
  "shorts",
  "maps",
  "3d",
  "text",
  "photos",
  "charts",
  "ui",
];

assets.sort((a, b) => {
  const ca = categoryOrder.indexOf(a.category);
  const cb = categoryOrder.indexOf(b.category);
  if (ca !== cb) return ca - cb;
  return a.id.localeCompare(b.id);
});

const entries = assets
  .map((a) => {
    const template = BOOK_TEMPLATE_MAP[a.id] || a.id;
    const fields = a.fields.map(fieldToTs).join(",\n      ");
    const defaults = Object.entries(a.defaults)
      .map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`)
      .join(",\n      ");
    return `  {
    ...base,
    id: ${JSON.stringify(a.id)},
    name: ${JSON.stringify(a.name)},
    description: ${JSON.stringify(a.description)},
    category: ${JSON.stringify(a.category)},
    accent: ${JSON.stringify(a.accent)},
    template: ${JSON.stringify(template)},
    durationInFrames: ${a.durationInFrames || 150},
    fields: [
      ${fields}
    ],
    defaults: {
      ${defaults}
    },
  }`;
  })
  .join(",\n");

const out = `import type { AssetDefinition } from "./types";

const PLACE_OPTIONS = ${JSON.stringify(PLACE_OPTIONS, null, 2)};

const base = {
  fps: 30,
  width: 1280,
  height: 720,
  durationInFrames: 150,
};

export const ASSETS: AssetDefinition[] = [
${entries}
];

export function getAssetById(id: string): AssetDefinition | undefined {
  return ASSETS.find((a) => a.id === id);
}

export const CATEGORIES: { id: AssetDefinition["category"] | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "books", label: "Books" },
  { id: "newspaper", label: "Newspaper" },
  { id: "fire", label: "Fire" },
  { id: "yt", label: "YT Topic" },
  { id: "timeline", label: "Timeline" },
  { id: "india", label: "India pack" },
  { id: "shorts", label: "Shorts pack" },
  { id: "maps", label: "Maps & travel" },
  { id: "3d", label: "3D / globe" },
  { id: "text", label: "Text & highlight" },
  { id: "photos", label: "Photos" },
  { id: "charts", label: "Charts" },
  { id: "ui", label: "UI / titles" },
];
`;

fs.writeFileSync("client/assets/catalog.ts", out);
console.log("Wrote catalog with", assets.length, "assets");
