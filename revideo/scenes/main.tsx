/** @jsxImportSource @revideo/2d/lib */
import { makeScene2D } from "@revideo/2d";
import { str, titleSlam, v, all, fitDesignStage } from "../lib/helpers";
import { playScore } from "../lib/sfx";

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

/** Load one pack at a time so Chrome/Vite don't keep every scene in memory. */
function* loadMod<T>(loader: () => Promise<T>): Generator<Promise<T>, T, T> {
  return yield loader();
}

export default makeScene2D("main", function* (view) {
  const template = String(v("template", "cover-slam"));
  const transparent =
    String(v("bgTransparent", "off")).toLowerCase() === "on" ||
    String(v("bgTransparent", "off")).toLowerCase() === "true";
  // Clear stage. Templates still read `bg` from variables; when transparent,
  // the client forces bg to rgba(0,0,0,0) so scene fills stay clear for WebM alpha.
  view.fill(transparent ? "rgba(0,0,0,0)" : "#07090e");
  if (template === "magic-board") {
    const { runMagicBoard } = yield* loadMod(() => import("./packs/board"));
    yield* runMagicBoard(view);
    return;
  }
  yield* fitDesignStage(view);
  yield* all(runTemplate(view, template), playScore(view, template));
});

function* runTemplate(view: any, template: string) {
  if (BOOK_MAP[template]) {
    const { runBooks } = yield* loadMod(() => import("./books"));
    yield* runBooks(view, BOOK_MAP[template]);
    return;
  }

  if (template.startsWith("yt-")) {
    const { runYt } = yield* loadMod(() => import("./packs/yt"));
    yield* runYt(view, template);
    return;
  }
  if (template.startsWith("news-")) {
    const { runNewspaper } = yield* loadMod(() => import("./packs/newspaper"));
    yield* runNewspaper(view, template);
    return;
  }
  if (template.startsWith("timeline-")) {
    const { runTimeline } = yield* loadMod(() => import("./packs/timeline"));
    yield* runTimeline(view, template);
    return;
  }
  if (template.startsWith("hist-")) {
    const { runDocHist } = yield* loadMod(() => import("./packs/docHist"));
    yield* runDocHist(view, template);
    return;
  }
  if (template.startsWith("time-")) {
    const { runDocTime } = yield* loadMod(() => import("./packs/docTime"));
    yield* runDocTime(view, template);
    return;
  }
  if (template.startsWith("india-")) {
    const { runIndia } = yield* loadMod(() => import("./packs/india"));
    yield* runIndia(view, template);
    return;
  }
  if (template.startsWith("short-")) {
    const { runShorts } = yield* loadMod(() => import("./packs/shorts"));
    yield* runShorts(view, template);
    return;
  }
  if (template.startsWith("money-")) {
    const { runDocMoney } = yield* loadMod(() => import("./packs/docMoney"));
    yield* runDocMoney(view, template);
    return;
  }
  if (template.startsWith("cmp-")) {
    const { runDocCompare } = yield* loadMod(() => import("./packs/docCompare"));
    yield* runDocCompare(view, template);
    return;
  }
  if (template.startsWith("rise-")) {
    const { runDocRise } = yield* loadMod(() => import("./packs/docRise"));
    yield* runDocRise(view, template);
    return;
  }
  if (
    template.startsWith("chart-") ||
    template.startsWith("d3-") ||
    template === "stat-counter" ||
    template === "timeline"
  ) {
    if (template.startsWith("chart-")) {
      const { runChartVariant } = yield* loadMod(() => import("./packs/chartVariants"));
      yield* runChartVariant(view, template);
      return;
    }
    const { runCharts } = yield* loadMod(() => import("./packs/charts"));
    yield* runCharts(view, template);
    return;
  }
  if (MAP_IDS.has(template)) {
    const { runMaps } = yield* loadMod(() => import("./packs/maps"));
    yield* runMaps(view, template);
    return;
  }
  if (PHOTO_IDS.has(template)) {
    const { runPhotos } = yield* loadMod(() => import("./packs/photos"));
    yield* runPhotos(view, template);
    return;
  }
  if (TEXT_IDS.has(template)) {
    const { runText } = yield* loadMod(() => import("./packs/text"));
    yield* runText(view, template);
    return;
  }
  if (UI_IDS.has(template)) {
    const { runUi } = yield* loadMod(() => import("./packs/ui"));
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
