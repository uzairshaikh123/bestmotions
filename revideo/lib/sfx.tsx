/** @jsxImportSource @revideo/2d/lib */
/**
 * Kenney Interface Sounds — CC0 1.0 (https://kenney.nl/assets/interface-sounds)
 * Loaded on demand from jsDelivr. Only the 2–4 cues a scene uses are fetched.
 *
 * Revideo only starts HTML audio inside Audio.draw(). Nodes with opacity 0 are
 * never drawn, so they stay silent in preview. Mount every cue at t=0 (so WAV
 * duration is known) and call play() when the hit is due.
 */
import { Audio } from "@revideo/2d";
import { createRef, str, waitFor } from "./helpers";
import { pause, timing } from "./timing";

const BASE =
  "https://cdn.jsdelivr.net/gh/Calinou/kenney-interface-sounds@master/addons/kenney_interface_sounds/";

type Cue =
  | "slide"
  | "open"
  | "drop"
  | "slam"
  | "scratch"
  | "tick"
  | "click"
  | "pop"
  | "select"
  | "switch"
  | "confirm"
  | "bong"
  | "glass"
  | "question"
  | "scroll";

const FILES: Record<Cue, string> = {
  slide: "maximize_008.wav",
  open: "open_002.wav",
  drop: "drop_002.wav",
  slam: "close_001.wav",
  scratch: "scratch_002.wav",
  tick: "tick_002.wav",
  click: "click_002.wav",
  pop: "pluck_001.wav",
  select: "select_004.wav",
  switch: "switch_001.wav",
  confirm: "confirmation_001.wav",
  bong: "bong_001.wav",
  glass: "glass_002.wav",
  question: "question_001.wav",
  scroll: "scroll_002.wav",
};

type Score = {
  intro?: Cue;
  hit?: Cue;
  accent?: Cue;
  ticks?: number;
};

type Hit = {
  cue: Cue;
  at: number;
  volume: number;
};

function url(cue: Cue) {
  return `${BASE}${FILES[cue]}`;
}

function scoreFor(template: string): Score {
  if (
    template.startsWith("news-") ||
    template === "photo-news-meet" ||
    template === "photo-pin"
  ) {
    return { intro: "open", hit: "drop", accent: "scratch" };
  }
  if (template.startsWith("book-") || isBook(template)) {
    if (
      template.includes("flip") ||
      template.includes("thumb") ||
      template === "page-flip" ||
      template === "thumb-through"
    ) {
      return { intro: "open", hit: "scroll", accent: "tick", ticks: 3 };
    }
    if (
      template.includes("marker") ||
      template.includes("underline") ||
      template.includes("highlight") ||
      template.includes("scan") ||
      template === "quote" ||
      template === "text-underline"
    ) {
      return { intro: "open", hit: "scratch", accent: "glass" };
    }
    if (template.includes("slam") || template === "tome" || template === "cover-slam") {
      return { intro: "slide", hit: "slam", accent: "drop" };
    }
    return { intro: "open", hit: "drop", accent: "select" };
  }
  if (template.startsWith("yt-")) {
    if (template.includes("question")) return { intro: "slide", hit: "question", accent: "bong" };
    if (template.includes("stat") || template.includes("year") || template.includes("stamp") || template.includes("slam")) {
      return { intro: "slide", hit: "bong", accent: "drop" };
    }
    if (template.includes("redact") || template.includes("evidence")) {
      return { intro: "open", hit: "scratch", accent: "tick", ticks: 2 };
    }
    if (template.includes("date") || template.includes("fact") || template.includes("cascade")) {
      return { intro: "slide", hit: "tick", ticks: 4 };
    }
    if (template.includes("location") || template.includes("pin")) {
      return { intro: "slide", hit: "drop", accent: "select" };
    }
    if (template.includes("connection")) return { intro: "select", hit: "switch", accent: "confirm" };
    return { intro: "slide", hit: "select", accent: "glass" };
  }
  if (template.startsWith("timeline-") || template === "timeline") {
    return { intro: "slide", hit: "tick", ticks: 5 };
  }
  if (template.startsWith("india-")) {
    return { intro: "slide", hit: "confirm", accent: "glass" };
  }
  if (template.startsWith("short-")) {
    return { intro: "slide", hit: "bong", accent: "confirm" };
  }
  if (template.startsWith("d3-") || template.startsWith("chart-") || template === "stat-counter") {
    return { intro: "pop", hit: "tick", ticks: 4, accent: "confirm" };
  }
  if (
    template === "airplane-route" ||
    template === "globe-spin" ||
    template === "country-highlight" ||
    template === "map-spotlight" ||
    template === "zoom-location"
  ) {
    return { intro: "slide", hit: "select", accent: "drop" };
  }
  if (template.startsWith("photo-") || template === "person-card" || template === "before-after") {
    if (template === "before-after" || template === "photo-split") {
      return { intro: "slide", hit: "switch", accent: "scratch" };
    }
    if (template === "photo-polaroid") return { intro: "drop", hit: "select", accent: "scratch" };
    if (template === "photo-kenburns" || template === "photo-overlay") {
      return { intro: "scroll", hit: "select", accent: "scratch" };
    }
    return { intro: "slide", hit: "select", accent: "scratch" };
  }
  if (template.startsWith("text-") || template === "headline-slam" || template === "quote-callout") {
    if (template === "headline-slam") return { intro: "slide", hit: "bong", accent: "scratch" };
    return { intro: "select", hit: "scratch", accent: "glass" };
  }
  if (
    template === "bullet-reveal" ||
    template === "lower-third" ||
    template === "logo-pop" ||
    template === "cta-button" ||
    template === "news-ticker"
  ) {
    if (template === "cta-button" || template === "logo-pop") {
      return { intro: "slide", hit: "confirm", accent: "click" };
    }
    if (template === "news-ticker") return { intro: "scroll", hit: "click", ticks: 3 };
    return { intro: "click", hit: "pop", ticks: 3 };
  }
  return { intro: "slide", hit: "select", accent: "confirm" };
}

function isBook(template: string) {
  return (
    template === "thumb-through" ||
    template === "cover-slam" ||
    template === "spine-reveal" ||
    template === "open-spread" ||
    template === "cover-open" ||
    template === "marker-highlight" ||
    template === "area-highlight" ||
    template === "line-scan" ||
    template === "page-flip" ||
    template === "quote" ||
    template === "text-underline" ||
    template === "book-stack" ||
    template === "book-float" ||
    template === "source-cite" ||
    template === "tome"
  );
}

function hitsFor(template: string): Hit[] {
  const t = timing();
  const score = scoreFor(template);
  const hits: Hit[] = [];
  let at = t.startDelay;
  if (score.intro) hits.push({ cue: score.intro, at, volume: 0.55 });
  at += t.revealDuration * 0.85 + t.stepDelay;
  if (score.hit) hits.push({ cue: score.hit, at, volume: 0.62 });
  if (score.ticks && score.ticks > 0) {
    for (let i = 0; i < score.ticks; i++) {
      at += Math.max(0.08, t.stepDelay + t.revealDuration * 0.35);
      hits.push({ cue: "tick", at, volume: 0.38 });
    }
  } else {
    at += t.connectDelay + t.lineDuration * 0.45;
    if (score.accent) hits.push({ cue: score.accent, at, volume: 0.58 });
  }
  return hits;
}

/** Runs in parallel with the visual scene. Cues follow start/step/line timing. */
export function* playScore(view: any, template: string) {
  if (str("sound", "on") !== "on") return;
  const hits = hitsFor(template);
  if (hits.length === 0) return;

  const refs = hits.map(() => createRef<Audio>());
  for (let i = 0; i < hits.length; i++) {
    yield view.add(
      <Audio
        ref={refs[i]}
        src={url(hits[i].cue)}
        play={false}
        volume={hits[i].volume}
        width={8}
        height={8}
        x={-2400}
        y={-2400}
      />,
    );
  }

  // One frame so Audio.draw() can load duration before play() (NaN duration pauses).
  const loadPad = 1 / 30;
  yield* waitFor(loadPad);

  let elapsed = loadPad;
  for (let i = 0; i < hits.length; i++) {
    const wait = hits[i].at - elapsed;
    if (wait > 0) yield* pause(wait);
    elapsed = Math.max(elapsed, hits[i].at);
    refs[i]()?.play();
  }

  yield* waitFor(0.05);
}
