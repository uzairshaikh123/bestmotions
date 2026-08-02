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

export function* runNewspaper(view: any, template: string) {
  switch (template) {
    case "news-slide-highlight": {
      const accent = str("accent", "#f5d76e");
      const bg = str("bg", "#0a0c12");
      const title = str("headline", "A defining moment for the nation");
      const subtitle = str("subtitle", "Paper flies in (VOX-style), then a marker paints across your chosen phrase.");
      const body = str("body", "In a landmark development, leaders gathered as history turned a new page. Analysts say the decision will reshape the decade ahead.");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "paper", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-slide-highlight",
      });
      break;
    }
    case "news-red-circle": {
      const accent = str("accent", "#d62828");
      const bg = str("bg", "#0a0c12");
      const title = str("headline", "Growth hits a historic high this quarter");
      const subtitle = str("subtitle", "Newsprint page with a hand-drawn red circle around a key phrase.");
      const body = str("body", "Markets reacted sharply as numbers crossed every forecast. Experts call it a generational shift.");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "paper", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-red-circle",
      });
      break;
    }
    case "news-draw-line": {
      const accent = str("accent", "#1b4dff");
      const bg = str("bg", "#0a0c12");
      const title = str("headline", "The road ahead will not be easy");
      const subtitle = str("subtitle", "Hand-drawn underline, marker wash, or strike-through on editorial text.");
      const body = str("text", "The road ahead will not be easy");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "paper", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-draw-line",
      });
      break;
    }
    case "news-clip-zoom": {
      const accent = str("accent", "#ffe566");
      const bg = str("bg", "#0a0c12");
      const title = str("headline", "Record turnout at the polls today");
      const subtitle = str("subtitle", "Slow zoom into a clipping while the marker sweeps the key words.");
      const body = str("text", "Record turnout at the polls today");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "paper", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-clip-zoom",
      });
      break;
    }
    case "news-front-page": {
      const accent = str("accent", "#c1121f");
      const bg = str("bg", "#0a0c12");
      const title = str("headline", "Parliament clears landmark bill");
      const subtitle = str("subtitle", "Two-column front page with a slamming BREAKING stamp.");
      const body = str("text", "Parliament clears landmark bill");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "paper", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-front-page",
      });
      break;
    }
    case "news-photo-caption": {
      const accent = str("accent", "#e63946");
      const bg = str("bg", "#0a0c12");
      const title = str("title", "Photo caption underline");
      const subtitle = str("caption", "Crowds gather as results are announced late into the night.");
      const body = str("text", "News photo with caption and an animated draw-line under a phrase.");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "paper", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-photo-caption",
      });
      break;
    }
    case "news-headline-stack": {
      const accent = str("accent", "#c1121f");
      const bg = str("bg", "#0a0c12");
      const title = str("title", "In the papers");
      const subtitle = str("subtitle", "Three clipped headlines slam in with sequential rule lines.");
      const body = str("line1", "Markets surge on reform news");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "paper", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-headline-stack",
      });
      break;
    }
    case "news-magnifier": {
      const accent = str("accent", "#ffb703");
      const bg = str("bg", "#0a0c12");
      const title = str("title", "Magnifier reveal");
      const subtitle = str("subtitle", "Lens sweeps the page while a phrase gets a marker wash.");
      const body = str("body", "The committee noted that infrastructure, education and health must move together if the gains are to last. Growth without inclusion, they warned, would leave the story unfinished.");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "paper", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-magnifier",
      });
      break;
    }
    case "news-quote-box": {
      const accent = str("accent", "#1d3557");
      const bg = str("bg", "#0a0c12");
      const title = str("title", "Quote box draw");
      const subtitle = str("attribution", "— Anonymous editorial");
      const body = str("quote", "History is written by those who show up.");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "quote", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-quote-box",
      });
      break;
    }
    case "news-ultra-front": {
      const accent = str("accent", "#ffe566");
      const bg = str("bg", "#0a0c12");
      const title = str("headline", "Historic turnout reshapes the political map overnight");
      const subtitle = str("caption", "Supporters gather outside the counting centre late into the night.");
      const body = str("text", "Historic turnout reshapes the political map overnight");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "paper", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-ultra-front",
      });
      break;
    }
    case "news-ultra-fold": {
      const accent = str("accent", "#f5d76e");
      const bg = str("bg", "#0a0c12");
      const title = str("headline", "Secrets buried in the archives finally surface");
      const subtitle = str("subtitle", "3D fold/unroll onto the desk, then marker paints the phrase.");
      const body = str("body", "A newly released cache of documents is forcing a rewrite of the official narrative. Investigators say the trail runs through offices that once denied any link.");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "paper", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-ultra-fold",
      });
      break;
    }
    case "news-ultra-push": {
      const accent = str("accent", "#ffe566");
      const bg = str("bg", "#0a0c12");
      const title = str("headline", "Record crowds demand answers at the gates");
      const subtitle = str("subtitle", "Slow Ken-Burns push into newsprint while the marker sweeps.");
      const body = str("body", "From dawn the avenues filled. Chants rolled between buildings as marshals struggled to keep corridors open for emergency vehicles.");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "paper", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-ultra-push",
      });
      break;
    }
    case "news-ultra-extra": {
      const accent = str("accent", "#b00000");
      const bg = str("bg", "#0a0c12");
      const title = str("headline", "Breaking developments overnight stun the capital");
      const subtitle = str("subtitle", "Broadsheet with slamming EXTRA banner + headline highlight.");
      const body = str("text", "Breaking developments overnight stun the capital");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "paper", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-ultra-extra",
      });
      break;
    }
    case "news-ultra-stack": {
      const accent = str("accent", "#f5d76e");
      const bg = str("bg", "#0a0c12");
      const title = str("headline", "The story they tried to bury is now on every desk");
      const subtitle = str("subtitle", "Stack of aged papers; top sheet slides in with highlight.");
      const body = str("text", "The story they tried to bury is now on every desk");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "paper", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-ultra-stack",
      });
      break;
    }
    case "news-ultra-letterpress": {
      const accent = str("accent", "#1d4ed8");
      const bg = str("bg", "#0a0c12");
      const title = str("headline", "Truth does not fear the printing press");
      const subtitle = str("subtitle", "Letterpress headline with hand-ink underline draw.");
      const body = str("body", "In an age of noise, the printed word still demands we slow down and look closer. That discipline is not nostalgia — it is accountability.");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "paper", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-ultra-letterpress",
      });
      break;
    }
    case "news-ultra-spread": {
      const accent = str("accent", "#8b1e1e");
      const bg = str("bg", "#0a0c12");
      const title = str("title", "Ultra two-page spread");
      const subtitle = str("subtitle", "Open newspaper spread with left photo story + right column.");
      const body = str("text", "Open newspaper spread with left photo story + right column.");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "paper", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-ultra-spread",
      });
      break;
    }
    case "news-ultra-circle": {
      const accent = str("accent", "#c1121f");
      const bg = str("bg", "#0a0c12");
      const title = str("headline", "Growth hits a historic high this quarter");
      const subtitle = str("subtitle", "Aged newsprint with a realistic hand-drawn red circle.");
      const body = str("body", "Markets reacted sharply as numbers crossed every forecast. Experts call it a generational shift.");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "paper", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-ultra-circle",
      });
      break;
    }
    case "news-ultra-torn": {
      const accent = str("accent", "#c8f542");
      const bg = str("bg", "#0a0c12");
      const title = str("headline", "Newspaper effect that looks hand-torn");
      const subtitle = str("caption", "Archive photo");
      const body = str("body", "Editors love this beat: a clipped story with ragged edges, sitting above a dark grid like it was ripped from the morning edition.");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "paper", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-ultra-torn",
      });
      break;
    }
    case "news-ultra-torn-reveal": {
      const accent = str("accent", "#ffe566");
      const bg = str("bg", "#0a0c12");
      const title = str("headline", "Ripped from today's front page");
      const subtitle = str("subtitle", "Clipping tears open left→right with a jagged edge, then marker highlights.");
      const body = str("body", "A slow tear reveals the clipping — not a hard rectangular wipe, but an uneven edge the way fingers would pull newsprint apart.");
      const value = str("value", "42");
      const eyebrow = str("eyebrow", "NEWSPAPER");
      yield* playStyle(view, "paper", {
        title, subtitle, body, value, eyebrow, accent, bg,
        category: "newspaper",
        id: "news-ultra-torn-reveal",
      });
      break;
    }
    default: {
      yield* titleSlam(view, {
        eyebrow: "NEWSPAPER",
        title: str("title", "BestMotions"),
        subtitle: str("subtitle", ""),
        accent: str("accent", "#e63946"),
        bg: str("bg", "#0a0c12"),
      });
    }
  }
}
