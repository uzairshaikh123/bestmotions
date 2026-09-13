/** @jsxImportSource @revideo/2d/lib */
/**
 * Social media UI plates — X (Twitter), Instagram, YouTube chrome + viral beats.
 */
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

function lines(raw: string, fallback: string, max = 6): string[] {
  return (raw || fallback)
    .split(/\n|;/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);
}

/** X (Twitter) post card with verified mark + engagement row. */
function* xPost(view: any) {
  const handle = str("handle", "@witness");
  const name = str("name", "On the ground");
  const body = str("body", "Nobody is talking about what happened after midnight.");
  const time = str("time", "2h");
  const replies = str("replies", "1,204");
  const reposts = str("reposts", "6,842");
  const likes = str("likes", "24.1K");
  const views = str("views", "1.8M");
  const accent = str("accent", "#e7e9ea");
  const bg = str("bg", "#000000");
  const t = timing();
  view.fill(bg);
  const card = createRef<Layout>();
  yield view.add(
    <Layout ref={card} y={50} opacity={0} scale={0.94}>
      <Rect width={760} height={380} fill={"#000000"} radius={24} stroke={"#2f3336"} lineWidth={2} />
      {/* X mark */}
      <Txt text={"𝕏"} fill={"#e7e9ea"} fontFamily={SANS} fontSize={28} fontWeight={700} x={320} y={-150} />
      <Circle size={56} fill={"#536471"} x={-300} y={-130} />
      <Txt text={name} fill={"#e7e9ea"} fontFamily={SANS} fontSize={22} fontWeight={700} x={-150} y={-148} />
      <Txt text={"✓"} fill={"#1d9bf0"} fontFamily={SANS} fontSize={16} x={-20} y={-148} />
      <Txt text={`${handle} · ${time}`} fill={"#71767b"} fontFamily={SANS} fontSize={16} x={-110} y={-118} />
      <Txt text={body} fill={"#e7e9ea"} fontFamily={SANS} fontSize={26} width={640} textWrap y={10} />
      <Layout y={130}>
        <Txt text={`💬  ${replies}`} fill={"#71767b"} fontFamily={SANS} fontSize={15} x={-240} />
        <Txt text={`🔁  ${reposts}`} fill={"#71767b"} fontFamily={SANS} fontSize={15} x={-60} />
        <Txt text={`❤  ${likes}`} fill={"#71767b"} fontFamily={SANS} fontSize={15} x={120} />
        <Txt text={`👁  ${views}`} fill={"#71767b"} fontFamily={SANS} fontSize={15} x={280} />
      </Layout>
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* all(
    card().opacity(1, t.revealDuration, easeOutCubic),
    card().y(0, t.revealDuration, easeOutBack),
    card().scale(1, t.revealDuration, easeOutBack),
  );
  yield* waitFor(1.5);
}

/** X thread — stacked posts connecting down. */
function* xThread(view: any) {
  const handle = str("handle", "@investigator");
  const posts = lines(
    str("posts", "1/ The tip arrived at 9:14.\n2/ Cameras near the dock went dark.\n3/ By morning the story had flipped."),
    "1/ First post",
    3,
  );
  const accent = str("accent", "#1d9bf0");
  const bg = str("bg", "#000000");
  const t = timing();
  const extra = itemDelays(posts.length);
  view.fill(bg);
  yield view.add(
    <Txt text={"Thread"} fill={accent} fontFamily={SANS} fontSize={16} letterSpacing={4} y={-300} />,
  );
  const rail = createRef<Rect>();
  yield view.add(<Rect ref={rail} width={3} height={0} fill={"#2f3336"} x={-340} y={-40} />);
  yield* pause(t.startDelay);
  yield* rail().height(420, t.lineDuration, easeOutCubic);
  for (let i = 0; i < posts.length; i++) {
    yield* pause(extra[i]);
    if (i > 0) yield* pause(t.stepDelay);
    const y = -160 + i * 140;
    const card = createRef<Layout>();
    yield view.add(<Circle size={18} fill={accent} x={-340} y={y} />);
    yield view.add(
      <Layout ref={card} x={40} y={y + 24} opacity={0}>
        <Rect width={720} height={110} fill={"#000"} radius={18} stroke={"#2f3336"} lineWidth={1.5} />
        <Txt text={handle} fill={"#71767b"} fontFamily={SANS} fontSize={14} x={-250} y={-28} />
        <Txt text={posts[i]} fill={"#e7e9ea"} fontFamily={SANS} fontSize={20} width={640} textWrap y={12} />
      </Layout>,
    );
    yield* all(
      card().opacity(1, t.revealDuration, easeOutCubic),
      card().y(y, t.revealDuration, easeOutBack),
    );
  }
  yield* waitFor(1.2);
}

/** Instagram post — phone chrome, actions, caption. */
function* instagramPost(view: any) {
  const handle = str("handle", "fieldnotes");
  const caption = str("caption", "The photo that changed the timeline.");
  const likes = str("likes", "184,902 likes");
  const location = str("location", "Downtown");
  const accent = str("accent", "#e1306c");
  const bg = str("bg", "#000000");
  const t = timing();
  view.fill(bg);
  const phone = createRef<Layout>();
  const heart = createRef<Txt>();
  yield view.add(
    <Layout ref={phone} opacity={0} scale={0.9}>
      <Rect width={400} height={640} fill={"#000"} radius={28} stroke={"#262626"} lineWidth={2} />
      {/* Header */}
      <Circle size={34} fill={accent} x={-150} y={-270} />
      <Circle size={42} fill={null} stroke={accent} lineWidth={2} x={-150} y={-270} />
      <Txt text={handle} fill={"#fff"} fontFamily={SANS} fontSize={15} fontWeight={700} x={-70} y={-282} />
      <Txt text={location} fill={"#a8a8a8"} fontFamily={SANS} fontSize={12} x={-70} y={-258} />
      <Txt text={"•••"} fill={"#fff"} fontFamily={SANS} fontSize={18} x={150} y={-270} />
      {/* Media */}
      <Rect width={360} height={320} fill={"#1a1a1a"} y={-50} radius={4} />
      <Rect width={360} height={320} fill={"#2a1520"} y={-50} opacity={0.55} radius={4} />
      {/* Actions */}
      <Txt ref={heart} text={"♡"} fill={"#fff"} fontFamily={SANS} fontSize={28} x={-150} y={140} />
      <Txt text={"💬"} fill={"#fff"} fontFamily={SANS} fontSize={22} x={-95} y={140} />
      <Txt text={"➣"} fill={"#fff"} fontFamily={SANS} fontSize={22} x={-40} y={140} />
      <Txt text={"🔖"} fill={"#fff"} fontFamily={SANS} fontSize={20} x={150} y={140} />
      <Txt text={likes} fill={"#fff"} fontFamily={SANS} fontSize={14} fontWeight={700} y={185} x={-95} />
      <Txt
        text={`${handle}  ${caption}`}
        fill={"#fff"}
        fontFamily={SANS}
        fontSize={14}
        width={340}
        textWrap
        y={230}
      />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* all(
    phone().opacity(1, t.revealDuration, easeOutCubic),
    phone().scale(1, t.revealDuration, easeOutBack),
  );
  yield* pause(t.stepDelay);
  heart().text("❤");
  heart().fill(accent);
  yield* heart().scale(1.35, 0.18, easeOutBack);
  yield* heart().scale(1, 0.2, easeOutCubic);
  yield* waitFor(1.2);
}

/** Instagram story ring + vertical frame. */
function* instagramStory(view: any) {
  const handle = str("handle", "fieldnotes");
  const title = str("title", "The clip everyone shared");
  const accent = str("accent", "#e1306c");
  const bg = str("bg", "#0a0608");
  const t = timing();
  view.fill(bg);
  const frame = createRef<Layout>();
  const ring = createRef<Circle>();
  yield view.add(
    <Layout ref={frame} opacity={0} scale={0.92}>
      <Rect width={360} height={640} fill={"#111"} radius={24} />
      <Rect width={360} height={640} fill={"#1c1014"} opacity={0.7} radius={24} />
      <Circle ref={ring} size={48} fill={null} stroke={accent} lineWidth={3} x={-130} y={-270} />
      <Circle size={36} fill={accent} x={-130} y={-270} />
      <Txt text={handle} fill={"#fff"} fontFamily={SANS} fontSize={15} fontWeight={700} x={-40} y={-278} />
      <Txt text={"2h"} fill={"#ddd"} fontFamily={SANS} fontSize={12} x={-40} y={-255} />
      <Rect width={120} height={4} fill={"#fff"} radius={4} y={-300} x={-80} opacity={0.9} />
      <Rect width={120} height={4} fill={"#ffffff55"} radius={4} y={-300} x={50} />
      <Txt text={title} fill={"#fff"} fontFamily={SERIF} fontSize={32} fontWeight={700} width={300} textAlign={"center"} textWrap y={40} />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* all(
    frame().opacity(1, t.revealDuration, easeOutCubic),
    frame().scale(1, t.revealDuration, easeOutBack),
  );
  yield* ring().size(56, t.revealDuration, easeOutBack);
  yield* waitFor(1.3);
}

/** YouTube player chrome — progress, controls, meta. */
function* youtubePlayer(view: any) {
  const title = str("title", "What really happened that night");
  const channel = str("channel", "Deep Cut Docs");
  const views = str("views", "2.4M views");
  const time = str("time", "0:42");
  const duration = str("duration", "12:08");
  const accent = str("accent", "#ff0000");
  const bg = str("bg", "#0f0f0f");
  const t = timing();
  view.fill(bg);
  const player = createRef<Layout>();
  const progress = createRef<Rect>();
  const play = createRef<Circle>();
  yield view.add(
    <Layout ref={player} opacity={0} scale={0.96}>
      <Rect width={980} height={520} fill={"#1a1a1a"} radius={12} />
      <Rect width={980} height={520} fill={"#221018"} opacity={0.45} radius={12} />
      <Circle ref={play} size={84} fill={accent} opacity={0.95} />
      <Txt text={"▶"} fill={"#fff"} fontFamily={SANS} fontSize={34} x={4} />
      {/* Bottom chrome */}
      <Rect width={980} height={70} fill={"#000000aa"} y={225} radius={12} />
      <Rect width={920} height={4} fill={"#ffffff33"} y={200} radius={2} />
      <Rect ref={progress} width={0} height={4} fill={accent} y={200} x={-460} offset={[-1, 0]} radius={2} />
      <Txt text={`${time} / ${duration}`} fill={"#fff"} fontFamily={SANS} fontSize={14} x={-400} y={235} />
      <Txt text={"⚙  ⛶"} fill={"#fff"} fontFamily={SANS} fontSize={16} x={400} y={235} />
    </Layout>,
  );
  yield view.add(
    <Layout y={320}>
      <Txt text={title} fill={"#fff"} fontFamily={SANS} fontSize={26} fontWeight={700} width={900} textWrap />
      <Txt text={`${channel}  ·  ${views}`} fill={"#aaaaaa"} fontFamily={SANS} fontSize={15} y={40} />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* all(
    player().opacity(1, t.revealDuration, easeOutCubic),
    player().scale(1, t.revealDuration, easeOutBack),
  );
  yield* progress().width(320, t.lineDuration * 1.4, easeOutCubic);
  yield* play().opacity(0.35, t.revealDuration, easeOutCubic);
  yield* waitFor(1.2);
}

/** YouTube subscribe CTA. */
function* youtubeSubscribe(view: any) {
  const channel = str("channel", "Deep Cut Docs");
  const subs = str("subs", "1.28M subscribers");
  const accent = str("accent", "#ff0000");
  const bg = str("bg", "#0f0f0f");
  const t = timing();
  view.fill(bg);
  const row = createRef<Layout>();
  const btn = createRef<Layout>();
  yield view.add(
    <Layout ref={row} opacity={0} y={20}>
      <Circle size={72} fill={"#333"} x={-280} />
      <Txt text={channel} fill={"#fff"} fontFamily={SANS} fontSize={28} fontWeight={700} x={-80} y={-16} />
      <Txt text={subs} fill={"#aaaaaa"} fontFamily={SANS} fontSize={16} x={-80} y={22} />
      <Layout ref={btn} x={320} scale={0.8}>
        <Rect width={160} height={44} fill={accent} radius={22} />
        <Txt text={"Subscribe"} fill={"#fff"} fontFamily={SANS} fontSize={16} fontWeight={700} />
      </Layout>
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* row().opacity(1, t.revealDuration, easeOutCubic);
  yield* all(
    btn().scale(1, t.revealDuration, easeOutBack),
    btn().opacity(1, t.revealDuration, easeOutCubic),
  );
  yield* pause(t.stepDelay);
  // flip to Subscribed
  yield* all(
    // keep motion simple: pulse
    btn().scale(1.08, 0.15, easeOutCubic),
  );
  yield* btn().scale(1, 0.15, easeOutCubic);
  yield* waitFor(1.3);
}

/** Legacy alias names used by catalog. */
function* tweetReveal(view: any) {
  yield* xPost(view);
}

function* ytHighlight(view: any) {
  yield* youtubePlayer(view);
}

function* viralPost(view: any) {
  const badge = str("badge", "VIRAL");
  const title = str("title", "The post that broke the internet");
  const subtitle = str("subtitle", "Shared 1.2M times in 6 hours");
  const accent = str("accent", "#a855f7");
  const bg = str("bg", "#07060c");
  const t = timing();
  view.fill(bg);
  const stamp = createRef<Txt>();
  const card = createRef<Layout>();
  yield view.add(
    <Txt
      ref={stamp}
      text={badge}
      fill={accent}
      fontFamily={SERIF}
      fontSize={72}
      fontWeight={700}
      rotation={-10}
      scale={2.4}
      opacity={0}
      y={-40}
    />,
  );
  yield view.add(
    <Layout ref={card} y={160} opacity={0}>
      <Txt text={title} fill={"#f4efe6"} fontFamily={SERIF} fontSize={36} fontWeight={700} width={900} textAlign={"center"} textWrap />
      <Txt text={subtitle} fill={"#a1a1aa"} fontFamily={SANS} fontSize={18} y={70} />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* all(
    stamp().scale(1, t.revealDuration, easeOutBack),
    stamp().opacity(1, t.revealDuration * 0.6, easeOutCubic),
  );
  yield* pause(t.stepDelay);
  yield* card().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.3);
}

function* commentExplosion(view: any) {
  const title = str("title", "Comments");
  const comments = lines(
    str("comments", "This can't be real\nWait… rewind that\nI've been saying this for years\nReceipts???"),
    "This can't be real",
    5,
  );
  const accent = str("accent", "#22c55e");
  const bg = str("bg", "#05070b");
  const t = timing();
  const extra = itemDelays(comments.length);
  view.fill(bg);
  yield view.add(
    <Txt text={title} fill={accent} fontFamily={SANS} fontSize={18} letterSpacing={6} y={-260} />,
  );
  yield* pause(t.startDelay);
  for (let i = 0; i < comments.length; i++) {
    yield* pause(t.connectDelay);
    yield* pause(extra[i]);
    if (i > 0) yield* pause(t.stepDelay);
    const row = createRef<Layout>();
    const y = -160 + i * 90;
    yield view.add(
      <Layout ref={row} y={y + 40} x={-80} opacity={0}>
        <Rect width={820} height={72} fill={"#12161c"} radius={14} />
        <Circle size={28} fill={accent} x={-360} opacity={0.85} />
        <Txt text={comments[i]} fill={"#e8eef6"} fontFamily={SANS} fontSize={22} x={-40} width={680} />
      </Layout>,
    );
    yield* all(
      row().opacity(1, t.revealDuration, easeOutCubic),
      row().y(y, t.revealDuration, easeOutBack),
      row().x(0, t.revealDuration, easeOutCubic),
    );
  }
  yield* waitFor(1.2);
}

function* trending(view: any) {
  const rank = str("rank", "#1");
  const tag = str("tag", "Trending worldwide");
  const subtitle = str("subtitle", "124K posts in the last hour");
  const accent = str("accent", "#f59e0b");
  const bg = str("bg", "#07090e");
  const t = timing();
  view.fill(bg);
  const r = createRef<Txt>();
  const label = createRef<Txt>();
  yield view.add(
    <Txt ref={r} text={rank} fill={accent} fontFamily={SERIF} fontSize={120} fontWeight={700} y={-40} scale={0.6} opacity={0} />,
  );
  yield view.add(
    <Txt ref={label} text={tag} fill={"#fff"} fontFamily={SANS} fontSize={36} fontWeight={700} y={100} opacity={0} />,
  );
  yield view.add(
    <Txt text={subtitle} fill={"#a1a1aa"} fontFamily={SANS} fontSize={18} y={160} />,
  );
  yield* pause(t.startDelay);
  yield* all(
    r().opacity(1, t.revealDuration, easeOutCubic),
    r().scale(1, t.revealDuration, easeOutBack),
  );
  yield* pause(t.stepDelay);
  yield* label().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.4);
}

function* socialReaction(view: any) {
  const title = str("title", "People lost it");
  const reactions = lines(
    str("reactions", "Shocked\nAngry\nConfused\nObsessed"),
    "Shocked",
    6,
  );
  const accent = str("accent", "#fb7185");
  const bg = str("bg", "#0a0608");
  const t = timing();
  const extra = itemDelays(reactions.length);
  view.fill(bg);
  yield view.add(
    <Txt text={title} fill={"#fff"} fontFamily={SERIF} fontSize={42} fontWeight={700} y={-200} />,
  );
  const positions = [
    [-280, -40],
    [220, -60],
    [-200, 100],
    [260, 80],
    [20, 40],
    [-40, -120],
  ];
  yield* pause(t.startDelay);
  for (let i = 0; i < reactions.length; i++) {
    yield* pause(extra[i]);
    if (i > 0) yield* pause(t.stepDelay * 0.7);
    const chip = createRef<Layout>();
    const [x, y] = positions[i % positions.length];
    yield view.add(
      <Layout ref={chip} x={x} y={y} scale={0} opacity={0}>
        <Rect width={200} height={56} fill={"#1a1216"} radius={999} stroke={accent} lineWidth={2} />
        <Txt text={reactions[i]} fill={accent} fontFamily={SANS} fontSize={18} fontWeight={700} />
      </Layout>,
    );
    yield* all(
      chip().scale(1, t.revealDuration, easeOutBack),
      chip().opacity(1, t.revealDuration * 0.6, easeOutCubic),
    );
  }
  yield* waitFor(1.3);
}

function* internetReacts(view: any) {
  const stamp = str("stamp", "INTERNET REACTS");
  const quote = str("quote", "“This changes everything.”");
  const accent = str("accent", "#e63946");
  const bg = str("bg", "#05070b");
  const t = timing();
  view.fill(bg);
  const st = createRef<Txt>();
  yield view.add(
    <Txt
      ref={st}
      text={stamp}
      fill={accent}
      fontFamily={SERIF}
      fontSize={64}
      fontWeight={700}
      rotation={-8}
      scale={2.2}
      opacity={0}
    />,
  );
  yield view.add(
    <Txt text={quote} fill={"#e8eef6"} fontFamily={SERIF} fontSize={28} fontStyle={"italic"} y={150} width={900} textAlign={"center"} textWrap />,
  );
  yield* pause(t.startDelay);
  yield* all(
    st().scale(1, t.revealDuration, easeOutBack),
    st().opacity(1, t.revealDuration * 0.6, easeOutCubic),
  );
  yield* waitFor(1.4);
}

function* viralMoment(view: any) {
  const time = str("time", "0:42");
  const title = str("title", "The viral moment");
  const subtitle = str("subtitle", "Clipped. Shared. Everywhere.");
  const accent = str("accent", "#a855f7");
  const bg = str("bg", "#07060c");
  const t = timing();
  view.fill(bg);
  const badge = createRef<Layout>();
  const hook = createRef<Txt>();
  yield view.add(
    <Layout ref={badge} y={-120} opacity={0} scale={0.8}>
      <Rect width={140} height={48} fill={accent} radius={10} />
      <Txt text={time} fill={"#fff"} fontFamily={SANS} fontSize={22} fontWeight={700} />
    </Layout>,
  );
  yield view.add(
    <Txt ref={hook} text={title} fill={"#fff"} fontFamily={SERIF} fontSize={52} fontWeight={700} y={20} opacity={0} width={900} textAlign={"center"} textWrap />,
  );
  yield view.add(
    <Txt text={subtitle} fill={"#a1a1aa"} fontFamily={SANS} fontSize={18} y={120} />,
  );
  yield* pause(t.startDelay);
  yield* all(
    badge().opacity(1, t.revealDuration, easeOutCubic),
    badge().scale(1, t.revealDuration, easeOutBack),
  );
  yield* pause(t.stepDelay);
  yield* hook().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.3);
}

function* postTimeline(view: any) {
  const title = str("title", "How it spread");
  const posts = lines(
    str("posts", "9:14 PM | First post goes live\n9:41 PM | Screenshots circulate\n10:03 PM | Mainstream picks it up"),
    "9:14 PM | First post",
    5,
  ).map((line) => {
    const [time = "", ...rest] = line.split("|").map((p) => p.trim());
    return { time, text: rest.join(" | ") || time };
  });
  const accent = str("accent", "#1d9bf0");
  const bg = str("bg", "#05070b");
  const t = timing();
  const extra = itemDelays(posts.length);
  view.fill(bg);
  yield view.add(
    <Txt text={title} fill={"#fff"} fontFamily={SERIF} fontSize={28} fontWeight={700} y={-260} />,
  );
  const rail = createRef<Rect>();
  yield view.add(<Rect ref={rail} width={4} height={0} fill={accent} x={-320} y={-40} />);
  yield* pause(t.startDelay);
  yield* rail().height(420, t.lineDuration, easeOutCubic);
  for (let i = 0; i < posts.length; i++) {
    yield* pause(t.connectDelay);
    yield* pause(extra[i]);
    if (i > 0) yield* pause(t.stepDelay);
    const y = -160 + i * 120;
    const node = createRef<Circle>();
    const row = createRef<Layout>();
    yield view.add(<Circle ref={node} size={18} fill={accent} x={-320} y={y} scale={0} />);
    yield view.add(
      <Layout ref={row} x={-40} y={y} opacity={0}>
        <Txt text={posts[i].time} fill={accent} fontFamily={SANS} fontSize={16} x={-80} />
        <Txt text={posts[i].text} fill={"#e8eef6"} fontFamily={SANS} fontSize={22} x={120} width={620} textWrap />
      </Layout>,
    );
    yield* all(
      node().scale(1, t.revealDuration, easeOutBack),
      row().opacity(1, t.revealDuration, easeOutCubic),
    );
  }
  yield* waitFor(1.2);
}

function* screenshotReveal(view: any) {
  const title = str("title", "Screenshot");
  const body = str("body", "We need to talk about what was deleted.");
  const caption = str("caption", "Saved before it disappeared");
  const accent = str("accent", "#94a3b8");
  const bg = str("bg", "#08090c");
  const t = timing();
  view.fill(bg);
  const phone = createRef<Layout>();
  yield view.add(
    <Layout ref={phone} y={60} opacity={0} scale={0.88}>
      <Rect width={360} height={620} fill={"#111827"} radius={36} stroke={accent} lineWidth={3} />
      <Rect width={120} height={10} fill={"#1f2937"} radius={8} y={-280} />
      <Txt text={title} fill={accent} fontFamily={SANS} fontSize={14} letterSpacing={4} y={-220} />
      <Txt text={body} fill={"#f3f4f6"} fontFamily={SANS} fontSize={22} width={280} textWrap textAlign={"center"} y={-40} />
      <Txt text={caption} fill={"#9ca3af"} fontFamily={SANS} fontSize={14} y={220} />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* all(
    phone().opacity(1, t.revealDuration, easeOutCubic),
    phone().y(0, t.revealDuration, easeOutBack),
    phone().scale(1, t.revealDuration, easeOutBack),
  );
  yield* waitFor(1.4);
}

function* commentHighlight(view: any) {
  const handle = str("handle", "@topcomment");
  const body = str("body", "This is the comment that said it first.");
  const meta = str("meta", "Pinned  ·  48K likes");
  const accent = str("accent", "#22c55e");
  const bg = str("bg", "#05070b");
  const t = timing();
  view.fill(bg);
  const card = createRef<Layout>();
  yield view.add(
    <Layout ref={card} opacity={0} scale={0.94}>
      <Rect width={860} height={220} fill={"#12161c"} radius={18} />
      <Rect width={10} height={220} fill={accent} x={-425} radius={4} />
      <Txt text={handle} fill={accent} fontFamily={SANS} fontSize={18} fontWeight={700} y={-60} x={-280} />
      <Txt text={body} fill={"#f4efe6"} fontFamily={SANS} fontSize={28} width={720} textWrap y={10} />
      <Txt text={meta} fill={"#8b98a5"} fontFamily={SANS} fontSize={15} y={80} x={-280} />
    </Layout>,
  );
  yield* pause(t.startDelay);
  yield* all(
    card().opacity(1, t.revealDuration, easeOutCubic),
    card().scale(1, t.revealDuration, easeOutBack),
  );
  yield* waitFor(1.4);
}

function* numberBomb(view: any) {
  const value = str("value", "1.2");
  const suffix = str("suffix", "M");
  const label = str("label", "Subscribers");
  const caption = str("caption", "In under 48 hours");
  const accent = str("accent", "#ff0000");
  const bg = str("bg", "#08080c");
  const t = timing();
  view.fill(bg);
  const n = createRef<Txt>();
  yield view.add(
    <Txt
      ref={n}
      text={`${value}${suffix}`}
      fill={"#ffffff"}
      fontFamily={SERIF}
      fontSize={120}
      fontWeight={700}
      y={-60}
      opacity={0}
    />,
  );
  yield view.add(
    <Txt text={label} fill={accent} fontFamily={SANS} fontSize={24} fontWeight={700} y={80} />,
  );
  yield view.add(
    <Txt text={caption} fill={"#8b949e"} fontFamily={SANS} fontSize={16} y={130} />,
  );
  yield* pause(t.startDelay);
  yield* n().opacity(1, t.revealDuration * 0.6, easeOutCubic);
  yield* n().y(-20, t.revealDuration, easeOutBack);
  yield* waitFor(1.5);
}

function* trendingChart(view: any) {
  const title = str("title", "Engagement spike");
  const bars = lines(str("bars", "Mon|22\nTue|28\nWed|41\nThu|63\nFri|92"), "Mon|50", 8).map(
    (line, i) => {
      const [label = `D${i + 1}`, h = "40"] = line.split("|").map((p) => p.trim());
      return { label, h: Math.max(8, Math.min(100, Number(h) || 40)) };
    },
  );
  const accent = str("accent", "#1d9bf0");
  const bg = str("bg", "#05070b");
  const t = timing();
  const extra = itemDelays(bars.length);
  view.fill(bg);
  yield view.add(
    <Txt text={title} fill={"#fff"} fontFamily={SERIF} fontSize={28} fontWeight={700} y={-260} />,
  );
  yield* pause(t.startDelay);
  const n = Math.max(bars.length, 1);
  for (let i = 0; i < bars.length; i++) {
    yield* pause(extra[i]);
    if (i > 0) yield* pause(t.stepDelay * 0.5);
    const x = -360 + (i / Math.max(n - 1, 1)) * 720;
    const height = bars[i].h * 3.2;
    const bar = createRef<Rect>();
    yield view.add(
      <Rect ref={bar} width={56} height={0} fill={accent} x={x} y={180} offset={[0, 1]} radius={8} />,
    );
    yield view.add(
      <Txt text={bars[i].label} fill={"#9aa3ad"} fontFamily={SANS} fontSize={14} x={x} y={210} />,
    );
    yield* bar().height(height, t.lineDuration, easeOutCubic);
  }
  yield* waitFor(1.3);
}

function* hashtagExplosion(view: any) {
  const center = str("center", "#TheRealStory");
  const tags = lines(
    str("tags", "#Breaking\n#Receipts\n#Viral\n#WatchThis\n#Thread"),
    "#Viral",
    8,
  );
  const accent = str("accent", "#a855f7");
  const bg = str("bg", "#07060c");
  const t = timing();
  const extra = itemDelays(tags.length);
  view.fill(bg);
  const main = createRef<Txt>();
  yield view.add(
    <Txt
      ref={main}
      text={center}
      fill={accent}
      fontFamily={SANS}
      fontSize={48}
      fontWeight={700}
      scale={0.7}
      opacity={0}
    />,
  );
  const slots = [
    [-320, -180],
    [300, -160],
    [-360, 40],
    [340, 20],
    [-280, 180],
    [260, 170],
    [20, -220],
    [-40, 220],
  ];
  yield* pause(t.startDelay);
  yield* all(
    main().opacity(1, t.revealDuration, easeOutCubic),
    main().scale(1, t.revealDuration, easeOutBack),
  );
  for (let i = 0; i < tags.length; i++) {
    yield* pause(extra[i]);
    if (i > 0) yield* pause(t.stepDelay * 0.55);
    const tag = createRef<Txt>();
    const [x, y] = slots[i % slots.length];
    yield view.add(
      <Txt
        ref={tag}
        text={tags[i]}
        fill={"#e8eef6"}
        fontFamily={SANS}
        fontSize={22}
        x={x}
        y={y}
        opacity={0}
        scale={0.6}
      />,
    );
    yield* all(
      tag().opacity(1, t.revealDuration, easeOutCubic),
      tag().scale(1, t.revealDuration, easeOutBack),
    );
  }
  yield* waitFor(1.3);
}

export function* runSocial(view: any, template: string) {
  switch (template) {
    case "social-tweet-reveal":
    case "social-x-post":
      yield* xPost(view);
      break;
    case "social-x-thread":
      yield* xThread(view);
      break;
    case "social-instagram-post":
    case "social-ig-post":
      yield* instagramPost(view);
      break;
    case "social-ig-story":
      yield* instagramStory(view);
      break;
    case "social-yt-highlight":
    case "social-yt-player":
      yield* youtubePlayer(view);
      break;
    case "social-yt-subscribe":
      yield* youtubeSubscribe(view);
      break;
    case "social-viral-post":
      yield* viralPost(view);
      break;
    case "social-comment-explosion":
      yield* commentExplosion(view);
      break;
    case "social-trending":
      yield* trending(view);
      break;
    case "social-reaction":
      yield* socialReaction(view);
      break;
    case "social-internet-reacts":
      yield* internetReacts(view);
      break;
    case "social-viral-moment":
      yield* viralMoment(view);
      break;
    case "social-post-timeline":
      yield* postTimeline(view);
      break;
    case "social-screenshot-reveal":
      yield* screenshotReveal(view);
      break;
    case "social-comment-highlight":
      yield* commentHighlight(view);
      break;
    case "social-subscriber-growth":
    case "social-views-explosion":
      yield* numberBomb(view);
      break;
    case "social-trending-chart":
      yield* trendingChart(view);
      break;
    case "social-hashtag-explosion":
      yield* hashtagExplosion(view);
      break;
    default:
      yield* titleSlam(view, {
        eyebrow: "SOCIAL",
        title: str("title", "Viral moment"),
        subtitle: str("subtitle", ""),
        accent: str("accent", "#1d9bf0"),
        bg: str("bg", "#07090e"),
      });
  }
}
