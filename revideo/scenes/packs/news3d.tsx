/** @jsxImportSource @revideo/2d/lib */
/**
 * Clean (no-tear) newspapers with fake-3D rotate / flip, highlighter + underline,
 * and full paper / ink / marker color customization.
 */
import { Layout, Node, Rect, Txt } from "@revideo/2d";
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  num,
  str,
  waitFor,
} from "../../lib/helpers";
import {
  blendPhrase,
  HIGHLIGHTER,
  paintBlend,
  paintUnderline,
} from "../../lib/highlight";
import { CleanPaper, DeskVignette, PaperCrease, PaperGrain } from "../../lib/paper";
import { pause, timing } from "../../lib/timing";

const SERIF = "Libre Baskerville, Georgia, serif";

function desk(view: any, fill: string) {
  view.fill(fill);
}

function markStyle() {
  return str("markStyle", "highlight").toLowerCase();
}

function* paintMarks(
  mark: any,
  underline: any,
  phrase: string,
  size: number,
  duration: number,
) {
  const style = markStyle();
  const jobs = [];
  if (style === "highlight" || style === "both") {
    jobs.push(paintBlend(mark, phrase, size, duration));
  }
  if (style === "underline" || style === "both") {
    jobs.push(paintUnderline(underline, phrase, size, duration * 0.85));
  }
  if (jobs.length) yield* all(...jobs);
}

function paperCopy(opts: {
  masthead: string;
  date: string;
  headline: string;
  highlight: string;
  body: string;
  ink: string;
  mastheadColor: string;
  marker: string;
  underlineColor: string;
  mark: any;
  underline: any;
  headlineSize?: number;
  width?: number;
}) {
  const w = opts.width ?? 640;
  const size = opts.headlineSize ?? 32;
  const style = markStyle();
  const useMark = style === "highlight" || style === "both";
  const useLine = style === "underline" || style === "both";
  return (
    <>
      <Txt
        text={opts.masthead}
        fill={opts.mastheadColor}
        fontFamily={SERIF}
        fontSize={15}
        letterSpacing={5}
        fontWeight={700}
        y={-188}
      />
      <Txt text={opts.date} fill={"#6a5f52"} fontFamily={SERIF} fontSize={13} y={-162} />
      <PaperCrease width={w + 40} y={-138} />
      {blendPhrase(opts.headline, opts.highlight, useMark ? opts.mark : null, {
        font: SERIF,
        size,
        fill: opts.ink,
        marker: opts.marker,
        weight: 700,
        width: w,
        align: "center",
        underline: useLine ? opts.underline : undefined,
        underlineColor: opts.underlineColor,
      })}
      <Txt
        text={opts.body}
        fill={"#4a4038"}
        fontFamily={SERIF}
        fontSize={16}
        width={w}
        textWrap
        textAlign={"center"}
        y={118}
      />
    </>
  );
}

function readNews() {
  return {
    masthead: str("masthead", "THE DAILY CHRONICLE"),
    date: str("date", "Saturday, September 5, 2026"),
    headline: str("headline", "A defining moment for the nation"),
    highlight: str("highlight", "defining moment"),
    body: str(
      "body",
      "In a landmark development, leaders gathered as history turned a new page.",
    ),
    paperColor: str("paperColor", "#f4ead8"),
    ink: str("ink", "#171310"),
    mastheadColor: str("mastheadColor", "#8b1e1e"),
    marker: str("markerColor", HIGHLIGHTER),
    underlineColor: str("underlineColor", "#e63946"),
    deskColor: str("deskColor", "#0a0c12"),
    tilt: num("tilt", -4),
    flipAmount: num("flipAmount", 0.12),
  };
}

/** Page flips from edge-on (scaleX) onto the desk, then marks the phrase. */
function* flipIn(view: any) {
  const n = readNews();
  const t = timing();
  desk(view, n.deskColor);
  yield view.add(<DeskVignette />);
  const sheet = createRef<Node>();
  const mark = createRef<Rect>();
  const underline = createRef<Rect>();
  yield view.add(
    <Node ref={sheet} scaleX={0.06} rotation={-22} y={12}>
      <CleanPaper width={780} height={500} fill={n.paperColor} />
      <PaperGrain width={720} height={440} seed={11} />
      {paperCopy({ ...n, mark, underline, headlineSize: 30, width: 660 })}
    </Node>,
  );
  yield* pause(t.startDelay);
  yield* all(
    sheet().scale.x(1, t.revealDuration * 1.4, easeOutCubic),
    sheet().rotation(n.tilt, t.revealDuration * 1.4, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* paintMarks(mark, underline, n.highlight, 30, t.lineDuration);
  yield* waitFor(1.15);
}

/** Continuous 3D-ish yaw: foreshorten with scaleX while rotating. */
function* tiltRotate(view: any) {
  const n = readNews();
  const t = timing();
  desk(view, n.deskColor);
  yield view.add(<DeskVignette />);
  const sheet = createRef<Node>();
  const mark = createRef<Rect>();
  const underline = createRef<Rect>();
  const foreshorten = Math.max(0.75, 1 - Math.abs(n.flipAmount));
  yield view.add(
    <Node ref={sheet} rotation={n.tilt - 18} scaleX={0.55} y={8}>
      <CleanPaper width={800} height={510} fill={n.paperColor} edge={"#c9b89a"} />
      <PaperGrain width={740} height={450} seed={14} />
      {paperCopy({ ...n, mark, underline, headlineSize: 31, width: 670 })}
    </Node>,
  );
  yield* pause(t.startDelay);
  yield* all(
    sheet().rotation(n.tilt + 10, t.lineDuration * 1.2, easeOutCubic),
    sheet().scale.x(foreshorten, t.lineDuration * 1.2, easeOutCubic),
  );
  yield* all(
    sheet().rotation(n.tilt, t.lineDuration, easeOutCubic),
    sheet().scale.x(1, t.lineDuration, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* paintMarks(mark, underline, n.highlight, 31, t.lineDuration);
  yield* waitFor(1.0);
}

/** Spins onto the desk like a card landing in 3D. */
function* spinDesk(view: any) {
  const n = readNews();
  const t = timing();
  desk(view, n.deskColor);
  yield view.add(<DeskVignette />);
  const sheet = createRef<Node>();
  const mark = createRef<Rect>();
  const underline = createRef<Rect>();
  yield view.add(
    <Node ref={sheet} x={420} y={-80} rotation={48} scale={0.55} scaleX={0.35}>
      <CleanPaper width={760} height={480} fill={n.paperColor} />
      <PaperGrain width={700} height={420} seed={17} />
      {paperCopy({ ...n, mark, underline, headlineSize: 28, width: 640 })}
    </Node>,
  );
  yield* pause(t.startDelay);
  yield* all(
    sheet().x(0, t.revealDuration * 1.5, easeOutCubic),
    sheet().y(10, t.revealDuration * 1.5, easeOutCubic),
    sheet().rotation(n.tilt, t.revealDuration * 1.5, easeOutCubic),
    sheet().scale(1, t.revealDuration * 1.5, easeOutBack),
    sheet().scale.x(1, t.revealDuration * 1.5, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* paintMarks(mark, underline, n.highlight, 28, t.lineDuration);
  yield* waitFor(1.1);
}

/** Floating plate with gentle perspective rock. */
function* cardFloat(view: any) {
  const n = readNews();
  const t = timing();
  desk(view, n.deskColor);
  yield view.add(<DeskVignette />);
  const sheet = createRef<Node>();
  const mark = createRef<Rect>();
  const underline = createRef<Rect>();
  yield view.add(
    <Node ref={sheet} y={40} scale={0.86} rotation={n.tilt} opacity={0}>
      <CleanPaper width={820} height={520} fill={n.paperColor} radius={8} />
      <PaperGrain width={760} height={460} seed={19} />
      {paperCopy({ ...n, mark, underline, headlineSize: 32, width: 680 })}
    </Node>,
  );
  yield* pause(t.startDelay);
  yield* all(
    sheet().opacity(1, 0.25),
    sheet().y(0, t.revealDuration, easeOutCubic),
    sheet().scale(1, t.revealDuration, easeOutBack),
  );
  yield* all(
    sheet().rotation(n.tilt + 6, t.lineDuration, easeOutCubic),
    sheet().scale.x(0.94, t.lineDuration, easeOutCubic),
  );
  yield* all(
    sheet().rotation(n.tilt - 3, t.lineDuration, easeOutCubic),
    sheet().scale.x(1, t.lineDuration, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* paintMarks(mark, underline, n.highlight, 32, t.lineDuration);
  yield* waitFor(1.0);
}

/** Opens from a center fold (scaleX). */
function* openFold(view: any) {
  const n = readNews();
  const t = timing();
  desk(view, n.deskColor);
  yield view.add(<DeskVignette />);
  const sheet = createRef<Node>();
  const mark = createRef<Rect>();
  const underline = createRef<Rect>();
  yield view.add(
    <Node ref={sheet} scaleX={0.04} rotation={n.tilt}>
      <CleanPaper width={860} height={540} fill={n.paperColor} />
      <PaperGrain width={800} height={480} seed={21} />
      <Rect width={2} height={500} fill={"#000000"} opacity={0.12} />
      {paperCopy({ ...n, mark, underline, headlineSize: 33, width: 700 })}
    </Node>,
  );
  yield* pause(t.startDelay);
  yield* sheet().scale.x(1, t.revealDuration * 1.5, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* paintMarks(mark, underline, n.highlight, 33, t.lineDuration);
  yield* waitFor(1.15);
}

/** Stack of clean sheets; top sheet rotates into place. */
function* stackRotate(view: any) {
  const n = readNews();
  const t = timing();
  desk(view, n.deskColor);
  yield view.add(<DeskVignette />);
  const underA = str("paperColorAlt", "#ebe0cc");
  const underB = str("paperColorAlt2", "#e4d8c0");
  yield view.add(
    <Node x={-18} y={28} rotation={8}>
      <CleanPaper width={760} height={470} fill={underB} shadow={false} />
    </Node>,
  );
  yield view.add(
    <Node x={-8} y={16} rotation={3}>
      <CleanPaper width={770} height={480} fill={underA} shadow={false} />
    </Node>,
  );
  const top = createRef<Node>();
  const mark = createRef<Rect>();
  const underline = createRef<Rect>();
  yield view.add(
    <Node ref={top} x={360} y={-120} rotation={36} scaleX={0.4} scale={0.85}>
      <CleanPaper width={780} height={490} fill={n.paperColor} />
      <PaperGrain width={720} height={430} seed={24} />
      {paperCopy({ ...n, mark, underline, headlineSize: 29, width: 650 })}
    </Node>,
  );
  yield* pause(t.startDelay);
  yield* all(
    top().x(0, t.revealDuration * 1.4, easeOutCubic),
    top().y(0, t.revealDuration * 1.4, easeOutCubic),
    top().rotation(n.tilt, t.revealDuration * 1.4, easeOutCubic),
    top().scale(1, t.revealDuration * 1.4, easeOutCubic),
    top().scale.x(1, t.revealDuration * 1.4, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* paintMarks(mark, underline, n.highlight, 29, t.lineDuration);
  yield* waitFor(1.1);
}

/** Clean sheet already on desk; underline sweeps, optional highlighter. */
function* underlineSweep(view: any) {
  const n = readNews();
  const t = timing();
  desk(view, n.deskColor);
  yield view.add(<DeskVignette />);
  const sheet = createRef<Node>();
  const mark = createRef<Rect>();
  const underline = createRef<Rect>();
  yield view.add(
    <Node ref={sheet} rotation={n.tilt} y={8} opacity={0}>
      <CleanPaper width={800} height={500} fill={n.paperColor} />
      <PaperGrain width={740} height={440} seed={27} />
      {paperCopy({ ...n, mark, underline, headlineSize: 32, width: 670 })}
    </Node>,
  );
  yield* pause(t.startDelay);
  yield* sheet().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  // Prefer underline for this template unless user forced highlight-only
  const style = markStyle();
  if (style === "highlight") {
    yield* paintBlend(mark, n.highlight, 32, t.lineDuration);
  } else {
    yield* paintUnderline(underline, n.highlight, 32, t.lineDuration);
    if (style === "both") yield* paintBlend(mark, n.highlight, 32, t.lineDuration * 0.7);
  }
  yield* waitFor(1.15);
}

/** Marker pass across clean paper with full color controls. */
function* markerPass(view: any) {
  const n = readNews();
  const t = timing();
  desk(view, n.deskColor);
  yield view.add(<DeskVignette />);
  const sheet = createRef<Layout>();
  const mark = createRef<Rect>();
  const underline = createRef<Rect>();
  yield view.add(
    <Layout ref={sheet} rotation={n.tilt} scale={0.94}>
      <CleanPaper width={840} height={520} fill={n.paperColor} />
      <PaperGrain width={780} height={460} seed={30} />
      {paperCopy({ ...n, mark, underline, headlineSize: 34, width: 700 })}
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* sheet().scale(1.05, t.lineDuration * 1.4, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* paintMarks(mark, underline, n.highlight, 34, t.lineDuration);
  yield* waitFor(1.0);
}

/** Hero front plate settles with depth, then marks. */
function* heroPlate(view: any) {
  const n = readNews();
  const t = timing();
  desk(view, n.deskColor);
  yield view.add(<DeskVignette />);
  const sheet = createRef<Node>();
  const mark = createRef<Rect>();
  const underline = createRef<Rect>();
  yield view.add(
    <Node ref={sheet} y={60} scale={1.25} scaleX={0.7} rotation={-12} opacity={0}>
      <CleanPaper width={900} height={560} fill={n.paperColor} radius={4} />
      <PaperGrain width={840} height={500} seed={33} />
      {paperCopy({ ...n, mark, underline, headlineSize: 36, width: 760 })}
    </Node>,
  );
  yield* pause(t.startDelay);
  yield* all(
    sheet().opacity(1, 0.2),
    sheet().y(0, t.revealDuration * 1.3, easeOutCubic),
    sheet().scale(1, t.revealDuration * 1.3, easeOutCubic),
    sheet().scale.x(1, t.revealDuration * 1.3, easeOutCubic),
    sheet().rotation(n.tilt, t.revealDuration * 1.3, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* paintMarks(mark, underline, n.highlight, 36, t.lineDuration);
  yield* waitFor(1.15);
}

/** Side turn — reads like turning a page in 3D. */
function* sideTurn(view: any) {
  const n = readNews();
  const t = timing();
  desk(view, n.deskColor);
  yield view.add(<DeskVignette />);
  const back = str("paperColorAlt", "#e8dcc8");
  yield view.add(
    <Node x={-40} rotation={6} scaleX={0.92}>
      <CleanPaper width={760} height={480} fill={back} shadow={false} />
    </Node>,
  );
  const page = createRef<Node>();
  const mark = createRef<Rect>();
  const underline = createRef<Rect>();
  yield view.add(
    <Node ref={page} scaleX={0.08} rotation={n.tilt} x={20}>
      <CleanPaper width={780} height={500} fill={n.paperColor} />
      <PaperGrain width={720} height={440} seed={36} />
      {paperCopy({ ...n, mark, underline, headlineSize: 30, width: 650 })}
    </Node>,
  );
  yield* pause(t.startDelay);
  yield* all(
    page().scale.x(1, t.revealDuration * 1.5, easeOutCubic),
    page().x(0, t.revealDuration * 1.5, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* paintMarks(mark, underline, n.highlight, 30, t.lineDuration);
  // Gentle rock to sell depth
  yield* all(
    page().rotation(n.tilt + 5, 0.55, easeOutCubic),
    page().scale.x(0.96, 0.55, easeOutCubic),
  );
  yield* all(
    page().rotation(n.tilt, 0.5, easeOutCubic),
    page().scale.x(1, 0.5, easeOutCubic),
  );
  yield* waitFor(0.85);
}

export function* runNews3d(view: any, template: string) {
  switch (template) {
    case "news-3d-flip":
      yield* flipIn(view);
      break;
    case "news-3d-tilt-rotate":
      yield* tiltRotate(view);
      break;
    case "news-3d-spin-desk":
      yield* spinDesk(view);
      break;
    case "news-3d-card-float":
      yield* cardFloat(view);
      break;
    case "news-3d-open-fold":
      yield* openFold(view);
      break;
    case "news-3d-stack-rotate":
      yield* stackRotate(view);
      break;
    case "news-3d-underline-sweep":
      yield* underlineSweep(view);
      break;
    case "news-3d-marker-pass":
      yield* markerPass(view);
      break;
    case "news-3d-hero-plate":
      yield* heroPlate(view);
      break;
    case "news-3d-side-turn":
      yield* sideTurn(view);
      break;
    default:
      yield* flipIn(view);
  }
}
