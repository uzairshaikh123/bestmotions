/** @jsxImportSource @revideo/2d/lib */
import { Circle, Layout, Rect, Txt } from "@revideo/2d";
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  str,
  titleSlam,
  waitFor,
} from "../../lib/helpers";
import { itemDelays, pause, timing } from "../../lib/timing";

const SERIF = "Libre Baskerville, Georgia, serif";
const SANS = "Plus Jakarta Sans, Segoe UI, sans-serif";

function lines(raw: string, fallback: string, max = 5): string[] {
  return (raw || fallback)
    .split(/\n|;/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);
}

/** Split slam — BUT left, WHY? right with giant mark. */
function* butWhy(view: any) {
  const prefix = str("prefix", "BUT");
  const question = str("question", "WHY?");
  const support = str("support", "Why did nobody stop it?");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#05070b");
  const t = timing();
  view.fill(bg);
  const left = createRef<Txt>();
  const right = createRef<Txt>();
  const mark = createRef<Txt>();
  const sub = createRef<Txt>();
  const slash = createRef<Rect>();
  yield view.add(<Rect ref={slash} width={4} height={0} fill={accent} />);
  yield view.add(
    <Txt ref={left} text={prefix} fill={accent} fontFamily={SERIF} fontSize={72} fontWeight={700} x={-280} opacity={0} />,
  );
  yield view.add(
    <Txt ref={right} text={question} fill={"#fff"} fontFamily={SERIF} fontSize={96} fontWeight={700} x={220} scale={0.4} opacity={0} />,
  );
  yield view.add(
    <Txt ref={mark} text={"?"} fill={accent} fontFamily={SERIF} fontSize={180} fontWeight={700} x={420} y={-40} opacity={0.12} scale={0.5} />,
  );
  yield view.add(
    <Txt ref={sub} text={support} fill={"#9aa3ad"} fontFamily={SANS} fontSize={22} y={160} opacity={0} width={900} textAlign={"center"} textWrap />,
  );
  yield* pause(t.startDelay);
  yield* all(
    left().opacity(1, t.revealDuration, easeOutCubic),
    left().x(-220, t.revealDuration, easeOutBack),
    slash().height(160, t.lineDuration, easeOutCubic),
  );
  yield* pause(t.stepDelay);
  yield* all(
    right().opacity(1, t.revealDuration, easeOutCubic),
    right().scale(1, t.revealDuration, easeOutBack),
    mark().opacity(0.22, t.revealDuration, easeOutCubic),
    mark().scale(1, t.revealDuration, easeOutBack),
  );
  yield* pause(t.connectDelay);
  yield* sub().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.3);
}

/** Typewriter question with cursor, then underline. */
function* realQuestion(view: any) {
  const eyebrow = str("eyebrow", "THE REAL QUESTION");
  const title = str("title", "Who actually made the call?");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#07090e");
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={eyebrow} fill={accent} fontFamily={SANS} fontSize={14} letterSpacing={8} y={-180} />,
  );
  const typed = createRef<Txt>();
  const cursor = createRef<Rect>();
  const rule = createRef<Rect>();
  yield view.add(
    <Txt ref={typed} text={""} fill={"#f4efe6"} fontFamily={SERIF} fontSize={48} fontWeight={700} width={980} textWrap textAlign={"center"} y={-20} />,
  );
  yield view.add(<Rect ref={cursor} width={3} height={48} fill={accent} y={-20} x={-20} />);
  yield view.add(<Rect ref={rule} width={0} height={6} fill={accent} y={120} radius={3} />);
  yield* pause(t.startDelay);
  const chars = title.split("");
  let built = "";
  for (let i = 0; i < chars.length; i++) {
    built += chars[i];
    typed().text(built);
    cursor().x(Math.min(420, -40 + built.length * 11));
    yield* waitFor(0.028);
  }
  yield* pause(t.stepDelay);
  yield* all(
    cursor().opacity(0, 0.2, easeOutCubic),
    rule().width(380, t.lineDuration, easeOutCubic),
  );
  yield* waitFor(1.2);
}

/** Glitch shake + scanline for “how did this happen”. */
function* howDidThisHappen(view: any) {
  const part = str("part", "CHAPTER");
  const title = str("title", "How did this happen?");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#05070b");
  const t = timing();
  view.fill(bg);
  const block = createRef<Layout>();
  const scan = createRef<Rect>();
  yield view.add(
    <Layout ref={block}>
      <Txt text={part} fill={accent} fontFamily={SANS} fontSize={16} letterSpacing={10} y={-90} />
      <Txt text={title} fill={"#fff"} fontFamily={SERIF} fontSize={54} fontWeight={700} width={980} textAlign={"center"} textWrap />
    </Layout>,
  );
  yield view.add(<Rect ref={scan} width={1280} height={8} fill={accent} opacity={0.35} y={-360} />);
  yield* pause(t.startDelay);
  yield* scan().y(360, t.lineDuration * 1.4, easeOutCubic);
  for (const dx of [-18, 14, -10, 8, 0]) {
    yield* block().x(dx, 0.05, easeOutCubic);
  }
  yield* waitFor(1.3);
}

/** Arrow wipe into next beat. */
function* whatHappenedNext(view: any) {
  const part = str("part", "NEXT");
  const title = str("title", "What happened next?");
  const accent = str("accent", "#fb7185");
  const bg = str("bg", "#05070b");
  const t = timing();
  view.fill(bg);
  const wipe = createRef<Rect>();
  const arrow = createRef<Txt>();
  const head = createRef<Txt>();
  yield view.add(<Rect ref={wipe} width={0} height={720} fill={accent} x={-640} offset={[-1, 0]} opacity={0.18} />);
  yield view.add(
    <Txt ref={arrow} text={"→"} fill={accent} fontFamily={SANS} fontSize={96} x={-520} opacity={0} />,
  );
  yield view.add(
    <Txt ref={head} text={title} fill={"#fff"} fontFamily={SERIF} fontSize={48} fontWeight={700} x={80} opacity={0} width={800} textWrap />,
  );
  yield view.add(
    <Txt text={part} fill={accent} fontFamily={SANS} fontSize={16} letterSpacing={8} y={-140} x={80} />,
  );
  yield* pause(t.startDelay);
  yield* wipe().width(1280, t.lineDuration, easeOutCubic);
  yield* all(
    arrow().opacity(1, t.revealDuration, easeOutCubic),
    arrow().x(-360, t.revealDuration, easeOutBack),
    head().opacity(1, t.revealDuration, easeOutCubic),
  );
  yield* waitFor(1.3);
}

/** Problem stack with X marks. */
function* heresTheProblem(view: any) {
  const eyebrow = str("eyebrow", "HERE'S THE PROBLEM");
  const title = str("title", "The numbers never added up.");
  const items = lines(str("items", "Missing pages\nConflicting timelines\nSilent witnesses"), "Missing pages", 4);
  const accent = str("accent", "#f59e0b");
  const bg = str("bg", "#07090e");
  const t = timing();
  const extra = itemDelays(items.length);
  view.fill(bg);
  yield view.add(
    <Txt text={eyebrow} fill={accent} fontFamily={SANS} fontSize={14} letterSpacing={7} y={-260} />,
  );
  yield view.add(
    <Txt text={title} fill={"#fff"} fontFamily={SERIF} fontSize={36} fontWeight={700} y={-190} width={980} textAlign={"center"} textWrap />,
  );
  yield* pause(t.startDelay);
  for (let i = 0; i < items.length; i++) {
    yield* pause(extra[i]);
    if (i > 0) yield* pause(t.stepDelay);
    const row = createRef<Layout>();
    const y = -80 + i * 90;
    yield view.add(
      <Layout ref={row} y={y} x={-60} opacity={0}>
        <Txt text={"✕"} fill={accent} fontFamily={SANS} fontSize={28} fontWeight={700} x={-320} />
        <Rect width={700} height={64} fill={"#141018"} radius={12} />
        <Txt text={items[i]} fill={"#f4efe6"} fontFamily={SANS} fontSize={24} />
      </Layout>,
    );
    yield* all(
      row().opacity(1, t.revealDuration, easeOutCubic),
      row().x(0, t.revealDuration, easeOutBack),
    );
  }
  yield* waitFor(1.2);
}

/** Redaction bars peel to reveal the truth. */
function* shockingTruth(view: any) {
  const stamp = str("stamp", "THE TRUTH");
  const line = str("line", "What the cameras didn't show");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#05070b");
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={stamp} fill={accent} fontFamily={SERIF} fontSize={64} fontWeight={700} y={-40} />,
  );
  yield view.add(
    <Txt text={line} fill={"#c5ccd6"} fontFamily={SANS} fontSize={22} y={60} width={900} textAlign={"center"} textWrap />,
  );
  const bars = [createRef<Rect>(), createRef<Rect>(), createRef<Rect>()];
  const widths = [520, 680, 440];
  const ys = [-50, 10, 70];
  for (let i = 0; i < bars.length; i++) {
    yield view.add(
      <Rect ref={bars[i]} width={widths[i]} height={42} fill={"#1a1a1a"} y={ys[i]} radius={4} />,
    );
  }
  yield* pause(t.startDelay);
  yield* all(
    bars[0]().x(900, t.lineDuration, easeOutCubic),
    bars[0]().opacity(0, t.lineDuration, easeOutCubic),
  );
  yield* pause(t.stepDelay);
  yield* all(
    bars[1]().x(-900, t.lineDuration, easeOutCubic),
    bars[1]().opacity(0, t.lineDuration, easeOutCubic),
  );
  yield* pause(t.stepDelay);
  yield* all(
    bars[2]().x(900, t.lineDuration, easeOutCubic),
    bars[2]().opacity(0, t.lineDuration, easeOutCubic),
  );
  yield* waitFor(1.2);
}

/** Tiny catch zooms to fill the frame. */
function* theresACatch(view: any) {
  const prefix = str("prefix", "BUT");
  const question = str("question", "There's a catch.");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#05070b");
  const t = timing();
  view.fill(bg);
  const fine = createRef<Txt>();
  const big = createRef<Txt>();
  yield view.add(
    <Txt text={prefix} fill={accent} fontFamily={SANS} fontSize={18} letterSpacing={10} y={-200} />,
  );
  yield view.add(
    <Txt ref={fine} text={"* fine print"} fill={"#6b7280"} fontFamily={SANS} fontSize={14} y={220} opacity={0.7} />,
  );
  yield view.add(
    <Txt ref={big} text={question} fill={"#fff"} fontFamily={SERIF} fontSize={52} fontWeight={700} scale={0.15} opacity={0} width={900} textAlign={"center"} textWrap />,
  );
  yield* pause(t.startDelay);
  yield* fine().y(40, t.lineDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* all(
    fine().opacity(0, t.revealDuration * 0.5, easeOutCubic),
    big().opacity(1, t.revealDuration, easeOutCubic),
    big().scale(1, t.revealDuration * 1.2, easeOutBack),
  );
  yield* waitFor(1.3);
}

/** Correct line crossed out, mistake highlights. */
function* biggestMistake(view: any) {
  const stamp = str("stamp", "MISTAKE");
  const correct = str("correct", "They waited for confirmation");
  const line = str("line", "They moved before anyone checked");
  const accent = str("accent", "#ef4444");
  const bg = str("bg", "#05070b");
  const t = timing();
  view.fill(bg);
  const wrong = createRef<Txt>();
  const strike = createRef<Rect>();
  const badge = createRef<Layout>();
  yield view.add(
    <Txt text={correct} fill={"#6b7280"} fontFamily={SERIF} fontSize={28} y={-80} />,
  );
  yield view.add(<Rect ref={strike} width={0} height={4} fill={accent} y={-80} />);
  yield view.add(
    <Txt ref={wrong} text={line} fill={"#fff"} fontFamily={SERIF} fontSize={40} fontWeight={700} y={60} opacity={0} width={960} textAlign={"center"} textWrap />,
  );
  yield view.add(
    <Layout ref={badge} y={200} opacity={0} scale={0.8}>
      <Rect width={220} height={48} fill={accent} radius={8} />
      <Txt text={stamp} fill={"#fff"} fontFamily={SANS} fontSize={18} fontWeight={700} letterSpacing={4} />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* strike().width(560, t.lineDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* wrong().opacity(1, t.revealDuration, easeOutCubic);
  yield* all(
    badge().opacity(1, t.revealDuration, easeOutCubic),
    badge().scale(1, t.revealDuration, easeOutBack),
  );
  yield* waitFor(1.3);
}

/** Countdown then unexpected slam. */
function* nobodyExpected(view: any) {
  const stamp = str("stamp", "UNEXPECTED");
  const line = str("line", "Nobody saw this coming");
  const accent = str("accent", "#a855f7");
  const bg = str("bg", "#07060c");
  const t = timing();
  view.fill(bg);
  const count = createRef<Txt>();
  const reveal = createRef<Txt>();
  yield view.add(
    <Txt ref={count} text={"3"} fill={accent} fontFamily={SERIF} fontSize={140} fontWeight={700} />,
  );
  yield view.add(
    <Txt ref={reveal} text={stamp} fill={accent} fontFamily={SERIF} fontSize={72} fontWeight={700} opacity={0} scale={2.2} rotation={-8} />,
  );
  yield view.add(
    <Txt text={line} fill={"#c5ccd6"} fontFamily={SANS} fontSize={20} y={150} />,
  );
  yield* pause(t.startDelay);
  for (const n of ["3", "2", "1"]) {
    count().text(n);
    count().scale(1.2);
    yield* count().scale(1, 0.35, easeOutCubic);
    yield* pause(0.2);
  }
  yield* count().opacity(0, 0.12, easeOutCubic);
  yield* all(
    reveal().opacity(1, t.revealDuration * 0.5, easeOutCubic),
    reveal().scale(1, t.revealDuration, easeOutBack),
  );
  yield* waitFor(1.3);
}

/** Fog lifts to reveal the secret. */
function* whatTheyDidntKnow(view: any) {
  const eyebrow = str("eyebrow", "WHAT THEY DIDN'T KNOW");
  const title = str("title", "The file was never meant to surface.");
  const accent = str("accent", "#38bdf8");
  const bg = str("bg", "#05080d");
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={eyebrow} fill={accent} fontFamily={SANS} fontSize={14} letterSpacing={7} y={-160} />,
  );
  yield view.add(
    <Txt text={title} fill={"#f4efe6"} fontFamily={SERIF} fontSize={44} fontWeight={700} width={920} textAlign={"center"} textWrap />,
  );
  const fog = createRef<Rect>();
  yield view.add(<Rect ref={fog} width={1280} height={420} fill={"#0a1520"} opacity={0.92} />);
  yield* pause(t.startDelay);
  yield* all(
    fog().opacity(0, t.lineDuration * 1.6, easeOutCubic),
    fog().y(-80, t.lineDuration * 1.6, easeOutCubic),
  );
  yield* waitFor(1.3);
}

/** Tiny text zooms into focus. */
function* hiddenProblem(view: any) {
  const eyebrow = str("eyebrow", "THE HIDDEN PROBLEM");
  const title = str("title", "It was buried in the footnotes.");
  const accent = str("accent", "#f59e0b");
  const bg = str("bg", "#07090e");
  const t = timing();
  view.fill(bg);
  const lens = createRef<Circle>();
  const text = createRef<Layout>();
  yield view.add(
    <Layout ref={text} scale={0.35} y={40}>
      <Txt text={eyebrow} fill={accent} fontFamily={SANS} fontSize={14} letterSpacing={6} y={-70} />
      <Txt text={title} fill={"#fff"} fontFamily={SERIF} fontSize={42} fontWeight={700} width={900} textAlign={"center"} textWrap />
    </Layout>,
  );
  yield view.add(
    <Circle ref={lens} size={220} fill={null} stroke={accent} lineWidth={4} opacity={0} y={40} />,
  );
  yield* pause(t.startDelay);
  yield* lens().opacity(1, t.revealDuration, easeOutCubic);
  yield* all(
    text().scale(1, t.lineDuration * 1.4, easeOutCubic),
    lens().size(520, t.lineDuration * 1.4, easeOutCubic),
    lens().opacity(0, t.lineDuration * 1.4, easeOutCubic),
  );
  yield* waitFor(1.2);
}

/** Before → After wipe. */
function* everythingChanged(view: any) {
  const before = str("before", "BEFORE");
  const after = str("after", "AFTER");
  const title = str("title", "Everything changed when…");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#05070b");
  const t = timing();
  view.fill(bg);
  const left = createRef<Rect>();
  const right = createRef<Rect>();
  const divider = createRef<Rect>();
  yield view.add(<Rect ref={left} width={640} height={720} fill={"#121018"} x={-320} />);
  yield view.add(<Rect ref={right} width={640} height={720} fill={"#1a0c10"} x={320} />);
  yield view.add(
    <Txt text={before} fill={"#6b7280"} fontFamily={SANS} fontSize={22} letterSpacing={8} x={-320} y={-200} />,
  );
  yield view.add(
    <Txt text={after} fill={accent} fontFamily={SANS} fontSize={22} letterSpacing={8} x={320} y={-200} />,
  );
  yield view.add(
    <Txt text={title} fill={"#fff"} fontFamily={SERIF} fontSize={40} fontWeight={700} width={900} textAlign={"center"} textWrap y={20} />,
  );
  yield view.add(<Rect ref={divider} width={6} height={0} fill={accent} />);
  yield* pause(t.startDelay);
  yield* divider().height(480, t.lineDuration, easeOutCubic);
  yield* all(
    left().x(-420, t.revealDuration, easeOutCubic),
    right().x(420, t.revealDuration, easeOutCubic),
  );
  yield* waitFor(1.3);
}

/** Ellipsis builds, then hard cut to the line. */
function* andThen(view: any) {
  const prefix = str("prefix", "AND THEN");
  const question = str("question", "…everything went quiet.");
  const accent = str("accent", "#fb7185");
  const bg = str("bg", "#05070b");
  const t = timing();
  view.fill(bg);
  const dots = createRef<Txt>();
  const line = createRef<Txt>();
  yield view.add(
    <Txt text={prefix} fill={accent} fontFamily={SANS} fontSize={18} letterSpacing={10} y={-120} />,
  );
  yield view.add(
    <Txt ref={dots} text={""} fill={"#fff"} fontFamily={SERIF} fontSize={96} fontWeight={700} />,
  );
  yield view.add(
    <Txt ref={line} text={question} fill={"#fff"} fontFamily={SERIF} fontSize={44} fontWeight={700} opacity={0} width={900} textAlign={"center"} textWrap />,
  );
  yield* pause(t.startDelay);
  for (const d of [".", "..", "..."]) {
    dots().text(d);
    yield* pause(0.28);
  }
  yield* pause(t.stepDelay);
  yield* dots().opacity(0, 0.12, easeOutCubic);
  yield* line().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.3);
}

/** Question fades out, answer slams in. */
function* theAnswerIs(view: any) {
  const ask = str("ask", "So what was it really about?");
  const prefix = str("prefix", "THE ANSWER IS");
  const question = str("question", "It was never about the money.");
  const accent = str("accent", "#22c55e");
  const bg = str("bg", "#050a08");
  const t = timing();
  view.fill(bg);
  const q = createRef<Txt>();
  const a = createRef<Layout>();
  yield view.add(
    <Txt ref={q} text={ask} fill={"#9aa3ad"} fontFamily={SERIF} fontSize={32} fontStyle={"italic"} width={900} textAlign={"center"} textWrap />,
  );
  yield view.add(
    <Layout ref={a} opacity={0} scale={0.85}>
      <Txt text={prefix} fill={accent} fontFamily={SANS} fontSize={16} letterSpacing={8} y={-70} />
      <Txt text={question} fill={"#fff"} fontFamily={SERIF} fontSize={44} fontWeight={700} width={920} textAlign={"center"} textWrap />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* pause(0.6);
  yield* q().opacity(0, t.revealDuration, easeOutCubic);
  yield* all(
    a().opacity(1, t.revealDuration, easeOutCubic),
    a().scale(1, t.revealDuration, easeOutBack),
  );
  yield* waitFor(1.3);
}

/** Interrupt banner cuts the frame. */
function* butWait(view: any) {
  const prefix = str("prefix", "BUT WAIT");
  const question = str("question", "That's not the full story.");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#05070b");
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={"Continuing…"} fill={"#4b5563"} fontFamily={SANS} fontSize={28} y={-40} />,
  );
  const banner = createRef<Layout>();
  yield view.add(
    <Layout ref={banner} y={-400}>
      <Rect width={1280} height={160} fill={accent} />
      <Txt text={prefix} fill={"#fff"} fontFamily={SANS} fontSize={42} fontWeight={700} letterSpacing={6} y={-24} />
      <Txt text={question} fill={"#ffe4e6"} fontFamily={SERIF} fontSize={26} y={36} />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* pause(0.45);
  yield* banner().y(0, t.revealDuration, easeOutBack);
  yield* waitFor(1.4);
}

/** Expected card shrinks; twist card expands. */
function* plotTwist(view: any) {
  const stamp = str("stamp", "PLOT TWIST");
  const line = str("line", "The suspect was never alone");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#05070b");
  const t = timing();
  view.fill(bg);
  const front = createRef<Layout>();
  const back = createRef<Layout>();
  yield view.add(
    <Layout ref={front}>
      <Rect width={780} height={360} fill={"#141018"} radius={20} />
      <Txt text={"EXPECTED"} fill={"#6b7280"} fontFamily={SANS} fontSize={18} letterSpacing={8} y={-80} />
      <Txt text={"The usual suspect"} fill={"#9aa3ad"} fontFamily={SERIF} fontSize={36} y={10} />
    </Layout>,
  );
  yield view.add(
    <Layout ref={back} scale={[0.02, 1]} opacity={0}>
      <Rect width={780} height={360} fill={"#1a0c10"} radius={20} stroke={accent} lineWidth={3} />
      <Txt text={stamp} fill={accent} fontFamily={SERIF} fontSize={52} fontWeight={700} y={-40} />
      <Txt text={line} fill={"#f4efe6"} fontFamily={SANS} fontSize={24} y={50} width={680} textAlign={"center"} textWrap />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* front().scale([0.02, 1], t.lineDuration * 0.55, easeOutCubic);
  yield* front().opacity(0, 0.05, easeOutCubic);
  yield* all(
    back().opacity(1, 0.05, easeOutCubic),
    back().scale([1, 1], t.lineDuration * 0.7, easeOutBack),
  );
  yield* waitFor(1.3);
}

/** Timeline pin drops on the pivot. */
function* thingsChanged(view: any) {
  const part = str("part", "ACT II");
  const title = str("title", "This is where things changed");
  const accent = str("accent", "#c084fc");
  const bg = str("bg", "#08060f");
  const t = timing();
  view.fill(bg);
  const rail = createRef<Rect>();
  const pin = createRef<Circle>();
  yield view.add(<Rect ref={rail} width={0} height={6} fill={"#2a2438"} y={80} />);
  yield view.add(<Circle ref={pin} size={28} fill={accent} y={-200} x={40} />);
  yield view.add(
    <Txt text={part} fill={accent} fontFamily={SANS} fontSize={16} letterSpacing={8} y={-160} />,
  );
  yield view.add(
    <Txt text={title} fill={"#fff"} fontFamily={SERIF} fontSize={42} fontWeight={700} y={-40} width={900} textAlign={"center"} textWrap />,
  );
  yield* pause(t.startDelay);
  yield* rail().width(900, t.lineDuration, easeOutCubic);
  yield* pin().y(80, t.revealDuration, easeOutBack);
  yield* waitFor(1.3);
}

/** Numbered steps cascade. */
function* heresWhatHappened(view: any) {
  const part = str("part", "RECAP");
  const title = str("title", "Here's what happened");
  const steps = lines(
    str("steps", "The tip came in\nCameras went dark\nThe story flipped"),
    "The tip came in",
    4,
  );
  const accent = str("accent", "#38bdf8");
  const bg = str("bg", "#05080d");
  const t = timing();
  const extra = itemDelays(steps.length);
  view.fill(bg);
  yield view.add(
    <Txt text={part} fill={accent} fontFamily={SANS} fontSize={14} letterSpacing={8} y={-260} />,
  );
  yield view.add(
    <Txt text={title} fill={"#fff"} fontFamily={SERIF} fontSize={34} fontWeight={700} y={-200} />,
  );
  yield* pause(t.startDelay);
  for (let i = 0; i < steps.length; i++) {
    yield* pause(extra[i]);
    if (i > 0) yield* pause(t.stepDelay);
    const row = createRef<Layout>();
    const y = -90 + i * 100;
    yield view.add(
      <Layout ref={row} y={y + 30} opacity={0}>
        <Circle size={44} fill={accent} x={-340} />
        <Txt text={String(i + 1)} fill={"#041018"} fontFamily={SANS} fontSize={20} fontWeight={700} x={-340} />
        <Txt text={steps[i]} fill={"#e8eef6"} fontFamily={SANS} fontSize={26} x={-40} width={700} />
      </Layout>,
    );
    yield* all(
      row().opacity(1, t.revealDuration, easeOutCubic),
      row().y(y, t.revealDuration, easeOutBack),
    );
  }
  yield* waitFor(1.2);
}

/** Impact bars for stakes. */
function* whyThisMatters(view: any) {
  const eyebrow = str("eyebrow", "WHY THIS MATTERS");
  const title = str("title", "Because it can happen again.");
  const accent = str("accent", "#f59e0b");
  const bg = str("bg", "#07090e");
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={eyebrow} fill={accent} fontFamily={SANS} fontSize={14} letterSpacing={7} y={-220} />,
  );
  yield view.add(
    <Txt text={title} fill={"#fff"} fontFamily={SERIF} fontSize={40} fontWeight={700} y={-140} width={960} textAlign={"center"} textWrap />,
  );
  const heights = [90, 150, 220];
  const labels = ["Local", "National", "You"];
  yield* pause(t.startDelay);
  for (let i = 0; i < 3; i++) {
    const bar = createRef<Rect>();
    const x = -220 + i * 220;
    yield view.add(
      <Rect ref={bar} width={90} height={0} fill={accent} x={x} y={200} offset={[0, 1]} radius={10} opacity={0.35 + i * 0.3} />,
    );
    yield view.add(
      <Txt text={labels[i]} fill={"#9aa3ad"} fontFamily={SANS} fontSize={16} x={x} y={230} />,
    );
    yield* bar().height(heights[i], t.lineDuration, easeOutCubic);
    if (i < 2) yield* pause(t.stepDelay);
  }
  yield* waitFor(1.3);
}

/** Film title card with letterbox. */
function* realStory(view: any) {
  const eyebrow = str("eyebrow", "THE REAL STORY");
  const title = str("title", "What was really happening?");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#07090e");
  const t = timing();
  view.fill(bg);
  const top = createRef<Rect>();
  const bot = createRef<Rect>();
  const eye = createRef<Txt>();
  const head = createRef<Txt>();
  const rule = createRef<Rect>();
  yield view.add(<Rect ref={top} width={1280} height={0} fill={"#000"} y={-360} offset={[0, -1]} />);
  yield view.add(<Rect ref={bot} width={1280} height={0} fill={"#000"} y={360} offset={[0, 1]} />);
  yield view.add(
    <Txt ref={eye} text={eyebrow} fill={accent} fontFamily={SANS} fontSize={16} letterSpacing={10} y={-80} opacity={0} />,
  );
  yield view.add(
    <Txt ref={head} text={title} fill={"#f4efe6"} fontFamily={SERIF} fontSize={48} fontWeight={700} width={920} textAlign={"center"} textWrap opacity={0} />,
  );
  yield view.add(<Rect ref={rule} width={0} height={4} fill={accent} y={100} />);
  yield* pause(t.startDelay);
  yield* all(
    top().height(110, t.lineDuration, easeOutCubic),
    bot().height(110, t.lineDuration, easeOutCubic),
  );
  yield* eye().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* head().opacity(1, t.revealDuration, easeOutCubic);
  yield* rule().width(280, t.lineDuration, easeOutCubic);
  yield* waitFor(1.3);
}

export function* runHooks(view: any, template: string) {
  switch (template) {
    case "hook-but-why":
      yield* butWhy(view);
      break;
    case "hook-real-question":
      yield* realQuestion(view);
      break;
    case "hook-how-did-this-happen":
      yield* howDidThisHappen(view);
      break;
    case "hook-what-happened-next":
      yield* whatHappenedNext(view);
      break;
    case "hook-heres-the-problem":
      yield* heresTheProblem(view);
      break;
    case "hook-shocking-truth":
      yield* shockingTruth(view);
      break;
    case "hook-theres-a-catch":
      yield* theresACatch(view);
      break;
    case "hook-biggest-mistake":
      yield* biggestMistake(view);
      break;
    case "hook-nobody-expected":
      yield* nobodyExpected(view);
      break;
    case "hook-what-they-didnt-know":
      yield* whatTheyDidntKnow(view);
      break;
    case "hook-hidden-problem":
      yield* hiddenProblem(view);
      break;
    case "hook-everything-changed":
      yield* everythingChanged(view);
      break;
    case "hook-and-then":
      yield* andThen(view);
      break;
    case "hook-the-answer-is":
      yield* theAnswerIs(view);
      break;
    case "hook-but-wait":
      yield* butWait(view);
      break;
    case "hook-plot-twist":
      yield* plotTwist(view);
      break;
    case "hook-things-changed":
      yield* thingsChanged(view);
      break;
    case "hook-heres-what-happened":
      yield* heresWhatHappened(view);
      break;
    case "hook-why-this-matters":
      yield* whyThisMatters(view);
      break;
    case "hook-real-story":
      yield* realStory(view);
      break;
    default:
      yield* titleSlam(view, {
        eyebrow: "HOOK",
        title: str("title", "The Real Question"),
        subtitle: str("subtitle", ""),
        accent: str("accent", "#e63946"),
        bg: str("bg", "#07090e"),
      });
  }
}
