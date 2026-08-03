import type { AssetDefinition } from "./types";

const PLACE_OPTIONS = [
  {
    "label": "India",
    "value": "india"
  },
  {
    "label": "USA",
    "value": "usa"
  },
  {
    "label": "United Kingdom",
    "value": "uk"
  },
  {
    "label": "China",
    "value": "china"
  },
  {
    "label": "Russia",
    "value": "russia"
  },
  {
    "label": "Pakistan",
    "value": "pakistan"
  },
  {
    "label": "Bangladesh",
    "value": "bangladesh"
  },
  {
    "label": "Japan",
    "value": "japan"
  },
  {
    "label": "France",
    "value": "france"
  },
  {
    "label": "Germany",
    "value": "germany"
  },
  {
    "label": "Australia",
    "value": "australia"
  },
  {
    "label": "Brazil",
    "value": "brazil"
  },
  {
    "label": "South Africa",
    "value": "south-africa"
  },
  {
    "label": "UAE",
    "value": "uae"
  },
  {
    "label": "Israel",
    "value": "israel"
  }
];

const base = {
  fps: 30,
  width: 1280,
  height: 720,
  durationInFrames: 150,
};

export const ASSETS: AssetDefinition[] = [
  {
    ...base,
    id: "book-area-highlight",
    name: "Area circle / box",
    description: "Draw a red circle or box around a region on the page.",
    category: "books",
    accent: "#e63946",
    template: "area-highlight",
    durationInFrames: 140,
    fields: [
      { key: "chapter", label: "Chapter", type: "text" },
      { key: "pageText", label: "Page text", type: "textarea" },
      { key: "callout", label: "Callout label", type: "text" },
      { key: "shape", label: "Shape", type: "select", options: [{"label":"Circle","value":"circle"},{"label":"Box","value":"box"}] },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "chapter": "Annex B",
      "pageText": "Budget line 17 was never explained in the public hearing. The amount appears once — then vanishes from every later draft.",
      "callout": "Budget line 17",
      "shape": "circle",
      "accent": "#e63946",
      "bg": "#0a0806"
    },
  },
  {
    ...base,
    id: "book-cover-open",
    name: "Cover opens",
    description: "Closed cover swings open to reveal the first page.",
    category: "books",
    accent: "#e63946",
    template: "cover-open",
    durationInFrames: 140,
    fields: [
      { key: "coverTitle", label: "Cover title", type: "text" },
      { key: "title", label: "Chapter", type: "text" },
      { key: "pageText", label: "Page text", type: "textarea" },
      { key: "coverColor", label: "Cover color", type: "color" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "coverTitle": "The Hidden Files",
      "title": "Chapter One",
      "pageText": "They opened the file expecting a routine note. Instead they found a name that had been erased from every public record.",
      "coverColor": "#1e3a5f",
      "accent": "#e63946",
      "bg": "#0a0806"
    },
  },
  {
    ...base,
    id: "book-cover-slam",
    name: "Book cover slam",
    description: "3D cover flies in and slams — classic topic-video book intro.",
    category: "books",
    accent: "#e63946",
    template: "cover-slam",
    durationInFrames: 120,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "author", label: "Author", type: "text" },
      { key: "imageUrl", label: "Cover image (optional)", type: "image" },
      { key: "coverColor", label: "Cover color", type: "color" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "The Hidden Files",
      "subtitle": "What the records never said out loud",
      "author": "A. RESEARCHER",
      "imageUrl": "",
      "coverColor": "#1e3a5f",
      "accent": "#e63946",
      "bg": "#07090e"
    },
  },
  {
    ...base,
    id: "book-float",
    name: "Floating book",
    description: "Cover drifts in 3D — soft B-roll orbit.",
    category: "books",
    accent: "#7dd3a0",
    template: "book-float",
    durationInFrames: 150,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "author", label: "Author", type: "text" },
      { key: "imageUrl", label: "Cover image", type: "image" },
      { key: "coverColor", label: "Cover color", type: "color" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "The Long Game",
      "author": "FIELD NOTES",
      "imageUrl": "",
      "coverColor": "#152238",
      "accent": "#7dd3a0",
      "bg": "#06080c"
    },
  },
  {
    ...base,
    id: "book-line-scan",
    name: "Line scan highlight",
    description: "Scan line sweeps down the page and leaves a highlight band.",
    category: "books",
    accent: "#ffe566",
    template: "line-scan",
    durationInFrames: 140,
    fields: [
      { key: "chapter", label: "Chapter", type: "text" },
      { key: "line1", label: "Line 1", type: "text" },
      { key: "line2", label: "Line 2", type: "text" },
      { key: "line3", label: "Line 3", type: "text" },
      { key: "scanColor", label: "Scan band", type: "color" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "chapter": "Testimony",
      "line1": "Witness A: We were told to destroy the copies.",
      "line2": "Witness B: The order came after midnight.",
      "line3": "Witness C: Nobody signed their real name.",
      "scanColor": "#ffe566",
      "accent": "#e63946",
      "bg": "#090b10"
    },
  },
  {
    ...base,
    id: "book-marker-highlight",
    name: "Marker highlight",
    description: "Open spread with a yellow marker swipe over a key phrase.",
    category: "books",
    accent: "#ffe566",
    template: "marker-highlight",
    durationInFrames: 140,
    fields: [
      { key: "chapter", label: "Chapter / page", type: "text" },
      { key: "beforeText", label: "Before highlight", type: "textarea" },
      { key: "highlightText", label: "Highlighted phrase", type: "text" },
      { key: "afterText", label: "After highlight", type: "textarea" },
      { key: "markerColor", label: "Marker color", type: "color" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "chapter": "Page 142",
      "beforeText": "The report concluded that the operation had been",
      "highlightText": "deliberately buried",
      "afterText": "for more than a decade.",
      "markerColor": "#ffe566",
      "accent": "#e63946",
      "bg": "#0c0a08"
    },
  },
  {
    ...base,
    id: "book-open-spread",
    name: "Open book spread",
    description: "Book opens to left/right pages with configurable text.",
    category: "books",
    accent: "#e63946",
    template: "open-spread",
    durationInFrames: 140,
    fields: [
      { key: "title", label: "Chapter / kicker", type: "text" },
      { key: "leftPage", label: "Left page", type: "textarea" },
      { key: "rightPage", label: "Right page", type: "textarea" },
      { key: "pageLabel", label: "Page label", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "coverColor", label: "Gutter tint", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "Chapter 3",
      "leftPage": "The first documents appeared quietly — filed, stamped, and forgotten in a cabinet that almost no one opened.",
      "rightPage": "Years later those same pages would force a rewriting of the official story. What changed was not the ink. It was who was willing to read it.",
      "pageLabel": "pp. 84–85",
      "accent": "#e63946",
      "coverColor": "#1a1410",
      "bg": "#0c0a08"
    },
  },
  {
    ...base,
    id: "book-page-flip",
    name: "Page flip notes",
    description: "Pages flip through source notes — research montage beat.",
    category: "books",
    accent: "#e63946",
    template: "page-flip",
    durationInFrames: 140,
    fields: [
      { key: "line1", label: "Page 1", type: "text" },
      { key: "line2", label: "Page 2", type: "text" },
      { key: "line3", label: "Page 3", type: "text" },
      { key: "line4", label: "Page 4", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "line1": "1947 — First mention in the archives",
      "line2": "1962 — Names begin to repeat",
      "line3": "1991 — The paper trail widens",
      "line4": "2019 — Public questions return",
      "accent": "#e63946",
      "bg": "#080a10"
    },
  },
  {
    ...base,
    id: "book-quote",
    name: "Book quote page",
    description: "Open page with italic quote + underline attribution.",
    category: "books",
    accent: "#e63946",
    template: "quote",
    durationInFrames: 120,
    fields: [
      { key: "chapter", label: "Chapter", type: "text" },
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "attribution", label: "Attribution", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "chapter": "Foreword",
      "quote": "History is not what happened. It is what was written down.",
      "attribution": "— Anonymous marginal note",
      "accent": "#e63946",
      "bg": "#090b10"
    },
  },
  {
    ...base,
    id: "book-source-cite",
    name: "Source citation",
    description: "Cover + title card when citing a book as a source.",
    category: "books",
    accent: "#e63946",
    template: "source-cite",
    durationInFrames: 120,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "author", label: "Author", type: "text" },
      { key: "detail", label: "Detail", type: "textarea" },
      { key: "imageUrl", label: "Cover image", type: "image" },
      { key: "coverColor", label: "Cover color", type: "color" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "eyebrow": "SOURCE",
      "title": "India After Gandhi",
      "author": "Ramachandra Guha",
      "detail": "Referenced for the political timeline of the 1970s.",
      "imageUrl": "",
      "coverColor": "#1a2f4a",
      "accent": "#e63946",
      "bg": "#07090e"
    },
  },
  {
    ...base,
    id: "book-spine-reveal",
    name: "Spine to cover",
    description: "Book rotates from spine view to full cover.",
    category: "books",
    accent: "#d4a373",
    template: "spine-reveal",
    durationInFrames: 130,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "author", label: "Author", type: "text" },
      { key: "spineLabel", label: "Spine text", type: "text" },
      { key: "coverColor", label: "Cover color", type: "color" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "Power & Silence",
      "author": "N. ARCHIVE",
      "spineLabel": "POWER & SILENCE",
      "coverColor": "#2a1810",
      "accent": "#d4a373",
      "bg": "#0a0806"
    },
  },
  {
    ...base,
    id: "book-stack",
    name: "Book stack",
    description: "Stack of spines dropping in — shelf of sources.",
    category: "books",
    accent: "#e63946",
    template: "book-stack",
    durationInFrames: 130,
    fields: [
      { key: "title", label: "Section title", type: "text" },
      { key: "book1", label: "Book 1", type: "text" },
      { key: "book2", label: "Book 2", type: "text" },
      { key: "book3", label: "Book 3", type: "text" },
      { key: "book4", label: "Book 4", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "On the shelf",
      "book1": "Empire of Silence",
      "book2": "The Paper Trail",
      "book3": "Closed Doors",
      "book4": "After Midnight",
      "accent": "#e63946",
      "bg": "#0a0c12"
    },
  },
  {
    ...base,
    id: "book-text-underline",
    name: "Underline draw",
    description: "Accent underline draws beneath a key phrase.",
    category: "books",
    accent: "#e63946",
    template: "book-text-underline",
    durationInFrames: 130,
    fields: [
      { key: "chapter", label: "Chapter", type: "text" },
      { key: "beforeText", label: "Before", type: "textarea" },
      { key: "underlineText", label: "Underlined phrase", type: "text" },
      { key: "afterText", label: "After", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "chapter": "Conclusion",
      "beforeText": "In the end, the archive did not hide the truth —",
      "underlineText": "it waited for someone to look",
      "afterText": ".",
      "accent": "#e63946",
      "bg": "#0c0a08"
    },
  },
  {
    ...base,
    id: "book-thumb-through",
    name: "Thumb through pages",
    description: "Show the closed book, open it, then flip / thumb through pages — fully customizable.",
    category: "books",
    accent: "#e63946",
    template: "thumb-through",
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
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "coverTitle": "The Hidden Files",
      "subtitle": "What the records never said out loud",
      "author": "A. RESEARCHER",
      "page1": "The first documents appeared quietly — filed, stamped, and forgotten.",
      "page2": "Names began to repeat. Dates refused to stay quiet in the margins.",
      "page3": "Years later those same pages forced a rewriting of the official story.",
      "page4": "What changed was not the ink. It was who was willing to read it.",
      "coverColor": "#1e3a5f",
      "accent": "#e63946",
      "bg": "#07090e"
    },
  },
  {
    ...base,
    id: "book-tome",
    name: "Encyclopedia tome",
    description: "Thick gold-embossed volume slam — heavy reference beat.",
    category: "books",
    accent: "#d4af37",
    template: "tome",
    durationInFrames: 120,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "volume", label: "Volume", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "accent", label: "Gold / accent", type: "color" },
      { key: "coverColor", label: "Cover color", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "ENCYCLOPEDIA",
      "volume": "VOL. VII",
      "subtitle": "Conflicts & Consequences",
      "accent": "#d4af37",
      "coverColor": "#1a1208",
      "bg": "#050408"
    },
  },
  {
    ...base,
    id: "news-clip-zoom",
    name: "Clipping zoom + marker",
    description: "Slow zoom into a clipping while the marker sweeps the key words.",
    category: "newspaper",
    accent: "#ffe566",
    template: "news-clip-zoom",
    durationInFrames: 110,
    fields: [
      { key: "masthead", label: "Masthead", type: "text" },
      { key: "byline", label: "Byline", type: "text" },
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "highlight", label: "Phrase to highlight", type: "text", hint: "Must appear inside the headline" },
      { key: "accent", label: "Marker color", type: "color" },
      { key: "ink", label: "Ink color", type: "color" }
    ],
    defaults: {
      "masthead": "CITY TIMES",
      "byline": "By Staff Reporter",
      "headline": "Record turnout at the polls today",
      "highlight": "Record turnout",
      "accent": "#ffe566",
      "ink": "#1c1814"
    },
  },
  {
    ...base,
    id: "news-draw-line",
    name: "Draw-line highlight",
    description: "Hand-drawn underline, marker wash, or strike-through on editorial text.",
    category: "newspaper",
    accent: "#1b4dff",
    template: "news-draw-line",
    durationInFrames: 120,
    fields: [
      { key: "kicker", label: "Kicker", type: "text" },
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "underline", label: "Phrase to mark", type: "text", hint: "Must appear inside the headline" },
      { key: "sub", label: "Subline", type: "text" },
      { key: "mode", label: "Mark style", type: "select", options: [{"label":"Hand underline","value":"underline"},{"label":"Marker wash","value":"marker"},{"label":"Both","value":"both"},{"label":"Strike-through","value":"strike"}] },
      { key: "accent", label: "Pen color", type: "color" },
      { key: "ink", label: "Ink color", type: "color" }
    ],
    defaults: {
      "kicker": "EDITORIAL",
      "headline": "The road ahead will not be easy",
      "underline": "will not be easy",
      "sub": "Why patience and clarity matter more than ever.",
      "mode": "underline",
      "accent": "#1b4dff",
      "ink": "#16120e"
    },
  },
  {
    ...base,
    id: "news-front-page",
    name: "Front page + stamp",
    description: "Two-column front page with a slamming BREAKING stamp.",
    category: "newspaper",
    accent: "#c1121f",
    template: "news-front-page",
    durationInFrames: 120,
    fields: [
      { key: "masthead", label: "Masthead", type: "text" },
      { key: "date", label: "Date / volume", type: "text" },
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "deck", label: "Deck", type: "textarea" },
      { key: "col1", label: "Column 1", type: "textarea" },
      { key: "col2", label: "Column 2", type: "textarea" },
      { key: "stamp", label: "Stamp text", type: "text" },
      { key: "accent", label: "Stamp color", type: "color" },
      { key: "ink", label: "Ink color", type: "color" }
    ],
    defaults: {
      "masthead": "THE NATIONAL",
      "date": "Vol. 112  ·  July 2026",
      "headline": "Parliament clears landmark bill",
      "deck": "Opposition divided as the vote passes after midnight debate.",
      "col1": "Sources say negotiations ran late into the night. The final tally surprised even veteran reporters covering the beat.",
      "col2": "Markets opened higher. Civil society groups called for careful implementation in the months ahead.",
      "stamp": "BREAKING",
      "accent": "#c1121f",
      "ink": "#151210"
    },
  },
  {
    ...base,
    id: "news-headline-stack",
    name: "Headline stack",
    description: "Three clipped headlines slam in with sequential rule lines.",
    category: "newspaper",
    accent: "#c1121f",
    template: "news-headline-stack",
    durationInFrames: 120,
    fields: [
      { key: "title", label: "Section title", type: "text" },
      { key: "line1", label: "Headline 1", type: "text" },
      { key: "line2", label: "Headline 2", type: "text" },
      { key: "line3", label: "Headline 3", type: "text" },
      { key: "accent", label: "Rule color", type: "color" },
      { key: "ink", label: "Ink color", type: "color" }
    ],
    defaults: {
      "title": "In the papers",
      "line1": "Markets surge on reform news",
      "line2": "Cabinet clears infrastructure push",
      "line3": "States race to implement the plan",
      "accent": "#c1121f",
      "ink": "#151210"
    },
  },
  {
    ...base,
    id: "news-magnifier",
    name: "Magnifier reveal",
    description: "Lens sweeps the page while a phrase gets a marker wash.",
    category: "newspaper",
    accent: "#ffb703",
    template: "news-magnifier",
    durationInFrames: 100,
    fields: [
      { key: "body", label: "Body text", type: "textarea" },
      { key: "highlight", label: "Phrase to highlight", type: "text", hint: "Must appear inside the body text" },
      { key: "accent", label: "Marker color", type: "color" },
      { key: "ink", label: "Ink color", type: "color" }
    ],
    defaults: {
      "body": "The committee noted that infrastructure, education and health must move together if the gains are to last. Growth without inclusion, they warned, would leave the story unfinished.",
      "highlight": "Growth without inclusion",
      "accent": "#ffb703",
      "ink": "#171310"
    },
  },
  {
    ...base,
    id: "news-photo-caption",
    name: "Photo caption underline",
    description: "News photo with caption and an animated draw-line under a phrase.",
    category: "newspaper",
    accent: "#e63946",
    template: "news-photo-caption",
    durationInFrames: 120,
    fields: [
      { key: "imageUrl", label: "Photo", type: "image" },
      { key: "caption", label: "Caption", type: "textarea" },
      { key: "highlight", label: "Phrase to underline", type: "text", hint: "Must appear inside the caption" },
      { key: "credit", label: "Credit", type: "text" },
      { key: "accent", label: "Line color", type: "color" },
      { key: "ink", label: "Ink color", type: "color" }
    ],
    defaults: {
      "imageUrl": "",
      "caption": "Crowds gather as results are announced late into the night.",
      "highlight": "results are announced",
      "credit": "Staff photo",
      "accent": "#e63946",
      "ink": "#171310"
    },
  },
  {
    ...base,
    id: "news-quote-box",
    name: "Quote box draw",
    description: "Ink pen draws a box around a quote, then underlines the credit.",
    category: "newspaper",
    accent: "#1d3557",
    template: "news-quote-box",
    durationInFrames: 120,
    fields: [
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "attribution", label: "Attribution", type: "text" },
      { key: "accent", label: "Pen color", type: "color" },
      { key: "ink", label: "Ink color", type: "color" }
    ],
    defaults: {
      "quote": "History is written by those who show up.",
      "attribution": "— Anonymous editorial",
      "accent": "#1d3557",
      "ink": "#151210"
    },
  },
  {
    ...base,
    id: "news-red-circle",
    name: "Red pen circle",
    description: "Newsprint page with a hand-drawn red circle around a key phrase.",
    category: "newspaper",
    accent: "#d62828",
    template: "news-red-circle",
    durationInFrames: 120,
    fields: [
      { key: "masthead", label: "Masthead", type: "text" },
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "circleWord", label: "Phrase to circle", type: "text", hint: "Must appear inside the headline" },
      { key: "body", label: "Body copy", type: "textarea" },
      { key: "accent", label: "Pen color", type: "color" },
      { key: "ink", label: "Ink color", type: "color" }
    ],
    defaults: {
      "masthead": "MORNING POST",
      "headline": "Growth hits a historic high this quarter",
      "circleWord": "historic high",
      "body": "Markets reacted sharply as numbers crossed every forecast. Experts call it a generational shift.",
      "accent": "#d62828",
      "ink": "#171310"
    },
  },
  {
    ...base,
    id: "news-slide-highlight",
    name: "Newspaper slide + highlight",
    description: "Paper flies in (VOX-style), then a marker paints across your chosen phrase.",
    category: "newspaper",
    accent: "#f5d76e",
    template: "news-slide-highlight",
    durationInFrames: 120,
    fields: [
      { key: "masthead", label: "Masthead", type: "text" },
      { key: "date", label: "Date line", type: "text" },
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "highlight", label: "Phrase to highlight", type: "text", hint: "Must appear inside the headline" },
      { key: "body", label: "Body copy", type: "textarea" },
      { key: "accent", label: "Marker color", type: "color" },
      { key: "ink", label: "Ink color", type: "color" },
      { key: "rotation", label: "Tilt (degrees)", type: "number" }
    ],
    defaults: {
      "masthead": "THE DAILY CHRONICLE",
      "date": "Monday, July 20, 2026",
      "headline": "A defining moment for the nation",
      "highlight": "defining moment",
      "body": "In a landmark development, leaders gathered as history turned a new page. Analysts say the decision will reshape the decade ahead.",
      "accent": "#f5d76e",
      "ink": "#1a1510",
      "rotation": -4
    },
  },
  {
    ...base,
    id: "news-ultra-circle",
    name: "Ultra red pen circle",
    description: "Aged newsprint with a realistic hand-drawn red circle.",
    category: "newspaper",
    accent: "#c1121f",
    template: "news-ultra-circle",
    durationInFrames: 120,
    fields: [
      { key: "masthead", label: "Masthead", type: "text" },
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "circleWord", label: "Phrase to circle", type: "text", hint: "Must appear inside the headline" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "accent", label: "Pen color", type: "color" },
      { key: "paperTint", label: "Paper tint", type: "color" }
    ],
    defaults: {
      "masthead": "MORNING POST",
      "headline": "Growth hits a historic high this quarter",
      "circleWord": "historic high",
      "body": "Markets reacted sharply as numbers crossed every forecast. Experts call it a generational shift.",
      "accent": "#c1121f",
      "paperTint": "#f3ead6"
    },
  },
  {
    ...base,
    id: "news-ultra-extra",
    name: "Ultra EXTRA edition",
    description: "Broadsheet with slamming EXTRA banner + headline highlight.",
    category: "newspaper",
    accent: "#b00000",
    template: "news-ultra-extra",
    durationInFrames: 130,
    fields: [
      { key: "masthead", label: "Masthead", type: "text" },
      { key: "banner", label: "Banner text", type: "text" },
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "highlight", label: "Phrase to highlight", type: "text", hint: "Must appear inside the headline" },
      { key: "sub", label: "Subline", type: "text" },
      { key: "bannerColor", label: "Banner color", type: "color" },
      { key: "markerColor", label: "Marker color", type: "color" },
      { key: "paperTint", label: "Paper tint", type: "color" }
    ],
    defaults: {
      "masthead": "THE DAILY RECORD",
      "banner": "EXTRA",
      "headline": "Breaking developments overnight stun the capital",
      "highlight": "Breaking developments",
      "sub": "Live updates as officials scramble to respond",
      "bannerColor": "#b00000",
      "markerColor": "#ffe566",
      "paperTint": "#f1e6d0"
    },
  },
  {
    ...base,
    id: "news-ultra-fold",
    name: "Ultra paper fold",
    description: "3D fold/unroll onto the desk, then marker paints the phrase.",
    category: "newspaper",
    accent: "#f5d76e",
    template: "news-ultra-fold",
    durationInFrames: 140,
    fields: [
      { key: "masthead", label: "Masthead", type: "text" },
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "highlight", label: "Phrase to highlight", type: "text", hint: "Must appear inside the headline" },
      { key: "body", label: "Body copy", type: "textarea" },
      { key: "markerColor", label: "Marker color", type: "color" },
      { key: "paperTint", label: "Paper tint", type: "color" }
    ],
    defaults: {
      "masthead": "EVENING POST",
      "headline": "Secrets buried in the archives finally surface",
      "highlight": "finally surface",
      "body": "A newly released cache of documents is forcing a rewrite of the official narrative. Investigators say the trail runs through offices that once denied any link.",
      "markerColor": "#f5d76e",
      "paperTint": "#efe4cc"
    },
  },
  {
    ...base,
    id: "news-ultra-front",
    name: "Ultra front page",
    description: "Broadsheet with masthead, drop-cap columns, photo & marker — fully configurable.",
    category: "newspaper",
    accent: "#ffe566",
    template: "news-ultra-front",
    durationInFrames: 140,
    fields: [
      { key: "masthead", label: "Masthead", type: "text" },
      { key: "volume", label: "Volume line", type: "text" },
      { key: "date", label: "Date", type: "text" },
      { key: "price", label: "Price", type: "text" },
      { key: "kicker", label: "Kicker", type: "text" },
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "highlight", label: "Phrase to highlight", type: "text", hint: "Must appear inside the headline" },
      { key: "deck", label: "Deck", type: "textarea" },
      { key: "byline", label: "Byline", type: "text" },
      { key: "imageUrl", label: "Lead photo", type: "image" },
      { key: "caption", label: "Photo caption", type: "text" },
      { key: "col1", label: "Column 1", type: "textarea" },
      { key: "col2", label: "Column 2", type: "textarea" },
      { key: "markerColor", label: "Marker color", type: "color" },
      { key: "paperTint", label: "Paper tint", type: "color" }
    ],
    defaults: {
      "masthead": "THE MORNING TRIBUNE",
      "volume": "Vol. 214  No. 48",
      "date": "Thursday, July 30, 2026",
      "price": "₹10",
      "kicker": "NATION",
      "headline": "Historic turnout reshapes the political map overnight",
      "highlight": "Historic turnout",
      "deck": "Crowds filled streets as results poured in from every corner of the country.",
      "byline": "By Staff Correspondents",
      "imageUrl": "",
      "caption": "Supporters gather outside the counting centre late into the night.",
      "col1": "Preliminary counts show a decisive shift that few pollsters had predicted. Local organizers described scenes of jubilation and disbelief as the night stretched into morning.",
      "col2": "Opposition leaders called for calm and a careful reading of the numbers. Markets opened higher, while civil society groups urged patience as official tallies continue.",
      "markerColor": "#ffe566",
      "paperTint": "#f2e8d4"
    },
  },
  {
    ...base,
    id: "news-ultra-letterpress",
    name: "Ultra letterpress underline",
    description: "Letterpress headline with hand-ink underline draw.",
    category: "newspaper",
    accent: "#1d4ed8",
    template: "news-ultra-letterpress",
    durationInFrames: 120,
    fields: [
      { key: "kicker", label: "Kicker", type: "text" },
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "highlight", label: "Phrase to underline", type: "text", hint: "Must appear inside the headline" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "accent", label: "Ink accent", type: "color" },
      { key: "ink", label: "Headline ink", type: "color" },
      { key: "paperTint", label: "Paper tint", type: "color" }
    ],
    defaults: {
      "kicker": "EDITORIAL",
      "headline": "Truth does not fear the printing press",
      "highlight": "printing press",
      "body": "In an age of noise, the printed word still demands we slow down and look closer. That discipline is not nostalgia — it is accountability.",
      "accent": "#1d4ed8",
      "ink": "#1a1510",
      "paperTint": "#efe6d2"
    },
  },
  {
    ...base,
    id: "news-ultra-push",
    name: "Ultra clip camera push",
    description: "Slow Ken-Burns push into newsprint while the marker sweeps.",
    category: "newspaper",
    accent: "#ffe566",
    template: "news-ultra-push",
    durationInFrames: 130,
    fields: [
      { key: "masthead", label: "Masthead", type: "text" },
      { key: "date", label: "Date", type: "text" },
      { key: "byline", label: "Byline", type: "text" },
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "highlight", label: "Phrase to highlight", type: "text", hint: "Must appear inside the headline" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "markerColor", label: "Marker color", type: "color" },
      { key: "paperTint", label: "Paper tint", type: "color" }
    ],
    defaults: {
      "masthead": "CITY TIMES",
      "date": "July 30, 2026",
      "byline": "Special Report",
      "headline": "Record crowds demand answers at the gates",
      "highlight": "Record crowds",
      "body": "From dawn the avenues filled. Chants rolled between buildings as marshals struggled to keep corridors open for emergency vehicles.",
      "markerColor": "#ffe566",
      "paperTint": "#f4ead8"
    },
  },
  {
    ...base,
    id: "news-ultra-spread",
    name: "Ultra two-page spread",
    description: "Open newspaper spread with left photo story + right column.",
    category: "newspaper",
    accent: "#8b1e1e",
    template: "news-ultra-spread",
    durationInFrames: 140,
    fields: [
      { key: "leftMasthead", label: "Left section", type: "text" },
      { key: "leftHeadline", label: "Left headline", type: "textarea" },
      { key: "leftBody", label: "Left body", type: "textarea" },
      { key: "leftImage", label: "Left photo", type: "image" },
      { key: "rightMasthead", label: "Right section", type: "text" },
      { key: "rightHeadline", label: "Right headline", type: "textarea" },
      { key: "rightBody", label: "Right body", type: "textarea" },
      { key: "paperTint", label: "Paper tint", type: "color" }
    ],
    defaults: {
      "leftMasthead": "THE NATIONAL",
      "leftHeadline": "Inside the closed-door meeting",
      "leftBody": "Minutes obtained by this paper show how quickly consensus formed — and who was left outside the room.",
      "leftImage": "",
      "rightMasthead": "WORLD",
      "rightHeadline": "Markets react as the news breaks",
      "rightBody": "Investors scrambled for clarity as statements conflicted across capitals.",
      "paperTint": "#f2e8d4"
    },
  },
  {
    ...base,
    id: "news-ultra-stack",
    name: "Ultra paper stack",
    description: "Stack of aged papers; top sheet slides in with highlight.",
    category: "newspaper",
    accent: "#f5d76e",
    template: "news-ultra-stack",
    durationInFrames: 140,
    fields: [
      { key: "masthead", label: "Masthead", type: "text" },
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "highlight", label: "Phrase to highlight", type: "text", hint: "Must appear inside the headline" },
      { key: "line2", label: "Line 2", type: "text" },
      { key: "line3", label: "Line 3", type: "text" },
      { key: "markerColor", label: "Marker color", type: "color" },
      { key: "paperTint", label: "Paper tint", type: "color" }
    ],
    defaults: {
      "masthead": "WEEKLY OBSERVER",
      "headline": "The story they tried to bury is now on every desk",
      "highlight": "tried to bury",
      "line2": "Editors race to verify a flood of fresh claims",
      "line3": "Public demands a full and open inquiry",
      "markerColor": "#f5d76e",
      "paperTint": "#f0e5cf"
    },
  },
  {
    ...base,
    id: "news-ultra-torn",
    name: "Ultra torn clipping",
    description: "Vox-style hand-torn edges (jagged, not straight) with fiber rim, tilt & marker.",
    category: "newspaper",
    accent: "#c8f542",
    template: "news-ultra-torn",
    durationInFrames: 140,
    fields: [
      { key: "masthead", label: "Masthead", type: "text" },
      { key: "date", label: "Date", type: "text" },
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "highlight", label: "Phrase to highlight", type: "text", hint: "Must appear inside the headline" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "imageUrl", label: "Photo", type: "image" },
      { key: "caption", label: "Caption", type: "text" },
      { key: "markerColor", label: "Marker color", type: "color" },
      { key: "paperTint", label: "Paper tint", type: "color" },
      { key: "rotation", label: "Tilt (degrees)", type: "number" },
      { key: "tornRoughness", label: "Tear roughness", type: "number", hint: "Higher = more jagged hand-torn edge (8–28)" },
      { key: "tornSeed", label: "Tear pattern seed", type: "number" }
    ],
    defaults: {
      "masthead": "DAILY NEWS",
      "date": "Saturday, August 1, 2026",
      "headline": "Newspaper effect that looks hand-torn",
      "highlight": "hand-torn",
      "body": "Editors love this beat: a clipped story with ragged edges, sitting above a dark grid like it was ripped from the morning edition.",
      "imageUrl": "",
      "caption": "Archive photo",
      "markerColor": "#c8f542",
      "paperTint": "#f4ead8",
      "rotation": -6,
      "tornRoughness": 18,
      "tornSeed": 7
    },
  },
  {
    ...base,
    id: "news-ultra-torn-reveal",
    name: "Ultra torn reveal",
    description: "Clipping tears open left→right with a jagged edge, then marker highlights.",
    category: "newspaper",
    accent: "#ffe566",
    template: "news-ultra-torn-reveal",
    durationInFrames: 140,
    fields: [
      { key: "masthead", label: "Masthead", type: "text" },
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "highlight", label: "Phrase to highlight", type: "text", hint: "Must appear inside the headline" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "markerColor", label: "Marker color", type: "color" },
      { key: "paperTint", label: "Paper tint", type: "color" },
      { key: "tornRoughness", label: "Tear roughness", type: "number" },
      { key: "tornSeed", label: "Tear pattern seed", type: "number" }
    ],
    defaults: {
      "masthead": "THE EVENING CLIP",
      "headline": "Ripped from today's front page",
      "highlight": "Ripped from",
      "body": "A slow tear reveals the clipping — not a hard rectangular wipe, but an uneven edge the way fingers would pull newsprint apart.",
      "markerColor": "#ffe566",
      "paperTint": "#f2e8d4",
      "tornRoughness": 20,
      "tornSeed": 11
    },
  },
  {
    ...base,
    id: "fire-campfire",
    name: "Campfire",
    description: "Procedural flame tongues over logs with rising embers.",
    category: "fire",
    accent: "#ff6a00",
    template: "fire-campfire",
    durationInFrames: 150,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "flameCount", label: "Flame count", type: "number" },
      { key: "emberCount", label: "Ember count", type: "number" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "CAMPFIRE",
      "subtitle": "Stay close to the warmth",
      "flameCount": 9,
      "emberCount": 28,
      "accent": "#ff6a00",
      "bg": "#07040a"
    },
  },
  {
    ...base,
    id: "fire-candle",
    name: "Candle flame",
    description: "Soft flickering candle with intimate caption.",
    category: "fire",
    accent: "#ffb347",
    template: "fire-candle",
    durationInFrames: 140,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "accent", label: "Flame color", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "A single flame",
      "subtitle": "Is enough to start",
      "accent": "#ffb347",
      "bg": "#06040a"
    },
  },
  {
    ...base,
    id: "fire-embers",
    name: "Ember storm",
    description: "Field of rising or falling sparks.",
    category: "fire",
    accent: "#ff9f43",
    template: "fire-embers",
    durationInFrames: 150,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "count", label: "Particle count", type: "number" },
      { key: "direction", label: "Direction", type: "select", options: [{"label":"Rising","value":"up"},{"label":"Falling","value":"down"}] },
      { key: "accent", label: "Ember color", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "Embers",
      "count": 48,
      "direction": "up",
      "accent": "#ff9f43",
      "bg": "#08040a"
    },
  },
  {
    ...base,
    id: "fire-explosion",
    name: "Fire explosion",
    description: "Radial blast with shockwave and sparks.",
    category: "fire",
    accent: "#ff3b00",
    template: "fire-explosion",
    durationInFrames: 110,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "accent", label: "Blast color", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "BOOM",
      "accent": "#ff3b00",
      "bg": "#050000"
    },
  },
  {
    ...base,
    id: "fire-heat-haze",
    name: "Heat haze title",
    description: "Title shimmering over rising ground flames.",
    category: "fire",
    accent: "#ff6a00",
    template: "fire-heat-haze",
    durationInFrames: 120,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "HEAT WARNING",
      "subtitle": "Temperatures rising",
      "accent": "#ff6a00",
      "bg": "#0a0608"
    },
  },
  {
    ...base,
    id: "fire-inferno",
    name: "Inferno wash",
    description: "Full-screen wall of fire with title burn-in.",
    category: "fire",
    accent: "#ff3b00",
    template: "fire-inferno",
    durationInFrames: 140,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "intensity", label: "Intensity", type: "number", hint: "0.5 – 2 recommended" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "INFERNO",
      "intensity": 1,
      "accent": "#ff3b00",
      "bg": "#0a0202"
    },
  },
  {
    ...base,
    id: "fire-match",
    name: "Match strike",
    description: "Match slides in, tip sparks, flame blooms.",
    category: "fire",
    accent: "#ff7a18",
    template: "fire-match",
    durationInFrames: 130,
    fields: [
      { key: "label", label: "Caption", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "label": "It only takes a spark",
      "accent": "#ff7a18",
      "bg": "#060308"
    },
  },
  {
    ...base,
    id: "fire-ring",
    name: "Fire ring portal",
    description: "Expanding flaming ring with center title.",
    category: "fire",
    accent: "#ff5a00",
    template: "fire-ring",
    durationInFrames: 130,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "accent", label: "Ring color", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "ENTER",
      "subtitle": "Through the flames",
      "accent": "#ff5a00",
      "bg": "#050208"
    },
  },
  {
    ...base,
    id: "fire-text-burn",
    name: "Fire text burn",
    description: "Letters rise through flame glow with ground fire.",
    category: "fire",
    accent: "#ff6a00",
    template: "fire-text-burn",
    durationInFrames: 120,
    fields: [
      { key: "text", label: "Text", type: "text" },
      { key: "accent", label: "Flame color", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "text": "ON FIRE",
      "accent": "#ff6a00",
      "bg": "#08040a"
    },
  },
  {
    ...base,
    id: "yt-connection",
    name: "Connection reveal",
    description: "A → B boxes with drawing link — connect two beats of the story.",
    category: "yt",
    accent: "#e63946",
    template: "yt-connection",
    durationInFrames: 120,
    fields: [
      { key: "fromLabel", label: "From", type: "text" },
      { key: "toLabel", label: "To", type: "text" },
      { key: "claim", label: "Claim line", type: "textarea" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "fromLabel": "Protest site",
      "toLabel": "Decision makers",
      "claim": "A direct line between the street and the statement.",
      "accent": "#e63946",
      "bg": "#07090e"
    },
  },
  {
    ...base,
    id: "yt-dark-quote",
    name: "Dark quote card",
    description: "Italic quote with red rule — witness / statement beat.",
    category: "yt",
    accent: "#e63946",
    template: "yt-dark-quote",
    durationInFrames: 120,
    fields: [
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "attribution", label: "Attribution", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "quote": "We were never told the full story.",
      "attribution": "— On-ground witness",
      "accent": "#e63946",
      "bg": "#07090e"
    },
  },
  {
    ...base,
    id: "yt-date-rail",
    name: "Date rail timeline",
    description: "Horizontal date nodes for protest / files chronology.",
    category: "yt",
    accent: "#e63946",
    template: "yt-date-rail",
    durationInFrames: 140,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "events", label: "Events", type: "textarea", hint: "One per line: Year|Label" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "Timeline",
      "events": "2015|First reportsn2019|Public confrontationn2021|Documents surfacen2024|Fresh questions",
      "accent": "#e63946",
      "bg": "#07090e"
    },
  },
  {
    ...base,
    id: "yt-evidence-board",
    name: "Evidence board",
    description: "Three photos linked by drawing strings — conspiracy / network board.",
    category: "yt",
    accent: "#e63946",
    template: "yt-evidence-board",
    durationInFrames: 140,
    fields: [
      { key: "title", label: "Board title", type: "text" },
      { key: "label1", label: "Card 1 label", type: "text" },
      { key: "image1", label: "Card 1 photo", type: "image" },
      { key: "label2", label: "Card 2 label", type: "text" },
      { key: "image2", label: "Card 2 photo", type: "image" },
      { key: "label3", label: "Card 3 label", type: "text" },
      { key: "image3", label: "Card 3 photo", type: "image" },
      { key: "accent", label: "String color", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "The network",
      "label1": "Person A",
      "image1": "",
      "label2": "Person B",
      "image2": "",
      "label3": "Person C",
      "image3": "",
      "accent": "#e63946",
      "bg": "#0a0c10"
    },
  },
  {
    ...base,
    id: "yt-fact-cascade",
    name: "Fact cascade",
    description: "Bullets that slide in one by one — “what we know” beat.",
    category: "yt",
    accent: "#e63946",
    template: "yt-fact-cascade",
    durationInFrames: 140,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "facts", label: "Facts (one per line)", type: "textarea" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "What we know",
      "facts": "Thousands gathered at the sitenDemands were clear and repeatednOfficials issued conflicting statementsnTimeline still being pieced together",
      "accent": "#e63946",
      "bg": "#07090e"
    },
  },
  {
    ...base,
    id: "yt-location-pin",
    name: "Location pin drop",
    description: "Map-style pin slam for protest / place intros (e.g. Jantar Mantar).",
    category: "yt",
    accent: "#e63946",
    template: "yt-location-pin",
    durationInFrames: 120,
    fields: [
      { key: "place", label: "Place", type: "text" },
      { key: "city", label: "City / region", type: "text" },
      { key: "detail", label: "Detail", type: "textarea" },
      { key: "accent", label: "Pin color", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "place": "Jantar Mantar",
      "city": "New Delhi",
      "detail": "The ground where voices gathered.",
      "accent": "#e63946",
      "bg": "#0a1018"
    },
  },
  {
    ...base,
    id: "yt-part-bumper",
    name: "Part / chapter bumper",
    description: "PART 01 style section divider between story chapters.",
    category: "yt",
    accent: "#e63946",
    template: "yt-part-bumper",
    durationInFrames: 90,
    fields: [
      { key: "part", label: "Part label", type: "text" },
      { key: "title", label: "Chapter title", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "part": "PART 01",
      "title": "How it started",
      "accent": "#e63946",
      "bg": "#05070b"
    },
  },
  {
    ...base,
    id: "yt-person-card",
    name: "Person dossier card",
    description: "Portrait + role + detail — introduce a key figure.",
    category: "yt",
    accent: "#e63946",
    template: "yt-person-card",
    durationInFrames: 120,
    fields: [
      { key: "imageUrl", label: "Portrait", type: "image" },
      { key: "name", label: "Name", type: "text" },
      { key: "role", label: "Role", type: "text" },
      { key: "detail", label: "Detail", type: "textarea" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "imageUrl": "",
      "name": "Unknown Subject",
      "role": "Key figure",
      "detail": "Appears across multiple documents and timelines.",
      "accent": "#e63946",
      "bg": "#07090e"
    },
  },
  {
    ...base,
    id: "yt-photo-lower",
    name: "Photo lower-third",
    description: "Slow photo zoom with caption bar — B-roll style.",
    category: "yt",
    accent: "#e63946",
    template: "yt-photo-lower",
    durationInFrames: 110,
    fields: [
      { key: "imageUrl", label: "Photo", type: "image" },
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "imageUrl": "",
      "title": "On the ground",
      "subtitle": "Crowds fill the avenue as night falls",
      "accent": "#e63946"
    },
  },
  {
    ...base,
    id: "yt-question-hook",
    name: "Question hook",
    description: "BUT + big question — tension beat before the reveal.",
    category: "yt",
    accent: "#e63946",
    template: "yt-question-hook",
    durationInFrames: 100,
    fields: [
      { key: "prefix", label: "Prefix", type: "text" },
      { key: "question", label: "Question", type: "textarea" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "prefix": "BUT",
      "question": "Why did nobody stop it?",
      "accent": "#e63946",
      "bg": "#05070b"
    },
  },
  {
    ...base,
    id: "yt-reality-stamp",
    name: "Reality stamp",
    description: "REALITY / EXPOSED stamp slam — dark-truth beat.",
    category: "yt",
    accent: "#e63946",
    template: "yt-reality-stamp",
    durationInFrames: 100,
    fields: [
      { key: "stamp", label: "Stamp text", type: "text" },
      { key: "line", label: "Supporting line", type: "text" },
      { key: "accent", label: "Stamp color", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "stamp": "REALITY",
      "line": "What the cameras didn’t show",
      "accent": "#e63946",
      "bg": "#05070b"
    },
  },
  {
    ...base,
    id: "yt-redacted-file",
    name: "Redacted case file",
    description: "Dossier page with CLASSIFIED stamp and black redaction bars.",
    category: "yt",
    accent: "#e63946",
    template: "yt-redacted-file",
    durationInFrames: 120,
    fields: [
      { key: "stamp", label: "Stamp text", type: "text" },
      { key: "title", label: "File title", type: "text" },
      { key: "line1", label: "Line 1", type: "text" },
      { key: "line2", label: "Line 2", type: "text" },
      { key: "line3", label: "Line 3 (redacted)", type: "text" },
      { key: "accent", label: "Stamp color", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "stamp": "CLASSIFIED",
      "title": "Case File 09",
      "line1": "Subject: Network of influence",
      "line2": "Status: Under review",
      "line3": "Pages: ████████  ·  ███",
      "accent": "#e63946",
      "bg": "#0b0e14"
    },
  },
  {
    ...base,
    id: "yt-source-strip",
    name: "Source strip",
    description: "“According to…” credibility lower bar.",
    category: "yt",
    accent: "#e63946",
    template: "yt-source-strip",
    durationInFrames: 100,
    fields: [
      { key: "source", label: "Source line", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "source": "According to official records",
      "body": "Multiple filings mention the same sequence of meetings and transfers.",
      "accent": "#e63946",
      "bg": "#0a0c10"
    },
  },
  {
    ...base,
    id: "yt-stat-bomb",
    name: "Stat bomb",
    description: "Huge counting number for crowd size / money / pages.",
    category: "yt",
    accent: "#e63946",
    template: "yt-stat-bomb",
    durationInFrames: 120,
    fields: [
      { key: "value", label: "Number", type: "number" },
      { key: "suffix", label: "Suffix", type: "text" },
      { key: "label", label: "Label", type: "text" },
      { key: "caption", label: "Caption", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "value": 10000,
      "suffix": "+",
      "label": "People on the ground",
      "caption": "Estimated gathering size",
      "accent": "#e63946",
      "bg": "#07090e"
    },
  },
  {
    ...base,
    id: "yt-topic-slam",
    name: "Topic title slam",
    description: "Big hook title with red underline — classic topic-video opener.",
    category: "yt",
    accent: "#e63946",
    template: "yt-topic-slam",
    durationInFrames: 120,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "textarea" },
      { key: "highlight", label: "Phrase to underline", type: "text", hint: "Must appear inside the title" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "eyebrow": "THE REAL STORY",
      "title": "What was really happening?",
      "highlight": "really happening",
      "accent": "#e63946",
      "bg": "#07090e"
    },
  },
  {
    ...base,
    id: "yt-year-punch",
    name: "Year punch",
    description: "Counting years that slam into the key date — Nitish timeline beat.",
    category: "yt",
    accent: "#e63946",
    template: "yt-year-punch",
    durationInFrames: 120,
    fields: [
      { key: "year", label: "Target year", type: "number" },
      { key: "label", label: "Label", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "year": 2019,
      "label": "THE TURNING POINT",
      "subtitle": "Everything changed after this.",
      "accent": "#e63946",
      "bg": "#05070b"
    },
  },
  {
    ...base,
    id: "timeline-eras",
    name: "Era blocks",
    description: "Chapter columns grow in height for decade / era storytelling.",
    category: "timeline",
    accent: "#e8a54b",
    template: "timeline-eras",
    durationInFrames: 140,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "events", label: "Eras", type: "textarea", hint: "One per line: Range|Name|Detail" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "Eras",
      "events": "1947–1964|Nehru years|Nation building\n1965–1984|Trials|Wars & shifts\n1991–2010|Opening|Reform age\n2014–now|Present|New mandate",
      "accent": "#e8a54b",
      "bg": "#120e0a"
    },
  },
  {
    ...base,
    id: "timeline-focus",
    name: "Focus event spotlight",
    description: "One event fills the frame while a mini-timeline runs underneath (history-channel style).",
    category: "timeline",
    accent: "#5b8cff",
    template: "timeline-focus",
    durationInFrames: 130,
    fields: [
      { key: "title", label: "Eyebrow", type: "text" },
      { key: "events", label: "Events", type: "textarea", hint: "One per line: Year|Title|Detail" },
      { key: "focusIndex", label: "Focus index (0-based)", type: "number", hint: "Which event is spotlighted in the big card" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "In focus",
      "events": "1947|Independence|Freedom at midnight\n1950|Republic|Constitution adopted\n1991|Reforms|Liberalization begins\n2014|Mandate|New chapter\n2024|Present|A rising chapter",
      "focusIndex": 2,
      "accent": "#5b8cff",
      "bg": "#0a0e18"
    },
  },
  {
    ...base,
    id: "timeline-journey",
    name: "Journey steps",
    description: "Numbered steps with connecting dashes drawing between them.",
    category: "timeline",
    accent: "#c4f542",
    template: "timeline-journey",
    durationInFrames: 140,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "events", label: "Steps", type: "textarea", hint: "One per line: 01|Title|Detail" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "How it unfolded",
      "events": "01|Spark|The idea takes hold\n02|Build|Institutions rise\n03|Test|Crisis & resolve\n04|Leap|A new chapter",
      "accent": "#c4f542",
      "bg": "#0c140c"
    },
  },
  {
    ...base,
    id: "timeline-milestones",
    name: "Milestone cards",
    description: "Cards alternate above/below a growing center line.",
    category: "timeline",
    accent: "#7dd3a0",
    template: "timeline-milestones",
    durationInFrames: 140,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "events", label: "Events (max 5)", type: "textarea", hint: "One per line: Year|Title|Detail" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "Turning points",
      "events": "1947|Independence|Freedom\n1950|Republic|Constitution\n1991|Reforms|Markets open\n2014|Mandate|New era\n2024|Present|Next chapter",
      "accent": "#7dd3a0",
      "bg": "#081410"
    },
  },
  {
    ...base,
    id: "timeline-nodes",
    name: "Horizontal node timeline",
    description: "Lottie-style rail: line draws, nodes pop, labels rise. Great for milestone beats.",
    category: "timeline",
    accent: "#3dd6c6",
    template: "timeline-nodes",
    durationInFrames: 140,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "events", label: "Events", type: "textarea", hint: "One per line: Year|Title|Detail  (e.g. 1947|Independence|Freedom at midnight)" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "lineColor", label: "Track color", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "Key milestones",
      "events": "1947|Independence|Freedom at midnight\n1950|Republic|Constitution adopted\n1991|Reforms|Liberalization begins\n2014|Mandate|New chapter\n2024|Present|A rising chapter",
      "accent": "#3dd6c6",
      "lineColor": "#2a3a48",
      "bg": "#0a1218"
    },
  },
  {
    ...base,
    id: "timeline-chapters",
    name: "Chapter wipe",
    description: "Full-bleed documentary chapters wipe in sequence — year + title per beat.",
    category: "timeline",
    accent: "#ff6b4a",
    template: "timeline-chapters",
    durationInFrames: 160,
    fields: [
      { key: "title", label: "Eyebrow", type: "text" },
      { key: "events", label: "Chapters", type: "textarea", hint: "One per line: Year|Title|Detail" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "title": "Chapters",
      "events": "1947|Independence|Freedom at midnight\n1950|Republic|Constitution adopted\n1991|Reforms|Economy opens\n2014|Mandate|A new chapter",
      "accent": "#ff6b4a"
    },
  },
  {
    ...base,
    id: "timeline-ring",
    name: "Progress ring",
    description: "Circular percent timeline / completion bumper.",
    category: "timeline",
    accent: "#3dd6c6",
    template: "timeline-ring",
    durationInFrames: 120,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "label", label: "Label", type: "text" },
      { key: "percent", label: "Percent", type: "number" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "Progress",
      "label": "Complete",
      "percent": 72,
      "accent": "#3dd6c6",
      "bg": "#071018"
    },
  },
  {
    ...base,
    id: "timeline-vertical",
    name: "Vertical event timeline",
    description: "Spine grows downward as dated events slide in — doc explainer style.",
    category: "timeline",
    accent: "#d8a11a",
    template: "timeline-vertical",
    durationInFrames: 150,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "events", label: "Events", type: "textarea", hint: "One per line: Year|Title|Detail" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "The story so far",
      "events": "1947|Independence|Freedom at midnight\n1965|Conflict|A defining war\n1991|Reforms|Economy opens\n2014|Mandate|Voters redraw the map\n2024|Present|Looking ahead",
      "accent": "#d8a11a",
      "bg": "#071018"
    },
  },
  {
    ...base,
    id: "timeline-year-scrub",
    name: "Year rail scrub",
    description: "Big counting year with a playhead scrubbing the rail — classic YouTube history beat.",
    category: "timeline",
    accent: "#ff6b4a",
    template: "timeline-year-scrub",
    durationInFrames: 120,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "startYear", label: "Start year", type: "number" },
      { key: "endYear", label: "End year", type: "number" },
      { key: "markerYears", label: "Marker years", type: "text", hint: "Comma-separated years shown under the rail" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "Across the decades",
      "startYear": 1947,
      "endYear": 2026,
      "markerYears": "1947, 1965, 1991, 2014, 2024",
      "accent": "#ff6b4a",
      "bg": "#0b1020"
    },
  },
  {
    ...base,
    id: "india-chakra",
    name: "Ashoka Chakra spin",
    description: "Spinning 24-spoke chakra with configurable motto text.",
    category: "india",
    accent: "#000080",
    template: "india-chakra",
    durationInFrames: 120,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "spokes", label: "Spokes", type: "number" },
      { key: "accent", label: "Chakra color", type: "color" },
      { key: "bg", label: "Background", type: "color" }
    ],
    defaults: {
      "title": "Truth alone triumphs",
      "subtitle": "Satyameva Jayate",
      "spokes": 24,
      "accent": "#000080",
      "bg": "#fff8f0"
    },
  },
  {
    ...base,
    id: "india-diversity",
    name: "Diversity chips",
    description: "Languages / states chips — comma-separated list.",
    category: "india",
    accent: "#138808",
    template: "india-diversity",
    durationInFrames: 120,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "items", label: "Items (comma separated)", type: "textarea", hint: "Example: Hindi, Tamil, Bengali, Marathi" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "title": "Many languages, one nation",
      "items": "Hindi, English, Tamil, Bengali, Marathi, Telugu, Gujarati, Kannada",
      "accent": "#138808"
    },
  },
  {
    ...base,
    id: "india-festival",
    name: "Festival burst",
    description: "Diwali-style particle burst with configurable greeting.",
    category: "india",
    accent: "#FF9933",
    template: "india-festival",
    durationInFrames: 120,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "particleCount", label: "Particles", type: "number" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "title": "Happy Diwali",
      "subtitle": "Festival of lights",
      "particleCount": 36,
      "accent": "#FF9933"
    },
  },
  {
    ...base,
    id: "india-map-pulse",
    name: "India map pulse",
    description: "Real India outline zoom + glow with configurable fact line.",
    category: "india",
    accent: "#FF9933",
    template: "india-map-pulse",
    durationInFrames: 140,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "fact", label: "Fact line", type: "textarea" },
      { key: "highlight", label: "Highlight phrase", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "title": "INDIA",
      "subtitle": "Unity in diversity",
      "fact": "1.4 billion stories",
      "highlight": "1.4 billion",
      "accent": "#FF9933"
    },
  },
  {
    ...base,
    id: "india-preamble",
    name: "Preamble type-on",
    description: "Constitution-style typewriter card.",
    category: "india",
    accent: "#FF9933",
    template: "india-preamble",
    durationInFrames: 140,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "body", label: "Body text", type: "textarea" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "eyebrow": "WE, THE PEOPLE OF INDIA",
      "body": "having solemnly resolved to constitute India into a Sovereign Socialist Secular Democratic Republic...",
      "accent": "#FF9933"
    },
  },
  {
    ...base,
    id: "india-rupee",
    name: "Rupee growth bumper",
    description: "Big ₹ number animation for economy / budget beats.",
    category: "india",
    accent: "#FF9933",
    template: "india-rupee",
    durationInFrames: 120,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "prefix", label: "Prefix", type: "text" },
      { key: "value", label: "Number", type: "number" },
      { key: "suffix", label: "Suffix", type: "text" },
      { key: "caption", label: "Caption", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "title": "Economy snapshot",
      "prefix": "₹",
      "value": 4.1,
      "suffix": "T",
      "caption": "GDP milestone",
      "accent": "#FF9933"
    },
  },
  {
    ...base,
    id: "india-score",
    name: "Score bumper",
    description: "Cricket-style lower scoreboard bumper.",
    category: "india",
    accent: "#FF9933",
    template: "india-score",
    durationInFrames: 120,
    fields: [
      { key: "team", label: "Team", type: "text" },
      { key: "score", label: "Score", type: "text" },
      { key: "overs", label: "Overs", type: "text" },
      { key: "status", label: "Status line", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "team": "IND",
      "score": "342/4",
      "overs": "48.2",
      "status": "Need 38 from 10 balls",
      "accent": "#FF9933"
    },
  },
  {
    ...base,
    id: "india-tricolor-rise",
    name: "Tricolor meaning rise",
    description: "Three rising bars for saffron, white, and green meanings.",
    category: "india",
    accent: "#FF9933",
    template: "india-tricolor-rise",
    durationInFrames: 120,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "line1", label: "Saffron line", type: "text" },
      { key: "line2", label: "White line", type: "text" },
      { key: "line3", label: "Green line", type: "text" }
    ],
    defaults: {
      "title": "Tiranga",
      "line1": "Saffron — Courage",
      "line2": "White — Truth",
      "line3": "Green — Faith"
    },
  },
  {
    ...base,
    id: "india-years",
    name: "Years of freedom",
    description: "Counting years from independence to a target year.",
    category: "india",
    accent: "#FF9933",
    template: "india-years",
    durationInFrames: 120,
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "startYear", label: "Start year", type: "number" },
      { key: "endYear", label: "End year", type: "number" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "label": "Years of Independence",
      "startYear": 1947,
      "endYear": 2026,
      "accent": "#FF9933"
    },
  },
  {
    ...base,
    id: "short-big-claim",
    name: "Big claim slam",
    description: "Shorts opener — bold claim with highlight underline.",
    category: "shorts",
    accent: "#FF9933",
    template: "short-big-claim",
    durationInFrames: 120,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "claim", label: "Claim", type: "textarea" },
      { key: "highlight", label: "Highlight phrase", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "eyebrow": "HISTORY CHECK",
      "claim": "The Most Powerful Government of All Time",
      "highlight": "Most Powerful",
      "accent": "#FF9933"
    },
  },
  {
    ...base,
    id: "short-era",
    name: "Era stamp",
    description: "Decade/era stamp overlay (e.g. 2014—2024).",
    category: "shorts",
    accent: "#FF9933",
    template: "short-era",
    durationInFrames: 120,
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "era", label: "Era text", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "label": "A DEFINING DECADE",
      "era": "2014 — 2024",
      "accent": "#FF9933"
    },
  },
  {
    ...base,
    id: "short-flag-wipe",
    name: "Tricolor wipe",
    description: "Saffron–white–green wipe transition for India-focused shorts.",
    category: "shorts",
    accent: "#FF9933",
    template: "short-flag-wipe",
    durationInFrames: 90,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" }
    ],
    defaults: {
      "title": "INDIA",
      "subtitle": "A new chapter"
    },
  },
  {
    ...base,
    id: "short-kinetic",
    name: "Kinetic words",
    description: "Word-by-word hook text for vertical Shorts pacing.",
    category: "shorts",
    accent: "#FF9933",
    template: "short-kinetic",
    durationInFrames: 120,
    fields: [
      { key: "text", label: "Words", type: "textarea" },
      { key: "accent", label: "Last-word color", type: "color" }
    ],
    defaults: {
      "text": "Strong Stable Decisive Mandate",
      "accent": "#FF9933"
    },
  },
  {
    ...base,
    id: "short-leader",
    name: "Leader portrait reveal",
    description: "Portrait + name + years — swap photo and copy.",
    category: "shorts",
    accent: "#FF9933",
    template: "short-leader",
    durationInFrames: 120,
    fields: [
      { key: "imageUrl", label: "Portrait", type: "image" },
      { key: "name", label: "Name", type: "text" },
      { key: "role", label: "Role", type: "text" },
      { key: "years", label: "Years", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "imageUrl": "",
      "name": "Leader Name",
      "role": "Prime Minister",
      "years": "2014 — Present",
      "accent": "#FF9933"
    },
  },
  {
    ...base,
    id: "short-majority",
    name: "Majority / seats meter",
    description: "Animated seats meter with majority mark line.",
    category: "shorts",
    accent: "#FF9933",
    template: "short-majority",
    durationInFrames: 110,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "label", label: "Label", type: "text" },
      { key: "seats", label: "Seats", type: "number" },
      { key: "total", label: "Total seats", type: "number" },
      { key: "majorityMark", label: "Majority mark", type: "number" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "title": "Lok Sabha strength",
      "label": "Seats won",
      "seats": 303,
      "total": 543,
      "majorityMark": 272,
      "accent": "#FF9933"
    },
  },
  {
    ...base,
    id: "short-montage",
    name: "Photo montage grid",
    description: "2×2 photo montage with caption — upload four images.",
    category: "shorts",
    accent: "#FF9933",
    template: "short-montage",
    durationInFrames: 120,
    fields: [
      { key: "image1", label: "Photo 1", type: "image" },
      { key: "image2", label: "Photo 2", type: "image" },
      { key: "image3", label: "Photo 3", type: "image" },
      { key: "image4", label: "Photo 4", type: "image" },
      { key: "caption", label: "Caption", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "image1": "",
      "image2": "",
      "image3": "",
      "image4": "",
      "caption": "A decade of decisions",
      "accent": "#FF9933"
    },
  },
  {
    ...base,
    id: "short-rank",
    name: "Rank badge slam",
    description: "#1 / most-powerful badge slam for Shorts hooks.",
    category: "shorts",
    accent: "#FF9933",
    template: "short-rank",
    durationInFrames: 120,
    fields: [
      { key: "rank", label: "Rank", type: "text" },
      { key: "label", label: "Label", type: "text" },
      { key: "sublabel", label: "Sublabel", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "rank": "#1",
      "label": "Most Powerful",
      "sublabel": "In independent India",
      "accent": "#FF9933"
    },
  },
  {
    ...base,
    id: "short-vs",
    name: "Then vs Now",
    description: "Split comparison panel used in political explainers.",
    category: "shorts",
    accent: "#FF9933",
    template: "short-vs",
    durationInFrames: 120,
    fields: [
      { key: "leftTitle", label: "Left title", type: "text" },
      { key: "leftText", label: "Left text", type: "textarea" },
      { key: "rightTitle", label: "Right title", type: "text" },
      { key: "rightText", label: "Right text", type: "textarea" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "leftTitle": "THEN",
      "leftText": "Fragile coalition",
      "rightTitle": "NOW",
      "rightText": "Full majority",
      "accent": "#FF9933"
    },
  },
  {
    ...base,
    id: "airplane-route",
    name: "Airplane route map",
    description: "Real great-circle flight path on a d3-geo orthographic globe (world-atlas).",
    category: "maps",
    accent: "#5ce1ff",
    template: "airplane-route",
    durationInFrames: 140,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "fromPlace", label: "From country", type: "select", options: PLACE_OPTIONS },
      { key: "toPlace", label: "To country", type: "select", options: PLACE_OPTIONS },
      { key: "accent", label: "Plane color", type: "color" },
      { key: "lineColor", label: "Path color", type: "color" }
    ],
    defaults: {
      "title": "India to USA",
      "fromPlace": "india",
      "toPlace": "usa",
      "accent": "#d8a11a",
      "lineColor": "#5ce1ff"
    },
  },
  {
    ...base,
    id: "country-highlight",
    name: "Country highlight globe",
    description: "Documentary-style globe that draws and fills a real country outline.",
    category: "maps",
    accent: "#FF9933",
    template: "country-highlight",
    durationInFrames: 150,
    fields: [
      { key: "placeKey", label: "Country", type: "select", options: PLACE_OPTIONS },
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "accent", label: "Highlight color", type: "color" }
    ],
    defaults: {
      "placeKey": "india",
      "title": "INDIA",
      "subtitle": "SOUTH ASIA",
      "accent": "#FF9933"
    },
  },
  {
    ...base,
    id: "map-spotlight",
    name: "Map region spotlight",
    description: "Equirectangular world map with a real country spotlight pulse.",
    category: "maps",
    accent: "#d8a11a",
    template: "map-spotlight",
    durationInFrames: 120,
    fields: [
      { key: "placeKey", label: "Country", type: "select", options: PLACE_OPTIONS },
      { key: "region", label: "Region label", type: "text" },
      { key: "fact", label: "Fact line", type: "textarea" },
      { key: "highlight", label: "Highlight phrase", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "placeKey": "india",
      "region": "South Asia",
      "fact": "Fastest growing internet region",
      "highlight": "Fastest growing",
      "accent": "#d8a11a"
    },
  },
  {
    ...base,
    id: "zoom-location",
    name: "Zoom into country",
    description: "Camera zooms into a real country on an orthographic globe.",
    category: "maps",
    accent: "#d8a11a",
    template: "zoom-location",
    durationInFrames: 130,
    fields: [
      { key: "placeKey", label: "Country", type: "select", options: PLACE_OPTIONS },
      { key: "city", label: "City label", type: "text" },
      { key: "detail", label: "Detail line", type: "textarea" },
      { key: "highlight", label: "Highlight phrase", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "placeKey": "india",
      "city": "Mumbai",
      "detail": "Financial capital under pressure",
      "highlight": "pressure",
      "accent": "#d8a11a"
    },
  },
  {
    ...base,
    id: "globe-spin",
    name: "3D Earth globe",
    description: "Textured blue-marble Earth (Three.js) with stars and a real lat/lon pin.",
    category: "3d",
    accent: "#d8a11a",
    template: "globe-spin",
    durationInFrames: 150,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "placeKey", label: "Focus country", type: "select", options: PLACE_OPTIONS },
      { key: "pinLabel", label: "Pin label", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "title": "Around the world",
      "subtitle": "Global stories, animated",
      "placeKey": "india",
      "pinLabel": "New Delhi",
      "accent": "#d8a11a"
    },
  },
  {
    ...base,
    id: "headline-slam",
    name: "Headline slam",
    description: "Bold news-style title with highlight control.",
    category: "text",
    accent: "#d8a11a",
    template: "headline-slam",
    durationInFrames: 120,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "highlight", label: "Highlight phrase", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "eyebrow": "Tonight",
      "headline": "The deal nobody voted for",
      "highlight": "nobody voted",
      "accent": "#d8a11a"
    },
  },
  {
    ...base,
    id: "quote-callout",
    name: "Quote callout",
    description: "Large quote with attribution and phrase underline.",
    category: "text",
    accent: "#d8a11a",
    template: "quote-callout",
    durationInFrames: 120,
    fields: [
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "highlight", label: "Highlight phrase", type: "text" },
      { key: "attribution", label: "Attribution", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "quote": "Democracy dies in darkness",
      "highlight": "darkness",
      "attribution": "— Editorial board",
      "accent": "#d8a11a"
    },
  },
  {
    ...base,
    id: "text-both",
    name: "Highlight + underline",
    description: "Combine marker fill and animated underline for emphasis.",
    category: "text",
    accent: "#ff8b7a",
    template: "text-both",
    durationInFrames: 120,
    fields: [
      { key: "text", label: "Main text", type: "textarea" },
      { key: "highlight", label: "Word / phrase to highlight", type: "text", hint: "Must appear inside the main text" },
      { key: "mode", label: "Highlight style", type: "select", options: [{"label":"Underline draw","value":"underline"},{"label":"Marker highlight","value":"marker"},{"label":"Both","value":"both"}] },
      { key: "accent", label: "Accent color", type: "color" },
      { key: "textColor", label: "Text color", type: "color" }
    ],
    defaults: {
      "text": "Nobody asked for this trade-off",
      "highlight": "trade-off",
      "mode": "both",
      "accent": "#ff8b7a",
      "textColor": "#e8f0ea"
    },
  },
  {
    ...base,
    id: "text-marker",
    name: "Marker highlight",
    description: "Yellow-marker style fill behind the words you choose.",
    category: "text",
    accent: "#f0d35a",
    template: "text-marker",
    durationInFrames: 120,
    fields: [
      { key: "text", label: "Main text", type: "textarea" },
      { key: "highlight", label: "Word / phrase to highlight", type: "text", hint: "Must appear inside the main text" },
      { key: "mode", label: "Highlight style", type: "select", options: [{"label":"Underline draw","value":"underline"},{"label":"Marker highlight","value":"marker"},{"label":"Both","value":"both"}] },
      { key: "accent", label: "Accent color", type: "color" },
      { key: "textColor", label: "Text color", type: "color" }
    ],
    defaults: {
      "text": "The real cost was hidden in the fine print",
      "highlight": "fine print",
      "mode": "marker",
      "accent": "#f0d35a",
      "textColor": "#e8f0ea"
    },
  },
  {
    ...base,
    id: "text-underline",
    name: "Text underline draw",
    description: "Classic explainer move — draw a line under the key phrase.",
    category: "text",
    accent: "#d8a11a",
    template: "text-underline",
    durationInFrames: 120,
    fields: [
      { key: "text", label: "Main text", type: "textarea" },
      { key: "highlight", label: "Word / phrase to highlight", type: "text", hint: "Must appear inside the main text" },
      { key: "mode", label: "Highlight style", type: "select", options: [{"label":"Underline draw","value":"underline"},{"label":"Marker highlight","value":"marker"},{"label":"Both","value":"both"}] },
      { key: "accent", label: "Accent color", type: "color" },
      { key: "textColor", label: "Text color", type: "color" }
    ],
    defaults: {
      "text": "This policy changed everything",
      "highlight": "everything",
      "mode": "underline",
      "accent": "#d8a11a",
      "textColor": "#e8f0ea"
    },
  },
  {
    ...base,
    id: "before-after",
    name: "Before / after wipe",
    description: "Two photos with an animated wipe reveal.",
    category: "photos",
    accent: "#d8a11a",
    template: "before-after",
    durationInFrames: 120,
    fields: [
      { key: "beforeImage", label: "Before photo", type: "image" },
      { key: "afterImage", label: "After photo", type: "image" },
      { key: "beforeLabel", label: "Before label", type: "text" },
      { key: "afterLabel", label: "After label", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "beforeImage": "",
      "afterImage": "",
      "beforeLabel": "Before",
      "afterLabel": "After",
      "accent": "#d8a11a"
    },
  },
  {
    ...base,
    id: "person-card",
    name: "Person card",
    description: "Portrait + name + quote — change photo and highlight words.",
    category: "photos",
    accent: "#d8a11a",
    template: "person-card",
    durationInFrames: 120,
    fields: [
      { key: "imageUrl", label: "Portrait", type: "image" },
      { key: "name", label: "Name", type: "text" },
      { key: "role", label: "Role", type: "text" },
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "highlight", label: "Highlight phrase", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "imageUrl": "",
      "name": "Alex Morgan",
      "role": "Policy Analyst",
      "quote": "The numbers tell a different story",
      "highlight": "different story",
      "accent": "#d8a11a"
    },
  },
  {
    ...base,
    id: "photo-kenburns",
    name: "Photo Ken Burns",
    description: "Swap the photo, caption, and which words get underlined.",
    category: "photos",
    accent: "#d8a11a",
    template: "photo-kenburns",
    durationInFrames: 120,
    fields: [
      { key: "imageUrl", label: "Photo", type: "image" },
      { key: "caption", label: "Caption", type: "textarea" },
      { key: "highlight", label: "Highlight phrase", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "imageUrl": "",
      "caption": "A moment that shaped the decade",
      "highlight": "decade",
      "accent": "#d8a11a"
    },
  },
  {
    ...base,
    id: "d3-area",
    name: "D3 area chart",
    description: "Filled area trend using D3 area + line generators.",
    category: "charts",
    accent: "#7ddea2",
    template: "d3-area",
    durationInFrames: 130,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "accent", label: "Fill color", type: "color" }
    ],
    defaults: {
      "title": "Area trend",
      "dataJson": "JSON.stringify(SAMPLE_BARS"
    },
  },
  {
    ...base,
    id: "d3-bar",
    name: "D3 bar chart",
    description: "Vertical bars with D3 band/linear scales and value labels.",
    category: "charts",
    accent: "#d8a11a",
    template: "d3-bar",
    durationInFrames: 120,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "yLabel", label: "Y-axis label", type: "text" },
      { key: "accent", label: "Accent color", type: "color" }
    ],
    defaults: {
      "title": "Year-over-year growth",
      "yLabel": "Index",
      "dataJson": "JSON.stringify(SAMPLE_BARS"
    },
  },
  {
    ...base,
    id: "d3-donut",
    name: "D3 donut chart",
    description: "Configurable donut slices powered by D3 pie layout.",
    category: "charts",
    accent: "#5ce1ff",
    template: "d3-donut",
    durationInFrames: 130,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "accent", label: "Accent color", type: "color" }
    ],
    defaults: {
      "title": "Share of total",
      "dataJson": "JSON.stringify(SAMPLE_BUDGET"
    },
  },
  {
    ...base,
    id: "d3-gauge",
    name: "D3 progress gauge",
    description: "Arc gauge for a single percentage KPI.",
    category: "charts",
    accent: "#d8a11a",
    template: "d3-gauge",
    durationInFrames: 120,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "label", label: "Caption", type: "text" },
      { key: "value", label: "Percent", type: "number" },
      { key: "accent", label: "Accent color", type: "color" }
    ],
    defaults: {
      "title": "Completion",
      "label": "Target met",
      "value": 72,
      "accent": "#d8a11a"
    },
  },
  {
    ...base,
    id: "d3-grouped-bar",
    name: "D3 grouped bars",
    description: "Multi-series grouped bars — edit series in a simple table.",
    category: "charts",
    accent: "#d8a11a",
    template: "d3-grouped-bar",
    durationInFrames: 130,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "accent", label: "Accent color", type: "color" }
    ],
    defaults: {
      "title": "Urban vs rural",
      "dataJson": "JSON.stringify(SAMPLE_SERIES"
    },
  },
  {
    ...base,
    id: "d3-hbar",
    name: "D3 horizontal bars",
    description: "Ranking-style horizontal bar chart with D3 scales.",
    category: "charts",
    accent: "#5ce1ff",
    template: "d3-hbar",
    durationInFrames: 120,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "accent", label: "Accent color", type: "color" }
    ],
    defaults: {
      "title": "Category ranking",
      "dataJson": "JSON.stringify(SAMPLE_BUDGET"
    },
  },
  {
    ...base,
    id: "d3-line",
    name: "D3 line chart",
    description: "Animated stroke draw along a D3 monotone curve.",
    category: "charts",
    accent: "#5ce1ff",
    template: "d3-line",
    durationInFrames: 130,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "accent", label: "Line color", type: "color" }
    ],
    defaults: {
      "title": "Trend over time",
      "dataJson": "JSON.stringify(SAMPLE_BARS"
    },
  },
  {
    ...base,
    id: "d3-multi-line",
    name: "D3 multi-line",
    description: "Compare multiple series with animated D3 line paths.",
    category: "charts",
    accent: "#ff8b7a",
    template: "d3-multi-line",
    durationInFrames: 140,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "accent", label: "Accent color", type: "color" }
    ],
    defaults: {
      "title": "Comparing trends",
      "dataJson": "JSON.stringify(SAMPLE_SERIES"
    },
  },
  {
    ...base,
    id: "d3-pie",
    name: "D3 pie chart",
    description: "Accurate multi-slice pie built with d3-shape / d3-scale.",
    category: "charts",
    accent: "#d8a11a",
    template: "d3-pie",
    durationInFrames: 130,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "accent", label: "Accent color", type: "color" }
    ],
    defaults: {
      "title": "Budget allocation",
      "dataJson": "JSON.stringify(SAMPLE_BUDGET"
    },
  },
  {
    ...base,
    id: "d3-stacked-bar",
    name: "D3 stacked bars",
    description: "Stacked composition chart using d3.stack().",
    category: "charts",
    accent: "#c089ff",
    template: "d3-stacked-bar",
    durationInFrames: 130,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "accent", label: "Accent color", type: "color" }
    ],
    defaults: {
      "title": "Stacked composition",
      "dataJson": "JSON.stringify(SAMPLE_SERIES"
    },
  },
  {
    ...base,
    id: "stat-counter",
    name: "Stat counter",
    description: "Counting number with a note line and highlight.",
    category: "charts",
    accent: "#d8a11a",
    template: "stat-counter",
    durationInFrames: 120,
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "value", label: "Target number", type: "number" },
      { key: "suffix", label: "Suffix", type: "text" },
      { key: "note", label: "Note", type: "textarea" },
      { key: "highlight", label: "Highlight phrase", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "label": "People affected",
      "value": 75,
      "suffix": "%",
      "note": "Across major cities in 2024",
      "highlight": "2024",
      "accent": "#d8a11a"
    },
  },
  {
    ...base,
    id: "timeline",
    name: "Timeline scrub",
    description: "Three-beat timeline for policy or product history.",
    category: "charts",
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
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "year1": "2019",
      "event1": "Policy draft",
      "year2": "2022",
      "event2": "Public backlash",
      "year3": "2025",
      "event3": "Reform passed",
      "accent": "#d8a11a"
    },
  },
  {
    ...base,
    id: "bullet-reveal",
    name: "Bullet reveal",
    description: "Three points that animate in with optional underline.",
    category: "ui",
    accent: "#d8a11a",
    template: "bullet-reveal",
    durationInFrames: 120,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "item1", label: "Point 1", type: "text" },
      { key: "item2", label: "Point 2", type: "text" },
      { key: "item3", label: "Point 3", type: "text" },
      { key: "highlight", label: "Highlight phrase", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "title": "Three key takeaways",
      "item1": "Budgets rose faster than wages",
      "item2": "Regional gaps widened",
      "item3": "Public trust fell sharply",
      "highlight": "trust",
      "accent": "#d8a11a"
    },
  },
  {
    ...base,
    id: "cta-button",
    name: "CTA subscribe",
    description: "End-screen call to action with highlight control.",
    category: "ui",
    accent: "#d8a11a",
    template: "cta-button",
    durationInFrames: 120,
    fields: [
      { key: "text", label: "Button text", type: "textarea" },
      { key: "highlight", label: "Highlight phrase", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "text": "Subscribe for more explainers",
      "highlight": "Subscribe",
      "accent": "#d8a11a"
    },
  },
  {
    ...base,
    id: "logo-pop",
    name: "Logo / brand pop",
    description: "Simple brand intro sting with tagline.",
    category: "ui",
    accent: "#d8a11a",
    template: "logo-pop",
    durationInFrames: 120,
    fields: [
      { key: "brand", label: "Brand", type: "text" },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "brand": "BestMotions",
      "tagline": "Motion that explains",
      "accent": "#d8a11a"
    },
  },
  {
    ...base,
    id: "lower-third",
    name: "Lower third",
    description: "Clean lower-third title bar for talking-head overlays.",
    category: "ui",
    accent: "#d8a11a",
    template: "lower-third",
    durationInFrames: 120,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "title": "Breaking context",
      "subtitle": "What the headlines missed",
      "accent": "#d8a11a"
    },
  },
  {
    ...base,
    id: "news-ticker",
    name: "News ticker",
    description: "Lower ticker with LIVE badge and scrolling highlight line.",
    category: "ui",
    accent: "#ff5a4a",
    template: "news-ticker",
    durationInFrames: 120,
    fields: [
      { key: "badge", label: "Badge", type: "text" },
      { key: "line", label: "Ticker line", type: "textarea" },
      { key: "highlight", label: "Highlight phrase", type: "text" },
      { key: "accent", label: "Accent", type: "color" }
    ],
    defaults: {
      "badge": "LIVE",
      "line": "Markets react as new climate rules take effect worldwide",
      "highlight": "climate rules",
      "accent": "#ff5a4a"
    },
  }
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
