/** @jsxImportSource @revideo/2d/lib */
import {
  all,
  bigStat,
  createRef,
  easeOutBack,
  easeOutCubic,
  Layout,
  lowerThird,
  paperCard,
  Rect,
  str,
  titleSlam,
  Txt,
  waitFor,
} from "../../lib/helpers";

function* playStyle(
  view: any,
  style: string,
  p: {
    title: string;
    subtitle: string;
    body: string;
    value: string;
    eyebrow: string;
    accent: string;
    bg: string;
    category: string;
    id: string;
  },
) {
  if (style === "stat") {
    yield* bigStat(view, {
      label: p.eyebrow || p.subtitle,
      value: p.value || p.title,
      detail: p.subtitle,
      accent: p.accent,
      bg: p.bg,
    });
    return;
  }
  if (style === "lower") {
    yield* lowerThird(view, {
      name: p.title,
      title: p.subtitle,
      accent: p.accent,
      bg: p.bg,
    });
    return;
  }
  if (style === "paper" || style === "quote") {
    yield* paperCard(view, {
      eyebrow: p.eyebrow,
      body: style === "quote" ? `“${p.body || p.title}”` : p.body || p.title,
      highlight: p.subtitle,
      accent: p.accent,
      bg: p.bg,
    });
    return;
  }
  if (style === "fire") {
    yield* fireScene(view, p);
    return;
  }
  if (style === "timeline") {
    yield* timelineScene(view, p);
    return;
  }
  if (style === "map") {
    yield* mapScene(view, p);
    return;
  }
  if (style === "chart") {
    yield* chartScene(view, p);
    return;
  }
  if (style === "photo") {
    yield* photoScene(view, p);
    return;
  }
  if (style === "ui") {
    yield* uiScene(view, p);
    return;
  }
  if (style === "india") {
    yield* indiaScene(view, p);
    return;
  }
  yield* titleSlam(view, {
    eyebrow: p.eyebrow,
    title: p.title,
    subtitle: p.subtitle,
    accent: p.accent,
    bg: p.bg,
  });
}

function* fireScene(view: any, p: any) {
  view.fill(p.bg);
  const tongues = Array.from({ length: 7 }, () => createRef<Rect>());
  for (let i = 0; i < tongues.length; i++) {
    const w = 28 + (i % 3) * 10;
    yield view.add(
      <Rect
        ref={tongues[i]}
        width={w}
        height={80 + i * 12}
        fill={i % 2 ? p.accent : "#ffb703"}
        radius={40}
        x={-90 + i * 30}
        y={180}
        opacity={0}
      />,
    );
  }
  const title = createRef<Txt>();
  yield view.add(
    <Txt
      ref={title}
      text={p.title}
      fill={"#fff5e6"}
      fontFamily={"Libre Baskerville, Georgia, serif"}
      fontSize={42}
      fontWeight={700}
      y={-180}
      opacity={0}
    />,
  );
  yield* title().opacity(1, 0.35, easeOutCubic);
  for (let i = 0; i < tongues.length; i++) {
    yield* all(
      tongues[i]().opacity(0.85, 0.2, easeOutCubic),
      tongues[i]().y(120 - i * 8, 0.45, easeOutBack),
    );
  }
  for (let k = 0; k < 3; k++) {
    yield* all(
      ...tongues.map((t, i) =>
        t().height(90 + ((i + k) % 4) * 18, 0.25, easeOutCubic),
      ),
    );
  }
  if (p.subtitle) {
    const sub = createRef<Txt>();
    yield view.add(
      <Txt
        ref={sub}
        text={p.subtitle}
        fill={"#ffd6a5"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={20}
        y={260}
        opacity={0}
      />,
    );
    yield* sub().opacity(1, 0.35, easeOutCubic);
  }
  yield* waitFor(1.4);
}

function* timelineScene(view: any, p: any) {
  view.fill(p.bg);
  const rail = createRef<Rect>();
  yield view.add(
    <Rect ref={rail} width={0} height={4} fill={p.accent} y={40} opacity={0.9} />,
  );
  yield* rail().width(900, 0.8, easeOutCubic);
  const nodes = [ -300, -100, 100, 300 ];
  for (let i = 0; i < nodes.length; i++) {
    const n = createRef<Rect>();
    const label = createRef<Txt>();
    yield view.add(
      <Rect
        ref={n}
        width={18}
        height={18}
        radius={9}
        fill={p.accent}
        x={nodes[i]}
        y={40}
        scale={0}
      />,
    );
    yield view.add(
      <Txt
        ref={label}
        text={i === 0 ? p.title : `Step ${i + 1}`}
        fill={"#e8eef6"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={i === 0 ? 22 : 16}
        x={nodes[i]}
        y={i % 2 === 0 ? -40 : 100}
        opacity={0}
        width={180}
        textAlign={"center"}
        textWrap
      />,
    );
    yield* all(
      n().scale(1, 0.35, easeOutBack),
      label().opacity(1, 0.3, easeOutCubic),
    );
  }
  yield* waitFor(1.6);
}

function* mapScene(view: any, p: any) {
  view.fill(p.bg);
  const globe = createRef<Rect>();
  const arc = createRef<Rect>();
  const title = createRef<Txt>();
  yield view.add(
    <Rect
      ref={globe}
      width={320}
      height={320}
      radius={160}
      fill={"#123048"}
      stroke={p.accent}
      lineWidth={3}
      opacity={0}
      y={20}
    />,
  );
  yield view.add(
    <Rect
      ref={arc}
      width={0}
      height={4}
      fill={p.accent}
      y={-40}
      x={-80}
      radius={2}
    />,
  );
  yield view.add(
    <Txt
      ref={title}
      text={p.title}
      fill={"#e8f0ea"}
      fontFamily={"Libre Baskerville, Georgia, serif"}
      fontSize={36}
      fontWeight={700}
      x={-280}
      y={-220}
      opacity={0}
      width={500}
      textWrap
    />,
  );
  yield* all(
    globe().opacity(1, 0.5, easeOutCubic),
    title().opacity(1, 0.4, easeOutCubic),
  );
  yield* arc().width(220, 1.1, easeOutCubic);
  if (p.subtitle) {
    const sub = createRef<Txt>();
    yield view.add(
      <Txt
        ref={sub}
        text={p.subtitle}
        fill={p.accent}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={18}
        x={-280}
        y={-170}
        opacity={0}
      />,
    );
    yield* sub().opacity(1, 0.35, easeOutCubic);
  }
  yield* waitFor(1.5);
}

function* chartScene(view: any, p: any) {
  view.fill(p.bg);
  const title = createRef<Txt>();
  yield view.add(
    <Txt
      ref={title}
      text={p.title}
      fill={"#f4f0e6"}
      fontFamily={"Libre Baskerville, Georgia, serif"}
      fontSize={32}
      fontWeight={700}
      y={-240}
      opacity={0}
    />,
  );
  yield* title().opacity(1, 0.3, easeOutCubic);
  const heights = [120, 200, 160, 260, 180];
  for (let i = 0; i < heights.length; i++) {
    const bar = createRef<Rect>();
    yield view.add(
      <Rect
        ref={bar}
        width={70}
        height={1}
        fill={i % 2 ? p.accent : "#5ce1ff"}
        x={-200 + i * 100}
        y={200}
        radius={4}
      />,
    );
    yield* all(
      bar().height(heights[i], 0.35, easeOutBack),
      bar().y(200 - heights[i] / 2, 0.35, easeOutBack),
    );
  }
  yield* waitFor(1.6);
}

function* photoScene(view: any, p: any) {
  view.fill(p.bg);
  const frame = createRef<Rect>();
  const title = createRef<Txt>();
  yield view.add(
    <Rect
      ref={frame}
      width={640}
      height={360}
      fill={"#1a2a28"}
      stroke={p.accent}
      lineWidth={2}
      y={20}
      scale={1.08}
      opacity={0}
    />,
  );
  yield view.add(
    <Txt
      ref={title}
      text={p.title}
      fill={"#f4f0e6"}
      fontFamily={"Libre Baskerville, Georgia, serif"}
      fontSize={34}
      fontWeight={700}
      y={-240}
      opacity={0}
    />,
  );
  yield* all(
    frame().opacity(1, 0.45, easeOutCubic),
    frame().scale(1, 2.2, easeOutCubic),
    title().opacity(1, 0.4, easeOutCubic),
  );
  yield* waitFor(1.4);
}

function* uiScene(view: any, p: any) {
  view.fill(p.bg);
  if (p.id.includes("ticker") || p.id.includes("news-ticker")) {
    const strip = createRef<Rect>();
    const txt = createRef<Txt>();
    yield view.add(
      <Rect ref={strip} width={1280} height={56} fill={p.accent} y={280} x={400} />,
    );
    yield view.add(
      <Txt
        ref={txt}
        text={p.title + "   ·   " + p.subtitle}
        fill={"#0a0c12"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={22}
        fontWeight={700}
        y={280}
        x={400}
      />,
    );
    yield* all(
      strip().x(0, 1.2, easeOutCubic),
      txt().x(0, 1.2, easeOutCubic),
    );
    yield* waitFor(1.5);
    return;
  }
  if (p.id.includes("bullet")) {
    const lines = [p.title, p.subtitle, p.body].filter(Boolean);
    for (let i = 0; i < Math.min(lines.length, 4); i++) {
      const row = createRef<Layout>();
      yield view.add(
        <Layout
          ref={row}
          layout
          direction={"row"}
          gap={16}
          alignItems={"center"}
          x={-200}
          y={-80 + i * 70}
          opacity={0}
        >
          <Rect width={14} height={14} fill={p.accent} radius={7} />
          <Txt
            text={lines[i]}
            fill={"#f4f0e6"}
            fontFamily={"Libre Baskerville, Georgia, serif"}
            fontSize={28}
            width={700}
            textWrap
          />
        </Layout>,
      );
      yield* all(
        row().opacity(1, 0.3, easeOutCubic),
        row().x(-160, 0.4, easeOutCubic),
      );
    }
    yield* waitFor(1.4);
    return;
  }
  const btn = createRef<Rect>();
  yield view.add(
    <Rect
      ref={btn}
      width={280}
      height={64}
      fill={p.accent}
      radius={8}
      layout
      alignItems={"center"}
      justifyContent={"center"}
      scale={0.7}
      opacity={0}
    >
      <Txt
        text={p.title}
        fill={"#0a0c12"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={22}
        fontWeight={700}
      />
    </Rect>,
  );
  yield* all(
    btn().opacity(1, 0.35, easeOutCubic),
    btn().scale(1, 0.55, easeOutBack),
  );
  yield* waitFor(1.8);
}

function* indiaScene(view: any, p: any) {
  view.fill(p.bg);
  const saffron = createRef<Rect>();
  const white = createRef<Rect>();
  const green = createRef<Rect>();
  const chakra = createRef<Rect>();
  const title = createRef<Txt>();
  yield view.add(<Rect ref={saffron} width={0} height={70} fill={"#FF9933"} y={-70} />);
  yield view.add(<Rect ref={white} width={0} height={70} fill={"#ffffff"} y={0} />);
  yield view.add(<Rect ref={green} width={0} height={70} fill={"#138808"} y={70} />);
  yield view.add(
    <Rect
      ref={chakra}
      width={48}
      height={48}
      radius={24}
      stroke={"#000080"}
      lineWidth={3}
      y={0}
      scale={0}
    />,
  );
  yield view.add(
    <Txt
      ref={title}
      text={p.title}
      fill={"#f4f0e6"}
      fontFamily={"Libre Baskerville, Georgia, serif"}
      fontSize={36}
      fontWeight={700}
      y={-220}
      opacity={0}
    />,
  );
  yield* title().opacity(1, 0.3, easeOutCubic);
  yield* all(
    saffron().width(720, 0.45, easeOutCubic),
    white().width(720, 0.45, easeOutCubic),
    green().width(720, 0.45, easeOutCubic),
  );
  yield* chakra().scale(1, 0.45, easeOutBack);
  yield* waitFor(1.6);
}

export function* runCharts(view: any, template: string) {
  switch (template) {
    case "stat-counter": {
      const accent = str("accent", "#d8a11a");
      const bg = str("bg", "#0a0c12");
      const title = str("label", "People affected");
      const subtitle = str("subtitle", "Counting number with a note line and highlight.");
      const body = str("text", "People affected");
      const value = str("value", "75");
      const eyebrow = str("eyebrow", "CHARTS");
      yield* playStyle(view, "stat", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "charts",
        id: "stat-counter",
      });
      break;
    }
    case "d3-pie": {
      const accent = str("accent", "#d8a11a");
      const bg = str("bg", "#0a0c12");
      const title = str("title", "Budget allocation");
      const subtitle = str("subtitle", "Accurate multi-slice pie built with d3-shape / d3-scale.");
      const body = str("text", "Budget allocation");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "CHARTS");
      yield* playStyle(view, "chart", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "charts",
        id: "d3-pie",
      });
      break;
    }
    case "d3-donut": {
      const accent = str("accent", "#5ce1ff");
      const bg = str("bg", "#0a0c12");
      const title = str("title", "Share of total");
      const subtitle = str("subtitle", "Configurable donut slices powered by D3 pie layout.");
      const body = str("text", "Share of total");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "CHARTS");
      yield* playStyle(view, "chart", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "charts",
        id: "d3-donut",
      });
      break;
    }
    case "d3-bar": {
      const accent = str("accent", "#d8a11a");
      const bg = str("bg", "#0a0c12");
      const title = str("title", "Year-over-year growth");
      const subtitle = str("subtitle", "Vertical bars with D3 band/linear scales and value labels.");
      const body = str("text", "Year-over-year growth");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "CHARTS");
      yield* playStyle(view, "chart", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "charts",
        id: "d3-bar",
      });
      break;
    }
    case "d3-hbar": {
      const accent = str("accent", "#5ce1ff");
      const bg = str("bg", "#0a0c12");
      const title = str("title", "Category ranking");
      const subtitle = str("subtitle", "Ranking-style horizontal bar chart with D3 scales.");
      const body = str("text", "Category ranking");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "CHARTS");
      yield* playStyle(view, "chart", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "charts",
        id: "d3-hbar",
      });
      break;
    }
    case "d3-line": {
      const accent = str("accent", "#5ce1ff");
      const bg = str("bg", "#0a0c12");
      const title = str("title", "Trend over time");
      const subtitle = str("subtitle", "Animated stroke draw along a D3 monotone curve.");
      const body = str("text", "Trend over time");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "CHARTS");
      yield* playStyle(view, "chart", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "charts",
        id: "d3-line",
      });
      break;
    }
    case "d3-area": {
      const accent = str("accent", "#7ddea2");
      const bg = str("bg", "#0a0c12");
      const title = str("title", "Area trend");
      const subtitle = str("subtitle", "Filled area trend using D3 area + line generators.");
      const body = str("text", "Area trend");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "CHARTS");
      yield* playStyle(view, "chart", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "charts",
        id: "d3-area",
      });
      break;
    }
    case "d3-grouped-bar": {
      const accent = str("accent", "#d8a11a");
      const bg = str("bg", "#0a0c12");
      const title = str("title", "Urban vs rural");
      const subtitle = str("subtitle", "Multi-series grouped bars — edit series in a simple table.");
      const body = str("text", "Urban vs rural");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "CHARTS");
      yield* playStyle(view, "chart", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "charts",
        id: "d3-grouped-bar",
      });
      break;
    }
    case "d3-stacked-bar": {
      const accent = str("accent", "#c089ff");
      const bg = str("bg", "#0a0c12");
      const title = str("title", "Stacked composition");
      const subtitle = str("subtitle", "Stacked composition chart using d3.stack().");
      const body = str("text", "Stacked composition");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "CHARTS");
      yield* playStyle(view, "chart", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "charts",
        id: "d3-stacked-bar",
      });
      break;
    }
    case "d3-multi-line": {
      const accent = str("accent", "#ff8b7a");
      const bg = str("bg", "#0a0c12");
      const title = str("title", "Comparing trends");
      const subtitle = str("subtitle", "Compare multiple series with animated D3 line paths.");
      const body = str("text", "Comparing trends");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "CHARTS");
      yield* playStyle(view, "chart", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "charts",
        id: "d3-multi-line",
      });
      break;
    }
    case "d3-gauge": {
      const accent = str("accent", "#d8a11a");
      const bg = str("bg", "#0a0c12");
      const title = str("title", "Completion");
      const subtitle = str("subtitle", "Arc gauge for a single percentage KPI.");
      const body = str("text", "Completion");
      const value = str("value", "72");
      const eyebrow = str("eyebrow", "CHARTS");
      yield* playStyle(view, "stat", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "charts",
        id: "d3-gauge",
      });
      break;
    }
    case "timeline": {
      const accent = str("accent", "#d8a11a");
      const bg = str("bg", "#0a0c12");
      const title = str("title", "Timeline scrub");
      const subtitle = str("subtitle", "Three-beat timeline for policy or product history.");
      const body = str("text", "Three-beat timeline for policy or product history.");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "CHARTS");
      yield* playStyle(view, "timeline", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "charts",
        id: "timeline",
      });
      break;
    }
    default: {
      yield* titleSlam(view, {
        eyebrow: "CHARTS",
        title: str("title", "BestMotions"),
        subtitle: str("subtitle", ""),
        accent: str("accent", "#e63946"),
        bg: str("bg", "#0a0c12"),
      });
    }
  }
}
