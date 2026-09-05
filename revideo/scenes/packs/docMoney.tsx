/** @jsxImportSource @revideo/2d/lib */
import { Circle, Line, Rect, Txt } from "@revideo/2d";
import {
  SERIF,
  SANS,
  colors,
  parseEvents,
  DEFAULT_EVENTS,
  fadeInTxt,
  countText,
  growBar,
  hold,
  all,
  createRef,
  easeOutCubic,
  easeOutBack,
  waitFor,
  pause,
  itemDelays,
} from "../../lib/docKit";

type Gen = (view: any) => Generator;

function fmtMoney(n: number, prefix: string, suffix: string) {
  const rounded = Math.abs(n) >= 100 ? Math.round(n) : Math.round(n * 10) / 10;
  return `${prefix}${rounded}${suffix ? ` ${suffix}` : ""}`;
}

function* moneyCounter(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  if (c.label || c.eyebrow) yield* fadeInTxt(view, (c.eyebrow || c.label).toUpperCase(), { fill: c.accent, size: 14, y: -250, letterSpacing: 5, font: SANS, weight: 700 });
  const digits = String(Math.round(c.value)).padStart(4, "0").split("");
  const rollers = digits.map(() => createRef<Txt>());
  const gap = 78;
  const startX = -((digits.length - 1) * gap) / 2;
  for (let i = 0; i < digits.length; i++) {
    yield view.add(<Rect width={68} height={110} fill={"#121820"} radius={10} x={startX + i * gap} y={-10} />);
    yield view.add(
      <Txt ref={rollers[i]} text={"0"} fill={"#f4efe6"} fontFamily={SERIF} fontSize={64} fontWeight={700} x={startX + i * gap} y={-10} />,
    );
  }
  yield* fadeInTxt(view, c.prefix || "₹", { fill: c.accent, size: 42, x: startX - 70, y: -10, font: SERIF });
  if (c.suffix) yield* fadeInTxt(view, c.suffix, { fill: "#9aa8b8", size: 28, x: startX + (digits.length - 1) * gap + 80, y: 10, font: SANS });
  for (let i = 0; i < digits.length; i++) {
    const target = Number(digits[i]);
    yield* pause(0.08 + (itemDelays(digits.length)[i] || 0));
    for (let d = 0; d <= target + 8; d++) {
      rollers[i]().text(String(d % 10));
      yield* waitFor(0.035);
    }
    rollers[i]().text(digits[i]);
  }
  if (c.caption || c.note) yield* fadeInTxt(view, c.caption || c.note, { fill: "#aeb8c8", size: 18, y: 120, font: SANS, weight: 500 });
  yield* hold(1.1);
}

function* moneyRevenueGrowth(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Revenue Growth", { size: 28, y: -280, fill: "#fff" });
  const heights = [70, 110, 150, 200, 260];
  const startX = -200;
  for (let i = 0; i < heights.length; i++) {
    yield* pause(c.t.stepDelay);
    yield* growBar(view, { x: startX + i * 90, y: 160, maxH: heights[i], w: 48, fill: i === heights.length - 1 ? c.accent : "#2a3a4c", duration: c.t.lineDuration });
  }
  const arrow = createRef<Line>();
  const pct = createRef<Txt>();
  yield view.add(
    <Line ref={arrow} points={[[-220, 90], [180, -80]]} stroke={c.accent} lineWidth={5} end={0} lineCap={"round"} />,
  );
  yield view.add(<Txt ref={pct} text={`+${c.value}${c.suffix || "%"}`} fill={c.accent} fontFamily={SERIF} fontSize={42} fontWeight={700} x={240} y={-100} opacity={0} />);
  yield* all(arrow().end(1, 0.55, easeOutCubic), pct().opacity(1, 0.4, easeOutCubic));
  if (c.caption) yield* fadeInTxt(view, c.caption, { fill: "#9aa8b8", size: 16, y: 250, font: SANS });
  yield* hold(1);
}

function* moneyProfitVsLoss(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const left = createRef<Rect>();
  const right = createRef<Rect>();
  const slash = createRef<Rect>();
  const vs = createRef<Txt>();
  yield view.add(<Rect ref={left} width={0} height={420} fill={"#14532d"} x={-480} opacity={0.95} />);
  yield view.add(<Rect ref={right} width={0} height={420} fill={"#7f1d1d"} x={480} opacity={0.95} />);
  yield* all(
    left().width(460, 0.55, easeOutCubic),
    left().x(-230, 0.55, easeOutCubic),
    right().width(460, 0.55, easeOutCubic),
    right().x(230, 0.55, easeOutCubic),
  );
  yield view.add(<Rect ref={slash} width={18} height={0} fill={"#f4efe6"} rotation={28} />);
  yield view.add(<Txt ref={vs} text={"VS"} fill={"#0a0c12"} fontFamily={SERIF} fontSize={48} fontWeight={700} opacity={0} />);
  yield* all(slash().height(520, 0.4, easeOutBack), vs().opacity(1, 0.25, easeOutCubic));
  yield* fadeInTxt(view, c.leftTitle, { fill: "#86efac", size: 22, x: -230, y: -80, font: SANS, letterSpacing: 3 });
  yield* fadeInTxt(view, c.leftText || "Profit", { fill: "#fff", size: 36, x: -230, y: 20, font: SERIF });
  yield* fadeInTxt(view, c.rightTitle, { fill: "#fca5a5", size: 22, x: 230, y: -80, font: SANS, letterSpacing: 3 });
  yield* fadeInTxt(view, c.rightText || "Loss", { fill: "#fff", size: 36, x: 230, y: 20, font: SERIF });
  yield* hold(1.1);
}

function* moneyCompanyValuation(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const rings = [420, 300, 180].map(() => createRef<Circle>());
  for (let i = 0; i < rings.length; i++) {
    yield view.add(
      <Circle ref={rings[i]} size={rings.length ? [420, 300, 180][i] : 180} stroke={c.accent} lineWidth={3} fill={null} opacity={0} scale={0.4} />,
    );
  }
  const val = createRef<Txt>();
  yield view.add(
    <Txt ref={val} text={fmtMoney(0, c.prefix || "$", c.suffix || "B")} fill={"#fff"} fontFamily={SERIF} fontSize={64} fontWeight={700} opacity={0} />,
  );
  for (let i = 0; i < rings.length; i++) {
    yield* all(rings[i]().opacity(0.35 + i * 0.2, 0.35, easeOutCubic), rings[i]().scale(1, 0.45, easeOutBack));
  }
  yield* val().opacity(1, 0.3, easeOutCubic);
  yield* countText(val, 0, c.value, 18, 0.04, (n) => fmtMoney(n, c.prefix || "$", c.suffix || "B"));
  if (c.caption || c.note) yield* fadeInTxt(view, c.caption || c.note, { fill: "#9aa8b8", size: 18, y: 160, font: SANS });
  yield* hold(1);
}

function* moneyMarketCapRace(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Market Cap Race", { size: 26, y: -260, fill: "#fff" });
  const a = createRef<Rect>();
  const b = createRef<Rect>();
  yield view.add(<Txt text={c.leftTitle} fill={"#94a3b8"} fontFamily={SANS} fontSize={16} x={-420} y={-60} />);
  yield view.add(<Txt text={c.rightTitle} fill={"#94a3b8"} fontFamily={SANS} fontSize={16} x={-420} y={80} />);
  yield view.add(<Rect width={700} height={36} fill={"#141a22"} x={40} y={-60} radius={8} />);
  yield view.add(<Rect width={700} height={36} fill={"#141a22"} x={40} y={80} radius={8} />);
  yield view.add(<Rect ref={a} width={0} height={36} fill={c.accent} x={-310} y={-60} radius={8} />);
  yield view.add(<Rect ref={b} width={0} height={36} fill={"#64748b"} x={-310} y={80} radius={8} />);
  const wA = 520;
  const wB = 380;
  yield* all(
    a().width(wA, 1.2, easeOutCubic),
    a().x(-310 + wA / 2, 1.2, easeOutCubic),
    b().width(wB, 1.35, easeOutCubic),
    b().x(-310 + wB / 2, 1.35, easeOutCubic),
  );
  yield* fadeInTxt(view, c.leftText || "Leading", { fill: c.accent, size: 18, x: 380, y: -60, font: SANS });
  yield* fadeInTxt(view, c.rightText || "Trailing", { fill: "#94a3b8", size: 18, x: 300, y: 80, font: SANS });
  yield* hold(1);
}

function* moneyBillionDollar(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const steps = ["Idea", "Product", "Scale", "$1B"];
  const xs = [-360, -120, 120, 360];
  const path = createRef<Line>();
  yield view.add(<Line ref={path} points={xs.map((x, i) => [x, 40 - i * 18])} stroke={"#243044"} lineWidth={4} end={0} />);
  yield* path().end(1, 0.6, easeOutCubic);
  for (let i = 0; i < 4; i++) {
    const stone = createRef<Circle>();
    const lab = createRef<Txt>();
    yield view.add(<Circle ref={stone} size={0} fill={i === 3 ? c.accent : "#1e293b"} x={xs[i]} y={40 - i * 18} />);
    yield view.add(<Txt ref={lab} text={steps[i]} fill={"#e2e8f0"} fontFamily={SANS} fontSize={16} x={xs[i]} y={100 - i * 18} opacity={0} />);
    yield* all(stone().size(56 + i * 8, 0.35, easeOutBack), lab().opacity(1, 0.25, easeOutCubic));
    yield* pause(0.12);
  }
  const gate = createRef<Rect>();
  yield view.add(<Rect ref={gate} width={120} height={0} fill={c.accent} x={360} y={-80} radius={6} opacity={0.85} />);
  yield* gate().height(100, 0.4, easeOutBack);
  yield* fadeInTxt(view, c.title || "Billion Dollar Club", { size: 24, y: -240, fill: "#fff" });
  yield* hold(1);
}

function* moneyFlow(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Money Flow", { size: 26, y: -260, fill: "#fff" });
  const src = createRef<Circle>();
  const sink = createRef<Circle>();
  yield view.add(<Circle ref={src} size={0} fill={"#1e3a5f"} x={-280} y={0} />);
  yield view.add(<Circle ref={sink} size={0} fill={"#14532d"} x={280} y={0} />);
  yield* all(src().size(120, 0.4, easeOutBack), sink().size(120, 0.4, easeOutBack));
  yield* fadeInTxt(view, c.leftTitle || "Source", { size: 16, x: -280, y: 90, fill: "#94a3b8", font: SANS });
  yield* fadeInTxt(view, c.rightTitle || "Sink", { size: 16, x: 280, y: 90, fill: "#94a3b8", font: SANS });
  for (let i = 0; i < 3; i++) {
    const arrow = createRef<Line>();
    const y = -40 + i * 40;
    yield view.add(<Line ref={arrow} points={[[-200, y], [200, y]]} stroke={c.accent} lineWidth={4} end={0} lineCap={"round"} />);
    yield* arrow().end(1, 0.35, easeOutCubic);
    const tip = createRef<Txt>();
    yield view.add(<Txt ref={tip} text={"▶"} fill={c.accent} fontSize={18} x={-180} y={y} />);
    yield* tip().x(180, 0.4, easeOutCubic);
  }
  if (c.caption) yield* fadeInTxt(view, c.caption, { fill: "#9aa8b8", size: 16, y: 200, font: SANS });
  yield* hold(0.9);
}

function* moneyWhereItGoes(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Where It Goes", { size: 26, y: -220, fill: "#fff" });
  const segs = [
    { w: 280, fill: c.accent, label: c.highlight || "Ops" },
    { w: 180, fill: "#3b82f6", label: "Growth" },
    { w: 120, fill: "#eab308", label: "R&D" },
    { w: 80, fill: "#64748b", label: "Other" },
  ];
  let x = -330;
  for (const s of segs) {
    const bar = createRef<Rect>();
    yield view.add(<Rect ref={bar} width={0} height={72} fill={s.fill} x={x} y={20} radius={4} />);
    yield* all(bar().width(s.w, 0.4, easeOutCubic), bar().x(x + s.w / 2, 0.4, easeOutCubic));
    yield view.add(<Txt text={s.label} fill={"#0a0c12"} fontFamily={SANS} fontSize={14} fontWeight={700} x={x + s.w / 2} y={20} />);
    x += s.w + 8;
    yield* pause(0.08);
  }
  if (c.note || c.caption) yield* fadeInTxt(view, c.note || c.caption, { fill: "#9aa8b8", size: 16, y: 140, font: SANS });
  yield* hold(1.1);
}

function* moneyRevenueBreakdown(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Revenue Mix", { size: 26, y: -260, fill: "#fff" });
  const slices = [
    { sweep: 140, color: c.accent },
    { sweep: 90, color: "#3b82f6" },
    { sweep: 70, color: "#eab308" },
    { sweep: 60, color: "#64748b" },
  ];
  let angle = -90;
  for (const s of slices) {
    const ring = createRef<Circle>();
    yield view.add(
      <Circle ref={ring} size={260} stroke={s.color} lineWidth={48} fill={null} startAngle={angle} endAngle={angle} lineCap={"butt"} />,
    );
    yield* ring().endAngle(angle + s.sweep, 0.4, easeOutCubic);
    angle += s.sweep;
    yield* pause(0.08);
  }
  yield view.add(<Circle size={140} fill={c.bg} />);
  yield* fadeInTxt(view, `${c.value}${c.suffix || "%"}`, { size: 36, fill: "#fff", font: SERIF, weight: 700 });
  yield* fadeInTxt(view, c.label || c.highlight || "Core", { size: 14, y: 40, fill: "#94a3b8", font: SANS });
  yield* hold(1);
}

function* moneyCostBreakdown(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Cost Breakdown", { size: 26, y: -280, fill: "#fff" });
  const blocks = [
    { label: "Revenue", h: 200, fill: "#22c55e", y: -40 },
    { label: "COGS", h: 70, fill: "#ef4444", y: 40 },
    { label: "OpEx", h: 55, fill: "#f97316", y: 100 },
    { label: "Tax", h: 35, fill: "#eab308", y: 145 },
    { label: "Net", h: 40, fill: c.accent, y: 190 },
  ];
  let runningTop = -140;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const rect = createRef<Rect>();
    const x = -200 + i * 100;
    yield view.add(<Rect ref={rect} width={72} height={0} fill={b.fill} x={x} y={runningTop} radius={4} />);
    yield* all(rect().height(b.h, 0.35, easeOutCubic), rect().y(runningTop + b.h / 2, 0.35, easeOutCubic));
    yield view.add(<Txt text={b.label} fill={"#94a3b8"} fontFamily={SANS} fontSize={12} x={x} y={runningTop + b.h + 24} />);
    if (i > 0) runningTop += 28;
    yield* pause(0.1);
  }
  yield* hold(1);
}

function* moneyPriceTag(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const string = createRef<Rect>();
  const tag = createRef<Rect>();
  yield view.add(<Rect ref={string} width={4} height={0} fill={"#94a3b8"} y={-280} />);
  yield view.add(<Rect ref={tag} width={220} height={280} fill={c.accent} radius={12} y={-420} rotation={-18} />);
  yield* all(string().height(120, 0.4, easeOutCubic), string().y(-220, 0.4, easeOutCubic));
  yield* all(tag().y(-40, 0.55, easeOutBack), tag().rotation(-6, 0.55, easeOutBack));
  yield* tag().rotation(4, 0.25, easeOutCubic);
  yield* tag().rotation(-2, 0.2, easeOutCubic);
  const amount = createRef<Txt>();
  yield view.add(
    <Txt ref={amount} text={fmtMoney(c.value, c.prefix || "₹", c.suffix)} fill={"#0a0c12"} fontFamily={SERIF} fontSize={48} fontWeight={700} y={-20} opacity={0} />,
  );
  yield* amount().opacity(1, 0.3, easeOutCubic);
  if (c.caption || c.label) yield* fadeInTxt(view, c.caption || c.label, { fill: "#0a0c12", size: 16, y: 50, font: SANS });
  yield* hold(1.1);
}

function* moneyZeroToCrore(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "₹0 → ₹1 Cr", { size: 26, y: -260, fill: "#fff" });
  const rail = createRef<Rect>();
  yield view.add(<Rect ref={rail} width={0} height={6} fill={"#243044"} y={40} x={-360} />);
  yield* all(rail().width(720, 0.7, easeOutCubic), rail().x(0, 0.7, easeOutCubic));
  const checks = [
    { x: -360, label: "₹0" },
    { x: -120, label: "₹10L" },
    { x: 120, label: "₹50L" },
    { x: 360, label: "₹1 Cr" },
  ];
  const dot = createRef<Circle>();
  yield view.add(<Circle ref={dot} size={18} fill={c.accent} x={-360} y={40} />);
  for (const ck of checks) {
    yield view.add(<Circle size={14} fill={"#334155"} x={ck.x} y={40} />);
    yield view.add(<Txt text={ck.label} fill={"#94a3b8"} fontFamily={SANS} fontSize={14} x={ck.x} y={80} />);
  }
  yield* dot().x(360, 1.4, easeOutCubic);
  const val = createRef<Txt>();
  yield view.add(<Txt ref={val} text={"₹0"} fill={c.accent} fontFamily={SERIF} fontSize={42} fontWeight={700} y={-80} />);
  yield* countText(val, 0, c.value || 1, 20, 0.05, (n) => `₹${Math.round(n * 100) / 100} ${c.suffix || "Cr"}`);
  yield* hold(0.9);
}

function* moneyNetWorth(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const pts: [number, number][] = [
    [-400, 180],
    [-280, 120],
    [-160, 140],
    [-40, 40],
    [80, 60],
    [200, -20],
    [320, -80],
    [400, -100],
  ];
  const area = createRef<Line>();
  const ridge = createRef<Line>();
  yield view.add(
    <Line ref={area} points={[...pts, [400, 200], [-400, 200]]} closed fill={c.accent} opacity={0.25} end={0} />,
  );
  yield view.add(<Line ref={ridge} points={pts} stroke={c.accent} lineWidth={4} end={0} lineCap={"round"} />);
  yield* all(area().end(1, 1.0, easeOutCubic), ridge().end(1, 1.0, easeOutCubic));
  const val = createRef<Txt>();
  yield view.add(
    <Txt ref={val} text={fmtMoney(0, c.prefix || "$", c.suffix || "B")} fill={"#fff"} fontFamily={SERIF} fontSize={56} fontWeight={700} y={-200} opacity={0} />,
  );
  yield* val().opacity(1, 0.3, easeOutCubic);
  yield* countText(val, 0, c.value, 16, 0.045, (n) => fmtMoney(n, c.prefix || "$", c.suffix || "B"));
  if (c.caption) yield* fadeInTxt(view, c.caption, { fill: "#9aa8b8", size: 16, y: 240, font: SANS });
  yield* hold(0.9);
}

function* moneyBusinessGrowth(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS).slice(0, 5);
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Business Growth", { size: 24, y: -280, fill: "#fff" });
  const trunk = createRef<Rect>();
  yield view.add(<Rect ref={trunk} width={8} height={0} fill={"#334155"} y={200} />);
  yield* all(trunk().height(360, 0.5, easeOutCubic), trunk().y(20, 0.5, easeOutCubic));
  const delays = itemDelays(events.length);
  for (let i = 0; i < events.length; i++) {
    yield* pause(c.t.stepDelay + (delays[i] || 0));
    const side = i % 2 === 0 ? -1 : 1;
    const y = 140 - i * 70;
    const node = createRef<Circle>();
    const branch = createRef<Rect>();
    yield view.add(<Rect ref={branch} width={0} height={4} fill={c.accent} x={0} y={y} />);
    yield view.add(<Circle ref={node} size={0} fill={c.accent} x={side * 140} y={y} />);
    yield* all(
      branch().width(140, 0.3, easeOutCubic),
      branch().x(side * 70, 0.3, easeOutCubic),
      node().size(22, 0.3, easeOutBack),
    );
    yield* fadeInTxt(view, events[i].label, { fill: c.accent, size: 14, x: side * 220, y: y - 18, font: SANS });
    yield* fadeInTxt(view, events[i].title, { fill: "#e2e8f0", size: 16, x: side * 220, y: y + 8, font: SERIF });
  }
  yield* hold(0.9);
}

function* moneyInvestmentFlow(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Investment Flow", { size: 26, y: -280, fill: "#fff" });
  const stages = [
    { label: "Idea", w: 120 },
    { label: "Seed", w: 200 },
    { label: "Growth", w: 300 },
    { label: "Exit", w: 420 },
  ];
  for (let i = 0; i < stages.length; i++) {
    const s = stages[i];
    const trap = createRef<Rect>();
    yield view.add(<Rect ref={trap} width={0} height={48} fill={i === 3 ? c.accent : "#1e293b"} y={-80 + i * 70} radius={4} />);
    yield* all(trap().width(s.w, 0.4, easeOutCubic));
    yield view.add(<Txt text={s.label} fill={"#e2e8f0"} fontFamily={SANS} fontSize={18} fontWeight={700} y={-80 + i * 70} />);
    yield* pause(0.1);
  }
  if (c.caption) yield* fadeInTxt(view, c.caption, { fill: "#9aa8b8", size: 16, y: 240, font: SANS });
  yield* hold(1);
}

function* moneyFundingJourney(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS).slice(0, 5);
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Funding Journey", { size: 26, y: -260, fill: "#fff" });
  const xs = events.map((_, i) => -320 + (i * 640) / Math.max(events.length - 1, 1));
  const line = createRef<Line>();
  yield view.add(<Line ref={line} points={xs.map((x) => [x, 20])} stroke={c.accent} lineWidth={3} end={0} />);
  yield* line().end(1, 0.7, easeOutCubic);
  const delays = itemDelays(events.length);
  for (let i = 0; i < events.length; i++) {
    yield* pause(c.t.stepDelay + (delays[i] || 0));
    const chip = createRef<Rect>();
    yield view.add(<Rect ref={chip} width={0} height={56} fill={"#121820"} stroke={c.accent} lineWidth={2} radius={28} x={xs[i]} y={20} />);
    yield* chip().width(110, 0.35, easeOutBack);
    yield view.add(<Txt text={events[i].label} fill={c.accent} fontFamily={SANS} fontSize={12} x={xs[i]} y={8} />);
    yield view.add(<Txt text={events[i].title} fill={"#fff"} fontFamily={SERIF} fontSize={14} x={xs[i]} y={28} />);
    if (events[i].detail) {
      yield view.add(<Txt text={events[i].detail} fill={"#94a3b8"} fontFamily={SANS} fontSize={13} x={xs[i]} y={90} />);
    }
  }
  yield* hold(1);
}

function* moneyIpoJourney(view: any) {
  const c = colors();
  const events = parseEvents(c.events, DEFAULT_EVENTS).slice(0, 4);
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "IPO Journey", { size: 26, y: -280, fill: "#fff" });
  const road = createRef<Rect>();
  yield view.add(<Rect ref={road} width={0} height={24} fill={"#1e293b"} y={80} radius={4} />);
  yield* all(road().width(800, 0.6, easeOutCubic));
  for (let i = 0; i < events.length; i++) {
    const x = -300 + i * 200;
    const mile = createRef<Rect>();
    yield view.add(<Rect ref={mile} width={8} height={0} fill={c.accent} x={x} y={80} />);
    yield* mile().height(50, 0.25, easeOutCubic);
    yield* fadeInTxt(view, events[i].label, { fill: c.accent, size: 14, x, y: 20, font: SANS });
    yield* fadeInTxt(view, events[i].title, { fill: "#e2e8f0", size: 16, x, y: -20, font: SERIF });
    yield* pause(0.12);
  }
  const bell = createRef<Circle>();
  const flash = createRef<Circle>();
  yield view.add(<Circle ref={bell} size={0} fill={c.accent} x={300} y={-100} />);
  yield view.add(<Circle ref={flash} size={0} fill={"#fef08a"} x={300} y={-100} opacity={0.5} />);
  yield* all(bell().size(64, 0.35, easeOutBack), flash().size(180, 0.45, easeOutCubic), flash().opacity(0, 0.45, easeOutCubic));
  yield* fadeInTxt(view, "LISTED", { fill: "#0a0c12", size: 14, x: 300, y: -100, font: SANS, weight: 700 });
  yield* hold(1);
}

function* moneyMarketShareBattle(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Market Share Battle", { size: 24, y: -260, fill: "#fff" });
  const a = createRef<Circle>();
  const b = createRef<Circle>();
  yield view.add(
    <Circle ref={a} size={280} stroke={c.accent} lineWidth={70} fill={null} startAngle={-90} endAngle={-90} lineCap={"butt"} />,
  );
  yield view.add(
    <Circle ref={b} size={280} stroke={"#ef4444"} lineWidth={70} fill={null} startAngle={90} endAngle={90} lineCap={"butt"} />,
  );
  yield* all(a().endAngle(-90 + 140, 0.8, easeOutCubic), b().endAngle(90 + 110, 0.8, easeOutCubic));
  yield* fadeInTxt(view, c.leftTitle, { fill: c.accent, size: 18, x: -220, y: 200, font: SANS });
  yield* fadeInTxt(view, c.leftText, { fill: "#fff", size: 22, x: -220, y: 230, font: SERIF });
  yield* fadeInTxt(view, c.rightTitle, { fill: "#ef4444", size: 18, x: 220, y: 200, font: SANS });
  yield* fadeInTxt(view, c.rightText, { fill: "#fff", size: 22, x: 220, y: 230, font: SERIF });
  yield* hold(1);
}

function* moneyBusinessModel(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Business Model", { size: 26, y: -260, fill: "#fff" });
  const boxes = [
    { x: -280, label: c.leftTitle || "Users", text: c.leftText || "Acquire" },
    { x: 0, label: "Engine", text: c.highlight || "Monetize" },
    { x: 280, label: c.rightTitle || "Cash", text: c.rightText || "Retain" },
  ];
  const refs = boxes.map(() => createRef<Rect>());
  for (let i = 0; i < boxes.length; i++) {
    yield view.add(<Rect ref={refs[i]} width={180} height={120} fill={"#121820"} radius={10} x={boxes[i].x} y={0} scale={0} />);
    yield* refs[i]().scale(1, 0.35, easeOutBack);
    yield view.add(<Txt text={boxes[i].label} fill={c.accent} fontFamily={SANS} fontSize={14} x={boxes[i].x} y={-20} />);
    yield view.add(<Txt text={boxes[i].text} fill={"#fff"} fontFamily={SERIF} fontSize={20} x={boxes[i].x} y={20} />);
  }
  for (let i = 0; i < 2; i++) {
    const conn = createRef<Line>();
    yield view.add(
      <Line ref={conn} points={[[boxes[i].x + 90, 0], [boxes[i + 1].x - 90, 0]]} stroke={c.accent} lineWidth={3} end={0} />,
    );
    yield* conn().end(1, 0.3, easeOutCubic);
  }
  if (c.claim) yield* fadeInTxt(view, c.claim, { fill: "#9aa8b8", size: 16, y: 160, width: 700, font: SANS });
  yield* hold(1);
}

function* moneyMoneyMachine(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Money Machine", { size: 26, y: -260, fill: "#fff" });
  const gears = [
    { x: -120, y: -20, size: 140 },
    { x: 40, y: 40, size: 100 },
    { x: 160, y: -40, size: 80 },
  ];
  const refs = gears.map(() => createRef<Rect>());
  for (let i = 0; i < gears.length; i++) {
    yield view.add(
      <Rect ref={refs[i]} width={gears[i].size} height={gears[i].size} fill={"#1e293b"} stroke={c.accent} lineWidth={3} x={gears[i].x} y={gears[i].y} radius={8} rotation={0} />,
    );
  }
  yield* all(...refs.map((r, i) => r().rotation(i % 2 ? -90 : 90, 1.2, easeOutCubic)));
  const cash = createRef<Txt>();
  yield view.add(
    <Txt ref={cash} text={fmtMoney(0, c.prefix || "₹", c.suffix || "Cr")} fill={c.accent} fontFamily={SERIF} fontSize={42} fontWeight={700} x={0} y={180} opacity={0} />,
  );
  yield* cash().opacity(1, 0.3, easeOutCubic);
  yield* countText(cash, 0, c.value, 14, 0.05, (n) => fmtMoney(n, c.prefix || "₹", c.suffix || "Cr"));
  yield* hold(0.9);
}

function* moneyProfitEngine(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Profit Engine", { size: 26, y: -260, fill: "#fff" });
  const segs = 6;
  for (let i = 0; i < segs; i++) {
    const start = -90 + i * 60;
    const arc = createRef<Circle>();
    yield view.add(
      <Circle ref={arc} size={280} stroke={"#1e293b"} lineWidth={36} fill={null} startAngle={start} endAngle={start + 50} lineCap={"butt"} opacity={0.4} />,
    );
  }
  for (let i = 0; i < segs; i++) {
    const start = -90 + i * 60;
    const lit = createRef<Circle>();
    yield view.add(
      <Circle ref={lit} size={280} stroke={c.accent} lineWidth={36} fill={null} startAngle={start} endAngle={start} lineCap={"butt"} />,
    );
    yield* lit().endAngle(start + 50, 0.28, easeOutCubic);
    yield* pause(0.08);
  }
  yield* fadeInTxt(view, c.highlight || "FLYWHEEL", { size: 22, fill: "#fff", font: SANS, letterSpacing: 4, weight: 700 });
  yield* hold(1);
}

function* moneyCashBurn(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Cash Burn", { size: 26, y: -240, fill: "#fff" });
  const track = createRef<Rect>();
  const bar = createRef<Rect>();
  yield view.add(<Rect ref={track} width={520} height={56} fill={"#1e293b"} y={0} radius={8} />);
  yield view.add(<Rect ref={bar} width={480} height={56} fill={"#ef4444"} x={0} y={0} radius={8} />);
  const lab = createRef<Txt>();
  yield view.add(<Txt ref={lab} text={"BURN"} fill={"#fff"} fontFamily={SANS} fontSize={20} fontWeight={700} letterSpacing={4} y={0} />);
  yield* all(bar().width(120, 1.4, easeOutCubic), bar().x(-180, 1.4, easeOutCubic));
  yield* fadeInTxt(view, fmtMoney(c.value, c.prefix || "₹", c.suffix || "Cr/mo"), { size: 36, y: 100, fill: "#fca5a5", font: SERIF });
  if (c.caption) yield* fadeInTxt(view, c.caption, { fill: "#9aa8b8", size: 16, y: 160, font: SANS });
  yield* hold(1);
}

function* moneyDebtCounter(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Debt Rising", { size: 26, y: -280, fill: "#fca5a5" });
  const layers = [80, 110, 140, 170, 200];
  for (let i = 0; i < layers.length; i++) {
    const bar = createRef<Rect>();
    const y = 180 - i * 42;
    yield view.add(<Rect ref={bar} width={0} height={32} fill={`rgba(239,68,68,${0.35 + i * 0.12})`} y={y} radius={4} />);
    yield* all(bar().width(160 + i * 70, 0.35, easeOutCubic));
    yield* pause(0.08);
  }
  const val = createRef<Txt>();
  yield view.add(
    <Txt ref={val} text={fmtMoney(0, c.prefix || "₹", c.suffix || "L Cr")} fill={"#ef4444"} fontFamily={SERIF} fontSize={48} fontWeight={700} y={-120} opacity={0} />,
  );
  yield* val().opacity(1, 0.25, easeOutCubic);
  yield* countText(val, 0, c.value, 16, 0.05, (n) => fmtMoney(n, c.prefix || "₹", c.suffix || "L Cr"));
  yield* hold(1);
}

function* moneyRichVsPoor(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Wealth Gap", { size: 26, y: -280, fill: "#fff" });
  // Pyramid (rich)
  const tiers = [60, 120, 180, 240];
  for (let i = 0; i < tiers.length; i++) {
    const t = createRef<Rect>();
    yield view.add(<Rect ref={t} width={0} height={36} fill={c.accent} x={-220} y={-80 + i * 50} radius={3} />);
    yield* t().width(tiers[i], 0.3, easeOutCubic);
  }
  yield* fadeInTxt(view, c.leftTitle || "RICH", { fill: c.accent, size: 16, x: -220, y: 140, font: SANS, letterSpacing: 3 });
  yield* fadeInTxt(view, c.leftText, { fill: "#e2e8f0", size: 16, x: -220, y: 170, font: SERIF, width: 260 });
  // Flat base (poor)
  const base = createRef<Rect>();
  yield view.add(<Rect ref={base} width={0} height={28} fill={"#64748b"} x={220} y={80} radius={3} />);
  yield* base().width(280, 0.5, easeOutCubic);
  yield* fadeInTxt(view, c.rightTitle || "POOR", { fill: "#94a3b8", size: 16, x: 220, y: 140, font: SANS, letterSpacing: 3 });
  yield* fadeInTxt(view, c.rightText, { fill: "#e2e8f0", size: 16, x: 220, y: 170, font: SERIF, width: 260 });
  yield* hold(1.1);
}

function* moneyEconomyScale(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const planet = createRef<Circle>();
  const ring = createRef<Circle>();
  yield view.add(<Circle ref={planet} size={0} fill={"#1e3a5f"} y={40} />);
  yield view.add(<Circle ref={ring} size={0} stroke={c.accent} lineWidth={3} fill={null} y={40} opacity={0.5} />);
  yield* all(planet().size(160, 0.5, easeOutBack), ring().size(220, 0.55, easeOutCubic));
  const gdp = createRef<Txt>();
  yield view.add(
    <Txt ref={gdp} text={fmtMoney(c.value, c.prefix || "$", c.suffix || "T")} fill={"#fff"} fontFamily={SERIF} fontSize={72} fontWeight={700} y={-220} opacity={0} scale={1.4} />,
  );
  yield* all(gdp().opacity(1, 0.35, easeOutCubic), gdp().scale(1, 0.45, easeOutBack), gdp().y(-180, 0.45, easeOutCubic));
  if (c.caption || c.note) yield* fadeInTxt(view, c.caption || c.note, { fill: "#9aa8b8", size: 18, y: 200, font: SANS });
  yield* hold(1.1);
}

const MAP: Record<string, Gen> = {
  "money-counter": moneyCounter,
  "money-revenue-growth": moneyRevenueGrowth,
  "money-profit-vs-loss": moneyProfitVsLoss,
  "money-company-valuation": moneyCompanyValuation,
  "money-market-cap-race": moneyMarketCapRace,
  "money-billion-dollar": moneyBillionDollar,
  "money-flow": moneyFlow,
  "money-where-it-goes": moneyWhereItGoes,
  "money-revenue-breakdown": moneyRevenueBreakdown,
  "money-cost-breakdown": moneyCostBreakdown,
  "money-price-tag": moneyPriceTag,
  "money-zero-to-crore": moneyZeroToCrore,
  "money-net-worth": moneyNetWorth,
  "money-business-growth": moneyBusinessGrowth,
  "money-investment-flow": moneyInvestmentFlow,
  "money-funding-journey": moneyFundingJourney,
  "money-ipo-journey": moneyIpoJourney,
  "money-market-share-battle": moneyMarketShareBattle,
  "money-business-model": moneyBusinessModel,
  "money-money-machine": moneyMoneyMachine,
  "money-profit-engine": moneyProfitEngine,
  "money-cash-burn": moneyCashBurn,
  "money-debt-counter": moneyDebtCounter,
  "money-rich-vs-poor": moneyRichVsPoor,
  "money-economy-scale": moneyEconomyScale,
};

export function* runDocMoney(view: any, template: string) {
  const fn = MAP[template];
  if (fn) yield* fn(view);
}
