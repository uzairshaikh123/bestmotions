/** @jsxImportSource @revideo/2d/lib */
import { Layout, Rect, Txt } from "@revideo/2d";
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  num,
  str,
  waitFor,
} from "../../lib/helpers";
import { pause, timing } from "../../lib/timing";

const SERIF = "Libre Baskerville, Georgia, serif";
const SANS = "Sora, Helvetica, sans-serif";
const MONO = "Courier New, monospace";
const DISPLAY = "Oswald, Arial Narrow, sans-serif";

function* giantWord(view: any) {
  const word = str("word", "EVIDENCE");
  const subtitle = str("subtitle", "What the official story left out");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  const big = createRef<Txt>();
  const rule = createRef<Rect>();
  const sub = createRef<Txt>();
  yield view.add(
    <Txt
      ref={big}
      text={word.toUpperCase()}
      fill={"#ffffff"}
      fontFamily={DISPLAY}
      fontSize={120}
      fontWeight={700}
      letterSpacing={4}
      scale={2.4}
      opacity={0}
      y={-30}
    />,
  );
  yield view.add(<Rect ref={rule} width={0} height={5} fill={accent} y={70} />);
  yield view.add(
    <Txt ref={sub} text={subtitle} fill={"#b8c0c8"} fontFamily={SERIF} fontSize={22} y={120} opacity={0} />,
  );
  yield* pause(t.startDelay);
  yield* all(
    big().scale(1, t.revealDuration, easeOutBack),
    big().opacity(1, t.revealDuration * 0.55, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* rule().width(260, t.lineDuration, easeOutCubic);
  yield* sub().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.2);
}

function* typewriter(view: any) {
  const line = str("line", "They never explained where the money went.");
  const label = str("label", "ARCHIVE NOTE");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  yield view.add(
    <Txt text={label.toUpperCase()} fill={accent} fontFamily={SANS} fontSize={14} letterSpacing={6} y={-80} />,
  );
  const textRef = createRef<Txt>();
  const caret = createRef<Rect>();
  yield view.add(
    <Txt ref={textRef} text={""} fill={"#f4efe6"} fontFamily={MONO} fontSize={28} y={10} width={920} textWrap />,
  );
  yield view.add(<Rect ref={caret} width={3} height={28} fill={accent} x={-440} y={10} />);
  yield* pause(t.startDelay);
  const chars = line.split("");
  const delay = Math.max(0.02, t.lineDuration / Math.max(chars.length, 1));
  for (let i = 0; i < chars.length; i++) {
    textRef().text(line.slice(0, i + 1));
    caret().x(-440 + Math.min(i * 14, 860));
    yield* waitFor(delay);
  }
  yield* waitFor(1.2);
}

function* wordStack(view: any) {
  const raw = str("text", "FOLLOW THE MONEY TRACE THE LIES");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const words = raw.split(/\s+/).filter(Boolean).slice(0, 6);
  const t = timing();
  view.fill(bg);
  yield* pause(t.startDelay);
  for (let i = 0; i < words.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    const y = -150 + i * 70;
    const word = createRef<Txt>();
    const last = i === words.length - 1;
    yield view.add(
      <Txt
        ref={word}
        text={words[i].toUpperCase()}
        fill={last ? accent : "#ffffff"}
        fontFamily={DISPLAY}
        fontSize={last ? 72 : 44}
        fontWeight={700}
        letterSpacing={last ? 6 : 2}
        y={y}
        x={-40}
        opacity={0}
        scale={0.7}
      />,
    );
    yield* all(
      word().opacity(1, t.revealDuration * 0.7, easeOutCubic),
      word().scale(1, t.revealDuration, easeOutBack),
      word().x(0, t.revealDuration, easeOutCubic),
    );
  }
  yield* waitFor(1.2);
}

function* lowerThird(view: any) {
  const name = str("name", "Dr. Amira Shah");
  const role = str("role", "Investigative journalist");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  const bar = createRef<Rect>();
  const plate = createRef<Layout>();
  yield view.add(<Rect ref={bar} width={6} height={0} fill={accent} x={-420} y={180} />);
  yield view.add(
    <Layout ref={plate} x={-200} y={180} opacity={0}>
      <Txt text={name} fill={"#fff"} fontFamily={SANS} fontSize={32} fontWeight={700} />
      <Txt text={role} fill={accent} fontFamily={SERIF} fontSize={18} y={36} />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* bar().height(70, t.lineDuration, easeOutCubic);
  yield* plate().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.4);
}

function* locationChyron(view: any) {
  const place = str("place", "Karachi, Pakistan");
  const date = str("date", "March 12, 2019");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  const row = createRef<Layout>();
  yield view.add(
    <Layout ref={row} y={220} x={-500} opacity={0}>
      <Rect width={8} height={48} fill={accent} x={-10} />
      <Txt text={place} fill={"#fff"} fontFamily={SANS} fontSize={26} fontWeight={700} x={160} />
      <Txt text={date.toUpperCase()} fill={accent} fontFamily={MONO} fontSize={14} letterSpacing={3} x={160} y={28} />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* all(
    row().x(-280, t.revealDuration, easeOutCubic),
    row().opacity(1, t.revealDuration * 0.6, easeOutCubic),
  );
  yield* waitFor(1.3);
}

function* chapterCard(view: any) {
  const chapter = str("chapter", "CHAPTER 03");
  const title = str("title", "The Money Trail");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  const eye = createRef<Txt>();
  const head = createRef<Txt>();
  const rule = createRef<Rect>();
  yield view.add(
    <Txt ref={eye} text={chapter} fill={accent} fontFamily={SANS} fontSize={16} letterSpacing={8} y={-40} opacity={0} />,
  );
  yield view.add(
    <Txt ref={head} text={title} fill={"#fff"} fontFamily={SERIF} fontSize={48} fontWeight={700} y={30} opacity={0} />,
  );
  yield view.add(<Rect ref={rule} width={0} height={3} fill={accent} y={90} />);
  yield* pause(t.startDelay);
  yield* eye().opacity(1, t.revealDuration, easeOutCubic);
  yield* head().opacity(1, t.revealDuration, easeOutCubic);
  yield* rule().width(220, t.lineDuration, easeOutCubic);
  yield* waitFor(1.3);
}

function* yearPunch(view: any) {
  const year = String(num("year", 1991));
  const label = str("label", "THE TURNING POINT");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#05070b");
  const t = timing();
  view.fill(bg);
  const y = createRef<Txt>();
  yield view.add(
    <Txt ref={y} text={year} fill={"#fff"} fontFamily={DISPLAY} fontSize={160} fontWeight={700} scale={2.2} opacity={0} y={-20} />,
  );
  yield view.add(
    <Txt text={label} fill={accent} fontFamily={SANS} fontSize={16} letterSpacing={8} y={120} />,
  );
  yield* pause(t.startDelay);
  yield* all(
    y().scale(1, t.revealDuration, easeOutBack),
    y().opacity(1, t.revealDuration * 0.55, easeOutCubic),
  );
  yield* waitFor(1.3);
}

function* pullQuote(view: any) {
  const quote = str("quote", "Democracy dies in darkness.");
  const who = str("who", "— Editorial board");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  const q = createRef<Txt>();
  const a = createRef<Txt>();
  const rule = createRef<Rect>();
  yield view.add(
    <Txt ref={q} text={`“${quote}”`} fill={"#f4efe6"} fontFamily={SERIF} fontSize={36} fontStyle={"italic"} width={900} textWrap textAlign={"center"} opacity={0} />,
  );
  yield view.add(<Rect ref={rule} width={0} height={3} fill={accent} y={90} />);
  yield view.add(
    <Txt ref={a} text={who} fill={accent} fontFamily={SERIF} fontSize={18} y={130} opacity={0} />,
  );
  yield* pause(t.startDelay);
  yield* q().opacity(1, t.revealDuration, easeOutCubic);
  yield* rule().width(200, t.lineDuration, easeOutCubic);
  yield* a().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.2);
}

function* splitCollide(view: any) {
  const left = str("left", "THEY SAID");
  const right = str("right", "WE FOUND");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  const a = createRef<Txt>();
  const b = createRef<Txt>();
  yield view.add(
    <Txt ref={a} text={left} fill={"#fff"} fontFamily={DISPLAY} fontSize={56} fontWeight={700} x={-520} y={-20} />,
  );
  yield view.add(
    <Txt ref={b} text={right} fill={accent} fontFamily={DISPLAY} fontSize={56} fontWeight={700} x={520} y={40} />,
  );
  yield* pause(t.startDelay);
  yield* all(
    a().x(-120, t.revealDuration, easeOutCubic),
    b().x(120, t.revealDuration, easeOutCubic),
  );
  yield* waitFor(1.3);
}

function* whisperShout(view: any) {
  const soft = str("soft", "they whispered");
  const loud = str("loud", "CORRUPTION");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  const s = createRef<Txt>();
  const l = createRef<Txt>();
  yield view.add(
    <Txt ref={s} text={soft} fill={"#8a93a0"} fontFamily={SERIF} fontSize={22} fontStyle={"italic"} y={-60} opacity={0} />,
  );
  yield view.add(
    <Txt ref={l} text={loud} fill={accent} fontFamily={DISPLAY} fontSize={96} fontWeight={700} y={40} scale={0.3} opacity={0} />,
  );
  yield* pause(t.startDelay);
  yield* s().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* all(
    l().opacity(1, t.revealDuration * 0.5, easeOutCubic),
    l().scale(1, t.revealDuration, easeOutBack),
  );
  yield* waitFor(1.2);
}

function* counterStat(view: any) {
  const prefix = str("prefix", "$");
  const value = num("value", 240);
  const suffix = str("suffix", "M");
  const label = str("label", "Missing from the books");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  const n = createRef<Txt>();
  yield view.add(
    <Txt ref={n} text={`${prefix}0${suffix}`} fill={"#fff"} fontFamily={DISPLAY} fontSize={100} fontWeight={700} y={-20} />,
  );
  yield view.add(
    <Txt text={label} fill={accent} fontFamily={SERIF} fontSize={22} y={90} />,
  );
  yield* pause(t.startDelay);
  const steps = 16;
  for (let i = 1; i <= steps; i++) {
    const v = Math.round((value * i) / steps);
    n().text(`${prefix}${v}${suffix}`);
    yield* waitFor(t.lineDuration / steps);
  }
  yield* waitFor(1.2);
}

function* kineticLines(view: any) {
  const raw = str("lines", "First they denied it\nThen they delayed it\nThen the files vanished");
  const lines = raw.split(/\n/).map((s) => s.trim()).filter(Boolean).slice(0, 5);
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  yield* pause(t.startDelay);
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    const row = createRef<Txt>();
    const y = -100 + i * 70;
    yield view.add(
      <Txt
        ref={row}
        text={lines[i]}
        fill={i === lines.length - 1 ? accent : "#fff"}
        fontFamily={SERIF}
        fontSize={32}
        fontWeight={700}
        y={y}
        x={-60}
        opacity={0}
      />,
    );
    yield* all(
      row().opacity(1, t.revealDuration, easeOutCubic),
      row().x(0, t.revealDuration, easeOutCubic),
    );
  }
  yield* waitFor(1.2);
}

function* focusWord(view: any) {
  const sentence = str("sentence", "The deal nobody voted for");
  const focus = str("focus", "nobody");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  const words = sentence.split(/\s+/);
  yield* pause(t.startDelay);
  let x = -420;
  for (let i = 0; i < words.length; i++) {
    if (i > 0) yield* pause(t.stepDelay * 0.4);
    const w = words[i];
    const isFocus = w.toLowerCase().replace(/[^a-z]/g, "") === focus.toLowerCase();
    const ref = createRef<Txt>();
    yield view.add(
      <Txt
        ref={ref}
        text={w}
        fill={isFocus ? accent : "#ffffff"}
        fontFamily={SERIF}
        fontSize={isFocus ? 52 : 36}
        fontWeight={700}
        x={x}
        opacity={0}
        scale={isFocus ? 0.6 : 1}
      />,
    );
    yield* all(
      ref().opacity(1, t.revealDuration * 0.7, easeOutCubic),
      ref().scale(isFocus ? 1 : 1, t.revealDuration, easeOutBack),
    );
    x += (isFocus ? 160 : 110);
  }
  yield* waitFor(1.2);
}

function* verticalDrop(view: any) {
  const raw = str("text", "POWER MONEY SILENCE");
  const words = raw.split(/\s+/).filter(Boolean).slice(0, 5);
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  yield* pause(t.startDelay);
  for (let i = 0; i < words.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    const w = createRef<Txt>();
    yield view.add(
      <Txt
        ref={w}
        text={words[i]}
        fill={i === words.length - 1 ? accent : "#fff"}
        fontFamily={DISPLAY}
        fontSize={48}
        fontWeight={700}
        letterSpacing={10}
        y={-220}
        opacity={0}
      />,
    );
    yield* all(
      w().y(-120 + i * 70, t.revealDuration, easeOutBack),
      w().opacity(1, t.revealDuration * 0.6, easeOutCubic),
    );
  }
  yield* waitFor(1.2);
}

function* filmBurn(view: any) {
  const title = str("title", "SHADOW STATE");
  const year = str("year", "A BestMotions Film");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#050508");
  const t = timing();
  view.fill(bg);
  const tit = createRef<Txt>();
  const sub = createRef<Txt>();
  yield view.add(
    <Txt ref={tit} text={title} fill={"#fff"} fontFamily={DISPLAY} fontSize={72} fontWeight={700} letterSpacing={12} opacity={0} y={-20} />,
  );
  yield view.add(
    <Txt ref={sub} text={year} fill={accent} fontFamily={SERIF} fontSize={18} y={60} opacity={0} />,
  );
  yield* pause(t.startDelay);
  yield* tit().opacity(1, t.revealDuration * 1.2, easeOutCubic);
  yield* sub().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.4);
}

function* nameRoleStack(view: any) {
  const name = str("name", "Elena Vargas");
  const role = str("role", "Whistleblower");
  const org = str("org", "Ministry of Finance");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  const items = [name, role, org];
  const colors = ["#fff", accent, "#9aa3ad"];
  const sizes = [40, 22, 18];
  yield* pause(t.startDelay);
  for (let i = 0; i < items.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    const row = createRef<Txt>();
    yield view.add(
      <Txt
        ref={row}
        text={items[i]}
        fill={colors[i]}
        fontFamily={i === 0 ? SERIF : SANS}
        fontSize={sizes[i]}
        fontWeight={i === 0 ? 700 : 600}
        y={-40 + i * 48}
        opacity={0}
        x={-30}
      />,
    );
    yield* all(
      row().opacity(1, t.revealDuration, easeOutCubic),
      row().x(0, t.revealDuration, easeOutCubic),
    );
  }
  yield* waitFor(1.3);
}

function* captionBar(view: any) {
  const caption = str("caption", "Archive footage — 2004");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  const bar = createRef<Rect>();
  const txt = createRef<Txt>();
  yield view.add(<Rect ref={bar} width={0} height={48} fill={"#12161e"} y={260} />);
  yield view.add(
    <Txt ref={txt} text={caption} fill={"#e8eef4"} fontFamily={MONO} fontSize={18} y={260} opacity={0} />,
  );
  yield* pause(t.startDelay);
  yield* bar().width(900, t.lineDuration, easeOutCubic);
  yield* txt().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.2);
}

function* impactClaim(view: any) {
  const claim = str("claim", "NO ONE WAS CHARGED");
  const support = str("support", "After a three-year investigation");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  const c = createRef<Txt>();
  const s = createRef<Txt>();
  yield view.add(
    <Txt ref={c} text={claim} fill={accent} fontFamily={DISPLAY} fontSize={64} fontWeight={700} letterSpacing={4} scale={0.5} opacity={0} />,
  );
  yield view.add(
    <Txt ref={s} text={support} fill={"#b8c0c8"} fontFamily={SERIF} fontSize={22} y={80} opacity={0} />,
  );
  yield* pause(t.startDelay);
  yield* all(
    c().scale(1, t.revealDuration, easeOutBack),
    c().opacity(1, t.revealDuration * 0.5, easeOutCubic),
  );
  yield* s().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.3);
}

function* dualCompare(view: any) {
  const left = str("left", "Official story");
  const right = str("right", "What records show");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  const a = createRef<Layout>();
  const b = createRef<Layout>();
  const mid = createRef<Rect>();
  yield view.add(
    <Layout ref={a} x={-520} opacity={0}>
      <Txt text={left} fill={"#fff"} fontFamily={SERIF} fontSize={28} fontWeight={700} width={360} textWrap textAlign={"center"} />
    </Layout>,
  );
  yield view.add(
    <Layout ref={b} x={520} opacity={0}>
      <Txt text={right} fill={accent} fontFamily={SERIF} fontSize={28} fontWeight={700} width={360} textWrap textAlign={"center"} />
    </Layout>,
  );
  yield view.add(<Rect ref={mid} width={4} height={0} fill={accent} />);
  yield* pause(t.startDelay);
  yield* all(
    a().x(-280, t.revealDuration, easeOutCubic),
    a().opacity(1, t.revealDuration * 0.6, easeOutCubic),
    b().x(280, t.revealDuration, easeOutCubic),
    b().opacity(1, t.revealDuration * 0.6, easeOutCubic),
  );
  yield* mid().height(160, t.lineDuration, easeOutCubic);
  yield* waitFor(1.2);
}

function* subtitleKaraoke(view: any) {
  const line = str("line", "Follow every transfer. Find every name.");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);
  const words = line.split(/\s+/);
  yield* pause(t.startDelay);
  let x = -480;
  const refs: Array<ReturnType<typeof createRef<Txt>>> = [];
  for (let i = 0; i < words.length; i++) {
    const ref = createRef<Txt>();
    refs.push(ref);
    yield view.add(
      <Txt ref={ref} text={words[i]} fill={"#5a6270"} fontFamily={SERIF} fontSize={30} fontWeight={700} x={x} y={200} />,
    );
    x += words[i].length * 16 + 18;
  }
  for (let i = 0; i < refs.length; i++) {
    if (i > 0) yield* pause(t.stepDelay * 0.7);
    refs[i]().fill(accent);
    yield* waitFor(0.08);
  }
  yield* waitFor(1.1);
}

function* openerHook(view: any) {
  const eyebrow = str("eyebrow", "TRUE STORY");
  const hook = str("hook", "What was really happening?");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07090e");
  const t = timing();
  view.fill(bg);
  const eye = createRef<Txt>();
  const h = createRef<Txt>();
  const rule = createRef<Rect>();
  yield view.add(
    <Txt ref={eye} text={eyebrow} fill={accent} fontFamily={SANS} fontSize={16} letterSpacing={8} y={-120} opacity={0} />,
  );
  yield view.add(
    <Txt ref={h} text={hook} fill={"#f4efe6"} fontFamily={SERIF} fontSize={48} fontWeight={700} width={980} textWrap textAlign={"center"} opacity={0} />,
  );
  yield view.add(<Rect ref={rule} width={0} height={6} fill={accent} y={120} radius={3} />);
  yield* pause(t.startDelay);
  yield* eye().opacity(1, t.revealDuration, easeOutCubic);
  yield* h().opacity(1, t.revealDuration, easeOutCubic);
  yield* rule().width(360, t.lineDuration, easeOutCubic);
  yield* waitFor(1.3);
}

export function* runDocText(view: any, template: string) {
  switch (template) {
    case "doctext-giant":
    case "text-doc-giant":
      yield* giantWord(view);
      break;
    case "doctext-typewriter":
    case "text-doc-typewriter":
      yield* typewriter(view);
      break;
    case "doctext-stack":
    case "text-doc-stack":
      yield* wordStack(view);
      break;
    case "doctext-lower-third":
      yield* lowerThird(view);
      break;
    case "doctext-location":
      yield* locationChyron(view);
      break;
    case "doctext-chapter":
      yield* chapterCard(view);
      break;
    case "doctext-year":
      yield* yearPunch(view);
      break;
    case "doctext-quote":
      yield* pullQuote(view);
      break;
    case "doctext-collide":
      yield* splitCollide(view);
      break;
    case "doctext-whisper-shout":
      yield* whisperShout(view);
      break;
    case "doctext-counter":
      yield* counterStat(view);
      break;
    case "doctext-lines":
      yield* kineticLines(view);
      break;
    case "doctext-focus":
      yield* focusWord(view);
      break;
    case "doctext-vertical":
      yield* verticalDrop(view);
      break;
    case "doctext-film-title":
      yield* filmBurn(view);
      break;
    case "doctext-name-stack":
      yield* nameRoleStack(view);
      break;
    case "doctext-caption":
      yield* captionBar(view);
      break;
    case "doctext-impact":
      yield* impactClaim(view);
      break;
    case "doctext-compare":
      yield* dualCompare(view);
      break;
    case "doctext-karaoke":
      yield* subtitleKaraoke(view);
      break;
    case "doctext-opener":
      yield* openerHook(view);
      break;
    default:
      yield* giantWord(view);
  }
}
