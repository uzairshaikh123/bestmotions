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
  hold,
  all,
  createRef,
  easeOutCubic,
  easeOutBack,
  pause,
} from "../../lib/docKit";

type Gen = (view: any) => Generator;

/** Stopwatch arcs racing fill. */
function* raceAgainst(view: any) {
  const c = colors();
  const pct = Math.min(100, Math.max(0, c.percent));
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, (c.title || "RACE AGAINST TIME").toUpperCase(), {
    fill: c.accent,
    size: 14,
    letterSpacing: 5,
    y: -280,
    font: SANS,
    weight: 700,
  });
  yield* pause(t.startDelay);
  const arcs = [
    { size: 320, lw: 18, delay: 0 },
    { size: 250, lw: 12, delay: 0.12 },
    { size: 180, lw: 8, delay: 0.22 },
  ];
  const refs = arcs.map(() => createRef<Circle>());
  for (let i = 0; i < arcs.length; i++) {
    yield view.add(<Circle size={arcs[i].size} stroke={"#1e2a38"} lineWidth={arcs[i].lw} fill={null} y={10} />);
    yield view.add(
      <Circle
        ref={refs[i]}
        size={arcs[i].size}
        stroke={c.accent}
        lineWidth={arcs[i].lw}
        fill={null}
        startAngle={-90}
        endAngle={-90}
        y={10}
        lineCap={"round"}
        opacity={1 - i * 0.2}
      />,
    );
  }
  for (let i = 0; i < arcs.length; i++) {
    if (arcs[i].delay > 0) yield* pause(arcs[i].delay);
    yield* refs[i]().endAngle(-90 + pct * 3.6, t.lineDuration * (1.2 - i * 0.15), easeOutCubic);
  }
  yield* fadeInTxt(view, c.label || `${pct}%`, {
    fill: "#ffffff",
    size: 48,
    y: 10,
    font: SERIF,
    weight: 700,
  });
  yield* hold();
}

/** Analog clock hands + digital countdown percent. */
function* countdownClock(view: any) {
  const c = colors();
  const pct = Math.min(100, Math.max(0, c.percent));
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  yield view.add(<Circle size={340} stroke={"#243044"} lineWidth={6} fill={"#0c141c"} />);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const deg = (a * 180) / Math.PI;
    yield view.add(
      <Rect
        width={i % 3 === 0 ? 14 : 8}
        height={3}
        fill={"#4a5568"}
        x={Math.cos(a) * 140}
        y={Math.sin(a) * 140}
        rotation={deg}
      />,
    );
  }
  const hour = createRef<Layout>();
  const minute = createRef<Layout>();
  yield view.add(
    <Layout ref={hour}>
      <Rect width={70} height={6} x={35} fill={"#e8eef6"} radius={3} />
    </Layout>,
  );
  yield view.add(
    <Layout ref={minute}>
      <Rect width={110} height={4} x={55} fill={c.accent} radius={2} />
    </Layout>,
  );
  yield view.add(<Circle size={14} fill={c.accent} />);
  const dig = createRef<Txt>();
  // Count remaining from 100% down to the configured percent.
  const endRemain = Math.max(0, 100 - pct);
  yield view.add(
    <Txt ref={dig} text={"100%"} fill={c.accent} fontFamily={SERIF} fontSize={36} fontWeight={700} y={240} />,
  );
  const sweeps = 8;
  for (let i = 1; i <= sweeps; i++) {
    const p = i / sweeps;
    const remain = Math.round(100 - (100 - endRemain) * p);
    yield* all(
      minute().rotation(p * 360 * (pct / 100), 0.12, easeOutCubic),
      hour().rotation(p * 30 * (pct / 100), 0.12, easeOutCubic),
    );
    dig().text(`${remain}%`);
  }
  yield* hold();
}

/** Shrinking time bar + urgent title. */
function* runningOut(view: any) {
  const c = colors();
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  const title = createRef<Txt>();
  yield view.add(
    <Txt
      ref={title}
      text={c.claim || c.title || "Time Is Running Out"}
      fill={"#ffffff"}
      fontFamily={SERIF}
      fontSize={48}
      fontWeight={700}
      y={-60}
      width={900}
      textAlign={"center"}
      textWrap
      opacity={0}
    />,
  );
  yield view.add(<Rect width={900} height={28} fill={"#1a2430"} y={100} radius={6} />);
  const bar = createRef<Rect>();
  yield view.add(<Rect ref={bar} width={900} height={28} fill={c.accent} x={0} y={100} radius={6} />);
  yield* title().opacity(1, t.revealDuration, easeOutCubic);
  yield* all(
    bar().width(60, t.lineDuration * 1.8, easeOutCubic),
    bar().x(-420, t.lineDuration * 1.8, easeOutCubic),
    title().scale(1.05, t.lineDuration * 1.8, easeOutCubic),
  );
  yield* hold();
}

/** Clock face appears then second hand starts ticking. */
function* clockStarts(view: any) {
  const c = colors();
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  const face = createRef<Circle>();
  yield view.add(<Circle ref={face} size={300} stroke={c.accent} lineWidth={8} fill={"#0c141c"} scale={0} />);
  yield* face().scale(1, t.revealDuration, easeOutBack);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const deg = (a * 180) / Math.PI;
    yield view.add(
      <Rect
        width={10}
        height={3}
        fill={"#6b7280"}
        x={Math.cos(a) * 120}
        y={Math.sin(a) * 120}
        rotation={deg}
      />,
    );
  }
  const hand = createRef<Layout>();
  yield view.add(
    <Layout ref={hand}>
      <Rect width={120} height={3} x={60} fill={c.accent} radius={2} />
    </Layout>,
  );
  yield view.add(<Circle size={12} fill={"#ffffff"} />);
  yield* fadeInTxt(view, c.title || "The Clock Starts", {
    fill: "#e8eef6",
    size: 22,
    y: 220,
    font: SANS,
  });
  for (let i = 0; i < 12; i++) {
    yield* hand().rotation((i + 1) * 30, 0.1, easeOutCubic);
    yield* pause(0.04);
  }
  yield* hold();
}

/** 24 tick marks around circle lighting one by one. */
function* twentyFourHours(view: any) {
  const c = colors();
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, c.label || "24 HOURS", {
    fill: c.accent,
    size: 14,
    letterSpacing: 6,
    y: -280,
    font: SANS,
    weight: 700,
  });
  yield* pause(t.startDelay);
  yield view.add(<Circle size={360} stroke={"#1e2a38"} lineWidth={2} fill={null} />);
  const ticks: ReturnType<typeof createRef<Rect>>[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
    const deg = (a * 180) / Math.PI;
    const tick = createRef<Rect>();
    ticks.push(tick);
    yield view.add(
      <Rect
        ref={tick}
        width={i % 6 === 0 ? 22 : 14}
        height={4}
        fill={"#2a3648"}
        x={Math.cos(a) * 155}
        y={Math.sin(a) * 155}
        rotation={deg}
      />,
    );
  }
  const label = createRef<Txt>();
  yield view.add(
    <Txt ref={label} text={"00:00"} fill={"#ffffff"} fontFamily={SERIF} fontSize={42} fontWeight={700} />,
  );
  for (let i = 0; i < 24; i++) {
    ticks[i]().fill(c.accent);
    label().text(`${String(i).padStart(2, "0")}:00`);
    yield* pause(Math.max(0.04, t.stepDelay * 0.5));
  }
  yield* fadeInTxt(view, c.era || "One day that changed everything", {
    fill: "#9aa8b8",
    size: 16,
    y: 240,
    font: SANS,
  });
  yield* hold();
}

/** Dual day badges DAY 0 → DAY 2 with jump wipe. */
function* fortyEightHoursLater(view: any) {
  const c = colors();
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  const day0 = createRef<Layout>();
  const day2 = createRef<Layout>();
  yield view.add(
    <Layout ref={day0} x={-220}>
      <Rect width={280} height={200} fill={"#121820"} radius={12} />
      <Txt text={"DAY 0"} fill={c.accent} fontFamily={SERIF} fontSize={48} fontWeight={700} />
    </Layout>,
  );
  yield view.add(
    <Layout ref={day2} x={900} opacity={0}>
      <Rect width={280} height={200} fill={"#1a2430"} radius={12} stroke={c.accent} lineWidth={3} />
      <Txt text={"DAY 2"} fill={"#ffffff"} fontFamily={SERIF} fontSize={48} fontWeight={700} />
    </Layout>,
  );
  yield* pause(t.stepDelay);
  const slash = createRef<Rect>();
  yield view.add(<Rect ref={slash} width={0} height={720} fill={c.accent} x={-640} opacity={0.85} />);
  yield* all(
    slash().width(1280, t.lineDuration * 0.45, easeOutCubic),
    slash().x(0, t.lineDuration * 0.45, easeOutCubic),
  );
  day0().opacity(0.3);
  day2().opacity(1);
  day2().x(220);
  yield* slash().opacity(0, 0.25, easeOutCubic);
  yield* fadeInTxt(view, c.label || "48 Hours Later", {
    fill: "#9aa8b8",
    size: 18,
    y: 200,
    font: SANS,
  });
  yield* hold();
}

/** Giant 01:00 style digits with pulse. */
function* finalHour(view: any) {
  const c = colors();
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  const digits = createRef<Txt>();
  const glow = createRef<Circle>();
  yield view.add(<Circle ref={glow} size={200} fill={c.accent} opacity={0} />);
  yield view.add(
    <Txt ref={digits} text={"01:00"} fill={"#ffffff"} fontFamily={SERIF} fontSize={160} fontWeight={700} opacity={0} scale={0.7} />,
  );
  yield* all(
    digits().opacity(1, t.revealDuration, easeOutCubic),
    digits().scale(1, t.revealDuration, easeOutBack),
  );
  for (let i = 0; i < 3; i++) {
    yield* all(
      glow().opacity(0.2, 0.2, easeOutCubic),
      glow().size(280 + i * 40, 0.2, easeOutCubic),
      digits().scale(1.04, 0.2, easeOutCubic),
    );
    yield* all(glow().opacity(0, 0.25, easeOutCubic), digits().scale(1, 0.25, easeOutCubic));
  }
  yield* fadeInTxt(view, c.title || c.claim || "The Final Hour", {
    fill: c.accent,
    size: 20,
    y: 160,
    font: SANS,
  });
  yield* hold();
}

/** Vertical minute stack collapsing upward. */
function* minutesBefore(view: any) {
  const c = colors();
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, c.title || c.claim || "Minutes Before", {
    fill: c.accent,
    size: 18,
    y: -300,
    font: SANS,
    weight: 700,
  });
  yield* pause(t.startDelay);
  const mins = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const rows: ReturnType<typeof createRef<Layout>>[] = [];
  for (let i = 0; i < mins.length; i++) {
    const row = createRef<Layout>();
    rows.push(row);
    yield view.add(
      <Layout ref={row} y={-160 + i * 42} opacity={0}>
        <Rect width={200} height={34} fill={"#141c28"} radius={4} />
        <Txt text={`${mins[i]} min`} fill={"#e8eef6"} fontFamily={SERIF} fontSize={18} />
      </Layout>,
    );
  }
  for (let i = 0; i < rows.length; i++) {
    yield* rows[i]().opacity(1, 0.08, easeOutCubic);
  }
  for (let i = 0; i < rows.length; i++) {
    yield* all(
      rows[i]().y(-320, t.revealDuration * 0.7, easeOutCubic),
      rows[i]().opacity(0, t.revealDuration * 0.7, easeOutCubic),
    );
  }
  yield* fadeInTxt(view, "0", {
    fill: c.accent,
    size: 96,
    font: SERIF,
    weight: 700,
  });
  yield* hold();
}

/** Rapid second counter 10→0. */
function* secondsBefore(view: any) {
  const c = colors();
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  const numRef = createRef<Txt>();
  yield view.add(
    <Txt ref={numRef} text={"10"} fill={c.accent} fontFamily={SERIF} fontSize={200} fontWeight={700} />,
  );
  for (let i = 9; i >= 0; i--) {
    yield* all(numRef().scale(1.15, 0.06, easeOutCubic), numRef().opacity(0.5, 0.06, easeOutCubic));
    numRef().text(String(i));
    yield* all(numRef().scale(1, 0.08, easeOutBack), numRef().opacity(1, 0.08, easeOutCubic));
    yield* pause(0.06);
  }
  yield* fadeInTxt(view, c.title || "Seconds Before", {
    fill: "#e8eef6",
    size: 22,
    y: 180,
    font: SANS,
  });
  yield* hold();
}

/** Ice-like frame freeze of clock at a frozen percent. */
function* timeFreeze(view: any) {
  const c = colors();
  const pct = Math.min(100, Math.max(0, c.percent));
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  const ring = createRef<Circle>();
  yield view.add(<Circle size={280} stroke={"#243044"} lineWidth={16} fill={null} />);
  yield view.add(
    <Circle ref={ring} size={280} stroke={c.accent} lineWidth={16} fill={null} startAngle={-90} endAngle={-90} lineCap={"round"} />,
  );
  yield* ring().endAngle(-90 + pct * 3.6, t.lineDuration, easeOutCubic);
  const frost: ReturnType<typeof createRef<Rect>>[] = [];
  for (let i = 0; i < 5; i++) {
    const f = createRef<Rect>();
    frost.push(f);
    yield view.add(
      <Rect ref={f} width={1280} height={40} fill={"#a8d4f0"} y={-280 + i * 140} opacity={0} />,
    );
  }
  yield* all(...frost.map((f, i) => f().opacity(0.08 + i * 0.02, t.revealDuration, easeOutCubic)));
  const frame = createRef<Rect>();
  yield view.add(<Rect ref={frame} width={400} height={400} fill={null} stroke={"#c8e8ff"} lineWidth={4} scale={1.2} opacity={0} />);
  yield* all(frame().scale(1, t.revealDuration, easeOutCubic), frame().opacity(0.8, t.revealDuration, easeOutCubic));
  yield* fadeInTxt(view, c.label || "FROZEN", {
    fill: "#c8e8ff",
    size: 20,
    y: 220,
    font: SANS,
    letterSpacing: 8,
    weight: 700,
  });
  yield* hold();
}

/** Year scrub with reverse-feel ticks (markers). */
function* clockRewind(view: any) {
  const c = colors();
  const start = c.startYear;
  const end = c.endYear;
  const markers = (c.markerYears || "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, (c.title || "REWIND").toUpperCase(), {
    fill: c.accent,
    size: 14,
    letterSpacing: 6,
    y: -280,
    font: SANS,
    weight: 700,
  });
  const yearTxt = createRef<Txt>();
  yield view.add(
    <Txt ref={yearTxt} text={String(end)} fill={"#ffffff"} fontFamily={SERIF} fontSize={120} fontWeight={700} y={-40} />,
  );
  yield view.add(<Rect width={900} height={6} fill={"#243044"} y={160} radius={3} />);
  const fill = createRef<Rect>();
  yield view.add(<Rect ref={fill} width={900} height={6} fill={c.accent} x={0} y={160} radius={3} />);
  for (const m of markers) {
    const p = (m - start) / Math.max(end - start, 1);
    yield view.add(<Rect width={3} height={18} fill={"#8b97a8"} x={-450 + p * 900} y={160} />);
  }
  yield* pause(t.startDelay);
  const steps = 20;
  const stepTime = Math.max(0.04, t.lineDuration / steps);
  for (let i = 1; i <= steps; i++) {
    const p = 1 - i / steps;
    yearTxt().text(String(Math.round(start + p * (end - start))));
    yield* all(
      fill().width(900 * p, stepTime, easeOutCubic),
      fill().x(-450 + (900 * p) / 2, stepTime, easeOutCubic),
    );
  }
  yield* hold();
}

/** Portal ring morphing years across decades. */
function* timeTravel(view: any) {
  const c = colors();
  const start = c.startYear;
  const end = c.endYear;
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  const sizes = [400, 320, 240, 160];
  const rings = sizes.map(() => createRef<Circle>());
  for (let i = 0; i < rings.length; i++) {
    yield view.add(
      <Circle ref={rings[i]} size={sizes[i]} stroke={c.accent} lineWidth={3} fill={null} opacity={0.3 + i * 0.15} scale={0} />,
    );
  }
  yield* all(...rings.map((r, i) => r().scale(1, t.revealDuration + i * 0.08, easeOutBack)));
  const yearTxt = createRef<Txt>();
  yield view.add(
    <Txt ref={yearTxt} text={String(start)} fill={"#ffffff"} fontFamily={SERIF} fontSize={72} fontWeight={700} />,
  );
  const steps = 16;
  yield* countText(yearTxt, start, end, steps, Math.max(0.05, t.lineDuration / steps), (n) => String(Math.round(n)));
  yield* all(...rings.map((r) => r().rotation(180, t.lineDuration, easeOutCubic)));
  yield* hold();
}

/** Accelerated year rail fill. */
function* fastForward(view: any) {
  const c = colors();
  const start = c.startYear;
  const end = c.endYear;
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, "▶▶ FAST FORWARD", {
    fill: c.accent,
    size: 16,
    letterSpacing: 4,
    y: -260,
    font: SANS,
    weight: 700,
  });
  const yearTxt = createRef<Txt>();
  yield view.add(
    <Txt ref={yearTxt} text={String(start)} fill={"#ffffff"} fontFamily={SERIF} fontSize={100} fontWeight={700} y={-40} />,
  );
  yield view.add(<Rect width={1000} height={14} fill={"#1a2430"} y={120} radius={7} />);
  const fill = createRef<Rect>();
  yield view.add(<Rect ref={fill} width={0} height={14} fill={c.accent} x={-500} y={120} radius={7} />);
  yield* pause(t.startDelay);
  const steps = 12;
  const stepTime = Math.max(0.03, (t.lineDuration * 0.7) / steps);
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    yearTxt().text(String(Math.round(start + p * (end - start))));
    yield* all(
      fill().width(1000 * p, stepTime, easeOutCubic),
      fill().x(-500 + (1000 * p) / 2, stepTime, easeOutCubic),
    );
  }
  yield* hold();
}

/** Slow progress ring with drip marks. */
function* slowMotion(view: any) {
  const c = colors();
  const pct = Math.min(100, Math.max(0, c.percent));
  const t = c.t;
  view.fill(c.bg);
  yield* fadeInTxt(view, c.label || "SLOW MOTION", {
    fill: c.accent,
    size: 14,
    letterSpacing: 6,
    y: -280,
    font: SANS,
    weight: 700,
  });
  yield* pause(t.startDelay);
  const ring = createRef<Circle>();
  yield view.add(<Circle size={300} stroke={"#243044"} lineWidth={20} fill={null} />);
  yield view.add(
    <Circle ref={ring} size={300} stroke={c.accent} lineWidth={20} fill={null} startAngle={-90} endAngle={-90} lineCap={"round"} />,
  );
  const dripYs: number[] = [];
  const drips: ReturnType<typeof createRef<Rect>>[] = [];
  for (let i = 0; i < 5; i++) {
    const d = createRef<Rect>();
    drips.push(d);
    const a = ((-90 + (pct / 5) * (i + 1)) * Math.PI) / 180;
    const y = Math.sin(a) * 150;
    dripYs.push(y);
    yield view.add(
      <Rect ref={d} width={6} height={0} fill={c.accent} x={Math.cos(a) * 150} y={y} opacity={0.6} />,
    );
  }
  yield* ring().endAngle(-90 + pct * 3.6, t.lineDuration * 2.2, easeOutCubic);
  yield* all(
    ...drips.map((d, i) =>
      all(d().height(40, 0.4, easeOutCubic), d().y(dripYs[i] + 20, 0.4, easeOutCubic)),
    ),
  );
  yield* hold();
}

/** Stamped DEADLINE plate slamming with date. */
function* theDeadline(view: any) {
  const c = colors();
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  const plate = createRef<Layout>();
  yield view.add(
    <Layout ref={plate} scale={2.4} opacity={0} rotation={-12}>
      <Rect width={520} height={160} fill={null} stroke={c.accent} lineWidth={8} radius={4} />
      <Txt text={"DEADLINE"} fill={c.accent} fontFamily={SERIF} fontSize={56} fontWeight={700} letterSpacing={10} y={-20} />
      <Txt text={c.era || c.subtitle || String(c.year)} fill={"#e8eef6"} fontFamily={SANS} fontSize={22} y={40} />
    </Layout>,
  );
  yield* all(
    plate().scale(1, t.revealDuration * 0.8, easeOutCubic),
    plate().opacity(1, 0.15, easeOutCubic),
    plate().rotation(-4, t.revealDuration * 0.8, easeOutCubic),
  );
  const flash = createRef<Rect>();
  yield view.add(<Rect ref={flash} width={1280} height={720} fill={c.accent} opacity={0.25} />);
  yield* flash().opacity(0, 0.35, easeOutCubic);
  yield* hold();
}

/** Metronome pendulum swing + ticks. */
function* tickingClock(view: any) {
  const c = colors();
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  yield view.add(<Rect width={40} height={20} fill={"#2a3648"} y={180} radius={4} />);
  const arm = createRef<Layout>();
  yield view.add(
    <Layout ref={arm} y={180} rotation={-25}>
      <Rect width={8} height={260} fill={c.accent} y={-130} />
      <Circle size={36} fill={"#e8eef6"} y={-260} />
    </Layout>,
  );
  const tickTxt = createRef<Txt>();
  yield view.add(
    <Txt ref={tickTxt} text={"TICK"} fill={"#6b7280"} fontFamily={SANS} fontSize={18} letterSpacing={8} y={-220} />,
  );
  for (let i = 0; i < 6; i++) {
    const to = i % 2 === 0 ? 25 : -25;
    tickTxt().text(i % 2 === 0 ? "TOCK" : "TICK");
    tickTxt().fill(c.accent);
    yield* arm().rotation(to, 0.28, easeOutCubic);
  }
  yield* fadeInTxt(view, c.label || `${c.percent}%`, {
    fill: "#ffffff",
    size: 28,
    y: 260,
    font: SERIF,
    weight: 700,
  });
  yield* hold();
}

/** 11:59 → 12:00 flip with flash. */
function* midnight(view: any) {
  const c = colors();
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  const clock = createRef<Txt>();
  yield view.add(
    <Txt ref={clock} text={"11:59"} fill={"#ffffff"} fontFamily={SERIF} fontSize={140} fontWeight={700} />,
  );
  yield* pause(t.stepDelay + 0.4);
  yield* all(clock().opacity(0, 0.1, easeOutCubic), clock().y(-40, 0.1, easeOutCubic));
  clock().text("12:00");
  clock().y(40);
  clock().fill(c.accent);
  const flash = createRef<Rect>();
  yield view.add(<Rect ref={flash} width={1280} height={720} fill={"#ffffff"} opacity={0.5} />);
  yield* all(
    clock().opacity(1, 0.2, easeOutCubic),
    clock().y(0, 0.25, easeOutCubic),
    flash().opacity(0, 0.4, easeOutCubic),
  );
  yield* fadeInTxt(view, c.label || "MIDNIGHT", {
    fill: c.accent,
    size: 18,
    letterSpacing: 10,
    y: 140,
    font: SANS,
    weight: 700,
  });
  yield* hold();
}

/** Circular last-minute gauge. */
function* lastMinute(view: any) {
  const c = colors();
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  yield view.add(<Circle size={340} stroke={"#243044"} lineWidth={24} fill={null} />);
  const gauge = createRef<Circle>();
  yield view.add(
    <Circle ref={gauge} size={340} stroke={c.accent} lineWidth={24} fill={null} startAngle={-90} endAngle={-90} lineCap={"round"} />,
  );
  const label = createRef<Txt>();
  yield view.add(
    <Txt ref={label} text={"60"} fill={"#ffffff"} fontFamily={SERIF} fontSize={96} fontWeight={700} />,
  );
  yield view.add(
    <Txt text={"SEC"} fill={c.accent} fontFamily={SANS} fontSize={16} letterSpacing={4} y={70} />,
  );
  const steps = 12;
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    label().text(String(Math.round(60 - 60 * p)));
    yield* gauge().endAngle(-90 + 360 * p, 0.12, easeOutCubic);
  }
  yield* fadeInTxt(view, c.title || "The Last Minute", {
    fill: "#9aa8b8",
    size: 18,
    y: 240,
    font: SANS,
  });
  yield* hold();
}

/** Two triangles sand transferring (rects morphing). */
function* hourglass(view: any) {
  const c = colors();
  const pct = Math.min(100, Math.max(0, c.percent));
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  const top = createRef<Layout>();
  const bot = createRef<Layout>();
  yield view.add(
    <Layout ref={top} y={-100}>
      <Line points={[[-80, -80], [80, -80], [0, 80]]} closed fill={"#1a2430"} />
      <Rect width={100} height={70} fill={c.accent} y={-30} opacity={0.85} />
    </Layout>,
  );
  yield view.add(
    <Layout ref={bot} y={100}>
      <Line points={[[0, -80], [-80, 80], [80, 80]]} closed fill={"#1a2430"} />
      <Rect width={20} height={10} fill={c.accent} y={50} opacity={0.85} />
    </Layout>,
  );
  const sandTop = createRef<Rect>();
  const sandBot = createRef<Rect>();
  yield view.add(<Rect ref={sandTop} width={90} height={60} fill={c.accent} y={-120} opacity={0.9} />);
  yield view.add(<Rect ref={sandBot} width={30} height={8} fill={c.accent} y={140} opacity={0.9} />);
  const stream = createRef<Rect>();
  yield view.add(<Rect ref={stream} width={4} height={0} fill={c.accent} y={0} opacity={0.7} />);
  yield* stream().height(80, 0.3, easeOutCubic);
  const targetH = 20 + (pct / 100) * 50;
  yield* all(
    sandTop().height(60 - targetH * 0.6, t.lineDuration * 1.5, easeOutCubic),
    sandTop().y(-120 + targetH * 0.2, t.lineDuration * 1.5, easeOutCubic),
    sandBot().height(targetH, t.lineDuration * 1.5, easeOutCubic),
    sandBot().width(30 + pct * 0.6, t.lineDuration * 1.5, easeOutCubic),
    sandBot().y(160 - targetH / 2, t.lineDuration * 1.5, easeOutCubic),
  );
  yield* hold();
}

/** Cut between two timestamps with slash transition. */
function* timeJump(view: any) {
  const c = colors();
  const era = c.era || "2019 → 2024";
  const parts = era.split(/[→—–\-]/).map((s) => s.trim()).filter(Boolean);
  const from = parts[0] || "2019";
  const to = parts[1] || "2024";
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  const a = createRef<Txt>();
  yield view.add(
    <Txt ref={a} text={from} fill={"#ffffff"} fontFamily={SERIF} fontSize={96} fontWeight={700} />,
  );
  yield* pause(0.5);
  const slash = createRef<Rect>();
  yield view.add(<Rect ref={slash} width={80} height={900} fill={c.accent} rotation={25} x={-700} />);
  yield* slash().x(700, t.lineDuration * 0.5, easeOutCubic);
  a().text(to);
  a().fill(c.accent);
  slash().opacity(0);
  yield* a().scale(1.08, 0.2, easeOutBack);
  yield* a().scale(1, 0.2, easeOutCubic);
  yield* hold();
}

/** Clock face whose ticks become timeline nodes. */
function* timelineClock(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS).slice(0, 6);
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  const face = createRef<Circle>();
  yield view.add(<Circle ref={face} size={300} stroke={"#243044"} lineWidth={4} fill={"#0c141c"} />);
  const ticks: ReturnType<typeof createRef<Circle>>[] = [];
  const n = Math.max(events.length, 4);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const tick = createRef<Circle>();
    ticks.push(tick);
    yield view.add(
      <Circle ref={tick} size={12} fill={c.accent} x={Math.cos(a) * 130} y={Math.sin(a) * 130} scale={0} />,
    );
  }
  yield* all(...ticks.map((tick) => tick().scale(1, t.revealDuration, easeOutBack)));
  yield* pause(t.connectDelay);
  yield* all(
    face().opacity(0.2, t.lineDuration, easeOutCubic),
    face().scale(0.4, t.lineDuration, easeOutCubic),
    ...ticks.map((tick, i) => {
      const x = -400 + (i / Math.max(n - 1, 1)) * 800;
      return all(tick().x(x, t.lineDuration, easeOutCubic), tick().y(40, t.lineDuration, easeOutCubic), tick().size(18, t.lineDuration, easeOutCubic));
    }),
  );
  yield view.add(<Rect width={840} height={3} fill={c.accent} y={40} opacity={0.5} />);
  for (let i = 0; i < events.length; i++) {
    const x = -400 + (i / Math.max(n - 1, 1)) * 800;
    yield view.add(
      <Txt text={events[i].label || String(c.startYear + i * 5)} fill={c.accent} fontFamily={SERIF} fontSize={14} x={x} y={-20} />,
    );
    yield view.add(
      <Txt text={events[i].title} fill={"#e8eef6"} fontFamily={SANS} fontSize={12} x={x} y={80} width={120} textAlign={"center"} textWrap />,
    );
  }
  yield* hold();
}

/** Big DAY N counter. */
function* dayCounter(view: any) {
  const c = colors();
  const start = c.startYear;
  const end = c.endYear;
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  yield* fadeInTxt(view, "DAY", {
    fill: c.accent,
    size: 28,
    letterSpacing: 12,
    y: -120,
    font: SANS,
    weight: 700,
  });
  const numRef = createRef<Txt>();
  yield view.add(
    <Txt ref={numRef} text={String(start)} fill={"#ffffff"} fontFamily={SERIF} fontSize={160} fontWeight={700} y={40} />,
  );
  const steps = 20;
  yield* countText(numRef, start, end, steps, Math.max(0.04, t.lineDuration / steps), (n) => String(Math.round(n)));
  yield* hold();
}

/** "DAYS SINCE" eyebrow + counting days. */
function* daysSince(view: any) {
  const c = colors();
  const start = c.startYear;
  const end = c.endYear;
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  yield* fadeInTxt(view, "DAYS SINCE", {
    fill: c.accent,
    size: 16,
    letterSpacing: 10,
    y: -160,
    font: SANS,
    weight: 700,
  });
  const numRef = createRef<Txt>();
  yield view.add(
    <Txt ref={numRef} text={String(start)} fill={"#ffffff"} fontFamily={SERIF} fontSize={140} fontWeight={700} />,
  );
  const rule = createRef<Rect>();
  yield view.add(<Rect ref={rule} width={0} height={4} fill={c.accent} y={120} />);
  const steps = 22;
  const stepTime = Math.max(0.04, t.lineDuration / steps);
  yield* rule().width(280, t.lineDuration * 0.5, easeOutCubic);
  yield* countText(numRef, start, end, steps, stepTime, (n) => String(Math.round(n)));
  if (c.label || c.subtitle) {
    yield* fadeInTxt(view, c.label || c.subtitle, {
      fill: "#9aa8b8",
      size: 18,
      y: 180,
      font: SANS,
    });
  }
  yield* hold();
}

/** Title + fuse line burning left to right. */
function* countdownBegins(view: any) {
  const c = colors();
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  yield* fadeInTxt(view, c.claim || c.title || "The Countdown Begins", {
    fill: "#ffffff",
    size: 42,
    y: -40,
    font: SERIF,
    weight: 700,
    width: 900,
  });
  yield view.add(<Rect width={900} height={6} fill={"#2a3648"} y={100} radius={3} />);
  const fuse = createRef<Rect>();
  const spark = createRef<Circle>();
  yield view.add(<Rect ref={fuse} width={0} height={6} fill={c.accent} x={-450} y={100} radius={3} />);
  yield view.add(<Circle ref={spark} size={18} fill={"#fff"} x={-450} y={100} />);
  yield* all(
    fuse().width(900, t.lineDuration * 1.6, easeOutCubic),
    fuse().x(0, t.lineDuration * 1.6, easeOutCubic),
    spark().x(450, t.lineDuration * 1.6, easeOutCubic),
  );
  yield* spark().scale(2, 0.15, easeOutCubic);
  yield* spark().opacity(0, 0.2, easeOutCubic);
  yield* hold();
}

/** Pressure gauge needle sweeping up. */
function* pressure(view: any) {
  const c = colors();
  const pct = Math.min(100, Math.max(0, c.percent));
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  yield view.add(
    <Circle size={360} stroke={"#243044"} lineWidth={10} fill={"#0c141c"} startAngle={180} endAngle={0} />,
  );
  const zones = [
    { start: 180, end: 140, color: "#22c55e" },
    { start: 140, end: 100, color: "#eab308" },
    { start: 100, end: 60, color: "#f97316" },
    { start: 60, end: 0, color: "#ef4444" },
  ];
  for (const z of zones) {
    yield view.add(
      <Circle size={360} stroke={z.color} lineWidth={10} fill={null} startAngle={z.start} endAngle={z.end} opacity={0.5} />,
    );
  }
  const needle = createRef<Layout>();
  yield view.add(
    <Layout ref={needle} rotation={180}>
      <Rect width={140} height={6} x={70} fill={"#ffffff"} radius={3} />
    </Layout>,
  );
  yield view.add(<Circle size={24} fill={c.accent} />);
  const targetRot = 180 - (pct / 100) * 180;
  yield* needle().rotation(targetRot, t.lineDuration * 1.5, easeOutCubic);
  yield* fadeInTxt(view, c.label || "PRESSURE", {
    fill: c.accent,
    size: 18,
    letterSpacing: 6,
    y: 160,
    font: SANS,
    weight: 700,
  });
  yield* hold();
}

/** Looping 24h dial with ALWAYS ON badge. */
function* twentyFourSeven(view: any) {
  const c = colors();
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);
  yield view.add(<Circle size={320} stroke={"#243044"} lineWidth={4} fill={null} />);
  const hand = createRef<Layout>();
  yield view.add(
    <Layout ref={hand}>
      <Rect width={130} height={4} x={65} fill={c.accent} radius={2} />
    </Layout>,
  );
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
    const deg = (a * 180) / Math.PI;
    yield view.add(
      <Rect
        width={i % 6 === 0 ? 16 : 8}
        height={3}
        fill={"#4a5568"}
        x={Math.cos(a) * 140}
        y={Math.sin(a) * 140}
        rotation={deg}
      />,
    );
  }
  for (let i = 0; i < 24; i++) {
    yield* hand().rotation((i + 1) * 15, 0.06, easeOutCubic);
  }
  const badge = createRef<Layout>();
  yield view.add(
    <Layout ref={badge} y={220} scale={0} opacity={0}>
      <Rect width={280} height={56} fill={c.accent} radius={4} />
      <Txt text={"ALWAYS ON"} fill={c.bg} fontFamily={SANS} fontSize={20} fontWeight={700} letterSpacing={4} />
    </Layout>,
  );
  yield* all(badge().scale(1, t.revealDuration, easeOutBack), badge().opacity(1, t.revealDuration, easeOutCubic));
  yield* hold();
}

/** Analog clock morphs into horizontal timeline — the unique idea. */
function* clockTimelineMorph(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS).slice(0, 5);
  const t = c.t;
  view.fill(c.bg);
  yield* pause(t.startDelay);

  const face = createRef<Circle>();
  const hand = createRef<Layout>();
  yield view.add(<Circle ref={face} size={280} stroke={c.accent} lineWidth={6} fill={"#0c141c"} y={-20} />);
  yield view.add(
    <Layout ref={hand} y={-20}>
      <Rect width={100} height={4} x={50} fill={"#ffffff"} radius={2} />
    </Layout>,
  );
  yield view.add(<Circle size={12} fill={c.accent} y={-20} />);

  const n = Math.max(events.length, 1);
  const dots: ReturnType<typeof createRef<Circle>>[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const dot = createRef<Circle>();
    dots.push(dot);
    yield view.add(
      <Circle ref={dot} size={14} fill={c.accent} x={Math.cos(a) * 110} y={-20 + Math.sin(a) * 110} scale={0} />,
    );
  }
  yield* all(...dots.map((d) => d().scale(1, t.revealDuration, easeOutBack)));
  yield* hand().rotation(120, t.lineDuration * 0.6, easeOutCubic);
  yield* pause(t.connectDelay);

  // Morph: face flattens into a rail, dots fly to timeline positions
  const rail = createRef<Rect>();
  yield view.add(<Rect ref={rail} width={0} height={4} fill={c.accent} y={40} opacity={0} />);
  yield* all(
    face().scale(0.15, t.lineDuration, easeOutCubic),
    face().opacity(0, t.lineDuration, easeOutCubic),
    face().y(40, t.lineDuration, easeOutCubic),
    hand().opacity(0, t.revealDuration * 0.5, easeOutCubic),
    rail().opacity(1, t.revealDuration, easeOutCubic),
    rail().width(900, t.lineDuration, easeOutCubic),
    ...dots.map((dot, i) => {
      const x = -400 + (i / Math.max(n - 1, 1)) * 800;
      return all(dot().x(x, t.lineDuration, easeOutCubic), dot().y(40, t.lineDuration, easeOutCubic), dot().size(20, t.lineDuration, easeOutCubic));
    }),
  );

  for (let i = 0; i < events.length; i++) {
    const x = -400 + (i / Math.max(n - 1, 1)) * 800;
    const label = createRef<Txt>();
    yield view.add(
      <Txt ref={label} text={events[i].label} fill={c.accent} fontFamily={SERIF} fontSize={16} x={x} y={-30} opacity={0} />,
    );
    yield view.add(
      <Txt text={events[i].title} fill={"#e8eef6"} fontFamily={SANS} fontSize={13} x={x} y={90} width={140} textAlign={"center"} textWrap opacity={0.9} />,
    );
    yield* label().opacity(1, t.revealDuration * 0.6, easeOutCubic);
    if (i < events.length - 1) yield* pause(t.stepDelay * 0.5);
  }
  yield* fadeInTxt(view, c.title || "It all started…", {
    fill: "#9aa8b8",
    size: 16,
    y: -260,
    font: SANS,
  });
  yield* hold();
}

function* fallback(view: any, template: string) {
  const c = colors();
  view.fill(c.bg);
  yield* fadeInTxt(view, template.replace(/^time-/, "").replace(/-/g, " ").toUpperCase(), {
    fill: c.accent,
    size: 28,
    font: SERIF,
    weight: 700,
  });
  yield* hold();
}

const MAP: Record<string, Gen> = {
  "time-race-against": raceAgainst,
  "time-countdown-clock": countdownClock,
  "time-running-out": runningOut,
  "time-clock-starts": clockStarts,
  "time-24-hours": twentyFourHours,
  "time-48-hours-later": fortyEightHoursLater,
  "time-final-hour": finalHour,
  "time-minutes-before": minutesBefore,
  "time-seconds-before": secondsBefore,
  "time-freeze": timeFreeze,
  "time-clock-rewind": clockRewind,
  "time-travel": timeTravel,
  "time-fast-forward": fastForward,
  "time-slow-motion": slowMotion,
  "time-the-deadline": theDeadline,
  "time-ticking-clock": tickingClock,
  "time-midnight": midnight,
  "time-last-minute": lastMinute,
  "time-hourglass": hourglass,
  "time-jump": timeJump,
  "time-timeline-clock": timelineClock,
  "time-day-counter": dayCounter,
  "time-days-since": daysSince,
  "time-countdown-begins": countdownBegins,
  "time-pressure": pressure,
  "time-24-7": twentyFourSeven,
  "time-clock-timeline-morph": clockTimelineMorph,
};

export function* runDocTime(view: any, template: string) {
  const fn = MAP[template];
  if (fn) yield* fn(view);
  else yield* fallback(view, template);
}
