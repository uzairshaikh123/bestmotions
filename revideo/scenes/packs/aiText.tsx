/** @jsxImportSource @revideo/2d/lib */
/**
 * AI / typing / streaming-title pack — production UI motion, tiny assets.
 * Icons live in revideo/textures/ai-text/ (PNG mirror under client/public for CDN).
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
import sendIcon from "../../textures/ai-text/icon-send.png";
import vignetteUrl from "../../textures/ai-text/vignette-soft.png";
import logoChatgpt from "../../textures/ai-text/logo-chatgpt.png";
import logoClaude from "../../textures/ai-text/logo-claude.png";
import logoGemini from "../../textures/ai-text/logo-gemini.png";
import logoGoogle from "../../textures/ai-text/logo-google.png";
import logoOpenai from "../../textures/ai-text/logo-openai.png";
import logoPerplexity from "../../textures/ai-text/logo-perplexity.png";

const SANS = "Sora, Helvetica, sans-serif";
const SERIF = "Libre Baskerville, Georgia, serif";
const DISPLAY = "Oswald, Helvetica, sans-serif";

const BOT_LOGOS: Record<string, string> = {
  chatgpt: logoChatgpt,
  openai: logoOpenai,
  claude: logoClaude,
  gemini: logoGemini,
  google: logoGoogle,
  perplexity: logoPerplexity,
};

function botLogo(key: string) {
  const k = key.toLowerCase().trim();
  return BOT_LOGOS[k] || logoChatgpt;
}

function botLabel(key: string) {
  const map: Record<string, string> = {
    chatgpt: "ChatGPT",
    openai: "OpenAI",
    claude: "Claude",
    gemini: "Gemini",
    google: "Google",
    perplexity: "Perplexity",
  };
  return map[key.toLowerCase().trim()] || "Assistant";
}

/** Cap length so type loops stay light on memory/CPU. */
function clip(s: string, max = 160) {
  const t = s.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function leftEdge(centerX: number, width: number) {
  return centerX - width / 2;
}

/** Single-line caret: sits just after the measured glyph run. */
function placeCaretX(
  caret: any,
  textLeft: number,
  shown: string,
  size: number,
  font = SANS,
  weight: number | string = 500,
) {
  const w = measureGlyphs(shown, size, font, weight);
  caret().x(textLeft + w + 2);
}

/** Multi-line caret for wrapped chat replies (origin = text node center). */
function placeCaretWrapped(
  caret: any,
  shown: string,
  boxX: number,
  boxY: number,
  boxW: number,
  size: number,
  font = SANS,
  weight: number | string = 500,
  lineHeight = size * 1.35,
) {
  const lines = wrapLines(shown, boxW, size, font, weight);
  const last = lines[lines.length - 1] || "";
  const n = Math.max(lines.length, 1);
  const firstY = boxY - ((n - 1) * lineHeight) / 2;
  const y = firstY + (n - 1) * lineHeight;
  const x = leftEdge(boxX, boxW) + measureGlyphs(last, size, font, weight) + 2;
  caret().position([x, y]);
}

function wrapLines(
  text: string,
  maxWidth: number,
  size: number,
  font: string,
  weight: number | string,
): string[] {
  if (!text) return [""];
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (measureGlyphs(next, size, font, weight) <= maxWidth) {
      cur = next;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

/** Realistic char typing — punctuation pauses, deterministic jitter. */
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
    let mul = 0.72 + hash01(i * 19.7 + 3.1) * 0.7;
    if (c === " ") mul *= 0.45;
    else if (c === "," || c === ";" || c === ":") mul *= 2.1;
    else if (c === "." || c === "!" || c === "?" || c === "—") mul *= 2.8;
    yield* waitFor(Math.max(0.016, base * mul));
  }
}

/** Chat-style stream: mostly chars, occasional tiny burst (token feel). */
function* typeChat(
  textRef: any,
  full: string,
  duration: number,
  onCaret?: (shown: string) => void,
) {
  const chars = clip(full, 220).split("");
  if (!chars.length) return;
  const base = duration / chars.length;
  let shown = "";
  let i = 0;
  while (i < chars.length) {
    const burst = hash01(i * 11.3) > 0.82 ? 2 + Math.floor(hash01(i * 5.7) * 2) : 1;
    const n = Math.min(chars.length, i + burst);
    shown = chars.slice(0, n).join("");
    textRef().text(shown);
    onCaret?.(shown);
    const last = chars[n - 1];
    let mul = 0.7 + hash01(i * 8.1) * 0.65;
    if (last === " ") mul *= 0.4;
    else if (".!?,".includes(last)) mul *= 2.4;
    if (burst > 1) mul *= 0.55;
    yield* waitFor(Math.max(0.014, base * burst * mul));
    i = n;
  }
}

function* blinkCaret(caret: any, times = 3) {
  for (let i = 0; i < times; i++) {
    yield* caret().opacity(0, 0.11);
    yield* caret().opacity(1, 0.11);
  }
}

/** Logo + name row — Layout so labels never sit under the icon. */
function BrandRow(opts: {
  logo: string;
  name: string;
  fill: string;
  x: number;
  y: number;
  size?: number;
}) {
  const size = opts.size ?? 28;
  return (
    <Layout layout direction={"row"} gap={12} alignItems={"center"} x={opts.x} y={opts.y}>
      <Img src={opts.logo} width={size} height={size} />
      <Txt text={opts.name} fill={opts.fill} fontFamily={SANS} fontSize={15} fontWeight={650} />
    </Layout>
  );
}

function* thinkingDots(parent: any, x: number, y: number, color: string) {
  const dots = [createRef<Circle>(), createRef<Circle>(), createRef<Circle>()];
  yield parent().add(
    <Layout layout direction={"row"} gap={8} x={x} y={y} alignItems={"center"}>
      <Circle ref={dots[0]} width={7} height={7} fill={color} opacity={0.35} />
      <Circle ref={dots[1]} width={7} height={7} fill={color} opacity={0.35} />
      <Circle ref={dots[2]} width={7} height={7} fill={color} opacity={0.35} />
    </Layout>,
  );
  for (let round = 0; round < 2; round++) {
    for (let i = 0; i < 3; i++) {
      yield* dots[i]().opacity(1, 0.12, easeOutCubic);
      yield* dots[i]().opacity(0.35, 0.12, easeOutCubic);
    }
  }
  for (const d of dots) d().opacity(0);
}

/** Netflix-style letterbox brand sting — Rects only + optional vignette. */
function* netflixSting(view: any) {
  const brand = str("brand", "BESTMOTIONS");
  const tagline = str("tagline", "A MOTION ORIGINAL");
  const accent = str("accent", "#e50914");
  const bg = str("bg", "#000000");
  const t = timing();
  view.fill(bg);

  const top = createRef<Rect>();
  const bot = createRef<Rect>();
  const title = createRef<Txt>();
  const sub = createRef<Txt>();
  const rule = createRef<Rect>();

  yield view.add(<Img src={vignetteUrl} width={1400} height={800} opacity={0.55} zIndex={0} />);
  yield view.add(<Rect ref={top} width={1400} height={90} fill={"#000000"} y={-360} zIndex={5} />);
  yield view.add(<Rect ref={bot} width={1400} height={90} fill={"#000000"} y={360} zIndex={5} />);
  yield view.add(
    <Txt
      ref={title}
      text={brand.toUpperCase()}
      fill={accent}
      fontFamily={DISPLAY}
      fontSize={96}
      fontWeight={700}
      letterSpacing={10}
      scale={1.55}
      opacity={0}
      zIndex={3}
    />,
  );
  yield view.add(<Rect ref={rule} width={0} height={3} fill={accent} y={58} opacity={0.9} zIndex={3} />);
  yield view.add(
    <Txt
      ref={sub}
      text={tagline.toUpperCase()}
      fill={"#c8c8c8"}
      fontFamily={SANS}
      fontSize={14}
      letterSpacing={6}
      y={88}
      opacity={0}
      zIndex={3}
    />,
  );

  yield* pause(t.startDelay);
  yield* all(
    top().y(-315, t.revealDuration * 0.8, easeOutCubic),
    bot().y(315, t.revealDuration * 0.8, easeOutCubic),
  );
  yield* all(
    title().opacity(1, t.revealDuration * 0.45, easeOutCubic),
    title().scale(1, t.revealDuration * 1.15, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* all(
    rule().width(220, t.lineDuration * 0.55, easeOutCubic),
    sub().opacity(1, t.revealDuration, easeOutCubic),
  );
  yield* waitFor(1.15);
}

/** Google-like search typing + suggestions. */
function* googleSearch(view: any) {
  const query = clip(str("query", "how do streaming title cards work"), 72);
  const suggestions = [
    str("suggest1", "streaming title card animation"),
    str("suggest2", "letterbox intro design"),
    str("suggest3", "netflix style opener tutorial"),
  ].map((s) => clip(s, 56));
  const accent = str("accent", "#4285f4");
  const bg = str("bg", "#f8f9fa");
  const t = timing();
  view.fill(bg);

  const shell = createRef<Node>();
  const textRef = createRef<Txt>();
  const caret = createRef<Rect>();
  const drop = createRef<Node>();
  const BAR_W = 720;
  const textW = 560;
  const textX = -10;
  const textL = leftEdge(textX, textW);
  const ICON_X = -318;
  const ROW_TEXT_X = -20;
  const ROW_TEXT_W = 580;

  // One shell so bar + dropdown share the same center axis (real Google layout)
  yield view.add(
    <Node ref={shell} y={-20} scale={0.97} opacity={0}>
      <Node y={-50}>
        <Rect width={BAR_W} height={58} fill={"#ffffff"} radius={28} shadowBlur={18} shadowColor={"#00000022"} />
        <Img src={logoGoogle} width={26} height={26} x={ICON_X} />
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
      </Node>
      <Node ref={drop} y={70} opacity={0} scale={0.98}>
        <Rect width={BAR_W} height={176} fill={"#ffffff"} radius={16} shadowBlur={16} shadowColor={"#00000018"} />
      </Node>
    </Node>,
  );

  yield* pause(t.startDelay);
  yield* all(shell().opacity(1, t.revealDuration, easeOutCubic), shell().scale(1, t.revealDuration, easeOutBack));
  yield* blinkCaret(caret, 1);
  yield* typeChars(textRef, query, t.lineDuration, (shown) => {
    placeCaretX(caret, textL, shown, 20, SANS, 500);
  });
  yield* blinkCaret(caret, 2);
  yield* pause(t.connectDelay);
  yield* all(drop().opacity(1, t.revealDuration * 0.65, easeOutCubic), drop().scale(1, t.revealDuration * 0.65, easeOutCubic));

  // Absolute left-edge rows — never use content-sized Layout at a fixed x (causes stair-step)
  for (let i = 0; i < suggestions.length; i++) {
    const row = createRef<Node>();
    const y = -48 + i * 48;
    yield drop().add(
      <Node ref={row} y={y} opacity={0}>
        <Img src={searchIcon} width={16} height={16} x={ICON_X} opacity={0.5} />
        <Txt
          text={suggestions[i]}
          fill={"#3c4043"}
          fontFamily={SANS}
          fontSize={17}
          fontWeight={400}
          x={ROW_TEXT_X}
          width={ROW_TEXT_W}
          textAlign={"left"}
        />
      </Node>,
    );
    yield* row().opacity(1, t.revealDuration * 0.5, easeOutCubic);
    if (i < suggestions.length - 1) yield* pause(t.stepDelay);
  }
  yield* waitFor(1.0);
}

/** Claude-inspired warm assistant typing. */
function* claudeReply(view: any) {
  const label = str("label", "Claude");
  const reply = clip(
    str("reply", "Here is a clear way to open your video: start with silence, then let the title settle."),
    180,
  );
  const accent = str("accent", "#cc785c");
  const bg = str("bg", "#f5f0eb");
  const card = str("card", "#ffffff");
  const t = timing();
  view.fill(bg);

  const shell = createRef<Node>();
  const textRef = createRef<Txt>();
  const caret = createRef<Rect>();
  const boxW = 720;
  const boxX = 0;
  const boxY = 20;

  yield view.add(
    <Node ref={shell} y={10} opacity={0} scale={0.97}>
      <Rect width={820} height={280} fill={card} radius={18} shadowBlur={24} shadowColor={"#00000018"} />
      {BrandRow({ logo: logoClaude, name: label, fill: accent, x: -330, y: -100, size: 30 })}
      <Txt
        ref={textRef}
        text={""}
        fill={"#2a2420"}
        fontFamily={SERIF}
        fontSize={24}
        fontWeight={400}
        x={boxX}
        y={boxY}
        width={boxW}
        textWrap
        textAlign={"left"}
      />
      <Rect ref={caret} width={2} height={24} fill={accent} x={leftEdge(boxX, boxW)} y={boxY} />
    </Node>,
  );

  yield* pause(t.startDelay);
  yield* all(shell().opacity(1, t.revealDuration, easeOutCubic), shell().scale(1, t.revealDuration, easeOutBack));
  yield* pause(t.stepDelay);
  yield* thinkingDots(shell, -340, 10, accent);
  yield* typeChat(textRef, reply, t.lineDuration, (shown) => {
    placeCaretWrapped(caret, shown, boxX, boxY, boxW, 24, SERIF, 400);
  });
  yield* blinkCaret(caret, 2);
  caret().opacity(0);
  yield* waitFor(1.0);
}

/** ChatGPT-style dark thread: user bubble + streaming reply. */
function* chatgptThread(view: any) {
  const user = clip(str("user", "Write a cold open for my documentary."), 120);
  const reply = clip(
    str("reply", "Open on black. One line of text. Hold. Then cut to the first image — no music yet."),
    200,
  );
  const accent = str("accent", "#10a37f");
  const bg = str("bg", "#212121");
  const t = timing();
  view.fill(bg);

  const userBubble = createRef<Node>();
  const assistant = createRef<Node>();
  const textRef = createRef<Txt>();
  const caret = createRef<Rect>();
  const composer = createRef<Node>();
  const boxW = 760;
  const boxX = 20;
  const boxY = 20;

  yield view.add(
    <Node ref={userBubble} y={-150} opacity={0} x={80}>
      <Rect width={560} height={72} fill={"#2f2f2f"} radius={16} />
      <Txt text={user} fill={"#ececec"} fontFamily={SANS} fontSize={18} width={500} textWrap textAlign={"left"} />
    </Node>,
  );
  yield view.add(
    <Node ref={assistant} y={40} opacity={0}>
      {BrandRow({ logo: logoChatgpt, name: "ChatGPT", fill: "#ececec", x: -340, y: -70, size: 28 })}
      <Txt
        ref={textRef}
        text={""}
        fill={"#ececec"}
        fontFamily={SANS}
        fontSize={22}
        fontWeight={400}
        width={boxW}
        textWrap
        textAlign={"left"}
        x={boxX}
        y={boxY}
      />
      <Rect ref={caret} width={2} height={22} fill={accent} x={leftEdge(boxX, boxW)} y={boxY} opacity={0} />
    </Node>,
  );
  yield view.add(
    <Node ref={composer} y={280} opacity={0}>
      <Rect width={760} height={52} fill={"#2f2f2f"} radius={26} />
      <Txt text={"Message ChatGPT"} fill={"#8e8e8e"} fontFamily={SANS} fontSize={15} x={-250} textAlign={"left"} width={400} />
      <Circle width={34} height={34} fill={accent} x={340} />
      <Img src={sendIcon} width={16} height={16} x={340} />
    </Node>,
  );

  yield* pause(t.startDelay);
  yield* userBubble().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* assistant().opacity(1, t.revealDuration * 0.6, easeOutCubic);
  yield* thinkingDots(assistant, -340, 10, "#9aa3ad");
  caret().opacity(1);
  yield* typeChat(textRef, reply, t.lineDuration, (shown) => {
    placeCaretWrapped(caret, shown, boxX, boxY, boxW, 22, SANS, 400);
  });
  yield* blinkCaret(caret, 2);
  caret().opacity(0);
  yield* pause(t.connectDelay);
  yield* composer().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(0.95);
}

/** Minimal prompt composer typing. */
function* promptBox(view: any) {
  const prompt = clip(str("prompt", "Animate a Netflix-style title sting for BestMotions"), 140);
  const placeholder = str("placeholder", "Message an AI…");
  const accent = str("accent", "#8b5cf6");
  const bg = str("bg", "#0b0f14");
  const t = timing();
  view.fill(bg);

  const box = createRef<Node>();
  const textRef = createRef<Txt>();
  const caret = createRef<Rect>();
  const send = createRef<Circle>();
  const ph = createRef<Txt>();
  const textW = 620;
  const textX = -20;
  const textL = leftEdge(textX, textW);

  yield view.add(
    <Node ref={box} y={40} opacity={0} scale={0.96}>
      <Rect width={780} height={120} fill={"#141a22"} radius={20} shadowBlur={20} shadowColor={"#00000066"} />
      <Txt ref={ph} text={placeholder} fill={"#6b7280"} fontFamily={SANS} fontSize={20} x={textX} width={textW} textAlign={"left"} y={-18} />
      <Txt
        ref={textRef}
        text={""}
        fill={"#f3f4f6"}
        fontFamily={SANS}
        fontSize={20}
        fontWeight={500}
        x={textX}
        width={textW}
        textWrap
        textAlign={"left"}
        y={-8}
      />
      <Rect ref={caret} width={2} height={20} fill={accent} x={textL} y={-18} />
      <Circle ref={send} width={40} height={40} fill={accent} x={340} y={28} scale={0.85} />
      <Img src={sendIcon} width={16} height={16} x={340} y={28} />
    </Node>,
  );

  yield* pause(t.startDelay);
  yield* all(box().opacity(1, t.revealDuration, easeOutCubic), box().scale(1, t.revealDuration, easeOutBack));
  yield* pause(t.stepDelay);
  ph().opacity(0);
  yield* typeChars(textRef, prompt, t.lineDuration, (shown) => {
    placeCaretX(caret, textL, shown, 20, SANS, 500);
    caret().y(-8);
  });
  yield* all(send().scale(1, 0.22, easeOutBack), blinkCaret(caret, 2));
  yield* waitFor(0.9);
}

/** Word-stream AI draft on dark. */
function* wordStream(view: any) {
  const eyebrow = str("eyebrow", "AI DRAFT");
  const reply = clip(
    str("reply", "The best intros feel inevitable — not busy. One idea. One motion. Then breathe."),
    200,
  );
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07090e");
  const t = timing();
  view.fill(bg);

  const textRef = createRef<Txt>();
  const caret = createRef<Rect>();
  const boxW = 900;
  const boxY = 20;

  yield view.add(
    <Txt text={eyebrow.toUpperCase()} fill={accent} fontFamily={SANS} fontSize={13} letterSpacing={5} y={-70} />,
  );
  yield view.add(
    <Txt
      ref={textRef}
      text={""}
      fill={"#f4efe6"}
      fontFamily={SERIF}
      fontSize={32}
      fontWeight={400}
      width={boxW}
      textWrap
      textAlign={"center"}
      y={boxY}
    />,
  );
  yield view.add(<Rect ref={caret} width={3} height={30} fill={accent} y={boxY} opacity={0.9} />);

  yield* pause(t.startDelay);
  yield* typeChat(textRef, reply, t.lineDuration, (shown) => {
    const lines = wrapLines(shown, boxW, 32, SERIF, 400);
    const last = lines[lines.length - 1] || "";
    const n = Math.max(lines.length, 1);
    const lineH = 32 * 1.35;
    const firstY = boxY - ((n - 1) * lineH) / 2;
    const fullW = measureGlyphs(last, 32, SERIF, 400);
    // Centered lines: last line centered → caret after its right edge
    caret().position([fullW / 2 + 4, firstY + (n - 1) * lineH]);
  });
  yield* blinkCaret(caret, 2);
  caret().opacity(0);
  yield* waitFor(1.15);
}

/** Soft spotlight title (streaming drama). */
function* spotlightTitle(view: any) {
  const title = str("title", "THE OPENING FRAME");
  const subtitle = str("subtitle", "Before the first cut");
  const accent = str("accent", "#f4efe6");
  const bg = str("bg", "#050508");
  const t = timing();
  view.fill(bg);

  const tit = createRef<Txt>();
  const sub = createRef<Txt>();
  yield view.add(<Img src={vignetteUrl} width={1500} height={860} opacity={0.85} />);
  yield view.add(
    <Txt
      ref={tit}
      text={title}
      fill={accent}
      fontFamily={DISPLAY}
      fontSize={64}
      fontWeight={700}
      letterSpacing={8}
      y={24}
      opacity={0}
    />,
  );
  yield view.add(
    <Txt ref={sub} text={subtitle} fill={"#9aa3ad"} fontFamily={SERIF} fontSize={20} y={90} opacity={0} />,
  );

  yield* pause(t.startDelay);
  yield* all(tit().opacity(1, t.revealDuration, easeOutCubic), tit().y(0, t.revealDuration, easeOutCubic));
  yield* pause(t.connectDelay);
  yield* sub().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.25);
}

/** Chat composer suggestion chips — distinct from Google search dropdown. */
function* suggestCascade(view: any) {
  const stub = clip(str("stub", "how to"), 40);
  const items = [
    str("item1", "how to write a cold open"),
    str("item2", "how to pace a title card"),
    str("item3", "how to type like ChatGPT"),
    str("item4", "how to match Claude tone"),
  ].map((s) => clip(s, 42));
  const accent = str("accent", "#10a37f");
  const bg = str("bg", "#212121");
  const t = timing();
  view.fill(bg);

  const composer = createRef<Node>();
  const textRef = createRef<Txt>();
  const caret = createRef<Rect>();
  const textW = 560;
  const textX = -40;
  const textL = leftEdge(textX, textW);

  // Dark ChatGPT-style composer at bottom — not another Google bar
  yield view.add(
    <Node ref={composer} y={220} opacity={0} scale={0.96}>
      <Rect width={780} height={64} fill={"#2f2f2f"} radius={32} shadowBlur={20} shadowColor={"#00000066"} />
      <Txt
        ref={textRef}
        text={""}
        fill={"#ececec"}
        fontFamily={SANS}
        fontSize={18}
        fontWeight={500}
        x={textX}
        width={textW}
        textAlign={"left"}
      />
      <Rect ref={caret} width={2} height={20} fill={accent} x={textL} />
      <Circle width={36} height={36} fill={accent} x={340} />
      <Img src={sendIcon} width={16} height={16} x={340} />
    </Node>,
  );

  yield* pause(t.startDelay);
  yield* all(
    composer().opacity(1, t.revealDuration, easeOutCubic),
    composer().scale(1, t.revealDuration, easeOutBack),
  );
  yield* typeChars(textRef, stub, Math.min(0.85, t.lineDuration), (shown) => {
    placeCaretX(caret, textL, shown, 18, SANS, 500);
  });
  yield* blinkCaret(caret, 1);

  // Pill chips cascade ABOVE the composer (autocomplete suggestions)
  const chipW = [320, 300, 340, 310];
  for (let i = 0; i < items.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    const chip = createRef<Node>();
    const y = 120 - i * 52;
    const w = chipW[i] ?? 300;
    yield view.add(
      <Node ref={chip} y={y} opacity={0} scale={0.92}>
        <Rect width={w} height={42} fill={"#2a2a2a"} radius={21} stroke={"#3a3a3a"} lineWidth={1} />
        <Txt text={items[i]} fill={"#d1d5db"} fontFamily={SANS} fontSize={15} fontWeight={500} />
      </Node>,
    );
    yield* all(
      chip().opacity(1, t.revealDuration * 0.5, easeOutCubic),
      chip().scale(1, t.revealDuration * 0.5, easeOutBack),
    );
  }
  yield* waitFor(1.0);
}

/** Full multi-turn chatbot conversation with real brand logos. */
function* chatConversation(view: any) {
  const bot = str("bot", "chatgpt");
  const logo = botLogo(bot);
  const name = botLabel(bot);
  const u1 = clip(str("user1", "Can you help me open my video?"), 100);
  const a1 = clip(str("reply1", "Yes — start on black, then land one title line."), 140);
  const u2 = clip(str("user2", "Should there be music?"), 100);
  const a2 = clip(str("reply2", "Not yet. Hold silence for one beat after the title."), 140);
  const accent =
    bot === "claude" ? "#cc785c" : bot === "gemini" ? "#4285f4" : bot === "perplexity" ? "#22b8cd" : "#10a37f";
  const bg = str("bg", bot === "claude" ? "#f5f0eb" : "#212121");
  const userFill = bg === "#f5f0eb" ? "#ebe4dc" : "#2f2f2f";
  const textFill = bg === "#f5f0eb" ? "#2a2420" : "#ececec";
  const t = timing();
  view.fill(bg);

  const header = createRef<Node>();
  yield view.add(
    <Node ref={header} y={-300} opacity={0}>
      {BrandRow({ logo, name, fill: textFill, x: 0, y: 0, size: 28 })}
    </Node>,
  );
  yield* pause(t.startDelay);
  yield* header().opacity(1, t.revealDuration, easeOutCubic);

  const turns: Array<{ who: "user" | "bot"; text: string }> = [
    { who: "user", text: u1 },
    { who: "bot", text: a1 },
    { who: "user", text: u2 },
    { who: "bot", text: a2 },
  ];
  let y = -200;
  for (let i = 0; i < turns.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    const turn = turns[i];
    if (turn.who === "user") {
      const bubble = createRef<Node>();
      yield view.add(
        <Node ref={bubble} y={y} x={90} opacity={0}>
          <Rect width={520} height={64} fill={userFill} radius={14} />
          <Txt text={turn.text} fill={textFill} fontFamily={SANS} fontSize={16} width={460} textWrap textAlign={"left"} />
        </Node>,
      );
      yield* bubble().opacity(1, t.revealDuration * 0.7, easeOutCubic);
      y += 90;
    } else {
      const row = createRef<Node>();
      const textRef = createRef<Txt>();
      const caret = createRef<Rect>();
      const boxW = 700;
      const boxX = 20;
      const boxY = 0;
      yield view.add(
        <Node ref={row} y={y} opacity={0}>
          <Img src={logo} width={22} height={22} x={-390} y={-8} />
          <Txt
            ref={textRef}
            text={""}
            fill={textFill}
            fontFamily={SANS}
            fontSize={17}
            fontWeight={400}
            width={boxW}
            textWrap
            textAlign={"left"}
            x={boxX}
            y={boxY}
          />
          <Rect ref={caret} width={2} height={18} fill={accent} x={leftEdge(boxX, boxW)} y={boxY} opacity={0} />
        </Node>,
      );
      yield* row().opacity(1, t.revealDuration * 0.5, easeOutCubic);
      yield* thinkingDots(row, -360, 0, "#9aa3ad");
      caret().opacity(1);
      yield* typeChat(textRef, turn.text, Math.max(0.85, t.lineDuration * 0.5), (shown) => {
        placeCaretWrapped(caret, shown, boxX, boxY, boxW, 17, SANS, 400);
      });
      caret().opacity(0);
      y += 100;
    }
  }
  yield* waitFor(0.9);
}

/** Side-by-side two-bot replies (ChatGPT vs Claude / Gemini). */
function* multiBotCompare(view: any) {
  const botA = str("botA", "chatgpt");
  const botB = str("botB", "claude");
  const prompt = clip(str("prompt", "Give me a 1-line cold open."), 90);
  const replyA = clip(str("replyA", "Black frame. One sentence. Cut."), 110);
  const replyB = clip(str("replyB", "Start quiet — let the title arrive alone."), 110);
  const bg = str("bg", "#0f1115");
  const t = timing();
  view.fill(bg);

  const promptNode = createRef<Node>();
  yield view.add(
    <Node ref={promptNode} y={-260} opacity={0}>
      <Rect width={880} height={56} fill={"#1c212b"} radius={14} />
      <Txt text={prompt} fill={"#d7dde8"} fontFamily={SANS} fontSize={18} width={800} textAlign={"left"} />
    </Node>,
  );
  yield* pause(t.startDelay);
  yield* promptNode().opacity(1, t.revealDuration, easeOutCubic);

  const mkCard = (x: number, bot: string, reply: string) => {
    const card = createRef<Node>();
    const textRef = createRef<Txt>();
    const caret = createRef<Rect>();
    return { card, textRef, caret, x, bot, reply };
  };
  const left = mkCard(-280, botA, replyA);
  const right = mkCard(280, botB, replyB);
  const boxW = 400;
  const boxY = 30;

  for (const side of [left, right]) {
    yield view.add(
      <Node ref={side.card} x={side.x} y={40} opacity={0} scale={0.96}>
        <Rect width={480} height={320} fill={"#171b22"} radius={18} shadowBlur={18} shadowColor={"#00000066"} />
        {BrandRow({
          logo: botLogo(side.bot),
          name: botLabel(side.bot),
          fill: "#e8edf5",
          x: -150,
          y: -120,
          size: 28,
        })}
        <Txt
          ref={side.textRef}
          text={""}
          fill={"#cfd6e2"}
          fontFamily={SANS}
          fontSize={18}
          fontWeight={400}
          width={boxW}
          textWrap
          textAlign={"left"}
          y={boxY}
        />
        <Rect
          ref={side.caret}
          width={2}
          height={18}
          fill={"#8b5cf6"}
          x={leftEdge(0, boxW)}
          y={boxY}
          opacity={0}
        />
      </Node>,
    );
  }

  yield* pause(t.stepDelay);
  yield* all(
    left.card().opacity(1, t.revealDuration, easeOutCubic),
    left.card().scale(1, t.revealDuration, easeOutBack),
  );
  yield* thinkingDots(left.card, -160, 0, "#9aa3ad");
  left.caret().opacity(1);
  yield* typeChat(left.textRef, left.reply, t.lineDuration * 0.55, (shown) => {
    placeCaretWrapped(left.caret, shown, 0, boxY, boxW, 18, SANS, 400);
  });
  left.caret().opacity(0);
  yield* pause(t.connectDelay);
  yield* all(
    right.card().opacity(1, t.revealDuration, easeOutCubic),
    right.card().scale(1, t.revealDuration, easeOutBack),
  );
  yield* thinkingDots(right.card, -160, 0, "#9aa3ad");
  right.caret().opacity(1);
  yield* typeChat(right.textRef, right.reply, t.lineDuration * 0.55, (shown) => {
    placeCaretWrapped(right.caret, shown, 0, boxY, boxW, 18, SANS, 400);
  });
  right.caret().opacity(0);
  yield* waitFor(1.0);
}

/** Gemini-style chat reply with real Gemini logo. */
function* geminiReply(view: any) {
  const reply = clip(str("reply", "Here’s a clean structure: hook, proof, payoff — in that order."), 170);
  const accent = str("accent", "#4285f4");
  const bg = str("bg", "#0b0f14");
  const t = timing();
  view.fill(bg);
  const shell = createRef<Node>();
  const textRef = createRef<Txt>();
  const caret = createRef<Rect>();
  const boxW = 760;
  const boxY = 20;

  yield view.add(
    <Node ref={shell} opacity={0} y={10}>
      <Rect width={860} height={260} fill={"#151a22"} radius={20} />
      {BrandRow({ logo: logoGemini, name: "Gemini", fill: accent, x: -330, y: -90, size: 30 })}
      <Txt
        ref={textRef}
        text={""}
        fill={"#e8eef8"}
        fontFamily={SANS}
        fontSize={22}
        fontWeight={400}
        width={boxW}
        textWrap
        textAlign={"left"}
        y={boxY}
      />
      <Rect ref={caret} width={2} height={22} fill={accent} x={leftEdge(0, boxW)} y={boxY} opacity={0} />
    </Node>,
  );
  yield* pause(t.startDelay);
  yield* shell().opacity(1, t.revealDuration, easeOutCubic);
  yield* thinkingDots(shell, -340, 10, accent);
  caret().opacity(1);
  yield* typeChat(textRef, reply, t.lineDuration, (shown) => {
    placeCaretWrapped(caret, shown, 0, boxY, boxW, 22, SANS, 400);
  });
  yield* blinkCaret(caret, 2);
  caret().opacity(0);
  yield* waitFor(1.0);
}

/** Perplexity-style cited answer card. */
function* perplexityAnswer(view: any) {
  const reply = clip(
    str("reply", "Title stings work because they create a single focal point before the cut."),
    160,
  );
  const cite1 = clip(str("cite1", "motiondesign.archive"), 40);
  const cite2 = clip(str("cite2", "editcraft.notes"), 40);
  const accent = str("accent", "#22b8cd");
  const bg = str("bg", "#0a0d12");
  const t = timing();
  view.fill(bg);
  const card = createRef<Node>();
  const textRef = createRef<Txt>();
  const caret = createRef<Rect>();
  const boxW = 780;
  const boxY = -10;

  yield view.add(
    <Node ref={card} opacity={0}>
      <Rect width={880} height={300} fill={"#12171f"} radius={18} />
      {BrandRow({ logo: logoPerplexity, name: "Perplexity", fill: accent, x: -330, y: -110, size: 28 })}
      <Txt
        ref={textRef}
        text={""}
        fill={"#e6edf6"}
        fontFamily={SANS}
        fontSize={22}
        fontWeight={400}
        width={boxW}
        textWrap
        textAlign={"left"}
        y={boxY}
      />
      <Rect ref={caret} width={2} height={22} fill={accent} x={leftEdge(0, boxW)} y={boxY} opacity={0} />
    </Node>,
  );
  yield* pause(t.startDelay);
  yield* card().opacity(1, t.revealDuration, easeOutCubic);
  yield* thinkingDots(card, -340, -20, accent);
  caret().opacity(1);
  yield* typeChat(textRef, reply, t.lineDuration, (shown) => {
    placeCaretWrapped(caret, shown, 0, boxY, boxW, 22, SANS, 400);
  });
  caret().opacity(0);
  const c1 = createRef<Node>();
  const c2 = createRef<Node>();
  yield view.add(
    <Node ref={c1} y={110} x={-180} opacity={0}>
      <Rect width={280} height={36} fill={"#1b2430"} radius={10} />
      <Txt text={cite1} fill={"#9fb0c4"} fontFamily={SANS} fontSize={13} />
    </Node>,
  );
  yield view.add(
    <Node ref={c2} y={110} x={160} opacity={0}>
      <Rect width={280} height={36} fill={"#1b2430"} radius={10} />
      <Txt text={cite2} fill={"#9fb0c4"} fontFamily={SANS} fontSize={13} />
    </Node>,
  );
  yield* all(c1().opacity(1, t.revealDuration, easeOutCubic), c2().opacity(1, t.revealDuration, easeOutCubic));
  yield* waitFor(0.95);
}

export function* runAiText(view: any, template: string) {
  switch (template) {
    case "ai-netflix-sting":
      yield* netflixSting(view);
      break;
    case "ai-google-search":
      yield* googleSearch(view);
      break;
    case "ai-claude-reply":
      yield* claudeReply(view);
      break;
    case "ai-chatgpt-thread":
      yield* chatgptThread(view);
      break;
    case "ai-prompt-box":
      yield* promptBox(view);
      break;
    case "ai-word-stream":
      yield* wordStream(view);
      break;
    case "ai-spotlight-title":
      yield* spotlightTitle(view);
      break;
    case "ai-suggest-cascade":
      yield* suggestCascade(view);
      break;
    case "ai-chat-conversation":
      yield* chatConversation(view);
      break;
    case "ai-multi-bot":
      yield* multiBotCompare(view);
      break;
    case "ai-gemini-reply":
      yield* geminiReply(view);
      break;
    case "ai-perplexity-answer":
      yield* perplexityAnswer(view);
      break;
    default:
      yield* netflixSting(view);
  }
}
