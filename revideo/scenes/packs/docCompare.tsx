/** @jsxImportSource @revideo/2d/lib */
import { Circle, Layout, Line, Rect, Txt } from "@revideo/2d";
import {
  SERIF,
  SANS,
  colors,
  fadeInTxt,
  countText,
  hold,
  all,
  createRef,
  easeOutCubic,
  easeOutBack,
  waitFor,
  pause,
} from "../../lib/docKit";

type Gen = (view: any) => Generator;

function* cmpVsBattle(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const left = createRef<Rect>();
  const right = createRef<Rect>();
  yield view.add(<Rect ref={left} width={200} height={280} fill={"#1e293b"} x={-700} y={20} radius={12} />);
  yield view.add(<Rect ref={right} width={200} height={280} fill={"#1e293b"} x={700} y={20} radius={12} />);
  yield* all(left().x(-260, 0.5, easeOutBack), right().x(260, 0.5, easeOutBack));
  const burst = createRef<Circle>();
  const vs = createRef<Txt>();
  yield view.add(<Circle ref={burst} size={0} fill={c.accent} opacity={0.35} />);
  yield view.add(<Txt ref={vs} text={"VS"} fill={"#fff"} fontFamily={SERIF} fontSize={64} fontWeight={700} scale={0} />);
  yield* all(burst().size(220, 0.35, easeOutBack), vs().scale(1, 0.35, easeOutBack));
  yield* fadeInTxt(view, c.leftTitle, { fill: "#e2e8f0", size: 22, x: -260, y: -80, font: SANS, letterSpacing: 2 });
  yield* fadeInTxt(view, c.leftText, { fill: "#fff", size: 20, x: -260, y: 40, font: SERIF, width: 160 });
  yield* fadeInTxt(view, c.rightTitle, { fill: "#e2e8f0", size: 22, x: 260, y: -80, font: SANS, letterSpacing: 2 });
  yield* fadeInTxt(view, c.rightText, { fill: "#fff", size: 20, x: 260, y: 40, font: SERIF, width: 160 });
  yield* hold(1.1);
}

function* cmpHeadToHead(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const helmA = createRef<Circle>();
  const helmB = createRef<Circle>();
  yield view.add(<Circle ref={helmA} size={160} fill={"#334155"} x={-420} y={0} />);
  yield view.add(<Circle ref={helmB} size={160} fill={"#475569"} x={420} y={0} />);
  yield view.add(<Rect width={70} height={40} fill={"#1e293b"} x={-420} y={70} radius={4} />);
  yield view.add(<Rect width={70} height={40} fill={"#1e293b"} x={420} y={70} radius={4} />);
  yield* all(helmA().x(-70, 0.55, easeOutCubic), helmB().x(70, 0.55, easeOutCubic));
  const shock = createRef<Line>();
  yield view.add(<Line ref={shock} points={[[0, -80], [0, 80]]} stroke={c.accent} lineWidth={6} end={0} />);
  yield* shock().end(1, 0.2, easeOutCubic);
  yield* fadeInTxt(view, c.leftTitle, { fill: "#fff", size: 20, x: -200, y: -160, font: SANS });
  yield* fadeInTxt(view, c.rightTitle, { fill: "#fff", size: 20, x: 200, y: -160, font: SANS });
  yield* fadeInTxt(view, c.leftText, { fill: "#94a3b8", size: 16, x: -200, y: 180, font: SERIF, width: 200 });
  yield* fadeInTxt(view, c.rightText, { fill: "#94a3b8", size: 16, x: 200, y: 180, font: SERIF, width: 200 });
  yield* hold(1);
}

function* cmpBeforeVsAfter(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield view.add(<Rect width={900} height={500} fill={"#1e293b"} />);
  yield* fadeInTxt(view, c.leftTitle || "BEFORE", { fill: "#94a3b8", size: 18, y: -180, font: SANS, letterSpacing: 4 });
  yield* fadeInTxt(view, c.leftText, { fill: "#cbd5e1", size: 32, y: -40, font: SERIF, width: 600 });
  const wipe = createRef<Rect>();
  yield view.add(<Rect ref={wipe} width={0} height={500} fill={"#0f172a"} x={-450} />);
  const afterLayer = createRef<Rect>();
  yield view.add(<Rect ref={afterLayer} width={0} height={500} fill={c.accent} x={-450} opacity={0.92} />);
  yield* all(
    wipe().width(900, 0.9, easeOutCubic),
    wipe().x(0, 0.9, easeOutCubic),
    afterLayer().width(900, 0.9, easeOutCubic),
    afterLayer().x(0, 0.9, easeOutCubic),
  );
  yield* fadeInTxt(view, c.rightTitle || "AFTER", { fill: "#0a0c12", size: 18, y: -180, font: SANS, letterSpacing: 4, weight: 700 });
  yield* fadeInTxt(view, c.rightText, { fill: "#0a0c12", size: 32, y: -40, font: SERIF, width: 600, weight: 700 });
  yield* hold(1.1);
}

function* cmpThenVsNow(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const thenCard = createRef<Rect>();
  const thenTxt = createRef<Txt>();
  yield view.add(<Rect ref={thenCard} width={360} height={280} fill={"#334155"} x={-200} y={20} radius={10} />);
  yield view.add(<Txt ref={thenTxt} text={`${c.leftTitle}\n${c.leftText}`} fill={"#e2e8f0"} fontFamily={SERIF} fontSize={24} x={-200} y={20} width={300} textWrap textAlign={"center"} />);
  yield* waitFor(0.5);
  yield* all(thenCard().opacity(0.35, 0.5, easeOutCubic), thenTxt().fill("#64748b", 0.5, easeOutCubic));
  const now = createRef<Rect>();
  yield view.add(<Rect ref={now} width={360} height={280} fill={c.accent} x={280} y={20} radius={10} scale={0.6} opacity={0} />);
  yield* all(now().scale(1, 0.45, easeOutBack), now().opacity(1, 0.35, easeOutCubic), now().x(200, 0.45, easeOutBack));
  yield* fadeInTxt(view, c.rightTitle || "NOW", { fill: "#0a0c12", size: 18, x: 200, y: -60, font: SANS, letterSpacing: 3, weight: 700 });
  yield* fadeInTxt(view, c.rightText, { fill: "#0a0c12", size: 24, x: 200, y: 40, font: SERIF, width: 280, weight: 700 });
  yield* hold(1);
}

function* cmpOldVsNew(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const oldPlate = createRef<Rect>();
  yield view.add(<Rect ref={oldPlate} width={340} height={220} fill={"#f2e8d4"} x={-700} y={0} radius={4} />);
  yield* oldPlate().x(-240, 0.5, easeOutCubic);
  const typed = createRef<Txt>();
  yield view.add(
    <Txt ref={typed} text={""} fill={"#171310"} fontFamily={SERIF} fontSize={22} x={-240} y={-20} width={280} textWrap textAlign={"center"} />,
  );
  const oldFull = `${c.leftTitle}\n${c.leftText}`;
  for (let i = 1; i <= oldFull.length; i++) {
    typed().text(oldFull.slice(0, i));
    yield* waitFor(0.025);
  }
  const neon = createRef<Rect>();
  yield view.add(<Rect ref={neon} width={340} height={220} fill={"#0a0c12"} stroke={c.accent} lineWidth={4} x={700} y={0} radius={8} opacity={0} />);
  yield* all(neon().x(240, 0.45, easeOutBack), neon().opacity(1, 0.35, easeOutCubic));
  yield* fadeInTxt(view, c.rightTitle, { fill: c.accent, size: 20, x: 240, y: -40, font: SANS, letterSpacing: 3 });
  yield* fadeInTxt(view, c.rightText, { fill: "#fff", size: 22, x: 240, y: 30, font: SERIF, width: 280 });
  yield* hold(1);
}

function* cmpAVsB(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const tileA = createRef<Rect>();
  const tileB = createRef<Rect>();
  yield view.add(<Rect ref={tileA} width={160} height={160} fill={c.accent} x={-180} y={-40} radius={16} scale={0} />);
  yield view.add(<Rect ref={tileB} width={160} height={160} fill={"#334155"} x={180} y={-40} radius={16} scale={0} />);
  yield* all(tileA().scale(1, 0.4, easeOutBack), tileA().rotation(360, 0.5, easeOutCubic));
  yield* fadeInTxt(view, "A", { fill: "#0a0c12", size: 72, x: -180, y: -40, font: SERIF, weight: 700 });
  yield* all(tileB().scale(1, 0.4, easeOutBack), tileB().rotation(-360, 0.5, easeOutCubic));
  yield* fadeInTxt(view, "B", { fill: "#fff", size: 72, x: 180, y: -40, font: SERIF, weight: 700 });
  yield* fadeInTxt(view, c.leftText || c.leftTitle, { fill: "#94a3b8", size: 16, x: -180, y: 120, font: SANS, width: 200 });
  yield* fadeInTxt(view, c.rightText || c.rightTitle, { fill: "#94a3b8", size: 16, x: 180, y: 120, font: SANS, width: 200 });
  yield* hold(1);
}

function* cmpComparisonCards(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield view.add(<Rect width={900} height={40} fill={"#1e293b"} y={220} radius={4} />);
  const cardA = createRef<Rect>();
  const cardB = createRef<Rect>();
  yield view.add(<Rect ref={cardA} width={280} height={360} fill={"#f8fafc"} x={-500} y={-300} rotation={-24} radius={12} />);
  yield view.add(<Rect ref={cardB} width={280} height={360} fill={"#e2e8f0"} x={500} y={-300} rotation={24} radius={12} />);
  yield* all(cardA().x(-160, 0.55, easeOutBack), cardA().y(-20, 0.55, easeOutBack), cardA().rotation(-8, 0.55, easeOutBack));
  yield* all(cardB().x(160, 0.55, easeOutBack), cardB().y(-20, 0.55, easeOutBack), cardB().rotation(8, 0.55, easeOutBack));
  yield* fadeInTxt(view, c.leftTitle, { fill: "#0f172a", size: 20, x: -160, y: -80, font: SANS, weight: 700 });
  yield* fadeInTxt(view, c.leftText, { fill: "#334155", size: 18, x: -160, y: 20, font: SERIF, width: 220 });
  yield* fadeInTxt(view, c.rightTitle, { fill: "#0f172a", size: 20, x: 160, y: -80, font: SANS, weight: 700 });
  yield* fadeInTxt(view, c.rightText, { fill: "#334155", size: 18, x: 160, y: 20, font: SERIF, width: 220 });
  yield* hold(1.1);
}

function* cmpFeatureComparison(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.leftTitle, { fill: c.accent, size: 18, x: -200, y: -240, font: SANS, letterSpacing: 2 });
  yield* fadeInTxt(view, c.rightTitle, { fill: "#94a3b8", size: 18, x: 200, y: -240, font: SANS, letterSpacing: 2 });
  const rows = [
    c.leftText || "Feature one",
    c.rightText || "Feature two",
    c.highlight || "Feature three",
    c.claim || "Feature four",
  ].filter(Boolean).slice(0, 4);
  const features = rows.length >= 2 ? ["Speed", "Depth", "Price", "Support"] : ["Speed", "Depth", "Price", "Support"];
  for (let i = 0; i < 4; i++) {
    const y = -140 + i * 70;
    yield view.add(<Txt text={features[i]} fill={"#64748b"} fontFamily={SANS} fontSize={14} x={0} y={y} />);
    const leftTick = createRef<Txt>();
    const rightTick = createRef<Txt>();
    yield view.add(<Txt ref={leftTick} text={"✓"} fill={c.accent} fontSize={28} x={-200} y={y} opacity={0} scale={0} />);
    yield view.add(<Txt ref={rightTick} text={i % 2 ? "✓" : "–"} fill={i % 2 ? "#22c55e" : "#64748b"} fontSize={28} x={200} y={y} opacity={0} scale={0} />);
    yield* all(leftTick().opacity(1, 0.2, easeOutCubic), leftTick().scale(1, 0.25, easeOutBack));
    yield* all(rightTick().opacity(1, 0.2, easeOutCubic), rightTick().scale(1, 0.25, easeOutBack));
    yield* pause(0.1);
  }
  yield* hold(1);
}

function* cmpPriceComparison(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const beam = createRef<Rect>();
  const fulcrum = createRef<Circle>();
  yield view.add(<Circle ref={fulcrum} size={28} fill={"#475569"} y={80} />);
  yield view.add(<Rect ref={beam} width={520} height={12} fill={"#94a3b8"} y={40} rotation={0} />);
  const tagL = createRef<Rect>();
  const tagR = createRef<Rect>();
  yield view.add(<Rect ref={tagL} width={140} height={100} fill={"#22c55e"} x={-220} y={-40} radius={8} />);
  yield view.add(<Rect ref={tagR} width={140} height={100} fill={c.accent} x={220} y={-40} radius={8} />);
  yield* fadeInTxt(view, c.leftText || c.leftTitle, { fill: "#0a0c12", size: 22, x: -220, y: -40, font: SERIF, weight: 700 });
  yield* fadeInTxt(view, c.rightText || c.rightTitle, { fill: "#0a0c12", size: 22, x: 220, y: -40, font: SERIF, weight: 700 });
  yield* all(
    beam().rotation(12, 0.7, easeOutCubic),
    tagL().y(-10, 0.7, easeOutCubic),
    tagR().y(-70, 0.7, easeOutCubic),
  );
  yield* fadeInTxt(view, c.leftTitle, { fill: "#94a3b8", size: 14, x: -220, y: 140, font: SANS });
  yield* fadeInTxt(view, c.rightTitle, { fill: "#94a3b8", size: 14, x: 220, y: 140, font: SANS });
  yield* hold(1.1);
}

function* cmpGrowthRace(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Growth Race", { size: 24, y: -260, fill: "#fff" });
  const ptsA: [number, number][] = [[-360, 120], [-180, 60], [0, 20], [180, -40], [360, -100]];
  const ptsB: [number, number][] = [[-360, 140], [-180, 100], [0, 80], [180, 40], [360, 10]];
  const lineA = createRef<Line>();
  const lineB = createRef<Line>();
  yield view.add(<Line ref={lineA} points={ptsA} stroke={c.accent} lineWidth={5} end={0} lineCap={"round"} />);
  yield view.add(<Line ref={lineB} points={ptsB} stroke={"#64748b"} lineWidth={5} end={0} lineCap={"round"} />);
  yield* all(lineA().end(1, 1.1, easeOutCubic), lineB().end(1, 1.3, easeOutCubic));
  yield* fadeInTxt(view, c.leftTitle, { fill: c.accent, size: 16, x: 300, y: -130, font: SANS });
  yield* fadeInTxt(view, c.leftText, { fill: "#fff", size: 18, x: 300, y: -100, font: SERIF });
  yield* fadeInTxt(view, c.rightTitle, { fill: "#94a3b8", size: 16, x: 300, y: 30, font: SANS });
  yield* fadeInTxt(view, c.rightText, { fill: "#cbd5e1", size: 18, x: 300, y: 60, font: SERIF });
  yield* hold(1);
}

function* cmpMarketShareRace(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Share Race", { size: 24, y: -280, fill: "#fff" });
  const leftH = 280;
  const rightH = 160;
  const a = createRef<Rect>();
  const b = createRef<Rect>();
  yield view.add(<Rect ref={a} width={100} height={0} fill={c.accent} x={-120} y={180} radius={6} />);
  yield view.add(<Rect ref={b} width={100} height={0} fill={"#64748b"} x={120} y={180} radius={6} />);
  yield* all(
    a().height(leftH, 1.0, easeOutCubic),
    a().y(180 - leftH / 2, 1.0, easeOutCubic),
    b().height(rightH, 1.15, easeOutCubic),
    b().y(180 - rightH / 2, 1.15, easeOutCubic),
  );
  yield* fadeInTxt(view, c.leftTitle, { fill: "#fff", size: 16, x: -120, y: 220, font: SANS });
  yield* fadeInTxt(view, c.leftText, { fill: c.accent, size: 20, x: -120, y: 180 - leftH - 30, font: SERIF });
  yield* fadeInTxt(view, c.rightTitle, { fill: "#94a3b8", size: 16, x: 120, y: 220, font: SANS });
  yield* fadeInTxt(view, c.rightText, { fill: "#cbd5e1", size: 20, x: 120, y: 180 - rightH - 30, font: SERIF });
  yield* hold(1);
}

function* cmpWhoWins(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const left = createRef<Rect>();
  const right = createRef<Rect>();
  yield view.add(<Rect ref={left} width={280} height={200} fill={"#1e293b"} x={-220} y={40} radius={10} />);
  yield view.add(<Rect ref={right} width={280} height={200} fill={"#1e293b"} x={220} y={40} radius={10} />);
  yield* fadeInTxt(view, c.leftTitle, { fill: "#e2e8f0", size: 22, x: -220, y: 0, font: SANS });
  yield* fadeInTxt(view, c.leftText, { fill: "#94a3b8", size: 16, x: -220, y: 50, font: SERIF, width: 220 });
  yield* fadeInTxt(view, c.rightTitle, { fill: "#e2e8f0", size: 22, x: 220, y: 0, font: SANS });
  yield* fadeInTxt(view, c.rightText, { fill: "#94a3b8", size: 16, x: 220, y: 50, font: SERIF, width: 220 });
  yield* waitFor(0.4);
  yield* right().fill(c.accent, 0.3, easeOutCubic);
  const crown = createRef<Txt>();
  yield view.add(<Txt ref={crown} text={"♛"} fill={"#fbbf24"} fontSize={64} x={220} y={-280} opacity={0} />);
  yield* all(crown().y(-120, 0.45, easeOutBack), crown().opacity(1, 0.3, easeOutCubic));
  yield* fadeInTxt(view, c.claim || "WHO WINS?", { fill: "#fff", size: 28, y: -220, font: SERIF, weight: 700 });
  yield* hold(1.1);
}

function* cmpTheDifference(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.claim || "The Difference", { size: 26, y: -240, fill: "#fff" });
  yield* fadeInTxt(view, c.leftText || c.leftTitle, { fill: "#94a3b8", size: 18, x: -320, y: -40, font: SANS });
  yield* fadeInTxt(view, c.rightText || c.rightTitle, { fill: "#94a3b8", size: 18, x: 320, y: -40, font: SANS });
  const track = createRef<Rect>();
  const gap = createRef<Rect>();
  yield view.add(<Rect ref={track} width={560} height={24} fill={"#1e293b"} y={40} radius={12} />);
  yield view.add(<Rect ref={gap} width={0} height={24} fill={c.accent} x={-280} y={40} radius={12} />);
  yield* all(gap().width(360, 0.9, easeOutCubic), gap().x(-100, 0.9, easeOutCubic));
  const delta = createRef<Txt>();
  yield view.add(<Txt ref={delta} text={"Δ"} fill={c.accent} fontFamily={SERIF} fontSize={48} fontWeight={700} y={120} opacity={0} />);
  yield* delta().opacity(1, 0.3, easeOutCubic);
  if (c.highlight) yield* fadeInTxt(view, c.highlight, { fill: "#e2e8f0", size: 20, y: 180, font: SERIF });
  yield* hold(1);
}

function* cmpSideBySide(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const leftDoor = createRef<Rect>();
  const rightDoor = createRef<Rect>();
  const hinge = createRef<Rect>();
  yield view.add(<Rect ref={leftDoor} width={440} height={480} fill={"#1e293b"} x={-220} />);
  yield view.add(<Rect ref={rightDoor} width={440} height={480} fill={"#0f172a"} x={220} />);
  yield view.add(<Rect ref={hinge} width={8} height={480} fill={c.accent} />);
  yield* fadeInTxt(view, c.leftTitle, { fill: "#94a3b8", size: 16, x: -220, y: -160, font: SANS, letterSpacing: 3 });
  yield* fadeInTxt(view, c.leftText, { fill: "#fff", size: 24, x: -220, y: 0, font: SERIF, width: 320 });
  yield* fadeInTxt(view, c.rightTitle, { fill: c.accent, size: 16, x: 220, y: -160, font: SANS, letterSpacing: 3 });
  yield* fadeInTxt(view, c.rightText, { fill: "#fff", size: 24, x: 220, y: 0, font: SERIF, width: 320 });
  yield* all(leftDoor().x(-260, 0.6, easeOutCubic), rightDoor().x(260, 0.6, easeOutCubic));
  yield* hold(1.1);
}

function* cmpScaleComparison(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const big = createRef<Rect>();
  const small = createRef<Rect>();
  yield view.add(<Rect ref={big} width={0} height={0} fill={"#1e293b"} stroke={c.accent} lineWidth={3} radius={8} />);
  yield* all(big().width(420, 0.5, easeOutCubic), big().height(300, 0.5, easeOutCubic));
  yield* fadeInTxt(view, c.rightTitle || "GIANT", { fill: c.accent, size: 16, y: -180, font: SANS, letterSpacing: 3 });
  yield* fadeInTxt(view, c.rightText, { fill: "#94a3b8", size: 16, y: 170, font: SERIF });
  yield view.add(<Rect ref={small} width={0} height={0} fill={c.accent} radius={4} />);
  yield* all(small().width(90, 0.4, easeOutBack), small().height(70, 0.4, easeOutBack));
  yield* fadeInTxt(view, c.leftTitle || "SMALL", { fill: "#0a0c12", size: 12, font: SANS, weight: 700 });
  yield* fadeInTxt(view, c.leftText, { fill: "#e2e8f0", size: 14, y: 220, font: SERIF });
  yield* hold(1.1);
}

function* cmpSizeComparison(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const icon = createRef<Circle>();
  yield view.add(<Circle ref={icon} size={40} fill={c.accent} y={0} />);
  yield* fadeInTxt(view, c.leftTitle, { fill: "#94a3b8", size: 16, y: -120, font: SANS });
  yield* fadeInTxt(view, c.leftText, { fill: "#64748b", size: 14, y: 80, font: SERIF });
  yield* waitFor(0.35);
  yield* icon().size(220, 0.8, easeOutCubic);
  yield* fadeInTxt(view, c.rightTitle, { fill: "#fff", size: 22, y: -160, font: SANS, letterSpacing: 2 });
  yield* fadeInTxt(view, c.rightText, { fill: "#e2e8f0", size: 18, y: 160, font: SERIF });
  yield* hold(1);
}

function* cmpSpeedComparison(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.title || "Speed", { size: 24, y: -260, fill: "#fff" });
  for (const side of [-1, 1] as const) {
    const dial = createRef<Circle>();
    const needle = createRef<Layout>();
    const x = side * 220;
    yield view.add(<Circle ref={dial} size={200} stroke={"#334155"} lineWidth={10} fill={null} x={x} y={20} />);
    yield view.add(
      <Layout ref={needle} x={x} y={20} rotation={-90}>
        <Rect width={6} height={80} y={-40} fill={side < 0 ? "#64748b" : c.accent} radius={3} />
      </Layout>,
    );
    yield* needle().rotation(side < 0 ? -50 : 40, 0.8, easeOutCubic);
  }
  yield* fadeInTxt(view, c.leftTitle, { fill: "#94a3b8", size: 16, x: -220, y: 160, font: SANS });
  yield* fadeInTxt(view, c.leftText, { fill: "#e2e8f0", size: 18, x: -220, y: 190, font: SERIF });
  yield* fadeInTxt(view, c.rightTitle, { fill: c.accent, size: 16, x: 220, y: 160, font: SANS });
  yield* fadeInTxt(view, c.rightText, { fill: "#fff", size: 18, x: 220, y: 190, font: SERIF });
  yield* hold(1.1);
}

function* cmpCountryVsCountry(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const top = createRef<Rect>();
  const mid = createRef<Rect>();
  const bot = createRef<Rect>();
  const flagB = createRef<Rect>();
  yield view.add(<Rect ref={top} width={0} height={70} fill={"#ff9933"} x={-400} y={-50} />);
  yield view.add(<Rect ref={mid} width={0} height={70} fill={"#ffffff"} x={-400} y={20} />);
  yield view.add(<Rect ref={bot} width={0} height={70} fill={"#138808"} x={-400} y={90} />);
  yield view.add(<Rect ref={flagB} width={0} height={210} fill={"#de2910"} x={400} y={20} />);
  yield* all(
    top().width(280, 0.55, easeOutCubic),
    top().x(-260, 0.55, easeOutCubic),
    mid().width(280, 0.55, easeOutCubic),
    mid().x(-260, 0.55, easeOutCubic),
    bot().width(280, 0.55, easeOutCubic),
    bot().x(-260, 0.55, easeOutCubic),
    flagB().width(280, 0.55, easeOutCubic),
    flagB().x(260, 0.55, easeOutCubic),
  );
  yield* fadeInTxt(view, c.leftTitle, { fill: "#fff", size: 28, x: -260, y: -180, font: SERIF, weight: 700 });
  yield* fadeInTxt(view, c.leftText, { fill: "#cbd5e1", size: 16, x: -260, y: 200, font: SANS, width: 260 });
  yield* fadeInTxt(view, c.rightTitle, { fill: "#fff", size: 28, x: 260, y: -180, font: SERIF, weight: 700 });
  yield* fadeInTxt(view, c.rightText, { fill: "#cbd5e1", size: 16, x: 260, y: 200, font: SANS, width: 260 });
  yield* hold(1.1);
}

function* cmpCompanyVsCompany(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const blockA = createRef<Rect>();
  const blockB = createRef<Rect>();
  yield view.add(<Rect ref={blockA} width={180} height={180} fill={"#1e293b"} x={-240} y={-40} radius={16} scale={0} />);
  yield view.add(<Rect ref={blockB} width={180} height={180} fill={"#1e293b"} x={240} y={-40} radius={16} scale={0} />);
  yield* all(blockA().scale(1, 0.4, easeOutBack), blockB().scale(1, 0.4, easeOutBack));
  yield* fadeInTxt(view, c.leftTitle.slice(0, 2).toUpperCase(), { fill: c.accent, size: 48, x: -240, y: -40, font: SERIF, weight: 700 });
  yield* fadeInTxt(view, c.rightTitle.slice(0, 2).toUpperCase(), { fill: "#94a3b8", size: 48, x: 240, y: -40, font: SERIF, weight: 700 });
  for (let i = 0; i < 3; i++) {
    const tickL = createRef<Rect>();
    const tickR = createRef<Rect>();
    yield view.add(<Rect ref={tickL} width={0} height={10} fill={c.accent} x={-300} y={120 + i * 28} radius={3} />);
    yield view.add(<Rect ref={tickR} width={0} height={10} fill={"#64748b"} x={180} y={120 + i * 28} radius={3} />);
    yield* all(tickL().width(120 - i * 20, 0.25, easeOutCubic), tickR().width(80 - i * 15, 0.25, easeOutCubic));
  }
  yield* fadeInTxt(view, c.leftText, { fill: "#94a3b8", size: 14, x: -240, y: 220, font: SANS });
  yield* fadeInTxt(view, c.rightText, { fill: "#94a3b8", size: 14, x: 240, y: 220, font: SANS });
  yield* hold(1);
}

function* cmpRichVsRich(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  yield* fadeInTxt(view, c.leftTitle, { fill: "#fbbf24", size: 18, x: -220, y: -200, font: SANS, letterSpacing: 2 });
  yield* fadeInTxt(view, c.rightTitle, { fill: "#fbbf24", size: 18, x: 220, y: -200, font: SANS, letterSpacing: 2 });
  const a = createRef<Txt>();
  const b = createRef<Txt>();
  yield view.add(<Txt ref={a} text={"$0"} fill={"#fde68a"} fontFamily={SERIF} fontSize={48} fontWeight={700} x={-220} y={0} />);
  yield view.add(<Txt ref={b} text={"$0"} fill={"#a8a29e"} fontFamily={SERIF} fontSize={48} fontWeight={700} x={220} y={0} />);
  yield* all(
    countText(a, 0, 120, 20, 0.04, (n) => `$${Math.round(n)}B`),
    countText(b, 0, 98, 20, 0.04, (n) => `$${Math.round(n)}B`),
  );
  yield* fadeInTxt(view, c.leftText, { fill: "#94a3b8", size: 16, x: -220, y: 100, font: SERIF });
  yield* fadeInTxt(view, c.rightText, { fill: "#94a3b8", size: 16, x: 220, y: 100, font: SERIF });
  yield* hold(1);
}

function* cmpDataFaceOff(view: any) {
  const c = colors();
  view.fill(c.bg);
  yield* pause(c.t.startDelay);
  const leftStat = createRef<Txt>();
  const rightStat = createRef<Txt>();
  yield view.add(
    <Txt ref={leftStat} text={c.leftText || "42%"} fill={c.accent} fontFamily={SERIF} fontSize={72} fontWeight={700} x={-500} y={0} />,
  );
  yield view.add(
    <Txt ref={rightStat} text={c.rightText || "11%"} fill={"#ef4444"} fontFamily={SERIF} fontSize={72} fontWeight={700} x={500} y={0} />,
  );
  yield* all(leftStat().x(-220, 0.45, easeOutBack), rightStat().x(220, 0.45, easeOutBack));
  const spark = createRef<Line>();
  yield view.add(
    <Line ref={spark} points={[[-40, -30], [-10, 20], [10, -25], [40, 15]]} stroke={"#fbbf24"} lineWidth={4} end={0} lineCap={"round"} />,
  );
  yield* spark().end(1, 0.35, easeOutCubic);
  yield* fadeInTxt(view, c.leftTitle, { fill: "#94a3b8", size: 16, x: -220, y: 100, font: SANS });
  yield* fadeInTxt(view, c.rightTitle, { fill: "#94a3b8", size: 16, x: 220, y: 100, font: SANS });
  if (c.eyebrow || c.claim) yield* fadeInTxt(view, c.eyebrow || c.claim, { fill: "#64748b", size: 14, y: -180, font: SANS, letterSpacing: 3 });
  yield* hold(1.1);
}

const MAP: Record<string, Gen> = {
  "cmp-vs-battle": cmpVsBattle,
  "cmp-head-to-head": cmpHeadToHead,
  "cmp-before-vs-after": cmpBeforeVsAfter,
  "cmp-then-vs-now": cmpThenVsNow,
  "cmp-old-vs-new": cmpOldVsNew,
  "cmp-a-vs-b": cmpAVsB,
  "cmp-comparison-cards": cmpComparisonCards,
  "cmp-feature-comparison": cmpFeatureComparison,
  "cmp-price-comparison": cmpPriceComparison,
  "cmp-growth-race": cmpGrowthRace,
  "cmp-market-share-race": cmpMarketShareRace,
  "cmp-who-wins": cmpWhoWins,
  "cmp-the-difference": cmpTheDifference,
  "cmp-side-by-side": cmpSideBySide,
  "cmp-scale-comparison": cmpScaleComparison,
  "cmp-size-comparison": cmpSizeComparison,
  "cmp-speed-comparison": cmpSpeedComparison,
  "cmp-country-vs-country": cmpCountryVsCountry,
  "cmp-company-vs-company": cmpCompanyVsCompany,
  "cmp-rich-vs-rich": cmpRichVsRich,
  "cmp-data-face-off": cmpDataFaceOff,
};

export function* runDocCompare(view: any, template: string) {
  const fn = MAP[template];
  if (fn) yield* fn(view);
}
