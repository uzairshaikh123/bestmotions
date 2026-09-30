/** @jsxImportSource @revideo/2d/lib */
/**
 * Clean (no-tear) newspapers with fake-3D rotate / flip, highlighter + underline,
 * and full paper / ink / marker color customization.
 */
import { Circle, Img, Layout, Line, Node, Rect, Txt } from "@revideo/2d";
import { easeInOutCubic } from "@revideo/core";
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
import { CleanPaper, DeskVignette, PaperCrease, PaperGrain, hash01 } from "../../lib/paper";
import { pause, timing } from "../../lib/timing";
import deskWoodUrl from "../../textures/newspaper-3d/desk-wood.jpg";
import paperNewsUrl from "../../textures/newspaper-3d/paper-newsprint.jpg";
import vignetteUrl from "../../textures/ai-text/vignette-soft.png";

const SERIF = "Libre Baskerville, Georgia, serif";

/** Photoreal paper plate — newsprint texture + soft contact shadow. */
function RealPaper(opts: { width: number; height: number; fill: string; shadow?: boolean }) {
  return (
    <Node>
      {opts.shadow !== false ? (
        <Rect
          width={opts.width}
          height={opts.height}
          fill={"#000000"}
          opacity={0.34}
          x={14}
          y={18}
          radius={4}
          shadowBlur={28}
          shadowColor={"#000000aa"}
        />
      ) : null}
      <Rect width={opts.width} height={opts.height} fill={opts.fill} radius={3} />
      <Img src={paperNewsUrl} width={opts.width} height={opts.height} opacity={0.52} />
      <Rect width={opts.width} height={opts.height} fill={opts.fill} opacity={0.18} radius={3} />
      <PaperGrain width={opts.width - 40} height={opts.height - 40} seed={19} />
      <PaperCrease width={opts.width - 60} y={-opts.height * 0.28} opacity={0.1} />
    </Node>
  );
}

function desk(view: any, fill: string) {
  view.fill(fill);
}

function* texturedDesk(view: any, fill: string) {
  view.fill(fill);
  yield view.add(<Img src={deskWoodUrl} width={1600} height={980} opacity={0.9} />);
  yield view.add(<Rect width={1600} height={980} fill={fill} opacity={0.38} />);
  yield view.add(<DeskVignette />);
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

/** Photoreal textured flip onto wooden desk. */
function* realFlip(view: any) {
  const n = readNews();
  const t = timing();
  yield* texturedDesk(view, n.deskColor);
  const sheet = createRef<Node>();
  const mark = createRef<Rect>();
  const underline = createRef<Rect>();
  yield view.add(
    <Node ref={sheet} scaleX={0.05} rotation={-26} y={16}>
      <RealPaper width={800} height={520} fill={n.paperColor} />
      {paperCopy({ ...n, mark, underline, headlineSize: 30, width: 660 })}
    </Node>,
  );
  yield* pause(t.startDelay);
  yield* all(
    sheet().scale.x(1, t.revealDuration * 1.45, easeOutCubic),
    sheet().rotation(n.tilt, t.revealDuration * 1.45, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* paintMarks(mark, underline, n.highlight, 30, t.lineDuration);
  yield* waitFor(1.1);
}

/** Photoreal spin-land on desk with newsprint plate. */
function* realSpinDesk(view: any) {
  const n = readNews();
  const t = timing();
  yield* texturedDesk(view, n.deskColor);
  const sheet = createRef<Node>();
  const mark = createRef<Rect>();
  const underline = createRef<Rect>();
  yield view.add(
    <Node ref={sheet} x={460} y={-90} rotation={52} scale={0.5} scaleX={0.28}>
      <RealPaper width={780} height={500} fill={n.paperColor} />
      {paperCopy({ ...n, mark, underline, headlineSize: 28, width: 640 })}
    </Node>,
  );
  yield* pause(t.startDelay);
  yield* all(
    sheet().x(0, t.revealDuration * 1.55, easeOutCubic),
    sheet().y(12, t.revealDuration * 1.55, easeOutCubic),
    sheet().rotation(n.tilt, t.revealDuration * 1.55, easeOutCubic),
    sheet().scale(1, t.revealDuration * 1.55, easeOutBack),
    sheet().scale.x(1, t.revealDuration * 1.55, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* paintMarks(mark, underline, n.highlight, 28, t.lineDuration);
  yield* waitFor(1.05);
}

/** Photoreal stack with textured sheets + 3D top rotate. */
function* realStack(view: any) {
  const n = readNews();
  const t = timing();
  yield* texturedDesk(view, n.deskColor);
  const under = str("paperColorAlt", "#ebe0cc");
  const bottom = str("paperColorAlt2", "#e4d8c0");
  yield view.add(
    <Node x={-28} y={28} rotation={8} scale={0.94}>
      <RealPaper width={760} height={470} fill={bottom} shadow={false} />
    </Node>,
  );
  yield view.add(
    <Node x={-12} y={16} rotation={4} scale={0.97}>
      <RealPaper width={780} height={490} fill={under} shadow={false} />
    </Node>,
  );
  const top = createRef<Node>();
  const mark = createRef<Rect>();
  const underline = createRef<Rect>();
  yield view.add(
    <Node ref={top} scaleX={0.08} rotation={-18} y={8}>
      <RealPaper width={800} height={510} fill={n.paperColor} />
      {paperCopy({ ...n, mark, underline, headlineSize: 30, width: 660 })}
    </Node>,
  );
  yield* pause(t.startDelay);
  yield* all(
    top().scale.x(1, t.revealDuration * 1.4, easeOutCubic),
    top().rotation(n.tilt, t.revealDuration * 1.4, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* paintMarks(mark, underline, n.highlight, 30, t.lineDuration);
  yield* all(top().rotation(n.tilt + 4, 0.5, easeOutCubic), top().scale.x(0.97, 0.5, easeOutCubic));
  yield* all(top().rotation(n.tilt, 0.45, easeOutCubic), top().scale.x(1, 0.45, easeOutCubic));
  yield* waitFor(0.9);
}

/** Photoreal side page turn over textured under-sheet. */
function* realSideTurn(view: any) {
  const n = readNews();
  const t = timing();
  yield* texturedDesk(view, n.deskColor);
  const back = str("paperColorAlt", "#e8dcc8");
  yield view.add(
    <Node x={-36} rotation={5} scaleX={0.93}>
      <RealPaper width={780} height={500} fill={back} shadow={false} />
    </Node>,
  );
  const page = createRef<Node>();
  const mark = createRef<Rect>();
  const underline = createRef<Rect>();
  yield view.add(
    <Node ref={page} scaleX={0.07} rotation={n.tilt} x={24}>
      <RealPaper width={800} height={520} fill={n.paperColor} />
      {paperCopy({ ...n, mark, underline, headlineSize: 30, width: 650 })}
    </Node>,
  );
  yield* pause(t.startDelay);
  yield* all(
    page().scale.x(1, t.revealDuration * 1.55, easeOutCubic),
    page().x(0, t.revealDuration * 1.55, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* paintMarks(mark, underline, n.highlight, 30, t.lineDuration);
  yield* all(page().rotation(n.tilt + 5, 0.55, easeOutCubic), page().scale.x(0.96, 0.55, easeOutCubic));
  yield* all(page().rotation(n.tilt, 0.5, easeOutCubic), page().scale.x(1, 0.5, easeOutCubic));
  yield* waitFor(0.85);
}

/** Sparse film dust for Vox dark void — keep node count low. */
function VoxDust({ seed = 3 }: { seed?: number }) {
  const dots = Array.from({ length: 48 }, (_, i) => ({
    x: (hash01(seed + i * 2.7) - 0.5) * 1280,
    y: (hash01(seed + i * 5.1) - 0.5) * 720,
    s: 0.8 + hash01(seed + i) * 2.2,
    o: 0.05 + hash01(seed + i * 1.3) * 0.16,
    key: `d-${i}`,
  }));
  return (
    <Node opacity={0.7} zIndex={40}>
      {dots.map((d) => (
        <Circle key={d.key} width={d.s} height={d.s} fill={"#ffffff"} x={d.x} y={d.y} opacity={d.o} />
      ))}
    </Node>
  );
}

type PlaneSpec = {
  x: number;
  y: number;
  rot: number;
  scale: number;
  scaleX: number;
  z: number;
  headline: string;
  body: string;
  fill: string;
};

function articleCard(
  spec: PlaneSpec,
  opts: {
    masthead: string;
    date: string;
    ink: string;
    mastheadColor: string;
    mark?: any;
    underline?: any;
    highlight?: string;
  },
) {
  const w = 520;
  const h = 340;
  return (
    <Node
      x={spec.x}
      y={spec.y}
      rotation={spec.rot}
      scale={spec.scale}
      scaleX={spec.scaleX}
      zIndex={spec.z}
    >
      <RealPaper width={w} height={h} fill={spec.fill} />
      <Txt
        text={opts.masthead.toUpperCase()}
        fill={opts.mastheadColor}
        fontFamily={SERIF}
        fontSize={11}
        letterSpacing={3}
        fontWeight={700}
        y={-132}
      />
      <Txt text={opts.date} fill={"#6a5f52"} fontFamily={SERIF} fontSize={11} y={-112} />
      {opts.highlight && opts.mark
        ? blendPhrase(spec.headline, opts.highlight, opts.mark, {
            font: SERIF,
            size: 22,
            fill: opts.ink,
            marker: HIGHLIGHTER,
            weight: 700,
            width: 440,
            align: "center",
            underline: opts.underline,
            underlineColor: "#1d6fd8",
          })
        : (
          <Txt
            text={spec.headline}
            fill={opts.ink}
            fontFamily={SERIF}
            fontSize={22}
            fontWeight={700}
            width={440}
            textWrap
            textAlign={"center"}
            y={-30}
          />
        )}
      <Txt
        text={spec.body}
        fill={"#4a4038"}
        fontFamily={SERIF}
        fontSize={13}
        width={440}
        textWrap
        textAlign={"center"}
        y={90}
      />
    </Node>
  );
}

function focusJobs(planes: any[], focusIdx: number, duration: number) {
  const jobs = [];
  for (let i = 0; i < planes.length; i++) {
    const on = i === focusIdx;
    jobs.push(planes[i]().opacity(on ? 1 : 0.36, duration, easeInOutCubic));
    jobs.push(planes[i]().scale(on ? 1.06 : 0.9, duration, easeInOutCubic));
  }
  return jobs;
}

/**
 * Vox-style 3D camera article tour:
 * multi-plane docs in a dark void, camera (world) flies between them,
 * fake DOF via dim/veil, highlight on the focused plate.
 */
function* voxCameraTour(view: any) {
  const n = readNews();
  const t = timing();
  const h2 = str("headline2", "Markets scramble as filings land overnight");
  const h3 = str("headline3", "Regulators open a formal review");
  const b2 = str("body2", "Trading desks watched the exchange notices as volumes spiked before the close.");
  const b3 = str("body3", "Officials said the inquiry will examine disclosures from the prior quarter.");
  const bg = str("deskColor", "#07080c");

  view.fill(bg);
  yield view.add(<Img src={vignetteUrl} width={1500} height={860} opacity={0.9} />);
  yield view.add(<VoxDust seed={11} />);

  const world = createRef<Node>();
  yield view.add(<Node ref={world} />);

  const specs: PlaneSpec[] = [
    {
      x: -340,
      y: -40,
      rot: -11,
      scale: 0.88,
      scaleX: 0.86,
      z: 2,
      headline: h2,
      body: b2,
      fill: str("paperColorAlt", "#ebe0cc"),
    },
    {
      x: 0,
      y: 10,
      rot: n.tilt,
      scale: 1,
      scaleX: 1,
      z: 6,
      headline: n.headline,
      body: n.body,
      fill: n.paperColor,
    },
    {
      x: 360,
      y: 30,
      rot: 9,
      scale: 0.84,
      scaleX: 0.9,
      z: 3,
      headline: h3,
      body: b3,
      fill: str("paperColorAlt2", "#e4d8c0"),
    },
  ];

  const planeRefs = specs.map(() => createRef<Node>());
  const mark = createRef<Rect>();
  const underline = createRef<Rect>();

  for (let i = 0; i < specs.length; i++) {
    const withMark = i === 1;
    yield world().add(
      <Node ref={planeRefs[i]} opacity={i === 1 ? 1 : 0.4}>
        {articleCard(specs[i], {
          masthead: n.masthead,
          date: n.date,
          ink: n.ink,
          mastheadColor: n.mastheadColor,
          mark: withMark ? mark : undefined,
          underline: withMark ? underline : undefined,
          highlight: withMark ? n.highlight : undefined,
        })}
      </Node>,
    );
  }

  // Start wide / slightly rotated — “camera” establishing shot
  world().scale(0.72);
  world().position([40, 20]);
  world().rotation(-3);

  yield* pause(t.startDelay);
  // Push into left plate (back-left)
  yield* all(
    world().position([280, 30], t.revealDuration * 1.5, easeInOutCubic),
    world().scale(1.15, t.revealDuration * 1.5, easeInOutCubic),
    world().rotation(4, t.revealDuration * 1.5, easeInOutCubic),
    ...focusJobs(planeRefs, 0, t.revealDuration * 1.2),
  );
  yield* waitFor(0.45);

  // Rack to center hero
  yield* all(
    world().position([0, -10], t.revealDuration * 1.55, easeInOutCubic),
    world().scale(1.28, t.revealDuration * 1.55, easeInOutCubic),
    world().rotation(0, t.revealDuration * 1.55, easeInOutCubic),
    ...focusJobs(planeRefs, 1, t.revealDuration * 1.2),
  );
  yield* pause(t.connectDelay);
  yield* paintMarks(mark, underline, n.highlight, 22, t.lineDuration);
  yield* waitFor(0.4);

  // Drift to right plate
  yield* all(
    world().position([-300, -20], t.revealDuration * 1.45, easeInOutCubic),
    world().scale(1.18, t.revealDuration * 1.45, easeInOutCubic),
    world().rotation(-5, t.revealDuration * 1.45, easeInOutCubic),
    ...focusJobs(planeRefs, 2, t.revealDuration * 1.1),
  );
  yield* waitFor(0.45);

  // Pull back wide settle
  yield* all(
    world().position([0, 0], t.revealDuration * 1.4, easeInOutCubic),
    world().scale(0.82, t.revealDuration * 1.4, easeInOutCubic),
    world().rotation(0, t.revealDuration * 1.4, easeInOutCubic),
    ...focusJobs(planeRefs, 1, t.revealDuration),
  );
  yield* waitFor(1.0);
}

/** Focus rack: start on far plane, rack forward onto hero + highlight. */
function* voxFocusRack(view: any) {
  const n = readNews();
  const t = timing();
  const farHead = str("headline2", "Earlier briefing notes");
  const farBody = str("body2", "A quieter page from the archive sits behind the lead story.");
  view.fill(str("deskColor", "#06070b"));
  yield view.add(<Img src={vignetteUrl} width={1500} height={860} opacity={0.92} />);
  yield view.add(<VoxDust seed={22} />);

  const world = createRef<Node>();
  yield view.add(<Node ref={world} />);

  const far = createRef<Node>();
  const hero = createRef<Node>();
  const mark = createRef<Rect>();
  const underline = createRef<Rect>();

  yield world().add(
    <Node ref={far} x={-80} y={-20} rotation={-8} scale={0.78} scaleX={0.82} opacity={0.9} zIndex={2}>
      {articleCard(
        {
          x: 0,
          y: 0,
          rot: 0,
          scale: 1,
          scaleX: 1,
          z: 2,
          headline: farHead,
          body: farBody,
          fill: str("paperColorAlt", "#e6dcc8"),
        },
        {
          masthead: n.masthead,
          date: n.date,
          ink: n.ink,
          mastheadColor: n.mastheadColor,
        },
      )}
    </Node>,
  );
  yield world().add(
    <Node ref={hero} x={120} y={40} rotation={5} scale={1.05} scaleX={0.95} opacity={0.34} zIndex={6}>
      {articleCard(
        {
          x: 0,
          y: 0,
          rot: 0,
          scale: 1,
          scaleX: 1,
          z: 6,
          headline: n.headline,
          body: n.body,
          fill: n.paperColor,
        },
        {
          masthead: n.masthead,
          date: n.date,
          ink: n.ink,
          mastheadColor: n.mastheadColor,
          mark,
          underline,
          highlight: n.highlight,
        },
      )}
    </Node>,
  );

  world().position([160, 10]);
  world().scale(1.2);
  yield* pause(t.startDelay);
  // Hold on far “soft” plate, then rack onto hero
  yield* waitFor(0.55);
  yield* all(
    world().position([-90, -20], t.revealDuration * 1.7, easeInOutCubic),
    world().scale(1.32, t.revealDuration * 1.7, easeInOutCubic),
    far().opacity(0.32, t.revealDuration * 1.4, easeInOutCubic),
    far().scale(0.86, t.revealDuration * 1.4, easeInOutCubic),
    hero().opacity(1, t.revealDuration * 1.4, easeInOutCubic),
    hero().scale(1.12, t.revealDuration * 1.4, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* paintMarks(mark, underline, n.highlight, 22, t.lineDuration);
  yield* waitFor(1.15);
}

/** Parallax orbit: satellites drift while camera circles the hero. */
function* voxParallaxOrbit(view: any) {
  const n = readNews();
  const t = timing();
  view.fill(str("deskColor", "#07090e"));
  yield view.add(<Img src={vignetteUrl} width={1500} height={860} opacity={0.88} />);
  yield view.add(<VoxDust seed={33} />);

  const world = createRef<Node>();
  const back = createRef<Node>();
  const mid = createRef<Node>();
  const front = createRef<Node>();
  const mark = createRef<Rect>();
  const underline = createRef<Rect>();
  yield view.add(<Node ref={world} />);

  yield world().add(
    <Node ref={back} x={-280} y={-60} rotation={-14} scale={0.7} scaleX={0.75} opacity={0.4} zIndex={1}>
      <RealPaper width={420} height={280} fill={str("paperColorAlt2", "#ddd2bc")} />
      <Txt text={str("headline3", "BRIEFING")} fill={n.ink} fontFamily={SERIF} fontSize={18} fontWeight={700} />
    </Node>,
  );
  yield world().add(
    <Node ref={mid} x={300} y={80} rotation={12} scale={0.78} scaleX={0.82} opacity={0.45} zIndex={2}>
      <RealPaper width={440} height={290} fill={str("paperColorAlt", "#e8dcc8")} />
      <Txt text={str("headline2", "MARKETS")} fill={n.ink} fontFamily={SERIF} fontSize={18} fontWeight={700} />
    </Node>,
  );
  yield world().add(
    <Node ref={front} zIndex={8}>
      {articleCard(
        {
          x: 0,
          y: 0,
          rot: n.tilt,
          scale: 1,
          scaleX: 1,
          z: 8,
          headline: n.headline,
          body: n.body,
          fill: n.paperColor,
        },
        {
          masthead: n.masthead,
          date: n.date,
          ink: n.ink,
          mastheadColor: n.mastheadColor,
          mark,
          underline,
          highlight: n.highlight,
        },
      )}
    </Node>,
  );

  world().rotation(-6);
  world().scale(0.9);
  yield* pause(t.startDelay);
  // Orbit + parallax (back moves less)
  yield* all(
    world().rotation(6, 2.2, easeInOutCubic),
    world().scale(1.12, 2.2, easeInOutCubic),
    back().x(-340, 2.2, easeInOutCubic),
    mid().x(360, 2.2, easeInOutCubic),
    front().rotation(n.tilt + 3, 2.2, easeInOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* paintMarks(mark, underline, n.highlight, 22, t.lineDuration);
  yield* all(
    world().rotation(0, 1.1, easeInOutCubic),
    world().scale(1, 1.1, easeInOutCubic),
    back().x(-280, 1.1, easeInOutCubic),
    mid().x(300, 1.1, easeInOutCubic),
    front().rotation(n.tilt, 1.1, easeInOutCubic),
  );
  yield* waitFor(0.95);
}

/**
 * Single-dossier Vox cinematic (HTML cam-rig style):
 * dark void + tall investigative document, camera flies
 * overview → headline → evidence → quote, with stroke highlighter draws.
 */
function* voxDocCinematic(view: any) {
  const t = timing();
  const tag = str("tag", "Investigative Dossier · Special Report");
  const headline = str("headline", "Uncovering The Shell Company Network");
  const meta = str("meta", "Filed by Financial Audit Bureau · Case Ref: #2026-X94");
  const lead = str(
    "lead",
    "Over sixteen months of wire transfers revealed a continuous redirection of capital through offshore intermediaries.",
  );
  const bodyLeft = str(
    "body",
    "Records obtained through leaked banking affidavits indicate that entities registered in Delaware and Cyprus shared identical corporate directors. These transactions bypassed standard screening mechanisms under the guise of intellectual property licensing fees.",
  );
  const evidence = str(
    "evidence",
    "According to internal correspondence dated August 14, executives knowingly approved duplicate balance statements to reassure retail institutional underwriters.",
  );
  const keyFinding = str(
    "keyFinding",
    "Cross-jurisdictional filings failed to disclose ultimate beneficial owners across all 3 subsidiary holding firms.",
  );
  const quote = str(
    "quote",
    '"Total unaccounted capital moved between fiscal quarters 2 and 4 exceeded forty-eight million dollars without physical inventory matching."',
  );
  const paperColor = str("paperColor", "#f7f5ed");
  const ink = str("ink", "#1a1a1a");
  const tagColor = str("mastheadColor", "#9c2727");
  const marker = str("markerColor", "#ffd43f");
  const bg = str("deskColor", "#0f1117");

  view.fill(bg);
  yield view.add(<Rect width={1600} height={980} fill={"#0c0e14"} />);
  yield view.add(<Circle width={920} height={620} fill={"#1b2030"} opacity={0.55} />);
  yield view.add(<Img src={vignetteUrl} width={1500} height={860} opacity={0.95} />);
  yield view.add(<VoxDust seed={41} />);

  const world = createRef<Node>();
  const hl1 = createRef<Line>();
  const hl2a = createRef<Line>();
  const hl2b = createRef<Line>();
  const hl3a = createRef<Line>();
  const hl3b = createRef<Line>();

  const DOC_W = 560;
  const DOC_H = 720;

  yield view.add(<Node ref={world} />);
  yield world().add(
    <Node y={40}>
      {/* contact shadow */}
      <Rect
        width={DOC_W}
        height={DOC_H}
        fill={"#000000"}
        opacity={0.42}
        x={18}
        y={22}
        radius={4}
        shadowBlur={40}
        shadowColor={"#000000cc"}
      />
      <Rect width={DOC_W} height={DOC_H} fill={paperColor} radius={3} />
      <Img src={paperNewsUrl} width={DOC_W} height={DOC_H} opacity={0.38} />
      <Rect width={DOC_W} height={DOC_H} fill={paperColor} opacity={0.22} radius={3} />
      <PaperGrain width={DOC_W - 48} height={DOC_H - 48} seed={27} />

      {/* header */}
      <Txt
        text={tag.toUpperCase()}
        fill={tagColor}
        fontFamily={"Inter, system-ui, sans-serif"}
        fontSize={11}
        fontWeight={800}
        letterSpacing={2.4}
        y={-DOC_H / 2 + 52}
      />
      <Txt
        text={headline}
        fill={ink}
        fontFamily={SERIF}
        fontSize={28}
        fontWeight={900}
        width={DOC_W - 88}
        textWrap
        textAlign={"center"}
        y={-DOC_H / 2 + 100}
      />
      <Txt
        text={meta}
        fill={"#666666"}
        fontFamily={SERIF}
        fontSize={12}
        fontStyle={"italic"}
        y={-DOC_H / 2 + 148}
      />
      <Rect width={DOC_W - 100} height={3} fill={"#2c2c2c"} y={-DOC_H / 2 + 168} />
      <Rect width={DOC_W - 100} height={1} fill={"#2c2c2c"} y={-DOC_H / 2 + 174} />

      {/* left column */}
      <Txt
        text={lead}
        fill={"#2b2b2b"}
        fontFamily={SERIF}
        fontSize={15}
        fontWeight={500}
        width={248}
        textWrap
        textAlign={"left"}
        x={-118}
        y={-DOC_H / 2 + 250}
      />
      <Txt
        text={bodyLeft}
        fill={"#2b2b2b"}
        fontFamily={SERIF}
        fontSize={13.5}
        width={248}
        textWrap
        textAlign={"left"}
        x={-118}
        y={-DOC_H / 2 + 380}
      />
      <Rect
        width={3}
        height={78}
        fill={"#bbbbbb"}
        x={-236}
        y={-DOC_H / 2 + 520}
      />
      <Txt
        text={quote}
        fill={"#2b2b2b"}
        fontFamily={SERIF}
        fontSize={13.5}
        fontStyle={"italic"}
        width={230}
        textWrap
        textAlign={"left"}
        x={-108}
        y={-DOC_H / 2 + 520}
      />

      {/* right column */}
      <Txt
        text={evidence}
        fill={"#2b2b2b"}
        fontFamily={SERIF}
        fontSize={13.5}
        width={210}
        textWrap
        textAlign={"left"}
        x={130}
        y={-DOC_H / 2 + 250}
      />
      <Rect
        width={220}
        height={96}
        fill={"#eae6d9"}
        stroke={"#dcd4be"}
        lineWidth={1}
        radius={2}
        x={130}
        y={-DOC_H / 2 + 390}
      />
      <Txt
        text={`Key Finding: ${keyFinding}`}
        fill={"#2b2b2b"}
        fontFamily={SERIF}
        fontSize={12}
        width={196}
        textWrap
        textAlign={"left"}
        x={130}
        y={-DOC_H / 2 + 390}
      />

      {/* highlighter strokes (drawn later) — coords relative to doc center */}
      <Line
        ref={hl1}
        points={[
          [-200, -DOC_H / 2 + 100],
          [200, -DOC_H / 2 + 100],
        ]}
        stroke={marker}
        lineWidth={18}
        lineCap={"round"}
        end={0}
        opacity={0.78}
        zIndex={20}
      />
      <Line
        ref={hl2a}
        points={[
          [28, -DOC_H / 2 + 228],
          [228, -DOC_H / 2 + 228],
        ]}
        stroke={marker}
        lineWidth={16}
        lineCap={"round"}
        end={0}
        opacity={0.78}
        zIndex={20}
      />
      <Line
        ref={hl2b}
        points={[
          [28, -DOC_H / 2 + 250],
          [210, -DOC_H / 2 + 250],
        ]}
        stroke={marker}
        lineWidth={16}
        lineCap={"round"}
        end={0}
        opacity={0.78}
        zIndex={20}
      />
      <Line
        ref={hl3a}
        points={[
          [-232, -DOC_H / 2 + 500],
          [0, -DOC_H / 2 + 500],
        ]}
        stroke={marker}
        lineWidth={16}
        lineCap={"round"}
        end={0}
        opacity={0.78}
        zIndex={20}
      />
      <Line
        ref={hl3b}
        points={[
          [-232, -DOC_H / 2 + 522],
          [-10, -DOC_H / 2 + 522],
        ]}
        stroke={marker}
        lineWidth={16}
        lineCap={"round"}
        end={0}
        opacity={0.78}
        zIndex={20}
      />
    </Node>,
  );

  // Cam-pos-0: wide overview with slight foreshorten (fake rotateX)
  world().position([0, -30]);
  world().scale([0.62, 0.56]);
  world().rotation(-1);

  const moveCam = (x: number, y: number, sx: number, sy: number, rot: number, dur: number) =>
    all(
      world().position([x, y], dur, easeInOutCubic),
      world().scale([sx, sy], dur, easeInOutCubic),
      world().rotation(rot, dur, easeInOutCubic),
    );

  yield* pause(t.startDelay);
  yield* waitFor(0.9);

  // Cam-pos-1: zoom into headline
  yield* moveCam(10, 160, 1.28, 1.18, 2, t.revealDuration * 1.6);
  yield* waitFor(0.35);
  yield* hl1().end(1, t.lineDuration * 1.15, easeOutCubic);
  yield* waitFor(0.75);

  // Cam-pos-2: sweep to right evidence column
  yield* moveCam(-150, 40, 1.42, 1.28, -3, t.revealDuration * 1.55);
  yield* waitFor(0.35);
  yield* all(
    hl2a().end(1, t.lineDuration, easeOutCubic),
    hl2b().end(1, t.lineDuration * 1.1, easeOutCubic),
  );
  yield* waitFor(0.85);

  // Cam-pos-3: macro close-up on quote / conclusion
  yield* moveCam(90, -200, 1.55, 1.38, 3.5, t.revealDuration * 1.55);
  yield* waitFor(0.35);
  yield* all(
    hl3a().end(1, t.lineDuration, easeOutCubic),
    hl3b().end(1, t.lineDuration * 1.1, easeOutCubic),
  );
  yield* waitFor(1.0);

  // Pull back to overview
  yield* moveCam(0, -30, 0.62, 0.56, -1, t.revealDuration * 1.5);
  yield* waitFor(1.1);
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
    case "news-3d-real-flip":
      yield* realFlip(view);
      break;
    case "news-3d-real-spin":
      yield* realSpinDesk(view);
      break;
    case "news-3d-real-stack":
      yield* realStack(view);
      break;
    case "news-3d-real-turn":
      yield* realSideTurn(view);
      break;
    case "news-3d-vox-tour":
      yield* voxCameraTour(view);
      break;
    case "news-3d-vox-rack":
      yield* voxFocusRack(view);
      break;
    case "news-3d-vox-orbit":
      yield* voxParallaxOrbit(view);
      break;
    case "news-3d-vox-doc":
      yield* voxDocCinematic(view);
      break;
    default:
      yield* flipIn(view);
  }
}
