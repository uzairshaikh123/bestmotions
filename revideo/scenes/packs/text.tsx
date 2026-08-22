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
import { blendPhrase, paintBlend } from "../../lib/highlight";
import { pause, timing } from "../../lib/timing";

const SERIF = "Libre Baskerville, Georgia, serif";

function* emphasize(view: any, mode: "underline" | "marker" | "both") {
  const text = str("text", "This policy changed everything");
  const highlight = str("highlight", "everything");
  const accent = str("accent", "#d8a11a");
  const marker = str("markerColor", "#FAFF00");
  const textColor = str("textColor", "#e8f0ea");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);

  const mark = createRef<Rect>();
  const rule = createRef<Rect>();
  const row = createRef<Layout>();

  yield view.add(
    <Layout ref={row} layout direction={"column"} gap={18} alignItems={"center"} y={0} opacity={0}>
      {blendPhrase(text, highlight, mark, {
        font: SERIF,
        size: 40,
        fill: textColor,
        marker,
        align: "center",
      })}
      <Rect ref={rule} width={0} height={6} fill={accent} radius={3} />
    </Layout>,
  );

  yield* pause(t.startDelay);
  yield* row().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  if (mode === "marker" || mode === "both") {
    yield* paintBlend(mark, highlight || text, 40, t.lineDuration);
  }
  if (mode === "underline" || mode === "both") {
    yield* pause(t.stepDelay);
    yield* rule().width(Math.max(100, (highlight || text).length * 16), t.lineDuration, easeOutCubic);
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
      })}
    </Layout>,
  );
  yield view.add(<Rect ref={rule} width={0} height={8} fill={accent} y={80} />);

  yield* pause(t.startDelay);
  yield* eye().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* all(block().opacity(1, t.revealDuration, easeOutCubic), block().scale(1, t.revealDuration, easeOutBack));
  yield* pause(t.connectDelay);
  yield* paintBlend(mark, highlight, 48, t.lineDuration);
  yield* rule().width(420, t.lineDuration, easeOutCubic);
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
  yield* paintBlend(paint, highlight, 40, t.lineDuration);
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
    default:
      yield* emphasize(view, "underline");
  }
}
