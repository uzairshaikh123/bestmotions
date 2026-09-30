/** @jsxImportSource @revideo/2d/lib */
/**
 * Mystery / newspaper board scenes — photographic textures, real pushpins,
 * soft contact shadows, and film-dirt overlay (bundled local assets).
 */
import { Circle, Img, Layout, Line, Node, Rect, Txt } from "@revideo/2d";
import { easeInOutCubic } from "@revideo/core";
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  str,
  waitFor,
} from "../../lib/helpers";
import { hash01, PaperGrain } from "../../lib/paper";
import { itemDelays, pause, timing } from "../../lib/timing";
import boardDarkUrl from "../../textures/board-dusty-dark.jpg";
import boardLightUrl from "../../textures/board-dusty-light.jpg";
import paperNewsUrl from "../../textures/paper-newsprint.jpg";
import pushpinUrl from "../../textures/pushpin.png";
import tornEdgeUrl from "../../textures/torn-edge-photo.png";

const SERIF = "Libre Baskerville, Georgia, serif";
const SANS = "Sora, Helvetica, sans-serif";

type CardSpec = {
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  seed: number;
  label: string;
  src: string;
  pin: "tl" | "tr" | "bl" | "br" | "top";
  fill: string;
  kind: "photo" | "clip";
  masthead?: string;
  headline?: string;
};

/** Irregular deckle / hand-torn outline — not a regular postage scallop. */
function scallopOutline(
  width: number,
  height: number,
  tooth = 9,
  depth = 10,
  seed = 1,
): [number, number][] {
  const pts: [number, number][] = [];
  const edge = (
    count: number,
    from: [number, number],
    to: [number, number],
    nx: number,
    ny: number,
    salt: number,
  ) => {
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const x = from[0] + (to[0] - from[0]) * t;
      const y = from[1] + (to[1] - from[1]) * t;
      const n1 = (hash01(seed * 9 + salt + i * 1.7) - 0.5) * depth * 1.35;
      const n2 = (hash01(seed * 3 + salt + i * 4.1) - 0.5) * depth * 0.55;
      const bite = hash01(seed + salt + i * 7.3);
      const deep = bite > 0.9 ? depth * 0.85 : bite > 0.78 ? depth * 0.4 : 0;
      const fiber = hash01(seed * 5 + i * 11.2) > 0.88 ? depth * 0.55 : 0;
      const out = n1 + n2 - deep - fiber;
      pts.push([x + nx * out, y + ny * out]);
    }
  };
  const l = -width / 2;
  const r = width / 2;
  const top = -height / 2;
  const b = height / 2;
  const across = Math.max(18, Math.round(width / tooth));
  const down = Math.max(14, Math.round(height / tooth));
  edge(across, [l, top], [r, top], 0, 1, 10);
  edge(down, [r, top], [r, b], -1, 0, 40);
  edge(across, [r, b], [l, b], 0, -1, 70);
  edge(down, [l, b], [l, top], 1, 0, 100);
  return pts;
}

function photoFill(src: string, w: number, h: number, fill: string, label: string) {
  if (src) return <Img src={src} width={w} height={h} />;
  return (
    <Node>
      <Rect width={w} height={h} fill={fill} />
      <Rect width={w} height={h} fill={"#000000"} opacity={0.18} />
      <Txt
        text={label}
        fill={"#f4efe6"}
        fontFamily={SERIF}
        fontSize={Math.max(13, Math.min(20, w * 0.075))}
        fontWeight={700}
        textAlign={"center"}
        width={w - 28}
        textWrap
      />
    </Node>
  );
}

/** Photoreal pushpin PNG + soft contact shadow under the head. */
function RealPin(size = 52) {
  return (
    <Node zIndex={24}>
      <Circle
        width={size * 0.72}
        height={size * 0.26}
        fill={"#0a0505"}
        opacity={0.42}
        y={size * 0.3}
        x={1.5}
        shadowBlur={10}
        shadowColor={"#000000cc"}
      />
      <Img src={pushpinUrl} width={size * 1.2} height={size * 1.2} y={-size * 0.02} />
    </Node>
  );
}

function pinOffset(spec: CardSpec): [number, number] {
  const hx = spec.w * 0.4;
  const hy = spec.h * 0.4;
  switch (spec.pin) {
    case "tl":
      return [-hx, -hy];
    case "tr":
      return [hx, -hy];
    case "bl":
      return [-hx, hy];
    case "br":
      return [hx, hy];
    default:
      return [0, -hy];
  }
}

function fiberLines(
  a: [number, number],
  b: [number, number],
  color: string,
  animated: boolean,
  refs?: { shadow: any; soft: any; core: any; strandA: any; strandB: any },
) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * 1.55;
  const ny = (dx / len) * 1.55;
  const end = animated ? 0 : 1;
  // Slight sag so string reads as yarn, not a vector stroke
  const mid: [number, number] = [
    (a[0] + b[0]) / 2 + nx * 0.35,
    (a[1] + b[1]) / 2 + Math.abs(ny) * 0.15 + 4,
  ];
  const path: [number, number][] = [a, mid, b];
  const shadowPath: [number, number][] = path.map(([x, y]) => [x + 2.8, y + 3.4]);
  return (
    <Node>
      <Line
        ref={refs?.shadow}
        points={shadowPath}
        stroke={"#0a0604"}
        lineWidth={7}
        end={end}
        lineCap={"round"}
        opacity={0.32}
        shadowBlur={6}
        shadowColor={"#00000088"}
      />
      <Line
        ref={refs?.soft}
        points={path}
        stroke={"#5c1010"}
        lineWidth={5.6}
        end={end}
        lineCap={"round"}
        opacity={0.55}
      />
      <Line
        ref={refs?.core}
        points={path}
        stroke={color}
        lineWidth={4.4}
        end={end}
        lineCap={"round"}
        opacity={0.96}
      />
      <Line
        ref={refs?.strandA}
        points={path.map(([x, y]) => [x + nx, y + ny])}
        stroke={"#ff6b6b"}
        lineWidth={1.5}
        end={end}
        lineCap={"round"}
        opacity={0.5}
      />
      <Line
        ref={refs?.strandB}
        points={path.map(([x, y]) => [x - nx * 0.75, y - ny * 0.75])}
        stroke={"#8b1515"}
        lineWidth={1.3}
        end={end}
        lineCap={"round"}
        opacity={0.42}
      />
    </Node>
  );
}

function* drawFiberString(
  parent: any,
  a: [number, number],
  b: [number, number],
  color: string,
  duration: number,
  z = 5,
) {
  const shadow = createRef<Line>();
  const soft = createRef<Line>();
  const core = createRef<Line>();
  const strandA = createRef<Line>();
  const strandB = createRef<Line>();
  yield parent.add(
    <Node zIndex={z}>{fiberLines(a, b, color, true, { shadow, soft, core, strandA, strandB })}</Node>,
  );
  yield* all(
    shadow().end(1, duration, easeOutCubic),
    soft().end(1, duration, easeOutCubic),
    core().end(1, duration, easeOutCubic),
    strandA().end(1, duration * 1.02, easeOutCubic),
    strandB().end(1, duration * 0.98, easeOutCubic),
  );
}

function fiberStringStatic(a: [number, number], b: [number, number], color: string, z = 5) {
  return <Node zIndex={z}>{fiberLines(a, b, color, false)}</Node>;
}

/** Full-frame film dirt: dust, scratches, hair fibers. */
function FilmDirt({ seed }: { seed: number }) {
  const dots = Array.from({ length: 160 }, (_, i) => {
    const x = (hash01(seed + i * 3.1) - 0.5) * 1280;
    const y = (hash01(seed + i * 7.7) - 0.5) * 720;
    const s = 0.8 + hash01(seed + i * 11.2) * 2.8;
    return { x, y, s, o: 0.05 + hash01(seed + i) * 0.22, key: `g-${i}` };
  });
  const scratches = Array.from({ length: 14 }, (_, i) => {
    const x = (hash01(seed + 200 + i * 4.2) - 0.5) * 1200;
    const y = (hash01(seed + 260 + i * 6.1) - 0.5) * 680;
    const len = 18 + hash01(seed + 300 + i) * 90;
    const rot = (hash01(seed + 340 + i) - 0.5) * 160;
    return {
      x,
      y,
      len,
      rot,
      o: 0.04 + hash01(seed + 380 + i) * 0.1,
      key: `s-${i}`,
    };
  });
  const hairs = Array.from({ length: 9 }, (_, i) => {
    const x = (hash01(seed + 500 + i * 5.5) - 0.5) * 1180;
    const y = (hash01(seed + 560 + i * 3.3) - 0.5) * 660;
    const len = 28 + hash01(seed + 600 + i) * 70;
    const rot = (hash01(seed + 640 + i) - 0.5) * 180;
    return {
      x,
      y,
      len,
      rot,
      o: 0.06 + hash01(seed + 680 + i) * 0.12,
      key: `h-${i}`,
    };
  });
  return (
    <Node opacity={0.72} zIndex={50}>
      {dots.map((d) => (
        <Circle key={d.key} width={d.s} height={d.s} fill={"#ffffff"} x={d.x} y={d.y} opacity={d.o} />
      ))}
      {scratches.map((s) => (
        <Rect
          key={s.key}
          width={s.len}
          height={1.1}
          fill={"#f5f0e8"}
          opacity={s.o}
          x={s.x}
          y={s.y}
          rotation={s.rot}
        />
      ))}
      {hairs.map((h) => (
        <Rect
          key={h.key}
          width={h.len}
          height={1.4}
          fill={"#d8d0c4"}
          opacity={h.o}
          x={h.x}
          y={h.y}
          rotation={h.rot}
        />
      ))}
    </Node>
  );
}

function PaperWash(opts: { w: number; h: number; tint: string; seed?: number }) {
  const w = opts.w;
  const h = opts.h;
  const tint = opts.tint;
  const seed = opts.seed ?? 3;
  return (
    <Node>
      <Rect width={w} height={h} fill={tint} />
      <Img src={paperNewsUrl} width={w} height={h} opacity={0.48} />
      <Rect width={w} height={h} fill={tint} opacity={0.22} />
      <PaperGrain width={w} height={h} seed={seed} />
      <Rect width={w * 0.92} height={h * 0.9} fill={"#fff8ec"} opacity={0.06} />
    </Node>
  );
}

function* mountBoardShell(view: any, opts: { title: string; accent: string }) {
  view.fill("#0a0908");
  const world = createRef<Node>();
  yield view.add(<Node ref={world} />);
  yield world().add(
    <Node>
      <Img src={boardDarkUrl} width={1680} height={980} />
      <Rect width={1680} height={980} fill={"#0a0806"} opacity={0.28} />
      {/* Light paper wall — hard left edge covered by photoreal tear strip */}
      <Node x={455} y={6} zIndex={1}>
        <Img src={boardLightUrl} width={1180} height={1000} />
        <Rect width={1180} height={1000} fill={"#cfc5b4"} opacity={0.1} />
      </Node>
      {/* Fibrous hand-torn seam (transparent left → paper right) */}
      <Node x={-35} y={0} zIndex={3}>
        <Img
          src={tornEdgeUrl}
          width={340}
          height={1040}
          x={8}
          y={4}
          opacity={0.28}
        />
        <Img src={tornEdgeUrl} width={340} height={1040} />
      </Node>
      <Rect width={1600} height={980} fill={"#000000"} opacity={0.16} zIndex={4} />
      <Rect width={1500} height={920} fill={"#000000"} opacity={0.1} zIndex={4} />
      <FilmDirt seed={44} />
      <Txt
        text={opts.title.toUpperCase()}
        fill={opts.accent}
        fontFamily={SERIF}
        fontSize={15}
        letterSpacing={7}
        fontWeight={700}
        y={-312}
        zIndex={55}
      />
    </Node>,
  );
  return world;
}

function evidenceCards(mode: "photo" | "clip"): CardSpec[] {
  const accentFill = str("placeholderColor", mode === "clip" ? "#2a241c" : "#1a2744");
  const labels = [
    str("label1", "Footage No.1"),
    str("label2", "Footage No.2"),
    str("label3", "Footage No.3"),
    str("label4", "Footage No.4"),
  ];
  const srcs = [str("image1", ""), str("image2", ""), str("image3", ""), str("image4", "")];
  const heroSrc = str("imageHero", "");
  const caption = str("caption", "Lead subject");
  const masthead = str("masthead", "THE DAILY RECORD");
  const headline = str("headline", "The story they tried to bury");

  return [
    { x: -340, y: -150, w: 210, h: 210, rot: -7, seed: 3, label: labels[0], src: srcs[0], pin: "br", fill: accentFill, kind: mode, masthead, headline: labels[0] },
    { x: 320, y: -140, w: 230, h: 180, rot: 6, seed: 8, label: labels[1], src: srcs[1], pin: "bl", fill: accentFill, kind: mode, masthead, headline: labels[1] },
    { x: -300, y: 150, w: 180, h: 240, rot: 5, seed: 12, label: labels[2], src: srcs[2], pin: "tr", fill: accentFill, kind: mode, masthead, headline: labels[2] },
    { x: 300, y: 160, w: 240, h: 170, rot: -5, seed: 17, label: labels[3], src: srcs[3], pin: "tl", fill: accentFill, kind: mode, masthead, headline: labels[3] },
    { x: 0, y: 10, w: 280, h: 300, rot: -2, seed: 21, label: caption, src: heroSrc, pin: "top", fill: accentFill, kind: mode, masthead, headline },
  ];
}

function cardVisual(spec: CardSpec, ink: string) {
  const outline = scallopOutline(spec.w + 30, spec.h + 38, 8, 11, spec.seed);
  const innerW = spec.w;
  const innerH = spec.h;
  const pinLocal = pinOffset(spec);
  const paperTint = str("paperColor", "#f2ebe0");

  return (
    <Node>
      {/* Soft stacked contact shadow (directional, bottom-right) */}
      <Line points={outline.map(([x, y]) => [x + 10, y + 14])} closed fill={"#000000"} opacity={0.18} />
      <Line points={outline.map(([x, y]) => [x + 6, y + 8])} closed fill={"#000000"} opacity={0.22} />
      <Line points={outline.map(([x, y]) => [x + 3, y + 4])} closed fill={"#000000"} opacity={0.16} />
      <Line points={outline} closed fill={"#f4efe6"} />
      <Line points={outline} stroke={"#2a2418"} lineWidth={1.2} opacity={0.2} />
      <Node>
        <PaperWash w={innerW + 10} h={innerH + 10} tint={paperTint} seed={spec.seed} />
        {spec.kind === "clip" ? (
          <Node>
            <Layout y={-innerH * 0.28} width={innerW - 16} layout direction={"column"} gap={6} alignItems={"center"}>
              <Txt text={(spec.masthead || "THE DAILY").toUpperCase()} fill={"#8b1e1e"} fontFamily={SERIF} fontSize={11} letterSpacing={3} fontWeight={700} />
              <Txt text={spec.headline || spec.label} fill={ink} fontFamily={SERIF} fontSize={16} fontWeight={700} textAlign={"center"} width={innerW - 20} textWrap />
            </Layout>
            <Node y={innerH * 0.18}>
              {spec.src ? (
                <Img src={spec.src} width={innerW - 24} height={innerH * 0.42} />
              ) : (
                <Rect width={innerW - 24} height={innerH * 0.42} fill={spec.fill} opacity={0.85} />
              )}
            </Node>
            <Txt text={spec.label} fill={"#4a4038"} fontFamily={SANS} fontSize={12} y={innerH * 0.42} />
          </Node>
        ) : (
          <Node>
            <Node y={-4}>{photoFill(spec.src, innerW, innerH - 30, spec.fill, spec.label)}</Node>
            <Txt text={spec.label} fill={"#1a1510"} fontFamily={SANS} fontSize={13} fontWeight={650} y={innerH * 0.42} />
          </Node>
        )}
      </Node>
      <Node x={pinLocal[0]} y={pinLocal[1]} zIndex={10}>
        {RealPin(50)}
      </Node>
    </Node>
  );
}

function worldPin(spec: CardSpec): [number, number] {
  const local = pinOffset(spec);
  const rad = (spec.rot * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [
    spec.x + local[0] * cos - local[1] * sin,
    spec.y + local[0] * sin + local[1] * cos,
  ];
}

const WEB_PAIRS: Array<[number, number]> = [
  [0, 1],
  [1, 3],
  [3, 2],
  [2, 0],
  [0, 4],
  [1, 4],
  [2, 4],
  [3, 4],
];

function* mysteryAssemble(view: any, mode: "photo" | "clip") {
  const title = str("title", mode === "clip" ? "CLIPPINGS" : "CASE BOARD");
  const accent = str("stringColor", "#e63946");
  const t = timing();
  const extra = itemDelays(5);
  const cards = evidenceCards(mode);
  const world = yield* mountBoardShell(view, { title, accent });
  const cardRefs = cards.map(() => createRef<Node>());

  yield* pause(t.startDelay);
  for (let oi = 0; oi < 5; oi++) {
    const i = oi;
    if (oi > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const spec = cards[i];
    yield world().add(
      <Node ref={cardRefs[i]} x={spec.x} y={spec.y - 42} rotation={spec.rot} scale={0.55} opacity={0} zIndex={12 + i}>
        {cardVisual(spec, "#171310")}
      </Node>,
    );
    yield* all(
      cardRefs[i]().opacity(1, t.revealDuration * 0.5, easeOutCubic),
      cardRefs[i]().scale(1, t.revealDuration, easeOutBack),
      cardRefs[i]().y(spec.y, t.revealDuration, easeOutCubic),
    );
  }

  yield* pause(t.connectDelay);
  const pins = cards.map(worldPin);
  for (let i = 0; i < WEB_PAIRS.length; i++) {
    if (i > 0) yield* pause(t.stepDelay * 0.35);
    const [a, b] = WEB_PAIRS[i];
    yield* drawFiberString(world(), pins[a], pins[b], accent, t.lineDuration * 0.85, 6);
  }
  yield* waitFor(1.35);
}

function* mysteryTour(view: any) {
  const title = str("title", "THE NETWORK");
  const accent = str("stringColor", "#e63946");
  const t = timing();
  const cards = evidenceCards("photo");
  const world = yield* mountBoardShell(view, { title, accent });

  for (let i = 0; i < cards.length; i++) {
    yield world().add(
      <Node x={cards[i].x} y={cards[i].y} rotation={cards[i].rot} zIndex={12 + i}>
        {cardVisual(cards[i], "#171310")}
      </Node>,
    );
  }
  const pins = cards.map(worldPin);
  for (const [a, b] of WEB_PAIRS) {
    yield world().add(fiberStringStatic(pins[a], pins[b], accent, 6));
  }

  const shots = [
    { x: -cards[4].x * 1.15, y: -cards[4].y * 1.1, scale: 1.55, hold: 0.55 },
    { x: -cards[0].x * 1.2, y: -cards[0].y * 1.15, scale: 1.72, hold: 0.72 },
    { x: -cards[1].x * 1.15, y: -cards[1].y * 1.1, scale: 1.68, hold: 0.72 },
    { x: -cards[2].x * 1.2, y: -cards[2].y * 1.15, scale: 1.72, hold: 0.72 },
    { x: -cards[3].x * 1.15, y: -cards[3].y * 1.1, scale: 1.68, hold: 0.72 },
    { x: 0, y: 10, scale: 1, hold: 1.45 },
  ];
  world().scale(shots[0].scale);
  world().position([shots[0].x, shots[0].y]);
  yield* pause(t.startDelay);
  yield* waitFor(shots[0].hold);
  for (let i = 1; i < shots.length; i++) {
    const s = shots[i];
    yield* all(
      world().position([s.x, s.y], t.revealDuration * 1.4, easeInOutCubic),
      world().scale(s.scale, t.revealDuration * 1.4, easeInOutCubic),
    );
    yield* waitFor(s.hold);
  }
}

function* newsPageDive(view: any) {
  const masthead = str("masthead", "THE MORNING TRIBUNE");
  const headline = str("headline", "Historic turnout reshapes the map overnight");
  const highlight = str("highlight", "Historic turnout");
  const body = str("body", "Crowds filled the avenues as tallies poured in from every district before dawn.");
  const imageUrl = str("imageHero", "");
  const accent = str("stringColor", "#e63946");
  const t = timing();

  view.fill("#0a0908");
  const world = createRef<Node>();
  yield view.add(<Node ref={world} />);
  yield world().add(
    <Node>
      <Img src={boardDarkUrl} width={1680} height={980} />
      <Rect width={1680} height={980} fill={"#0a0806"} opacity={0.3} />
      <Node y={8} rotation={-2.5} zIndex={4}>
        <Rect width={780} height={520} fill={"#000000"} opacity={0.38} x={10} y={12} shadowBlur={32} shadowColor={"#000000aa"} />
        <PaperWash w={760} h={500} tint={"#f2e8d4"} seed={61} />
        <Txt text={masthead} fill={"#8b1e1e"} fontFamily={SERIF} fontSize={22} fontWeight={700} letterSpacing={6} y={-198} />
        <Rect width={640} height={2} fill={"#1a1510"} y={-168} opacity={0.7} />
        <Node y={-40}>
          {imageUrl ? <Img src={imageUrl} width={520} height={200} /> : <Rect width={520} height={200} fill={"#1a2744"} />}
        </Node>
        <Txt text={headline} fill={"#171310"} fontFamily={SERIF} fontSize={28} fontWeight={700} width={620} textWrap textAlign={"center"} y={110} />
        <Txt text={body} fill={"#3d342c"} fontFamily={SERIF} fontSize={15} width={620} textWrap textAlign={"center"} y={188} />
        <Node x={-300} y={-210}>{RealPin(44)}</Node>
        <Node x={300} y={-210}>{RealPin(44)}</Node>
      </Node>
      <FilmDirt seed={61} />
      <Txt text={highlight.toUpperCase()} fill={accent} fontFamily={SERIF} fontSize={13} letterSpacing={5} y={-310} zIndex={55} />
    </Node>,
  );

  world().scale(1.55);
  world().position([40, 60]);
  yield* pause(t.startDelay);
  yield* all(
    world().scale(1.25, t.revealDuration * 1.5, easeInOutCubic),
    world().position([0, -40], t.revealDuration * 1.5, easeInOutCubic),
  );
  yield* waitFor(0.45);
  yield* all(
    world().scale(1, t.revealDuration * 1.6, easeInOutCubic),
    world().position([0, 0], t.revealDuration * 1.6, easeInOutCubic),
  );
  yield* waitFor(1.3);
}

function* newsClipRail(view: any) {
  const title = str("title", "THE TRAIL");
  const accent = str("stringColor", "#e63946");
  const t = timing();
  const labels = [str("label1", "Witness"), str("label2", "Location"), str("label3", "Timeline"), str("label4", "Exhibit")];
  const srcs = [str("image1", ""), str("image2", ""), str("image3", ""), str("image4", "")];

  view.fill("#0a0908");
  const world = createRef<Node>();
  yield view.add(<Node ref={world} />);
  yield world().add(<Img src={boardLightUrl} width={2200} height={980} x={200} />);
  yield world().add(<Img src={boardDarkUrl} width={900} height={980} x={-700} />);
  yield world().add(<Rect width={900} height={980} fill={"#0a0806"} opacity={0.25} x={-700} />);
  yield world().add(<FilmDirt seed={77} />);
  yield world().add(
    <Txt text={title.toUpperCase()} fill={accent} fontFamily={SERIF} fontSize={15} letterSpacing={7} fontWeight={700} y={-300} zIndex={55} />,
  );

  const cards: CardSpec[] = labels.map((label, i) => ({
    x: -360 + i * 260,
    y: (i % 2 === 0 ? -30 : 40) + (i === 1 ? -20 : 0),
    w: 200,
    h: 240,
    rot: -6 + i * 3.5,
    seed: 4 + i * 5,
    label,
    src: srcs[i],
    pin: (i % 2 === 0 ? "tr" : "tl") as CardSpec["pin"],
    fill: str("placeholderColor", "#1a2744"),
    kind: "clip" as const,
    masthead: str("masthead", "THE DAILY RECORD"),
    headline: label,
  }));

  for (let i = 0; i < cards.length; i++) {
    yield world().add(
      <Node x={cards[i].x} y={cards[i].y} rotation={cards[i].rot} zIndex={10 + i}>
        {cardVisual(cards[i], "#171310")}
      </Node>,
    );
  }
  const pins = cards.map(worldPin);
  for (let i = 0; i < pins.length - 1; i++) {
    yield world().add(fiberStringStatic(pins[i], pins[i + 1], accent, 6));
  }

  world().position([220, 0]);
  world().scale(1.35);
  yield* pause(t.startDelay);
  yield* all(world().position([-220, 0], 3.2, easeInOutCubic), world().scale(1.15, 3.2, easeInOutCubic));
  yield* waitFor(0.9);
}

function* newsStackParallax(view: any) {
  const masthead = str("masthead", "EVENING POST");
  const headline = str("headline", "Secrets buried in the archives finally surface");
  const accent = str("stringColor", "#e63946");
  const t = timing();

  view.fill("#0a0908");
  const world = createRef<Node>();
  const back = createRef<Node>();
  const mid = createRef<Node>();
  const front = createRef<Node>();
  yield view.add(<Node ref={world} />);
  yield world().add(<Img src={boardDarkUrl} width={1680} height={980} />);
  yield world().add(<Rect width={1680} height={980} fill={"#0a0806"} opacity={0.28} />);
  yield world().add(<FilmDirt seed={88} />);

  const plate = (w: number, h: number, rot: number, label: string, seed: number) => (
    <Node rotation={rot}>
      <Rect width={w + 12} height={h + 12} fill={"#000000"} opacity={0.34} x={8} y={10} shadowBlur={26} shadowColor={"#000000aa"} />
      <PaperWash w={w} h={h} tint={"#f2e8d4"} seed={seed} />
      <Txt text={masthead} fill={"#8b1e1e"} fontFamily={SERIF} fontSize={14} letterSpacing={4} fontWeight={700} y={-h * 0.38} />
      <Txt text={label} fill={"#171310"} fontFamily={SERIF} fontSize={22} fontWeight={700} width={w - 80} textWrap textAlign={"center"} y={-10} />
      <Node x={-w * 0.4} y={-h * 0.4}>{RealPin(42)}</Node>
    </Node>
  );

  yield world().add(<Node ref={back} x={-40} y={20} scale={0.92} zIndex={2}>{plate(620, 400, -8, str("label1", "Earlier edition"), 11)}</Node>);
  yield world().add(<Node ref={mid} x={30} y={10} scale={0.96} zIndex={4}>{plate(640, 420, 4, str("label2", "Follow-up report"), 14)}</Node>);
  yield world().add(<Node ref={front} zIndex={8}>{plate(680, 440, -2.5, headline, 17)}</Node>);
  yield world().add(<Txt text={"STACK"} fill={accent} fontFamily={SERIF} fontSize={14} letterSpacing={6} y={-310} zIndex={55} />);

  yield* pause(t.startDelay);
  yield* all(back().x(-70, 1.4, easeInOutCubic), mid().x(55, 1.4, easeInOutCubic), front().scale(1.04, 1.4, easeInOutCubic), world().rotation(2, 1.4, easeInOutCubic));
  yield* all(back().x(-30, 1.4, easeInOutCubic), mid().x(10, 1.4, easeInOutCubic), front().scale(1, 1.4, easeInOutCubic), world().rotation(-1.5, 1.4, easeInOutCubic));
  yield* all(world().rotation(0, 0.8, easeInOutCubic), world().scale(1.06, 0.8, easeOutCubic));
  yield* waitFor(1.1);
}

export function* runNewsMystery(view: any, template: string) {
  switch (template) {
    case "news-mystery-board":
      yield* mysteryAssemble(view, "photo");
      break;
    case "news-mystery-tour":
      yield* mysteryTour(view);
      break;
    case "news-mystery-clippings":
      yield* mysteryAssemble(view, "clip");
      break;
    case "news-mystery-page-dive":
      yield* newsPageDive(view);
      break;
    case "news-mystery-clip-rail":
      yield* newsClipRail(view);
      break;
    case "news-mystery-stack-parallax":
      yield* newsStackParallax(view);
      break;
    default:
      yield* mysteryAssemble(view, "photo");
  }
}
