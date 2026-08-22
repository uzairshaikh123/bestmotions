/** @jsxImportSource @revideo/2d/lib */
import { makeScene2D } from "@revideo/2d";
import { str, titleSlam, v, all } from "../lib/helpers";
import { playScore } from "../lib/sfx";
import { runBooks } from "./books";
import { runChartVariant } from "./packs/chartVariants";
import { runCharts } from "./packs/charts";
import { runIndia } from "./packs/india";
import { runMaps } from "./packs/maps";
import { runNewspaper } from "./packs/newspaper";
import { runPhotos } from "./packs/photos";
import { runShorts } from "./packs/shorts";
import { runText } from "./packs/text";
import { runTimeline } from "./packs/timeline";
import { runUi } from "./packs/ui";
import { runYt } from "./packs/yt";

const BOOK_MAP: Record<string, string> = {
  "book-thumb-through": "thumb-through",
  "book-cover-slam": "cover-slam",
  "book-spine-reveal": "spine-reveal",
  "book-open-spread": "open-spread",
  "book-cover-open": "cover-open",
  "book-marker-highlight": "marker-highlight",
  "book-area-highlight": "area-highlight",
  "book-line-scan": "line-scan",
  "book-page-flip": "page-flip",
  "book-quote": "quote",
  "book-text-underline": "text-underline",
  "book-stack": "book-stack",
  "book-float": "book-float",
  "book-source-cite": "source-cite",
  "book-tome": "tome",
  "thumb-through": "thumb-through",
  "cover-slam": "cover-slam",
  "spine-reveal": "spine-reveal",
  "open-spread": "open-spread",
  "cover-open": "cover-open",
  "marker-highlight": "marker-highlight",
  "area-highlight": "area-highlight",
  "line-scan": "line-scan",
  "page-flip": "page-flip",
  quote: "quote",
  "source-cite": "source-cite",
  tome: "tome",
};

const UI_IDS = new Set([
  "bullet-reveal",
  "lower-third",
  "logo-pop",
  "cta-button",
  "news-ticker",
]);

const TEXT_IDS = new Set([
  "text-underline",
  "text-marker",
  "text-both",
  "headline-slam",
  "quote-callout",
]);

const MAP_IDS = new Set([
  "airplane-route",
  "globe-spin",
  "country-highlight",
  "map-spotlight",
  "zoom-location",
]);

const PHOTO_IDS = new Set([
  "photo-kenburns",
  "person-card",
  "before-after",
  "photo-news-meet",
  "photo-polaroid",
  "photo-split",
  "photo-overlay",
  "photo-pin",
]);

export default makeScene2D("main", function* (view) {
  const template = String(v("template", "cover-slam"));
  yield* all(runTemplate(view, template), playScore(view, template));
});

function* runTemplate(view: any, template: string) {
  if (BOOK_MAP[template]) {
    yield* runBooks(view, BOOK_MAP[template]);
    return;
  }

  if (template.startsWith("yt-")) {
    yield* runYt(view, template);
    return;
  }
  if (template.startsWith("news-")) {
    yield* runNewspaper(view, template);
    return;
  }
  if (template.startsWith("timeline-")) {
    yield* runTimeline(view, template);
    return;
  }
  if (template.startsWith("india-")) {
    yield* runIndia(view, template);
    return;
  }
  if (template.startsWith("short-")) {
    yield* runShorts(view, template);
    return;
  }
  if (
    template.startsWith("chart-") ||
    template.startsWith("d3-") ||
    template === "stat-counter" ||
    template === "timeline"
  ) {
    if (template.startsWith("chart-")) {
      yield* runChartVariant(view, template);
      return;
    }
    yield* runCharts(view, template);
    return;
  }
  if (MAP_IDS.has(template)) {
    yield* runMaps(view, template);
    return;
  }
  if (PHOTO_IDS.has(template)) {
    yield* runPhotos(view, template);
    return;
  }
  if (TEXT_IDS.has(template)) {
    yield* runText(view, template);
    return;
  }
  if (UI_IDS.has(template)) {
    yield* runUi(view, template);
    return;
  }

  yield* titleSlam(view, {
    eyebrow: "BESTMOTIONS",
    title: str("title", template),
    subtitle: str("subtitle", ""),
    accent: str("accent", "#e63946"),
    bg: str("bg", "#0a0c12"),
  });
}
