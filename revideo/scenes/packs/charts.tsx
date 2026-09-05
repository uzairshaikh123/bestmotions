/** @jsxImportSource @revideo/2d/lib */
import { Circle, Layout, Line, Rect, Txt } from "@revideo/2d";
import {
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
import { blendPhrase, paintBlend } from "../../lib/highlight";
import { itemDelays, pause, timing } from "../../lib/timing";

const SERIF = "Libre Baskerville, Georgia, serif";

function fallbackBars() {
  return `2019|42
2020|55
2021|61
2022|48
2023|70`;
}

function fallbackBudget() {
  return `Health|32
Education|24
Defense|18
Other|26`;
}

function fallbackSeries() {
  return `2019|40|28
2020|48|30
2021|55|33
2022|52|36`;
}

function* titleTop(view: any, title: string, accent: string) {
  const t = timing();
  const titleRef = createRef<Txt>();
  yield view.add(
    <Txt ref={titleRef} text={title} fill={"#ffffff"} fontFamily={SERIF} fontSize={26} fontWeight={700} y={-280} opacity={0} />,
  );
  yield* titleRef().opacity(1, t.revealDuration, easeOutCubic);
}

function* verticalBars(view: any) {
  const title = str("title", "Year-over-year growth");
  const accent = str("accent", "#d8a11a");
  const bg = str("bg", "#07080c");
  const rows = parsePairs(str("data", fallbackBars()), fallbackBars());
  const t = timing();
  view.fill(bg);
  yield* pause(t.startDelay);
  yield* titleTop(view, title, accent);

  const max = Math.max(...rows.map((r) => r.value), 1);
  const gap = 92;
  const startX = -((rows.length - 1) * gap) / 2;
  const extra = itemDelays(rows.length);
  yield view.add(<Rect width={rows.length * gap + 40} height={2} fill={"#243044"} y={170} />);

  for (let i = 0; i < rows.length; i++) {
    yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const h = 28 + (rows[i].value / max) * 240;
    const x = startX + i * gap;
    const bar = createRef<Rect>();
    yield view.add(<Rect ref={bar} width={48} height={0} fill={rows[i].color} x={x} y={170} radius={4} />);
    yield view.add(
      <Txt text={rows[i].label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={13} x={x} y={198} />,
    );
    yield* all(bar().height(h, t.lineDuration, easeOutCubic), bar().y(170 - h / 2, t.lineDuration, easeOutCubic));
    yield* pause(t.connectDelay);
  }
  yield* waitFor(1.1);
}

function* horizontalBars(view: any) {
  const title = str("title", "Category ranking");
  const accent = str("accent", "#5ce1ff");
  const bg = str("bg", "#07080c");
  const rows = parsePairs(str("data", fallbackBudget()), fallbackBudget());
  const t = timing();
  view.fill(bg);
  yield* pause(t.startDelay);
  yield* titleTop(view, title, accent);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const extra = itemDelays(rows.length);
  for (let i = 0; i < rows.length; i++) {
    yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const y = -140 + i * 80;
    const w = 80 + (rows[i].value / max) * 520;
    const bar = createRef<Rect>();
    yield view.add(
      <Txt text={rows[i].label} fill={"#c5d4de"} fontFamily={SERIF} fontSize={16} x={-420} y={y} />,
    );
    yield view.add(<Rect ref={bar} width={0} height={28} fill={rows[i].color} x={-240} y={y} radius={4} />);
    yield* all(bar().width(w, t.lineDuration, easeOutCubic), bar().x(-240 + w / 2, t.lineDuration, easeOutCubic));
    yield* pause(t.connectDelay);
  }
  yield* waitFor(1.1);
}

function* lineChart(view: any, filled: boolean) {
  const title = str("title", filled ? "Area trend" : "Trend over time");
  const accent = str("accent", filled ? "#7ddea2" : "#5ce1ff");
  const bg = str("bg", "#07080c");
  const rows = parsePairs(str("data", fallbackBars()), fallbackBars());
  const t = timing();
  view.fill(bg);
  yield* pause(t.startDelay);
  yield* titleTop(view, title, accent);

  const max = Math.max(...rows.map((r) => r.value), 1);
  const w = 720;
  const startX = -w / 2;
  const pts = rows.map((r, i) => {
    const x = startX + (i / Math.max(rows.length - 1, 1)) * w;
    const y = 140 - (r.value / max) * 260;
    return [x, y] as [number, number];
  });
  yield view.add(<Rect width={w} height={2} fill={"#243044"} y={150} />);
  if (filled && pts.length) {
    const area = createRef<Line>();
    yield view.add(
      <Line
        ref={area}
        points={[...pts, [pts[pts.length - 1][0], 150], [pts[0][0], 150]]}
        closed
        fill={accent}
        opacity={0.28}
        end={0}
      />,
    );
    yield* pause(t.connectDelay);
    yield* area().end(1, t.lineDuration, easeOutCubic);
  }
  const line = createRef<Line>();
  yield view.add(
    <Line ref={line} points={pts} stroke={accent} lineWidth={4} end={0} lineCap={"round"} />,
  );
  yield* pause(t.connectDelay);
  yield* line().end(1, t.lineDuration, easeOutCubic);
  yield* waitFor(1.1);
}

function* pieChart(view: any, donut: boolean) {
  const title = str("title", donut ? "Share of total" : "Budget allocation");
  const accent = str("accent", donut ? "#5ce1ff" : "#d8a11a");
  const bg = str("bg", "#07080c");
  const rows = parsePairs(str("data", fallbackBudget()), fallbackBudget());
  const t = timing();
  view.fill(bg);
  yield* pause(t.startDelay);
  yield* titleTop(view, title, accent);

  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  const colors = palette(accent, rows);
  let angle = -90;
  const extra = itemDelays(rows.length);
  yield view.add(
    <Circle
      size={donut ? 210 : 0}
      fill={str("bgTransparent", "off") === "on" ? null : bg}
    />,
  );
  for (let i = 0; i < rows.length; i++) {
    yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const sweep = (rows[i].value / total) * 360;
    const slice = createRef<Circle>();
    yield view.add(
      <Circle
        ref={slice}
        size={280}
        stroke={colors[i % colors.length]}
        lineWidth={donut ? 52 : 140}
        fill={null}
        startAngle={angle}
        endAngle={angle}
        lineCap={"butt"}
      />,
    );
    yield* slice().endAngle(angle + sweep, t.lineDuration, easeOutCubic);
    const mid = ((angle + sweep / 2) * Math.PI) / 180;
    yield view.add(
      <Txt
        text={rows[i].label}
        fill={"#e8f0ea"}
        fontFamily={SERIF}
        fontSize={14}
        x={Math.cos(mid) * (donut ? 210 : 200)}
        y={Math.sin(mid) * (donut ? 210 : 200)}
      />,
    );
    angle += sweep;
    yield* pause(t.connectDelay);
  }
  yield* waitFor(1.1);
}

function* gauge(view: any) {
  const title = str("title", "Completion");
  const label = str("label", "Target met");
  const value = Math.min(100, Math.max(0, num("value", 72)));
  const accent = str("accent", "#d8a11a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  yield* pause(t.startDelay);
  yield* titleTop(view, title, accent);
  yield view.add(<Circle size={300} stroke={"#1a2a38"} lineWidth={22} fill={null} startAngle={-210} endAngle={30} />);
  const arc = createRef<Circle>();
  const pct = createRef<Txt>();
  yield view.add(
    <Circle ref={arc} size={300} stroke={accent} lineWidth={22} fill={null} startAngle={-210} endAngle={-210} lineCap={"round"} />,
  );
  yield view.add(
    <Txt ref={pct} text={"0%"} fill={"#ffffff"} fontFamily={SERIF} fontSize={64} fontWeight={700} />,
  );
  yield view.add(
    <Txt text={label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={16} y={200} />,
  );
  yield* pause(t.connectDelay);
  const steps = 18;
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    pct().text(`${Math.round(value * p)}%`);
    yield* arc().endAngle(-210 + 240 * (value / 100) * p, t.lineDuration / steps, easeOutCubic);
  }
  yield* waitFor(1.1);
}

function* groupedBars(view: any) {
  const title = str("title", "Urban vs rural");
  const aName = str("seriesA", "Urban");
  const bName = str("seriesB", "Rural");
  const accent = str("accent", "#d8a11a");
  const bg = str("bg", "#07080c");
  const rows = parseDual(str("data", fallbackSeries()), fallbackSeries());
  const t = timing();
  view.fill(bg);
  yield* pause(t.startDelay);
  yield* titleTop(view, title, accent);
  const max = Math.max(...rows.flatMap((r) => [r.a, r.b]), 1);
  const extra = itemDelays(rows.length);
  const gap = 150;
  const startX = -((rows.length - 1) * gap) / 2;
  for (let i = 0; i < rows.length; i++) {
    yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const x = startX + i * gap;
    const ha = 24 + (rows[i].a / max) * 220;
    const hb = 24 + (rows[i].b / max) * 220;
    const a = createRef<Rect>();
    const b = createRef<Rect>();
    yield view.add(<Rect ref={a} width={36} height={0} fill={rows[i].colorA} x={x - 22} y={150} />);
    yield view.add(<Rect ref={b} width={36} height={0} fill={rows[i].colorB} x={x + 22} y={150} />);
    yield view.add(
      <Txt text={rows[i].label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={14} x={x} y={180} />,
    );
    yield* all(
      a().height(ha, t.lineDuration, easeOutCubic),
      a().y(150 - ha / 2, t.lineDuration, easeOutCubic),
    );
    yield* pause(t.connectDelay);
    yield* all(
      b().height(hb, t.lineDuration, easeOutCubic),
      b().y(150 - hb / 2, t.lineDuration, easeOutCubic),
    );
  }
  yield view.add(
    <Txt text={`${aName}  /  ${bName}`} fill={"#c5d4de"} fontFamily={SERIF} fontSize={14} y={230} />,
  );
  yield* waitFor(1.1);
}

function* stackedBars(view: any) {
  const title = str("title", "Stacked composition");
  const accent = str("accent", "#c089ff");
  const bg = str("bg", "#07080c");
  const rows = parseDual(str("data", fallbackSeries()), fallbackSeries());
  const t = timing();
  view.fill(bg);
  yield* pause(t.startDelay);
  yield* titleTop(view, title, accent);
  const max = Math.max(...rows.map((r) => r.a + r.b), 1);
  const extra = itemDelays(rows.length);
  const gap = 110;
  const startX = -((rows.length - 1) * gap) / 2;
  for (let i = 0; i < rows.length; i++) {
    yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const x = startX + i * gap;
    const ha = (rows[i].a / max) * 280;
    const hb = (rows[i].b / max) * 280;
    const a = createRef<Rect>();
    const b = createRef<Rect>();
    yield view.add(<Rect ref={a} width={52} height={0} fill={rows[i].colorA} x={x} y={160} />);
    yield view.add(<Rect ref={b} width={52} height={0} fill={rows[i].colorB} x={x} y={160} />);
    yield view.add(
      <Txt text={rows[i].label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={14} x={x} y={190} />,
    );
    yield* all(a().height(ha, t.lineDuration, easeOutCubic), a().y(160 - ha / 2, t.lineDuration, easeOutCubic));
    yield* pause(t.connectDelay);
    yield* all(b().height(hb, t.lineDuration, easeOutCubic), b().y(160 - ha - hb / 2, t.lineDuration, easeOutCubic));
  }
  yield* waitFor(1.1);
}

function* multiLine(view: any) {
  const title = str("title", "Comparing trends");
  const accent = str("accent", "#ff8b7a");
  const bg = str("bg", "#07080c");
  const rows = parseDual(str("data", fallbackSeries()), fallbackSeries());
  const t = timing();
  view.fill(bg);
  yield* pause(t.startDelay);
  yield* titleTop(view, title, accent);
  const max = Math.max(...rows.flatMap((r) => [r.a, r.b]), 1);
  const w = 720;
  const startX = -w / 2;
  const aPts = rows.map((r, i) => {
    const x = startX + (i / Math.max(rows.length - 1, 1)) * w;
    return [x, 140 - (r.a / max) * 250] as [number, number];
  });
  const bPts = rows.map((r, i) => {
    const x = startX + (i / Math.max(rows.length - 1, 1)) * w;
    return [x, 140 - (r.b / max) * 250] as [number, number];
  });
  const a = createRef<Line>();
  const b = createRef<Line>();
  yield view.add(<Line ref={a} points={aPts} stroke={accent} lineWidth={4} end={0} />);
  yield view.add(<Line ref={b} points={bPts} stroke={"#5ce1ff"} lineWidth={4} end={0} />);
  yield* pause(t.connectDelay);
  yield* a().end(1, t.lineDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* b().end(1, t.lineDuration, easeOutCubic);
  yield* waitFor(1.1);
}

function* statCounter(view: any) {
  const label = str("label", "People affected");
  const value = num("value", 75);
  const suffix = str("suffix", "%");
  const note = str("note", "Across major cities in 2024");
  const highlight = str("highlight", "2024");
  const accent = str("accent", "#d8a11a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  const lab = createRef<Txt>();
  const numRef = createRef<Txt>();
  const rule = createRef<Rect>();
  const noteRef = createRef<Layout>();
  const mark = createRef<Rect>();
  yield view.add(
    <Txt ref={lab} text={label.toUpperCase()} fill={accent} fontFamily={SERIF} fontSize={16} letterSpacing={6} y={-180} opacity={0} />,
  );
  yield view.add(
    <Txt ref={numRef} text={`0${suffix}`} fill={"#ffffff"} fontFamily={SERIF} fontSize={120} fontWeight={700} opacity={0} />,
  );
  yield view.add(<Rect ref={rule} width={0} height={6} fill={accent} y={90} />);
  yield view.add(
    <Layout ref={noteRef} y={140} opacity={0}>
      {blendPhrase(note, highlight, mark, {
        font: SERIF,
        size: 18,
        fill: "#c5d4de",
        marker: str("markerColor", "#FAFF00"),
        align: "center",
        width: 900,
      })}
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* lab().opacity(1, t.revealDuration, easeOutCubic);
  yield* numRef().opacity(1, t.revealDuration, easeOutCubic);
  const steps = 20;
  for (let i = 1; i <= steps; i++) {
    numRef().text(`${Math.round((value * i) / steps)}${suffix}`);
    yield* waitFor(t.lineDuration / steps);
  }
  yield* pause(t.connectDelay);
  yield* rule().width(320, t.lineDuration, easeOutCubic);
  yield* noteRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* paintBlend(mark, highlight, 18, t.lineDuration);
  yield* waitFor(1.2);
}

function* miniTimeline(view: any) {
  const accent = str("accent", "#d8a11a");
  const bg = str("bg", "#07080c");
  const beats = [
    { year: str("year1", "2019"), event: str("event1", "Policy draft"), color: str("color1", accent) },
    { year: str("year2", "2022"), event: str("event2", "Public backlash"), color: str("color2", "#5ce1ff") },
    { year: str("year3", "2025"), event: str("event3", "Reform passed"), color: str("color3", "#7ddea2") },
  ];
  const t = timing();
  view.fill(bg);
  yield* pause(t.startDelay);
  yield view.add(<Rect width={720} height={4} fill={"#243044"} y={20} />);
  const extra = itemDelays(3);
  const xs = [-300, 0, 300];
  for (let i = 0; i < 3; i++) {
    yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const node = createRef<Rect>();
    yield view.add(<Rect ref={node} width={18} height={18} fill={beats[i].color} rotation={45} x={xs[i]} y={20} scale={0} />);
    yield view.add(
      <Txt text={beats[i].year} fill={beats[i].color} fontFamily={SERIF} fontSize={16} x={xs[i]} y={-40} />,
    );
    yield view.add(
      <Txt text={beats[i].event} fill={"#ffffff"} fontFamily={SERIF} fontSize={18} fontWeight={700} x={xs[i]} y={90} width={200} textAlign={"center"} textWrap />,
    );
    yield* node().scale(1, t.revealDuration, easeOutBack);
    if (i < 2) {
      yield* pause(t.connectDelay);
      const seg = createRef<Rect>();
      yield view.add(<Rect ref={seg} width={0} height={4} fill={beats[i].color} x={xs[i]} y={20} />);
      yield* all(seg().width(300, t.lineDuration, easeOutCubic), seg().x(xs[i] + 150, t.lineDuration, easeOutCubic));
    }
  }
  yield* waitFor(1.2);
}

export function* runCharts(view: any, template: string) {
  switch (template) {
    case "d3-bar":
      yield* verticalBars(view);
      break;
    case "d3-hbar":
      yield* horizontalBars(view);
      break;
    case "d3-line":
      yield* lineChart(view, false);
      break;
    case "d3-area":
      yield* lineChart(view, true);
      break;
    case "d3-pie":
      yield* pieChart(view, false);
      break;
    case "d3-donut":
      yield* pieChart(view, true);
      break;
    case "d3-gauge":
      yield* gauge(view);
      break;
    case "d3-grouped-bar":
      yield* groupedBars(view);
      break;
    case "d3-stacked-bar":
      yield* stackedBars(view);
      break;
    case "d3-multi-line":
      yield* multiLine(view);
      break;
    case "stat-counter":
      yield* statCounter(view);
      break;
    case "timeline":
      yield* miniTimeline(view);
      break;
    default:
      yield* verticalBars(view);
  }
}
