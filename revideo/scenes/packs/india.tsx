/** @jsxImportSource @revideo/2d/lib */
import { Circle, Layout, Rect, Txt } from "@revideo/2d";
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  num,
  str,
  waitFor,
} from "../../lib/helpers";
import { blendPhrase, paintBlend, HIGHLIGHTER } from "../../lib/highlight";

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

function parseList(raw: string, fallback: string): string[] {
  return (raw || fallback)
    .split(/,|\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

/** Spokes draw one-by-one, then the wheel spins. */
function* chakraSpin(view: any) {
  const title = str("title", "Truth alone triumphs");
  const subtitle = str("subtitle", "Satyameva Jayate");
  const accent = str("accent", "#000080");
  const bg = str("bg", "#fff8f0");
  const spokes = Math.min(36, Math.max(8, Math.round(num("spokes", 24))));
  const t = timing();
  view.fill(bg);

  const titleRef = createRef<Txt>();
  const subRef = createRef<Txt>();
  yield view.add(
    <Txt ref={titleRef} text={title} fill={"#1a1208"} fontFamily={SERIF} fontSize={32} fontWeight={700} y={-280} opacity={0} />,
  );
  yield view.add(
    <Txt ref={subRef} text={subtitle} fill={accent} fontFamily={SERIF} fontSize={16} letterSpacing={4} y={-236} opacity={0} />,
  );

  const wheel = createRef<Layout>();
  yield view.add(<Layout ref={wheel} y={20} />);
  yield wheel().add(<Circle size={292} stroke={accent} lineWidth={8} fill={"#fff"} />);

  yield* pause(t.startDelay);
  yield* all(
    titleRef().opacity(1, t.revealDuration, easeOutCubic),
    subRef().opacity(1, t.revealDuration, easeOutCubic),
  );

  const extra = itemDelays(spokes);
  const spokeLen = 118;
  for (let i = 0; i < spokes; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const spoke = createRef<Rect>();
    yield wheel().add(
      <Rect
        ref={spoke}
        width={5}
        height={0}
        fill={accent}
        rotation={(360 / spokes) * i}
        y={0}
      />,
    );
    yield* spoke().height(spokeLen, t.revealDuration * 0.55, easeOutCubic);
    if (i < spokes - 1) yield* pause(t.connectDelay);
  }

  const hub = createRef<Circle>();
  yield wheel().add(<Circle ref={hub} size={0} fill={accent} />);
  yield* pause(t.connectDelay);
  yield* hub().size(36, t.revealDuration, easeOutBack);
  yield* wheel().rotation(360, Math.max(t.lineDuration * 1.6, 0.8), easeOutCubic);
  yield* waitFor(1.1);
}

/** Chip pops, then a connecting line draws to the next. */
function* diversityChips(view: any) {
  const title = str("title", "Many languages, one nation");
  const accent = str("accent", "#138808");
  const bg = str("bg", "#0a1210");
  const items = parseList(str("items", "Hindi, English, Tamil, Bengali"), "Hindi, English, Tamil");
  const t = timing();
  view.fill(bg);

  const titleRef = createRef<Txt>();
  yield view.add(
    <Txt ref={titleRef} text={title} fill={"#e8f0ea"} fontFamily={SERIF} fontSize={28} fontWeight={700} y={-280} opacity={0} />,
  );
  yield* pause(t.startDelay);
  yield* titleRef().opacity(1, t.revealDuration, easeOutCubic);

  const extra = itemDelays(items.length);
  const cols = 4;
  const pts = items.map((_, i) => ({
    x: -420 + (i % cols) * 280,
    y: -90 + Math.floor(i / cols) * 120,
  }));

  for (let i = 0; i < items.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const chip = createRef<Layout>();
    yield view.add(
      <Layout ref={chip} x={pts[i].x} y={pts[i].y} scale={0}>
        <Rect width={240} height={56} fill={"#10241c"} radius={8} />
        <Rect width={8} height={56} fill={accent} x={-116} radius={2} />
        <Txt text={items[i]} fill={"#f4f0e6"} fontFamily={SERIF} fontSize={18} fontWeight={700} />
      </Layout>,
    );
    yield* chip().scale(1, t.revealDuration, easeOutBack);

    if (i < items.length - 1) {
      yield* pause(t.connectDelay);
      const a = pts[i];
      const b = pts[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      const link = createRef<Rect>();
      yield view.add(
        <Rect
          ref={link}
          width={0}
          height={3}
          fill={accent}
          x={a.x}
          y={a.y}
          rotation={ang}
          radius={2}
          opacity={0.85}
        />,
      );
      yield* all(
        link().width(len, t.lineDuration, easeOutCubic),
        link().x(a.x + dx / 2, t.lineDuration, easeOutCubic),
        link().y(a.y + dy / 2, t.lineDuration, easeOutCubic),
      );
    }
  }
  yield* waitFor(1.2);
}

/** Sparks appear, hold, then streak outward from the center. */
function* festivalBurst(view: any) {
  const title = str("title", "Happy Diwali");
  const subtitle = str("subtitle", "Festival of lights");
  const accent = str("accent", "#FF9933");
  const bg = str("bg", "#120a04");
  const count = Math.min(64, Math.max(8, Math.round(num("particleCount", 36))));
  const t = timing();
  view.fill(bg);

  const titleRef = createRef<Txt>();
  const subRef = createRef<Txt>();
  yield view.add(
    <Txt ref={titleRef} text={title} fill={"#fff6e8"} fontFamily={SERIF} fontSize={52} fontWeight={700} y={-40} opacity={0} />,
  );
  yield view.add(
    <Txt ref={subRef} text={subtitle} fill={accent} fontFamily={SERIF} fontSize={20} letterSpacing={4} y={28} opacity={0} />,
  );
  yield* pause(t.startDelay);
  yield* titleRef().opacity(1, t.revealDuration, easeOutCubic);

  const extra = itemDelays(count);
  const sparks = Array.from({ length: count }, (_, i) => {
    const ang = (i / count) * Math.PI * 2;
    return { ref: createRef<Circle>(), ang, size: 8 + (i % 5) * 3 };
  });

  const batch = 6;
  for (let i = 0; i < sparks.length; i += batch) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const slice = sparks.slice(i, i + batch);
    for (const s of slice) {
      yield view.add(
        <Circle
          ref={s.ref}
          size={s.size}
          fill={slice.indexOf(s) % 2 ? accent : "#ffe566"}
          x={0}
          y={-10}
          scale={0}
        />,
      );
    }
    yield* all(...slice.map((s) => s.ref().scale(1, t.revealDuration * 0.5, easeOutBack)));
  }

  yield* pause(t.connectDelay);
  yield* all(
    ...sparks.map((s) =>
      all(
        s.ref().x(Math.cos(s.ang) * 280, t.lineDuration, easeOutCubic),
        s.ref().y(Math.sin(s.ang) * 180 - 10, t.lineDuration, easeOutCubic),
        s.ref().opacity(0.85, t.lineDuration, easeOutCubic),
      ),
    ),
    subRef().opacity(1, t.revealDuration, easeOutCubic),
  );
  yield* waitFor(1.2);
}

/** Stylized peninsula + expanding pulse rings, then fact line. */
function* mapPulse(view: any) {
  const title = str("title", "INDIA");
  const subtitle = str("subtitle", "Unity in diversity");
  const fact = str("fact", "1.4 billion stories");
  const highlight = str("highlight", "1.4 billion");
  const accent = str("accent", "#FF9933");
  const bg = str("bg", "#071018");
  const t = timing();
  view.fill(bg);

  const land = createRef<Layout>();
  yield view.add(
    <Layout ref={land} x={180} y={30} scale={0.72}>
      <Rect width={210} height={340} fill={"#163848"} radius={90} y={10} />
      <Rect width={86} height={90} fill={"#163848"} radius={28} x={-70} y={-40} />
      <Rect width={70} height={70} fill={"#163848"} radius={22} x={110} y={-70} />
      <Rect width={54} height={80} fill={"#163848"} radius={20} y={-170} />
      <Rect width={46} height={70} fill={"#1a4454"} radius={20} y={210} />
    </Layout>,
  );

  const ring1 = createRef<Circle>();
  const ring2 = createRef<Circle>();
  const ring3 = createRef<Circle>();
  yield view.add(<Circle ref={ring1} size={120} stroke={accent} lineWidth={2} fill={null} x={180} y={20} scale={0} />);
  yield view.add(<Circle ref={ring2} size={220} stroke={accent} lineWidth={2} fill={null} x={180} y={20} scale={0} />);
  yield view.add(<Circle ref={ring3} size={340} stroke={accent} lineWidth={2} fill={null} x={180} y={20} scale={0} />);

  const titleRef = createRef<Txt>();
  const subRef = createRef<Txt>();
  const factRef = createRef<Layout>();
  const mark = createRef<Rect>();
  const rule = createRef<Rect>();
  yield view.add(
    <Txt ref={titleRef} text={title} fill={"#ffffff"} fontFamily={SERIF} fontSize={72} fontWeight={700} x={-300} y={-80} opacity={0} />,
  );
  yield view.add(
    <Txt ref={subRef} text={subtitle} fill={accent} fontFamily={SERIF} fontSize={20} x={-300} y={-10} opacity={0} />,
  );
  yield view.add(<Rect ref={rule} width={0} height={3} fill={accent} x={-480} y={40} />);
  yield view.add(
    <Layout ref={factRef} x={-300} y={80} opacity={0} width={460} layout>
      {blendPhrase(fact, highlight, mark, {
        font: SERIF,
        size: 22,
        fill: "#c5d4de",
        marker: HIGHLIGHTER,
        width: 460,
      })}
    </Layout>,
  );

  yield* pause(t.startDelay);
  yield* land().scale(1, t.lineDuration, easeOutCubic);
  const extra = itemDelays(3);
  const rings = [ring1, ring2, ring3];
  for (let i = 0; i < rings.length; i++) {
    yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    yield* pause(t.connectDelay);
    yield* all(
      rings[i]().scale(1, t.lineDuration, easeOutCubic),
      rings[i]().opacity(0.35, t.lineDuration, easeOutCubic),
    );
  }
  yield* pause(t.stepDelay);
  yield* titleRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* all(
    rule().width(360, t.lineDuration, easeOutCubic),
    rule().x(-300, t.lineDuration, easeOutCubic),
  );
  yield* subRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* factRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* paintBlend(mark, highlight, 22, t.lineDuration);
  yield* waitFor(1.2);
}

/** Parchment constitution card with typewriter body. */
function* preambleType(view: any) {
  const eyebrow = str("eyebrow", "WE, THE PEOPLE OF INDIA");
  const body = str(
    "body",
    "having solemnly resolved to constitute India into a Sovereign Socialist Secular Democratic Republic...",
  );
  const accent = str("accent", "#FF9933");
  const bg = str("bg", "#1a1208");
  const t = timing();
  view.fill(bg);

  const page = createRef<Rect>();
  const eyeRef = createRef<Txt>();
  const bodyRef = createRef<Txt>();
  const rule = createRef<Rect>();
  yield view.add(<Rect ref={page} width={920} height={480} fill={"#f3e6c8"} y={20} scale={0.92} opacity={0} />);
  yield view.add(<Rect ref={rule} width={0} height={4} fill={accent} y={-140} />);
  yield view.add(
    <Txt
      ref={eyeRef}
      text={eyebrow}
      fill={"#6b2a10"}
      fontFamily={SERIF}
      fontSize={22}
      fontWeight={700}
      letterSpacing={3}
      y={-180}
      opacity={0}
      width={820}
      textAlign={"center"}
      textWrap
    />,
  );
  yield view.add(
    <Txt
      ref={bodyRef}
      text={""}
      fill={"#2a1c10"}
      fontFamily={SERIF}
      fontSize={24}
      y={20}
      width={760}
      textWrap
    />,
  );

  yield* pause(t.startDelay);
  yield* all(page().opacity(1, t.revealDuration, easeOutCubic), page().scale(1, t.lineDuration, easeOutCubic));
  yield* pause(t.stepDelay);
  yield* eyeRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  yield* all(rule().width(620, t.lineDuration, easeOutCubic));

  const chunks = Math.max(8, Math.min(48, Math.ceil(body.length / 4)));
  const extra = itemDelays(chunks);
  const step = t.lineDuration / chunks;
  for (let i = 1; i <= chunks; i++) {
    yield* pause(extra[i - 1]);
    bodyRef().text(body.slice(0, Math.ceil((body.length * i) / chunks)));
    yield* waitFor(step);
  }
  yield* waitFor(1.3);
}

/** Giant ₹ count-up, then a connecting underline. */
function* rupeeBumper(view: any) {
  const title = str("title", "Economy snapshot");
  const prefix = str("prefix", "₹");
  const value = num("value", 4.1);
  const suffix = str("suffix", "T");
  const caption = str("caption", "GDP milestone");
  const accent = str("accent", "#FF9933");
  const bg = str("bg", "#0a1210");
  const t = timing();
  view.fill(bg);

  const titleRef = createRef<Txt>();
  const numRef = createRef<Txt>();
  const capRef = createRef<Txt>();
  const rule = createRef<Rect>();
  yield view.add(
    <Txt ref={titleRef} text={title.toUpperCase()} fill={accent} fontFamily={SERIF} fontSize={16} letterSpacing={6} y={-200} opacity={0} />,
  );
  yield view.add(
    <Txt ref={numRef} text={`${prefix}0${suffix}`} fill={"#ffffff"} fontFamily={SERIF} fontSize={120} fontWeight={700} opacity={0} />,
  );
  yield view.add(<Rect ref={rule} width={0} height={6} fill={accent} y={90} />);
  yield view.add(
    <Txt ref={capRef} text={caption} fill={"#c5d4de"} fontFamily={SERIF} fontSize={22} y={140} opacity={0} />,
  );

  yield* pause(t.startDelay);
  yield* titleRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* numRef().opacity(1, t.revealDuration, easeOutCubic);

  const decimals = String(value).includes(".") ? 1 : 0;
  const steps = 18;
  const extra = itemDelays(steps);
  for (let i = 1; i <= steps; i++) {
    yield* pause(extra[i - 1] ? Math.min(extra[i - 1], 0.05) : 0);
    const p = i / steps;
    numRef().text(`${prefix}${(value * p).toFixed(decimals)}${suffix}`);
    yield* waitFor(t.lineDuration / steps);
  }

  yield* pause(t.connectDelay);
  yield* all(rule().width(420, t.lineDuration, easeOutCubic));
  yield* capRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.2);
}

/** Cricket scoreboard plates with linking bars. */
function* scoreBumper(view: any) {
  const team = str("team", "IND");
  const score = str("score", "342/4");
  const overs = str("overs", "48.2");
  const status = str("status", "Need 38 from 10 balls");
  const accent = str("accent", "#FF9933");
  const bg = str("bg", "#07140c");
  const t = timing();
  view.fill(bg);

  yield view.add(<Rect width={1280} height={80} fill={"#138808"} y={-320} />);
  const pitch = createRef<Rect>();
  yield view.add(<Rect ref={pitch} width={0} height={4} fill={"#e8e0c0"} y={40} />);

  const teamBox = createRef<Layout>();
  const scoreBox = createRef<Layout>();
  const overBox = createRef<Layout>();
  const statusBox = createRef<Layout>();
  yield view.add(
    <Layout ref={teamBox} x={-900} y={-40}>
      <Rect width={160} height={90} fill={accent} />
      <Txt text={team} fill={"#07140c"} fontFamily={SERIF} fontSize={36} fontWeight={700} />
    </Layout>,
  );
  yield view.add(
    <Layout ref={scoreBox} x={-900} y={-40}>
      <Rect width={280} height={90} fill={"#0e2418"} />
      <Txt text={score} fill={"#ffffff"} fontFamily={SERIF} fontSize={40} fontWeight={700} />
    </Layout>,
  );
  yield view.add(
    <Layout ref={overBox} x={-900} y={-40}>
      <Rect width={220} height={90} fill={"#12301e"} />
      <Txt text={`${overs} OV`} fill={"#e8f0ea"} fontFamily={SERIF} fontSize={28} fontWeight={700} />
    </Layout>,
  );
  yield view.add(
    <Layout ref={statusBox} x={-40} y={200} opacity={0}>
      <Rect width={720} height={56} fill={"#0e2418"} />
      <Txt text={status} fill={accent} fontFamily={SERIF} fontSize={20} />
    </Layout>,
  );

  yield* pause(t.startDelay);
  const extra = itemDelays(4);
  yield* pause(extra[0]);
  yield* teamBox().x(-360, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  const bar1 = createRef<Rect>();
  yield view.add(<Rect ref={bar1} width={0} height={8} fill={accent} x={-272} y={-40} />);
  yield* bar1().width(40, t.lineDuration * 0.5, easeOutCubic);

  yield* pause(t.stepDelay);
  yield* pause(extra[1]);
  yield* scoreBox().x(-90, t.revealDuration, easeOutCubic);
  yield* pause(t.connectDelay);
  const bar2 = createRef<Rect>();
  yield view.add(<Rect ref={bar2} width={0} height={8} fill={accent} x={58} y={-40} />);
  yield* bar2().width(40, t.lineDuration * 0.5, easeOutCubic);

  yield* pause(t.stepDelay);
  yield* pause(extra[2]);
  yield* overBox().x(240, t.revealDuration, easeOutCubic);

  yield* pause(t.connectDelay);
  yield* pitch().width(900, t.lineDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* pause(extra[3]);
  yield* statusBox().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.3);
}

/** Three tricolor bars rise with meanings, linked by delays. */
function* tricolorRise(view: any) {
  const title = str("title", "Tiranga");
  const lines = [
    { text: str("line1", "Saffron — Courage"), color: "#FF9933" },
    { text: str("line2", "White — Truth"), color: "#f4f0e6" },
    { text: str("line3", "Green — Faith"), color: "#138808" },
  ];
  const bg = str("bg", "#0a0c12");
  const t = timing();
  view.fill(bg);

  const titleRef = createRef<Txt>();
  yield view.add(
    <Txt ref={titleRef} text={title.toUpperCase()} fill={"#f4f0e6"} fontFamily={SERIF} fontSize={18} letterSpacing={10} y={-280} opacity={0} />,
  );
  yield* pause(t.startDelay);
  yield* titleRef().opacity(1, t.revealDuration, easeOutCubic);

  const extra = itemDelays(3);
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) yield* pause(t.stepDelay);
    yield* pause(extra[i]);
    const y = -140 + i * 140;
    const bar = createRef<Rect>();
    const label = createRef<Txt>();
    yield view.add(<Rect ref={bar} width={0} height={110} fill={lines[i].color} x={-640} y={y} />);
    yield* pause(t.connectDelay);
    yield* all(bar().width(1280, t.lineDuration, easeOutCubic), bar().x(0, t.lineDuration, easeOutCubic));
    yield view.add(
      <Txt
        ref={label}
        text={lines[i].text}
        fill={i === 1 ? "#1a1208" : "#0a0c12"}
        fontFamily={SERIF}
        fontSize={32}
        fontWeight={700}
        y={y}
        opacity={0}
      />,
    );
    yield* label().opacity(1, t.revealDuration, easeOutCubic);
  }
  yield* waitFor(1.2);
}

/** Count years of independence while a rail connects start to end. */
function* yearsOfFreedom(view: any) {
  const label = str("label", "Years of Independence");
  const start = Math.round(num("startYear", 1947));
  const end = Math.round(num("endYear", 2026));
  const years = Math.max(0, end - start);
  const accent = str("accent", "#FF9933");
  const bg = str("bg", "#0a0c12");
  const t = timing();
  view.fill(bg);

  const labelRef = createRef<Txt>();
  const yearRef = createRef<Txt>();
  const startRef = createRef<Txt>();
  const endRef = createRef<Txt>();
  yield view.add(
    <Txt ref={labelRef} text={label.toUpperCase()} fill={accent} fontFamily={SERIF} fontSize={16} letterSpacing={6} y={-240} opacity={0} />,
  );
  yield view.add(
    <Txt ref={yearRef} text={"0"} fill={"#ffffff"} fontFamily={SERIF} fontSize={160} fontWeight={700} y={-20} opacity={0} />,
  );
  yield view.add(<Rect width={900} height={6} fill={"#243044"} y={200} radius={3} />);
  const fill = createRef<Rect>();
  const head = createRef<Rect>();
  yield view.add(<Rect ref={fill} width={0} height={6} fill={accent} x={-450} y={200} radius={3} />);
  yield view.add(<Rect ref={head} width={16} height={28} fill={"#fff"} x={-450} y={200} radius={2} />);
  yield view.add(
    <Txt ref={startRef} text={String(start)} fill={"#8b97a8"} fontFamily={SERIF} fontSize={16} x={-450} y={240} opacity={0} />,
  );
  yield view.add(
    <Txt ref={endRef} text={String(end)} fill={"#8b97a8"} fontFamily={SERIF} fontSize={16} x={450} y={240} opacity={0} />,
  );

  yield* pause(t.startDelay);
  yield* all(
    labelRef().opacity(1, t.revealDuration, easeOutCubic),
    yearRef().opacity(1, t.revealDuration, easeOutCubic),
    startRef().opacity(1, t.revealDuration, easeOutCubic),
    endRef().opacity(1, t.revealDuration, easeOutCubic),
  );

  yield* pause(t.connectDelay);
  const steps = 20;
  const extra = itemDelays(steps);
  for (let i = 1; i <= steps; i++) {
    yield* pause(extra[i - 1] ? Math.min(extra[i - 1], 0.05) : 0);
    const p = i / steps;
    yearRef().text(String(Math.round(years * p)));
    yield* all(
      fill().width(900 * p, t.lineDuration / steps, easeOutCubic),
      fill().x(-450 + (900 * p) / 2, t.lineDuration / steps, easeOutCubic),
      head().x(-450 + 900 * p, t.lineDuration / steps, easeOutCubic),
    );
  }
  yield* waitFor(1.2);
}

export function* runIndia(view: any, template: string) {
  switch (template) {
    case "india-chakra":
      yield* chakraSpin(view);
      break;
    case "india-diversity":
      yield* diversityChips(view);
      break;
    case "india-festival":
      yield* festivalBurst(view);
      break;
    case "india-map-pulse":
      yield* mapPulse(view);
      break;
    case "india-preamble":
      yield* preambleType(view);
      break;
    case "india-rupee":
      yield* rupeeBumper(view);
      break;
    case "india-score":
      yield* scoreBumper(view);
      break;
    case "india-tricolor-rise":
      yield* tricolorRise(view);
      break;
    case "india-years":
      yield* yearsOfFreedom(view);
      break;
    default:
      yield* chakraSpin(view);
  }
}
