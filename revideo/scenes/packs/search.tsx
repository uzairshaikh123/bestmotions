/** @jsxImportSource @revideo/2d/lib */
/**
 * Search bar title pack — Uppbeat-style search typing titles.
 * Uses shared ai-text icons (search / google).
 */
import { Circle, Img, Layout, Node, Rect, Txt } from "@revideo/2d";
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  str,
  waitFor,
} from "../../lib/helpers";
import { measureGlyphs } from "../../lib/highlight";
import { hash01 } from "../../lib/paper";
import { pause, timing } from "../../lib/timing";
import searchIcon from "../../textures/ai-text/icon-search.png";
import logoGoogle from "../../textures/ai-text/logo-google.png";

const SANS = "Sora, Helvetica, sans-serif";
const DISPLAY = "Oswald, Helvetica, sans-serif";

function clip(s: string, max = 80) {
  const t = s.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function leftEdge(centerX: number, width: number) {
  return centerX - width / 2;
}

function placeCaretX(
  caret: any,
  textLeft: number,
  shown: string,
  size: number,
  weight: number | string = 500,
) {
  caret().x(textLeft + measureGlyphs(shown, size, SANS, weight) + 2);
}

function* typeChars(
  textRef: any,
  full: string,
  duration: number,
  onCaret?: (shown: string) => void,
) {
  const chars = clip(full).split("");
  if (!chars.length) return;
  const base = duration / chars.length;
  let shown = "";
  for (let i = 0; i < chars.length; i++) {
    shown += chars[i];
    textRef().text(shown);
    onCaret?.(shown);
    const c = chars[i];
    let mul = 0.72 + hash01(i * 17.1) * 0.65;
    if (c === " ") mul *= 0.45;
    else if (".!?,".includes(c)) mul *= 2.2;
    yield* waitFor(Math.max(0.016, base * mul));
  }
}

function* blinkCaret(caret: any, times = 2) {
  for (let i = 0; i < times; i++) {
    yield* caret().opacity(0, 0.1);
    yield* caret().opacity(1, 0.1);
  }
}

/** Soft neumorph pill — type a title, then search icon pops. */
function* searchBarSoft(view: any) {
  const query = clip(str("query", "Search Bar Titles"), 56);
  const accent = str("accent", "#3b82f6");
  const bg = str("bg", "#e8eef6");
  const barFill = str("barFill", "#f4f7fb");
  const t = timing();
  view.fill(bg);

  const bar = createRef<Node>();
  const textRef = createRef<Txt>();
  const caret = createRef<Rect>();
  const icon = createRef<Img>();
  const textW = 520;
  const textX = -30;
  const textL = leftEdge(textX, textW);

  yield view.add(
    <Node ref={bar} opacity={0} scale={0.94}>
      <Rect
        width={700}
        height={64}
        fill={barFill}
        radius={18}
        shadowBlur={28}
        shadowColor={"#94a3b866"}
        shadowOffset={[10, 12]}
      />
      <Rect width={700} height={64} fill={"#ffffff88"} radius={18} y={-1} opacity={0.35} />
      <Txt
        ref={textRef}
        text={""}
        fill={"#0f172a"}
        fontFamily={SANS}
        fontSize={22}
        fontWeight={600}
        x={textX}
        width={textW}
        textAlign={"left"}
      />
      <Rect ref={caret} width={2} height={24} fill={accent} x={textL} />
      <Img ref={icon} src={searchIcon} width={22} height={22} x={300} opacity={0} scale={0.6} />
    </Node>,
  );

  yield* pause(t.startDelay);
  yield* all(bar().opacity(1, t.revealDuration, easeOutCubic), bar().scale(1, t.revealDuration, easeOutBack));
  yield* typeChars(textRef, query, t.lineDuration, (s) => placeCaretX(caret, textL, s, 22, 600));
  yield* blinkCaret(caret, 1);
  caret().opacity(0);
  yield* all(icon().opacity(0.85, 0.25, easeOutCubic), icon().scale(1, 0.28, easeOutBack));
  yield* waitFor(1.1);
}

/** Dark glass search bar title. */
function* searchBarDark(view: any) {
  const query = clip(str("query", "Find your next motion"), 56);
  const accent = str("accent", "#60a5fa");
  const bg = str("bg", "#07090e");
  const t = timing();
  view.fill(bg);

  const bar = createRef<Node>();
  const textRef = createRef<Txt>();
  const caret = createRef<Rect>();
  const textW = 540;
  const textX = -10;
  const textL = leftEdge(textX, textW);

  yield view.add(
    <Node ref={bar} opacity={0} y={10} scale={0.96}>
      <Rect width={740} height={68} fill={"#121826"} radius={34} shadowBlur={30} shadowColor={"#000000aa"} />
      <Rect width={740} height={68} fill={"#ffffff08"} radius={34} />
      <Img src={searchIcon} width={20} height={20} x={-320} opacity={0.7} />
      <Txt
        ref={textRef}
        text={""}
        fill={"#e8eef8"}
        fontFamily={SANS}
        fontSize={22}
        fontWeight={500}
        x={textX}
        width={textW}
        textAlign={"left"}
      />
      <Rect ref={caret} width={2} height={24} fill={accent} x={textL} />
      <Circle width={40} height={40} fill={accent} x={320} opacity={0.95} />
      <Img src={searchIcon} width={16} height={16} x={320} />
    </Node>,
  );

  yield* pause(t.startDelay);
  yield* all(bar().opacity(1, t.revealDuration, easeOutCubic), bar().scale(1, t.revealDuration, easeOutBack));
  yield* typeChars(textRef, query, t.lineDuration, (s) => placeCaretX(caret, textL, s, 22, 500));
  yield* blinkCaret(caret, 2);
  yield* waitFor(1.0);
}

/** Minimal underline typewriter title (search-as-title). */
function* searchBarUnderline(view: any) {
  const query = clip(str("query", "What is a cold open?"), 64);
  const accent = str("accent", "#111827");
  const bg = str("bg", "#fafafa");
  const t = timing();
  view.fill(bg);

  const textRef = createRef<Txt>();
  const caret = createRef<Rect>();
  const rule = createRef<Rect>();
  const icon = createRef<Img>();
  const textW = 700;
  const textX = 20;
  const textL = leftEdge(textX, textW);

  yield view.add(<Img ref={icon} src={searchIcon} width={28} height={28} x={-360} y={0} opacity={0} />);
  yield view.add(
    <Txt
      ref={textRef}
      text={""}
      fill={accent}
      fontFamily={DISPLAY}
      fontSize={42}
      fontWeight={600}
      x={textX}
      width={textW}
      textAlign={"left"}
    />,
  );
  yield view.add(<Rect ref={caret} width={3} height={40} fill={accent} x={textL} opacity={0} />);
  yield view.add(<Rect ref={rule} width={0} height={3} fill={accent} y={40} x={-20} />);

  yield* pause(t.startDelay);
  yield* icon().opacity(0.7, t.revealDuration, easeOutCubic);
  caret().opacity(1);
  yield* typeChars(textRef, query, t.lineDuration, (s) => placeCaretX(caret, textL, s, 42, 600));
  yield* all(rule().width(640, t.revealDuration, easeOutCubic), blinkCaret(caret, 2));
  caret().opacity(0);
  yield* waitFor(1.1);
}

/** Hero oversized search used as a title card. */
function* searchBarHero(view: any) {
  const query = clip(str("query", "SEARCH BAR TITLES"), 40);
  const tag = str("tag", "TYPE · REVEAL · CUT");
  const accent = str("accent", "#2563eb");
  const bg = str("bg", "#0b1220");
  const t = timing();
  view.fill(bg);

  const bar = createRef<Node>();
  const textRef = createRef<Txt>();
  const caret = createRef<Rect>();
  const tagRef = createRef<Txt>();
  const textW = 780;
  const textX = 0;
  const textL = leftEdge(textX, textW);

  yield view.add(
    <Txt
      ref={tagRef}
      text={tag}
      fill={"#94a3b8"}
      fontFamily={SANS}
      fontSize={14}
      letterSpacing={5}
      y={-120}
      opacity={0}
    />,
  );
  yield view.add(
    <Node ref={bar} opacity={0} scale={0.9}>
      <Rect width={920} height={96} fill={"#111827"} radius={20} shadowBlur={40} shadowColor={"#000000cc"} />
      <Rect width={4} height={48} fill={accent} x={-430} radius={2} />
      <Txt
        ref={textRef}
        text={""}
        fill={"#f8fafc"}
        fontFamily={DISPLAY}
        fontSize={40}
        fontWeight={700}
        letterSpacing={2}
        x={textX}
        width={textW}
        textAlign={"left"}
      />
      <Rect ref={caret} width={3} height={42} fill={accent} x={textL} />
    </Node>,
  );

  yield* pause(t.startDelay);
  yield* tagRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* all(bar().opacity(1, t.revealDuration, easeOutCubic), bar().scale(1, t.revealDuration, easeOutBack));
  yield* typeChars(textRef, query, t.lineDuration, (s) => placeCaretX(caret, textL, s, 40, 700));
  yield* blinkCaret(caret, 2);
  caret().opacity(0);
  yield* waitFor(1.15);
}

/** Type query → results cascade (Uppbeat search-titles energy). */
function* searchBarResults(view: any) {
  const query = clip(str("query", "motion graphics titles"), 48);
  const r1 = clip(str("result1", "Search Bar Titles Pack"), 48);
  const r2 = clip(str("result2", "Clean Typing Intro"), 48);
  const r3 = clip(str("result3", "UI Search Reveal"), 48);
  const accent = str("accent", "#4285f4");
  const bg = str("bg", "#f8f9fa");
  const t = timing();
  view.fill(bg);

  const bar = createRef<Node>();
  const textRef = createRef<Txt>();
  const caret = createRef<Rect>();
  const textW = 560;
  const textX = -10;
  const textL = leftEdge(textX, textW);

  yield view.add(
    <Node ref={bar} y={-140} opacity={0} scale={0.96}>
      <Rect width={760} height={58} fill={"#ffffff"} radius={28} shadowBlur={16} shadowColor={"#00000018"} />
      <Img src={logoGoogle} width={24} height={24} x={-340} />
      <Txt
        ref={textRef}
        text={""}
        fill={"#202124"}
        fontFamily={SANS}
        fontSize={20}
        fontWeight={500}
        x={textX}
        width={textW}
        textAlign={"left"}
      />
      <Rect ref={caret} width={2} height={22} fill={accent} x={textL} />
    </Node>,
  );

  yield* pause(t.startDelay);
  yield* all(bar().opacity(1, t.revealDuration, easeOutCubic), bar().scale(1, t.revealDuration, easeOutBack));
  yield* typeChars(textRef, query, t.lineDuration, (s) => placeCaretX(caret, textL, s, 20, 500));
  yield* blinkCaret(caret, 1);

  const results = [r1, r2, r3];
  for (let i = 0; i < results.length; i++) {
    const row = createRef<Node>();
    const y = -40 + i * 70;
    yield view.add(
      <Node ref={row} y={y} opacity={0} x={-24}>
        <Rect width={760} height={58} fill={"#ffffff"} radius={14} shadowBlur={10} shadowColor={"#00000012"} />
        <Layout layout direction={"row"} gap={16} alignItems={"center"} x={-300}>
          <Img src={searchIcon} width={16} height={16} opacity={0.45} />
          <Txt text={results[i]} fill={"#202124"} fontFamily={SANS} fontSize={18} fontWeight={500} />
        </Layout>
      </Node>,
    );
    yield* all(
      row().opacity(1, t.revealDuration * 0.55, easeOutCubic),
      row().x(0, t.revealDuration * 0.55, easeOutCubic),
    );
    if (i < results.length - 1) yield* pause(t.stepDelay);
  }
  yield* waitFor(1.0);
}

/** Enter / search pulse after typing. */
function* searchBarPulse(view: any) {
  const query = clip(str("query", "best motion templates"), 52);
  const accent = str("accent", "#22c55e");
  const bg = str("bg", "#0c1118");
  const t = timing();
  view.fill(bg);

  const bar = createRef<Node>();
  const textRef = createRef<Txt>();
  const caret = createRef<Rect>();
  const btn = createRef<Circle>();
  const textW = 520;
  const textX = -20;
  const textL = leftEdge(textX, textW);

  yield view.add(
    <Node ref={bar} opacity={0}>
      <Rect width={720} height={64} fill={"#151c27"} radius={16} />
      <Txt
        ref={textRef}
        text={""}
        fill={"#e5e7eb"}
        fontFamily={SANS}
        fontSize={20}
        fontWeight={500}
        x={textX}
        width={textW}
        textAlign={"left"}
      />
      <Rect ref={caret} width={2} height={22} fill={"#94a3b8"} x={textL} />
      <Circle ref={btn} width={44} height={44} fill={accent} x={310} scale={0.85} />
      <Img src={searchIcon} width={18} height={18} x={310} />
    </Node>,
  );

  yield* pause(t.startDelay);
  yield* bar().opacity(1, t.revealDuration, easeOutCubic);
  yield* typeChars(textRef, query, t.lineDuration, (s) => placeCaretX(caret, textL, s, 20, 500));
  yield* blinkCaret(caret, 1);
  caret().opacity(0);
  yield* all(btn().scale(1.12, 0.18, easeOutBack), btn().scale(1, 0.2, easeOutCubic));
  const ring = createRef<Circle>();
  yield view.add(<Circle ref={ring} width={44} height={44} x={310} stroke={accent} lineWidth={2} opacity={0.8} />);
  yield* all(ring().size(120, 0.45, easeOutCubic), ring().opacity(0, 0.45, easeOutCubic));
  yield* waitFor(0.95);
}

/** Centered pill title — type then hold (clean pack opener). */
function* searchBarPill(view: any) {
  const query = clip(str("query", "Animated Search Titles"), 56);
  const accent = str("accent", "#0ea5e9");
  const bg = str("bg", "#ffffff");
  const t = timing();
  view.fill(bg);

  const bar = createRef<Node>();
  const textRef = createRef<Txt>();
  const caret = createRef<Rect>();
  const textW = 480;
  const textX = 10;
  const textL = leftEdge(textX, textW);

  yield view.add(
    <Node ref={bar} opacity={0} scale={0.92}>
      <Rect width={640} height={56} fill={"#f1f5f9"} radius={28} />
      <Img src={searchIcon} width={18} height={18} x={-280} opacity={0.55} />
      <Txt
        ref={textRef}
        text={""}
        fill={"#0f172a"}
        fontFamily={SANS}
        fontSize={20}
        fontWeight={600}
        x={textX}
        width={textW}
        textAlign={"left"}
      />
      <Rect ref={caret} width={2} height={22} fill={accent} x={textL} />
    </Node>,
  );

  yield* pause(t.startDelay);
  yield* all(bar().opacity(1, t.revealDuration, easeOutCubic), bar().scale(1, t.revealDuration, easeOutBack));
  yield* typeChars(textRef, query, t.lineDuration, (s) => placeCaretX(caret, textL, s, 20, 600));
  yield* blinkCaret(caret, 3);
  yield* waitFor(1.05);
}

export function* runSearch(view: any, template: string) {
  switch (template) {
    case "search-bar-soft":
      yield* searchBarSoft(view);
      break;
    case "search-bar-dark":
      yield* searchBarDark(view);
      break;
    case "search-bar-underline":
      yield* searchBarUnderline(view);
      break;
    case "search-bar-hero":
      yield* searchBarHero(view);
      break;
    case "search-bar-results":
      yield* searchBarResults(view);
      break;
    case "search-bar-pulse":
      yield* searchBarPulse(view);
      break;
    case "search-bar-pill":
      yield* searchBarPill(view);
      break;
    default:
      yield* searchBarSoft(view);
  }
}
