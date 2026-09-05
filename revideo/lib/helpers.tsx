/** @jsxImportSource @revideo/2d/lib */
import { Layout, Rect, Txt } from "@revideo/2d";
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  useScene,
  waitFor,
} from "@revideo/core";

export function v<T>(name: string, initial: T): T {
  return useScene().variables.get(name, initial)();
}

export function str(name: string, initial: string): string {
  return String(v(name, initial));
}

export function num(name: string, initial: number): number {
  const raw = v(name, initial);
  const n = Number(raw);
  return Number.isFinite(n) ? n : initial;
}

/** Shared documentary title-card slam used across packs. */
export function* titleSlam(
  view: any,
  opts: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    accent: string;
    bg: string;
    align?: "left" | "center";
  },
) {
  const {
    eyebrow = "",
    title,
    subtitle = "",
    accent,
    bg,
    align = "left",
  } = opts;
  view.fill(bg);
  const block = createRef<Layout>();
  const bar = createRef<Rect>();

  yield view.add(
    <Layout
      ref={block}
      layout
      direction={"column"}
      gap={16}
      alignItems={align === "center" ? "center" : "start"}
      x={align === "center" ? 0 : -280}
      y={20}
      opacity={0}
      width={720}
    >
      {eyebrow ? (
        <Txt
          text={eyebrow}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={14}
          letterSpacing={4}
          fontWeight={700}
        />
      ) : (
        <Rect ref={bar} width={48} height={3} fill={accent} />
      )}
      <Txt
        text={title}
        fill={"#f4f0e6"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={48}
        fontWeight={700}
        textWrap
        width={720}
        textAlign={align === "center" ? "center" : "left"}
      />
      {subtitle ? (
        <Txt
          text={subtitle}
          fill={"#c5ccd6"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={22}
          textWrap
          width={680}
          textAlign={align === "center" ? "center" : "left"}
        />
      ) : null}
    </Layout>,
  );

  yield* all(
    block().opacity(1, 0.45, easeOutCubic),
    block().y(0, 0.7, easeOutBack),
  );
  yield* waitFor(2.2);
}

/** Lower-third style name/title plate. */
export function* lowerThird(
  view: any,
  opts: {
    name: string;
    title?: string;
    accent: string;
    bg: string;
  },
) {
  const { name, title = "", accent, bg } = opts;
  view.fill(bg);
  const plate = createRef<Layout>();
  yield view.add(
    <Layout
      ref={plate}
      layout
      direction={"column"}
      gap={8}
      x={-360}
      y={220}
      opacity={0}
      padding={20}
    >
      <Rect width={6} height={70} fill={accent} x={-40} y={10} layout={false} />
      <Txt
        text={name}
        fill={"#ffffff"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={36}
        fontWeight={700}
      />
      {title ? (
        <Txt
          text={title}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={18}
        />
      ) : null}
    </Layout>,
  );
  yield* all(
    plate().opacity(1, 0.4, easeOutCubic),
    plate().x(-300, 0.55, easeOutCubic),
  );
  yield* waitFor(2.2);
}

/** Paper / document card with body text. */
export function* paperCard(
  view: any,
  opts: {
    eyebrow?: string;
    body: string;
    accent: string;
    bg: string;
    highlight?: string;
  },
) {
  const { eyebrow = "", body, accent, bg, highlight = "" } = opts;
  view.fill(bg);
  const card = createRef<Rect>();
  yield view.add(
    <Rect
      ref={card}
      width={720}
      height={420}
      fill={"#f4efe4"}
      radius={4}
      shadowColor={"#00000099"}
      shadowBlur={40}
      shadowOffsetY={18}
      y={30}
      opacity={0}
      layout
      direction={"column"}
      gap={18}
      padding={48}
      alignItems={"start"}
    >
      {eyebrow ? (
        <Txt
          text={eyebrow}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={14}
          letterSpacing={3}
        />
      ) : null}
      <Txt
        text={body}
        fill={"#1a1510"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={26}
        textWrap
        width={620}
      />
      {highlight ? (
        <Txt
          text={highlight}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={22}
          fontWeight={700}
          textWrap
          width={620}
        />
      ) : null}
    </Rect>,
  );
  yield* all(
    card().opacity(1, 0.45, easeOutCubic),
    card().y(0, 0.65, easeOutBack),
  );
  yield* waitFor(2.2);
}

/** Stat / big number reveal. */
export function* bigStat(
  view: any,
  opts: {
    label?: string;
    value: string;
    detail?: string;
    accent: string;
    bg: string;
  },
) {
  const { label = "", value, detail = "", accent, bg } = opts;
  view.fill(bg);
  const wrap = createRef<Layout>();
  yield view.add(
    <Layout
      ref={wrap}
      layout
      direction={"column"}
      gap={12}
      alignItems={"center"}
      opacity={0}
      scale={0.85}
    >
      {label ? (
        <Txt
          text={label}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={16}
          letterSpacing={4}
        />
      ) : null}
      <Txt
        text={value}
        fill={"#ffffff"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={96}
        fontWeight={700}
      />
      {detail ? (
        <Txt
          text={detail}
          fill={"#c5ccd6"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={22}
        />
      ) : null}
    </Layout>,
  );
  yield* all(
    wrap().opacity(1, 0.4, easeOutCubic),
    wrap().scale(1, 0.7, easeOutBack),
  );
  yield* waitFor(2.2);
}

/** Design space every pack is authored against. */
export const DESIGN_WIDTH = 1280;
export const DESIGN_HEIGHT = 720;

/**
 * Scale the 1280×720 layout to fit the current canvas (16:9, 9:16, 1:1, …).
 * Background fills stay on the full view; content is letterboxed / pillarboxed.
 */
export function* fitDesignStage(view: any) {
  const size = useScene().getSize();
  const scale = Math.min(size.x / DESIGN_WIDTH, size.y / DESIGN_HEIGHT);
  if (!Number.isFinite(scale) || scale <= 0) return;
  if (Math.abs(scale - 1) < 0.002) return;

  const stage = createRef<Layout>();
  yield view.add(<Layout ref={stage} layout={false} scale={scale} />);
  const originalAdd = view.add.bind(view);
  view.add = (node: any) => {
    const parent = stage();
    if (!parent) return originalAdd(node);
    return parent.add(node);
  };
}

export {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  waitFor,
  useScene,
  Layout,
  Rect,
  Txt,
};
