/** @jsxImportSource @revideo/2d/lib */
import { Circle, Layout, Line, Rect, Txt } from "@revideo/2d";
import {
  parseCandles,
  parseDual,
  parsePairs,
  palette,
} from "../../lib/chartData";
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  num,
  str,
  waitFor,
} from "../../lib/helpers";
import { itemDelays, pause, timing } from "../../lib/timing";

const SERIF = "Libre Baskerville, Georgia, serif";

function bars() {
  return `2019|42\n2020|55\n2021|61\n2022|48\n2023|70`;
}
function budget() {
  return `Health|32\nEducation|24\nDefense|18\nOther|26`;
}
function dual() {
  return `Q1|40|28\nQ2|48|30\nQ3|55|33\nQ4|52|36`;
}
function ohlc() {
  return `Mon|100|112|96|108\nTue|108|118|104|110\nWed|110|122|101|116\nThu|116|124|108|109\nFri|109|119|102|118`;
}

function* head(view: any, title: string) {
  const t = timing();
  const titleRef = createRef<Txt>();
  yield view.add(
    <Txt ref={titleRef} text={title} fill={"#ffffff"} fontFamily={SERIF} fontSize={26} fontWeight={700} y={-280} opacity={0} />,
  );
  yield* titleRef().opacity(1, t.revealDuration, easeOutCubic);
}

function setup(view: any) {
  const title = str("title", "Chart");
  const accent = str("accent", "#d8a11a");
  const bg = str("bg", "#07080c");
  view.fill(bg);
  return { title, accent, bg, t: timing() };
}

function* pieExplode(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", budget()), budget());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  const colors = palette(accent, rows);
  let angle = -90;
  const extra = itemDelays(rows.length);
  for (let i = 0; i < rows.length; i++) {
    yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const sweep = (rows[i].value / total) * 360;
    const mid = ((angle + sweep / 2) * Math.PI) / 180;
    const explode = i === 0 ? 28 : 0;
    const slice = createRef<Circle>();
    yield view.add(
      <Circle
        ref={slice}
        size={260}
        stroke={colors[i % colors.length]}
        lineWidth={130}
        fill={null}
        startAngle={angle}
        endAngle={angle}
        x={Math.cos(mid) * explode}
        y={Math.sin(mid) * explode}
        lineCap={"butt"}
      />,
    );
    yield* slice().endAngle(angle + sweep, t.lineDuration, easeOutCubic);
    yield view.add(
      <Txt text={rows[i].label} fill={"#e8f0ea"} fontFamily={SERIF} fontSize={14} x={Math.cos(mid) * 210} y={Math.sin(mid) * 210} />,
    );
    angle += sweep;
  }
  yield* waitFor(1);
}

function* pieLegend(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", budget()), budget());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  const colors = palette(accent, rows);
  let angle = -90;
  yield view.add(<Layout x={-180} />);
  for (let i = 0; i < rows.length; i++) {
    const sweep = (rows[i].value / total) * 360;
    const slice = createRef<Circle>();
    yield view.add(
      <Circle ref={slice} size={240} stroke={colors[i % colors.length]} lineWidth={120} fill={null} startAngle={angle} endAngle={angle} x={-160} lineCap={"butt"} />,
    );
    yield* slice().endAngle(angle + sweep, t.lineDuration * 0.7, easeOutCubic);
    const row = createRef<Layout>();
    yield view.add(
      <Layout ref={row} x={220} y={-90 + i * 52} opacity={0} layout direction={"row"} gap={12} alignItems={"center"}>
        <Rect width={18} height={18} fill={colors[i % colors.length]} radius={3} />
        <Txt text={`${rows[i].label}  ${Math.round((rows[i].value / total) * 100)}%`} fill={"#e8f0ea"} fontFamily={SERIF} fontSize={18} />
      </Layout>,
    );
    yield* row().opacity(1, t.revealDuration, easeOutCubic);
    angle += sweep;
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* pieHalf(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", budget()), budget());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  const colors = palette(accent, rows);
  let angle = -180;
  for (let i = 0; i < rows.length; i++) {
    const sweep = (rows[i].value / total) * 180;
    const slice = createRef<Circle>();
    yield view.add(
      <Circle ref={slice} size={420} stroke={colors[i % colors.length]} lineWidth={90} fill={null} startAngle={angle} endAngle={angle} y={80} lineCap={"butt"} />,
    );
    yield* slice().endAngle(angle + sweep, t.lineDuration, easeOutCubic);
    angle += sweep;
    yield* pause(t.stepDelay);
  }
  yield view.add(<Rect width={440} height={8} fill={"#243044"} y={80} />);
  yield* waitFor(1);
}

function* pieNested(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parseDual(str("data", dual()), dual());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const totA = rows.reduce((s, r) => s + r.a, 0) || 1;
  const totB = rows.reduce((s, r) => s + r.b, 0) || 1;
  let a = -90;
  let b = -90;
  for (let i = 0; i < rows.length; i++) {
    const outer = createRef<Circle>();
    const inner = createRef<Circle>();
    const swA = (rows[i].a / totA) * 360;
    const swB = (rows[i].b / totB) * 360;
    yield view.add(<Circle ref={outer} size={320} stroke={rows[i].colorA} lineWidth={36} fill={null} startAngle={a} endAngle={a} lineCap={"butt"} />);
    yield view.add(<Circle ref={inner} size={200} stroke={rows[i].colorB} lineWidth={28} opacity={0.55} fill={null} startAngle={b} endAngle={b} lineCap={"butt"} />);
    yield* all(
      outer().endAngle(a + swA, t.lineDuration, easeOutCubic),
      inner().endAngle(b + swB, t.lineDuration, easeOutCubic),
    );
    a += swA;
    b += swB;
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* pieKpi(view: any) {
  const { title, accent, t } = setup(view);
  const value = num("value", 72);
  yield* pause(t.startDelay);
  yield* head(view, title);
  const track = createRef<Circle>();
  const fill = createRef<Circle>();
  const n = createRef<Txt>();
  yield view.add(<Circle ref={track} size={280} stroke={"#243044"} lineWidth={28} fill={null} />);
  yield view.add(<Circle ref={fill} size={280} stroke={accent} lineWidth={28} fill={null} startAngle={-90} endAngle={-90} lineCap={"round"} />);
  yield view.add(<Txt ref={n} text={"0%"} fill={"#ffffff"} fontFamily={SERIF} fontSize={56} fontWeight={700} />);
  yield* fill().endAngle(-90 + value * 3.6, t.lineDuration * 1.4, easeOutCubic);
  const steps = 16;
  for (let i = 1; i <= steps; i++) {
    n().text(`${Math.round((value * i) / steps)}%`);
    yield* waitFor(t.lineDuration / steps);
  }
  yield* waitFor(1);
}

function* piePop(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", budget()), budget());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  const colors = palette(accent, rows);
  let angle = -90;
  const extra = itemDelays(rows.length);
  for (let i = 0; i < rows.length; i++) {
    yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const sweep = (rows[i].value / total) * 360;
    const slice = createRef<Circle>();
    yield view.add(
      <Circle ref={slice} size={280} stroke={colors[i % colors.length]} lineWidth={140} fill={null} startAngle={angle} endAngle={angle + sweep} scale={0} lineCap={"butt"} />,
    );
    yield* slice().scale(1, t.revealDuration, easeOutBack);
    angle += sweep;
  }
  yield* waitFor(1);
}

function* pieLabels(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", budget()), budget());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  const colors = palette(accent, rows);
  let angle = -90;
  for (let i = 0; i < rows.length; i++) {
    const sweep = (rows[i].value / total) * 360;
    const mid = ((angle + sweep / 2) * Math.PI) / 180;
    const slice = createRef<Circle>();
    yield view.add(
      <Circle ref={slice} size={220} stroke={colors[i % colors.length]} lineWidth={110} fill={null} startAngle={angle} endAngle={angle} lineCap={"butt"} />,
    );
    yield* slice().endAngle(angle + sweep, t.lineDuration, easeOutCubic);
    const lx = Math.cos(mid) * 250;
    const ly = Math.sin(mid) * 250;
    const stub = createRef<Line>();
    yield view.add(<Line ref={stub} points={[[Math.cos(mid) * 140, Math.sin(mid) * 140], [lx, ly]]} stroke={"#9aa8b8"} lineWidth={2} end={0} />);
    yield* stub().end(1, t.connectDelay + 0.12, easeOutCubic);
    yield view.add(
      <Txt text={`${rows[i].label} ${Math.round((rows[i].value / total) * 100)}%`} fill={"#e8f0ea"} fontFamily={SERIF} fontSize={14} x={lx * 1.12} y={ly * 1.12} />,
    );
    angle += sweep;
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* barRace(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", budget()), budget()).sort((a, b) => b.value - a.value);
  yield* pause(t.startDelay);
  yield* head(view, title);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const extra = itemDelays(rows.length);
  for (let i = 0; i < rows.length; i++) {
    yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const y = -140 + i * 72;
    const w = 80 + (rows[i].value / max) * 560;
    const bar = createRef<Rect>();
    const rank = createRef<Txt>();
    yield view.add(<Txt ref={rank} text={`${i + 1}`} fill={accent} fontFamily={SERIF} fontSize={22} fontWeight={700} x={-480} y={y} opacity={0} />);
    yield view.add(<Txt text={rows[i].label} fill={"#c5d4de"} fontFamily={SERIF} fontSize={16} x={-420} y={y} />);
    yield view.add(<Rect ref={bar} width={0} height={26} fill={rows[i].color} x={-240} y={y} radius={13} />);
    yield* all(
      rank().opacity(1, t.revealDuration, easeOutCubic),
      bar().width(w, t.lineDuration, easeOutCubic),
      bar().x(-240 + w / 2, t.lineDuration, easeOutCubic),
    );
  }
  yield* waitFor(1);
}

function* barLollipop(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", bars()), bars());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const gap = 100;
  const startX = -((rows.length - 1) * gap) / 2;
  yield view.add(<Rect width={rows.length * gap + 40} height={2} fill={"#243044"} y={170} />);
  for (let i = 0; i < rows.length; i++) {
    const h = 40 + (rows[i].value / max) * 220;
    const x = startX + i * gap;
    const stem = createRef<Rect>();
    const headDot = createRef<Circle>();
    yield view.add(<Rect ref={stem} width={4} height={0} fill={rows[i].color} x={x} y={170} />);
    yield view.add(<Circle ref={headDot} size={0} fill={rows[i].color} x={x} y={170} />);
    yield view.add(<Txt text={rows[i].label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={13} x={x} y={198} />);
    yield* all(
      stem().height(h, t.lineDuration, easeOutCubic),
      stem().y(170 - h / 2, t.lineDuration, easeOutCubic),
      headDot().size(22, t.revealDuration, easeOutBack),
      headDot().y(170 - h, t.lineDuration, easeOutCubic),
    );
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* barWaterfall(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", `Start|40\nSales|+18\nCost|-12\nTax|-6\nEnd|40`), `Start|40\nSales|18\nCost|-12\nTax|-6\nEnd|40`);
  yield* pause(t.startDelay);
  yield* head(view, title);
  let running = 0;
  const gap = 88;
  const startX = -((rows.length - 1) * gap) / 2;
  yield view.add(<Rect width={720} height={2} fill={"#243044"} y={170} />);
  for (let i = 0; i < rows.length; i++) {
    const signed = rows[i].value;
    const mag = Math.abs(signed);
    const h = 24 + mag * 3.2;
    const x = startX + i * gap;
    const up = signed >= 0;
    const yBase = 170 - running * 3.2;
    const bar = createRef<Rect>();
    yield view.add(<Rect ref={bar} width={42} height={0} fill={rows[i].color} x={x} y={yBase} radius={3} />);
    yield view.add(<Txt text={rows[i].label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={12} x={x} y={198} />);
    yield* all(bar().height(h, t.lineDuration, easeOutCubic), bar().y(yBase - (up ? h : 0) / (up ? 1 : 1) + (up ? -h / 2 : h / 2), t.lineDuration, easeOutCubic));
    running += signed;
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* barRounded(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", bars()), bars());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const extra = itemDelays(rows.length);
  for (let i = 0; i < rows.length; i++) {
    yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const y = -150 + i * 78;
    const w = 100 + (rows[i].value / max) * 520;
    const bar = createRef<Rect>();
    yield view.add(<Txt text={rows[i].label} fill={"#e8f0ea"} fontFamily={SERIF} fontSize={16} x={-460} y={y} />);
    yield view.add(<Rect width={640} height={36} fill={"#141a22"} x={20} y={y} radius={18} />);
    yield view.add(<Rect ref={bar} width={0} height={36} fill={rows[i].color} x={-300} y={y} radius={18} />);
    yield* all(bar().width(w, t.lineDuration, easeOutCubic), bar().x(-300 + w / 2, t.lineDuration, easeOutCubic));
  }
  yield* waitFor(1);
}

function* barDiverge(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parseDual(str("data", dual()), dual());
  yield* pause(t.startDelay);
  yield* head(view, title);
  yield view.add(<Rect width={4} height={360} fill={"#243044"} />);
  const max = Math.max(...rows.flatMap((r) => [r.a, r.b]), 1);
  for (let i = 0; i < rows.length; i++) {
    const y = -130 + i * 80;
    const wA = 40 + (rows[i].a / max) * 280;
    const wB = 40 + (rows[i].b / max) * 280;
    const a = createRef<Rect>();
    const b = createRef<Rect>();
    yield view.add(<Txt text={rows[i].label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={14} y={y - 28} />);
    yield view.add(<Rect ref={a} width={0} height={22} fill={rows[i].colorA} x={0} y={y} radius={4} />);
    yield view.add(<Rect ref={b} width={0} height={22} fill={rows[i].colorB} x={0} y={y} radius={4} />);
    yield* all(
      a().width(wA, t.lineDuration, easeOutCubic),
      a().x(-wA / 2, t.lineDuration, easeOutCubic),
      b().width(wB, t.lineDuration, easeOutCubic),
      b().x(wB / 2, t.lineDuration, easeOutCubic),
    );
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* barCylinder(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", bars()), bars());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const gap = 96;
  const startX = -((rows.length - 1) * gap) / 2;
  yield view.add(<Rect width={720} height={2} fill={"#243044"} y={170} />);
  for (let i = 0; i < rows.length; i++) {
    const h = 40 + (rows[i].value / max) * 220;
    const x = startX + i * gap;
    const body = createRef<Rect>();
    const cap = createRef<Circle>();
    yield view.add(<Rect ref={body} width={48} height={0} fill={rows[i].color} x={x} y={170} />);
    yield view.add(<Circle ref={cap} width={48} height={16} fill={"#f0d35a"} x={x} y={170} opacity={0} />);
    yield view.add(<Txt text={rows[i].label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={13} x={x} y={198} />);
    yield* all(
      body().height(h, t.lineDuration, easeOutCubic),
      body().y(170 - h / 2, t.lineDuration, easeOutCubic),
      cap().y(170 - h, t.lineDuration, easeOutCubic),
      cap().opacity(1, t.revealDuration, easeOutCubic),
    );
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* dotScatter(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", bars()), bars());
  yield* pause(t.startDelay);
  yield* head(view, title);
  yield view.add(<Rect width={720} height={2} fill={"#243044"} y={160} />);
  yield view.add(<Rect width={2} height={280} fill={"#243044"} x={-360} y={20} />);
  const max = Math.max(...rows.map((r) => r.value), 1);
  for (let i = 0; i < rows.length; i++) {
    const x = -300 + i * 140;
    const y = 140 - (rows[i].value / max) * 240;
    const d = createRef<Circle>();
    yield view.add(<Circle ref={d} size={0} fill={rows[i].color} x={x} y={y} />);
    yield view.add(<Txt text={rows[i].label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={13} x={x} y={188} />);
    yield* d().size(18, t.revealDuration, easeOutBack);
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* dotBubble(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", budget()), budget());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const colors = palette(accent, rows);
  const extra = itemDelays(rows.length);
  for (let i = 0; i < rows.length; i++) {
    yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const size = 48 + (rows[i].value / max) * 140;
    const ang = (i / rows.length) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(ang) * 160;
    const y = Math.sin(ang) * 90 + 20;
    const b = createRef<Circle>();
    yield view.add(<Circle ref={b} size={0} fill={colors[i % colors.length]} opacity={0.82} x={x} y={y} />);
    yield view.add(<Txt text={rows[i].label} fill={"#07080c"} fontFamily={SERIF} fontSize={14} fontWeight={700} x={x} y={y} />);
    yield* b().size(size, t.lineDuration, easeOutBack);
  }
  yield* waitFor(1);
}

function* dotPlot(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", budget()), budget());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const max = Math.max(...rows.map((r) => r.value), 1);
  for (let i = 0; i < rows.length; i++) {
    const y = -140 + i * 72;
    yield view.add(<Txt text={rows[i].label} fill={"#c5d4de"} fontFamily={SERIF} fontSize={16} x={-420} y={y} />);
    yield view.add(<Rect width={560} height={2} fill={"#243044"} x={40} y={y} />);
    const d = createRef<Circle>();
    const x = -240 + (rows[i].value / max) * 520;
    yield view.add(<Circle ref={d} size={0} fill={rows[i].color} x={-240} y={y} />);
    yield* all(d().size(20, t.revealDuration, easeOutBack), d().x(x, t.lineDuration, easeOutCubic));
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* dotConnect(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", bars()), bars());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const w = 720;
  const pts = rows.map((r, i) => {
    const x = -w / 2 + (i / Math.max(rows.length - 1, 1)) * w;
    const y = 140 - (r.value / max) * 250;
    return [x, y] as [number, number];
  });
  yield view.add(<Rect width={w} height={2} fill={"#243044"} y={150} />);
  const line = createRef<Line>();
  yield view.add(<Line ref={line} points={pts} stroke={accent} lineWidth={3} end={0} lineDash={[8, 10]} />);
  yield* line().end(1, t.lineDuration, easeOutCubic);
  for (let i = 0; i < pts.length; i++) {
    const d = createRef<Circle>();
    yield view.add(<Circle ref={d} size={0} fill={rows[i].color} x={pts[i][0]} y={pts[i][1]} />);
    yield* d().size(14, t.revealDuration, easeOutBack);
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* dotGrid(view: any) {
  const { title, accent, t } = setup(view);
  const value = num("value", 37);
  yield* pause(t.startDelay);
  yield* head(view, title);
  const cols = 10;
  const total = 50;
  for (let i = 0; i < total; i++) {
    const x = -270 + (i % cols) * 60;
    const y = -140 + Math.floor(i / cols) * 60;
    const d = createRef<Circle>();
    yield view.add(<Circle ref={d} size={0} fill={i < Math.round(value / 2) ? accent : "#243044"} x={x} y={y} />);
    yield* d().size(28, 0.06, easeOutBack);
  }
  yield view.add(<Txt text={`${value} of 100 units`} fill={"#c5d4de"} fontFamily={SERIF} fontSize={18} y={200} />);
  yield* waitFor(0.8);
}

function* dotRadar(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", budget()), budget());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const n = rows.length;
  const pts: [number, number][] = [];
  for (let r = 1; r <= 3; r++) {
    const ring: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
      ring.push([Math.cos(ang) * r * 70, Math.sin(ang) * r * 70]);
    }
    yield view.add(<Line points={[...ring, ring[0]]} stroke={"#243044"} lineWidth={1} />);
  }
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
    const rad = 40 + (rows[i].value / max) * 170;
    pts.push([Math.cos(ang) * rad, Math.sin(ang) * rad]);
    yield view.add(
      <Txt text={rows[i].label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={13} x={Math.cos(ang) * 230} y={Math.sin(ang) * 230} />,
    );
  }
  const poly = createRef<Line>();
  yield view.add(<Line ref={poly} points={[...pts, pts[0]]} closed fill={accent} opacity={0.22} stroke={accent} lineWidth={3} end={0} />);
  yield* poly().end(1, t.lineDuration, easeOutCubic);
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const d = createRef<Circle>();
    yield view.add(
      <Circle ref={d} size={0} fill={rows[i]?.color || accent} x={p[0]} y={p[1]} />,
    );
    yield* d().size(12, t.revealDuration, easeOutBack);
  }
  yield* waitFor(1);
}

function* dotSpark(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", bars()), bars());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const pts = rows.map((r, i) => [-300 + i * 140, 40 - (r.value / max) * 160] as [number, number]);
  const line = createRef<Line>();
  yield view.add(<Line ref={line} points={pts} stroke={accent} lineWidth={5} end={0} lineCap={"round"} />);
  yield* line().end(1, t.lineDuration, easeOutCubic);
  for (const p of pts) {
    const d = createRef<Circle>();
    yield view.add(<Circle ref={d} size={0} fill={"#ffffff"} stroke={accent} lineWidth={3} x={p[0]} y={p[1]} />);
    yield* d().size(16, t.revealDuration, easeOutBack);
  }
  const last = rows[rows.length - 1];
  yield view.add(<Txt text={String(last.value)} fill={accent} fontFamily={SERIF} fontSize={64} fontWeight={700} x={360} y={20} />);
  yield* waitFor(1);
}

function* stockCandle(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parseCandles(str("data", ohlc()), ohlc());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const lo = Math.min(...rows.map((r) => r.l));
  const hi = Math.max(...rows.map((r) => r.h));
  const span = hi - lo || 1;
  const yOf = (v: number) => 140 - ((v - lo) / span) * 260;
  const gap = 90;
  const startX = -((rows.length - 1) * gap) / 2;
  yield view.add(<Rect width={720} height={2} fill={"#243044"} y={150} />);
  for (let i = 0; i < rows.length; i++) {
    const x = startX + i * gap;
    const up = rows[i].c >= rows[i].o;
    const top = yOf(Math.max(rows[i].o, rows[i].c));
    const bot = yOf(Math.min(rows[i].o, rows[i].c));
    const h = Math.max(8, bot - top);
    const wick = createRef<Rect>();
    const body = createRef<Rect>();
    yield view.add(<Rect ref={wick} width={2} height={0} fill={"#9aa8b8"} x={x} y={yOf(rows[i].h)} />);
    yield view.add(<Rect ref={body} width={28} height={0} fill={up ? "#7ddea2" : "#ff8b7a"} x={x} y={bot} radius={2} />);
    yield view.add(<Txt text={rows[i].label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={13} x={x} y={188} />);
    yield* all(
      wick().height(yOf(rows[i].l) - yOf(rows[i].h), t.lineDuration, easeOutCubic),
      wick().y((yOf(rows[i].l) + yOf(rows[i].h)) / 2, t.lineDuration, easeOutCubic),
      body().height(h, t.lineDuration, easeOutCubic),
      body().y(top + h / 2, t.lineDuration, easeOutCubic),
    );
    yield* pause(t.stepDelay);
  }
  yield view.add(<Txt text={accent ? "OHLC" : ""} fill={"#5ce1ff"} fontFamily={SERIF} fontSize={12} y={-230} />);
  yield* waitFor(1);
}

function* stockOhlc(view: any) {
  const { title, t } = setup(view);
  const rows = parseCandles(str("data", ohlc()), ohlc());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const lo = Math.min(...rows.map((r) => r.l));
  const hi = Math.max(...rows.map((r) => r.h));
  const span = hi - lo || 1;
  const yOf = (v: number) => 140 - ((v - lo) / span) * 260;
  const gap = 90;
  const startX = -((rows.length - 1) * gap) / 2;
  for (let i = 0; i < rows.length; i++) {
    const x = startX + i * gap;
    const up = rows[i].c >= rows[i].o;
    const col = up ? "#7ddea2" : "#ff8b7a";
    const tick = createRef<Rect>();
    yield view.add(<Rect ref={tick} width={2} height={0} fill={col} x={x} y={yOf(rows[i].h)} />);
    yield view.add(<Rect width={0} height={2} fill={col} x={x - 10} y={yOf(rows[i].o)} />);
    const open = createRef<Rect>();
    const close = createRef<Rect>();
    yield view.add(<Rect ref={open} width={0} height={2} fill={col} x={x} y={yOf(rows[i].o)} />);
    yield view.add(<Rect ref={close} width={0} height={2} fill={col} x={x} y={yOf(rows[i].c)} />);
    yield view.add(<Txt text={rows[i].label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={13} x={x} y={188} />);
    yield* all(
      tick().height(yOf(rows[i].l) - yOf(rows[i].h), t.lineDuration, easeOutCubic),
      tick().y((yOf(rows[i].l) + yOf(rows[i].h)) / 2, t.lineDuration, easeOutCubic),
      open().width(14, t.revealDuration, easeOutCubic),
      open().x(x - 7, t.revealDuration, easeOutCubic),
      close().width(14, t.revealDuration, easeOutCubic),
      close().x(x + 7, t.revealDuration, easeOutCubic),
    );
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* stockArea(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parseCandles(str("data", ohlc()), ohlc());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const lo = Math.min(...rows.map((r) => r.l));
  const hi = Math.max(...rows.map((r) => r.h));
  const span = hi - lo || 1;
  const w = 720;
  const pts = rows.map((r, i) => {
    const x = -w / 2 + (i / Math.max(rows.length - 1, 1)) * w;
    const y = 140 - ((r.c - lo) / span) * 250;
    return [x, y] as [number, number];
  });
  const area = createRef<Line>();
  const line = createRef<Line>();
  yield view.add(
    <Line ref={area} points={[...pts, [pts[pts.length - 1][0], 150], [pts[0][0], 150]]} closed fill={accent} opacity={0.22} end={0} />,
  );
  yield view.add(<Line ref={line} points={pts} stroke={accent} lineWidth={4} end={0} />);
  yield* all(area().end(1, t.lineDuration, easeOutCubic), line().end(1, t.lineDuration, easeOutCubic));
  yield* waitFor(1);
}

function* stockVolume(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parseCandles(str("data", ohlc()), ohlc());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const lo = Math.min(...rows.map((r) => r.l));
  const hi = Math.max(...rows.map((r) => r.h));
  const span = hi - lo || 1;
  const w = 720;
  const pts = rows.map((r, i) => [-w / 2 + (i / Math.max(rows.length - 1, 1)) * w, 40 - ((r.c - lo) / span) * 180] as [number, number]);
  const line = createRef<Line>();
  yield view.add(<Line ref={line} points={pts} stroke={accent} lineWidth={3} end={0} />);
  yield* line().end(1, t.lineDuration, easeOutCubic);
  const vmax = Math.max(...rows.map((r) => Math.abs(r.c - r.o)), 1);
  for (let i = 0; i < rows.length; i++) {
    const x = pts[i][0];
    const h = 16 + (Math.abs(rows[i].c - rows[i].o) / vmax) * 70;
    const bar = createRef<Rect>();
    yield view.add(<Rect ref={bar} width={28} height={0} fill={rows[i].color} x={x} y={170} opacity={0.85} />);
    yield* all(bar().height(h, t.revealDuration, easeOutCubic), bar().y(170 - h / 2, t.revealDuration, easeOutCubic));
  }
  yield* waitFor(1);
}

function* stockCompare(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parseDual(str("data", dual()), dual());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const max = Math.max(...rows.flatMap((r) => [r.a, r.b]), 1);
  const w = 720;
  const aPts = rows.map((r, i) => [-w / 2 + (i / Math.max(rows.length - 1, 1)) * w, 140 - (r.a / max) * 240] as [number, number]);
  const bPts = rows.map((r, i) => [-w / 2 + (i / Math.max(rows.length - 1, 1)) * w, 140 - (r.b / max) * 240] as [number, number]);
  const a = createRef<Line>();
  const b = createRef<Line>();
  yield view.add(<Line ref={a} points={aPts} stroke={rows[0]?.colorA || accent} lineWidth={4} end={0} />);
  yield view.add(<Line ref={b} points={bPts} stroke={rows[0]?.colorB || "#5ce1ff"} lineWidth={4} end={0} />);
  yield view.add(<Txt text={str("seriesA", "AAPL")} fill={rows[0]?.colorA || accent} fontFamily={SERIF} fontSize={14} x={-340} y={-230} />);
  yield view.add(<Txt text={str("seriesB", "MSFT")} fill={rows[0]?.colorB || "#5ce1ff"} fontFamily={SERIF} fontSize={14} x={-240} y={-230} />);
  yield* a().end(1, t.lineDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* b().end(1, t.lineDuration, easeOutCubic);
  yield* waitFor(1);
}

function* stockRange(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parseCandles(str("data", ohlc()), ohlc());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const lo = Math.min(...rows.map((r) => r.l));
  const hi = Math.max(...rows.map((r) => r.h));
  const span = hi - lo || 1;
  const w = 720;
  const hiPts = rows.map((r, i) => [-w / 2 + (i / Math.max(rows.length - 1, 1)) * w, 140 - ((r.h - lo) / span) * 250] as [number, number]);
  const loPts = rows.map((r, i) => [-w / 2 + (i / Math.max(rows.length - 1, 1)) * w, 140 - ((r.l - lo) / span) * 250] as [number, number]);
  const mid = rows.map((r, i) => [-w / 2 + (i / Math.max(rows.length - 1, 1)) * w, 140 - ((r.c - lo) / span) * 250] as [number, number]);
  const band = createRef<Line>();
  yield view.add(
    <Line ref={band} points={[...hiPts, ...[...loPts].reverse()]} closed fill={accent} opacity={0.2} end={0} />,
  );
  const line = createRef<Line>();
  yield view.add(<Line ref={line} points={mid} stroke={accent} lineWidth={3} end={0} />);
  yield* all(band().end(1, t.lineDuration, easeOutCubic), line().end(1, t.lineDuration, easeOutCubic));
  yield* waitFor(1);
}

function* stockSpark(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parseCandles(str("data", ohlc()), ohlc());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const last = rows[rows.length - 1];
  const up = last.c >= rows[0].o;
  yield view.add(
    <Txt text={str("ticker", "BEST")} fill={"#ffffff"} fontFamily={SERIF} fontSize={28} fontWeight={700} x={-360} y={-40} />,
  );
  yield view.add(
    <Txt text={last.c.toFixed(1)} fill={up ? "#7ddea2" : "#ff8b7a"} fontFamily={SERIF} fontSize={64} fontWeight={700} x={-300} y={40} />,
  );
  const lo = Math.min(...rows.map((r) => r.l));
  const hi = Math.max(...rows.map((r) => r.h));
  const span = hi - lo || 1;
  const pts = rows.map((r, i) => [80 + i * 70, 40 - ((r.c - lo) / span) * 120] as [number, number]);
  const line = createRef<Line>();
  yield view.add(<Line ref={line} points={pts} stroke={accent} lineWidth={4} end={0} />);
  yield* line().end(1, t.lineDuration, easeOutCubic);
  yield* waitFor(1);
}

function* stockDrawdown(view: any) {
  const { title, t } = setup(view);
  const rows = parseCandles(str("data", ohlc()), ohlc());
  yield* pause(t.startDelay);
  yield* head(view, title);
  let peak = rows[0].c;
  const dd = rows.map((r) => {
    peak = Math.max(peak, r.c);
    return { label: r.label, value: ((r.c - peak) / peak) * 100 };
  });
  const min = Math.min(...dd.map((d) => d.value), -1);
  const w = 720;
  const pts = dd.map((d, i) => [-w / 2 + (i / Math.max(dd.length - 1, 1)) * w, 40 - (d.value / min) * 160] as [number, number]);
  const area = createRef<Line>();
  yield view.add(
    <Line ref={area} points={[...pts, [pts[pts.length - 1][0], 40], [pts[0][0], 40]]} closed fill={"#ff8b7a"} opacity={0.35} end={0} />,
  );
  yield* area().end(1, t.lineDuration, easeOutCubic);
  yield view.add(<Txt text="Drawdown" fill={"#ff8b7a"} fontFamily={SERIF} fontSize={16} y={200} />);
  yield* waitFor(1);
}

function* stockFill(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parseCandles(str("data", ohlc()), ohlc());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const last = rows[rows.length - 1].c;
  const lo = Math.min(...rows.map((r) => r.l), last);
  const hi = Math.max(...rows.map((r) => r.h), last);
  const span = hi - lo || 1;
  const w = 720;
  const yLast = 140 - ((last - lo) / span) * 250;
  const pts = rows.map((r, i) => [-w / 2 + (i / Math.max(rows.length - 1, 1)) * w, 140 - ((r.c - lo) / span) * 250] as [number, number]);
  yield view.add(<Rect width={w} height={2} fill={"#5ce1ff"} y={yLast} opacity={0.5} />);
  const line = createRef<Line>();
  yield view.add(<Line ref={line} points={pts} stroke={accent} lineWidth={4} end={0} />);
  yield* line().end(1, t.lineDuration, easeOutCubic);
  yield view.add(<Txt text={`Last ${last}`} fill={"#5ce1ff"} fontFamily={SERIF} fontSize={16} x={340} y={yLast - 18} />);
  yield* waitFor(1);
}

function* stockTape(view: any) {
  const { title, accent, t } = setup(view);
  yield* pause(t.startDelay);
  yield* head(view, title);
  const quotes = str("quotes", "BEST +1.2%   NVDA +0.8%   AAPL -0.4%   MSFT +0.3%   TSLA +2.1%");
  const strip = createRef<Layout>();
  yield view.add(
    <Layout ref={strip} y={40} x={400}>
      <Rect width={1280} height={64} fill={"#10141c"} />
      <Txt text={quotes} fill={accent} fontFamily={SERIF} fontSize={28} fontWeight={700} />
    </Layout>,
  );
  yield* strip().x(-420, Math.max(t.lineDuration * 2.4, 1.6), easeOutCubic);
  yield* waitFor(0.8);
}

function* revWaterfall(view: any) {
  yield* barWaterfall(view);
}

function* revKpi(view: any) {
  const { title, accent, t } = setup(view);
  const value = num("value", 128);
  const suffix = str("suffix", "M");
  yield* pause(t.startDelay);
  yield* head(view, title);
  const n = createRef<Txt>();
  yield view.add(<Txt ref={n} text={`0${suffix}`} fill={"#ffffff"} fontFamily={SERIF} fontSize={96} fontWeight={700} y={-20} />);
  const steps = 18;
  for (let i = 1; i <= steps; i++) {
    n().text(`${Math.round((value * i) / steps)}${suffix}`);
    yield* waitFor(t.lineDuration / steps);
  }
  yield view.add(<Txt text={str("note", "Annual recurring revenue")} fill={accent} fontFamily={SERIF} fontSize={20} y={90} />);
  yield* waitFor(1);
}

function* revFunnel(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", `Leads|100\nQualified|62\nWon|28`), `Leads|100\nQualified|62\nWon|28`);
  yield* pause(t.startDelay);
  yield* head(view, title);
  const colors = palette(accent, rows);
  for (let i = 0; i < rows.length; i++) {
    const w = 640 - i * 120;
    const y = -100 + i * 100;
    const bar = createRef<Rect>();
    yield view.add(<Rect ref={bar} width={0} height={72} fill={colors[i % colors.length]} y={y} radius={8} />);
    yield view.add(<Txt text={`${rows[i].label}  ${rows[i].value}`} fill={"#07080c"} fontFamily={SERIF} fontSize={20} fontWeight={700} y={y} />);
    yield* bar().width(w, t.lineDuration, easeOutCubic);
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* revYoy(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parseDual(str("data", dual()), dual());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const max = Math.max(...rows.flatMap((r) => [r.a, r.b]), 1);
  const gap = 140;
  const startX = -((rows.length - 1) * gap) / 2;
  yield view.add(<Rect width={720} height={2} fill={"#243044"} y={170} />);
  for (let i = 0; i < rows.length; i++) {
    const x = startX + i * gap;
    const hA = 24 + (rows[i].a / max) * 220;
    const hB = 24 + (rows[i].b / max) * 220;
    const a = createRef<Rect>();
    const b = createRef<Rect>();
    yield view.add(<Rect ref={a} width={28} height={0} fill={rows[i].colorA} x={x - 20} y={170} radius={3} />);
    yield view.add(<Rect ref={b} width={28} height={0} fill={rows[i].colorB} x={x + 20} y={170} radius={3} />);
    yield view.add(<Txt text={rows[i].label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={14} x={x} y={198} />);
    yield* all(
      a().height(hA, t.lineDuration, easeOutCubic),
      a().y(170 - hA / 2, t.lineDuration, easeOutCubic),
      b().height(hB, t.lineDuration, easeOutCubic),
      b().y(170 - hB / 2, t.lineDuration, easeOutCubic),
    );
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* revMix(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parseDual(str("data", dual()), dual());
  yield* pause(t.startDelay);
  yield* head(view, title);
  for (let i = 0; i < rows.length; i++) {
    const y = -130 + i * 80;
    const tot = rows[i].a + rows[i].b || 1;
    const wA = (rows[i].a / tot) * 640;
    const wB = (rows[i].b / tot) * 640;
    const a = createRef<Rect>();
    const b = createRef<Rect>();
    yield view.add(<Txt text={rows[i].label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={14} x={-420} y={y} />);
    yield view.add(<Rect ref={a} width={0} height={28} fill={rows[i].colorA} x={-240} y={y} />);
    yield view.add(<Rect ref={b} width={0} height={28} fill={rows[i].colorB} x={-240} y={y} />);
    yield* a().width(wA, t.lineDuration, easeOutCubic);
    yield* all(a().x(-240 + wA / 2, 0.01), b().width(wB, t.lineDuration, easeOutCubic), b().x(-240 + wA + wB / 2, t.lineDuration, easeOutCubic));
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* revCards(view: any) {
  const { title, accent, t } = setup(view);
  const cards = [
    { k: str("kpi1", "Revenue"), v: str("val1", "$128M"), color: str("color1", accent) },
    { k: str("kpi2", "Margin"), v: str("val2", "34%"), color: str("color2", "#5ce1ff") },
    { k: str("kpi3", "Growth"), v: str("val3", "+18%"), color: str("color3", "#7ddea2") },
  ];
  yield* pause(t.startDelay);
  yield* head(view, title);
  for (let i = 0; i < 3; i++) {
    const card = createRef<Rect>();
    yield view.add(
      <Rect ref={card} width={280} height={200} fill={"#121820"} radius={12} x={-300 + i * 300} y={20} scale={0} layout direction={"column"} alignItems={"center"} justifyContent={"center"} gap={12} padding={24}>
        <Txt text={cards[i].k} fill={cards[i].color} fontFamily={SERIF} fontSize={16} letterSpacing={3} />
        <Txt text={cards[i].v} fill={"#ffffff"} fontFamily={SERIF} fontSize={40} fontWeight={700} />
      </Rect>,
    );
    yield* card().scale(1, t.revealDuration, easeOutBack);
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* revBullet(view: any) {
  const { title, accent, t } = setup(view);
  const actual = num("value", 72);
  const target = num("target", 90);
  yield* pause(t.startDelay);
  yield* head(view, title);
  yield view.add(<Rect width={720} height={28} fill={"#1a222c"} y={20} radius={4} />);
  const tgt = createRef<Rect>();
  const act = createRef<Rect>();
  yield view.add(<Rect ref={tgt} width={4} height={48} fill={"#ffffff"} x={-360 + (target / 100) * 720} y={20} opacity={0} />);
  yield view.add(<Rect ref={act} width={0} height={18} fill={accent} x={-360} y={20} radius={3} />);
  const w = (actual / 100) * 720;
  yield* all(
    act().width(w, t.lineDuration, easeOutCubic),
    act().x(-360 + w / 2, t.lineDuration, easeOutCubic),
    tgt().opacity(1, t.revealDuration, easeOutCubic),
  );
  yield view.add(<Txt text={`Actual ${actual}  ·  Target ${target}`} fill={"#c5d4de"} fontFamily={SERIF} fontSize={18} y={80} />);
  yield* waitFor(1);
}

function* revRunrate(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", bars()), bars());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const gap = 92;
  const startX = -((rows.length - 1) * gap) / 2;
  const pts: [number, number][] = [];
  yield view.add(<Rect width={720} height={2} fill={"#243044"} y={170} />);
  for (let i = 0; i < rows.length; i++) {
    const h = 24 + (rows[i].value / max) * 200;
    const x = startX + i * gap;
    pts.push([x, 170 - h]);
    const bar = createRef<Rect>();
    yield view.add(<Rect ref={bar} width={36} height={0} fill={"#243044"} x={x} y={170} radius={3} />);
    yield* all(bar().height(h, t.lineDuration, easeOutCubic), bar().y(170 - h / 2, t.lineDuration, easeOutCubic));
    yield view.add(<Txt text={rows[i].label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={13} x={x} y={198} />);
  }
  const line = createRef<Line>();
  yield view.add(<Line ref={line} points={pts} stroke={accent} lineWidth={4} end={0} />);
  yield* line().end(1, t.lineDuration, easeOutCubic);
  yield* waitFor(1);
}

function* revTreemap(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", budget()), budget());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const colors = palette(accent, rows);
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  let x = -360;
  for (let i = 0; i < rows.length; i++) {
    const w = 80 + (rows[i].value / total) * 640;
    const block = createRef<Rect>();
    yield view.add(
      <Rect ref={block} width={0} height={280} fill={colors[i % colors.length]} x={x} y={20} radius={6} opacity={0.92} />,
    );
    yield* all(block().width(w - 8, t.lineDuration, easeOutCubic), block().x(x + (w - 8) / 2, t.lineDuration, easeOutCubic));
    yield view.add(
      <Txt text={rows[i].label} fill={"#07080c"} fontFamily={SERIF} fontSize={16} fontWeight={700} x={x + (w - 8) / 2} y={20} />,
    );
    x += w;
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* pieSpin(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", budget()), budget());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  const colors = palette(accent, rows);
  const wrap = createRef<Layout>();
  yield view.add(<Layout ref={wrap} layout={false} y={24} rotation={-28} />);
  let angle = -90;
  const extra = itemDelays(rows.length);
  for (let i = 0; i < rows.length; i++) {
    yield* pause(extra[i]);
    const sweep = (rows[i].value / total) * 360;
    const mid = ((angle + sweep / 2) * Math.PI) / 180;
    const slice = createRef<Circle>();
    yield wrap().add(
      <Circle
        ref={slice}
        size={40}
        stroke={colors[i % colors.length]}
        lineWidth={18}
        fill={null}
        startAngle={angle}
        endAngle={angle}
        lineCap={"butt"}
      />,
    );
    yield* all(
      slice().endAngle(angle + sweep, t.lineDuration, easeOutCubic),
      slice().size(280, t.lineDuration, easeOutCubic),
      slice().lineWidth(128, t.lineDuration, easeOutCubic),
    );
    yield wrap().add(
      <Txt
        text={rows[i].label}
        fill={"#e8f0ea"}
        fontFamily={SERIF}
        fontSize={14}
        x={Math.cos(mid) * 210}
        y={Math.sin(mid) * 210}
      />,
    );
    angle += sweep;
    yield* pause(t.stepDelay);
  }
  yield* wrap().rotation(0, t.revealDuration * 1.4, easeOutCubic);
  yield* waitFor(1);
}

function* ringStack(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", budget()), budget());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const colors = palette(accent, rows);
  for (let i = 0; i < rows.length; i++) {
    const size = 320 - i * 48;
    const track = createRef<Circle>();
    const fill = createRef<Circle>();
    const label = createRef<Txt>();
    yield view.add(<Circle ref={track} size={size} stroke={"#243044"} lineWidth={14} fill={null} y={20} />);
    yield view.add(
      <Circle
        ref={fill}
        size={size}
        stroke={colors[i % colors.length]}
        lineWidth={14}
        fill={null}
        startAngle={-90}
        endAngle={-90}
        lineCap={"round"}
        y={20}
      />,
    );
    yield view.add(
      <Txt
        ref={label}
        text={`${rows[i].label}  ${rows[i].value}`}
        fill={"#e8f0ea"}
        fontFamily={SERIF}
        fontSize={15}
        x={210}
        y={-90 + i * 42}
        opacity={0}
      />,
    );
    yield* all(
      fill().endAngle(-90 + (rows[i].value / max) * 360, t.lineDuration, easeOutCubic),
      label().opacity(1, t.revealDuration, easeOutCubic),
    );
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* barRipple(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", bars()), bars());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const gap = 92;
  const startX = -((rows.length - 1) * gap) / 2;
  const colors = palette(accent, rows);
  yield view.add(<Rect width={720} height={2} fill={"#243044"} y={170} />);
  const extra = itemDelays(rows.length);
  for (let i = 0; i < rows.length; i++) {
    yield* pause(extra[i]);
    const h = 36 + (rows[i].value / max) * 220;
    const x = startX + i * gap;
    const glow = createRef<Rect>();
    const bar = createRef<Rect>();
    yield view.add(
      <Rect ref={glow} width={28} height={0} fill={colors[i % colors.length]} x={x} y={170} radius={8} opacity={0.22} />,
    );
    yield view.add(
      <Rect ref={bar} width={22} height={0} fill={colors[i % colors.length]} x={x} y={170} radius={7} />,
    );
    yield* all(
      bar().height(h, t.lineDuration, easeOutBack),
      bar().y(170 - h / 2, t.lineDuration, easeOutBack),
      glow().height(h + 28, t.lineDuration, easeOutCubic),
      glow().y(170 - (h + 28) / 2, t.lineDuration, easeOutCubic),
    );
    yield view.add(
      <Txt text={rows[i].label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={13} x={x} y={198} />,
    );
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* barMirror(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", bars()), bars());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const gap = 96;
  const startX = -((rows.length - 1) * gap) / 2;
  const colors = palette(accent, rows);
  yield view.add(<Rect width={740} height={2} fill={"#2a3a48"} y={40} />);
  for (let i = 0; i < rows.length; i++) {
    const h = 28 + (rows[i].value / max) * 170;
    const x = startX + i * gap;
    const up = createRef<Rect>();
    const down = createRef<Rect>();
    yield view.add(<Rect ref={up} width={38} height={0} fill={colors[i % colors.length]} x={x} y={40} radius={[8, 8, 2, 2]} />);
    yield view.add(
      <Rect ref={down} width={38} height={0} fill={colors[i % colors.length]} x={x} y={40} radius={[2, 2, 8, 8]} opacity={0.28} />,
    );
    yield* all(
      up().height(h, t.lineDuration, easeOutCubic),
      up().y(40 - h / 2, t.lineDuration, easeOutCubic),
      down().height(h * 0.55, t.lineDuration, easeOutCubic),
      down().y(40 + (h * 0.55) / 2, t.lineDuration, easeOutCubic),
    );
    yield view.add(
      <Txt text={rows[i].label} fill={"#c5d4de"} fontFamily={SERIF} fontSize={13} x={x} y={-160} />,
    );
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* lineGlow(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", bars()), bars());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const gap = 140;
  const startX = -((rows.length - 1) * gap) / 2;
  const pts: [number, number][] = rows.map((row, i) => [
    startX + i * gap,
    150 - (row.value / max) * 220,
  ]);
  const areaPts: [number, number][] = [...pts, [pts[pts.length - 1][0], 170], [pts[0][0], 170]];
  yield view.add(<Rect width={760} height={2} fill={"#243044"} y={170} />);
  const fill = createRef<Line>();
  const line = createRef<Line>();
  const comet = createRef<Circle>();
  yield view.add(
    <Line ref={fill} points={areaPts} fill={accent} opacity={0} closed />,
  );
  yield view.add(<Line ref={line} points={pts} stroke={accent} lineWidth={5} end={0} />);
  yield view.add(<Circle ref={comet} size={18} fill={"#ffffff"} x={pts[0][0]} y={pts[0][1]} opacity={0} />);
  comet().opacity(1);
  yield* line().end(1, t.lineDuration * 1.6, easeOutCubic);
  for (let i = 1; i < pts.length; i++) {
    yield* all(comet().x(pts[i][0], t.stepDelay + 0.08), comet().y(pts[i][1], t.stepDelay + 0.08));
  }
  yield* fill().opacity(0.22, t.revealDuration, easeOutCubic);
  for (let i = 0; i < rows.length; i++) {
    yield view.add(
      <Txt text={rows[i].label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={14} x={pts[i][0]} y={198} />,
    );
  }
  yield* waitFor(1);
}

function* heatGrid(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", budget()), budget());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const cols = Math.min(4, rows.length);
  const cell = 118;
  const startX = -((cols - 1) * (cell + 16)) / 2;
  const extra = itemDelays(rows.length);
  for (let i = 0; i < rows.length; i++) {
    yield* pause(extra[i]);
    const c = i % cols;
    const r = Math.floor(i / cols);
    const strength = rows[i].value / max;
    const box = createRef<Rect>();
    yield view.add(
      <Rect
        ref={box}
        width={cell}
        height={cell}
        fill={rows[i].color}
        x={startX + c * (cell + 16)}
        y={-40 + r * (cell + 16)}
        radius={14}
        opacity={0}
        scale={0.7}
      />,
    );
    yield* all(
      box().opacity(0.22 + strength * 0.78, t.revealDuration, easeOutCubic),
      box().scale(1, t.revealDuration, easeOutBack),
    );
    yield view.add(
      <Txt
        text={rows[i].label}
        fill={"#07080c"}
        fontFamily={SERIF}
        fontSize={16}
        fontWeight={700}
        x={startX + c * (cell + 16)}
        y={-40 + r * (cell + 16)}
      />,
    );
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* orbitDots(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", budget()), budget());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const colors = palette(accent, rows);
  yield view.add(<Circle size={280} stroke={"#243044"} lineWidth={2} fill={null} y={20} />);
  const extra = itemDelays(rows.length);
  for (let i = 0; i < rows.length; i++) {
    yield* pause(extra[i]);
    const ang = (-90 + (i / rows.length) * 360) * (Math.PI / 180);
    const x = Math.cos(ang) * 140;
    const y = 20 + Math.sin(ang) * 140;
    const dot = createRef<Circle>();
    const label = createRef<Txt>();
    yield view.add(<Circle ref={dot} size={18} fill={colors[i % colors.length]} x={0} y={20} scale={0} />);
    yield view.add(
      <Txt
        ref={label}
        text={`${rows[i].label} ${rows[i].value}`}
        fill={"#e8f0ea"}
        fontFamily={SERIF}
        fontSize={15}
        x={Math.cos(ang) * 210}
        y={20 + Math.sin(ang) * 210}
        opacity={0}
      />,
    );
    yield* all(
      dot().scale(1, t.revealDuration, easeOutBack),
      dot().x(x, t.lineDuration, easeOutCubic),
      dot().y(y, t.lineDuration, easeOutCubic),
      label().opacity(1, t.revealDuration, easeOutCubic),
    );
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

function* revArcs(view: any) {
  const { title, accent, t } = setup(view);
  const rows = parsePairs(str("data", budget()), budget());
  yield* pause(t.startDelay);
  yield* head(view, title);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const colors = palette(accent, rows);
  for (let i = 0; i < rows.length; i++) {
    const size = 420 - i * 52;
    const track = createRef<Circle>();
    const fill = createRef<Circle>();
    yield view.add(
      <Circle ref={track} size={size} stroke={"#243044"} lineWidth={18} fill={null} startAngle={-180} endAngle={0} y={90} lineCap={"round"} />,
    );
    yield view.add(
      <Circle
        ref={fill}
        size={size}
        stroke={colors[i % colors.length]}
        lineWidth={18}
        fill={null}
        startAngle={-180}
        endAngle={-180}
        y={90}
        lineCap={"round"}
      />,
    );
    yield* fill().endAngle(-180 + (rows[i].value / max) * 180, t.lineDuration, easeOutCubic);
    yield view.add(
      <Txt
        text={rows[i].label}
        fill={"#e8f0ea"}
        fontFamily={SERIF}
        fontSize={14}
        x={-240}
        y={90 - size / 2 + 8}
      />,
    );
    yield* pause(t.stepDelay);
  }
  yield* waitFor(1);
}

const MAP: Record<string, (view: any) => any> = {
  "chart-pie-explode": pieExplode,
  "chart-pie-legend": pieLegend,
  "chart-pie-half": pieHalf,
  "chart-pie-nested": pieNested,
  "chart-pie-kpi": pieKpi,
  "chart-pie-pop": piePop,
  "chart-pie-labels": pieLabels,
  "chart-bar-race": barRace,
  "chart-bar-lollipop": barLollipop,
  "chart-bar-waterfall": barWaterfall,
  "chart-bar-rounded": barRounded,
  "chart-bar-diverge": barDiverge,
  "chart-bar-cylinder": barCylinder,
  "chart-dot-scatter": dotScatter,
  "chart-dot-bubble": dotBubble,
  "chart-dot-plot": dotPlot,
  "chart-dot-connect": dotConnect,
  "chart-dot-grid": dotGrid,
  "chart-dot-radar": dotRadar,
  "chart-dot-spark": dotSpark,
  "chart-stock-candle": stockCandle,
  "chart-stock-ohlc": stockOhlc,
  "chart-stock-area": stockArea,
  "chart-stock-volume": stockVolume,
  "chart-stock-compare": stockCompare,
  "chart-stock-range": stockRange,
  "chart-stock-spark": stockSpark,
  "chart-stock-drawdown": stockDrawdown,
  "chart-stock-fill": stockFill,
  "chart-stock-tape": stockTape,
  "chart-rev-waterfall": revWaterfall,
  "chart-rev-kpi": revKpi,
  "chart-rev-funnel": revFunnel,
  "chart-rev-yoy": revYoy,
  "chart-rev-mix": revMix,
  "chart-rev-cards": revCards,
  "chart-rev-bullet": revBullet,
  "chart-rev-runrate": revRunrate,
  "chart-rev-treemap": revTreemap,
  "chart-pie-spin": pieSpin,
  "chart-ring-stack": ringStack,
  "chart-bar-ripple": barRipple,
  "chart-bar-mirror": barMirror,
  "chart-line-glow": lineGlow,
  "chart-heat-grid": heatGrid,
  "chart-orbit": orbitDots,
  "chart-rev-arcs": revArcs,
};

export function* runChartVariant(view: any, template: string) {
  const run = MAP[template];
  if (run) {
    yield* run(view);
    return;
  }
  yield* pieExplode(view);
}
