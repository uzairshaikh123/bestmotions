/** @jsxImportSource @revideo/2d/lib */
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  num,
  Rect,
  str,
  Txt,
  waitFor,
} from "../../lib/helpers";

type Ev = { label: string; title: string; detail: string };

function parseEvents(raw: string, fallback: string): Ev[] {
  const text = (raw || fallback).trim();
  return text
    .split(/\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.includes("|")) {
        const [label = "", title = "", detail = ""] = line
          .split("|")
          .map((p) => p.trim());
        return { label, title: title || label, detail };
      }
      return { label: "", title: line, detail: "" };
    })
    .slice(0, 6);
}

const DEFAULT_EVENTS = `1947|Independence|Freedom at midnight
1950|Republic|Constitution adopted
1991|Reforms|Economy opens
2014|Mandate|A new chapter
2024|Present|Looking ahead`;

/** Horizontal rail — nodes pop along a drawing line. */
function* horizontalNodes(view: any) {
  const title = str("title", "Key milestones");
  const accent = str("accent", "#3dd6c6");
  const lineColor = str("lineColor", "#2a3a48");
  const bg = str("bg", "#0a1218");
  const events = parseEvents(str("events", DEFAULT_EVENTS), DEFAULT_EVENTS);

  view.fill(bg);
  const heading = createRef<Txt>();
  yield view.add(
    <Txt
      ref={heading}
      text={title}
      fill={"#e8f0ea"}
      fontFamily={"Libre Baskerville, Georgia, serif"}
      fontSize={36}
      fontWeight={700}
      x={-420}
      y={-260}
      opacity={0}
    />,
  );
  yield* heading().opacity(1, 0.35, easeOutCubic);

  const track = createRef<Rect>();
  const fill = createRef<Rect>();
  yield view.add(
    <Rect
      ref={track}
      width={960}
      height={4}
      fill={lineColor}
      y={20}
      radius={2}
    />,
  );
  yield view.add(
    <Rect
      ref={fill}
      width={0}
      height={4}
      fill={accent}
      x={-480}
      y={20}
      radius={2}
    />,
  );
  // Grow from left: keep left edge fixed while width expands
  yield* all(
    fill().width(960, 1.1, easeOutCubic),
    fill().x(0, 1.1, easeOutCubic),
  );

  const n = Math.max(events.length, 1);
  for (let i = 0; i < events.length; i++) {
    const x = -480 + (i / Math.max(n - 1, 1)) * 960;
    const node = createRef<Rect>();
    const year = createRef<Txt>();
    const label = createRef<Txt>();
    yield view.add(
      <Rect
        ref={node}
        width={22}
        height={22}
        radius={11}
        fill={accent}
        x={x}
        y={20}
        scale={0}
        shadowColor={accent}
        shadowBlur={12}
      />,
    );
    yield view.add(
      <Txt
        ref={year}
        text={events[i].label}
        fill={accent}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={16}
        letterSpacing={1}
        x={x}
        y={-40}
        opacity={0}
      />,
    );
    yield view.add(
      <Txt
        ref={label}
        text={events[i].title}
        fill={"#e8f0ea"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={18}
        x={x}
        y={70}
        opacity={0}
        width={160}
        textAlign={"center"}
        textWrap
      />,
    );
    yield* all(
      node().scale(1, 0.35, easeOutBack),
      year().opacity(1, 0.3, easeOutCubic),
      label().opacity(1, 0.3, easeOutCubic),
    );
  }
  yield* waitFor(1.4);
}

/** Vertical spine — Nitish Rajput / doc-explainer style. */
function* verticalSpine(view: any) {
  const title = str("title", "The story so far");
  const accent = str("accent", "#d8a11a");
  const bg = str("bg", "#071018");
  const events = parseEvents(str("events", DEFAULT_EVENTS), DEFAULT_EVENTS);

  view.fill(bg);
  const heading = createRef<Txt>();
  yield view.add(
    <Txt
      ref={heading}
      text={title}
      fill={accent}
      fontFamily={"Libre Baskerville, Georgia, serif"}
      fontSize={34}
      fontWeight={700}
      x={-360}
      y={-280}
      opacity={0}
    />,
  );
  yield* heading().opacity(1, 0.3, easeOutCubic);

  const track = createRef<Rect>();
  const grow = createRef<Rect>();
  const spineH = Math.min(480, 70 + events.length * 88);
  yield view.add(
    <Rect
      ref={track}
      width={3}
      height={spineH}
      fill={"#243040"}
      x={-420}
      y={-200 + spineH / 2}
      radius={2}
    />,
  );
  yield view.add(
    <Rect
      ref={grow}
      width={3}
      height={0}
      fill={accent}
      x={-420}
      y={-200}
      radius={2}
    />,
  );
  yield* all(
    grow().height(spineH, 1.2, easeOutCubic),
    grow().y(-200 + spineH / 2, 1.2, easeOutCubic),
  );

  for (let i = 0; i < events.length; i++) {
    const y = -180 + i * 88;
    const dot = createRef<Rect>();
    const year = createRef<Txt>();
    const name = createRef<Txt>();
    const detail = createRef<Txt>();
    yield view.add(
      <Rect
        ref={dot}
        width={14}
        height={14}
        radius={7}
        fill={accent}
        x={-420}
        y={y}
        scale={0}
        shadowColor={accent}
        shadowBlur={10}
      />,
    );
    yield view.add(
      <Txt
        ref={year}
        text={events[i].label}
        fill={accent}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={15}
        letterSpacing={2}
        x={-280}
        y={y - 18}
        opacity={0}
      />,
    );
    yield view.add(
      <Txt
        ref={name}
        text={events[i].title}
        fill={"#e8f0ea"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={26}
        fontWeight={700}
        x={-280}
        y={y + 8}
        opacity={0}
      />,
    );
    yield view.add(
      <Txt
        ref={detail}
        text={events[i].detail}
        fill={"#9aa8b8"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={16}
        x={-280}
        y={y + 36}
        opacity={0}
        width={520}
        textWrap
      />,
    );
    yield* all(
      dot().scale(1, 0.3, easeOutBack),
      year().opacity(1, 0.25, easeOutCubic),
      name().opacity(1, 0.25, easeOutCubic),
      detail().opacity(1, 0.25, easeOutCubic),
      year().x(-300, 0.35, easeOutCubic),
      name().x(-300, 0.35, easeOutCubic),
      detail().x(-300, 0.35, easeOutCubic),
    );
  }
  yield* waitFor(1.3);
}

/** Big counting year + scrubbing playhead — classic YT history beat. */
function* yearScrub(view: any) {
  const title = str("title", "Across the decades");
  const accent = str("accent", "#ff6b4a");
  const bg = str("bg", "#0b1020");
  const start = num("startYear", 1947);
  const end = num("endYear", 2026);
  const markers = str("markerYears", "1947, 1965, 1991, 2014, 2024")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));

  view.fill(bg);
  const heading = createRef<Txt>();
  const yearTxt = createRef<Txt>();
  const rail = createRef<Rect>();
  const head = createRef<Rect>();
  const fill = createRef<Rect>();

  yield view.add(
    <Txt
      ref={heading}
      text={title}
      fill={"#e8f0ea"}
      fontFamily={"Libre Baskerville, Georgia, serif"}
      fontSize={30}
      x={-420}
      y={-260}
      opacity={0}
    />,
  );
  yield view.add(
    <Txt
      ref={yearTxt}
      text={String(start)}
      fill={accent}
      fontFamily={"Libre Baskerville, Georgia, serif"}
      fontSize={120}
      fontWeight={700}
      x={-320}
      y={-80}
      opacity={0}
    />,
  );
  yield view.add(
    <Rect
      ref={rail}
      width={1000}
      height={6}
      fill={"#2a3348"}
      y={200}
      radius={3}
    />,
  );
  yield view.add(
    <Rect
      ref={fill}
      width={0}
      height={6}
      fill={accent}
      x={-500}
      y={200}
      radius={3}
    />,
  );
  yield view.add(
    <Rect
      ref={head}
      width={22}
      height={22}
      radius={11}
      fill={"#ffffff"}
      x={-500}
      y={200}
      shadowColor={accent}
      shadowBlur={16}
      scale={0}
    />,
  );

  for (const m of markers) {
    const p = (m - start) / Math.max(end - start, 1);
    if (p < 0 || p > 1) continue;
    const x = -500 + p * 1000;
    yield view.add(
      <Txt
        text={String(m)}
        fill={"#9aa8b8"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={14}
        x={x}
        y={240}
      />,
    );
  }

  yield* all(
    heading().opacity(1, 0.3, easeOutCubic),
    yearTxt().opacity(1, 0.35, easeOutCubic),
    head().scale(1, 0.3, easeOutBack),
  );

  const steps = 24;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const year = Math.round(start + t * (end - start));
    yearTxt().text(String(year));
    yield* all(
      fill().width(1000 * t, 0.08, easeOutCubic),
      fill().x(-500 + (1000 * t) / 2, 0.08, easeOutCubic),
      head().x(-500 + 1000 * t, 0.08, easeOutCubic),
    );
  }
  yield* waitFor(1.2);
}

/** Alternating cards above / below a growing center line. */
function* milestoneCards(view: any) {
  const title = str("title", "Turning points");
  const accent = str("accent", "#7dd3a0");
  const bg = str("bg", "#081410");
  const events = parseEvents(str("events", DEFAULT_EVENTS), DEFAULT_EVENTS).slice(
    0,
    5,
  );

  view.fill(bg);
  const heading = createRef<Txt>();
  yield view.add(
    <Txt
      ref={heading}
      text={title}
      fill={"#e8f0ea"}
      fontFamily={"Libre Baskerville, Georgia, serif"}
      fontSize={34}
      y={-280}
      opacity={0}
    />,
  );
  yield* heading().opacity(1, 0.3, easeOutCubic);

  const line = createRef<Rect>();
  yield view.add(
    <Rect ref={line} width={0} height={3} fill={accent} y={20} radius={2} />,
  );
  yield* line().width(1000, 0.9, easeOutCubic);

  const n = Math.max(events.length, 1);
  for (let i = 0; i < events.length; i++) {
    const x = -400 + (i / Math.max(n - 1, 1)) * 800;
    const above = i % 2 === 0;
    const card = createRef<Rect>();
    yield view.add(
      <Rect
        ref={card}
        width={170}
        height={110}
        fill={"#0f1c18"}
        stroke={accent}
        lineWidth={2}
        radius={6}
        x={x}
        y={above ? -100 : 140}
        opacity={0}
        layout
        direction={"column"}
        gap={6}
        padding={14}
        alignItems={"start"}
      >
        <Txt
          text={events[i].label}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={14}
          letterSpacing={1}
        />
        <Txt
          text={events[i].title}
          fill={"#f4f0e6"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={18}
          fontWeight={700}
          textWrap
          width={140}
        />
      </Rect>,
    );
    const dot = createRef<Rect>();
    yield view.add(
      <Rect
        ref={dot}
        width={16}
        height={16}
        radius={8}
        fill={accent}
        x={x}
        y={20}
        scale={0}
      />,
    );
    yield* all(
      card().opacity(1, 0.3, easeOutCubic),
      card().y(above ? -90 : 130, 0.4, easeOutBack),
      dot().scale(1, 0.3, easeOutBack),
    );
  }
  yield* waitFor(1.4);
}

/** One big focused event + mini year strip underneath. */
function* focusSpotlight(view: any) {
  const eyebrow = str("title", "In focus");
  const accent = str("accent", "#5b8cff");
  const bg = str("bg", "#0a0e18");
  const events = parseEvents(str("events", DEFAULT_EVENTS), DEFAULT_EVENTS);
  const focusIndex = Math.min(
    Math.max(0, Math.floor(num("focusIndex", 2))),
    Math.max(events.length - 1, 0),
  );
  const focus = events[focusIndex] || events[0];

  view.fill(bg);
  const card = createRef<Rect>();
  const eye = createRef<Txt>();
  yield view.add(
    <Txt
      ref={eye}
      text={eyebrow}
      fill={accent}
      fontFamily={"Libre Baskerville, Georgia, serif"}
      fontSize={14}
      letterSpacing={4}
      y={-260}
      opacity={0}
    />,
  );
  yield view.add(
    <Rect
      ref={card}
      width={720}
      height={280}
      fill={"#121a2a"}
      stroke={accent}
      lineWidth={2}
      radius={8}
      y={-20}
      opacity={0}
      scale={0.92}
      layout
      direction={"column"}
      gap={14}
      padding={40}
      alignItems={"start"}
    >
      <Txt
        text={focus.label}
        fill={accent}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={22}
        letterSpacing={3}
      />
      <Txt
        text={focus.title}
        fill={"#ffffff"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={48}
        fontWeight={700}
      />
      <Txt
        text={focus.detail}
        fill={"#aeb8c8"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={20}
        textWrap
        width={620}
      />
    </Rect>,
  );
  yield* all(
    eye().opacity(1, 0.3, easeOutCubic),
    card().opacity(1, 0.4, easeOutCubic),
    card().scale(1, 0.55, easeOutBack),
  );

  const n = events.length;
  for (let i = 0; i < n; i++) {
    const x = -300 + (i / Math.max(n - 1, 1)) * 600;
    const chip = createRef<Rect>();
    yield view.add(
      <Rect
        ref={chip}
        width={i === focusIndex ? 90 : 70}
        height={36}
        fill={i === focusIndex ? accent : "#1a2438"}
        radius={4}
        x={x}
        y={220}
        opacity={0}
        layout
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Txt
          text={events[i].label}
          fill={i === focusIndex ? "#0a0e18" : "#9aa8b8"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={14}
          fontWeight={700}
        />
      </Rect>,
    );
    yield* chip().opacity(1, 0.2, easeOutCubic);
  }
  yield* waitFor(1.5);
}

/** Era columns growing like decade chapters. */
function* eraBlocks(view: any) {
  const title = str("title", "Eras");
  const accent = str("accent", "#e8a54b");
  const bg = str("bg", "#120e0a");
  const events = parseEvents(
    str(
      "events",
      `1947–1964|Nehru years|Nation building
1965–1984|Trials|Wars & shifts
1991–2010|Opening|Reform age
2014–now|Present|New mandate`,
    ),
    `1947–1964|Nehru years|Nation building
1965–1984|Trials|Wars & shifts
1991–2010|Opening|Reform age
2014–now|Present|New mandate`,
  );

  view.fill(bg);
  const heading = createRef<Txt>();
  yield view.add(
    <Txt
      ref={heading}
      text={title}
      fill={"#f4e6d0"}
      fontFamily={"Libre Baskerville, Georgia, serif"}
      fontSize={34}
      y={-280}
      opacity={0}
    />,
  );
  yield* heading().opacity(1, 0.3, easeOutCubic);

  const heights = [160, 220, 280, 200, 240, 180];
  for (let i = 0; i < events.length; i++) {
    const h = heights[i % heights.length];
    const x = -380 + i * 200;
    const col = createRef<Rect>();
    yield view.add(
      <Rect
        ref={col}
        width={140}
        height={1}
        fill={i % 2 ? accent : "#8b5a2b"}
        x={x}
        y={220}
        opacity={0.95}
        radius={4}
      />,
    );
    const year = createRef<Txt>();
    const name = createRef<Txt>();
    yield view.add(
      <Txt
        ref={year}
        text={events[i].label}
        fill={accent}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={13}
        x={x}
        y={-220}
        opacity={0}
        width={150}
        textAlign={"center"}
      />,
    );
    yield view.add(
      <Txt
        ref={name}
        text={events[i].title}
        fill={"#f4e6d0"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={18}
        fontWeight={700}
        x={x}
        y={260}
        opacity={0}
        width={150}
        textAlign={"center"}
        textWrap
      />,
    );
    yield* all(
      col().height(h, 0.45, easeOutBack),
      col().y(220 - h / 2, 0.45, easeOutBack),
      year().opacity(1, 0.3, easeOutCubic),
      name().opacity(1, 0.3, easeOutCubic),
    );
  }
  yield* waitFor(1.4);
}

/** Numbered journey steps with connectors. */
function* journeySteps(view: any) {
  const title = str("title", "How it unfolded");
  const accent = str("accent", "#c4f542");
  const bg = str("bg", "#0c140c");
  const events = parseEvents(
    str(
      "events",
      `01|Spark|The idea takes hold
02|Build|Institutions rise
03|Test|Crisis & resolve
04|Leap|A new chapter`,
    ),
    `01|Spark|The idea takes hold
02|Build|Institutions rise
03|Test|Crisis & resolve
04|Leap|A new chapter`,
  );

  view.fill(bg);
  const heading = createRef<Txt>();
  yield view.add(
    <Txt
      ref={heading}
      text={title}
      fill={"#e8f0ea"}
      fontFamily={"Libre Baskerville, Georgia, serif"}
      fontSize={34}
      y={-260}
      opacity={0}
    />,
  );
  yield* heading().opacity(1, 0.3, easeOutCubic);

  for (let i = 0; i < events.length; i++) {
    const x = -420 + i * 220;
    const badge = createRef<Rect>();
    const name = createRef<Txt>();
    const detail = createRef<Txt>();
    yield view.add(
      <Rect
        ref={badge}
        width={64}
        height={64}
        radius={32}
        fill={accent}
        x={x}
        y={-40}
        scale={0}
        layout
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Txt
          text={events[i].label || String(i + 1).padStart(2, "0")}
          fill={"#0c140c"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={20}
          fontWeight={700}
        />
      </Rect>,
    );
    yield view.add(
      <Txt
        ref={name}
        text={events[i].title}
        fill={"#f4f0e6"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={22}
        fontWeight={700}
        x={x}
        y={60}
        opacity={0}
      />,
    );
    yield view.add(
      <Txt
        ref={detail}
        text={events[i].detail}
        fill={"#9aa8b8"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={15}
        x={x}
        y={100}
        opacity={0}
        width={180}
        textAlign={"center"}
        textWrap
      />,
    );
    if (i < events.length - 1) {
      const dash = createRef<Rect>();
      yield view.add(
        <Rect
          ref={dash}
          width={0}
          height={3}
          fill={accent}
          x={x + 32}
          y={-40}
          opacity={0.7}
        />,
      );
      yield* all(
        badge().scale(1, 0.35, easeOutBack),
        name().opacity(1, 0.3, easeOutCubic),
        detail().opacity(1, 0.3, easeOutCubic),
        dash().width(140, 0.35, easeOutCubic),
        dash().x(x + 32 + 70, 0.35, easeOutCubic),
      );
    } else {
      yield* all(
        badge().scale(1, 0.35, easeOutBack),
        name().opacity(1, 0.3, easeOutCubic),
        detail().opacity(1, 0.3, easeOutCubic),
      );
    }
  }
  yield* waitFor(1.4);
}

/** Circular progress / completion bumper. */
function* progressRing(view: any) {
  const title = str("title", "Progress");
  const label = str("label", "Complete");
  const accent = str("accent", "#3dd6c6");
  const bg = str("bg", "#071018");
  const percent = Math.min(100, Math.max(0, num("percent", 72)));

  view.fill(bg);
  const ring = createRef<Rect>();
  const pct = createRef<Txt>();
  const heading = createRef<Txt>();
  const sub = createRef<Txt>();

  yield view.add(
    <Rect
      ref={ring}
      width={260}
      height={260}
      radius={130}
      stroke={"#1a2a38"}
      lineWidth={14}
      y={-20}
    />,
  );
  // Accent arc approximated as a growing wedge overlay via clipped rects
  const arc = createRef<Rect>();
  yield view.add(
    <Rect
      ref={arc}
      width={260}
      height={260}
      radius={130}
      stroke={accent}
      lineWidth={14}
      y={-20}
      opacity={0}
      scale={0.85}
    />,
  );
  yield view.add(
    <Txt
      ref={pct}
      text={"0%"}
      fill={"#ffffff"}
      fontFamily={"Libre Baskerville, Georgia, serif"}
      fontSize={64}
      fontWeight={700}
      y={-30}
      opacity={0}
    />,
  );
  yield view.add(
    <Txt
      ref={heading}
      text={title}
      fill={accent}
      fontFamily={"Libre Baskerville, Georgia, serif"}
      fontSize={18}
      letterSpacing={3}
      y={-280}
      opacity={0}
    />,
  );
  yield view.add(
    <Txt
      ref={sub}
      text={label}
      fill={"#9aa8b8"}
      fontFamily={"Libre Baskerville, Georgia, serif"}
      fontSize={20}
      y={160}
      opacity={0}
    />,
  );

  yield* all(
    heading().opacity(1, 0.3, easeOutCubic),
    pct().opacity(1, 0.3, easeOutCubic),
    arc().opacity(1, 0.4, easeOutCubic),
    arc().scale(1, 0.5, easeOutBack),
  );

  const steps = 20;
  for (let i = 1; i <= steps; i++) {
    const p = Math.round((percent * i) / steps);
    pct().text(`${p}%`);
    yield* waitFor(0.05);
  }
  yield* sub().opacity(1, 0.3, easeOutCubic);
  yield* waitFor(1.3);
}

/** Full-bleed chapter panels wipe in sequence (documentary chapters). */
function* chapterWipe(view: any) {
  const eyebrow = str("title", "Chapters");
  const accent = str("accent", "#ff6b4a");
  const events = parseEvents(str("events", DEFAULT_EVENTS), DEFAULT_EVENTS);
  const colors = ["#1a2433", "#2a1810", "#142418", "#1a1028", "#201810"];

  for (let i = 0; i < events.length; i++) {
    view.fill(colors[i % colors.length]);
    const panel = createRef<Rect>();
    const year = createRef<Txt>();
    const name = createRef<Txt>();
    const eye = createRef<Txt>();
    yield view.add(
      <Rect
        ref={panel}
        width={1280}
        height={720}
        fill={colors[i % colors.length]}
        x={i === 0 ? 0 : 1280}
      />,
    );
    if (i > 0) {
      yield* panel().x(0, 0.45, easeOutCubic);
    }
    yield view.add(
      <Txt
        ref={eye}
        text={`${eyebrow}  ·  ${i + 1}/${events.length}`}
        fill={accent}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={14}
        letterSpacing={3}
        x={-400}
        y={-220}
        opacity={0}
      />,
    );
    yield view.add(
      <Txt
        ref={year}
        text={events[i].label}
        fill={accent}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={28}
        letterSpacing={4}
        x={-400}
        y={-80}
        opacity={0}
      />,
    );
    yield view.add(
      <Txt
        ref={name}
        text={events[i].title}
        fill={"#ffffff"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={56}
        fontWeight={700}
        x={-400}
        y={0}
        opacity={0}
        width={700}
        textWrap
      />,
    );
    yield* all(
      eye().opacity(1, 0.25, easeOutCubic),
      year().opacity(1, 0.3, easeOutCubic),
      name().opacity(1, 0.35, easeOutCubic),
      year().x(-420, 0.4, easeOutCubic),
      name().x(-420, 0.4, easeOutCubic),
    );
    yield* waitFor(0.85);
  }
  yield* waitFor(0.6);
}

export function* runTimeline(view: any, template: string) {
  switch (template) {
    case "timeline-nodes":
      yield* horizontalNodes(view);
      break;
    case "timeline-vertical":
      yield* verticalSpine(view);
      break;
    case "timeline-year-scrub":
      yield* yearScrub(view);
      break;
    case "timeline-milestones":
      yield* milestoneCards(view);
      break;
    case "timeline-focus":
      yield* focusSpotlight(view);
      break;
    case "timeline-eras":
      yield* eraBlocks(view);
      break;
    case "timeline-journey":
      yield* journeySteps(view);
      break;
    case "timeline-ring":
      yield* progressRing(view);
      break;
    case "timeline-chapters":
    case "timeline-photo-chapters":
      yield* chapterWipe(view);
      break;
    default:
      yield* verticalSpine(view);
  }
}
