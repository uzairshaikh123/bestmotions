/** @jsxImportSource @revideo/2d/lib */
import { Circle, Line, Rect, Txt } from "@revideo/2d";
import {
  SERIF,
  SANS,
  colors,
  parseEvents,
  DEFAULT_EVENTS,
  fadeInTxt,
  hold,
  all,
  createRef,
  easeOutCubic,
  easeOutBack,
  waitFor,
  pause,
  itemDelays,
} from "../../lib/docKit";
import { num } from "../../lib/helpers";

type Gen = (view: any) => Generator;

function* riseTheRise(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "The Rise", { size: 28, y: -280, fill: "#fff" });
  for (let i = 0; i < 5; i++) {
    const step = createRef<Rect>();
    const glow = createRef<Rect>();
    const x = -280 + i * 140;
    const y = 160 - i * 50;
    yield view.add(<Rect ref={step} width={0} height={40} fill={"#1e293b"} x={x} y={y} radius={4} />);
    yield view.add(<Rect ref={glow} width={0} height={40} fill={c.accent} x={x} y={y} radius={4} opacity={0.5} />);
    yield* all(step().width(120, 0.3, easeOutCubic), glow().width(120, 0.3, easeOutCubic));
    yield* pause(0.08);
  }
  if (c.claim) yield* fadeInTxt(view, c.claim, { fill: "#94a3b8", size: 16, y: 240, font: SANS });
  yield* hold(1);
}

function* riseTheFall(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "The Fall", { size: 28, y: -280, fill: "#fca5a5" });
  const blocks = Array.from({ length: 6 }, () => createRef<Rect>());
  for (let i = 0; i < blocks.length; i++) {
    yield view.add(
      <Rect ref={blocks[i]} width={160} height={50} fill={i % 2 ? "#7f1d1d" : "#991b1b"} x={(i % 2) * 20 - 10} y={120 - i * 55} radius={4} />,
    );
  }
  yield* waitFor(0.35);
  for (let i = blocks.length - 1; i >= 0; i--) {
    yield* all(
      blocks[i]().y(280 + i * 20, 0.35 + i * 0.05, easeOutCubic),
      blocks[i]().rotation((i % 2 ? 1 : -1) * (20 + i * 8), 0.35, easeOutCubic),
      blocks[i]().opacity(0.3, 0.4, easeOutCubic),
    );
  }
  yield* hold(0.9);
}

function* riseRiseAndFall(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS).slice(0, 5);
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Rise and Fall", { size: 26, y: -280, fill: "#fff" });
  const pts: [number, number][] = [
    [-400, 160],
    [-200, 40],
    [0, -80],
    [200, 60],
    [400, 180],
  ];
  const path = createRef<Line>();
  yield view.add(<Line ref={path} points={pts} stroke={c.accent} lineWidth={5} end={0} lineCap={"round"} />);
  yield* path().end(1, 1.4, easeOutCubic);
  const delays = itemDelays(events.length);
  for (let i = 0; i < Math.min(events.length, pts.length); i++) {
    yield* pause(0.05 + (delays[i] || 0));
    yield view.add(<Circle size={14} fill={c.accent} x={pts[i][0]} y={pts[i][1]} />);
    yield view.add(
      <Txt text={events[i].label} fill={"#94a3b8"} fontFamily={SANS} fontSize={12} x={pts[i][0]} y={pts[i][1] + (i < 3 ? -30 : 30)} />,
    );
  }
  yield* hold(0.9);
}

function* riseZeroToHero(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Zero to Hero", { size: 26, y: -260, fill: "#fff" });
  const track = createRef<Rect>();
  const fill = createRef<Rect>();
  yield view.add(<Rect ref={track} width={600} height={28} fill={"#1e293b"} y={40} radius={14} />);
  yield view.add(<Rect ref={fill} width={0} height={28} fill={c.accent} x={-300} y={40} radius={14} />);
  const meter = createRef<Txt>();
  yield view.add(<Txt ref={meter} text={"0"} fill={"#fff"} fontFamily={SERIF} fontSize={56} fontWeight={700} y={-80} />);
  for (let i = 1; i <= 20; i++) {
    const n = Math.round((i / 20) * 100);
    meter().text(String(n));
    fill().width(600 * (i / 20));
    fill().x(-300 + (600 * (i / 20)) / 2);
    yield* waitFor(0.05);
  }
  const badge = createRef<Circle>();
  yield view.add(<Circle ref={badge} size={0} fill={"#fbbf24"} y={140} />);
  yield* badge().size(90, 0.4, easeOutBack);
  yield* fadeInTxt(view, "HERO", { fill: "#0a0c12", size: 16, y: 140, font: SANS, weight: 700, letterSpacing: 2 });
  yield* hold(0.9);
}

function* riseHeroToZero(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const badge = createRef<Circle>();
  yield view.add(<Circle ref={badge} size={120} fill={"#fbbf24"} y={-80} />);
  yield* fadeInTxt(view, "HERO", { fill: "#0a0c12", size: 20, y: -80, font: SANS, weight: 700, letterSpacing: 3 });
  yield* waitFor(0.4);
  const crack = createRef<Line>();
  yield view.add(<Line ref={crack} points={[[-40, -100], [10, -70], [-20, -40], [40, -20]]} stroke={"#7f1d1d"} lineWidth={4} end={0} />);
  yield* crack().end(1, 0.35, easeOutCubic);
  yield* all(badge().opacity(0.3, 0.4, easeOutCubic), badge().scale(0.85, 0.4, easeOutCubic));
  const track = createRef<Rect>();
  const fill = createRef<Rect>();
  yield view.add(<Rect ref={track} width={600} height={28} fill={"#1e293b"} y={100} radius={14} />);
  yield view.add(<Rect ref={fill} width={600} height={28} fill={"#ef4444"} x={0} y={100} radius={14} />);
  yield* all(fill().width(0, 1.0, easeOutCubic), fill().x(-300, 1.0, easeOutCubic));
  yield* fadeInTxt(view, c.title || "Hero to Zero", { fill: "#fca5a5", size: 28, y: 180, font: SERIF });
  yield* hold(0.9);
}

function* riseTheCollapse(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const cols: ReturnType<typeof createRef<Rect>>[] = [];
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 4; row++) {
      const r = createRef<Rect>();
      cols.push(r);
      yield view.add(
        <Rect ref={r} width={70} height={50} fill={row === 3 ? "#334155" : "#475569"} x={-200 + col * 100} y={100 - row * 55} radius={2} />,
      );
    }
  }
  yield* fadeInTxt(view, c.title || "The Collapse", { size: 32, y: -260, fill: "#fff" });
  yield* waitFor(0.3);
  for (let i = cols.length - 1; i >= 0; i--) {
    yield* all(
      cols[i]().y(320 + (i % 5) * 15, 0.4, easeOutCubic),
      cols[i]().rotation((i % 2 ? 25 : -30) + i, 0.4, easeOutCubic),
      cols[i]().opacity(0.2, 0.45, easeOutCubic),
    );
    if (i % 3 === 0) yield* pause(0.02);
  }
  yield* hold(0.8);
}

function* riseTheComeback(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "The Comeback", { size: 28, y: -280, fill: "#fff" });
  const ash = createRef<Rect>();
  yield view.add(<Rect ref={ash} width={400} height={20} fill={"#44403c"} y={180} radius={4} opacity={0.7} />);
  const flame = createRef<Rect>();
  yield view.add(<Rect ref={flame} width={40} height={0} fill={c.accent} y={180} radius={20} />);
  yield* all(flame().height(260, 1.0, easeOutCubic), flame().y(50, 1.0, easeOutCubic));
  const wings = createRef<Line>();
  yield view.add(
    <Line ref={wings} points={[[-120, 40], [0, -40], [120, 40]]} stroke={"#fbbf24"} lineWidth={5} end={0} lineCap={"round"} />,
  );
  yield* wings().end(1, 0.45, easeOutCubic);
  if (c.claim) yield* fadeInTxt(view, c.claim, { fill: "#fde68a", size: 18, y: 240, font: SANS });
  yield* hold(1);
}

function* riseTheDecline(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "The Decline", { size: 32, y: -200, fill: "#fff" });
  const line = createRef<Line>();
  yield view.add(
    <Line ref={line} points={[[-360, -40], [-120, 0], [80, 60], [280, 140], [380, 180]]} stroke={"#ef4444"} lineWidth={4} end={0} lineCap={"round"} />,
  );
  yield* line().end(1, 1.5, easeOutCubic);
  if (c.claim) yield* fadeInTxt(view, c.claim, { fill: "#94a3b8", size: 16, y: 240, font: SANS, width: 700 });
  yield* hold(0.9);
}

function* riseTheDownfall(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const stamp = createRef<Rect>();
  const word = createRef<Txt>();
  yield view.add(<Rect ref={stamp} width={480} height={140} fill={"#7f1d1d"} stroke={"#ef4444"} lineWidth={6} radius={8} rotation={-18} scale={2.2} opacity={0} />);
  yield view.add(
    <Txt ref={word} text={c.title || "DOWNFALL"} fill={"#fecaca"} fontFamily={SERIF} fontSize={52} fontWeight={700} rotation={-18} scale={2.2} opacity={0} letterSpacing={4} />,
  );
  yield* all(
    stamp().scale(1, 0.35, easeOutBack),
    stamp().opacity(1, 0.25, easeOutCubic),
    word().scale(1, 0.35, easeOutBack),
    word().opacity(1, 0.25, easeOutCubic),
  );
  yield* waitFor(0.2);
  yield* all(stamp().rotation(-12, 0.15, easeOutCubic), word().rotation(-12, 0.15, easeOutCubic));
  if (c.eyebrow) yield* fadeInTxt(view, c.eyebrow, { fill: "#94a3b8", size: 14, y: 160, font: SANS, letterSpacing: 4 });
  yield* hold(1.2);
}

function* riseTheExplosion(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const lines: ReturnType<typeof createRef<Line>>[] = [];
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2;
    const ref = createRef<Line>();
    lines.push(ref);
    const x2 = Math.cos(ang) * 220;
    const y2 = Math.sin(ang) * 220;
    yield view.add(<Line ref={ref} points={[[0, 0], [x2, y2]]} stroke={c.accent} lineWidth={4} end={0} />);
  }
  yield* all(...lines.map((l) => l().end(1, 0.45, easeOutCubic)));
  const core = createRef<Circle>();
  yield view.add(<Circle ref={core} size={0} fill={"#fff"} opacity={0.9} />);
  yield* all(core().size(80, 0.3, easeOutBack), core().opacity(0.2, 0.5, easeOutCubic));
  yield* fadeInTxt(view, c.title || "The Explosion", { size: 36, fill: "#fff", font: SERIF, weight: 700 });
  yield* hold(1.1);
}

function* riseTheCrash(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "The Crash", { size: 28, y: -260, fill: "#fff" });
  // Rising candles then crash
  const candles = [
    { x: -240, open: 80, close: 40, high: 20, low: 100 },
    { x: -120, open: 50, close: 10, high: -10, low: 70 },
    { x: 0, open: 20, close: -30, high: -50, low: 40 },
    { x: 120, open: -20, close: 40, high: -40, low: 60 },
  ];
  for (const cd of candles) {
    const wick = createRef<Rect>();
    const body = createRef<Rect>();
    const h = Math.abs(cd.close - cd.open) || 20;
    const y = (cd.open + cd.close) / 2;
    yield view.add(<Rect ref={wick} width={4} height={0} fill={"#94a3b8"} x={cd.x} y={y} />);
    yield view.add(<Rect ref={body} width={48} height={0} fill={"#22c55e"} x={cd.x} y={y} radius={2} />);
    yield* all(
      wick().height(Math.abs(cd.low - cd.high), 0.25, easeOutCubic),
      body().height(h, 0.3, easeOutCubic),
    );
  }
  const crashWick = createRef<Rect>();
  const crashBody = createRef<Rect>();
  yield view.add(<Rect ref={crashWick} width={6} height={0} fill={"#ef4444"} x={280} y={-40} />);
  yield view.add(<Rect ref={crashBody} width={56} height={0} fill={"#ef4444"} x={280} y={40} radius={2} />);
  yield* all(
    crashWick().height(280, 0.55, easeOutCubic),
    crashWick().y(80, 0.55, easeOutCubic),
    crashBody().height(160, 0.55, easeOutCubic),
    crashBody().y(100, 0.55, easeOutCubic),
  );
  yield* hold(1);
}

function* riseTheRecovery(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "The Recovery", { size: 28, y: -260, fill: "#fff" });
  const pts: [number, number][] = [
    [-380, -40],
    [-200, 80],
    [-40, 140],
    [120, 60],
    [280, -60],
    [380, -100],
  ];
  const curve = createRef<Line>();
  yield view.add(<Line ref={curve} points={pts} stroke={c.accent} lineWidth={5} end={0} lineCap={"round"} />);
  yield* curve().end(1, 1.5, easeOutCubic);
  if (c.claim) yield* fadeInTxt(view, c.claim, { fill: "#94a3b8", size: 16, y: 220, font: SANS });
  yield* hold(0.9);
}

function* riseTurningPoint(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS);
  const focusIndex = Math.min(Math.max(0, Math.floor(num("focusIndex", 1))), Math.max(events.length - 1, 0));
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Turning Point", { size: 24, y: -280, fill: "#fff" });
  const rail = createRef<Rect>();
  yield view.add(<Rect ref={rail} width={0} height={4} fill={"#334155"} y={40} />);
  yield* rail().width(800, 0.5, easeOutCubic);
  const delays = itemDelays(events.length);
  for (let i = 0; i < events.length; i++) {
    yield* pause(c.t.stepDelay + (delays[i] || 0));
    const x = -360 + (i * 720) / Math.max(events.length - 1, 1);
    const isFocus = i === focusIndex;
    const node = createRef<Circle>();
    yield view.add(<Circle ref={node} size={0} fill={isFocus ? c.accent : "#475569"} x={x} y={40} />);
    yield* node().size(isFocus ? 28 : 14, 0.3, easeOutBack);
    yield view.add(
      <Txt
        text={events[i].label}
        fill={isFocus ? c.accent : "#64748b"}
        fontFamily={SERIF}
        fontSize={isFocus ? 28 : 14}
        fontWeight={isFocus ? 700 : 400}
        x={x}
        y={isFocus ? -60 : -30}
      />,
    );
    if (isFocus) {
      const spot = createRef<Circle>();
      yield view.add(<Circle ref={spot} size={0} fill={c.accent} x={x} y={40} opacity={0.2} />);
      yield* spot().size(120, 0.4, easeOutCubic);
      yield* fadeInTxt(view, events[i].title, { fill: "#fff", size: 22, x, y: 100, font: SERIF });
      if (events[i].detail) yield* fadeInTxt(view, events[i].detail, { fill: "#94a3b8", size: 14, x, y: 140, font: SANS, width: 240 });
    }
  }
  yield* hold(1);
}

function* risePeakCollapse(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Peak & Collapse", { size: 26, y: -280, fill: "#fff" });
  const peak = createRef<Line>();
  yield view.add(
    <Line ref={peak} points={[[-300, 160], [0, -120], [300, 160]]} closed fill={c.accent} opacity={0.35} end={0} />,
  );
  const outline = createRef<Line>();
  yield view.add(<Line ref={outline} points={[[-300, 160], [0, -120], [300, 160]]} stroke={c.accent} lineWidth={4} end={0} />);
  yield* all(peak().end(1, 0.7, easeOutCubic), outline().end(1, 0.7, easeOutCubic));
  yield* waitFor(0.25);
  // Avalanche slabs
  for (let i = 0; i < 6; i++) {
    const slab = createRef<Rect>();
    yield view.add(
      <Rect ref={slab} width={50 + i * 10} height={20} fill={"#ef4444"} x={40 + i * 30} y={-80 + i * 20} rotation={-20} opacity={0} />,
    );
    yield* all(
      slab().opacity(0.85, 0.1, easeOutCubic),
      slab().y(200 + i * 25, 0.4, easeOutCubic),
      slab().rotation(10 + i * 5, 0.4, easeOutCubic),
    );
  }
  yield* hold(0.8);
}

function* riseGoldenAge(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS).slice(0, 3);
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Golden Age", { size: 28, y: -280, fill: "#fde68a" });
  for (let i = 0; i < 3; i++) {
    const panel = createRef<Rect>();
    yield view.add(
      <Rect ref={panel} width={220} height={280} fill={"#422006"} stroke={"#fbbf24"} lineWidth={2} x={-260 + i * 260} y={20} radius={8} opacity={0} scale={0.9} />,
    );
    yield* all(panel().opacity(1, 0.35, easeOutCubic), panel().scale(1, 0.4, easeOutBack));
    const ev = events[i];
    if (ev) {
      yield view.add(<Txt text={ev.label} fill={"#fbbf24"} fontFamily={SANS} fontSize={14} x={-260 + i * 260} y={-60} />);
      yield view.add(<Txt text={ev.title} fill={"#fef3c7"} fontFamily={SERIF} fontSize={22} x={-260 + i * 260} y={0} width={180} textWrap textAlign={"center"} />);
      if (ev.detail) yield view.add(<Txt text={ev.detail} fill={"#d6d3d1"} fontFamily={SANS} fontSize={13} x={-260 + i * 260} y={80} width={180} textWrap textAlign={"center"} />);
    }
    yield* pause(0.12);
  }
  yield* hold(1);
}

function* riseDarkAge(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS).slice(0, 3);
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Dark Age", { size: 28, y: -280, fill: "#94a3b8" });
  for (let i = 0; i < 3; i++) {
    const panel = createRef<Rect>();
    yield view.add(
      <Rect ref={panel} width={220} height={280} fill={"#0f172a"} stroke={"#334155"} lineWidth={2} x={-260 + i * 260} y={20} radius={8} opacity={0} />,
    );
    yield* panel().opacity(1, 0.4, easeOutCubic);
    const fog = createRef<Rect>();
    yield view.add(<Rect ref={fog} width={220} height={0} fill={"#64748b"} x={-260 + i * 260} y={160} opacity={0.15} />);
    yield* fog().height(200, 0.5, easeOutCubic);
    const ev = events[i];
    if (ev) {
      yield view.add(<Txt text={ev.label} fill={"#64748b"} fontFamily={SANS} fontSize={14} x={-260 + i * 260} y={-60} />);
      yield view.add(<Txt text={ev.title} fill={"#cbd5e1"} fontFamily={SERIF} fontSize={20} x={-260 + i * 260} y={0} width={180} textWrap textAlign={"center"} />);
    }
    yield* pause(0.1);
  }
  yield* hold(1);
}

function* riseBeginningOfEnd(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const title = createRef<Txt>();
  yield view.add(
    <Txt ref={title} text={c.title || "The Beginning of the End"} fill={"#fff"} fontFamily={SERIF} fontSize={40} fontWeight={700} opacity={0} width={800} textWrap textAlign={"center"} />,
  );
  yield* title().opacity(1, 0.45, easeOutCubic);
  yield* waitFor(0.35);
  const crack = createRef<Line>();
  yield view.add(
    <Line ref={crack} points={[[-320, -10], [-100, 5], [40, -15], [200, 8], [340, -5]]} stroke={"#ef4444"} lineWidth={3} end={0} />,
  );
  yield* crack().end(1, 0.6, easeOutCubic);
  if (c.claim) yield* fadeInTxt(view, c.claim, { fill: "#94a3b8", size: 16, y: 120, font: SANS });
  yield* hold(1.1);
}

function* riseWhatWentWrong(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS).slice(0, 5);
  view.fill("#1c1917");
  yield* pause(c.t.startDelay);
  yield view.add(<Rect width={860} height={480} fill={"#292524"} radius={4} />);
  yield* fadeInTxt(view, c.title || "What Went Wrong?", { size: 26, y: -240, fill: "#fef3c7", font: SERIF });
  const pins = [
    { x: -280, y: -80 },
    { x: 40, y: -100 },
    { x: 260, y: -40 },
    { x: -160, y: 80 },
    { x: 180, y: 100 },
  ];
  const delays = itemDelays(events.length);
  for (let i = 0; i < Math.min(events.length, pins.length); i++) {
    yield* pause(c.t.stepDelay + (delays[i] || 0));
    const note = createRef<Rect>();
    const pin = createRef<Circle>();
    yield view.add(
      <Rect ref={note} width={160} height={100} fill={"#fef9c3"} x={pins[i].x} y={pins[i].y} rotation={(i % 2 ? 1 : -1) * (4 + i)} scale={0} />,
    );
    yield view.add(<Circle ref={pin} size={0} fill={"#ef4444"} x={pins[i].x} y={pins[i].y - 48} />);
    yield* all(note().scale(1, 0.35, easeOutBack), pin().size(14, 0.25, easeOutBack));
    yield view.add(
      <Txt text={events[i].title} fill={"#292524"} fontFamily={SERIF} fontSize={14} x={pins[i].x} y={pins[i].y} width={140} textWrap textAlign={"center"} />,
    );
  }
  yield* hold(1);
}

function* riseFinalBlow(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const hammer = createRef<Rect>();
  const head = createRef<Rect>();
  yield view.add(<Rect ref={hammer} width={24} height={200} fill={"#78716c"} x={300} y={-280} rotation={40} />);
  yield view.add(<Rect ref={head} width={100} height={60} fill={"#a8a29e"} x={300} y={-360} rotation={40} radius={4} />);
  yield* all(
    hammer().x(20, 0.35, easeOutCubic),
    hammer().y(-40, 0.35, easeOutCubic),
    hammer().rotation(-10, 0.35, easeOutCubic),
    head().x(20, 0.35, easeOutCubic),
    head().y(-120, 0.35, easeOutCubic),
    head().rotation(-10, 0.35, easeOutCubic),
  );
  const flash = createRef<Circle>();
  yield view.add(<Circle ref={flash} size={0} fill={"#fff"} opacity={0.8} />);
  yield* all(flash().size(400, 0.25, easeOutCubic), flash().opacity(0, 0.35, easeOutCubic));
  yield* fadeInTxt(view, c.title || "The Final Blow", { size: 40, fill: "#fff", font: SERIF, weight: 700 });
  yield* hold(1.1);
}

function* riseBackFromDead(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Back From The Dead", { size: 26, y: -260, fill: "#fff" });
  const flat = createRef<Line>();
  yield view.add(<Line ref={flat} points={[[-400, 40], [400, 40]]} stroke={"#334155"} lineWidth={3} end={0} />);
  yield* flat().end(1, 0.8, easeOutCubic);
  yield* waitFor(0.35);
  const ecg = createRef<Line>();
  yield view.add(
    <Line
      ref={ecg}
      points={[
        [-400, 40],
        [-80, 40],
        [-60, 40],
        [-40, -80],
        [-20, 120],
        [0, -40],
        [20, 40],
        [400, 40],
      ]}
      stroke={c.accent}
      lineWidth={4}
      end={0}
      lineCap={"round"}
    />,
  );
  yield* ecg().end(1, 0.9, easeOutCubic);
  const pulse = createRef<Circle>();
  yield view.add(<Circle ref={pulse} size={0} fill={c.accent} opacity={0.35} x={-40} y={-20} />);
  yield* all(pulse().size(100, 0.35, easeOutCubic), pulse().opacity(0, 0.45, easeOutCubic));
  if (c.claim) yield* fadeInTxt(view, c.claim, { fill: "#86efac", size: 18, y: 180, font: SANS });
  yield* hold(1);
}

const MAP: Record<string, Gen> = {
  "rise-the-rise": riseTheRise,
  "rise-the-fall": riseTheFall,
  "rise-rise-and-fall": riseRiseAndFall,
  "rise-zero-to-hero": riseZeroToHero,
  "rise-hero-to-zero": riseHeroToZero,
  "rise-the-collapse": riseTheCollapse,
  "rise-the-comeback": riseTheComeback,
  "rise-the-decline": riseTheDecline,
  "rise-the-downfall": riseTheDownfall,
  "rise-the-explosion": riseTheExplosion,
  "rise-the-crash": riseTheCrash,
  "rise-the-recovery": riseTheRecovery,
  "rise-turning-point": riseTurningPoint,
  "rise-peak-collapse": risePeakCollapse,
  "rise-golden-age": riseGoldenAge,
  "rise-dark-age": riseDarkAge,
  "rise-beginning-of-end": riseBeginningOfEnd,
  "rise-what-went-wrong": riseWhatWentWrong,
  "rise-final-blow": riseFinalBlow,
  "rise-back-from-dead": riseBackFromDead,
};

export function* runDocRise(view: any, template: string) {
  const fn = MAP[template];
  if (fn) yield* fn(view);
}
