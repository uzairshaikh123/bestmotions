/** @jsxImportSource @revideo/2d/lib */
import { Circle, Layout, Node, Rect, Txt } from "@revideo/2d";
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
import { blendPhrase, paintBlend, HIGHLIGHTER } from "../../lib/highlight";
import { itemDelays, pause, timing } from "../../lib/timing";

const SERIF = "Libre Baskerville, Georgia, serif";
const INK = "#171310";
const PAPER = "#f2e8d4";
const DESK = "#0a0c12";

function desk(view: any, fill = DESK) {
  view.fill(fill);
}

function paperHeadline(
  headline: string,
  highlight: string,
  mark: any,
  opts: {
    y?: number;
    size: number;
    width: number;
    fill?: string;
    marker?: string;
  },
) {
  return (
    <Node y={opts.y ?? 0}>
      {blendPhrase(headline, highlight, mark, {
        font: SERIF,
        size: opts.size,
        fill: opts.fill ?? INK,
        marker: opts.marker ?? HIGHLIGHTER,
        weight: 700,
        align: "center",
        width: opts.width,
      })}
    </Node>
  );
}

/** Paper flies in from the right at a tilt, then a highlighter paints the phrase. */
function* slideHighlight(view: any) {
  const masthead = str("masthead", "THE DAILY CHRONICLE");
  const date = str("date", "Monday, July 20, 2026");
  const headline = str("headline", "A defining moment for the nation");
  const highlight = str("highlight", "defining moment");
  const body = str(
    "body",
    "In a landmark development, leaders gathered as history turned a new page.",
  );
  const accent = str("accent", "#FAFF00");
  const ink = str("ink", INK);
  const rotation = num("rotation", -4);

  desk(view);
  const paper = createRef<Rect>();
  const mark = createRef<Rect>();
  yield view.add(
    <Rect
      ref={paper}
      width={760}
      height={480}
      fill={PAPER}
      radius={3}
      shadowColor={"#00000088"}
      shadowBlur={36}
      shadowOffsetY={18}
      x={920}
      rotation={rotation}
      layout
      direction={"column"}
      gap={16}
      padding={44}
      alignItems={"start"}
    >
      <Txt text={masthead} fill={"#8b1e1e"} fontFamily={SERIF} fontSize={18} letterSpacing={6} fontWeight={700} />
      <Txt text={date} fill={"#6a5f52"} fontFamily={SERIF} fontSize={13} />
      <Rect width={672} height={2} fill={"#c9b89a"} />
      {blendPhrase(headline, highlight, mark, {
        font: SERIF,
        size: 36,
        fill: ink,
        marker: accent,
        weight: 700,
        width: 672,
      })}
      <Txt text={body} fill={"#3d342c"} fontFamily={SERIF} fontSize={18} width={672} textWrap />
    </Rect>,
  );
  const t = timing();
  yield* pause(t.startDelay);
  yield* paper().x(20, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* paintBlend(mark, highlight, 36, t.lineDuration);
  yield* waitFor(1.5);
}

/** Full clipping; a red ellipse slams onto the key phrase. */
function* redCircle(view: any) {
  const masthead = str("masthead", "MORNING POST");
  const headline = str("headline", "Growth hits a historic high this quarter");
  const body = str(
    "body",
    "Markets reacted sharply as numbers crossed every forecast. Experts call it a generational shift.",
  );
  const accent = str("accent", "#d62828");
  const ink = str("ink", INK);

  desk(view);
  yield view.add(
    <Rect width={820} height={500} fill={PAPER} radius={2} y={10} shadowBlur={30} shadowColor={"#00000077"} />
  );
  yield view.add(
    <Txt text={masthead} fill={"#111"} fontFamily={SERIF} fontSize={22} fontWeight={700} y={-200} letterSpacing={8} />,
  );
  yield view.add(<Rect width={680} height={3} fill={"#111"} y={-168} />);
  yield view.add(
    <Txt text={headline} fill={ink} fontFamily={SERIF} fontSize={34} fontWeight={700} y={-90} width={640} textWrap textAlign={"center"} />,
  );
  yield view.add(
    <Txt text={body} fill={"#4a4038"} fontFamily={SERIF} fontSize={18} y={70} width={620} textWrap textAlign={"center"} />,
  );
  const ring = createRef<Circle>();
  yield view.add(
    <Circle
      ref={ring}
      width={340}
      height={110}
      stroke={accent}
      lineWidth={8}
      fill={null}
      y={-88}
      scale={0.2}
      opacity={0}
      lineCap={"round"}
    />,
  );
  const t = timing();
  yield* pause(t.startDelay);
  yield* all(ring().scale(1, t.revealDuration, easeOutBack), ring().opacity(1, t.revealDuration * 0.5, easeOutCubic));
  yield* ring().rotation(8, t.revealDuration, easeOutCubic);
  yield* waitFor(1.4);
}

/** Editorial kicker + a hand-drawn underline growing under the headline. */
function* drawLine(view: any) {
  const kicker = str("kicker", "EDITORIAL");
  const headline = str("headline", "The road ahead will not be easy");
  const phrase = str("underline", "will not be easy");
  const sub = str("sub", "Why patience and clarity matter more than ever.");
  const accent = str("accent", "#1b4dff");
  const mode = str("mode", "underline");

  desk(view, "#0e1016");
  const mark = createRef<Rect>();
  yield view.add(
    <Txt text={kicker} fill={accent} fontFamily={SERIF} fontSize={16} letterSpacing={8} y={-200} />,
  );
  yield view.add(
    paperHeadline(headline, phrase, mark, {
      y: -40,
      size: 48,
      width: 900,
      fill: "#f4efe6",
      marker: HIGHLIGHTER,
    }),
  );
  yield view.add(
    <Txt text={sub} fill={"#9aa3ad"} fontFamily={SERIF} fontSize={20} y={90} />,
  );

  const line = createRef<Rect>();
  yield view.add(<Rect ref={line} width={0} height={mode === "strike" ? 6 : 8} fill={accent} y={mode === "strike" ? -38 : 28} radius={4} />);

  const t = timing();
  yield* pause(t.startDelay);
  if (mode === "marker" || mode === "both") {
    yield* paintBlend(mark, phrase, 48, t.lineDuration);
    yield* pause(t.stepDelay);
  }
  if (mode !== "marker") {
    yield* pause(t.connectDelay);
    yield* line().width(620, t.lineDuration, easeOutCubic);
  }
  yield* waitFor(1.5);
}

/** Small clipping on a dark desk; camera pushes in while the marker sweeps. */
function* clipZoom(view: any) {
  const masthead = str("masthead", "CITY TIMES");
  const byline = str("byline", "By Staff Reporter");
  const headline = str("headline", "Record turnout at the polls today");
  const highlight = str("highlight", "Record turnout");
  const accent = str("accent", HIGHLIGHTER);
  const ink = str("ink", INK);

  desk(view, "#14110e");
  const clip = createRef<Layout>();
  const mark = createRef<Rect>();
  yield view.add(
    <Layout ref={clip} scale={0.78} y={20}>
      <Rect width={560} height={340} fill={PAPER} rotation={-2} shadowBlur={28} shadowColor={"#00000099"} />
      <Txt text={masthead} fill={"#8b1e1e"} fontFamily={SERIF} fontSize={14} letterSpacing={5} y={-120} fontWeight={700} />
      <Txt text={byline} fill={"#7a6f62"} fontFamily={SERIF} fontSize={13} y={-92} />
      {paperHeadline(headline, highlight, mark, {
        y: -20,
        size: 28,
        width: 480,
        fill: ink,
        marker: accent,
      })}
    </Layout>,
  );
  const t = timing();
  yield* pause(t.startDelay);
  yield* clip().scale(1.12, t.lineDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* paintBlend(mark, highlight, 28, t.lineDuration);
  yield* waitFor(1.2);
}

/** Broadsheet columns with a slamming BREAKING stamp. */
function* frontPage(view: any) {
  const masthead = str("masthead", "THE NATIONAL");
  const date = str("date", "Vol. 112  ·  July 2026");
  const headline = str("headline", "Parliament clears landmark bill");
  const deck = str("deck", "Opposition divided as the vote passes after midnight debate.");
  const col1 = str("col1", "Sources say negotiations ran late into the night.");
  const col2 = str("col2", "Markets opened higher. Civil society groups called for careful implementation.");
  const stamp = str("stamp", "BREAKING");
  const accent = str("accent", "#c1121f");
  const ink = str("ink", INK);

  desk(view);
  yield view.add(<Rect width={980} height={560} fill={PAPER} y={8} />);
  yield view.add(
    <Txt text={masthead} fill={"#111"} fontFamily={SERIF} fontSize={42} fontWeight={700} y={-230} letterSpacing={4} />,
  );
  yield view.add(<Txt text={date} fill={"#5c5348"} fontFamily={SERIF} fontSize={14} y={-188} />);
  yield view.add(<Rect width={860} height={4} fill={"#111"} y={-168} />);
  yield view.add(
    <Txt text={headline} fill={ink} fontFamily={SERIF} fontSize={38} fontWeight={700} y={-110} width={860} textAlign={"center"} textWrap />,
  );
  yield view.add(
    <Txt text={deck} fill={"#4a433c"} fontFamily={SERIF} fontSize={18} y={-28} width={820} textAlign={"center"} textWrap />,
  );
  yield view.add(
    <Txt text={col1} fill={"#3a342e"} fontFamily={SERIF} fontSize={16} x={-220} y={90} width={360} textWrap />,
  );
  yield view.add(
    <Txt text={col2} fill={"#3a342e"} fontFamily={SERIF} fontSize={16} x={220} y={90} width={360} textWrap />,
  );
  const st = createRef<Txt>();
  yield view.add(
    <Txt
      ref={st}
      text={stamp}
      fill={accent}
      fontFamily={SERIF}
      fontSize={54}
      fontWeight={700}
      rotation={-18}
      x={310}
      y={-40}
      scale={2.4}
      opacity={0}
    />,
  );
  const t = timing();
  yield* pause(t.startDelay);
  yield* all(st().scale(1, t.revealDuration, easeOutBack), st().opacity(1, t.revealDuration * 0.5, easeOutCubic));
  yield* waitFor(1.6);
}

/** Photo block on the left, caption + underline on the right. */
function* photoCaption(view: any) {
  const caption = str("caption", "Crowds gather as results are announced late into the night.");
  const highlight = str("highlight", "results are announced");
  const credit = str("credit", "Staff photo");
  const accent = str("accent", "#e63946");
  const ink = str("ink", "#f4efe6");

  desk(view, "#121418");
  const photo = createRef<Rect>();
  const mark = createRef<Rect>();
  yield view.add(
    <Rect ref={photo} width={520} height={340} fill={"#2a2420"} x={-260} y={-20} opacity={0} />,
  );
  yield view.add(
    <Txt text={credit.toUpperCase()} fill={"#8d867c"} fontFamily={SERIF} fontSize={12} letterSpacing={2} x={-260} y={170} />,
  );
  yield view.add(
    <Layout x={270} y={-40} width={380} layout>
      {blendPhrase(caption, highlight, mark, {
        font: SERIF,
        size: 26,
        fill: ink,
        marker: HIGHLIGHTER,
        weight: 700,
        width: 380,
      })}
    </Layout>,
  );
  const line = createRef<Rect>();
  yield view.add(<Rect ref={line} width={0} height={6} fill={accent} x={120} y={80} radius={3} />);
  const t = timing();
  yield* pause(t.startDelay);
  yield* photo().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* paintBlend(mark, highlight, 26, t.lineDuration);
  yield* line().width(360, t.lineDuration, easeOutCubic);
  yield* waitFor(1.5);
}

/** Three headline strips slam in from left, each with its own rule. */
function* headlineStack(view: any) {
  const title = str("title", "In the papers");
  const lines = [
    str("line1", "Markets surge on reform news"),
    str("line2", "Cabinet clears infrastructure push"),
    str("line3", "States race to implement the plan"),
  ];
  const accent = str("accent", "#c1121f");
  const ink = str("ink", INK);

  desk(view, "#0b0d12");
  const t = timing();
  const extra = itemDelays(lines.length);
  yield view.add(
    <Txt text={title.toUpperCase()} fill={accent} fontFamily={SERIF} fontSize={16} letterSpacing={6} y={-250} />,
  );
  yield* pause(t.startDelay);
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const row = createRef<Layout>();
    const rule = createRef<Rect>();
    const y = -120 + i * 130;
    yield view.add(
      <Layout ref={row} y={y} x={-1100}>
        <Rect width={880} height={100} fill={PAPER} shadowBlur={18} shadowColor={"#00000066"} />
        <Txt text={lines[i]} fill={ink} fontFamily={SERIF} fontSize={26} fontWeight={700} />
      </Layout>,
    );
    yield view.add(<Rect ref={rule} width={0} height={4} fill={accent} y={y + 36} />);
    yield* row().x(0, t.revealDuration, easeOutCubic);
    yield* pause(t.connectDelay);
    yield* rule().width(520, t.lineDuration, easeOutCubic);
  }
  yield* waitFor(1.3);
}

/** Lens moves across the column, then a marker wash locks onto the phrase. */
function* magnifier(view: any) {
  const body = str(
    "body",
    "The committee noted that infrastructure, education and health must move together if the gains are to last. Growth without inclusion, they warned, would leave the story unfinished.",
  );
  const highlight = str("highlight", "Growth without inclusion");
  const accent = str("accent", HIGHLIGHTER);
  const ink = str("ink", INK);

  desk(view);
  const mark = createRef<Rect>();
  yield view.add(<Rect width={900} height={480} fill={PAPER} />);
  yield view.add(
    <Txt text={body} fill={ink} fontFamily={SERIF} fontSize={22} width={760} textWrap y={-40} />,
  );
  yield view.add(
    paperHeadline(highlight, highlight, mark, {
      y: 80,
      size: 22,
      width: 760,
      fill: ink,
      marker: accent,
    }),
  );
  const lens = createRef<Circle>();
  yield view.add(
    <Circle ref={lens} size={160} stroke={"#d8c9a6"} lineWidth={14} fill={"#fff6dc33"} x={-280} y={30} />,
  );
  const t = timing();
  yield* pause(t.startDelay);
  yield* lens().x(220, t.lineDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* paintBlend(mark, highlight, 22, t.lineDuration);
  yield* waitFor(1.3);
}

/** Giant quote with a box drawn line-by-line, then credit underline. */
function* quoteBox(view: any) {
  const quote = str("quote", "History is written by those who show up.");
  const attribution = str("attribution", "— Anonymous editorial");
  const accent = str("accent", "#1d3557");
  const ink = str("ink", INK);

  desk(view, "#10141c");
  yield view.add(
    <Txt text={"“"} fill={accent} fontFamily={SERIF} fontSize={160} x={-430} y={-140} opacity={0.35} />,
  );
  yield view.add(
    <Txt text={quote} fill={"#f4efe6"} fontFamily={SERIF} fontSize={36} fontWeight={700} width={720} textWrap textAlign={"center"} />,
  );
  yield view.add(
    <Txt text={attribution} fill={"#c5ccd6"} fontFamily={SERIF} fontSize={18} y={160} />,
  );
  const top = createRef<Rect>();
  const right = createRef<Rect>();
  const bottom = createRef<Rect>();
  const left = createRef<Rect>();
  const credit = createRef<Rect>();
  yield view.add(<Rect ref={top} width={0} height={4} fill={accent} y={-170} x={-360} />);
  yield view.add(<Rect ref={right} width={4} height={0} fill={accent} x={360} y={-170} />);
  yield view.add(<Rect ref={bottom} width={0} height={4} fill={accent} y={170} x={360} />);
  yield view.add(<Rect ref={left} width={4} height={0} fill={accent} x={-360} y={170} />);
  yield view.add(<Rect ref={credit} width={0} height={3} fill={accent} y={186} />);
  const t = timing();
  yield* pause(t.startDelay);
  yield* top().width(720, t.lineDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* all(top().x(0, 0.01), right().height(340, t.lineDuration, easeOutCubic));
  yield* pause(t.stepDelay);
  yield* all(right().y(0, 0.01), bottom().width(720, t.lineDuration, easeOutCubic), bottom().x(0, t.lineDuration, easeOutCubic));
  yield* pause(t.stepDelay);
  yield* all(left().height(340, t.lineDuration, easeOutCubic), left().y(0, t.lineDuration, easeOutCubic));
  yield* pause(t.connectDelay);
  yield* credit().width(280, t.lineDuration, easeOutCubic);
  yield* waitFor(1.3);
}

/** Full masthead + photo bar + two columns (Dhruv-style evidence page). */
function* ultraFront(view: any) {
  const masthead = str("masthead", "THE MORNING TRIBUNE");
  const volume = str("volume", "Vol. 214  No. 48");
  const kicker = str("kicker", "NATION");
  const headline = str("headline", "Historic turnout reshapes the political map overnight");
  const highlight = str("highlight", "Historic turnout");
  const deck = str("deck", "Crowds filled streets as results poured in.");
  const col1 = str("col1", "Preliminary counts show a decisive shift that few pollsters had predicted.");
  const col2 = str("col2", "Opposition leaders called for calm and a careful reading of the numbers.");
  const caption = str("caption", "Supporters gather outside the counting centre.");
  const accent = str("markerColor", HIGHLIGHTER);
  const paper = str("paperTint", PAPER);

  desk(view);
  const page = createRef<Rect>();
  const mark = createRef<Rect>();
  yield view.add(<Rect ref={page} width={1040} height={600} fill={paper} y={40} opacity={0} />);
  const t = timing();
  yield* pause(t.startDelay);
  yield* page().opacity(1, t.revealDuration, easeOutCubic);
  yield view.add(
    <Txt text={masthead} fill={"#111"} fontFamily={SERIF} fontSize={34} fontWeight={700} y={-240} letterSpacing={3} />,
  );
  yield view.add(<Txt text={volume} fill={"#6a6258"} fontFamily={SERIF} fontSize={12} y={-204} />);
  yield view.add(<Rect width={920} height={3} fill={"#111"} y={-186} />);
  yield view.add(
    <Txt text={kicker} fill={"#8b1e1e"} fontFamily={SERIF} fontSize={14} letterSpacing={6} y={-160} />,
  );
  yield view.add(
    paperHeadline(headline, highlight, mark, {
      y: -110,
      size: 30,
      width: 900,
      fill: "#151210",
      marker: accent,
    }),
  );
  yield view.add(
    <Txt text={deck} fill={"#4a433c"} fontFamily={SERIF} fontSize={16} y={-40} width={820} textAlign={"center"} textWrap />,
  );
  yield view.add(<Rect width={420} height={140} fill={"#2b2622"} x={-230} y={90} />);
  yield view.add(
    <Txt text={caption} fill={"#6a6258"} fontFamily={SERIF} fontSize={12} x={-230} y={172} width={400} textWrap />,
  );
  yield view.add(
    <Txt text={col1} fill={"#3a342e"} fontFamily={SERIF} fontSize={15} x={240} y={50} width={380} textWrap />,
  );
  yield view.add(
    <Txt text={col2} fill={"#3a342e"} fontFamily={SERIF} fontSize={15} x={240} y={150} width={380} textWrap />,
  );
  yield* pause(t.connectDelay);
  yield* paintBlend(mark, highlight, 30, t.lineDuration);
  yield* waitFor(1.4);
}

/** Sheet starts folded thin, then unrolls onto the desk. */
function* ultraFold(view: any) {
  const masthead = str("masthead", "EVENING POST");
  const headline = str("headline", "Secrets buried in the archives finally surface");
  const highlight = str("highlight", "finally surface");
  const body = str(
    "body",
    "A newly released cache of documents is forcing a rewrite of the official narrative.",
  );
  const accent = str("markerColor", HIGHLIGHTER);
  const paper = str("paperTint", "#efe4cc");

  desk(view, "#161208");
  const sheet = createRef<Rect>();
  const mark = createRef<Rect>();
  yield view.add(
    <Rect
      ref={sheet}
      width={48}
      height={460}
      fill={paper}
      shadowBlur={40}
      shadowColor={"#000000aa"}
    />,
  );
  const t = timing();
  yield* pause(t.startDelay);
  yield* sheet().width(780, t.revealDuration, easeOutCubic);
  yield view.add(
    <Txt text={masthead} fill={"#8b1e1e"} fontFamily={SERIF} fontSize={16} letterSpacing={6} y={-170} fontWeight={700} />,
  );
  yield view.add(
    paperHeadline(headline, highlight, mark, {
      y: -70,
      size: 30,
      width: 680,
      marker: accent,
    }),
  );
  yield view.add(
    <Txt text={body} fill={"#4a4038"} fontFamily={SERIF} fontSize={18} y={70} width={660} textWrap textAlign={"center"} />,
  );
  yield* pause(t.connectDelay);
  yield* paintBlend(mark, highlight, 30, t.lineDuration);
  yield* waitFor(1.3);
}

/** Ken Burns: clipping already on desk, camera slowly pushes in. */
function* ultraPush(view: any) {
  const masthead = str("masthead", "CITY TIMES");
  const date = str("date", "July 30, 2026");
  const headline = str("headline", "Record crowds demand answers at the gates");
  const highlight = str("highlight", "Record crowds");
  const body = str("body", "From dawn the avenues filled. Chants rolled between buildings.");
  const accent = str("markerColor", HIGHLIGHTER);
  const paper = str("paperTint", "#f4ead8");

  desk(view, "#0c0a08");
  const cam = createRef<Layout>();
  const mark = createRef<Rect>();
  yield view.add(
    <Layout ref={cam} scale={0.92} y={16}>
      <Rect width={820} height={500} fill={paper} rotation={1.5} />
      <Txt text={`${masthead}  ·  ${date}`} fill={"#7a1c1c"} fontFamily={SERIF} fontSize={14} letterSpacing={3} y={-200} />
      {paperHeadline(headline, highlight, mark, {
        y: -80,
        size: 32,
        width: 700,
        marker: accent,
      })}
      <Txt text={body} fill={"#4a4038"} fontFamily={SERIF} fontSize={18} y={80} width={680} textWrap textAlign={"center"} />
    </Layout>,
  );
  const t = timing();
  yield* pause(t.startDelay);
  yield* all(cam().scale(1.18, t.lineDuration * 3, easeOutCubic), cam().y(-10, t.lineDuration * 3, easeOutCubic));
  yield* pause(t.connectDelay);
  yield* paintBlend(mark, highlight, 32, t.lineDuration);
  yield* waitFor(1.0);
}

/** Red EXTRA / LATE CITY banner drops, then headline lands. */
function* ultraExtra(view: any) {
  const masthead = str("masthead", "THE DAILY RECORD");
  const banner = str("banner", "EXTRA");
  const headline = str("headline", "Breaking developments overnight stun the capital");
  const highlight = str("highlight", "Breaking developments");
  const sub = str("sub", "Live updates as officials scramble to respond");
  const bannerColor = str("bannerColor", "#b00000");
  const accent = str("markerColor", HIGHLIGHTER);
  const paper = str("paperTint", "#f1e6d0");

  desk(view);
  const mark = createRef<Rect>();
  yield view.add(<Rect width={960} height={540} fill={paper} y={20} />);
  yield view.add(
    <Txt text={masthead} fill={"#111"} fontFamily={SERIF} fontSize={28} fontWeight={700} y={-200} letterSpacing={4} />,
  );
  const bar = createRef<Rect>();
  yield view.add(
    <Rect ref={bar} width={960} height={70} fill={bannerColor} y={-360} />,
  );
  yield view.add(
    <Txt text={banner} fill={"#fff"} fontFamily={SERIF} fontSize={40} fontWeight={700} letterSpacing={14} y={-360} />,
  );
  const t = timing();
  yield* pause(t.startDelay);
  yield* bar().y(-120, t.revealDuration, easeOutBack);
  yield view.add(
    paperHeadline(headline, highlight, mark, {
      y: 20,
      size: 32,
      width: 820,
      marker: accent,
    }),
  );
  yield view.add(
    <Txt text={sub} fill={"#5c5348"} fontFamily={SERIF} fontSize={18} y={140} />,
  );
  yield* pause(t.connectDelay);
  yield* paintBlend(mark, highlight, 32, t.lineDuration);
  yield* waitFor(1.3);
}

/** Stack of aged papers; the top sheet slides down onto the pile. */
function* ultraStack(view: any) {
  const masthead = str("masthead", "WEEKLY OBSERVER");
  const headline = str("headline", "The story they tried to bury is now on every desk");
  const highlight = str("highlight", "tried to bury");
  const line2 = str("line2", "Editors race to verify a flood of fresh claims");
  const line3 = str("line3", "Public demands a full and open inquiry");
  const accent = str("markerColor", HIGHLIGHTER);
  const paper = str("paperTint", "#f0e5cf");

  desk(view, "#12100c");
  const mark = createRef<Rect>();
  yield view.add(<Rect width={760} height={430} fill={"#cfc0a4"} rotation={-7} y={36} x={-18} />);
  yield view.add(<Rect width={760} height={430} fill={"#e2d3b6"} rotation={4} y={16} x={22} />);
  const top = createRef<Rect>();
  yield view.add(
    <Rect ref={top} width={760} height={430} fill={paper} y={-420} shadowBlur={24} shadowColor={"#00000066"} />,
  );
  const t = timing();
  yield* pause(t.startDelay);
  yield* top().y(0, t.revealDuration, easeOutCubic);
  yield view.add(
    <Txt text={masthead} fill={"#7a1c1c"} fontFamily={SERIF} fontSize={14} letterSpacing={5} y={-160} fontWeight={700} />,
  );
  yield view.add(
    paperHeadline(headline, highlight, mark, {
      y: -70,
      size: 26,
      width: 660,
      marker: accent,
    }),
  );
  yield view.add(<Txt text={line2} fill={"#4a4038"} fontFamily={SERIF} fontSize={16} y={40} />);
  yield view.add(<Txt text={line3} fill={"#4a4038"} fontFamily={SERIF} fontSize={16} y={74} />);
  yield* pause(t.connectDelay);
  yield* paintBlend(mark, highlight, 26, t.lineDuration);
  yield* waitFor(1.3);
}

/** Dark-field letterpress: giant serif type, then an ink underline. */
function* letterpress(view: any) {
  const kicker = str("kicker", "EDITORIAL");
  const headline = str("headline", "Truth does not fear the printing press");
  const body = str(
    "body",
    "In an age of noise, the printed word still demands we slow down and look closer.",
  );
  const accent = str("accent", "#1d4ed8");
  const ink = str("ink", "#1a1510");
  const paper = str("paperTint", "#efe6d2");

  desk(view, "#1a1712");
  yield view.add(<Rect width={880} height={200} fill={paper} y={-40} />);
  yield view.add(
    <Txt text={kicker} fill={accent} fontFamily={SERIF} fontSize={14} letterSpacing={8} y={-200} />,
  );
  yield view.add(
    <Txt text={headline} fill={ink} fontFamily={SERIF} fontSize={40} fontWeight={700} y={-50} width={800} textWrap textAlign={"center"} />,
  );
  yield view.add(
    <Txt text={body} fill={"#c9c0b2"} fontFamily={SERIF} fontSize={18} y={140} width={760} textWrap textAlign={"center"} />,
  );
  const line = createRef<Rect>();
  yield view.add(<Rect ref={line} width={0} height={10} fill={accent} y={40} />);
  const t = timing();
  yield* pause(t.startDelay);
  yield* line().width(540, t.lineDuration, easeOutCubic);
  yield* waitFor(1.4);
}

/** Two pages open from the gutter like a spread. */
function* spread(view: any) {
  const leftHead = str("leftHeadline", "Inside the closed-door meeting");
  const leftBody = str("leftBody", "Minutes obtained by this paper show how quickly consensus formed.");
  const rightHead = str("rightHeadline", "Markets react as the news breaks");
  const rightBody = str("rightBody", "Investors scrambled for clarity as statements conflicted across capitals.");
  const paper = str("paperTint", PAPER);

  desk(view, "#0d0c0a");
  const left = createRef<Rect>();
  const right = createRef<Rect>();
  yield view.add(<Rect ref={left} width={470} height={520} fill={paper} x={0} />);
  yield view.add(<Rect ref={right} width={470} height={520} fill={"#ece1cb"} x={0} />);
  const t = timing();
  yield* pause(t.startDelay);
  yield* all(left().x(-250, t.revealDuration, easeOutCubic), right().x(250, t.revealDuration, easeOutCubic));
  yield view.add(<Rect width={8} height={520} fill={"#00000055"} />);
  yield view.add(
    <Txt text={str("leftMasthead", "THE NATIONAL")} fill={"#8b1e1e"} fontFamily={SERIF} fontSize={12} letterSpacing={3} x={-250} y={-210} />,
  );
  yield view.add(
    <Txt text={leftHead} fill={INK} fontFamily={SERIF} fontSize={22} fontWeight={700} x={-250} y={-120} width={380} textWrap textAlign={"center"} />,
  );
  yield view.add(
    <Txt text={leftBody} fill={"#4a4038"} fontFamily={SERIF} fontSize={15} x={-250} y={40} width={380} textWrap textAlign={"center"} />,
  );
  yield view.add(
    <Txt text={str("rightMasthead", "WORLD")} fill={"#8b1e1e"} fontFamily={SERIF} fontSize={12} letterSpacing={3} x={250} y={-210} />,
  );
  yield view.add(
    <Txt text={rightHead} fill={INK} fontFamily={SERIF} fontSize={22} fontWeight={700} x={250} y={-120} width={380} textWrap textAlign={"center"} />,
  );
  yield view.add(
    <Txt text={rightBody} fill={"#4a4038"} fontFamily={SERIF} fontSize={15} x={250} y={40} width={380} textWrap textAlign={"center"} />,
  );
  yield* waitFor(1.6);
}

/** Aged newsprint with a double red circle (hand-drawn look). */
function* ultraCircle(view: any) {
  const masthead = str("masthead", "MORNING POST");
  const headline = str("headline", "Growth hits a historic high this quarter");
  const body = str("body", "Markets reacted sharply as numbers crossed every forecast.");
  const accent = str("accent", "#c1121f");
  const paper = str("paperTint", "#f3ead6");

  desk(view);
  yield view.add(<Rect width={840} height={500} fill={paper} rotation={-1} />);
  yield view.add(
    <Txt text={masthead} fill={"#3a2f26"} fontFamily={SERIF} fontSize={18} letterSpacing={7} y={-190} />,
  );
  yield view.add(
    <Txt text={headline} fill={INK} fontFamily={SERIF} fontSize={32} fontWeight={700} y={-70} width={680} textWrap textAlign={"center"} />,
  );
  yield view.add(
    <Txt text={body} fill={"#4a4038"} fontFamily={SERIF} fontSize={18} y={80} width={640} textWrap textAlign={"center"} />,
  );
  const a = createRef<Circle>();
  const b = createRef<Circle>();
  yield view.add(
    <Circle ref={a} width={360} height={120} stroke={accent} lineWidth={7} fill={null} y={-68} scale={0} />,
  );
  yield view.add(
    <Circle ref={b} width={340} height={108} stroke={accent} lineWidth={3} fill={null} y={-64} rotation={6} opacity={0} />,
  );
  const t = timing();
  yield* pause(t.startDelay);
  yield* a().scale(1, t.revealDuration, easeOutBack);
  yield* pause(t.connectDelay);
  yield* b().opacity(0.85, t.revealDuration, easeOutCubic);
  yield* waitFor(1.4);
}

/** Rotated torn clipping with jagged tabs around the edge. */
function* torn(view: any) {
  const masthead = str("masthead", "DAILY NEWS");
  const date = str("date", "Saturday, August 1, 2026");
  const headline = str("headline", "Newspaper effect that looks hand-torn");
  const highlight = str("highlight", "hand-torn");
  const body = str("body", "A clipped story with ragged edges, sitting above a dark grid.");
  const accent = str("markerColor", HIGHLIGHTER);
  const paper = str("paperTint", "#f4ead8");
  const rotation = num("rotation", -6);

  desk(view, "#15181e");
  const clip = createRef<Layout>();
  const mark = createRef<Rect>();
  yield view.add(
    <Layout ref={clip} rotation={rotation} y={24} scale={0.9} opacity={0}>
      <Rect width={640} height={400} fill={paper} />
      <Rect width={48} height={70} fill={paper} x={-320} y={-90} rotation={18} />
      <Rect width={56} height={54} fill={paper} x={318} y={40} rotation={-12} />
      <Rect width={70} height={40} fill={paper} x={-40} y={-210} rotation={8} />
      <Txt text={`${masthead}  ·  ${date}`} fill={"#7a1c1c"} fontFamily={SERIF} fontSize={13} y={-150} />
      {paperHeadline(headline, highlight, mark, {
        y: -40,
        size: 26,
        width: 540,
        marker: accent,
      })}
      <Txt text={body} fill={"#4a4038"} fontFamily={SERIF} fontSize={16} y={80} width={520} textWrap textAlign={"center"} />
    </Layout>,
  );
  const t = timing();
  yield* pause(t.startDelay);
  yield* all(clip().opacity(1, t.revealDuration, easeOutCubic), clip().scale(1, t.revealDuration, easeOutBack));
  yield* pause(t.connectDelay);
  yield* paintBlend(mark, highlight, 26, t.lineDuration);
  yield* waitFor(1.3);
}

/** Clipping tears open left-to-right: a cover sheet peels away. */
function* tornReveal(view: any) {
  const masthead = str("masthead", "THE EVENING CLIP");
  const headline = str("headline", "Ripped from today's front page");
  const highlight = str("highlight", "Ripped from");
  const body = str("body", "A slow tear reveals the clipping — an uneven edge, not a hard wipe.");
  const accent = str("markerColor", HIGHLIGHTER);
  const paper = str("paperTint", "#f2e8d4");

  desk(view, "#101318");
  const mark = createRef<Rect>();
  yield view.add(<Rect width={720} height={420} fill={paper} />);
  yield view.add(
    <Txt text={masthead} fill={"#8b1e1e"} fontFamily={SERIF} fontSize={14} letterSpacing={5} y={-160} />,
  );
  yield view.add(
    paperHeadline(headline, highlight, mark, {
      y: -50,
      size: 30,
      width: 620,
      marker: accent,
    }),
  );
  yield view.add(
    <Txt text={body} fill={"#4a4038"} fontFamily={SERIF} fontSize={17} y={80} width={600} textWrap textAlign={"center"} />,
  );
  const cover = createRef<Rect>();
  const tear = createRef<Rect>();
  yield view.add(<Rect ref={cover} width={720} height={420} fill={"#2a3038"} x={0} />);
  yield view.add(<Rect ref={tear} width={18} height={420} fill={"#f2e8d4"} x={-351} />);
  const t = timing();
  yield* pause(t.startDelay);
  yield* all(
    cover().width(0, t.lineDuration, easeOutCubic),
    cover().x(360, t.lineDuration, easeOutCubic),
    tear().x(360, t.lineDuration, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* paintBlend(mark, highlight, 30, t.lineDuration);
  yield* waitFor(1.2);
}

export function* runNewspaper(view: any, template: string) {
  switch (template) {
    case "news-slide-highlight":
      yield* slideHighlight(view);
      break;
    case "news-red-circle":
      yield* redCircle(view);
      break;
    case "news-draw-line":
      yield* drawLine(view);
      break;
    case "news-clip-zoom":
      yield* clipZoom(view);
      break;
    case "news-front-page":
      yield* frontPage(view);
      break;
    case "news-photo-caption":
      yield* photoCaption(view);
      break;
    case "news-headline-stack":
      yield* headlineStack(view);
      break;
    case "news-magnifier":
      yield* magnifier(view);
      break;
    case "news-quote-box":
      yield* quoteBox(view);
      break;
    case "news-ultra-front":
      yield* ultraFront(view);
      break;
    case "news-ultra-fold":
      yield* ultraFold(view);
      break;
    case "news-ultra-push":
      yield* ultraPush(view);
      break;
    case "news-ultra-extra":
      yield* ultraExtra(view);
      break;
    case "news-ultra-stack":
      yield* ultraStack(view);
      break;
    case "news-ultra-letterpress":
      yield* letterpress(view);
      break;
    case "news-ultra-spread":
      yield* spread(view);
      break;
    case "news-ultra-circle":
      yield* ultraCircle(view);
      break;
    case "news-ultra-torn":
      yield* torn(view);
      break;
    case "news-ultra-torn-reveal":
      yield* tornReveal(view);
      break;
    default:
      yield* titleSlam(view, {
        eyebrow: "NEWSPAPER",
        title: str("title", "BestMotions"),
        subtitle: str("subtitle", ""),
        accent: str("accent", "#e63946"),
        bg: DESK,
      });
  }
}
