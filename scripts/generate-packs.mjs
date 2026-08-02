/**
 * Generates Revideo pack runners from recovered-assets.json.
 * Each asset id gets a distinct motion using shared primitives.
 */
import fs from "fs";

const data = JSON.parse(
  fs.readFileSync("scripts/recovered-assets.json", "utf8"),
);

const byCat = {};
for (const a of data.assets) {
  (byCat[a.category] ||= []).push(a);
}
// globe-spin is 3d — fold into maps pack
if (byCat["3d"]) {
  byCat.maps = [...(byCat.maps || []), ...byCat["3d"]];
}

const PACKS = {
  fire: "runFire",
  yt: "runYt",
  text: "runText",
  ui: "runUi",
  newspaper: "runNewspaper",
  timeline: "runTimeline",
  india: "runIndia",
  shorts: "runShorts",
  maps: "runMaps",
  charts: "runCharts",
  photos: "runPhotos",
};

function styleFor(asset) {
  const id = asset.id;
  const hint = (asset.templateHint || "").toLowerCase();
  const name = (asset.name || "").toLowerCase();
  if (/stat|counter|rupee|score|meter|rank|gauge|progress/.test(id + hint + name))
    return "stat";
  if (/quote|callout/.test(id + hint + name)) return "quote";
  if (/lower|person|card|cite/.test(id + hint + name)) return "lower";
  if (/paper|news|page|spread|clip|torn|letter|edition|front/.test(id + hint))
    return "paper";
  if (/fire|ember|flame|candle|match|inferno|burn|heat|explosion/.test(id + hint))
    return "fire";
  if (/timeline|rail|node|milestone|journey|era|year/.test(id + hint + name))
    return "timeline";
  if (/map|globe|route|country|zoom|spotlight|airplane/.test(id + hint))
    return "map";
  if (/chart|bar|line|donut|pie|area|stacked|grouped/.test(id + hint))
    return "chart";
  if (/photo|ken|before|after|montage|portrait/.test(id + hint))
    return "photo";
  if (/ticker|bullet|logo|cta|button/.test(id + hint)) return "ui";
  if (/chakra|tricolor|flag|preamble|india|festival/.test(id + hint))
    return "india";
  return "title";
}

function genCase(asset) {
  const style = styleFor(asset);
  const d = asset.defaults || {};
  const titleKey =
    ["title", "coverTitle", "name", "headline", "text", "claim", "label"].find(
      (k) => k in d,
    ) || "title";
  const subKey =
    ["subtitle", "detail", "author", "title", "caption", "attribution"].find(
      (k) => k in d && k !== titleKey,
    ) || "subtitle";
  const bodyKey =
    ["body", "pageText", "quote", "text", "detail", "leftPage", "line1"].find(
      (k) => k in d,
    ) || "text";
  const valueKey =
    ["value", "stat", "number", "count", "amount", "score"].find((k) => k in d) ||
    "value";

  const titleDefault = JSON.stringify(String(d[titleKey] ?? asset.name));
  const subDefault = JSON.stringify(String(d[subKey] ?? asset.description));
  const bodyDefault = JSON.stringify(
    String(d[bodyKey] ?? d[titleKey] ?? asset.description),
  );
  const valueDefault = JSON.stringify(String(d[valueKey] ?? "42"));
  const accentDefault = JSON.stringify(String(d.accent ?? asset.accent ?? "#e63946"));
  const bgDefault = JSON.stringify(String(d.bg ?? "#0a0c12"));
  const eyebrowDefault = JSON.stringify(
    String(d.eyebrow ?? d.chapter ?? asset.category.toUpperCase()),
  );

  return `    case ${JSON.stringify(asset.id)}: {
      const accent = str("accent", ${accentDefault});
      const bg = str("bg", ${bgDefault});
      const title = str(${JSON.stringify(titleKey)}, ${titleDefault});
      const subtitle = str(${JSON.stringify(subKey)}, ${subDefault});
      const body = str(${JSON.stringify(bodyKey)}, ${bodyDefault});
      const value = str(${JSON.stringify(valueKey)}, ${valueDefault});
      const eyebrow = str("eyebrow", ${eyebrowDefault});
      yield* playStyle(view, ${JSON.stringify(style)}, {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: ${JSON.stringify(asset.category)},
        id: ${JSON.stringify(asset.id)},
      });
      break;
    }`;
}

function packSource(cat, fnName, assets) {
  const cases = assets.map(genCase).join("\n");
  return `/** @jsxImportSource @revideo/2d/lib */
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
      body: style === "quote" ? \`“\${p.body || p.title}”\` : p.body || p.title,
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
        text={i === 0 ? p.title : \`Step \${i + 1}\`}
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

export function* ${fnName}(view: any, template: string) {
  switch (template) {
${cases}
    default: {
      yield* titleSlam(view, {
        eyebrow: ${JSON.stringify(cat.toUpperCase())},
        title: str("title", "BestMotions"),
        subtitle: str("subtitle", ""),
        accent: str("accent", "#e63946"),
        bg: str("bg", "#0a0c12"),
      });
    }
  }
}
`;
}

fs.mkdirSync("revideo/scenes/packs", { recursive: true });

for (const [cat, fn] of Object.entries(PACKS)) {
  const assets = byCat[cat] || [];
  if (!assets.length) {
    console.warn("no assets for", cat);
    continue;
  }
  const src = packSource(cat, fn, assets);
  fs.writeFileSync(`revideo/scenes/packs/${cat}.tsx`, src);
  console.log(cat, assets.length, "templates");
}

console.log("done");
