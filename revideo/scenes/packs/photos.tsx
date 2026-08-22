/** @jsxImportSource @revideo/2d/lib */
import { Circle, Img, Layout, Rect, Txt } from "@revideo/2d";
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  str,
  waitFor,
} from "../../lib/helpers";
import { blendPhrase, paintBlend } from "../../lib/highlight";
import { itemDelays, pause, timing } from "../../lib/timing";

const DEFAULT_FONT = "Libre Baskerville, Georgia, serif";
const INK = "#171310";
const PAPER = "#f2e8d4";

function font() {
  return str("fontFamily", DEFAULT_FONT);
}

function photo(src: string, w: number, h: number, fill = "#1a2433") {
  return src ? (
    <Img src={src} width={w} height={h} />
  ) : (
    <Rect width={w} height={h} fill={fill} />
  );
}

function* kenBurns(view: any) {
  const src = str("imageUrl", "");
  const caption = str("caption", "A moment that shaped the decade");
  const highlight = str("highlight", "decade");
  const accent = str("accent", "#d8a11a");
  const marker = str("markerColor", "#FAFF00");
  const bg = str("bg", "#07080c");
  const typeface = font();
  const t = timing();
  view.fill(bg);

  const frame = createRef<Layout>();
  const cap = createRef<Layout>();
  const mark = createRef<Rect>();
  yield view.add(
    <Layout ref={frame} y={-40} scale={1.14} opacity={0}>
      {photo(src, 920, 460, "#1a2433")}
      <Rect width={920} height={460} fill={null} stroke={accent} lineWidth={2} />
    </Layout>,
  );
  yield view.add(
    <Layout ref={cap} y={280} opacity={0}>
      {blendPhrase(caption, highlight, mark, {
        font: typeface,
        size: 22,
        fill: "#ffffff",
        marker,
        width: 980,
        align: "center",
      })}
    </Layout>,
  );

  yield* pause(t.startDelay);
  yield* frame().opacity(1, t.revealDuration, easeOutCubic);
  yield* frame().scale(1, Math.max(t.lineDuration * 2.2, 1.6), easeOutCubic);
  yield* pause(t.stepDelay);
  yield* cap().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* paintBlend(mark, highlight, 22, t.lineDuration);
  yield* waitFor(1.1);
}

function* personCard(view: any) {
  const src = str("imageUrl", "");
  const name = str("name", "Alex Morgan");
  const role = str("role", "Policy Analyst");
  const quote = str("quote", "The numbers tell a different story");
  const highlight = str("highlight", "different story");
  const accent = str("accent", "#d8a11a");
  const marker = str("markerColor", "#FAFF00");
  const bg = str("bg", "#07080c");
  const typeface = font();
  const t = timing();
  view.fill(bg);

  const extra = itemDelays(4);
  const portrait = createRef<Layout>();
  const nameRef = createRef<Txt>();
  const roleRef = createRef<Txt>();
  const quoteRef = createRef<Layout>();
  const rule = createRef<Rect>();
  const mark = createRef<Rect>();
  yield view.add(
    <Layout ref={portrait} y={-90} scale={0}>
      <Rect width={280} height={340} clip>
        {photo(src, 280, 340)}
      </Rect>
      <Rect width={8} height={340} fill={accent} x={-144} />
    </Layout>,
  );
  yield view.add(
    <Txt
      ref={nameRef}
      text={name}
      fill={"#ffffff"}
      fontFamily={typeface}
      fontSize={32}
      fontWeight={700}
      y={140}
      opacity={0}
    />,
  );
  yield view.add(
    <Txt ref={roleRef} text={role} fill={accent} fontFamily={typeface} fontSize={16} y={178} opacity={0} />,
  );
  yield view.add(<Rect ref={rule} width={0} height={4} fill={accent} y={210} />);
  yield view.add(
    <Layout ref={quoteRef} y={250} opacity={0}>
      {blendPhrase(`“${quote}”`, highlight, mark, {
        font: typeface,
        size: 20,
        fill: "#c5d4de",
        marker,
        width: 900,
        align: "center",
      })}
    </Layout>,
  );

  yield* pause(t.startDelay);
  yield* pause(extra[0]);
  yield* portrait().scale(1, t.revealDuration, easeOutBack);
  yield* pause(t.stepDelay);
  yield* pause(extra[1]);
  yield* nameRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* roleRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* rule().width(220, t.lineDuration, easeOutCubic);
  yield* pause(extra[2]);
  yield* quoteRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(extra[3]);
  yield* paintBlend(mark, highlight, 20, t.lineDuration);
  yield* waitFor(1.2);
}

function* beforeAfter(view: any) {
  const beforeSrc = str("beforeImage", "");
  const afterSrc = str("afterImage", "");
  const beforeLabel = str("beforeLabel", "Before");
  const afterLabel = str("afterLabel", "After");
  const accent = str("accent", "#d8a11a");
  const bg = str("bg", "#07080c");
  const typeface = font();
  const t = timing();
  view.fill(bg);

  const w = 960;
  const h = 480;
  const wrap = createRef<Layout>();
  const cover = createRef<Layout>();
  const divider = createRef<Rect>();
  const beforeTxt = createRef<Txt>();
  const afterTxt = createRef<Txt>();
  yield view.add(
    <Layout ref={wrap} y={-10}>
      {photo(afterSrc, w, h, "#1a2433")}
      <Layout ref={cover} width={w} height={h} clip>
        {photo(beforeSrc, w, h, "#2a1810")}
      </Layout>
      <Rect ref={divider} width={4} height={h} fill={accent} x={w / 2} />
    </Layout>,
  );
  yield view.add(
    <Txt
      ref={beforeTxt}
      text={beforeLabel}
      fill={"#ffffff"}
      fontFamily={typeface}
      fontSize={18}
      y={-300}
      opacity={0}
    />,
  );
  yield view.add(
    <Txt
      ref={afterTxt}
      text={afterLabel}
      fill={accent}
      fontFamily={typeface}
      fontSize={18}
      y={300}
      opacity={0}
    />,
  );

  yield* pause(t.startDelay);
  yield* beforeTxt().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* all(
    cover().width(0, t.lineDuration, easeOutCubic),
    cover().x(-w / 2, t.lineDuration, easeOutCubic),
    divider().x(0, t.lineDuration, easeOutCubic),
  );
  yield* pause(t.stepDelay);
  yield* afterTxt().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.2);
}

/** Newspaper slides from the left; customizable portrait from the right; blend-highlight keeps type readable. */
function* newsMeet(view: any) {
  const src = str("imageUrl", "");
  const name = str("name", "Alex Morgan");
  const role = str("role", "Witness");
  const masthead = str("masthead", "THE DAILY RECORD");
  const date = str("date", "Monday, August 18, 2026");
  const headline = str("headline", "A defining moment for the nation");
  const body = str(
    "body",
    "Leaders gathered as the story broke. What followed would rewrite the official account.",
  );
  const highlight = str("highlight", "defining moment");
  const accent = str("accent", "#c1121f");
  const marker = str("markerColor", "#FAFF00");
  const ink = str("ink", INK);
  const bg = str("bg", "#0a0c12");
  const typeface = font();
  const t = timing();
  const extra = itemDelays(3);
  view.fill(bg);

  const paper = createRef<Rect>();
  const portrait = createRef<Layout>();
  const mark = createRef<Rect>();

  yield view.add(
    <Rect
      ref={paper}
      width={620}
      height={500}
      fill={PAPER}
      radius={3}
      shadowColor={"#00000099"}
      shadowBlur={40}
      shadowOffsetY={18}
      x={-980}
      y={8}
      rotation={-3}
      layout
      direction={"column"}
      gap={14}
      padding={36}
      alignItems={"start"}
    >
      <Txt
        text={masthead}
        fill={accent}
        fontFamily={typeface}
        fontSize={16}
        letterSpacing={5}
        fontWeight={700}
      />
      <Txt text={date} fill={"#6a5f52"} fontFamily={typeface} fontSize={13} />
      <Rect width={548} height={2} fill={"#c9b89a"} />
      {blendPhrase(headline, highlight, mark, {
        font: typeface,
        size: 28,
        fill: ink,
        marker,
        weight: 700,
        width: 548,
      })}
      <Txt text={body} fill={"#3d342c"} fontFamily={typeface} fontSize={16} width={548} textWrap />
    </Rect>,
  );

  yield view.add(
    <Layout ref={portrait} x={980} y={24} rotation={5}>
      <Rect
        width={288}
        height={388}
        fill={"#f4efe6"}
        padding={14}
        layout
        direction={"column"}
        gap={10}
        shadowColor={"#000000aa"}
        shadowBlur={32}
        shadowOffsetY={16}
      >
        <Rect width={260} height={300} clip>
          {photo(src, 260, 300, "#2a2420")}
        </Rect>
        <Txt text={name} fill={INK} fontFamily={typeface} fontSize={18} fontWeight={700} />
        <Txt text={role.toUpperCase()} fill={accent} fontFamily={typeface} fontSize={12} letterSpacing={2} />
      </Rect>
    </Layout>,
  );

  yield* pause(t.startDelay);
  yield* pause(extra[0]);
  yield* paper().x(-90, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* pause(extra[1]);
  yield* all(
    portrait().x(310, t.revealDuration, easeOutCubic),
    portrait().rotation(3, t.revealDuration, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* pause(extra[2]);
  yield* paintBlend(mark, highlight, 28, t.lineDuration);
  yield* waitFor(1.4);
}

/** Polaroid drops from above, settles, then a blended caption highlight. */
function* polaroidDrop(view: any) {
  const src = str("imageUrl", "");
  const caption = str("caption", "The night everything changed");
  const highlight = str("highlight", "everything changed");
  const name = str("name", "Field note");
  const accent = str("accent", "#e63946");
  const marker = str("markerColor", "#FAFF00");
  const bg = str("bg", "#090b10");
  const typeface = font();
  const t = timing();
  view.fill(bg);

  const card = createRef<Rect>();
  const cap = createRef<Layout>();
  const mark = createRef<Rect>();
  yield view.add(
    <Rect
      ref={card}
      width={420}
      height={500}
      fill={"#f7f1e4"}
      y={-640}
      rotation={12}
      shadowColor={"#000000aa"}
      shadowBlur={36}
      shadowOffsetY={20}
      layout
      direction={"column"}
      padding={22}
      gap={16}
      alignItems={"center"}
    >
      <Rect width={376} height={360} clip>
        {photo(src, 376, 360, "#2a2420")}
      </Rect>
      <Txt text={name} fill={accent} fontFamily={typeface} fontSize={13} letterSpacing={3} />
    </Rect>,
  );
  yield view.add(
    <Layout ref={cap} y={300} opacity={0}>
      {blendPhrase(caption, highlight, mark, {
        font: typeface,
        size: 24,
        fill: "#f4efe6",
        marker,
        width: 900,
        align: "center",
      })}
    </Layout>,
  );

  yield* pause(t.startDelay);
  yield* all(
    card().y(-36, t.revealDuration, easeOutBack),
    card().rotation(-4, t.revealDuration, easeOutCubic),
  );
  yield* pause(t.stepDelay);
  yield* cap().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* paintBlend(mark, highlight, 24, t.lineDuration);
  yield* waitFor(1.2);
}

/** Two photos slam in from opposite sides; center caption gets a blend highlight. */
function* splitMeet(view: any) {
  const leftSrc = str("leftImage", "");
  const rightSrc = str("rightImage", str("imageUrl", ""));
  const leftLabel = str("leftLabel", "Then");
  const rightLabel = str("rightLabel", "Now");
  const caption = str("caption", "The same room. Two different stories.");
  const highlight = str("highlight", "different stories");
  const accent = str("accent", "#d8a11a");
  const marker = str("markerColor", "#FAFF00");
  const bg = str("bg", "#07080c");
  const typeface = font();
  const t = timing();
  view.fill(bg);

  const left = createRef<Layout>();
  const right = createRef<Layout>();
  const bar = createRef<Rect>();
  const cap = createRef<Layout>();
  const mark = createRef<Rect>();

  yield view.add(
    <Layout ref={left} x={-860} y={-20}>
      <Rect width={470} height={520} clip>
        {photo(leftSrc, 470, 520, "#1c1814")}
      </Rect>
      <Txt
        text={leftLabel}
        fill={"#ffffff"}
        fontFamily={typeface}
        fontSize={18}
        y={280}
      />
    </Layout>,
  );
  yield view.add(
    <Layout ref={right} x={860} y={-20}>
      <Rect width={470} height={520} clip>
        {photo(rightSrc, 470, 520, "#141820")}
      </Rect>
      <Txt
        text={rightLabel}
        fill={"#ffffff"}
        fontFamily={typeface}
        fontSize={18}
        y={280}
      />
    </Layout>,
  );
  yield view.add(<Rect ref={bar} width={8} height={0} fill={accent} y={-20} />);
  yield view.add(
    <Layout ref={cap} y={310} opacity={0}>
      {blendPhrase(caption, highlight, mark, {
        font: typeface,
        size: 22,
        fill: "#f4efe6",
        marker,
        width: 980,
        align: "center",
      })}
    </Layout>,
  );

  yield* pause(t.startDelay);
  yield* all(
    left().x(-250, t.revealDuration, easeOutCubic),
    right().x(250, t.revealDuration, easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* bar().height(360, t.lineDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* cap().opacity(1, t.revealDuration, easeOutCubic);
  yield* paintBlend(mark, highlight, 22, t.lineDuration);
  yield* waitFor(1.2);
}

/** Full-bleed image slides from the right; caption plate rises with a blend highlight. */
function* overlayCaption(view: any) {
  const src = str("imageUrl", "");
  const kicker = str("kicker", "ON THE GROUND");
  const caption = str("caption", "Crowds filled the avenue as night fell");
  const highlight = str("highlight", "night fell");
  const accent = str("accent", "#e63946");
  const marker = str("markerColor", "#FAFF00");
  const bg = str("bg", "#05070b");
  const typeface = font();
  const t = timing();
  view.fill(bg);

  const plateRef = createRef<Layout>();
  const bar = createRef<Layout>();
  const mark = createRef<Rect>();
  yield view.add(
    <Layout ref={plateRef} x={1280} scale={1.08}>
      {photo(src, 1200, 640, "#1c1814")}
    </Layout>,
  );
  yield view.add(
    <Layout ref={bar} y={420} x={-40} layout direction={"column"} gap={10} alignItems={"start"} width={820}>
      <Rect width={10} height={86} fill={accent} x={-420} />
      <Txt
        text={kicker}
        fill={accent}
        fontFamily={typeface}
        fontSize={14}
        letterSpacing={6}
        fontWeight={700}
      />
      {blendPhrase(caption, highlight, mark, {
        font: typeface,
        size: 28,
        fill: "#ffffff",
        marker,
        weight: 700,
        width: 780,
        align: "start",
      })}
    </Layout>,
  );

  yield* pause(t.startDelay);
  yield* all(
    plateRef().x(0, t.revealDuration, easeOutCubic),
    plateRef().scale(1, t.lineDuration * 2.4, easeOutCubic),
  );
  yield* pause(t.stepDelay);
  yield* bar().y(230, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* paintBlend(mark, highlight, 28, t.lineDuration);
  yield* waitFor(1.2);
}

/** News clipping from the left, portrait from the right, pin drop, then blend highlight. */
function* pinBoard(view: any) {
  const src = str("imageUrl", "");
  const name = str("name", "Unknown Subject");
  const headline = str("headline", "The meeting nobody recorded");
  const highlight = str("highlight", "nobody recorded");
  const detail = str("detail", "Filed, stamped, and forgotten — until tonight.");
  const accent = str("accent", "#e63946");
  const marker = str("markerColor", "#FAFF00");
  const bg = str("bg", "#0c1016");
  const typeface = font();
  const t = timing();
  const extra = itemDelays(3);
  view.fill(bg);

  const clip = createRef<Rect>();
  const portrait = createRef<Layout>();
  const pin = createRef<Circle>();
  const string = createRef<Rect>();
  const mark = createRef<Rect>();

  yield view.add(
    <Rect
      ref={clip}
      width={540}
      height={360}
      fill={PAPER}
      x={-980}
      y={-30}
      rotation={-6}
      shadowBlur={28}
      shadowColor={"#00000088"}
      layout
      direction={"column"}
      gap={12}
      padding={32}
      alignItems={"start"}
    >
      <Txt
        text={"ARCHIVE CLIPPING"}
        fill={accent}
        fontFamily={typeface}
        fontSize={12}
        letterSpacing={4}
        fontWeight={700}
      />
      {blendPhrase(headline, highlight, mark, {
        font: typeface,
        size: 26,
        fill: INK,
        marker,
        weight: 700,
        width: 476,
      })}
      <Txt text={detail} fill={"#4a4038"} fontFamily={typeface} fontSize={16} width={476} textWrap />
    </Rect>,
  );

  yield view.add(
    <Layout ref={portrait} x={980} y={40} rotation={8}>
      <Rect width={260} height={320} clip shadowBlur={24} shadowColor={"#00000088"}>
        {photo(src, 260, 320, "#242018")}
      </Rect>
      <Txt
        text={name}
        fill={"#f4efe6"}
        fontFamily={typeface}
        fontSize={16}
        fontWeight={700}
        y={186}
      />
    </Layout>,
  );

  yield view.add(<Rect ref={string} width={0} height={3} fill={accent} y={-80} rotation={-12} />);
  yield view.add(<Circle ref={pin} size={22} fill={accent} y={-280} x={20} />);

  yield* pause(t.startDelay);
  yield* pause(extra[0]);
  yield* clip().x(-220, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* pause(extra[1]);
  yield* all(portrait().x(300, t.revealDuration, easeOutCubic), portrait().rotation(4, t.revealDuration, easeOutCubic));
  yield* pause(t.connectDelay);
  yield* pin().y(-90, t.revealDuration, easeOutBack);
  yield* string().width(280, t.lineDuration, easeOutCubic);
  yield* pause(extra[2]);
  yield* paintBlend(mark, highlight, 26, t.lineDuration);
  yield* waitFor(1.3);
}

export function* runPhotos(view: any, template: string) {
  switch (template) {
    case "photo-kenburns":
      yield* kenBurns(view);
      break;
    case "person-card":
      yield* personCard(view);
      break;
    case "before-after":
      yield* beforeAfter(view);
      break;
    case "photo-news-meet":
      yield* newsMeet(view);
      break;
    case "photo-polaroid":
      yield* polaroidDrop(view);
      break;
    case "photo-split":
      yield* splitMeet(view);
      break;
    case "photo-overlay":
      yield* overlayCaption(view);
      break;
    case "photo-pin":
      yield* pinBoard(view);
      break;
    default:
      yield* kenBurns(view);
  }
}
