/** @jsxImportSource @revideo/2d/lib */
import { Circle, Layout, Line, Rect, Txt } from "@revideo/2d";
import {
  colors,
  parseEvents,
  DEFAULT_EVENTS,
  SERIF,
  SANS,
  fadeInTxt,
  countText,
  growBar,
  hold,
  all,
  createRef,
  easeOutCubic,
  easeOutBack,
  pause,
  itemDelays,
} from "../../lib/docKit";
import { num } from "../../lib/helpers";

type Gen = (view: any) => Generator;

/** Stacked full-width era bands wipe down. */
function* yearEra(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS);
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, (c.title || "ERAS").toUpperCase(), {
    fill: c.accent,
    size: 14,
    letterSpacing: 8,
    y: -310,
    font: SANS,
    weight: 700,
  });
  yield* pause(t.startDelay);
  const h = Math.min(120, 460 / Math.max(events.length, 1));
  const tones = ["#2a1c10", "#3a2814", "#4a3418", "#5a401c", "#6a4c20"];
  const extra = itemDelays(events.length);
  for (let i = 0; i < events.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const y = -220 + i * h;
    const band = createRef<Rect>();
    const wipe = createRef<Rect>();
    yield view.add(<Rect ref={band} width={1280} height={h - 6} fill={tones[i % tones.length]} y={y} opacity={0} />);
    yield view.add(<Rect ref={wipe} width={1280} height={0} fill={c.accent} y={y - (h - 6) / 2} opacity={0.35} />);
    yield* all(
      band().opacity(1, t.revealDuration * 0.5, easeOutCubic),
      wipe().height(h - 6, t.lineDuration, easeOutCubic),
      wipe().y(y, t.lineDuration, easeOutCubic),
    );
    wipe().opacity(0);
    yield view.add(
      <Txt text={events[i].label} fill={c.accent} fontFamily={SERIF} fontSize={18} x={-440} y={y} />,
    );
    yield view.add(
      <Txt text={events[i].title} fill={"#f4e6d0"} fontFamily={SERIF} fontSize={28} fontWeight={700} x={-40} y={y} />,
    );
    if (events[i].detail) {
      yield view.add(
        <Txt text={events[i].detail} fill={"#c9b89a"} fontFamily={SANS} fontSize={15} x={380} y={y} />,
      );
    }
  }
  yield* hold();
}

/** Giant focused year left, faded year stack right. */
function* yearChanged(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS);
  const focusIndex = Math.min(Math.max(0, Math.floor(num("focusIndex", 2))), Math.max(events.length - 1, 0));
  const focus = events[focusIndex] || events[0];
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, (c.title || "THE YEAR THAT CHANGED EVERYTHING").toUpperCase(), {
    fill: c.accent,
    size: 13,
    letterSpacing: 5,
    x: -300,
    y: -280,
    font: SANS,
    weight: 700,
    align: "left",
    width: 520,
  });
  yield* pause(t.startDelay);
  const year = createRef<Txt>();
  yield view.add(
    <Txt ref={year} text={focus.label} fill={c.accent} fontFamily={SERIF} fontSize={148} fontWeight={700} x={-300} y={-30} scale={0.4} opacity={0} />,
  );
  yield* all(year().opacity(1, t.revealDuration, easeOutCubic), year().scale(1, t.revealDuration, easeOutBack));
  yield view.add(
    <Txt text={focus.title} fill={"#ffffff"} fontFamily={SERIF} fontSize={32} fontWeight={700} x={-300} y={110} width={480} textWrap />,
  );
  yield view.add(
    <Txt text={focus.detail} fill={"#9aa8b8"} fontFamily={SANS} fontSize={16} x={-300} y={170} width={480} textWrap />,
  );
  const extra = itemDelays(events.length);
  for (let i = 0; i < events.length; i++) {
    yield* pause(extra[i] || (i > 0 ? t.stepDelay : 0));
    const row = createRef<Layout>();
    const active = i === focusIndex;
    yield view.add(
      <Layout ref={row} x={420} y={-180 + i * 72} opacity={0}>
        <Txt
          text={events[i].label}
          fill={active ? "#ffffff" : "#3d4654"}
          fontFamily={SERIF}
          fontSize={active ? 28 : 18}
          fontWeight={active ? 700 : 400}
          x={-40}
        />
        <Txt
          text={events[i].title}
          fill={active ? c.accent : "#2e3642"}
          fontFamily={SANS}
          fontSize={active ? 16 : 13}
          x={100}
        />
      </Layout>,
    );
    yield* row().opacity(active ? 1 : 0.55, t.revealDuration, easeOutCubic);
  }
  yield* hold();
}

/** Overscale year slam from huge scale to 1. */
function* yearReveal(view: any) {
  const c = colors();
  const year = String(c.year);
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  const txt = createRef<Txt>();
  const flash = createRef<Rect>();
  yield view.add(<Rect ref={flash} width={1280} height={720} fill={c.accent} opacity={0} />);
  yield view.add(
    <Txt ref={txt} text={year} fill={c.accent} fontFamily={SERIF} fontSize={220} fontWeight={700} scale={4.2} opacity={0.15} />,
  );
  yield* all(
    txt().scale(1, t.lineDuration * 1.6, easeOutCubic),
    txt().opacity(1, t.revealDuration, easeOutCubic),
    flash().opacity(0.22, 0.12, easeOutCubic),
  );
  yield* flash().opacity(0, 0.35, easeOutCubic);
  if (c.label || c.subtitle) {
    yield* fadeInTxt(view, c.label || c.subtitle, {
      fill: "#e8eef6",
      size: 22,
      y: 160,
      font: SANS,
      duration: t.revealDuration,
    });
  }
  yield* hold(1.3);
}

/** Diamond nodes on horizontal rail with connector draw. */
function* historyTimeline(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS);
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, (c.title || "HISTORY").toUpperCase(), {
    fill: c.accent,
    size: 14,
    letterSpacing: 7,
    y: -280,
    font: SANS,
    weight: 700,
  });
  const rail = createRef<Rect>();
  yield view.add(<Rect ref={rail} width={0} height={3} fill={"#243044"} y={20} />);
  yield* pause(t.startDelay);
  yield* rail().width(980, t.lineDuration, easeOutCubic);
  const n = Math.max(events.length, 1);
  const xs = events.map((_, i) => -460 + (i / Math.max(n - 1, 1)) * 920);
  const extra = itemDelays(events.length);
  for (let i = 0; i < events.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const node = createRef<Rect>();
    yield view.add(
      <Rect ref={node} width={22} height={22} fill={c.accent} x={xs[i]} y={20} rotation={45} scale={0} />,
    );
    yield view.add(
      <Txt text={events[i].label} fill={c.accent} fontFamily={SERIF} fontSize={16} x={xs[i]} y={-50} />,
    );
    yield view.add(
      <Txt text={events[i].title} fill={"#e8f0ea"} fontFamily={SERIF} fontSize={15} fontWeight={700} x={xs[i]} y={90} width={150} textAlign={"center"} textWrap />,
    );
    yield* node().scale(1, t.revealDuration, easeOutBack);
    if (i < events.length - 1) {
      yield* pause(t.connectDelay);
      const seg = createRef<Rect>();
      const span = xs[i + 1] - xs[i];
      yield view.add(<Rect ref={seg} width={0} height={4} fill={c.accent} x={xs[i]} y={20} radius={2} />);
      yield* all(
        seg().width(span, t.lineDuration, easeOutCubic),
        seg().x(xs[i] + span / 2, t.lineDuration, easeOutCubic),
      );
    }
  }
  yield* hold();
}

/** Ascending stepped platform stairs with labels. */
function* theRise(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS).slice(0, 5);
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, c.title || "THE RISE", {
    fill: "#e8f0ea",
    size: 26,
    y: -300,
    font: SERIF,
    weight: 700,
  });
  yield* pause(t.startDelay);
  const extra = itemDelays(events.length);
  const baseW = 160;
  for (let i = 0; i < events.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const stepH = 56 + i * 28;
    const x = -420 + i * (baseW + 28);
    const y = 200 - stepH / 2;
    const step = createRef<Rect>();
    yield view.add(<Rect ref={step} width={baseW} height={0} fill={i % 2 ? "#12261a" : "#0e1e14"} x={x} y={200} radius={4} />);
    yield* all(
      step().height(stepH, t.lineDuration, easeOutCubic),
      step().y(y, t.lineDuration, easeOutCubic),
    );
    const label = createRef<Layout>();
    yield view.add(
      <Layout ref={label} x={x} y={y - stepH / 2 - 40} opacity={0}>
        <Txt text={events[i].label} fill={c.accent} fontFamily={SANS} fontSize={13} letterSpacing={2} y={-18} />
        <Txt text={events[i].title} fill={"#f4f0e6"} fontFamily={SERIF} fontSize={18} fontWeight={700} />
      </Layout>,
    );
    yield* label().opacity(1, t.revealDuration, easeOutCubic);
  }
  yield* hold();
}

/** Descending cascade cards falling downward. */
function* theFall(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS).slice(0, 5);
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, (c.title || "THE FALL").toUpperCase(), {
    fill: c.accent,
    size: 14,
    letterSpacing: 6,
    y: -290,
    font: SANS,
    weight: 700,
  });
  yield* pause(t.startDelay);
  const extra = itemDelays(events.length);
  for (let i = 0; i < events.length; i++) {
    if (i > 0) yield* pause(t.stepDelay * 0.6);
    yield* pause(extra[i]);
    const card = createRef<Layout>();
    const y = -160 + i * 95;
    const tilt = i % 2 === 0 ? -3 : 4;
    yield view.add(
      <Layout ref={card} x={i % 2 === 0 ? -80 : 80} y={-420} rotation={tilt} opacity={0}>
        <Rect width={560} height={78} fill={"#1a1010"} radius={8} />
        <Rect width={8} height={78} fill={c.accent} x={-276} />
        <Txt text={events[i].label} fill={c.accent} fontFamily={SERIF} fontSize={16} x={-180} y={-12} />
        <Txt text={events[i].title} fill={"#f4e8e8"} fontFamily={SERIF} fontSize={24} fontWeight={700} x={40} y={-8} />
        <Txt text={events[i].detail} fill={"#9a8080"} fontFamily={SANS} fontSize={13} x={40} y={20} />
      </Layout>,
    );
    yield* all(
      card().y(y, t.revealDuration * 1.2, easeOutCubic),
      card().opacity(1, t.revealDuration * 0.6, easeOutCubic),
    );
  }
  yield* hold();
}

/** Split wipe left year / right title color change per beat. */
function* eraTransition(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS);
  const t = c.t;
  view.fill(c.bg);
  const leftBg = createRef<Rect>();
  const rightBg = createRef<Rect>();
  const yearTxt = createRef<Txt>();
  const titleTxt = createRef<Txt>();
  const detailTxt = createRef<Txt>();
  yield view.add(<Rect ref={leftBg} width={640} height={720} fill={"#0e1420"} x={-320} />);
  yield view.add(<Rect ref={rightBg} width={640} height={720} fill={"#121018"} x={320} />);
  yield view.add(<Rect width={4} height={720} fill={c.accent} x={0} opacity={0.7} />);
  yield view.add(
    <Txt ref={yearTxt} text={""} fill={c.accent} fontFamily={SERIF} fontSize={96} fontWeight={700} x={-320} y={-20} />,
  );
  yield view.add(
    <Txt ref={titleTxt} text={""} fill={"#ffffff"} fontFamily={SERIF} fontSize={36} fontWeight={700} x={320} y={-20} width={480} textWrap textAlign={"center"} />,
  );
  yield view.add(
    <Txt ref={detailTxt} text={""} fill={"#9aa8b8"} fontFamily={SANS} fontSize={16} x={320} y={70} width={480} textWrap textAlign={"center"} />,
  );
  yield* pause(t.startDelay);
  const tones = ["#1a2438", "#241a28", "#1a2820", "#282018"];
  const extra = itemDelays(events.length);
  for (let i = 0; i < events.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const wipeL = createRef<Rect>();
    const wipeR = createRef<Rect>();
    yield view.add(<Rect ref={wipeL} width={0} height={720} fill={tones[i % tones.length]} x={-640} />);
    yield view.add(<Rect ref={wipeR} width={0} height={720} fill={tones[(i + 1) % tones.length]} x={640} />);
    yield* all(
      wipeL().width(640, t.lineDuration, easeOutCubic),
      wipeL().x(-320, t.lineDuration, easeOutCubic),
      wipeR().width(640, t.lineDuration, easeOutCubic),
      wipeR().x(320, t.lineDuration, easeOutCubic),
    );
    leftBg().fill(tones[i % tones.length]);
    rightBg().fill(tones[(i + 1) % tones.length]);
    wipeL().opacity(0);
    wipeR().opacity(0);
    yearTxt().text(events[i].label);
    titleTxt().text(events[i].title);
    detailTxt().text(events[i].detail);
    yearTxt().fill(c.accent);
    titleTxt().fill(i % 2 === 0 ? "#ffffff" : c.accent);
  }
  yield* hold();
}

/** Huge counting year + scrub playhead on rail. */
function* decadesPassing(view: any) {
  const c = colors();
  const start = c.startYear;
  const end = c.endYear;
  const markers = (c.markerYears || "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, (c.title || "DECADES").toUpperCase(), {
    fill: c.accent,
    size: 14,
    letterSpacing: 8,
    y: -280,
    font: SANS,
    weight: 700,
  });
  const yearTxt = createRef<Txt>();
  yield view.add(
    <Txt ref={yearTxt} text={String(start)} fill={"#ffffff"} fontFamily={SERIF} fontSize={168} fontWeight={700} y={-40} />,
  );
  yield view.add(<Rect width={1000} height={8} fill={"#243044"} y={220} radius={4} />);
  const fill = createRef<Rect>();
  const head = createRef<Rect>();
  yield view.add(<Rect ref={fill} width={0} height={8} fill={c.accent} x={-500} y={220} radius={4} />);
  yield view.add(<Rect ref={head} width={18} height={36} fill={"#fff"} x={-500} y={220} radius={2} />);
  for (const m of markers) {
    const p = (m - start) / Math.max(end - start, 1);
    if (p < 0 || p > 1) continue;
    yield view.add(
      <Txt text={String(m)} fill={"#8b97a8"} fontFamily={SANS} fontSize={13} x={-500 + p * 1000} y={260} />,
    );
  }
  yield* pause(t.startDelay);
  const steps = 22;
  const stepTime = Math.max(0.04, t.lineDuration / steps);
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    yearTxt().text(String(Math.round(start + p * (end - start))));
    yield* all(
      fill().width(1000 * p, stepTime, easeOutCubic),
      fill().x(-500 + (1000 * p) / 2, stepTime, easeOutCubic),
      head().x(-500 + 1000 * p, stepTime, easeOutCubic),
    );
  }
  yield* hold();
}

/** Vertical spine with cards sliding from right. */
function* fromThenToNow(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS);
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, c.title || "THEN → NOW", {
    fill: "#f4efe6",
    size: 26,
    x: -280,
    y: -290,
    font: SERIF,
    weight: 700,
    align: "left",
    width: 500,
  });
  const spineH = Math.min(500, events.length * 92);
  yield view.add(<Rect width={4} height={spineH} fill={"#1a2830"} x={-480} y={-200 + spineH / 2} />);
  const grow = createRef<Rect>();
  yield view.add(<Rect ref={grow} width={4} height={0} fill={c.accent} x={-480} y={-200} />);
  yield* pause(t.startDelay);
  const extra = itemDelays(events.length);
  const gap = 92;
  for (let i = 0; i < events.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const y = -160 + i * gap;
    const targetH = 40 + i * gap;
    yield* pause(t.connectDelay);
    yield* all(
      grow().height(targetH, t.lineDuration, easeOutCubic),
      grow().y(-200 + targetH / 2, t.lineDuration, easeOutCubic),
    );
    const card = createRef<Layout>();
    yield view.add(
      <Layout ref={card} x={920} y={y}>
        <Circle size={14} fill={c.accent} x={-480} />
        <Rect width={720} height={72} fill={"#0e1822"} x={-60} radius={8} />
        <Txt text={events[i].label} fill={c.accent} fontFamily={SERIF} fontSize={14} letterSpacing={2} x={-340} y={-14} />
        <Txt text={events[i].title} fill={"#ffffff"} fontFamily={SERIF} fontSize={22} fontWeight={700} x={-120} y={-8} />
        <Txt text={events[i].detail} fill={"#9aa8b8"} fontFamily={SANS} fontSize={13} x={-100} y={18} />
      </Layout>,
    );
    yield* card().x(40, t.revealDuration, easeOutCubic);
  }
  yield* hold();
}

/** Two columns BEFORE/AFTER with center rupture year. */
function* beforeAfterYears(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS);
  const focusIndex = Math.min(Math.max(0, Math.floor(num("focusIndex", 1))), Math.max(events.length - 1, 0));
  const focus = events[focusIndex] || events[0];
  const before = events.slice(0, focusIndex);
  const after = events.slice(focusIndex + 1);
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  yield view.add(
    <Txt text={"BEFORE"} fill={"#6b7280"} fontFamily={SANS} fontSize={14} letterSpacing={6} x={-360} y={-280} />,
  );
  yield view.add(
    <Txt text={"AFTER"} fill={"#6b7280"} fontFamily={SANS} fontSize={14} letterSpacing={6} x={360} y={-280} />,
  );
  const rupture = createRef<Layout>();
  yield view.add(
    <Layout ref={rupture} y={-20} scale={0.5} opacity={0}>
      <Rect width={4} height={420} fill={c.accent} opacity={0.5} />
      <Circle size={120} fill={c.bg} stroke={c.accent} lineWidth={4} />
      <Txt text={focus.label} fill={c.accent} fontFamily={SERIF} fontSize={42} fontWeight={700} />
    </Layout>,
  );
  yield* all(rupture().scale(1, t.revealDuration, easeOutBack), rupture().opacity(1, t.revealDuration, easeOutCubic));
  yield view.add(
    <Txt text={focus.title} fill={"#ffffff"} fontFamily={SERIF} fontSize={18} fontWeight={700} y={90} />,
  );
  for (let i = 0; i < before.length; i++) {
    const row = createRef<Txt>();
    yield view.add(
      <Txt ref={row} text={`${before[i].label}  ${before[i].title}`} fill={"#8b97a8"} fontFamily={SERIF} fontSize={18} x={-360} y={-180 + i * 70} opacity={0} width={280} textAlign={"right"} />,
    );
    yield* row().opacity(1, t.revealDuration, easeOutCubic);
    yield* pause(t.stepDelay);
  }
  for (let i = 0; i < after.length; i++) {
    const row = createRef<Txt>();
    yield view.add(
      <Txt ref={row} text={`${after[i].label}  ${after[i].title}`} fill={"#d8dee8"} fontFamily={SERIF} fontSize={18} x={360} y={-180 + i * 70} opacity={0} width={280} textAlign={"left"} />,
    );
    yield* row().opacity(1, t.revealDuration, easeOutCubic);
    yield* pause(t.stepDelay);
  }
  yield* hold();
}

/** Ring + counting years with start→end rail. */
function* yearCounter(view: any) {
  const c = colors();
  const start = c.startYear;
  const end = c.endYear;
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, c.label || c.title || "YEARS", {
    fill: c.accent,
    size: 14,
    letterSpacing: 6,
    y: -280,
    font: SANS,
    weight: 700,
  });
  const ring = createRef<Circle>();
  const yearTxt = createRef<Txt>();
  yield view.add(<Circle size={280} stroke={"#243044"} lineWidth={14} fill={null} y={-20} />);
  yield view.add(
    <Circle ref={ring} size={280} stroke={c.accent} lineWidth={14} fill={null} startAngle={-90} endAngle={-90} y={-20} lineCap={"round"} />,
  );
  yield view.add(
    <Txt ref={yearTxt} text={String(start)} fill={"#ffffff"} fontFamily={SERIF} fontSize={72} fontWeight={700} y={-20} />,
  );
  yield view.add(<Rect width={720} height={6} fill={"#243044"} y={220} radius={3} />);
  const rail = createRef<Rect>();
  yield view.add(<Rect ref={rail} width={0} height={6} fill={c.accent} x={-360} y={220} radius={3} />);
  yield view.add(
    <Txt text={String(start)} fill={"#8b97a8"} fontFamily={SANS} fontSize={14} x={-360} y={250} />,
  );
  yield view.add(
    <Txt text={String(end)} fill={"#8b97a8"} fontFamily={SANS} fontSize={14} x={360} y={250} />,
  );
  yield* pause(t.startDelay);
  const steps = 24;
  const stepTime = Math.max(0.04, (t.lineDuration * 1.5) / steps);
  yield* ring().endAngle(-90 + 360, t.lineDuration * 1.5, easeOutCubic);
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    yearTxt().text(String(Math.round(start + p * (end - start))));
    yield* all(
      rail().width(720 * p, stepTime, easeOutCubic),
      rail().x(-360 + (720 * p) / 2, stepTime, easeOutCubic),
    );
  }
  yield* hold();
}

/** Nodes burst outward from center then settle on arc. */
function* timelineExplosion(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS).slice(0, 6);
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, (c.title || "BURST").toUpperCase(), {
    fill: c.accent,
    size: 14,
    letterSpacing: 6,
    y: -300,
    font: SANS,
    weight: 700,
  });
  const core = createRef<Circle>();
  yield view.add(<Circle ref={core} size={24} fill={c.accent} scale={0} />);
  yield* pause(t.startDelay);
  yield* core().scale(1.6, t.revealDuration, easeOutBack);
  const nodes: ReturnType<typeof createRef<Layout>>[] = [];
  const targets: { x: number; y: number }[] = [];
  const n = events.length;
  for (let i = 0; i < n; i++) {
    const angle = (-Math.PI * 0.85) + (i / Math.max(n - 1, 1)) * Math.PI * 1.7;
    const r = 220;
    targets.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r * 0.55 });
    const node = createRef<Layout>();
    nodes.push(node);
    yield view.add(
      <Layout ref={node} x={0} y={0} scale={0} opacity={0}>
        <Circle size={18} fill={c.accent} />
        <Txt text={events[i].label} fill={c.accent} fontFamily={SERIF} fontSize={14} y={-36} />
        <Txt text={events[i].title} fill={"#e8eef6"} fontFamily={SANS} fontSize={13} y={36} width={120} textAlign={"center"} textWrap />
      </Layout>,
    );
  }
  yield* all(
    ...nodes.map((node, i) =>
      all(
        node().opacity(1, 0.2, easeOutCubic),
        node().scale(1.3, t.revealDuration * 0.5, easeOutCubic),
        node().x(targets[i].x * 1.35, t.revealDuration * 0.55, easeOutCubic),
        node().y(targets[i].y * 1.35, t.revealDuration * 0.55, easeOutCubic),
      ),
    ),
  );
  yield* pause(t.connectDelay);
  yield* all(
    ...nodes.map((node, i) =>
      all(
        node().scale(1, t.revealDuration, easeOutCubic),
        node().x(targets[i].x, t.lineDuration, easeOutCubic),
        node().y(targets[i].y, t.lineDuration, easeOutCubic),
      ),
    ),
  );
  const arc = createRef<Line>();
  const pts = targets.map((p) => [p.x, p.y] as [number, number]);
  yield view.add(<Line ref={arc} points={pts} stroke={c.accent} lineWidth={2} end={0} opacity={0.5} />);
  yield* arc().end(1, t.lineDuration, easeOutCubic);
  yield* hold();
}

/** Single large milestone plaque rises with seal circle. */
function* historicMilestone(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS);
  const focusIndex = Math.min(Math.max(0, Math.floor(num("focusIndex", 0))), Math.max(events.length - 1, 0));
  const ev = events[focusIndex] || events[0];
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  const plaque = createRef<Layout>();
  const seal = createRef<Layout>();
  yield view.add(
    <Layout ref={plaque} y={380} opacity={0}>
      <Rect width={720} height={280} fill={"#121820"} radius={12} />
      <Rect width={720} height={8} fill={c.accent} y={-136} />
      <Txt text={ev.label} fill={c.accent} fontFamily={SERIF} fontSize={56} fontWeight={700} y={-50} />
      <Txt text={ev.title} fill={"#f4efe6"} fontFamily={SERIF} fontSize={32} fontWeight={700} y={30} />
      <Txt text={ev.detail} fill={"#9aa8b8"} fontFamily={SANS} fontSize={16} y={80} width={600} textAlign={"center"} textWrap />
    </Layout>,
  );
  yield view.add(
    <Layout ref={seal} x={300} y={-80} scale={0}>
      <Circle size={90} fill={c.accent} />
      <Txt text={"★"} fill={c.bg} fontFamily={SERIF} fontSize={36} />
    </Layout>,
  );
  yield* all(
    plaque().y(10, t.lineDuration * 1.2, easeOutCubic),
    plaque().opacity(1, t.revealDuration, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* seal().scale(1, t.revealDuration, easeOutBack);
  yield* hold(1.3);
}

/** Three chapter panels wipe horizontally. */
function* turningPointTl(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS).slice(0, 3);
  while (events.length < 3) events.push({ label: "", title: "Chapter", detail: "" });
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  const tones = ["#141820", "#1a1420", "#102018"];
  const panels: ReturnType<typeof createRef<Layout>>[] = [];
  for (let i = 0; i < 3; i++) {
    const panel = createRef<Layout>();
    panels.push(panel);
    const x = -860;
    yield view.add(
      <Layout ref={panel} x={x} y={0}>
        <Rect width={400} height={520} fill={tones[i]} />
        <Rect width={6} height={520} fill={c.accent} x={-197} />
        <Txt text={events[i].label || `0${i + 1}`} fill={c.accent} fontFamily={SERIF} fontSize={42} fontWeight={700} y={-140} />
        <Txt text={events[i].title} fill={"#ffffff"} fontFamily={SERIF} fontSize={26} fontWeight={700} y={-40} width={320} textWrap textAlign={"center"} />
        <Txt text={events[i].detail} fill={"#9aa8b8"} fontFamily={SANS} fontSize={14} y={60} width={300} textWrap textAlign={"center"} />
      </Layout>,
    );
  }
  const targets = [-420, 0, 420];
  for (let i = 0; i < 3; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* panels[i]().x(targets[i], t.lineDuration, easeOutCubic);
  }
  yield* hold();
}

/** Dawn gradient bars + NEW ERA stamp. */
function* newEra(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS);
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  const bars = 14;
  for (let i = 0; i < bars; i++) {
    const bar = createRef<Rect>();
    const h = 40 + i * 28;
    const alpha = 0.08 + (i / bars) * 0.35;
    yield view.add(
      <Rect ref={bar} width={1280} height={h} fill={c.accent} y={360 - i * 22} opacity={0} />,
    );
    yield* bar().opacity(alpha, 0.08, easeOutCubic);
  }
  yield* pause(t.connectDelay);
  const stamp = createRef<Layout>();
  yield view.add(
    <Layout ref={stamp} scale={1.8} opacity={0} rotation={-8}>
      <Rect width={420} height={100} fill={null} stroke={c.accent} lineWidth={6} radius={4} />
      <Txt text={"NEW ERA"} fill={c.accent} fontFamily={SERIF} fontSize={48} fontWeight={700} letterSpacing={8} />
    </Layout>,
  );
  yield* all(stamp().scale(1, t.revealDuration, easeOutBack), stamp().opacity(1, t.revealDuration, easeOutCubic));
  if (events[0]) {
    yield* fadeInTxt(view, events[events.length - 1]?.title || events[0].title, {
      fill: "#f4efe6",
      size: 22,
      y: 140,
      font: SANS,
      duration: t.revealDuration,
    });
  }
  yield* hold();
}

/** Fading timeline that dissolves to gray. */
function* endOfEra(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS);
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, (c.title || "END OF AN ERA").toUpperCase(), {
    fill: c.accent,
    size: 14,
    letterSpacing: 6,
    y: -280,
    font: SANS,
    weight: 700,
  });
  yield* pause(t.startDelay);
  const nodes: ReturnType<typeof createRef<Layout>>[] = [];
  const n = events.length;
  const xs = events.map((_, i) => -400 + (i / Math.max(n - 1, 1)) * 800);
  yield view.add(<Rect width={860} height={3} fill={"#4a5568"} y={0} />);
  for (let i = 0; i < n; i++) {
    const node = createRef<Layout>();
    nodes.push(node);
    yield view.add(
      <Layout ref={node} x={xs[i]} y={0} opacity={0}>
        <Circle size={16} fill={c.accent} />
        <Txt text={events[i].label} fill={"#d8dee8"} fontFamily={SERIF} fontSize={16} y={-50} />
        <Txt text={events[i].title} fill={"#aeb8c8"} fontFamily={SANS} fontSize={13} y={55} width={140} textAlign={"center"} textWrap />
      </Layout>,
    );
    yield* node().opacity(1, t.revealDuration, easeOutCubic);
    yield* pause(t.stepDelay);
  }
  yield* pause(t.connectDelay);
  yield* all(...nodes.map((node) => node().opacity(0.25, t.lineDuration, easeOutCubic)));
  const gray = createRef<Rect>();
  yield view.add(<Rect ref={gray} width={1280} height={720} fill={"#6b7280"} opacity={0} />);
  yield* gray().opacity(0.45, t.lineDuration, easeOutCubic);
  yield* hold();
}

/** Year emerges from heavy blur/opacity fog. */
function* forgottenYear(view: any) {
  const c = colors();
  const year = String(c.year);
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  const fogLayers: ReturnType<typeof createRef<Rect>>[] = [];
  for (let i = 0; i < 6; i++) {
    const fog = createRef<Rect>();
    fogLayers.push(fog);
    yield view.add(
      <Rect ref={fog} width={1280} height={180} fill={"#1a1e28"} y={-200 + i * 80} opacity={0.55} />,
    );
  }
  const txt = createRef<Txt>();
  yield view.add(
    <Txt ref={txt} text={year} fill={c.accent} fontFamily={SERIF} fontSize={160} fontWeight={700} opacity={0.05} scale={1.15} />,
  );
  yield* pause(0.2);
  for (let i = 0; i < fogLayers.length; i++) {
    yield* all(
      fogLayers[i]().opacity(0, t.lineDuration * 0.35, easeOutCubic),
      fogLayers[i]().y(-200 + i * 80 + (i % 2 ? 40 : -40), t.lineDuration * 0.35, easeOutCubic),
      txt().opacity(0.12 + (i / fogLayers.length) * 0.88, t.lineDuration * 0.35, easeOutCubic),
    );
  }
  yield* txt().scale(1, t.revealDuration, easeOutCubic);
  if (c.subtitle || c.label) {
    yield* fadeInTxt(view, c.subtitle || c.label, {
      fill: "#aeb8c8",
      size: 18,
      y: 140,
      font: SANS,
      width: 700,
    });
  }
  yield* hold();
}

/** Calendar-style date flip (two stacked plates). */
function* oneYearLater(view: any) {
  const c = colors();
  const era = c.era || "2020 — 2021";
  const parts = era.split(/[—–\-→]/).map((s) => s.trim()).filter(Boolean);
  const from = parts[0] || String(c.startYear);
  const to = parts[1] || String(c.endYear || c.year);
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, (c.label || "ONE YEAR LATER").toUpperCase(), {
    fill: c.accent,
    size: 14,
    letterSpacing: 6,
    y: -280,
    font: SANS,
    weight: 700,
  });
  yield* pause(t.startDelay);
  const top = createRef<Layout>();
  const bottom = createRef<Layout>();
  yield view.add(
    <Layout ref={top} y={-40}>
      <Rect width={360} height={140} fill={"#161c28"} radius={8} />
      <Txt text={from} fill={"#ffffff"} fontFamily={SERIF} fontSize={64} fontWeight={700} />
    </Layout>,
  );
  yield view.add(
    <Layout ref={bottom} y={120} opacity={0} scale={0.85}>
      <Rect width={360} height={140} fill={"#1e2838"} radius={8} />
      <Rect width={360} height={6} fill={c.accent} y={-67} />
      <Txt text={to} fill={c.accent} fontFamily={SERIF} fontSize={64} fontWeight={700} />
    </Layout>,
  );
  yield* pause(t.stepDelay);
  yield* all(
    top().y(-160, t.lineDuration, easeOutCubic),
    top().opacity(0.35, t.lineDuration, easeOutCubic),
    bottom().opacity(1, t.revealDuration, easeOutCubic),
    bottom().scale(1, t.revealDuration, easeOutBack),
    bottom().y(40, t.lineDuration, easeOutCubic),
  );
  yield* hold();
}

/** Fast year ticker with speed lines. */
function* yearsInSeconds(view: any) {
  const c = colors();
  const start = c.startYear;
  const end = c.endYear;
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  for (let i = 0; i < 8; i++) {
    const line = createRef<Rect>();
    yield view.add(
      <Rect ref={line} width={0} height={2} fill={c.accent} x={-500} y={-180 + i * 48} opacity={0.25 + (i % 3) * 0.15} />,
    );
    yield* line().width(200 + i * 80, 0.08, easeOutCubic);
  }
  const yearTxt = createRef<Txt>();
  yield view.add(
    <Txt ref={yearTxt} text={String(start)} fill={"#ffffff"} fontFamily={SERIF} fontSize={140} fontWeight={700} />,
  );
  const steps = 28;
  const stepTime = Math.max(0.03, t.lineDuration / steps);
  yield* countText(yearTxt, start, end, steps, stepTime, (n) => String(Math.round(n)));
  yield* fadeInTxt(view, c.title || "Years in seconds", {
    fill: c.accent,
    size: 18,
    y: 140,
    font: SANS,
  });
  yield* hold();
}

/** Four decade columns side by side grow up. */
function* decadeComparison(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS).slice(0, 4);
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, (c.title || "DECADES").toUpperCase(), {
    fill: c.accent,
    size: 14,
    letterSpacing: 6,
    y: -300,
    font: SANS,
    weight: 700,
  });
  yield* pause(t.startDelay);
  const extra = itemDelays(events.length);
  const gap = 220;
  const startX = -((events.length - 1) * gap) / 2;
  for (let i = 0; i < events.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const x = startX + i * gap;
    const maxH = 160 + i * 40;
    yield* growBar(view, { x, y: 160, maxH, w: 72, fill: c.accent, duration: t.lineDuration });
    yield view.add(
      <Txt text={events[i].label} fill={c.accent} fontFamily={SERIF} fontSize={14} x={x} y={200} />,
    );
    yield view.add(
      <Txt text={events[i].title} fill={"#e8eef6"} fontFamily={SERIF} fontSize={16} fontWeight={700} x={x} y={-40 - maxH / 2} width={180} textAlign={"center"} textWrap />,
    );
  }
  yield* hold();
}

/** Camera-like zoom into one event card among many. */
function* timelineZoom(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS);
  const focusIndex = Math.min(Math.max(0, Math.floor(num("focusIndex", 2))), Math.max(events.length - 1, 0));
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  const stage = createRef<Layout>();
  yield view.add(<Layout ref={stage} scale={0.55} y={40} />);
  const cards: ReturnType<typeof createRef<Layout>>[] = [];
  const n = events.length;
  for (let i = 0; i < n; i++) {
    const card = createRef<Layout>();
    cards.push(card);
    const x = -380 + (i / Math.max(n - 1, 1)) * 760;
    yield stage().add(
      <Layout ref={card} x={x} y={0} scale={0.85} opacity={0.45}>
        <Rect width={160} height={200} fill={"#121820"} radius={8} stroke={i === focusIndex ? c.accent : "#243044"} lineWidth={i === focusIndex ? 3 : 1} />
        <Txt text={events[i].label} fill={c.accent} fontFamily={SERIF} fontSize={18} y={-50} />
        <Txt text={events[i].title} fill={"#e8eef6"} fontFamily={SANS} fontSize={13} y={20} width={130} textAlign={"center"} textWrap />
      </Layout>,
    );
  }
  yield* all(...cards.map((card) => card().opacity(0.5, t.revealDuration, easeOutCubic)));
  yield* pause(t.connectDelay);
  const focusX = -380 + (focusIndex / Math.max(n - 1, 1)) * 760;
  yield* all(
    stage().scale(1.35, t.lineDuration * 1.3, easeOutCubic),
    stage().x(-focusX * 1.35, t.lineDuration * 1.3, easeOutCubic),
    stage().y(-20, t.lineDuration * 1.3, easeOutCubic),
    cards[focusIndex]().opacity(1, t.revealDuration, easeOutCubic),
    cards[focusIndex]().scale(1.1, t.revealDuration, easeOutBack),
  );
  yield* hold();
}

/** Accordion/stack of pages peeling open. */
function* historyUnfolds(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS).slice(0, 5);
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, c.title || "History unfolds", {
    fill: "#f4efe6",
    size: 24,
    y: -300,
    font: SERIF,
    weight: 700,
  });
  yield* pause(t.startDelay);
  const pages: ReturnType<typeof createRef<Layout>>[] = [];
  const extra = itemDelays(events.length);
  for (let i = 0; i < events.length; i++) {
    const page = createRef<Layout>();
    pages.push(page);
    yield view.add(
      <Layout ref={page} x={0} y={20} rotation={0} opacity={0}>
        <Rect width={640 - i * 20} height={360 - i * 12} fill={i % 2 ? "#141c28" : "#101820"} radius={6} stroke={"#2a3648"} lineWidth={1} />
        <Txt text={events[i].label} fill={c.accent} fontFamily={SERIF} fontSize={22} x={-220} y={-120} />
        <Txt text={events[i].title} fill={"#ffffff"} fontFamily={SERIF} fontSize={28} fontWeight={700} y={-40} width={500} textAlign={"center"} textWrap />
        <Txt text={events[i].detail} fill={"#9aa8b8"} fontFamily={SANS} fontSize={15} y={40} width={480} textAlign={"center"} textWrap />
      </Layout>,
    );
  }
  for (let i = 0; i < events.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const angle = -18 + i * 9;
    const x = -160 + i * 80;
    yield* all(
      pages[i]().opacity(1, t.revealDuration, easeOutCubic),
      pages[i]().rotation(angle, t.lineDuration, easeOutCubic),
      pages[i]().x(x, t.lineDuration, easeOutCubic),
      pages[i]().y(-20 + i * 18, t.lineDuration, easeOutCubic),
    );
  }
  yield* hold();
}

function* fallback(view: any, template: string) {
  const c = colors();
  view.fill(c.bg);
  yield* fadeInTxt(view, template.replace(/^hist-/, "").replace(/-/g, " ").toUpperCase(), {
    fill: c.accent,
    size: 28,
    font: SERIF,
    weight: 700,
  });
  yield* hold();
}

const MAP: Record<string, Gen> = {
  "hist-year-era": yearEra,
  "hist-year-changed": yearChanged,
  "hist-year-reveal": yearReveal,
  "hist-history-timeline": historyTimeline,
  "hist-the-rise": theRise,
  "hist-the-fall": theFall,
  "hist-era-transition": eraTransition,
  "hist-decades-passing": decadesPassing,
  "hist-from-then-to-now": fromThenToNow,
  "hist-before-after-years": beforeAfterYears,
  "hist-year-counter": yearCounter,
  "hist-timeline-explosion": timelineExplosion,
  "hist-historic-milestone": historicMilestone,
  "hist-turning-point-tl": turningPointTl,
  "hist-new-era": newEra,
  "hist-end-of-era": endOfEra,
  "hist-forgotten-year": forgottenYear,
  "hist-one-year-later": oneYearLater,
  "hist-years-in-seconds": yearsInSeconds,
  "hist-decade-comparison": decadeComparison,
  "hist-timeline-zoom": timelineZoom,
  "hist-history-unfolds": historyUnfolds,
};

export function* runDocHist(view: any, template: string) {
  const fn = MAP[template];
  if (fn) yield* fn(view);
  else yield* fallback(view, template);
}
