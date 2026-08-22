/** @jsxImportSource @revideo/2d/lib */
import { Circle, Layout, Rect, Txt } from "@revideo/2d";
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  num,
  str,
  titleSlam,
  waitFor,
} from "../../lib/helpers";
import { itemDelays, pause, timing } from "../../lib/timing";

const SERIF = "Libre Baskerville, Georgia, serif";

function lines(raw: string, fallback: string): string[] {
  return (raw || fallback)
    .split(/\n|;/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
}

/** Classic topic-video opener: eyebrow, giant hook, red underline. */
function* topicSlam(view: any) {
  const eyebrow = str("eyebrow", "THE REAL STORY");
  const title = str("title", "What was really happening?");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#07090e");
  const t = timing();
  view.fill(bg);
  const kicker = createRef<Txt>();
  const hook = createRef<Txt>();
  const rule = createRef<Rect>();
  yield view.add(
    <Txt ref={kicker} text={eyebrow} fill={accent} fontFamily={SERIF} fontSize={16} letterSpacing={8} y={-160} opacity={0} />,
  );
  yield view.add(
    <Txt ref={hook} text={title} fill={"#f4efe6"} fontFamily={SERIF} fontSize={52} fontWeight={700} y={-10} width={980} textWrap textAlign={"center"} opacity={0} />,
  );
  yield view.add(<Rect ref={rule} width={0} height={8} fill={accent} y={120} radius={4} />);
  yield* pause(t.startDelay);
  yield* kicker().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* hook().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* rule().width(420, t.lineDuration, easeOutCubic);
  yield* waitFor(1.4);
}

/** PART 01 chapter bumper — Nitish section cut. */
function* partBumper(view: any) {
  const part = str("part", "PART 01");
  const title = str("title", "How it started");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#05070b");
  const t = timing();
  view.fill(bg);
  const bar = createRef<Rect>();
  const p = createRef<Txt>();
  const txt = createRef<Txt>();
  yield view.add(<Rect ref={bar} width={8} height={0} fill={accent} x={-420} y={-40} />);
  yield view.add(
    <Txt ref={p} text={part} fill={accent} fontFamily={SERIF} fontSize={18} letterSpacing={10} y={-80} x={-120} opacity={0} />,
  );
  yield view.add(
    <Txt ref={txt} text={title} fill={"#ffffff"} fontFamily={SERIF} fontSize={48} fontWeight={700} y={20} x={40} opacity={0} />,
  );
  yield* pause(t.startDelay);
  yield* bar().height(180, t.lineDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* p().opacity(1, t.revealDuration, easeOutCubic);
  yield* txt().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.4);
}

/** Dossier page with CLASSIFIED stamp and growing redaction bars. */
function* redactedFile(view: any) {
  const stamp = str("stamp", "CLASSIFIED");
  const title = str("title", "Case File 09");
  const line1 = str("line1", "Subject: Network of influence");
  const line2 = str("line2", "Status: Under review");
  const line3 = str("line3", "Pages: ████████  ·  ███");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#0b0e14");
  const t = timing();
  view.fill(bg);
  const page = createRef<Rect>();
  yield view.add(
    <Rect ref={page} width={720} height={460} fill={"#e8dfc8"} y={20} rotation={-1.5} opacity={0} shadowBlur={28} shadowColor={"#00000088"} />,
  );
  yield* pause(t.startDelay);
  yield* page().opacity(1, t.revealDuration, easeOutCubic);
  yield view.add(
    <Txt text={title} fill={"#1a1510"} fontFamily={SERIF} fontSize={28} fontWeight={700} y={-140} />,
  );
  yield view.add(<Txt text={line1} fill={"#2c261f"} fontFamily={SERIF} fontSize={18} y={-60} />);
  yield view.add(<Txt text={line2} fill={"#2c261f"} fontFamily={SERIF} fontSize={18} y={-10} />);
  yield view.add(<Txt text={line3} fill={"#2c261f"} fontFamily={SERIF} fontSize={18} y={50} />);
  const b1 = createRef<Rect>();
  const b2 = createRef<Rect>();
  yield view.add(<Rect ref={b1} width={0} height={22} fill={"#111"} y={-8} x={-80} />);
  yield view.add(<Rect ref={b2} width={0} height={22} fill={"#111"} y={52} x={-40} />);
  const st = createRef<Txt>();
  yield view.add(
    <Txt ref={st} text={stamp} fill={accent} fontFamily={SERIF} fontSize={36} fontWeight={700} rotation={-16} x={220} y={-120} scale={2.2} opacity={0} />,
  );
  yield* pause(t.connectDelay);
  yield* all(b1().width(220, t.lineDuration, easeOutCubic), b2().width(280, t.lineDuration, easeOutCubic));
  yield* pause(t.stepDelay);
  yield* all(st().scale(1, t.revealDuration, easeOutBack), st().opacity(1, t.revealDuration * 0.6, easeOutCubic));
  yield* waitFor(1.4);
}

/** Three cards + connecting strings — conspiracy board. */
function* evidenceBoard(view: any) {
  const title = str("title", "The network");
  const labels = [
    str("label1", "Person A"),
    str("label2", "Person B"),
    str("label3", "Person C"),
  ];
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#0a0c10");
  const t = timing();
  const extra = itemDelays(3);
  view.fill(bg);
  yield view.add(
    <Txt text={title.toUpperCase()} fill={accent} fontFamily={SERIF} fontSize={14} letterSpacing={6} y={-260} />,
  );
  const cards = [
    { x: -320, y: -40, rot: -8 },
    { x: 0, y: 80, rot: 4 },
    { x: 330, y: -60, rot: 10 },
  ];
  yield* pause(t.startDelay);
  for (let i = 0; i < 3; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const card = createRef<Layout>();
    yield view.add(
      <Layout ref={card} x={cards[i].x} y={cards[i].y} rotation={cards[i].rot} scale={0.4} opacity={0}>
        <Rect width={220} height={250} fill={"#f0e6d2"} shadowBlur={16} />
        <Rect width={180} height={140} fill={"#2a2420"} y={-40} />
        <Txt text={labels[i]} fill={"#1a1510"} fontFamily={SERIF} fontSize={16} fontWeight={700} y={90} />
      </Layout>,
    );
    yield* all(card().scale(1, t.revealDuration, easeOutBack), card().opacity(1, t.revealDuration * 0.6, easeOutCubic));
  }
  yield* pause(t.connectDelay);
  const s1 = createRef<Rect>();
  const s2 = createRef<Rect>();
  yield view.add(<Rect ref={s1} width={0} height={3} fill={accent} x={-160} y={10} rotation={18} />);
  yield view.add(<Rect ref={s2} width={0} height={3} fill={accent} x={160} y={20} rotation={-22} />);
  yield* s1().width(280, t.lineDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* s2().width(280, t.lineDuration, easeOutCubic);
  yield* waitFor(1.3);
}

/** Dossier person: portrait plate + name + role. */
function* personCard(view: any) {
  const name = str("name", "Unknown Subject");
  const role = str("role", "Key figure");
  const detail = str("detail", "Appears across multiple documents and timelines.");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#07090e");
  const t = timing();
  view.fill(bg);
  const photo = createRef<Rect>();
  const bar = createRef<Rect>();
  yield view.add(<Rect ref={photo} width={280} height={360} fill={"#242018"} x={-280} opacity={0} />);
  yield view.add(<Rect ref={bar} width={6} height={0} fill={accent} x={-90} />);
  yield view.add(
    <Txt text={name} fill={"#ffffff"} fontFamily={SERIF} fontSize={40} fontWeight={700} x={200} y={-60} width={420} textWrap />,
  );
  yield view.add(
    <Txt text={role.toUpperCase()} fill={accent} fontFamily={SERIF} fontSize={14} letterSpacing={4} x={200} y={20} />,
  );
  yield view.add(
    <Txt text={detail} fill={"#b8c0c8"} fontFamily={SERIF} fontSize={18} x={200} y={80} width={420} textWrap />,
  );
  yield* pause(t.startDelay);
  yield* photo().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* bar().height(160, t.lineDuration, easeOutCubic);
  yield* waitFor(1.5);
}

/** Giant year slams in — Nitish “turning point” beat. */
function* yearPunch(view: any) {
  const year = String(num("year", 2019));
  const label = str("label", "THE TURNING POINT");
  const subtitle = str("subtitle", "Everything changed after this.");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#05070b");
  const t = timing();
  view.fill(bg);
  const y = createRef<Txt>();
  yield view.add(
    <Txt ref={y} text={year} fill={"#ffffff"} fontFamily={SERIF} fontSize={160} fontWeight={700} scale={2.4} opacity={0} y={-30} />,
  );
  yield view.add(
    <Txt text={label} fill={accent} fontFamily={SERIF} fontSize={16} letterSpacing={8} y={120} />,
  );
  yield view.add(
    <Txt text={subtitle} fill={"#9aa3ad"} fontFamily={SERIF} fontSize={20} y={170} />,
  );
  yield* pause(t.startDelay);
  yield* all(y().scale(1, t.revealDuration, easeOutBack), y().opacity(1, t.revealDuration * 0.6, easeOutCubic));
  yield* waitFor(1.5);
}

/** Map-style pin drop for a place. */
function* locationPin(view: any) {
  const place = str("place", "Jantar Mantar");
  const city = str("city", "New Delhi");
  const detail = str("detail", "The ground where voices gathered.");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#0a1018");
  const t = timing();
  view.fill(bg);
  const ring1 = createRef<Circle>();
  const ring2 = createRef<Circle>();
  const pin = createRef<Circle>();
  yield view.add(<Circle ref={ring1} size={280} stroke={"#1e3a4c"} lineWidth={2} fill={null} y={20} scale={0} />);
  yield view.add(<Circle ref={ring2} size={160} stroke={"#2a4e64"} lineWidth={2} fill={null} y={20} scale={0} />);
  yield view.add(<Circle ref={pin} size={28} fill={accent} y={-220} />);
  yield view.add(
    <Txt text={place} fill={"#f4efe6"} fontFamily={SERIF} fontSize={36} fontWeight={700} y={200} />,
  );
  yield view.add(
    <Txt text={`${city}  ·  ${detail}`} fill={"#8fa0ae"} fontFamily={SERIF} fontSize={16} y={250} width={720} textAlign={"center"} textWrap />,
  );
  yield* pause(t.startDelay);
  yield* all(ring1().scale(1, t.revealDuration, easeOutCubic), ring2().scale(1, t.revealDuration * 0.8, easeOutCubic));
  yield* pause(t.connectDelay);
  yield* pin().y(20, t.revealDuration, easeOutBack);
  yield* waitFor(1.4);
}

/** Numbered facts cascade in from the left. */
function* factCascade(view: any) {
  const title = str("title", "What we know");
  const facts = lines(
    str("facts", "Thousands gathered at the site\nDemands were clear and repeated\nOfficials issued conflicting statements"),
    "Thousands gathered at the site",
  );
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#07090e");
  const t = timing();
  const extra = itemDelays(facts.length);
  view.fill(bg);
  yield view.add(
    <Txt text={title} fill={"#ffffff"} fontFamily={SERIF} fontSize={32} fontWeight={700} x={-360} y={-240} />,
  );
  yield* pause(t.startDelay);
  for (let i = 0; i < facts.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const row = createRef<Layout>();
    yield view.add(
      <Layout ref={row} x={-900} y={-120 + i * 90}>
        <Rect width={36} height={36} fill={accent} x={-360} />
        <Txt text={String(i + 1).padStart(2, "0")} fill={"#fff"} fontFamily={SERIF} fontSize={16} fontWeight={700} x={-360} />
        <Txt text={facts[i]} fill={"#e8eef6"} fontFamily={SERIF} fontSize={22} x={-40} width={700} />
      </Layout>,
    );
    yield* row().x(0, t.revealDuration, easeOutCubic);
  }
  yield* waitFor(1.4);
}

/** BUT + giant question — tension beat. */
function* questionHook(view: any) {
  const prefix = str("prefix", "BUT");
  const question = str("question", "Why did nobody stop it?");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#05070b");
  const t = timing();
  view.fill(bg);
  const but = createRef<Txt>();
  const q = createRef<Txt>();
  yield view.add(
    <Txt ref={but} text={prefix} fill={accent} fontFamily={SERIF} fontSize={28} letterSpacing={10} y={-140} opacity={0} />,
  );
  yield view.add(
    <Txt ref={q} text={question} fill={"#ffffff"} fontFamily={SERIF} fontSize={48} fontWeight={700} y={20} width={920} textWrap textAlign={"center"} scale={0.7} opacity={0} />,
  );
  yield* pause(t.startDelay);
  yield* but().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* all(q().opacity(1, t.revealDuration, easeOutCubic), q().scale(1, t.revealDuration, easeOutBack));
  yield* waitFor(1.5);
}

/** Huge number slam for crowd / money / pages. */
function* statBomb(view: any) {
  const value = String(num("value", 10000));
  const suffix = str("suffix", "+");
  const label = str("label", "People on the ground");
  const caption = str("caption", "Estimated gathering size");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#07090e");
  const t = timing();
  view.fill(bg);
  const n = createRef<Txt>();
  yield view.add(
    <Txt ref={n} text={`${value}${suffix}`} fill={"#ffffff"} fontFamily={SERIF} fontSize={120} fontWeight={700} y={-80} opacity={0} />,
  );
  yield view.add(
    <Txt text={label} fill={accent} fontFamily={SERIF} fontSize={22} y={90} />,
  );
  yield view.add(
    <Txt text={caption} fill={"#8b949e"} fontFamily={SERIF} fontSize={16} y={140} />,
  );
  yield* pause(t.startDelay);
  yield* n().opacity(1, t.revealDuration * 0.6, easeOutCubic);
  yield* n().y(-20, t.revealDuration, easeOutBack);
  yield* waitFor(1.5);
}

/** Full-bleed B-roll plate + lower third rising. */
function* photoLower(view: any) {
  const title = str("title", "On the ground");
  const subtitle = str("subtitle", "Crowds fill the avenue as night falls");
  const accent = str("accent", "#e63946");
  const t = timing();
  view.fill("#0a0c12");
  const plate = createRef<Rect>();
  const bar = createRef<Layout>();
  yield view.add(<Rect ref={plate} width={1100} height={620} fill={"#1c1814"} scale={1.08} />);
  yield view.add(
    <Layout ref={bar} y={340} x={-200}>
      <Rect width={8} height={90} fill={accent} x={-340} />
      <Txt text={title} fill={"#fff"} fontFamily={SERIF} fontSize={32} fontWeight={700} x={-80} y={-16} />
      <Txt text={subtitle} fill={"#c5ccd6"} fontFamily={SERIF} fontSize={18} x={-40} y={24} />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* all(plate().scale(1, t.lineDuration * 2.8, easeOutCubic), bar().y(220, t.revealDuration, easeOutCubic));
  yield* waitFor(1.2);
}

/** REALITY / EXPOSED stamp slam. */
function* realityStamp(view: any) {
  const stamp = str("stamp", "REALITY");
  const line = str("line", "What the cameras didn’t show");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#05070b");
  const t = timing();
  view.fill(bg);
  const st = createRef<Txt>();
  yield view.add(
    <Txt ref={st} text={stamp} fill={accent} fontFamily={SERIF} fontSize={84} fontWeight={700} rotation={-12} scale={2.6} opacity={0} />,
  );
  yield view.add(
    <Txt text={line} fill={"#c5ccd6"} fontFamily={SERIF} fontSize={20} y={140} />,
  );
  yield* pause(t.startDelay);
  yield* all(st().scale(1, t.revealDuration, easeOutBack), st().opacity(1, t.revealDuration * 0.6, easeOutCubic));
  yield* waitFor(1.4);
}

/** A → B boxes with a drawing connection. */
function* connection(view: any) {
  const fromLabel = str("fromLabel", "Protest site");
  const toLabel = str("toLabel", "Decision makers");
  const claim = str("claim", "A direct line between the street and the statement.");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#07090e");
  const t = timing();
  view.fill(bg);
  const a = createRef<Rect>();
  const b = createRef<Rect>();
  const line = createRef<Rect>();
  yield view.add(<Rect ref={a} width={280} height={140} fill={"#151920"} x={-280} y={-40} opacity={0} />);
  yield view.add(<Rect ref={b} width={280} height={140} fill={"#151920"} x={280} y={-40} opacity={0} />);
  yield view.add(
    <Txt text={fromLabel} fill={"#fff"} fontFamily={SERIF} fontSize={20} fontWeight={700} x={-280} y={-40} />,
  );
  yield view.add(
    <Txt text={toLabel} fill={"#fff"} fontFamily={SERIF} fontSize={20} fontWeight={700} x={280} y={-40} />,
  );
  yield view.add(<Rect ref={line} width={0} height={4} fill={accent} y={-40} />);
  yield view.add(
    <Txt text={claim} fill={"#c5ccd6"} fontFamily={SERIF} fontSize={20} y={160} width={860} textAlign={"center"} textWrap />,
  );
  yield* pause(t.startDelay);
  yield* all(a().opacity(1, t.revealDuration, easeOutCubic), b().opacity(1, t.revealDuration, easeOutCubic));
  yield* pause(t.connectDelay);
  yield* line().width(260, t.lineDuration, easeOutCubic);
  yield* waitFor(1.4);
}

/** Bottom credibility strip: According to… */
function* sourceStrip(view: any) {
  const source = str("source", "According to official records");
  const body = str("body", "Multiple filings mention the same sequence of meetings and transfers.");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#0a0c10");
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={body} fill={"#e8eef6"} fontFamily={SERIF} fontSize={28} fontWeight={700} y={-40} width={900} textWrap textAlign={"center"} />,
  );
  const strip = createRef<Layout>();
  yield view.add(
    <Layout ref={strip} y={360}>
      <Rect width={1280} height={110} fill={"#11151c"} />
      <Rect width={10} height={110} fill={accent} x={-635} />
      <Txt text={source.toUpperCase()} fill={accent} fontFamily={SERIF} fontSize={16} letterSpacing={3} y={0} />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* strip().y(250, t.revealDuration, easeOutCubic);
  yield* waitFor(1.5);
}

/** Horizontal date nodes for chronology. */
function* dateRail(view: any) {
  const title = str("title", "Timeline");
  const raw = str(
    "events",
    "2015|First reports\n2019|Public confrontation\n2021|Documents surface\n2024|Fresh questions",
  );
  const events = lines(raw, "2015|First reports").map((line) => {
    const [year = "", label = line] = line.split("|").map((p) => p.trim());
    return { year: year || label, label: label || year };
  });
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#07090e");
  const t = timing();
  const extra = itemDelays(events.length);
  view.fill(bg);
  yield view.add(
    <Txt text={title} fill={"#ffffff"} fontFamily={SERIF} fontSize={28} fontWeight={700} y={-220} />,
  );
  const rail = createRef<Rect>();
  yield view.add(<Rect ref={rail} width={0} height={4} fill={accent} y={20} />);
  yield* pause(t.startDelay);
  yield* rail().width(920, t.lineDuration, easeOutCubic);
  const n = Math.max(events.length, 1);
  for (let i = 0; i < events.length; i++) {
    yield* pause(t.connectDelay);
    yield* pause(extra[i]);
    if (i > 0) yield* pause(t.stepDelay);
    const x = -420 + (i / Math.max(n - 1, 1)) * 840;
    const node = createRef<Circle>();
    yield view.add(<Circle ref={node} size={18} fill={accent} x={x} y={20} scale={0} />);
    yield view.add(
      <Txt text={events[i].year} fill={accent} fontFamily={SERIF} fontSize={16} x={x} y={-40} />,
    );
    yield view.add(
      <Txt text={events[i].label} fill={"#e8eef6"} fontFamily={SERIF} fontSize={16} x={x} y={80} width={180} textAlign={"center"} textWrap />,
    );
    yield* node().scale(1, t.revealDuration, easeOutBack);
  }
  yield* waitFor(1.4);
}

/** Dark italic quote with a growing red rule. */
function* darkQuote(view: any) {
  const quote = str("quote", "We were never told the full story.");
  const attribution = str("attribution", "— On-ground witness");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#07090e");
  const t = timing();
  view.fill(bg);
  const rule = createRef<Rect>();
  yield view.add(<Rect ref={rule} width={6} height={0} fill={accent} x={-460} />);
  yield view.add(
    <Txt text={`“${quote}”`} fill={"#f4efe6"} fontFamily={SERIF} fontSize={36} fontStyle={"italic"} width={800} textWrap x={40} />,
  );
  yield view.add(
    <Txt text={attribution} fill={"#9aa3ad"} fontFamily={SERIF} fontSize={18} y={140} x={40} />,
  );
  yield* pause(t.startDelay);
  yield* rule().height(200, t.lineDuration, easeOutCubic);
  yield* waitFor(1.5);
}

export function* runYt(view: any, template: string) {
  switch (template) {
    case "yt-topic-slam":
      yield* topicSlam(view);
      break;
    case "yt-part-bumper":
      yield* partBumper(view);
      break;
    case "yt-redacted-file":
      yield* redactedFile(view);
      break;
    case "yt-evidence-board":
      yield* evidenceBoard(view);
      break;
    case "yt-person-card":
      yield* personCard(view);
      break;
    case "yt-year-punch":
      yield* yearPunch(view);
      break;
    case "yt-location-pin":
      yield* locationPin(view);
      break;
    case "yt-fact-cascade":
      yield* factCascade(view);
      break;
    case "yt-question-hook":
      yield* questionHook(view);
      break;
    case "yt-stat-bomb":
      yield* statBomb(view);
      break;
    case "yt-photo-lower":
      yield* photoLower(view);
      break;
    case "yt-reality-stamp":
      yield* realityStamp(view);
      break;
    case "yt-connection":
      yield* connection(view);
      break;
    case "yt-source-strip":
      yield* sourceStrip(view);
      break;
    case "yt-date-rail":
      yield* dateRail(view);
      break;
    case "yt-dark-quote":
      yield* darkQuote(view);
      break;
    default:
      yield* titleSlam(view, {
        eyebrow: "YT",
        title: str("title", "BestMotions"),
        subtitle: str("subtitle", ""),
        accent: str("accent", "#e63946"),
        bg: str("bg", "#07090e"),
      });
  }
}
