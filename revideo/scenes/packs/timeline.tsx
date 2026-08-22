/** @jsxImportSource @revideo/2d/lib */
import { Circle, Layout, Rect, Txt } from "@revideo/2d";
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  num,
  str,
  waitFor,
} from "../../lib/helpers";

const SERIF = "Libre Baskerville, Georgia, serif";

type Ev = { label: string; title: string; detail: string };

function parseEvents(raw: string, fallback: string): Ev[] {
  const text = (raw || fallback).trim();
  return text
    .split(/\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.includes("|")) {
        const [label = "", title = "", detail = ""] = line
          .split("|")
          .map((p) => p.trim());
        return { label, title: title || label, detail };
      }
      return { label: "", title: line, detail: "" };
    })
    .slice(0, 6);
}

const DEFAULT_EVENTS = `1947|Independence|Freedom at midnight
1950|Republic|Constitution adopted
1991|Reforms|Economy opens
2014|Mandate|A new chapter
2024|Present|Looking ahead`;

function timing() {
  return {
    startDelay: Math.max(0, num("startDelay", 0)),
    stepDelay: Math.max(0, num("stepDelay", 0.12)),
    connectDelay: Math.max(0, num("connectDelay", 0.08)),
    lineDuration: Math.max(0.05, num("lineDuration", 0.55)),
    revealDuration: Math.max(0.08, num("revealDuration", 0.32)),
  };
}

function itemDelays(count: number): number[] {
  const raw = str("itemDelays", "").trim();
  if (!raw) return Array.from({ length: count }, () => 0);
  const parts = raw.split(/[,\n]+/).map((s) => Math.max(0, Number(s.trim()) || 0));
  return Array.from({ length: count }, (_, i) => parts[i] ?? 0);
}

function* pause(sec: number) {
  if (sec > 0) yield* waitFor(sec);
}

/** Technical tick-rail: nodes pop, then a segment draws to the next. */
function* horizontalNodes(view: any) {
  const title = str("title", "Key milestones");
  const accent = str("accent", "#3dd6c6");
  const lineColor = str("lineColor", "#2a3a48");
  const bg = str("bg", "#0a1218");
  const events = parseEvents(str("events", DEFAULT_EVENTS), DEFAULT_EVENTS);
  const t = timing();
  view.fill(bg);

  yield view.add(
    <Txt text={title.toUpperCase()} fill={accent} fontFamily={SERIF} fontSize={14} letterSpacing={6} y={-260} />,
  );
  yield view.add(<Rect width={960} height={2} fill={lineColor} y={40} />);
  yield* pause(t.startDelay);

  const n = Math.max(events.length, 1);
  const extra = itemDelays(events.length);
  const xs = events.map((_, i) => -480 + (i / Math.max(n - 1, 1)) * 960);

  for (let i = 0; i < events.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const tick = createRef<Rect>();
    const node = createRef<Rect>();
    yield view.add(<Rect ref={tick} width={2} height={0} fill={accent} x={xs[i]} y={40} />);
    yield view.add(
      <Rect ref={node} width={18} height={18} fill={accent} x={xs[i]} y={40} rotation={45} scale={0} />,
    );
    yield view.add(
      <Txt text={events[i].label} fill={accent} fontFamily={SERIF} fontSize={16} x={xs[i]} y={-30} />,
    );
    yield view.add(
      <Txt text={events[i].title} fill={"#e8f0ea"} fontFamily={SERIF} fontSize={16} fontWeight={700} x={xs[i]} y={110} width={160} textAlign={"center"} textWrap />,
    );
    yield* all(
      tick().height(28, t.revealDuration * 0.7, easeOutCubic),
      tick().y(26, t.revealDuration * 0.7, easeOutCubic),
      node().scale(1, t.revealDuration, easeOutBack),
    );
    if (i < events.length - 1) {
      yield* pause(t.connectDelay);
      const seg = createRef<Rect>();
      const span = xs[i + 1] - xs[i];
      yield view.add(
        <Rect ref={seg} width={0} height={4} fill={accent} x={xs[i]} y={40} radius={2} />,
      );
      yield* all(
        seg().width(span, t.lineDuration, easeOutCubic),
        seg().x(xs[i] + span / 2, t.lineDuration, easeOutCubic),
      );
    }
  }
  yield* waitFor(1.2);
}

/** Left spine grows to each card, then the plate slides in. */
function* verticalSpine(view: any) {
  const title = str("title", "The story so far");
  const accent = str("accent", "#d8a11a");
  const bg = str("bg", "#071018");
  const events = parseEvents(str("events", DEFAULT_EVENTS), DEFAULT_EVENTS);
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={title} fill={"#f4efe6"} fontFamily={SERIF} fontSize={28} fontWeight={700} x={-320} y={-290} />,
  );
  yield view.add(<Rect width={4} height={Math.min(500, events.length * 92)} fill={"#1a2830"} x={-500} y={-220 + Math.min(500, events.length * 92) / 2} />);
  const grow = createRef<Rect>();
  yield view.add(<Rect ref={grow} width={4} height={0} fill={accent} x={-500} y={-220} />);
  yield* pause(t.startDelay);

  const extra = itemDelays(events.length);
  const gap = 92;
  for (let i = 0; i < events.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const y = -180 + i * gap;
    const targetH = 40 + i * gap;
    yield* pause(t.connectDelay);
    yield* all(
      grow().height(targetH, t.lineDuration, easeOutCubic),
      grow().y(-220 + targetH / 2, t.lineDuration, easeOutCubic),
    );
    const card = createRef<Layout>();
    yield view.add(
      <Layout ref={card} x={900} y={y}>
        <Circle size={16} fill={accent} x={-500} />
        <Rect width={760} height={78} fill={"#0e1822"} x={-80} />
        <Txt text={events[i].label} fill={accent} fontFamily={SERIF} fontSize={14} letterSpacing={2} x={-380} y={-16} />
        <Txt text={events[i].title} fill={"#ffffff"} fontFamily={SERIF} fontSize={22} fontWeight={700} x={-200} y={-8} />
        <Txt text={events[i].detail} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={14} x={-180} y={18} />
      </Layout>,
    );
    yield* card().x(0, t.revealDuration, easeOutCubic);
  }
  yield* waitFor(1.2);
}

/** Full-bleed counting year + playhead. */
function* yearScrub(view: any) {
  const title = str("title", "Across the decades");
  const accent = str("accent", "#ff6b4a");
  const bg = str("bg", "#0b1020");
  const start = num("startYear", 1947);
  const end = num("endYear", 2026);
  const markers = str("markerYears", "1947, 1965, 1991, 2014, 2024")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={title.toUpperCase()} fill={accent} fontFamily={SERIF} fontSize={14} letterSpacing={8} y={-280} />,
  );
  const yearTxt = createRef<Txt>();
  yield view.add(
    <Txt ref={yearTxt} text={String(start)} fill={"#ffffff"} fontFamily={SERIF} fontSize={180} fontWeight={700} y={-40} />,
  );
  yield view.add(<Rect width={1000} height={8} fill={"#243044"} y={220} radius={4} />);
  const fill = createRef<Rect>();
  const head = createRef<Rect>();
  yield view.add(<Rect ref={fill} width={0} height={8} fill={accent} x={-500} y={220} radius={4} />);
  yield view.add(<Rect ref={head} width={18} height={36} fill={"#fff"} x={-500} y={220} radius={2} />);
  for (const m of markers) {
    const p = (m - start) / Math.max(end - start, 1);
    if (p < 0 || p > 1) continue;
    yield view.add(
      <Txt text={String(m)} fill={"#8b97a8"} fontFamily={SERIF} fontSize={13} x={-500 + p * 1000} y={260} />,
    );
  }
  yield* pause(t.startDelay);
  const steps = 20;
  const stepTime = t.lineDuration / steps;
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    yearTxt().text(String(Math.round(start + p * (end - start))));
    yield* all(
      fill().width(1000 * p, stepTime, easeOutCubic),
      fill().x(-500 + (1000 * p) / 2, stepTime, easeOutCubic),
      head().x(-500 + 1000 * p, stepTime, easeOutCubic),
    );
  }
  yield* waitFor(1.1);
}

/** Zigzag tiles — each milestone a large offset slab. */
function* milestoneCards(view: any) {
  const title = str("title", "Turning points");
  const accent = str("accent", "#7dd3a0");
  const bg = str("bg", "#081410");
  const events = parseEvents(str("events", DEFAULT_EVENTS), DEFAULT_EVENTS).slice(0, 5);
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={title} fill={"#e8f0ea"} fontFamily={SERIF} fontSize={28} fontWeight={700} y={-280} />,
  );
  yield* pause(t.startDelay);
  const extra = itemDelays(events.length);
  for (let i = 0; i < events.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const left = i % 2 === 0;
    const y = -170 + i * 95;
    const tile = createRef<Layout>();
    yield view.add(
      <Layout ref={tile} x={left ? -800 : 800} y={y}>
        <Rect width={520} height={80} fill={left ? "#0f221c" : "#12261e"} />
        <Rect width={8} height={80} fill={accent} x={left ? -256 : 256} />
        <Txt text={events[i].label} fill={accent} fontFamily={SERIF} fontSize={16} x={left ? -160 : -140} />
        <Txt text={events[i].title} fill={"#f4f0e6"} fontFamily={SERIF} fontSize={24} fontWeight={700} x={left ? 40 : 60} />
      </Layout>,
    );
    yield* tile().x(left ? -160 : 160, t.revealDuration, easeOutCubic);
  }
  yield* waitFor(1.2);
}

/** History-channel: giant year left, faded stack right, focus pops. */
function* focusSpotlight(view: any) {
  const eyebrow = str("title", "In focus");
  const accent = str("accent", "#5b8cff");
  const bg = str("bg", "#0a0e18");
  const events = parseEvents(str("events", DEFAULT_EVENTS), DEFAULT_EVENTS);
  const focusIndex = Math.min(
    Math.max(0, Math.floor(num("focusIndex", 2))),
    Math.max(events.length - 1, 0),
  );
  const focus = events[focusIndex] || events[0];
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={eyebrow.toUpperCase()} fill={accent} fontFamily={SERIF} fontSize={14} letterSpacing={6} x={-360} y={-260} />,
  );
  const year = createRef<Txt>();
  yield view.add(
    <Txt ref={year} text={focus.label} fill={accent} fontFamily={SERIF} fontSize={120} fontWeight={700} x={-280} y={-20} opacity={0} />,
  );
  yield view.add(
    <Txt text={focus.title} fill={"#ffffff"} fontFamily={SERIF} fontSize={36} fontWeight={700} x={-280} y={120} width={480} textWrap />,
  );
  yield view.add(
    <Txt text={focus.detail} fill={"#aeb8c8"} fontFamily={SERIF} fontSize={18} x={-280} y={180} width={480} textWrap />,
  );
  yield* pause(t.startDelay);
  const extra = itemDelays(events.length);
  for (let i = 0; i < events.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const row = createRef<Txt>();
    yield view.add(
      <Txt
        ref={row}
        text={`${events[i].label}   ${events[i].title}`}
        fill={i === focusIndex ? "#ffffff" : "#4a5568"}
        fontFamily={SERIF}
        fontSize={i === focusIndex ? 22 : 16}
        fontWeight={i === focusIndex ? 700 : 400}
        x={360}
        y={-160 + i * 70}
        opacity={0}
      />,
    );
    yield* row().opacity(1, t.revealDuration, easeOutCubic);
  }
  yield* pause(t.connectDelay);
  yield* year().opacity(1, 0.4, easeOutCubic);
  yield* waitFor(1.3);
}

/** Stacked era bands filling the frame like decade chapters. */
function* eraBlocks(view: any) {
  const title = str("title", "Eras");
  const accent = str("accent", "#e8a54b");
  const bg = str("bg", "#120e0a");
  const events = parseEvents(
    str(
      "events",
      `1947–1964|Nehru years|Nation building
1965–1984|Trials|Wars & shifts
1991–2010|Opening|Reform age
2014–now|Present|New mandate`,
    ),
    `1947–1964|Nehru years|Nation building`,
  );
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={title.toUpperCase()} fill={accent} fontFamily={SERIF} fontSize={14} letterSpacing={8} y={-300} />,
  );
  yield* pause(t.startDelay);
  const extra = itemDelays(events.length);
  const h = 110;
  const tones = ["#3a2714", "#4a3018", "#5a3a1c", "#6a4420"];
  for (let i = 0; i < events.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    yield* pause(t.connectDelay);
    const band = createRef<Rect>();
    const y = -180 + i * h;
    yield view.add(<Rect ref={band} width={0} height={h - 8} fill={tones[i % tones.length]} x={-640} y={y} />);
    yield* all(band().width(1280, t.lineDuration, easeOutCubic), band().x(0, t.lineDuration, easeOutCubic));
    yield view.add(
      <Txt text={events[i].label} fill={accent} fontFamily={SERIF} fontSize={16} x={-420} y={y} />,
    );
    yield view.add(
      <Txt text={events[i].title} fill={"#f4e6d0"} fontFamily={SERIF} fontSize={28} fontWeight={700} x={-80} y={y} />,
    );
    yield view.add(
      <Txt text={events[i].detail} fill={"#c9b89a"} fontFamily={SERIF} fontSize={16} x={320} y={y} />,
    );
  }
  yield* waitFor(1.3);
}

/** Vertical journey — each step, then the connector arrow draws to the next. */
function* journeySteps(view: any) {
  const title = str("title", "How it unfolded");
  const accent = str("accent", "#c4f542");
  const bg = str("bg", "#0c140c");
  const events = parseEvents(
    str(
      "events",
      `01|Spark|The idea takes hold
02|Build|Institutions rise
03|Test|Crisis & resolve
04|Leap|A new chapter`,
    ),
    `01|Spark|The idea takes hold`,
  );
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={title} fill={"#e8f0ea"} fontFamily={SERIF} fontSize={28} fontWeight={700} y={-280} />,
  );
  yield* pause(t.startDelay);
  const extra = itemDelays(events.length);
  for (let i = 0; i < events.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const y = -170 + i * 110;
    const row = createRef<Layout>();
    yield view.add(
      <Layout ref={row} y={y} x={-40} opacity={0}>
        <Rect width={70} height={70} fill={accent} x={-400} />
        <Txt text={events[i].label || String(i + 1).padStart(2, "0")} fill={"#0c140c"} fontFamily={SERIF} fontSize={22} fontWeight={700} x={-400} />
        <Txt text={events[i].title} fill={"#f4f0e6"} fontFamily={SERIF} fontSize={28} fontWeight={700} x={-180} y={-12} />
        <Txt text={events[i].detail} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={16} x={-140} y={22} />
      </Layout>,
    );
    yield* row().opacity(1, t.revealDuration, easeOutCubic);
    if (i < events.length - 1) {
      yield* pause(t.connectDelay);
      const arrow = createRef<Rect>();
      yield view.add(<Rect ref={arrow} width={4} height={0} fill={accent} x={-400} y={y + 35} />);
      yield* all(
        arrow().height(40, t.lineDuration, easeOutCubic),
        arrow().y(y + 55, t.lineDuration, easeOutCubic),
      );
    }
  }
  yield* waitFor(1.3);
}

/** Concentric rings + counting percent in the hole. */
function* progressRing(view: any) {
  const title = str("title", "Progress");
  const label = str("label", "Complete");
  const accent = str("accent", "#3dd6c6");
  const bg = str("bg", "#071018");
  const percent = Math.min(100, Math.max(0, num("percent", 72)));
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={title.toUpperCase()} fill={accent} fontFamily={SERIF} fontSize={14} letterSpacing={8} y={-280} />,
  );
  yield view.add(<Circle size={340} stroke={"#1a2a38"} lineWidth={18} fill={null} />);
  const arc = createRef<Circle>();
  yield view.add(
    <Circle
      ref={arc}
      size={340}
      stroke={accent}
      lineWidth={18}
      fill={null}
      startAngle={-90}
      endAngle={-90}
      closed={false}
      lineCap={"round"}
    />,
  );
  const pct = createRef<Txt>();
  yield view.add(
    <Txt ref={pct} text={"0%"} fill={"#ffffff"} fontFamily={SERIF} fontSize={72} fontWeight={700} />,
  );
  yield view.add(
    <Txt text={label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={18} y={220} />,
  );
  yield* pause(t.startDelay);
  const steps = 18;
  const stepTime = t.lineDuration / steps;
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    pct().text(`${Math.round(percent * p)}%`);
    yield* arc().endAngle(-90 + 360 * (percent / 100) * p, stepTime, easeOutCubic);
  }
  yield* waitFor(1.2);
}

/** Split-screen chapters: huge year left, title right, color wipe. */
function* chapterWipe(view: any) {
  const eyebrow = str("title", "Chapters");
  const accent = str("accent", "#ff6b4a");
  const events = parseEvents(str("events", DEFAULT_EVENTS), DEFAULT_EVENTS);
  const colors = ["#1a2433", "#2a1810", "#142418", "#1a1028"];
  const t = timing();
  yield* pause(t.startDelay);
  const extra = itemDelays(events.length);

  for (let i = 0; i < events.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const wipe = createRef<Rect>();
    yield view.add(<Rect ref={wipe} width={0} height={720} fill={colors[i % colors.length]} x={-640} />);
    yield* all(wipe().width(1280, t.lineDuration, easeOutCubic), wipe().x(0, t.lineDuration, easeOutCubic));
    view.fill(colors[i % colors.length]);
    yield view.add(
      <Txt text={`${eyebrow}  ${String(i + 1).padStart(2, "0")}`} fill={accent} fontFamily={SERIF} fontSize={14} letterSpacing={4} x={-360} y={-240} />,
    );
    yield view.add(
      <Txt text={events[i].label} fill={accent} fontFamily={SERIF} fontSize={96} fontWeight={700} x={-280} y={-20} />,
    );
    yield view.add(<Rect width={4} height={280} fill={accent} x={40} />);
    yield view.add(
      <Txt text={events[i].title} fill={"#ffffff"} fontFamily={SERIF} fontSize={42} fontWeight={700} x={300} y={-20} width={480} textWrap />,
    );
    yield view.add(
      <Txt text={events[i].detail} fill={"#c5ccd6"} fontFamily={SERIF} fontSize={18} x={300} y={80} width={480} textWrap />,
    );
    yield* pause(Math.max(t.connectDelay, 0.45));
  }
  yield* waitFor(0.4);
}

export function* runTimeline(view: any, template: string) {
  switch (template) {
    case "timeline-nodes":
      yield* horizontalNodes(view);
      break;
    case "timeline-vertical":
      yield* verticalSpine(view);
      break;
    case "timeline-year-scrub":
      yield* yearScrub(view);
      break;
    case "timeline-milestones":
      yield* milestoneCards(view);
      break;
    case "timeline-focus":
      yield* focusSpotlight(view);
      break;
    case "timeline-eras":
      yield* eraBlocks(view);
      break;
    case "timeline-journey":
      yield* journeySteps(view);
      break;
    case "timeline-ring":
      yield* progressRing(view);
      break;
    case "timeline-chapters":
    case "timeline-photo-chapters":
      yield* chapterWipe(view);
      break;
    default:
      yield* verticalSpine(view);
  }
}
