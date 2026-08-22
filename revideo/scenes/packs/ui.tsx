/** @jsxImportSource @revideo/2d/lib */
import { Circle, Layout, Rect, Txt } from "@revideo/2d";
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  str,
  waitFor,
} from "../../lib/helpers";
import { blendPhrase, paintBlend, HIGHLIGHTER } from "../../lib/highlight";
import { itemDelays, pause, timing } from "../../lib/timing";

const SERIF = "Libre Baskerville, Georgia, serif";

function* bullets(view: any) {
  const title = str("title", "Three key takeaways");
  const items = [str("item1", "Budgets rose faster than wages"), str("item2", "Regional gaps widened"), str("item3", "Public trust fell sharply")];
  const highlight = str("highlight", "trust");
  const accent = str("accent", "#d8a11a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);

  const titleRef = createRef<Txt>();
  const marks = items.map(() => createRef<Rect>());
  yield view.add(
    <Txt ref={titleRef} text={title} fill={"#ffffff"} fontFamily={SERIF} fontSize={28} fontWeight={700} y={-220} opacity={0} />,
  );
  yield* pause(t.startDelay);
  const extra = itemDelays(items.length);
  yield* titleRef().opacity(1, t.revealDuration, easeOutCubic);

  for (let i = 0; i < items.length; i++) {
    yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const y = -80 + i * 90;
    const row = createRef<Layout>();
    const tick = createRef<Rect>();
    yield view.add(
      <Layout ref={row} y={y} opacity={0}>
        <Circle size={16} fill={accent} x={-280} />
        <Layout x={40} width={640} layout>
          {blendPhrase(items[i], highlight, marks[i], {
            font: SERIF,
            size: 26,
            fill: "#e8f0ea",
            marker: HIGHLIGHTER,
            width: 640,
          })}
        </Layout>
      </Layout>,
    );
    yield view.add(<Rect ref={tick} width={4} height={0} fill={accent} x={-280} y={y + 14} />);
    yield* row().opacity(1, t.revealDuration, easeOutCubic);
    if (highlight && items[i].toLowerCase().includes(highlight.toLowerCase())) {
      yield* paintBlend(marks[i], highlight, 26, t.lineDuration * 0.7);
    }
    if (i < items.length - 1) {
      yield* pause(t.connectDelay);
      yield* all(tick().height(50, t.lineDuration * 0.6, easeOutCubic), tick().y(y + 39, t.lineDuration * 0.6, easeOutCubic));
    }
  }
  yield* waitFor(1.2);
}

function* lowerThird(view: any) {
  const title = str("title", "Breaking context");
  const subtitle = str("subtitle", "What the headlines missed");
  const accent = str("accent", "#d8a11a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);

  const bar = createRef<Rect>();
  const card = createRef<Layout>();
  yield view.add(<Rect width={1280} height={720} fill={"#101820"} />);
  yield view.add(
    <Layout ref={card} y={220} opacity={0}>
      <Rect ref={bar} width={0} height={8} fill={accent} y={-48} />
      <Rect width={720} height={110} fill={"#0e1218"} />
      <Txt text={title} fill={"#ffffff"} fontFamily={SERIF} fontSize={28} fontWeight={700} y={-16} />
      <Txt text={subtitle} fill={accent} fontFamily={SERIF} fontSize={16} y={22} />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* card().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* bar().width(280, t.lineDuration, easeOutCubic);
  yield* waitFor(1.4);
}

function* logoPop(view: any) {
  const brand = str("brand", "BestMotions");
  const tagline = str("tagline", "Motion that explains");
  const accent = str("accent", "#d8a11a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);

  const mark = createRef<Rect>();
  const name = createRef<Txt>();
  const tag = createRef<Txt>();
  const rule = createRef<Rect>();
  yield view.add(<Rect ref={mark} width={72} height={72} fill={accent} y={-80} scale={0} />);
  yield view.add(
    <Txt ref={name} text={brand} fill={"#ffffff"} fontFamily={SERIF} fontSize={44} fontWeight={700} y={20} opacity={0} />,
  );
  yield view.add(<Rect ref={rule} width={0} height={4} fill={accent} y={70} />);
  yield view.add(
    <Txt ref={tag} text={tagline} fill={"#c5d4de"} fontFamily={SERIF} fontSize={18} y={110} opacity={0} />,
  );

  yield* pause(t.startDelay);
  yield* mark().scale(1, t.revealDuration, easeOutBack);
  yield* pause(t.stepDelay);
  yield* name().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* rule().width(240, t.lineDuration, easeOutCubic);
  yield* tag().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.3);
}

function* ctaButton(view: any) {
  const text = str("text", "Subscribe for more explainers");
  const highlight = str("highlight", "Subscribe");
  const accent = str("accent", "#d8a11a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);

  const btn = createRef<Layout>();
  const mark = createRef<Rect>();
  yield view.add(
    <Layout ref={btn} scale={0.7} opacity={0}>
      <Rect width={520} height={78} fill={accent} radius={8} />
      {blendPhrase(text, highlight, mark, {
        font: SERIF,
        size: 22,
        fill: "#101318",
        marker: HIGHLIGHTER,
        weight: 700,
        align: "center",
      })}
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* all(btn().opacity(1, t.revealDuration, easeOutCubic), btn().scale(1, t.revealDuration, easeOutBack));
  yield* pause(t.connectDelay);
  yield* paintBlend(mark, highlight, 22, t.lineDuration);
  yield* waitFor(1.4);
}

function* newsTicker(view: any) {
  const badge = str("badge", "LIVE");
  const line = str("line", "Markets react as new climate rules take effect worldwide");
  const highlight = str("highlight", "climate rules");
  const accent = str("accent", "#ff5a4a");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);

  yield view.add(<Rect width={1280} height={720} fill={"#121820"} />);
  const strip = createRef<Layout>();
  const mark = createRef<Rect>();
  yield view.add(
    <Layout ref={strip} y={280} x={-1400}>
      <Rect width={1280} height={64} fill={accent} />
      <Rect width={90} height={40} fill={"#fff"} x={-520} />
      <Txt text={badge} fill={accent} fontFamily={SERIF} fontSize={16} fontWeight={700} x={-520} />
      <Layout x={40} layout>
        {blendPhrase(line, highlight, mark, {
          font: SERIF,
          size: 22,
          fill: "#101318",
          marker: HIGHLIGHTER,
          weight: 700,
        })}
      </Layout>
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* strip().x(0, t.lineDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* paintBlend(mark, highlight, 22, t.lineDuration);
  yield* waitFor(1.2);
}

export function* runUi(view: any, template: string) {
  switch (template) {
    case "bullet-reveal":
      yield* bullets(view);
      break;
    case "lower-third":
      yield* lowerThird(view);
      break;
    case "logo-pop":
      yield* logoPop(view);
      break;
    case "cta-button":
      yield* ctaButton(view);
      break;
    case "news-ticker":
      yield* newsTicker(view);
      break;
    default:
      yield* logoPop(view);
  }
}
