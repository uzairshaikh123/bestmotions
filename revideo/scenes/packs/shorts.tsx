/** @jsxImportSource @revideo/2d/lib */
import { Circle, Img, Layout, Rect, Txt } from "@revideo/2d";
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  num,
  str,
  waitFor,
} from "../../lib/helpers";
import { blendPhrase, paintBlend } from "../../lib/highlight";

const SERIF = "Libre Baskerville, Georgia, serif";

function timing() {
  return {
    startDelay: Math.max(0, num("startDelay", 0)),
    stepDelay: Math.max(0, num("stepDelay", 0.12)),
    connectDelay: Math.max(0, num("connectDelay", 0.08)),
    lineDuration: Math.max(0.05, num("lineDuration", 0.55)),
    revealDuration: Math.max(0.08, num("revealDuration", 0.32)),
  };
}

function itemDelays(count: number): number[] {
  const raw = str("itemDelays", "").trim();
  if (!raw) return Array.from({ length: count }, () => 0);
  const parts = raw.split(/[,\n]+/).map((s) => Math.max(0, Number(s.trim()) || 0));
  return Array.from({ length: count }, (_, i) => parts[i] ?? 0);
}

function* pause(sec: number) {
  if (sec > 0) yield* waitFor(sec);
}

function photoTile(src: string, w: number, h: number, fill: string) {
  if (src) {
    return <Img src={src} width={w} height={h} />;
  }
  return <Rect width={w} height={h} fill={fill} />;
}

/** Eyebrow → claim slam → highlight underline. */
function* bigClaim(view: any) {
  const eyebrow = str("eyebrow", "HISTORY CHECK");
  const claim = str("claim", "The Most Powerful Government of All Time");
  const highlight = str("highlight", "Most Powerful");
  const accent = str("accent", "#FF9933");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);

  const eye = createRef<Txt>();
  const claimRef = createRef<Layout>();
  const mark = createRef<Rect>();
  const rule = createRef<Rect>();
  yield view.add(
    <Txt
      ref={eye}
      text={eyebrow}
      fill={accent}
      fontFamily={SERIF}
      fontSize={16}
      letterSpacing={8}
      y={-180}
      opacity={0}
    />,
  );
  yield view.add(
    <Layout
      ref={claimRef}
      y={-20}
      opacity={0}
      scale={0.86}
    >
      {blendPhrase(claim, highlight, mark, {
        font: SERIF,
        size: 48,
        fill: "#ffffff",
        marker: str("markerColor", "#FAFF00"),
        weight: 700,
        align: "center",
        width: 1000,
      })}
    </Layout>,
  );
  yield view.add(<Rect ref={rule} width={0} height={8} fill={accent} y={140} />);

  yield* pause(t.startDelay);
  const extra = itemDelays(3);
  yield* pause(extra[0]);
  yield* eye().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* pause(extra[1]);
  yield* all(
    claimRef().opacity(1, t.revealDuration, easeOutCubic),
    claimRef().scale(1, t.revealDuration, easeOutBack),
  );
  yield* pause(t.connectDelay);
  yield* pause(extra[2]);
  yield* rule().width(420, t.lineDuration, easeOutCubic);
  yield* paintBlend(mark, highlight, 48, t.lineDuration);
  yield* waitFor(1.2);
}

/** Two years slam, then a connecting dash draws between them. */
function* eraStamp(view: any) {
  const label = str("label", "A DEFINING DECADE");
  const era = str("era", "2014 — 2024");
  const accent = str("accent", "#FF9933");
  const bg = str("bg", "#0a0c12");
  const t = timing();
  view.fill(bg);

  const parts = era.split(/[—–-]/).map((s) => s.trim()).filter(Boolean);
  const left = parts[0] || era;
  const right = parts[1] || "";

  const lab = createRef<Txt>();
  const a = createRef<Txt>();
  const b = createRef<Txt>();
  const dash = createRef<Rect>();
  yield view.add(
    <Txt
      ref={lab}
      text={label}
      fill={accent}
      fontFamily={SERIF}
      fontSize={16}
      letterSpacing={8}
      y={-200}
      opacity={0}
    />,
  );
  yield view.add(
    <Txt
      ref={a}
      text={left}
      fill={"#ffffff"}
      fontFamily={SERIF}
      fontSize={96}
      fontWeight={700}
      x={right ? -280 : 0}
      y={0}
      scale={0}
    />,
  );
  if (right) {
    yield view.add(<Rect ref={dash} width={0} height={10} fill={accent} y={0} radius={2} />);
    yield view.add(
      <Txt
        ref={b}
        text={right}
        fill={"#ffffff"}
        fontFamily={SERIF}
        fontSize={96}
        fontWeight={700}
        x={280}
        y={0}
        scale={0}
      />,
    );
  }

  yield* pause(t.startDelay);
  const extra = itemDelays(3);
  yield* pause(extra[0]);
  yield* lab().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* pause(extra[1]);
  yield* a().scale(1, t.revealDuration, easeOutBack);
  if (right) {
    yield* pause(t.connectDelay);
    yield* dash().width(120, t.lineDuration, easeOutCubic);
    yield* pause(t.stepDelay);
    yield* pause(extra[2]);
    yield* b().scale(1, t.revealDuration, easeOutBack);
  }
  yield* waitFor(1.2);
}

/** Full-frame tricolor wipes, then title. */
function* flagWipe(view: any) {
  const title = str("title", "INDIA");
  const subtitle = str("subtitle", "A new chapter");
  const bg = str("bg", "#0a0c12");
  const t = timing();
  view.fill(bg);

  const bands = [
    { fill: "#FF9933", from: "left" as const },
    { fill: "#f4f0e6", from: "top" as const },
    { fill: "#138808", from: "right" as const },
  ];
  const extra = itemDelays(3);
  yield* pause(t.startDelay);

  for (let i = 0; i < bands.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    yield* pause(t.connectDelay);
    const w = createRef<Rect>();
    if (bands[i].from === "left") {
      yield view.add(<Rect ref={w} width={0} height={720} fill={bands[i].fill} x={-640} />);
      yield* all(w().width(1280, t.lineDuration, easeOutCubic), w().x(0, t.lineDuration, easeOutCubic));
    } else if (bands[i].from === "top") {
      yield view.add(<Rect ref={w} width={1280} height={0} fill={bands[i].fill} y={-360} />);
      yield* all(w().height(720, t.lineDuration, easeOutCubic), w().y(0, t.lineDuration, easeOutCubic));
    } else {
      yield view.add(<Rect ref={w} width={0} height={720} fill={bands[i].fill} x={640} />);
      yield* all(w().width(1280, t.lineDuration, easeOutCubic), w().x(0, t.lineDuration, easeOutCubic));
    }
  }

  const veil = createRef<Rect>();
  const titleRef = createRef<Txt>();
  const subRef = createRef<Txt>();
  yield view.add(<Rect ref={veil} width={1280} height={220} fill={"#0a0c12"} y={360} opacity={0.82} />);
  yield view.add(
    <Txt
      ref={titleRef}
      text={title}
      fill={"#ffffff"}
      fontFamily={SERIF}
      fontSize={72}
      fontWeight={700}
      y={220}
      opacity={0}
    />,
  );
  yield view.add(
    <Txt
      ref={subRef}
      text={subtitle}
      fill={"#FF9933"}
      fontFamily={SERIF}
      fontSize={22}
      y={280}
      opacity={0}
    />,
  );
  yield* pause(t.stepDelay);
  yield* all(
    veil().y(250, t.revealDuration, easeOutCubic),
    titleRef().opacity(1, t.revealDuration, easeOutCubic),
    subRef().opacity(1, t.revealDuration, easeOutCubic),
  );
  yield* waitFor(1.1);
}

/** Words slam in a stack; a tick draws before the next word. */
function* kineticWords(view: any) {
  const raw = str("text", "Strong Stable Decisive Mandate");
  const accent = str("accent", "#FF9933");
  const bg = str("bg", "#07080c");
  const words = raw.split(/\s+/).filter(Boolean).slice(0, 8);
  const t = timing();
  view.fill(bg);
  yield* pause(t.startDelay);

  const extra = itemDelays(words.length);
  for (let i = 0; i < words.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const y = -140 + i * 78;
    const word = createRef<Txt>();
    yield view.add(
      <Txt
        ref={word}
        text={words[i]}
        fill={i === words.length - 1 ? accent : "#ffffff"}
        fontFamily={SERIF}
        fontSize={i === words.length - 1 ? 64 : 48}
        fontWeight={700}
        y={y}
        scale={0}
      />,
    );
    yield* word().scale(1, t.revealDuration, easeOutBack);
    if (i < words.length - 1) {
      yield* pause(t.connectDelay);
      const tick = createRef<Rect>();
      yield view.add(
        <Rect ref={tick} width={4} height={0} fill={accent} x={-220} y={y + 28} />,
      );
      yield* all(
        tick().height(36, t.lineDuration * 0.6, easeOutCubic),
        tick().y(y + 46, t.lineDuration * 0.6, easeOutCubic),
      );
    }
  }
  yield* waitFor(1.2);
}

/** Portrait, name, connecting bar, role, years. */
function* leaderReveal(view: any) {
  const src = str("imageUrl", "");
  const name = str("name", "Leader Name");
  const role = str("role", "Prime Minister");
  const years = str("years", "2014 — Present");
  const accent = str("accent", "#FF9933");
  const bg = str("bg", "#0a0c12");
  const t = timing();
  view.fill(bg);

  const frame = createRef<Layout>();
  yield view.add(
    <Layout ref={frame} x={-820} y={-10}>
      <Rect width={8} height={420} fill={accent} x={-186} />
      {photoTile(src, 360, 420, "#1a2430")}
    </Layout>,
  );
  const nameRef = createRef<Txt>();
  const roleRef = createRef<Txt>();
  const yearsRef = createRef<Txt>();
  const bar = createRef<Rect>();
  yield view.add(
    <Txt
      ref={nameRef}
      text={name}
      fill={"#ffffff"}
      fontFamily={SERIF}
      fontSize={42}
      fontWeight={700}
      x={220}
      y={-80}
      opacity={0}
      width={520}
      textWrap
    />,
  );
  yield view.add(<Rect ref={bar} width={0} height={5} fill={accent} x={80} y={-10} />);
  yield view.add(
    <Txt ref={roleRef} text={role} fill={accent} fontFamily={SERIF} fontSize={22} x={220} y={30} opacity={0} />,
  );
  yield view.add(
    <Txt ref={yearsRef} text={years} fill={"#c5ccd6"} fontFamily={SERIF} fontSize={18} x={220} y={70} opacity={0} />,
  );

  yield* pause(t.startDelay);
  const extra = itemDelays(4);
  yield* pause(extra[0]);
  yield* frame().x(-320, t.lineDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* pause(extra[1]);
  yield* nameRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* all(bar().width(280, t.lineDuration, easeOutCubic), bar().x(220, t.lineDuration, easeOutCubic));
  yield* pause(t.stepDelay);
  yield* pause(extra[2]);
  yield* roleRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* pause(extra[3]);
  yield* yearsRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.2);
}

/** Seat count + filling meter, then majority mark drops. */
function* majorityMeter(view: any) {
  const title = str("title", "Lok Sabha strength");
  const label = str("label", "Seats won");
  const seats = Math.max(0, num("seats", 303));
  const total = Math.max(1, num("total", 543));
  const mark = Math.max(0, num("majorityMark", 272));
  const accent = str("accent", "#FF9933");
  const bg = str("bg", "#07090e");
  const t = timing();
  view.fill(bg);

  const titleRef = createRef<Txt>();
  const numRef = createRef<Txt>();
  const lab = createRef<Txt>();
  yield view.add(
    <Txt
      ref={titleRef}
      text={title.toUpperCase()}
      fill={accent}
      fontFamily={SERIF}
      fontSize={16}
      letterSpacing={6}
      y={-240}
      opacity={0}
    />,
  );
  yield view.add(
    <Txt ref={numRef} text={"0"} fill={"#ffffff"} fontFamily={SERIF} fontSize={120} fontWeight={700} y={-80} opacity={0} />,
  );
  yield view.add(
    <Txt ref={lab} text={label} fill={"#9aa8b8"} fontFamily={SERIF} fontSize={18} y={20} opacity={0} />,
  );
  yield view.add(<Rect width={900} height={18} fill={"#1b2430"} y={140} radius={9} />);
  const fill = createRef<Rect>();
  yield view.add(<Rect ref={fill} width={0} height={18} fill={accent} x={-450} y={140} radius={9} />);
  const marker = createRef<Rect>();
  const markX = -450 + (Math.min(mark, total) / total) * 900;
  yield view.add(<Rect ref={marker} width={4} height={0} fill={"#ffffff"} x={markX} y={140} />);
  const markLab = createRef<Txt>();
  yield view.add(
    <Txt
      ref={markLab}
      text={`${mark} majority`}
      fill={"#ffffff"}
      fontFamily={SERIF}
      fontSize={14}
      x={markX}
      y={90}
      opacity={0}
    />,
  );

  yield* pause(t.startDelay);
  const extra = itemDelays(3);
  yield* pause(extra[0]);
  yield* all(titleRef().opacity(1, t.revealDuration, easeOutCubic), numRef().opacity(1, t.revealDuration, easeOutCubic));
  yield* pause(t.stepDelay);
  const steps = 18;
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    numRef().text(String(Math.round(seats * p)));
    const w = 900 * (seats / total) * p;
    yield* all(
      fill().width(w, t.lineDuration / steps, easeOutCubic),
      fill().x(-450 + w / 2, t.lineDuration / steps, easeOutCubic),
    );
  }
  yield* lab().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* pause(extra[1]);
  yield* all(
    marker().height(48, t.revealDuration, easeOutCubic),
    marker().y(128, t.revealDuration, easeOutCubic),
  );
  yield* pause(t.stepDelay);
  yield* pause(extra[2]);
  yield* markLab().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.2);
}

/** 2×2 tiles pop, then a connector to the next tile. */
function* montageGrid(view: any) {
  const caption = str("caption", "A decade of decisions");
  const accent = str("accent", "#FF9933");
  const bg = str("bg", "#08090d");
  const srcs = [str("image1", ""), str("image2", ""), str("image3", ""), str("image4", "")];
  const fills = ["#1a2433", "#2a1810", "#142418", "#1a1028"];
  const t = timing();
  view.fill(bg);

  const pts = [
    { x: -250, y: -90 },
    { x: 250, y: -90 },
    { x: -250, y: 140 },
    { x: 250, y: 140 },
  ];
  const w = 420;
  const h = 200;

  yield* pause(t.startDelay);
  const extra = itemDelays(4);
  for (let i = 0; i < 4; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const tile = createRef<Layout>();
    yield view.add(
      <Layout ref={tile} x={pts[i].x} y={pts[i].y} scale={0}>
        {photoTile(srcs[i], w, h, fills[i])}
        <Rect width={w} height={h} fill={null} stroke={accent} lineWidth={2} />
      </Layout>,
    );
    yield* tile().scale(1, t.revealDuration, easeOutBack);
    if (i < 3) {
      yield* pause(t.connectDelay);
      const a = pts[i];
      const b = pts[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      const link = createRef<Rect>();
      yield view.add(
        <Rect ref={link} width={0} height={4} fill={accent} x={a.x} y={a.y} rotation={ang} />,
      );
      yield* all(
        link().width(len, t.lineDuration, easeOutCubic),
        link().x(a.x + dx / 2, t.lineDuration, easeOutCubic),
        link().y(a.y + dy / 2, t.lineDuration, easeOutCubic),
      );
    }
  }
  const cap = createRef<Txt>();
  yield view.add(
    <Txt
      ref={cap}
      text={caption}
      fill={"#ffffff"}
      fontFamily={SERIF}
      fontSize={22}
      y={-280}
      opacity={0}
    />,
  );
  yield* cap().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.1);
}

/** Badge ring, rank slam, connecting bar, labels. */
function* rankBadge(view: any) {
  const rank = str("rank", "#1");
  const label = str("label", "Most Powerful");
  const sublabel = str("sublabel", "In independent India");
  const accent = str("accent", "#FF9933");
  const bg = str("bg", "#08060a");
  const t = timing();
  view.fill(bg);

  const ring = createRef<Circle>();
  const rankRef = createRef<Txt>();
  const lab = createRef<Txt>();
  const sub = createRef<Txt>();
  const bar = createRef<Rect>();
  yield view.add(<Circle ref={ring} size={280} stroke={accent} lineWidth={10} fill={null} y={-40} scale={0} />);
  yield view.add(
    <Txt
      ref={rankRef}
      text={rank}
      fill={"#ffffff"}
      fontFamily={SERIF}
      fontSize={96}
      fontWeight={700}
      y={-40}
      scale={0}
    />,
  );
  yield view.add(<Rect ref={bar} width={0} height={6} fill={accent} y={140} />);
  yield view.add(
    <Txt ref={lab} text={label} fill={"#ffffff"} fontFamily={SERIF} fontSize={32} fontWeight={700} y={190} opacity={0} />,
  );
  yield view.add(
    <Txt ref={sub} text={sublabel} fill={accent} fontFamily={SERIF} fontSize={18} y={240} opacity={0} />,
  );

  yield* pause(t.startDelay);
  const extra = itemDelays(4);
  yield* pause(extra[0]);
  yield* ring().scale(1, t.lineDuration, easeOutBack);
  yield* pause(t.stepDelay);
  yield* pause(extra[1]);
  yield* rankRef().scale(1, t.revealDuration, easeOutBack);
  yield* pause(t.connectDelay);
  yield* pause(extra[2]);
  yield* bar().width(280, t.lineDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* lab().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* pause(extra[3]);
  yield* sub().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.2);
}

/** THEN / NOW panels with a VS divider drawn between them. */
function* thenVsNow(view: any) {
  const leftTitle = str("leftTitle", "THEN");
  const leftText = str("leftText", "Fragile coalition");
  const rightTitle = str("rightTitle", "NOW");
  const rightText = str("rightText", "Full majority");
  const accent = str("accent", "#FF9933");
  const bg = str("bg", "#07080c");
  const t = timing();
  view.fill(bg);

  const left = createRef<Layout>();
  const right = createRef<Layout>();
  const vs = createRef<Layout>();
  const divider = createRef<Rect>();
  yield view.add(
    <Layout ref={left} x={-900} y={20}>
      <Rect width={560} height={520} fill={"#12161e"} />
      <Txt text={leftTitle} fill={"#8b97a8"} fontFamily={SERIF} fontSize={18} letterSpacing={8} y={-180} />
      <Txt text={leftText} fill={"#d8dee8"} fontFamily={SERIF} fontSize={36} fontWeight={700} y={20} width={440} textAlign={"center"} textWrap />
    </Layout>,
  );
  yield view.add(
    <Layout ref={right} x={900} y={20}>
      <Rect width={560} height={520} fill={"#1a140c"} />
      <Txt text={rightTitle} fill={accent} fontFamily={SERIF} fontSize={18} letterSpacing={8} y={-180} />
      <Txt text={rightText} fill={"#ffffff"} fontFamily={SERIF} fontSize={36} fontWeight={700} y={20} width={440} textAlign={"center"} textWrap />
    </Layout>,
  );
  yield view.add(<Rect ref={divider} width={6} height={0} fill={accent} y={20} />);
  yield view.add(
    <Layout ref={vs} y={20} scale={0}>
      <Circle size={72} fill={accent} />
      <Txt text={"VS"} fill={"#07080c"} fontFamily={SERIF} fontSize={20} fontWeight={700} />
    </Layout>,
  );

  yield* pause(t.startDelay);
  const extra = itemDelays(3);
  yield* pause(extra[0]);
  yield* left().x(-310, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* pause(extra[1]);
  yield* right().x(310, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* pause(extra[2]);
  yield* all(
    divider().height(420, t.lineDuration, easeOutCubic),
    vs().scale(1, t.revealDuration, easeOutBack),
  );
  yield* waitFor(1.2);
}

export function* runShorts(view: any, template: string) {
  switch (template) {
    case "short-big-claim":
      yield* bigClaim(view);
      break;
    case "short-era":
      yield* eraStamp(view);
      break;
    case "short-flag-wipe":
      yield* flagWipe(view);
      break;
    case "short-kinetic":
      yield* kineticWords(view);
      break;
    case "short-leader":
      yield* leaderReveal(view);
      break;
    case "short-majority":
      yield* majorityMeter(view);
      break;
    case "short-montage":
      yield* montageGrid(view);
      break;
    case "short-rank":
      yield* rankBadge(view);
      break;
    case "short-vs":
      yield* thenVsNow(view);
      break;
    default:
      yield* bigClaim(view);
  }
}
