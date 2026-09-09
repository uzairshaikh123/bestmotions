/** @jsxImportSource @revideo/2d/lib */
import { Layout, Rect, Txt } from "@revideo/2d";
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  str,
  waitFor,
} from "../../lib/helpers";
import { pause, timing } from "../../lib/timing";
import {
  parseComposeJson,
  type ComposeBeat,
  type CompositionSpec,
} from "../../../shared/ai/compose";

const SERIF = "Libre Baskerville, Georgia, serif";
const SANS = "Plus Jakarta Sans, Segoe UI, sans-serif";

function* clearLayer(layer: any) {
  for (const child of [...layer().children()]) {
    child.remove();
  }
}

function* hold(seconds: number) {
  yield* waitFor(Math.max(0.2, seconds));
}

function* fadeIn(node: { opacity: (v: number, d?: number, e?: any) => any }, duration = 0.35) {
  node.opacity(0);
  yield* node.opacity(1, duration, easeOutCubic);
}

export function* runAiCompose(view: any) {
  const spec = parseComposeJson(str("composeJson", ""));
  const accent = str("accent", spec.accent) || spec.accent;
  const bg = str("bg", spec.bg) || spec.bg;
  const ink = str("ink", spec.ink || "#f4f0e6") || spec.ink || "#f4f0e6";
  const muted =
    str("muted", spec.muted || "rgba(244,240,230,0.62)") ||
    spec.muted ||
    "rgba(244,240,230,0.62)";
  const resolved: CompositionSpec = {
    ...spec,
    accent,
    bg,
    ink,
    muted,
  };

  view.fill(resolved.bg);
  const stage = createRef<Layout>();
  yield view.add(
    <Layout ref={stage} width={1180} height={640} x={0} y={0} />,
  );

  const t = timing();
  yield* pause(t.startDelay);

  for (const beat of resolved.beats) {
    yield* clearLayer(stage);
    yield* playBeat(stage(), beat, resolved, t.revealDuration);
  }
}

function* playBeat(
  stage: any,
  beat: ComposeBeat,
  spec: CompositionSpec,
  reveal: number,
) {
  switch (beat.type) {
    case "title":
      yield* playTitle(stage, beat, spec, reveal);
      break;
    case "bullets":
      yield* playBullets(stage, beat, spec, reveal);
      break;
    case "stats":
      yield* playStats(stage, beat, spec, reveal);
      break;
    case "bars":
      yield* playBars(stage, beat, spec, reveal);
      break;
    case "cards":
      yield* playCards(stage, beat, spec, reveal);
      break;
    case "timeline":
      yield* playTimeline(stage, beat, spec, reveal);
      break;
    case "quote":
      yield* playQuote(stage, beat, spec, reveal);
      break;
    case "compare":
      yield* playCompare(stage, beat, spec, reveal);
      break;
    case "outro":
      yield* playOutro(stage, beat, spec, reveal);
      break;
    case "year_flip":
      yield* playYearFlip(stage, beat, spec, reveal);
      break;
  }
}

function* playTitle(
  stage: any,
  beat: Extract<ComposeBeat, { type: "title" }>,
  spec: CompositionSpec,
  reveal: number,
) {
  const root = createRef<Layout>();
  const bar = createRef<Rect>();
  yield stage.add(
    <Layout
      ref={root}
      layout
      direction={"column"}
      gap={18}
      alignItems={"start"}
      x={-220}
      y={10}
      width={780}
      opacity={0}
    >
      <Rect ref={bar} width={4} height={0} fill={spec.accent} radius={2} />
      {beat.eyebrow ? (
        <Txt
          text={beat.eyebrow.toUpperCase()}
          fill={spec.accent}
          fontFamily={SANS}
          fontSize={14}
          letterSpacing={4}
          fontWeight={700}
        />
      ) : null}
      <Txt
        text={beat.title}
        fill={spec.ink}
        fontFamily={SERIF}
        fontSize={52}
        fontWeight={700}
        textWrap
        width={760}
      />
      {beat.subtitle ? (
        <Txt
          text={beat.subtitle}
          fill={spec.muted}
          fontFamily={SANS}
          fontSize={22}
          textWrap
          width={700}
        />
      ) : null}
    </Layout>,
  );
  yield* all(
    fadeIn(root(), reveal),
    bar().height(72, reveal, easeOutCubic),
  );
  yield* hold(1.6);
}

function* playBullets(
  stage: any,
  beat: Extract<ComposeBeat, { type: "bullets" }>,
  spec: CompositionSpec,
  reveal: number,
) {
  const root = createRef<Layout>();
  yield stage.add(
    <Layout
      ref={root}
      layout
      direction={"column"}
      gap={16}
      x={-200}
      y={-40}
      width={820}
      opacity={0}
    >
      {beat.title ? (
        <Txt
          text={beat.title}
          fill={spec.ink}
          fontFamily={SERIF}
          fontSize={34}
          fontWeight={700}
        />
      ) : null}
    </Layout>,
  );
  yield* fadeIn(root(), reveal);

  for (const item of beat.items) {
    const row = createRef<Layout>();
    yield root().add(
      <Layout ref={row} layout direction={"row"} gap={14} alignItems={"center"} opacity={0}>
        <Rect width={10} height={10} fill={spec.accent} radius={5} />
        <Txt
          text={item}
          fill={spec.ink}
          fontFamily={SANS}
          fontSize={24}
          textWrap
          width={760}
        />
      </Layout>,
    );
    yield* fadeIn(row(), 0.28);
    yield* hold(0.28);
  }
  yield* hold(0.9);
}

function* playStats(
  stage: any,
  beat: Extract<ComposeBeat, { type: "stats" }>,
  spec: CompositionSpec,
  reveal: number,
) {
  const root = createRef<Layout>();
  yield stage.add(
    <Layout
      ref={root}
      layout
      direction={"column"}
      gap={22}
      alignItems={"center"}
      y={-20}
      opacity={0}
    >
      {beat.title ? (
        <Txt
          text={beat.title}
          fill={spec.ink}
          fontFamily={SERIF}
          fontSize={30}
          fontWeight={700}
        />
      ) : null}
      <Layout layout direction={"row"} gap={28}>
        {beat.items.map((item) => (
          <Layout
            layout
            direction={"column"}
            gap={8}
            alignItems={"center"}
            width={200}
          >
            <Txt
              text={item.value}
              fill={spec.accent}
              fontFamily={SERIF}
              fontSize={42}
              fontWeight={700}
            />
            <Txt
              text={item.label}
              fill={spec.muted}
              fontFamily={SANS}
              fontSize={16}
              textAlign={"center"}
              textWrap
              width={180}
            />
          </Layout>
        ))}
      </Layout>
    </Layout>,
  );
  yield* fadeIn(root(), reveal);
  yield* hold(1.8);
}

function* playBars(
  stage: any,
  beat: Extract<ComposeBeat, { type: "bars" }>,
  spec: CompositionSpec,
  reveal: number,
) {
  const max = Math.max(1, ...beat.items.map((i) => i.value));
  const root = createRef<Layout>();
  yield stage.add(
    <Layout
      ref={root}
      layout
      direction={"column"}
      gap={18}
      x={-240}
      y={-30}
      width={900}
      opacity={0}
    >
      {beat.title ? (
        <Txt
          text={beat.title}
          fill={spec.ink}
          fontFamily={SERIF}
          fontSize={30}
          fontWeight={700}
        />
      ) : null}
    </Layout>,
  );
  yield* fadeIn(root(), reveal);

  const anims = [];
  for (const item of beat.items) {
    const fill = createRef<Rect>();
    const width = Math.max(24, (item.value / max) * 620);
    yield root().add(
      <Layout layout direction={"row"} gap={14} alignItems={"center"}>
        <Txt
          text={item.label}
          fill={spec.muted}
          fontFamily={SANS}
          fontSize={18}
          width={160}
        />
        <Layout width={640} height={22}>
          <Rect width={640} height={22} fill={"rgba(255,255,255,0.08)"} radius={8} />
          <Rect ref={fill} width={0} height={22} fill={spec.accent} radius={8} />
        </Layout>
        <Txt
          text={String(item.value)}
          fill={spec.ink}
          fontFamily={SANS}
          fontSize={18}
          fontWeight={700}
        />
      </Layout>,
    );
    anims.push(fill().width(width, 0.55, easeOutCubic));
  }
  yield* all(...anims);
  yield* hold(1.2);
}

function* playCards(
  stage: any,
  beat: Extract<ComposeBeat, { type: "cards" }>,
  spec: CompositionSpec,
  reveal: number,
) {
  const root = createRef<Layout>();
  yield stage.add(
    <Layout
      ref={root}
      layout
      direction={"column"}
      gap={18}
      alignItems={"center"}
      y={-10}
      opacity={0}
    >
      {beat.title ? (
        <Txt
          text={beat.title}
          fill={spec.ink}
          fontFamily={SERIF}
          fontSize={30}
          fontWeight={700}
        />
      ) : null}
      <Layout layout direction={"row"} gap={16}>
        {beat.items.map((item) => (
          <Layout layout direction={"column"} gap={10} width={240}>
            <Rect width={240} height={168} fill={"rgba(255,255,255,0.06)"} radius={14} />
            <Layout layout direction={"column"} gap={10} width={200} x={20} y={-148}>
              <Rect width={36} height={3} fill={spec.accent} />
              <Txt
                text={item.title}
                fill={spec.ink}
                fontFamily={SERIF}
                fontSize={22}
                fontWeight={700}
                textWrap
                width={200}
              />
              <Txt
                text={item.body}
                fill={spec.muted}
                fontFamily={SANS}
                fontSize={16}
                textWrap
                width={200}
              />
            </Layout>
          </Layout>
        ))}
      </Layout>
    </Layout>,
  );
  yield* root().opacity(1, reveal, easeOutCubic);
  yield* root().scale(0.96, 0).to(1, reveal, easeOutBack);
  yield* hold(1.8);
}

function* playTimeline(
  stage: any,
  beat: Extract<ComposeBeat, { type: "timeline" }>,
  spec: CompositionSpec,
  reveal: number,
) {
  const root = createRef<Layout>();
  yield stage.add(
    <Layout
      ref={root}
      layout
      direction={"column"}
      gap={14}
      x={-260}
      y={-40}
      width={920}
      opacity={0}
    >
      {beat.title ? (
        <Txt
          text={beat.title}
          fill={spec.ink}
          fontFamily={SERIF}
          fontSize={30}
          fontWeight={700}
        />
      ) : null}
    </Layout>,
  );
  yield* fadeIn(root(), reveal);

  for (const item of beat.items) {
    const row = createRef<Layout>();
    yield root().add(
      <Layout ref={row} layout direction={"row"} gap={18} opacity={0}>
        <Txt
          text={item.when}
          fill={spec.accent}
          fontFamily={SANS}
          fontSize={18}
          fontWeight={700}
          width={110}
        />
        <Rect width={3} height={42} fill={spec.accent} radius={2} />
        <Layout layout direction={"column"} gap={4} width={720}>
          <Txt
            text={item.label}
            fill={spec.ink}
            fontFamily={SERIF}
            fontSize={22}
            fontWeight={700}
          />
          {item.detail ? (
            <Txt
              text={item.detail}
              fill={spec.muted}
              fontFamily={SANS}
              fontSize={16}
              textWrap
              width={700}
            />
          ) : null}
        </Layout>
      </Layout>,
    );
    yield* fadeIn(row(), 0.28);
    yield* hold(0.3);
  }
  yield* hold(0.9);
}

function* playQuote(
  stage: any,
  beat: Extract<ComposeBeat, { type: "quote" }>,
  spec: CompositionSpec,
  reveal: number,
) {
  const root = createRef<Layout>();
  yield stage.add(
    <Layout
      ref={root}
      layout
      direction={"column"}
      gap={18}
      alignItems={"center"}
      width={900}
      opacity={0}
    >
      <Txt text={"“"} fill={spec.accent} fontFamily={SERIF} fontSize={72} />
      <Txt
        text={beat.text}
        fill={spec.ink}
        fontFamily={SERIF}
        fontSize={34}
        fontStyle={"italic"}
        textAlign={"center"}
        textWrap
        width={860}
      />
      {beat.attribution ? (
        <Txt
          text={beat.attribution}
          fill={spec.muted}
          fontFamily={SANS}
          fontSize={18}
        />
      ) : null}
    </Layout>,
  );
  yield* fadeIn(root(), reveal);
  yield* hold(2);
}

function* playCompare(
  stage: any,
  beat: Extract<ComposeBeat, { type: "compare" }>,
  spec: CompositionSpec,
  reveal: number,
) {
  const root = createRef<Layout>();
  const side = (title: string, points: string[]) => (
    <Layout layout direction={"column"} gap={12} width={420}>
      <Rect width={420} height={260} fill={"rgba(255,255,255,0.05)"} radius={14} />
      <Layout layout direction={"column"} gap={12} width={370} x={24} y={-236}>
        <Txt
          text={title}
          fill={spec.accent}
          fontFamily={SERIF}
          fontSize={26}
          fontWeight={700}
        />
        {points.map((point) => (
          <Txt
            text={`•  ${point}`}
            fill={spec.ink}
            fontFamily={SANS}
            fontSize={18}
            textWrap
            width={370}
          />
        ))}
      </Layout>
    </Layout>
  );

  yield stage.add(
    <Layout
      ref={root}
      layout
      direction={"column"}
      gap={18}
      alignItems={"center"}
      opacity={0}
    >
      {beat.title ? (
        <Txt
          text={beat.title}
          fill={spec.ink}
          fontFamily={SERIF}
          fontSize={30}
          fontWeight={700}
        />
      ) : null}
      <Layout layout direction={"row"} gap={20}>
        {side(beat.left.title, beat.left.points)}
        {side(beat.right.title, beat.right.points)}
      </Layout>
    </Layout>,
  );
  yield* fadeIn(root(), reveal);
  yield* hold(2.2);
}

function* playOutro(
  stage: any,
  beat: Extract<ComposeBeat, { type: "outro" }>,
  spec: CompositionSpec,
  reveal: number,
) {
  const root = createRef<Layout>();
  yield stage.add(
    <Layout
      ref={root}
      layout
      direction={"column"}
      gap={14}
      alignItems={"center"}
      opacity={0}
    >
      <Rect width={48} height={3} fill={spec.accent} radius={2} />
      {beat.icons && beat.icons.length ? (
        <Txt
          text={beat.icons.join("   ")}
          fill={spec.ink}
          fontFamily={SANS}
          fontSize={36}
        />
      ) : null}
      <Txt
        text={beat.title}
        fill={spec.ink}
        fontFamily={SERIF}
        fontSize={44}
        fontWeight={700}
        textAlign={"center"}
        textWrap
        width={800}
      />
      {beat.subtitle ? (
        <Txt
          text={beat.subtitle}
          fill={spec.muted}
          fontFamily={SANS}
          fontSize={20}
          textAlign={"center"}
          textWrap
          width={700}
        />
      ) : null}
    </Layout>,
  );
  yield* fadeIn(root(), reveal);
  yield* hold(1.8);
}

function* playYearFlip(
  stage: any,
  beat: Extract<ComposeBeat, { type: "year_flip" }>,
  spec: CompositionSpec,
  reveal: number,
) {
  const vertical = beat.direction !== "horizontal";
  const enterFrom = vertical ? 160 : 220;
  const exitTo = vertical ? -160 : -220;
  const holdSec = Math.max(0.35, beat.holdSec || 1);
  let current: ReturnType<typeof createRef<Txt>> | null = null;

  for (const year of beat.years) {
    const next = createRef<Txt>();
    yield stage.add(
      <Txt
        ref={next}
        text={year}
        fill={spec.ink}
        fontFamily={SERIF}
        fontSize={120}
        fontWeight={700}
        x={vertical ? 0 : enterFrom}
        y={vertical ? enterFrom : 0}
        opacity={0}
      />,
    );

    if (current) {
      const prev = current;
      yield* all(
        prev().opacity(0, 0.35, easeOutCubic),
        vertical
          ? prev().y(exitTo, 0.45, easeOutCubic)
          : prev().x(exitTo, 0.45, easeOutCubic),
        next().opacity(1, 0.35, easeOutCubic),
        vertical
          ? next().y(0, 0.45, easeOutBack)
          : next().x(0, 0.45, easeOutBack),
      );
      prev().remove();
    } else {
      yield* all(
        next().opacity(1, reveal, easeOutCubic),
        vertical
          ? next().y(0, reveal, easeOutBack)
          : next().x(0, reveal, easeOutBack),
      );
    }

    current = next;
    yield* hold(holdSec);
  }

  if (current) {
    yield* all(
      current().opacity(0, 0.35, easeOutCubic),
      vertical
        ? current().y(exitTo, 0.4, easeOutCubic)
        : current().x(exitTo, 0.4, easeOutCubic),
    );
    current().remove();
  }

  const finale = createRef<Layout>();
  yield stage.add(
    <Layout
      ref={finale}
      layout
      direction={"column"}
      gap={16}
      alignItems={"center"}
      opacity={0}
      scale={0.92}
    >
      {beat.icons && beat.icons.length ? (
        <Txt
          text={beat.icons.join("   ")}
          fill={spec.ink}
          fontFamily={SANS}
          fontSize={40}
        />
      ) : (
        <Rect width={56} height={4} fill={spec.accent} radius={2} />
      )}
      <Txt
        text={beat.finaleTitle}
        fill={spec.ink}
        fontFamily={SERIF}
        fontSize={36}
        fontWeight={700}
        textAlign={"center"}
        textWrap
        width={900}
      />
      {beat.finaleSubtitle ? (
        <Txt
          text={beat.finaleSubtitle}
          fill={spec.muted}
          fontFamily={SANS}
          fontSize={20}
          textAlign={"center"}
          textWrap
          width={820}
        />
      ) : null}
      <Txt
        text={beat.years[beat.years.length - 1] || ""}
        fill={spec.accent}
        fontFamily={SERIF}
        fontSize={28}
        fontWeight={700}
      />
    </Layout>,
  );
  yield* all(
    finale().opacity(1, 0.45, easeOutCubic),
    finale().scale(1, 0.45, easeOutBack),
  );
  yield* hold(2.4);
}
