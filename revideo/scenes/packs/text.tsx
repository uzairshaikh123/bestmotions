/** @jsxImportSource @revideo/2d/lib */
import { Layout, Rect, Txt } from "@revideo/2d";
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  str,
  waitFor,
} from "../../lib/helpers";
import {
  blendPhrase,
  paintBlend,
  paintUnderline,
} from "../../lib/highlight";
import { pause, timing } from "../../lib/timing";

const SERIF = "Libre Baskerville, Georgia, serif";

function* emphasize(view: any, mode: "underline" | "marker" | "both") {
  const text = str("text", "This policy changed everything");
  const highlight = str("highlight", "everything");
  const accent = str("accent", "#d8a11a");
  const marker = str("markerColor", "#FAFF00");
  const textColor = str("textColor", "#e8f0ea");
  const bg = str("bg", "#07080c");
  const modeVar = str("mode", mode);
  const resolved =
    modeVar === "underline" || modeVar === "marker" || modeVar === "both"
      ? modeVar
      : mode;
  const phrase = highlight.trim() || text;
  const t = timing();
  view.fill(bg);

  const mark = createRef<Rect>();
  const rule = createRef<Rect>();
  const row = createRef<Layout>();
  const size = 40;

  yield view.add(
    <Layout ref={row} layout direction={"column"} gap={8} alignItems={"center"} y={0} opacity={0}>
      {blendPhrase(text, phrase, mark, {
        font: SERIF,
        size,
        fill: textColor,
        marker,
        align: "center",
        underline: rule,
        underlineColor: accent,
        weight: 700,
      })}
    </Layout>,
  );

  yield* pause(t.startDelay);
  yield* row().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  if (resolved === "marker" || resolved === "both") {
    yield* paintBlend(mark, phrase, size, t.lineDuration, SERIF, 700);
  }
  if (resolved === "underline" || resolved === "both") {
    if (resolved === "both") yield* pause(t.stepDelay);
    yield* paintUnderline(rule, phrase, size, t.lineDuration, SERIF, 700);
  }
  yield* waitFor(1.2);
}

function* headlineSlam(view: any) {
  const eyebrow = str("eyebrow", "Tonight");
  const headline = str("headline", "The deal nobody voted for");
  const highlight = str("highlight", "nobody voted");
  const accent = str("accent", "#d8a11a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);

  const eye = createRef<Txt>();
  const block = createRef<Layout>();
  const rule = createRef<Rect>();
  const mark = createRef<Rect>();
  yield view.add(
    <Txt ref={eye} text={eyebrow.toUpperCase()} fill={accent} fontFamily={SERIF} fontSize={16} letterSpacing={8} y={-140} opacity={0} />,
  );
  yield view.add(
    <Layout ref={block} layout justifyContent={"center"} y={-10} scale={0.82} opacity={0}>
      {blendPhrase(headline, highlight, mark, {
        font: SERIF,
        size: 48,
        fill: "#ffffff",
        marker: str("markerColor", "#FAFF00"),
        weight: 700,
        align: "center",
        underline: rule,
        underlineColor: accent,
      })}
    </Layout>,
  );

  yield* pause(t.startDelay);
  yield* eye().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* all(block().opacity(1, t.revealDuration, easeOutCubic), block().scale(1, t.revealDuration, easeOutBack));
  yield* pause(t.connectDelay);
  yield* paintBlend(mark, highlight, 48, t.lineDuration, SERIF, 700);
  yield* paintUnderline(rule, highlight, 48, t.lineDuration, SERIF, 700);
  yield* waitFor(1.2);
}

/** Giant documentary word slam with typewriter subtitle. */
function* docGiant(view: any) {
  const word = str("word", "EVIDENCE");
  const subtitle = str("subtitle", "What the official story left out");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);

  const big = createRef<Txt>();
  const sub = createRef<Txt>();
  const rule = createRef<Rect>();

  yield view.add(
    <Txt
      ref={big}
      text={word.toUpperCase()}
      fill={"#ffffff"}
      fontFamily={SERIF}
      fontSize={120}
      fontWeight={700}
      letterSpacing={4}
      scale={2.6}
      opacity={0}
      y={-30}
    />,
  );
  yield view.add(<Rect ref={rule} width={0} height={5} fill={accent} y={70} />);
  yield view.add(
    <Txt
      ref={sub}
      text={subtitle}
      fill={"#b8c0c8"}
      fontFamily={SERIF}
      fontSize={22}
      y={120}
      opacity={0}
    />,
  );

  yield* pause(t.startDelay);
  yield* all(
    big().scale(1, t.revealDuration, easeOutBack),
    big().opacity(1, t.revealDuration * 0.55, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* rule().width(260, t.lineDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* sub().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.3);
}

/** Documentary typewriter line with blinking caret. */
function* docTypewriter(view: any) {
  const line = str("line", "They never explained where the money went.");
  const label = str("label", "ARCHIVE NOTE");
  const accent = str("accent", "#e8c36a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);

  const mono = "Courier New, monospace";
  const labelRef = createRef<Txt>();
  const textRef = createRef<Txt>();
  const caret = createRef<Rect>();

  yield view.add(
    <Txt
      ref={labelRef}
      text={label.toUpperCase()}
      fill={accent}
      fontFamily={SERIF}
      fontSize={14}
      letterSpacing={6}
      y={-80}
      opacity={0}
    />,
  );
  yield view.add(
    <Txt
      ref={textRef}
      text={""}
      fill={"#f4efe6"}
      fontFamily={mono}
      fontSize={28}
      y={10}
      width={920}
      textWrap
    />,
  );
  yield view.add(
    <Rect ref={caret} width={3} height={28} fill={accent} x={-440} y={10} opacity={0} />,
  );

  yield* pause(t.startDelay);
  yield* labelRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* caret().opacity(1, 0.12);

  const chars = line.split("");
  const charDelay = Math.max(0.02, t.lineDuration / Math.max(chars.length, 1));
  for (let i = 0; i < chars.length; i++) {
    textRef().text(line.slice(0, i + 1));
    caret().x(-440 + Math.min(i * 14, 860));
    yield* waitFor(charDelay);
  }
  yield* waitFor(1.4);
}

/** Stacked documentary kinetic words — wipe + slam variants. */
function* docStack(view: any) {
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
    const isLast = i === words.length - 1;
    yield view.add(
      <Txt
        ref={word}
        text={words[i].toUpperCase()}
        fill={isLast ? accent : "#ffffff"}
        fontFamily={SERIF}
        fontSize={isLast ? 72 : 44}
        fontWeight={700}
        letterSpacing={isLast ? 6 : 2}
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

function* quoteCallout(view: any) {
  const quote = str("quote", "Democracy dies in darkness");
  const attribution = str("attribution", "— Editorial board");
  const highlight = str("highlight", "darkness");
  const accent = str("accent", "#d8a11a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);

  const mark = createRef<Txt>();
  const paint = createRef<Rect>();
  const body = createRef<Layout>();
  const rule = createRef<Rect>();
  const attr = createRef<Txt>();
  yield view.add(
    <Txt ref={mark} text={"“"} fill={accent} fontFamily={SERIF} fontSize={160} fontWeight={700} y={-160} opacity={0} />,
  );
  yield view.add(
    <Layout ref={body} y={10} opacity={0} layout justifyContent={"center"}>
      {blendPhrase(quote, highlight, paint, {
        font: SERIF,
        size: 40,
        fill: "#ffffff",
        marker: str("markerColor", "#FAFF00"),
        weight: 700,
        align: "center",
        width: 900,
      })}
    </Layout>,
  );
  yield view.add(<Rect ref={rule} width={0} height={4} fill={accent} y={110} />);
  yield view.add(
    <Txt ref={attr} text={attribution} fill={accent} fontFamily={SERIF} fontSize={18} y={150} opacity={0} />,
  );

  yield* pause(t.startDelay);
  yield* mark().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* body().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* paintBlend(paint, highlight, 40, t.lineDuration, SERIF, 700);
  yield* rule().width(280, t.lineDuration, easeOutCubic);
  yield* attr().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.2);
}

export function* runText(view: any, template: string) {
  switch (template) {
    case "text-underline":
      yield* emphasize(view, "underline");
      break;
    case "text-marker":
      yield* emphasize(view, "marker");
      break;
    case "text-both":
      yield* emphasize(view, "both");
      break;
    case "headline-slam":
      yield* headlineSlam(view);
      break;
    case "quote-callout":
      yield* quoteCallout(view);
      break;
    case "text-doc-giant":
      yield* docGiant(view);
      break;
    case "text-doc-typewriter":
      yield* docTypewriter(view);
      break;
    case "text-doc-stack":
      yield* docStack(view);
      break;
    default:
      yield* emphasize(view, "underline");
  }
}
