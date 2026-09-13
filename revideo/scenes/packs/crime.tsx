/** @jsxImportSource @revideo/2d/lib */
import { Circle, Layout, Line, Rect, Txt } from "@revideo/2d";
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
const SANS = "Sora, Helvetica, sans-serif";
const MONO = "Courier New, monospace";

function* drawString(
  view: any,
  a: [number, number],
  b: [number, number],
  color: string,
  duration: number,
) {
  const line = createRef<Line>();
  yield view.add(
    <Line
      ref={line}
      points={[a, b]}
      stroke={color}
      lineWidth={3}
      end={0}
      lineCap={"round"}
      zIndex={2}
    />,
  );
  yield* line().end(1, duration, easeOutCubic);
}

function* corkBg(view: any, bg: string) {
  view.fill(bg);
  yield view.add(
    <Rect width={1220} height={680} fill={"#2a2218"} radius={10} opacity={0.95} />,
  );
}

/** Classic evidence board — pins + strings that actually connect. */
function* crimeBoard(view: any) {
  const title = str("title", "Crime scene board");
  const labels = [
    str("label1", "Suspect"),
    str("label2", "Witness"),
    str("label3", "Location"),
    str("label4", "Evidence"),
  ];
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#1a1410");
  const t = timing();
  const extra = itemDelays(4);
  yield* corkBg(view, bg);
  yield view.add(
    <Txt
      text={title.toUpperCase()}
      fill={accent}
      fontFamily={SERIF}
      fontSize={16}
      letterSpacing={7}
      y={-300}
      zIndex={5}
    />,
  );

  // Card centers; pin sits 100px above center
  const cards = [
    { x: -340, y: -70, rot: -8 },
    { x: 140, y: -110, rot: 7 },
    { x: -160, y: 140, rot: 5 },
    { x: 320, y: 100, rot: -6 },
  ];
  const pins = cards.map((c) => [c.x, c.y - 100] as [number, number]);

  yield* pause(t.startDelay);
  for (let i = 0; i < 4; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const note = createRef<Layout>();
    yield view.add(
      <Layout
        ref={note}
        x={cards[i].x}
        y={cards[i].y}
        rotation={cards[i].rot}
        scale={0.4}
        opacity={0}
        zIndex={4}
      >
        <Rect width={200} height={230} fill={"#f4ead7"} shadowBlur={16} />
        <Rect width={160} height={110} fill={"#2c2620"} y={-35} />
        <Txt
          text={labels[i]}
          fill={"#1a1510"}
          fontFamily={SERIF}
          fontSize={15}
          fontWeight={700}
          y={85}
        />
        <Circle width={18} height={18} fill={accent} y={-108} zIndex={6} />
      </Layout>,
    );
    yield* all(
      note().scale(1, t.revealDuration, easeOutBack),
      note().opacity(1, t.revealDuration * 0.55, easeOutCubic),
    );
  }

  yield* pause(t.connectDelay);
  // Connect pins: 0-1, 0-2, 1-3, 2-3
  const pairs: Array<[number, number]> = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
  ];
  for (let i = 0; i < pairs.length; i++) {
    if (i > 0) yield* pause(t.stepDelay * 0.6);
    const [ia, ib] = pairs[i];
    yield* drawString(view, pins[ia], pins[ib], accent, t.lineDuration);
  }
  yield* waitFor(1.2);
}

function* caseStamp(view: any) {
  const stamp = str("stamp", "CLASSIFIED");
  const title = str("title", "Case file 47");
  const subtitle = str("subtitle", "Restricted — internal review only");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#0a0c10");
  const t = timing();
  view.fill(bg);
  const titleRef = createRef<Txt>();
  const stampRef = createRef<Layout>();
  yield view.add(
    <Txt
      ref={titleRef}
      text={title}
      fill={"#f4efe6"}
      fontFamily={SERIF}
      fontSize={48}
      fontWeight={700}
      y={-40}
      opacity={0}
    />,
  );
  yield view.add(
    <Txt text={subtitle} fill={"#9aa3ad"} fontFamily={SERIF} fontSize={18} y={40} />,
  );
  yield view.add(
    <Layout ref={stampRef} rotation={-14} scale={2.2} opacity={0} y={20}>
      <Rect width={320} height={78} lineWidth={5} stroke={accent} radius={4} />
      <Txt
        text={stamp.toUpperCase()}
        fill={accent}
        fontFamily={SERIF}
        fontSize={36}
        fontWeight={700}
        letterSpacing={6}
      />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* titleRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* all(
    stampRef().opacity(1, t.revealDuration * 0.45, easeOutCubic),
    stampRef().scale(1, t.revealDuration, easeOutBack),
  );
  yield* waitFor(1.3);
}

function* stringWeb(view: any) {
  const title = str("title", "The network");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#1a1410");
  const t = timing();
  yield* corkBg(view, bg);
  yield view.add(
    <Txt text={title.toUpperCase()} fill={accent} fontFamily={SERIF} fontSize={15} letterSpacing={6} y={-290} />,
  );
  const nodes: Array<[number, number]> = [
    [-280, -120],
    [0, -160],
    [300, -80],
    [-200, 80],
    [80, 40],
    [260, 140],
  ];
  yield* pause(t.startDelay);
  for (let i = 0; i < nodes.length; i++) {
    if (i > 0) yield* pause(t.stepDelay * 0.5);
    const n = createRef<Circle>();
    yield view.add(
      <Circle ref={n} width={22} height={22} fill={accent} x={nodes[i][0]} y={nodes[i][1]} scale={0} />,
    );
    yield* n().scale(1, t.revealDuration * 0.7, easeOutBack);
  }
  yield* pause(t.connectDelay);
  const edges: Array<[number, number]> = [
    [0, 1],
    [1, 2],
    [0, 3],
    [1, 4],
    [2, 5],
    [3, 4],
    [4, 5],
    [3, 5],
  ];
  for (let i = 0; i < edges.length; i++) {
    if (i > 0) yield* pause(0.05);
    const [a, b] = edges[i];
    yield* drawString(view, nodes[a], nodes[b], accent, t.lineDuration * 0.7);
  }
  yield* waitFor(1.1);
}

function* polaroidCascade(view: any) {
  const title = str("title", "Evidence photos");
  const labels = [
    str("label1", "Photo A"),
    str("label2", "Photo B"),
    str("label3", "Photo C"),
  ];
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#121018");
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={title.toUpperCase()} fill={accent} fontFamily={SERIF} fontSize={14} letterSpacing={6} y={-260} />,
  );
  const cards = [
    { x: -280, y: 20, rot: -12 },
    { x: 0, y: -10, rot: 3 },
    { x: 280, y: 30, rot: 10 },
  ];
  yield* pause(t.startDelay);
  for (let i = 0; i < 3; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    const card = createRef<Layout>();
    yield view.add(
      <Layout ref={card} x={cards[i].x} y={cards[i].y + 80} rotation={cards[i].rot} opacity={0}>
        <Rect width={220} height={260} fill={"#f7f1e6"} />
        <Rect width={180} height={160} fill={"#2a2420"} y={-30} />
        <Txt text={labels[i]} fill={"#1a1510"} fontFamily={SERIF} fontSize={16} fontWeight={700} y={100} />
        <Circle width={14} height={14} fill={accent} y={-122} />
      </Layout>,
    );
    yield* all(
      card().y(cards[i].y, t.revealDuration, easeOutBack),
      card().opacity(1, t.revealDuration * 0.6, easeOutCubic),
    );
  }
  yield* waitFor(1.2);
}

function* mugshot(view: any) {
  const name = str("name", "UNKNOWN SUBJECT");
  const id = str("id", "CASE-047");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#0a0c10");
  const t = timing();
  view.fill(bg);
  const frame = createRef<Layout>();
  const bar = createRef<Rect>();
  const nameRef = createRef<Txt>();
  const idRef = createRef<Txt>();
  yield view.add(
    <Layout ref={frame} x={-320} opacity={0}>
      <Rect width={280} height={360} fill={"#1c1814"} />
      <Rect width={240} height={280} fill={"#3a322c"} y={-10} />
      <Txt text={"FRONT"} fill={"#888"} fontFamily={MONO} fontSize={14} y={150} />
    </Layout>,
  );
  yield view.add(<Rect ref={bar} width={0} height={4} fill={accent} x={160} y={-40} />);
  yield view.add(
    <Txt ref={nameRef} text={name} fill={"#fff"} fontFamily={SANS} fontSize={36} fontWeight={700} x={200} y={-80} width={420} textWrap opacity={0} />,
  );
  yield view.add(
    <Txt ref={idRef} text={id} fill={accent} fontFamily={MONO} fontSize={18} x={200} y={0} opacity={0} />,
  );
  yield* pause(t.startDelay);
  yield* frame().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* bar().width(360, t.lineDuration, easeOutCubic);
  yield* all(
    nameRef().opacity(1, t.revealDuration, easeOutCubic),
    idRef().opacity(1, t.revealDuration, easeOutCubic),
  );
  yield* waitFor(1.3);
}

function* evidenceTag(view: any) {
  const tag = str("tag", "EVIDENCE");
  const item = str("item", "Cell phone — recovered 02:14");
  const caseId = str("caseId", "#CF-221");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#0c0e12");
  const t = timing();
  view.fill(bg);
  const plate = createRef<Layout>();
  yield view.add(
    <Layout ref={plate} scale={0.4} opacity={0} rotation={-6}>
      <Rect width={520} height={220} fill={"#f0e6d2"} radius={6} />
      <Rect width={520} height={48} fill={accent} y={-86} radius={6} />
      <Txt text={tag} fill={"#fff"} fontFamily={SANS} fontSize={22} fontWeight={700} letterSpacing={8} y={-86} />
      <Txt text={item} fill={"#1a1510"} fontFamily={SERIF} fontSize={24} fontWeight={700} y={-10} width={460} textWrap />
      <Txt text={caseId} fill={"#666"} fontFamily={MONO} fontSize={16} y={70} />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* all(
    plate().scale(1, t.revealDuration, easeOutBack),
    plate().opacity(1, t.revealDuration * 0.5, easeOutCubic),
  );
  yield* waitFor(1.4);
}

function* fingerprintScan(view: any) {
  const label = str("label", "PRINT MATCH");
  const percent = str("percent", "97%");
  const accent = str("accent", "#3ecf8e");
  const bg = str("bg", "#07090e");
  const t = timing();
  view.fill(bg);
  const scan = createRef<Rect>();
  const glow = createRef<Circle>();
  yield view.add(<Circle width={280} height={280} lineWidth={3} stroke={"#2a3340"} />);
  yield view.add(<Circle ref={glow} width={40} height={40} fill={accent} opacity={0.15} />);
  yield view.add(<Rect ref={scan} width={200} height={4} fill={accent} y={-120} opacity={0.9} />);
  yield view.add(
    <Txt text={label} fill={"#9aa3ad"} fontFamily={SANS} fontSize={14} letterSpacing={6} y={200} />,
  );
  const pct = createRef<Txt>();
  yield view.add(
    <Txt ref={pct} text={"0%"} fill={accent} fontFamily={SANS} fontSize={48} fontWeight={700} y={240} />,
  );
  yield* pause(t.startDelay);
  yield* all(
    scan().y(120, t.lineDuration * 1.4, easeOutCubic),
    glow().width(260, t.lineDuration * 1.4, easeOutCubic),
    glow().height(260, t.lineDuration * 1.4, easeOutCubic),
  );
  pct().text(percent);
  yield* waitFor(1.2);
}

function* crimeTimeline(view: any) {
  const title = str("title", "Night of the incident");
  const raw = str("events", "22:10 Call received\n22:47 First on scene\n23:05 Evidence logged\n23:40 Suspect ID");
  const events = raw.split(/\n/).map((s) => s.trim()).filter(Boolean).slice(0, 5);
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#0a0c10");
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={title} fill={"#f4efe6"} fontFamily={SERIF} fontSize={28} fontWeight={700} y={-240} />,
  );
  const rail = createRef<Rect>();
  yield view.add(<Rect ref={rail} width={4} height={0} fill={accent} x={-360} y={-40} />);
  yield* pause(t.startDelay);
  yield* rail().height(Math.max(80, events.length * 70), t.lineDuration, easeOutCubic);
  for (let i = 0; i < events.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    const y = -160 + i * 70;
    const dot = createRef<Circle>();
    const row = createRef<Txt>();
    yield view.add(<Circle ref={dot} width={14} height={14} fill={accent} x={-360} y={y} scale={0} />);
    yield view.add(
      <Txt ref={row} text={events[i]} fill={"#e8eef4"} fontFamily={SERIF} fontSize={22} x={-300} y={y} opacity={0} width={700} textWrap />,
    );
    yield* all(
      dot().scale(1, t.revealDuration * 0.7, easeOutBack),
      row().opacity(1, t.revealDuration, easeOutCubic),
    );
  }
  yield* waitFor(1.2);
}

function* crimePin(view: any) {
  const place = str("place", "Warehouse 9");
  const city = str("city", "East docks");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#0a0c12");
  const t = timing();
  view.fill(bg);
  const r1 = createRef<Circle>();
  const r2 = createRef<Circle>();
  const pin = createRef<Layout>();
  yield view.add(<Circle ref={r1} width={40} height={40} lineWidth={2} stroke={accent} opacity={0} />);
  yield view.add(<Circle ref={r2} width={40} height={40} lineWidth={2} stroke={accent} opacity={0} />);
  yield view.add(
    <Layout ref={pin} y={-80} opacity={0}>
      <Circle width={28} height={28} fill={accent} />
      <Rect width={6} height={40} fill={accent} y={28} />
    </Layout>,
  );
  yield view.add(
    <Txt text={place} fill={"#fff"} fontFamily={SERIF} fontSize={40} fontWeight={700} y={120} />,
  );
  yield view.add(
    <Txt text={city.toUpperCase()} fill={accent} fontFamily={SANS} fontSize={14} letterSpacing={5} y={170} />,
  );
  yield* pause(t.startDelay);
  yield* all(
    r1().opacity(0.7, 0.2),
    r1().width(220, t.lineDuration, easeOutCubic),
    r1().height(220, t.lineDuration, easeOutCubic),
  );
  yield* all(
    r2().opacity(0.45, 0.2),
    r2().width(340, t.lineDuration, easeOutCubic),
    r2().height(340, t.lineDuration, easeOutCubic),
  );
  yield* all(
    pin().opacity(1, t.revealDuration, easeOutCubic),
    pin().y(0, t.revealDuration, easeOutBack),
  );
  yield* waitFor(1.2);
}

function* clippingSlap(view: any) {
  const headline = str("headline", "Three missing after night raid");
  const paper = str("paper", "CITY CHRONICLE");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#101218");
  const t = timing();
  view.fill(bg);
  const clip = createRef<Layout>();
  yield view.add(
    <Layout ref={clip} rotation={8} scale={1.6} opacity={0} y={-40}>
      <Rect width={640} height={360} fill={"#efe8da"} />
      <Txt text={paper} fill={accent} fontFamily={SANS} fontSize={14} letterSpacing={5} y={-140} />
      <Txt text={headline} fill={"#1a1510"} fontFamily={SERIF} fontSize={32} fontWeight={700} width={560} textWrap textAlign={"center"} />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* all(
    clip().opacity(1, t.revealDuration * 0.4, easeOutCubic),
    clip().scale(1, t.revealDuration, easeOutBack),
    clip().rotation(-3, t.revealDuration, easeOutCubic),
  );
  yield* waitFor(1.3);
}

function* folderOpen(view: any) {
  const title = str("title", "CASE FILE");
  const name = str("name", "Operation Nightfall");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#0c0e12");
  const t = timing();
  view.fill(bg);
  const back = createRef<Rect>();
  const front = createRef<Rect>();
  const label = createRef<Txt>();
  yield view.add(<Rect ref={back} width={520} height={340} fill={"#3a2a1c"} y={20} />);
  yield view.add(<Rect ref={front} width={520} height={340} fill={"#c4a574"} y={20} />);
  yield view.add(
    <Txt ref={label} text={title} fill={"#1a1510"} fontFamily={SANS} fontSize={22} fontWeight={700} letterSpacing={6} y={-40} opacity={0} />,
  );
  yield view.add(
    <Txt text={name} fill={"#f4efe6"} fontFamily={SERIF} fontSize={28} y={200} opacity={0} />,
  );
  yield* pause(t.startDelay);
  yield* front().x(420, t.lineDuration, easeOutCubic);
  yield* front().opacity(0.15, t.revealDuration * 0.5, easeOutCubic);
  yield* label().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.3);
}

function* transcriptType(view: any) {
  const label = str("label", "INTERROGATION");
  const line = str("line", "Q: Where were you at midnight?\nA: I already told you — home.");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07090e");
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={label} fill={accent} fontFamily={SANS} fontSize={14} letterSpacing={6} y={-200} />,
  );
  const body = createRef<Txt>();
  yield view.add(
    <Txt ref={body} text={""} fill={"#e8eef4"} fontFamily={MONO} fontSize={24} y={0} width={900} textWrap />,
  );
  yield* pause(t.startDelay);
  const chars = line.split("");
  const delay = Math.max(0.015, t.lineDuration / Math.max(chars.length, 1));
  for (let i = 0; i < chars.length; i++) {
    body().text(line.slice(0, i + 1));
    yield* waitFor(delay);
  }
  yield* waitFor(1.2);
}

function* cctvOverlay(view: any) {
  const cam = str("cam", "CAM 04 — ALLEY");
  const stamp = str("stamp", "02:14:37  12/03");
  const accent = str("accent", "#3ecf8e");
  const bg = str("bg", "#050608");
  const t = timing();
  view.fill(bg);
  const rec = createRef<Circle>();
  yield view.add(<Rect width={1180} height={640} lineWidth={2} stroke={"#2a3340"} />);
  yield view.add(<Circle ref={rec} width={16} height={16} fill={accent} x={-520} y={-280} />);
  yield view.add(
    <Txt text={"REC"} fill={accent} fontFamily={MONO} fontSize={18} x={-470} y={-280} />,
  );
  const camRef = createRef<Txt>();
  const timeRef = createRef<Txt>();
  yield view.add(
    <Txt ref={camRef} text={cam} fill={"#c8d0d8"} fontFamily={MONO} fontSize={18} x={-400} y={280} opacity={0} />,
  );
  yield view.add(
    <Txt ref={timeRef} text={stamp} fill={"#c8d0d8"} fontFamily={MONO} fontSize={18} x={400} y={280} opacity={0} />,
  );
  yield* pause(t.startDelay);
  yield* all(
    camRef().opacity(1, t.revealDuration, easeOutCubic),
    timeRef().opacity(1, t.revealDuration, easeOutCubic),
  );
  for (let i = 0; i < 4; i++) {
    yield* rec().opacity(0.2, 0.25);
    yield* rec().opacity(1, 0.25);
  }
  yield* waitFor(0.6);
}

function* chalkOutline(view: any) {
  const label = str("label", "SCENE MARKED");
  const accent = str("accent", "#f4efe6");
  const bg = str("bg", "#1a1814");
  const t = timing();
  view.fill(bg);
  const outline = createRef<Line>();
  const labelRef = createRef<Txt>();
  const pts: Array<[number, number]> = [
    [-40, 160],
    [-80, 40],
    [-60, -80],
    [0, -140],
    [60, -80],
    [80, 40],
    [40, 160],
  ];
  yield view.add(
    <Line ref={outline} points={pts} stroke={accent} lineWidth={4} end={0} lineCap={"round"} />,
  );
  yield view.add(
    <Txt ref={labelRef} text={label} fill={accent} fontFamily={SANS} fontSize={16} letterSpacing={6} y={240} opacity={0} />,
  );
  yield* pause(t.startDelay);
  yield* outline().end(1, t.lineDuration * 1.5, easeOutCubic);
  yield* labelRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.1);
}

function* photoGrid(view: any) {
  const title = str("title", "Evidence grid");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#0c0e12");
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={title.toUpperCase()} fill={accent} fontFamily={SANS} fontSize={14} letterSpacing={6} y={-260} />,
  );
  const cells = [
    [-220, -80],
    [0, -80],
    [220, -80],
    [-220, 120],
    [0, 120],
    [220, 120],
  ];
  yield* pause(t.startDelay);
  for (let i = 0; i < cells.length; i++) {
    if (i > 0) yield* pause(t.stepDelay * 0.6);
    const cell = createRef<Rect>();
    yield view.add(
      <Rect
        ref={cell}
        width={180}
        height={140}
        fill={"#1a1e26"}
        lineWidth={2}
        stroke={accent}
        x={cells[i][0]}
        y={cells[i][1]}
        opacity={0}
        scale={0.8}
      />,
    );
    yield view.add(
      <Txt
        text={`EX-${i + 1}`}
        fill={"#8a93a0"}
        fontFamily={MONO}
        fontSize={14}
        x={cells[i][0]}
        y={cells[i][1]}
      />,
    );
    yield* all(
      cell().opacity(1, t.revealDuration * 0.6, easeOutCubic),
      cell().scale(1, t.revealDuration, easeOutBack),
    );
  }
  yield* waitFor(1.1);
}

function* wantedPoster(view: any) {
  const name = str("name", "JOHN DOE");
  const reward = str("reward", "REWARD $50,000");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#141210");
  const t = timing();
  view.fill(bg);
  const poster = createRef<Layout>();
  yield view.add(
    <Layout ref={poster} scale={0.5} opacity={0} rotation={-4}>
      <Rect width={420} height={560} fill={"#efe6d4"} />
      <Txt text={"WANTED"} fill={accent} fontFamily={SANS} fontSize={42} fontWeight={700} letterSpacing={8} y={-230} />
      <Rect width={300} height={280} fill={"#2a2420"} y={-40} />
      <Txt text={name} fill={"#1a1510"} fontFamily={SERIF} fontSize={28} fontWeight={700} y={160} />
      <Txt text={reward} fill={accent} fontFamily={SANS} fontSize={16} letterSpacing={3} y={210} />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* all(
    poster().scale(1, t.revealDuration, easeOutBack),
    poster().opacity(1, t.revealDuration * 0.5, easeOutCubic),
  );
  yield* waitFor(1.3);
}

function* custodyLabel(view: any) {
  const from = str("from", "Officer Reyes");
  const to = str("to", "Lab Unit B");
  const item = str("item", "Shell casing #3");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#0a0c10");
  const t = timing();
  view.fill(bg);
  const box = createRef<Layout>();
  yield view.add(
    <Layout ref={box} y={40} opacity={0}>
      <Rect width={700} height={280} fill={"#161a22"} lineWidth={2} stroke={accent} radius={8} />
      <Txt text={"CHAIN OF CUSTODY"} fill={accent} fontFamily={SANS} fontSize={14} letterSpacing={5} y={-100} />
      <Txt text={item} fill={"#fff"} fontFamily={SERIF} fontSize={28} fontWeight={700} y={-40} />
      <Txt text={`${from}  →  ${to}`} fill={"#b8c0c8"} fontFamily={MONO} fontSize={20} y={40} />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* box().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.3);
}

function* confessionQuote(view: any) {
  const quote = str("quote", "I never meant for anyone to get hurt.");
  const who = str("who", "— Suspect interview, tape 3");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#080a0e");
  const t = timing();
  view.fill(bg);
  const mark = createRef<Txt>();
  const body = createRef<Txt>();
  const attr = createRef<Txt>();
  const rule = createRef<Rect>();
  yield view.add(
    <Txt ref={mark} text={"“"} fill={accent} fontFamily={SERIF} fontSize={140} y={-160} opacity={0} />,
  );
  yield view.add(
    <Txt ref={body} text={quote} fill={"#f4efe6"} fontFamily={SERIF} fontSize={34} fontStyle={"italic"} width={900} textWrap textAlign={"center"} opacity={0} />,
  );
  yield view.add(<Rect ref={rule} width={0} height={3} fill={accent} y={100} />);
  yield view.add(
    <Txt ref={attr} text={who} fill={"#9aa3ad"} fontFamily={SERIF} fontSize={18} y={140} opacity={0} />,
  );
  yield* pause(t.startDelay);
  yield* mark().opacity(1, t.revealDuration, easeOutCubic);
  yield* body().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* rule().width(240, t.lineDuration, easeOutCubic);
  yield* attr().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.2);
}

function* ballisticNote(view: any) {
  const caliber = str("caliber", "9mm");
  const note = str("note", "Matched to weapon recovered in Unit 4");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#0c0e12");
  const t = timing();
  view.fill(bg);
  const shell = createRef<Rect>();
  yield view.add(
    <Rect ref={shell} width={48} height={120} fill={"#c9a227"} radius={8} x={-280} rotation={-20} opacity={0} />,
  );
  yield view.add(
    <Txt text={caliber} fill={"#fff"} fontFamily={SANS} fontSize={64} fontWeight={700} x={80} y={-40} opacity={0} />,
  );
  yield view.add(
    <Txt text={note} fill={"#b8c0c8"} fontFamily={SERIF} fontSize={22} x={80} y={50} width={560} textWrap opacity={0} />,
  );
  yield* pause(t.startDelay);
  yield* shell().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield view.add(
    <Txt text={caliber} fill={"#fff"} fontFamily={SANS} fontSize={64} fontWeight={700} x={80} y={-40} />,
  );
  yield view.add(
    <Txt text={note} fill={"#b8c0c8"} fontFamily={SERIF} fontSize={22} x={80} y={50} width={560} textWrap />,
  );
  yield* waitFor(1.3);
}

function* nightZoom(view: any) {
  const label = str("label", "SURVEILLANCE ZOOM");
  const target = str("target", "Subject enters frame");
  const accent = str("accent", "#3ecf8e");
  const bg = str("bg", "#050608");
  const t = timing();
  view.fill(bg);
  const frame = createRef<Rect>();
  yield view.add(
    <Rect ref={frame} width={900} height={500} lineWidth={2} stroke={"#2a3340"} scale={1.4} />,
  );
  yield view.add(
    <Txt text={label} fill={accent} fontFamily={MONO} fontSize={16} letterSpacing={4} y={-280} />,
  );
  const tgt = createRef<Txt>();
  yield view.add(
    <Txt ref={tgt} text={target} fill={"#c8d0d8"} fontFamily={SERIF} fontSize={24} y={280} opacity={0} />,
  );
  yield* pause(t.startDelay);
  yield* frame().scale(1, t.lineDuration, easeOutCubic);
  yield* tgt().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.2);
}

function* redactedBlock(view: any) {
  const title = str("title", "Declassified excerpt");
  const body = str("body", "The transfer was authorized by ████ on 12 March.");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#0a0c10");
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={title.toUpperCase()} fill={accent} fontFamily={SANS} fontSize={14} letterSpacing={5} y={-160} />,
  );
  const line = createRef<Txt>();
  const bar = createRef<Rect>();
  yield view.add(
    <Txt ref={line} text={body} fill={"#e8eef4"} fontFamily={MONO} fontSize={26} width={900} textWrap opacity={0} />,
  );
  yield view.add(<Rect ref={bar} width={0} height={28} fill={"#111"} x={120} y={8} />);
  yield* pause(t.startDelay);
  yield* line().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* bar().width(160, t.lineDuration, easeOutCubic);
  yield* waitFor(1.2);
}

function* bloodTrail(view: any) {
  const label = str("label", "TRAIL DOCUMENTED");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#120e0e");
  const t = timing();
  view.fill(bg);
  const drops: Array<[number, number]> = [
    [-320, 80],
    [-200, 40],
    [-80, 90],
    [40, 20],
    [160, 70],
    [280, 30],
  ];
  yield* pause(t.startDelay);
  for (let i = 0; i < drops.length; i++) {
    if (i > 0) yield* pause(t.stepDelay * 0.5);
    const d = createRef<Circle>();
    yield view.add(
      <Circle
        ref={d}
        width={18 + (i % 3) * 6}
        height={18 + (i % 3) * 6}
        fill={accent}
        x={drops[i][0]}
        y={drops[i][1]}
        opacity={0}
        scale={0}
      />,
    );
    yield* all(
      d().opacity(0.85, t.revealDuration * 0.5, easeOutCubic),
      d().scale(1, t.revealDuration, easeOutBack),
    );
  }
  yield view.add(
    <Txt text={label} fill={accent} fontFamily={SANS} fontSize={16} letterSpacing={5} y={-220} />,
  );
  yield* waitFor(1.1);
}

export function* runCrime(view: any, template: string) {
  switch (template) {
    case "crime-board":
    case "yt-crime-board":
      yield* crimeBoard(view);
      break;
    case "crime-case-stamp":
    case "yt-case-stamp":
      yield* caseStamp(view);
      break;
    case "crime-string-web":
      yield* stringWeb(view);
      break;
    case "crime-polaroid-cascade":
      yield* polaroidCascade(view);
      break;
    case "crime-mugshot":
      yield* mugshot(view);
      break;
    case "crime-evidence-tag":
      yield* evidenceTag(view);
      break;
    case "crime-fingerprint":
      yield* fingerprintScan(view);
      break;
    case "crime-timeline":
      yield* crimeTimeline(view);
      break;
    case "crime-location-pin":
      yield* crimePin(view);
      break;
    case "crime-clipping":
      yield* clippingSlap(view);
      break;
    case "crime-folder":
      yield* folderOpen(view);
      break;
    case "crime-transcript":
      yield* transcriptType(view);
      break;
    case "crime-cctv":
      yield* cctvOverlay(view);
      break;
    case "crime-chalk":
      yield* chalkOutline(view);
      break;
    case "crime-photo-grid":
      yield* photoGrid(view);
      break;
    case "crime-wanted":
      yield* wantedPoster(view);
      break;
    case "crime-custody":
      yield* custodyLabel(view);
      break;
    case "crime-confession":
      yield* confessionQuote(view);
      break;
    case "crime-ballistic":
      yield* ballisticNote(view);
      break;
    case "crime-night-zoom":
      yield* nightZoom(view);
      break;
    case "crime-redacted":
      yield* redactedBlock(view);
      break;
    case "crime-blood-trail":
      yield* bloodTrail(view);
      break;
    default:
      yield* crimeBoard(view);
  }
}
