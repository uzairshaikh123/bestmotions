/** @jsxImportSource @revideo/2d/lib */
import { Layout, Rect, Txt, makeScene2D } from "@revideo/2d";
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  useScene,
  waitFor,
} from "@revideo/core";

function v<T>(name: string, initial: T): T {
  return useScene().variables.get(name, initial)();
}

function* coverSlam(view: any) {
  const title = v("title", "The Hidden Files");
  const author = v("author", "A. RESEARCHER");
  const subtitle = v("subtitle", "What the records never said out loud");
  const coverColor = v("coverColor", "#1e3a5f");
  const accent = v("accent", "#e63946");
  const bg = v("bg", "#07090e");

  view.fill(bg);
  const book = createRef<Rect>();
  const wrap = createRef<Layout>();

  yield view.add(
    <Layout ref={wrap} layout={false}>
      <Rect
        ref={book}
        width={280}
        height={400}
        fill={coverColor}
        radius={3}
        shadowColor={"#000000aa"}
        shadowBlur={40}
        shadowOffsetY={18}
        y={-80}
        scale={0.75}
        opacity={0.3}
        layout
        direction={"column"}
        justifyContent={"space-between"}
        padding={32}
      >
        <Layout direction={"column"} gap={14} alignItems={"start"}>
          <Rect width={48} height={3} fill={accent} />
          <Txt
            text={title}
            fill={"#f4f0e6"}
            fontFamily={"Libre Baskerville, Georgia, serif"}
            fontSize={28}
            fontWeight={700}
            textWrap
            width={220}
          />
          <Txt
            text={subtitle}
            fill={"#c5ccd6"}
            fontFamily={"Libre Baskerville, Georgia, serif"}
            fontSize={14}
            textWrap
            width={220}
          />
        </Layout>
        <Txt
          text={author}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={14}
          letterSpacing={2}
        />
      </Rect>
    </Layout>,
  );

  yield* all(
    book().y(0, 1.1, easeOutBack),
    book().scale(1, 1.1, easeOutCubic),
    book().opacity(1, 0.8, easeOutCubic),
  );
  yield* waitFor(2.2);
}

function* openSpread(view: any) {
  const title = v("title", "Chapter 3");
  const leftPage = v(
    "leftPage",
    "The first documents appeared quietly — filed, stamped, and forgotten.",
  );
  const rightPage = v(
    "rightPage",
    "Years later those same pages would force a rewriting of the official story.",
  );
  const accent = v("accent", "#e63946");
  const bg = v("bg", "#0c0a08");

  view.fill(bg);
  const left = createRef<Rect>();
  const right = createRef<Rect>();

  yield view.add(
    <Layout layout direction={"row"} gap={0}>
      <Rect
        ref={left}
        width={0}
        height={400}
        fill={"#f7f1e4"}
        shadowColor={"#00000088"}
        shadowBlur={30}
        shadowOffsetY={16}
        layout
        direction={"column"}
        padding={28}
        clip
      >
        <Txt
          text={title}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={12}
          letterSpacing={3}
        />
        <Txt
          text={leftPage}
          fill={"#1a1510"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={16}
          marginTop={20}
          textWrap
          width={240}
        />
      </Rect>
      <Rect
        ref={right}
        width={0}
        height={400}
        fill={"#ebe2d0"}
        shadowColor={"#00000088"}
        shadowBlur={30}
        shadowOffsetY={16}
        layout
        direction={"column"}
        padding={28}
        clip
      >
        <Txt
          text={rightPage}
          fill={"#1a1510"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={16}
          marginTop={40}
          textWrap
          width={240}
        />
      </Rect>
    </Layout>,
  );

  yield* all(
    left().width(300, 1.2, easeOutCubic),
    right().width(300, 1.2, easeOutCubic),
  );
  yield* waitFor(2.5);
}

function* coverOpen(view: any) {
  const coverTitle = v("coverTitle", "The Hidden Files");
  const title = v("title", "Chapter One");
  const pageText = v(
    "pageText",
    "They opened the file expecting a routine note. Instead they found a name erased from every public record.",
  );
  const coverColor = v("coverColor", "#1e3a5f");
  const accent = v("accent", "#e63946");
  const bg = v("bg", "#0a0806");

  view.fill(bg);
  const page = createRef<Rect>();
  const cover = createRef<Rect>();

  yield view.add(
    <Layout layout={false}>
      <Rect
        ref={page}
        width={320}
        height={440}
        fill={"#f7f1e4"}
        radius={3}
        shadowColor={"#00000099"}
        shadowBlur={36}
        shadowOffsetY={18}
        layout
        direction={"column"}
        padding={36}
        opacity={0.4}
      >
        <Txt
          text={title}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={12}
          letterSpacing={3}
        />
        <Txt
          text={pageText}
          fill={"#1a1510"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={18}
          marginTop={22}
          textWrap
          width={248}
        />
      </Rect>
      <Rect
        ref={cover}
        width={320}
        height={440}
        fill={coverColor}
        radius={3}
        shadowColor={"#000000aa"}
        shadowBlur={40}
        shadowOffsetY={18}
        layout
        direction={"column"}
        justifyContent={"space-between"}
        padding={36}
        x={0}
      >
        <Layout direction={"column"} gap={14}>
          <Rect width={48} height={3} fill={accent} />
          <Txt
            text={coverTitle}
            fill={"#f4f0e6"}
            fontFamily={"Libre Baskerville, Georgia, serif"}
            fontSize={28}
            fontWeight={700}
            textWrap
            width={248}
          />
        </Layout>
        <Txt
          text={"ARCHIVE"}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={14}
          letterSpacing={2}
        />
      </Rect>
    </Layout>,
  );

  yield* waitFor(0.35);
  yield* all(
    cover().x(-420, 1.35, easeOutCubic),
    cover().scale(0.92, 1.35, easeOutCubic),
    cover().opacity(0.15, 1.35, easeOutCubic),
    page().opacity(1, 1, easeOutCubic),
  );
  yield* waitFor(2.2);
}

function* markerHighlight(view: any) {
  const chapter = v("chapter", "Page 142");
  const beforeText = v(
    "beforeText",
    "The report concluded that the operation had been",
  );
  const highlightText = v("highlightText", "deliberately buried");
  const afterText = v("afterText", "for more than a decade.");
  const markerColor = v("markerColor", "#ffe566");
  const accent = v("accent", "#e63946");
  const bg = v("bg", "#0c0a08");

  view.fill(bg);
  const page = createRef<Rect>();
  const marker = createRef<Rect>();
  const markWidth = Math.max(160, highlightText.length * 12);

  yield view.add(
    <Rect
      ref={page}
      width={560}
      height={360}
      fill={"#f7f1e4"}
      radius={3}
      shadowColor={"#00000099"}
      shadowBlur={36}
      shadowOffsetY={16}
      layout
      direction={"column"}
      padding={44}
      scale={0.9}
      opacity={0}
    >
      <Txt
        text={chapter}
        fill={accent}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={12}
        letterSpacing={3}
      />
      <Txt
        text={beforeText}
        fill={"#1a1510"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={22}
        marginTop={36}
        textWrap
        width={470}
      />
      <Layout layout direction={"row"} alignItems={"center"} marginTop={10}>
        <Layout layout={false} height={36} width={markWidth}>
          <Rect
            ref={marker}
            width={0}
            height={34}
            fill={markerColor}
            opacity={0.85}
            offset={[-1, 0]}
            x={-markWidth / 2}
          />
          <Txt
            text={highlightText}
            fill={"#1a1510"}
            fontFamily={"Libre Baskerville, Georgia, serif"}
            fontSize={22}
            fontWeight={700}
          />
        </Layout>
      </Layout>
      <Txt
        text={afterText}
        fill={"#1a1510"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={22}
        marginTop={10}
        textWrap
        width={470}
      />
    </Rect>,
  );

  yield* all(
    page().opacity(1, 0.7, easeOutCubic),
    page().scale(1, 0.9, easeOutCubic),
  );
  yield* marker().width(markWidth, 0.9, easeOutCubic);
  yield* waitFor(2);
}

function* areaHighlight(view: any) {
  const chapter = v("chapter", "Annex B");
  const pageText = v(
    "pageText",
    "Budget line 17 was never explained in the public hearing. The amount appears once — then vanishes.",
  );
  const callout = v("callout", "Budget line 17");
  const shape = String(v("shape", "circle"));
  const accent = v("accent", "#e63946");
  const bg = v("bg", "#0a0806");

  view.fill(bg);
  const page = createRef<Rect>();
  const ring = createRef<Rect>();
  const label = createRef<Txt>();

  yield view.add(
    <Layout layout={false}>
      <Rect
        ref={page}
        width={420}
        height={500}
        fill={"#f7f1e4"}
        radius={3}
        shadowColor={"#000000aa"}
        shadowBlur={40}
        shadowOffsetY={20}
        layout
        direction={"column"}
        padding={44}
        scale={0.88}
        opacity={0}
      >
        <Txt
          text={chapter}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={13}
          letterSpacing={3}
        />
        <Txt
          text={pageText}
          fill={"#1a1510"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={20}
          marginTop={28}
          textWrap
          width={330}
        />
      </Rect>
      <Rect
        ref={ring}
        width={shape === "box" ? 220 : 200}
        height={shape === "box" ? 70 : 90}
        stroke={accent}
        lineWidth={0}
        radius={shape === "box" ? 4 : 100}
        y={20}
        opacity={0}
      />
      <Txt
        ref={label}
        text={callout}
        fill={accent}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={14}
        fontWeight={700}
        y={110}
        opacity={0}
      />
    </Layout>,
  );

  yield* all(
    page().opacity(1, 0.7, easeOutCubic),
    page().scale(1, 0.9, easeOutCubic),
  );
  yield* all(
    ring().opacity(1, 0.35),
    ring().lineWidth(4, 0.7, easeOutCubic),
    ring().scale(1.05, 0.5, easeOutCubic),
  );
  yield* label().opacity(1, 0.45);
  yield* waitFor(2);
}

function* lineScan(view: any) {
  const chapter = v("chapter", "Testimony");
  const line1 = v("line1", "Witness A: We were told to destroy the copies.");
  const line2 = v("line2", "Witness B: The order came after midnight.");
  const line3 = v("line3", "Witness C: Nobody signed their real name.");
  const scanColor = v("scanColor", "#ffe566");
  const accent = v("accent", "#e63946");
  const bg = v("bg", "#090b10");

  view.fill(bg);
  const page = createRef<Rect>();
  const band = createRef<Rect>();
  const line = createRef<Rect>();

  yield view.add(
    <Layout layout={false}>
      <Rect
        ref={page}
        width={520}
        height={340}
        fill={"#f7f1e4"}
        radius={3}
        shadowColor={"#00000099"}
        shadowBlur={36}
        shadowOffsetY={16}
        layout
        direction={"column"}
        padding={44}
        clip
        opacity={0}
        y={20}
      >
        <Txt
          text={chapter}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={12}
          letterSpacing={3}
        />
        <Txt
          text={line1}
          fill={"#1a1510"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={20}
          marginTop={28}
        />
        <Txt
          text={line2}
          fill={"#1a1510"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={20}
          marginTop={18}
        />
        <Txt
          text={line3}
          fill={"#1a1510"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={20}
          marginTop={18}
        />
      </Rect>
      <Rect
        ref={band}
        width={470}
        height={36}
        fill={scanColor}
        opacity={0}
        y={-90}
        radius={2}
      />
      <Rect ref={line} width={470} height={2} fill={accent} opacity={0} y={-90} />
    </Layout>,
  );

  yield* all(page().opacity(1, 0.6), page().y(0, 0.7, easeOutCubic));
  band().opacity(0.7);
  line().opacity(0.9);
  yield* all(band().y(90, 2.2, easeOutCubic), line().y(90, 2.2, easeOutCubic));
  yield* waitFor(1.2);
}

function* pageFlip(view: any) {
  const line1 = v("line1", "1947 — First mention in the archives");
  const line2 = v("line2", "1962 — Names begin to repeat");
  const line3 = v("line3", "1991 — The paper trail widens");
  const line4 = v("line4", "2019 — Public questions return");
  const accent = v("accent", "#e63946");
  const bg = v("bg", "#080a10");
  const lines = [line1, line2, line3, line4];

  view.fill(bg);
  const page = createRef<Rect>();
  const text = createRef<Txt>();

  yield view.add(
    <Rect
      ref={page}
      width={360}
      height={460}
      fill={"#f7f1e4"}
      radius={3}
      shadowColor={"#000000aa"}
      shadowBlur={40}
      shadowOffsetY={20}
      layout
      direction={"column"}
      padding={40}
    >
      <Txt
        text={"SOURCE NOTES"}
        fill={accent}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={12}
        letterSpacing={3}
      />
      <Txt
        ref={text}
        text={lines[0]}
        fill={"#1a1510"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={22}
        marginTop={40}
        textWrap
        width={280}
      />
    </Rect>,
  );

  for (let i = 0; i < lines.length; i++) {
    text().text(lines[i]);
    page().x(0);
    page().opacity(1);
    page().scale(1);
    yield* waitFor(0.15);
    if (i < lines.length - 1) {
      yield* all(
        page().x(40, 0.35, easeOutCubic),
        page().opacity(0.2, 0.35),
        page().scale(0.96, 0.35),
      );
      page().x(-40);
      yield* all(page().x(0, 0.35, easeOutCubic), page().opacity(1, 0.35));
    } else {
      yield* waitFor(1.2);
    }
  }
}

function* quotePage(view: any) {
  const chapter = v("chapter", "Foreword");
  const quote = v(
    "quote",
    "History is not what happened. It is what was written down.",
  );
  const attribution = v("attribution", "— Anonymous marginal note");
  const accent = v("accent", "#e63946");
  const bg = v("bg", "#090b10");

  view.fill(bg);
  const page = createRef<Rect>();
  const rule = createRef<Rect>();

  yield view.add(
    <Rect
      ref={page}
      width={560}
      height={360}
      fill={"#f7f1e4"}
      radius={3}
      shadowColor={"#00000099"}
      shadowBlur={36}
      shadowOffsetY={16}
      layout
      direction={"column"}
      padding={48}
      opacity={0}
      scale={0.92}
    >
      <Txt
        text={chapter}
        fill={accent}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={13}
        letterSpacing={3}
      />
      <Txt
        text={`“${quote}”`}
        fill={"#1a1510"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={28}
        fontStyle={"italic"}
        marginTop={28}
        textWrap
        width={460}
      />
      <Rect ref={rule} width={0} height={2} fill={accent} marginTop={28} />
      <Txt
        text={attribution}
        fill={"#5a5048"}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={16}
        marginTop={16}
      />
    </Rect>,
  );

  yield* all(
    page().opacity(1, 0.7, easeOutCubic),
    page().scale(1, 0.9, easeOutCubic),
  );
  yield* rule().width(120, 0.7, easeOutCubic);
  yield* waitFor(2);
}

function* textUnderline(view: any) {
  const chapter = v("chapter", "Conclusion");
  const beforeText = v(
    "beforeText",
    "In the end, the archive did not hide the truth —",
  );
  const underlineText = v("underlineText", "it waited for someone to look");
  const afterText = v("afterText", ".");
  const accent = v("accent", "#e63946");
  const bg = v("bg", "#0c0a08");

  view.fill(bg);
  const page = createRef<Rect>();
  const rule = createRef<Rect>();

  yield view.add(
    <Rect
      ref={page}
      width={600}
      height={320}
      fill={"#f7f1e4"}
      radius={3}
      shadowColor={"#00000099"}
      shadowBlur={36}
      shadowOffsetY={16}
      layout
      direction={"column"}
      padding={48}
      opacity={0}
    >
      <Txt
        text={chapter}
        fill={accent}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={13}
        letterSpacing={3}
      />
      <Layout layout direction={"column"} marginTop={32} gap={6}>
        <Txt
          text={`${beforeText} ${underlineText}${afterText}`}
          fill={"#1a1510"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={24}
          textWrap
          width={500}
        />
        <Rect ref={rule} width={0} height={3} fill={accent} radius={2} />
      </Layout>
    </Rect>,
  );

  yield* page().opacity(1, 0.7, easeOutCubic);
  yield* rule().width(Math.max(220, underlineText.length * 11), 0.9, easeOutCubic);
  yield* waitFor(2);
}

function* spineReveal(view: any) {
  const title = v("title", "Power & Silence");
  const author = v("author", "N. ARCHIVE");
  const spineLabel = v("spineLabel", "POWER & SILENCE");
  const coverColor = v("coverColor", "#2a1810");
  const accent = v("accent", "#d4a373");
  const bg = v("bg", "#0a0806");

  view.fill(bg);
  const spine = createRef<Rect>();
  const cover = createRef<Rect>();

  yield view.add(
    <Layout layout direction={"row"} gap={0}>
      <Rect
        ref={spine}
        width={36}
        height={400}
        fill={coverColor}
        layout
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Txt
          text={spineLabel}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={13}
          letterSpacing={3}
          rotation={-90}
        />
      </Rect>
      <Rect
        ref={cover}
        width={0}
        height={400}
        fill={coverColor}
        layout
        direction={"column"}
        justifyContent={"space-between"}
        padding={32}
        clip
      >
        <Layout direction={"column"} gap={14}>
          <Rect width={48} height={3} fill={accent} />
          <Txt
            text={title}
            fill={"#f4f0e6"}
            fontFamily={"Libre Baskerville, Georgia, serif"}
            fontSize={28}
            fontWeight={700}
            textWrap
            width={220}
          />
        </Layout>
        <Txt
          text={author}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={14}
          letterSpacing={2}
        />
      </Rect>
    </Layout>,
  );

  yield* waitFor(0.4);
  yield* cover().width(280, 1.3, easeOutCubic);
  yield* waitFor(2);
}

/** Show closed book → open it → thumb / flip through pages. */
function* thumbThrough(view: any) {
  const coverTitle = v("coverTitle", "The Hidden Files");
  const author = v("author", "A. RESEARCHER");
  const subtitle = v("subtitle", "What the records never said out loud");
  const page1 = v(
    "page1",
    "The first documents appeared quietly — filed, stamped, and forgotten.",
  );
  const page2 = v(
    "page2",
    "Names began to repeat. Dates refused to stay quiet in the margins.",
  );
  const page3 = v(
    "page3",
    "Years later those same pages forced a rewriting of the official story.",
  );
  const page4 = v(
    "page4",
    "What changed was not the ink. It was who was willing to read it.",
  );
  const coverColor = v("coverColor", "#1e3a5f");
  const accent = v("accent", "#e63946");
  const bg = v("bg", "#07090e");
  const pages = [page1, page2, page3, page4].filter(Boolean);

  view.fill(bg);

  const cover = createRef<Rect>();
  const spread = createRef<Layout>();
  const leftPage = createRef<Rect>();
  const rightPage = createRef<Rect>();
  const flipPage = createRef<Rect>();
  const flipText = createRef<Txt>();
  const leftText = createRef<Txt>();
  const rightText = createRef<Txt>();
  const pageLabel = createRef<Txt>();

  yield view.add(
    <Layout layout={false}>
      <Rect
        ref={cover}
        width={280}
        height={400}
        fill={coverColor}
        radius={3}
        shadowColor={"#000000aa"}
        shadowBlur={40}
        shadowOffsetY={18}
        y={-70}
        scale={0.72}
        opacity={0.25}
        layout
        direction={"column"}
        justifyContent={"space-between"}
        padding={32}
      >
        <Layout direction={"column"} gap={14}>
          <Rect width={48} height={3} fill={accent} />
          <Txt
            text={coverTitle}
            fill={"#f4f0e6"}
            fontFamily={"Libre Baskerville, Georgia, serif"}
            fontSize={28}
            fontWeight={700}
            textWrap
            width={220}
          />
          <Txt
            text={subtitle}
            fill={"#c5ccd6"}
            fontFamily={"Libre Baskerville, Georgia, serif"}
            fontSize={14}
            textWrap
            width={220}
          />
        </Layout>
        <Txt
          text={author}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={14}
          letterSpacing={2}
        />
      </Rect>

      <Layout ref={spread} layout direction={"row"} gap={0} opacity={0}>
        <Rect
          ref={leftPage}
          width={0}
          height={400}
          fill={"#f7f1e4"}
          shadowColor={"#00000088"}
          shadowBlur={28}
          shadowOffsetY={14}
          layout
          direction={"column"}
          padding={28}
          clip
        >
          <Txt
            text={"CHAPTER"}
            fill={accent}
            fontFamily={"Libre Baskerville, Georgia, serif"}
            fontSize={11}
            letterSpacing={3}
          />
          <Txt
            ref={leftText}
            text={pages[0] || ""}
            fill={"#1a1510"}
            fontFamily={"Libre Baskerville, Georgia, serif"}
            fontSize={16}
            marginTop={22}
            textWrap
            width={224}
          />
        </Rect>
        <Rect
          ref={rightPage}
          width={0}
          height={400}
          fill={"#ebe2d0"}
          shadowColor={"#00000088"}
          shadowBlur={28}
          shadowOffsetY={14}
          layout
          direction={"column"}
          padding={28}
          clip
        >
          <Txt
            ref={rightText}
            text={pages[1] || pages[0] || ""}
            fill={"#1a1510"}
            fontFamily={"Libre Baskerville, Georgia, serif"}
            fontSize={16}
            marginTop={40}
            textWrap
            width={224}
          />
          <Txt
            ref={pageLabel}
            text={"pp. 1–2"}
            fill={"#5a5048"}
            fontFamily={"Libre Baskerville, Georgia, serif"}
            fontSize={12}
            marginTop={24}
          />
        </Rect>
      </Layout>

      <Rect
        ref={flipPage}
        width={280}
        height={400}
        fill={"#f3ecdf"}
        shadowColor={"#00000099"}
        shadowBlur={30}
        shadowOffsetY={12}
        layout
        direction={"column"}
        padding={28}
        opacity={0}
        x={140}
        clip
      >
        <Txt
          text={"TURNING"}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={11}
          letterSpacing={3}
        />
        <Txt
          ref={flipText}
          text={""}
          fill={"#1a1510"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={16}
          marginTop={22}
          textWrap
          width={224}
        />
      </Rect>
    </Layout>,
  );

  // 1) Show the closed book
  yield* all(
    cover().y(0, 1.05, easeOutBack),
    cover().scale(1, 1.05, easeOutCubic),
    cover().opacity(1, 0.75, easeOutCubic),
  );
  yield* waitFor(0.55);

  // 2) Open the book
  yield* all(
    cover().x(-380, 1.2, easeOutCubic),
    cover().opacity(0, 0.95, easeOutCubic),
    cover().scale(0.88, 1.2, easeOutCubic),
    spread().opacity(1, 0.65, easeOutCubic),
    leftPage().width(280, 1.2, easeOutCubic),
    rightPage().width(280, 1.2, easeOutCubic),
  );
  yield* waitFor(0.4);

  // 3) Thumb / flip through pages
  for (let i = 1; i < pages.length; i++) {
    const incoming = pages[i];
    flipText().text(incoming);
    flipPage().x(150);
    flipPage().width(280);
    flipPage().opacity(1);

    yield* all(
      flipPage().x(-30, 0.55, easeOutCubic),
      flipPage().width(36, 0.55, easeOutCubic),
      flipPage().opacity(0.25, 0.55, easeOutCubic),
    );

    leftText().text(pages[Math.max(0, i - 1)]);
    rightText().text(incoming);
    pageLabel().text(`pp. ${i}–${i + 1}`);

    flipPage().opacity(0);
    flipPage().x(150);
    flipPage().width(280);
    yield* rightPage().opacity(0.5, 0.12).to(1, 0.28);
    yield* waitFor(0.5);
  }

  yield* waitFor(1.35);
}

function* bookStack(view: any) {
  const title = v("title", "On the shelf");
  const book1 = v("book1", "Empire of Silence");
  const book2 = v("book2", "The Paper Trail");
  const book3 = v("book3", "Closed Doors");
  const book4 = v("book4", "After Midnight");
  const accent = v("accent", "#e63946");
  const bg = v("bg", "#0a0c12");

  const books = [
    { label: book1, color: "#1e3a5f", h: 52, w: 420 },
    { label: book2, color: "#3d1f1f", h: 46, w: 450 },
    { label: book3, color: "#1a3324", h: 58, w: 420 },
    { label: book4, color: "#3a2a12", h: 44, w: 450 },
  ].filter((b) => b.label);

  view.fill(bg);
  const heading = createRef<Txt>();
  yield view.add(
    <Txt
      ref={heading}
      text={title}
      fill={accent}
      fontFamily={"Libre Baskerville, Georgia, serif"}
      fontSize={18}
      letterSpacing={4}
      y={-240}
      opacity={0}
    />,
  );

  const refs = books.map(() => createRef<Rect>());
  for (let i = 0; i < books.length; i++) {
    const b = books[i];
    const y = 160 - i * (b.h + 6);
    yield view.add(
      <Rect
        ref={refs[i]}
        width={b.w}
        height={b.h}
        fill={b.color}
        radius={2}
        y={y + 40}
        opacity={0}
        shadowColor={"#00000088"}
        shadowBlur={16}
        shadowOffsetY={6}
        layout
        alignItems={"center"}
        paddingLeft={28}
      >
        <Txt
          text={b.label}
          fill={"#f0e6d8"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={16}
          letterSpacing={1}
        />
      </Rect>,
    );
  }

  yield* heading().opacity(1, 0.35, easeOutCubic);
  for (let i = 0; i < refs.length; i++) {
    const y = 160 - i * (books[i].h + 6);
    yield* all(
      refs[i]().y(y, 0.45, easeOutBack),
      refs[i]().opacity(1, 0.35, easeOutCubic),
    );
  }
  yield* waitFor(2);
}

function* bookFloat(view: any) {
  const title = v("title", "The Long Game");
  const author = v("author", "FIELD NOTES");
  const coverColor = v("coverColor", "#152238");
  const accent = v("accent", "#7dd3a0");
  const bg = v("bg", "#06080c");

  view.fill(bg);
  const book = createRef<Rect>();
  yield view.add(
    <Rect
      ref={book}
      width={260}
      height={370}
      fill={coverColor}
      radius={3}
      shadowColor={"#000000aa"}
      shadowBlur={40}
      shadowOffsetY={18}
      layout
      direction={"column"}
      justifyContent={"space-between"}
      padding={28}
      opacity={0}
      y={20}
    >
      <Layout direction={"column"} gap={12} alignItems={"start"}>
        <Rect width={40} height={3} fill={accent} />
        <Txt
          text={title}
          fill={"#f4f0e6"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={26}
          fontWeight={700}
          textWrap
          width={200}
        />
      </Layout>
      <Txt
        text={author}
        fill={accent}
        fontFamily={"Libre Baskerville, Georgia, serif"}
        fontSize={13}
        letterSpacing={2}
      />
    </Rect>,
  );

  yield* all(
    book().opacity(1, 0.5, easeOutCubic),
    book().y(0, 0.6, easeOutCubic),
  );

  for (let i = 0; i < 4; i++) {
    yield* all(
      book().y(-10, 0.7, easeOutCubic),
      book().rotation(3, 0.7, easeOutCubic),
    );
    yield* all(
      book().y(10, 0.7, easeOutCubic),
      book().rotation(-3, 0.7, easeOutCubic),
    );
  }
  yield* all(
    book().y(0, 0.4, easeOutCubic),
    book().rotation(0, 0.4, easeOutCubic),
  );
  yield* waitFor(0.6);
}

function* sourceCite(view: any) {
  const eyebrow = v("eyebrow", "SOURCE");
  const title = v("title", "India After Gandhi");
  const author = v("author", "Ramachandra Guha");
  const detail = v(
    "detail",
    "Referenced for the political timeline of the 1970s.",
  );
  const coverColor = v("coverColor", "#1a2f4a");
  const accent = v("accent", "#e63946");
  const bg = v("bg", "#07090e");

  view.fill(bg);
  const cover = createRef<Rect>();
  const textBlock = createRef<Layout>();

  yield view.add(
    <Layout layout={false}>
      <Rect
        ref={cover}
        x={-280}
        width={200}
        height={290}
        fill={coverColor}
        radius={3}
        shadowColor={"#000000aa"}
        shadowBlur={30}
        shadowOffsetY={14}
        layout
        direction={"column"}
        justifyContent={"space-between"}
        padding={22}
        opacity={0}
      >
        <Layout direction={"column"} gap={10}>
          <Rect width={36} height={3} fill={accent} />
          <Txt
            text={title}
            fill={"#f4f0e6"}
            fontFamily={"Libre Baskerville, Georgia, serif"}
            fontSize={18}
            fontWeight={700}
            textWrap
            width={156}
          />
        </Layout>
        <Txt
          text={author}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={12}
        />
      </Rect>
      <Layout
        ref={textBlock}
        x={140}
        y={-20}
        direction={"column"}
        gap={12}
        alignItems={"start"}
        opacity={0}
        layout
        width={520}
      >
        <Txt
          text={eyebrow}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={14}
          letterSpacing={4}
        />
        <Txt
          text={title}
          fill={"#ffffff"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={40}
          fontWeight={700}
          textWrap
          width={520}
        />
        <Txt
          text={author}
          fill={"#aeb6c4"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={20}
        />
        <Txt
          text={detail}
          fill={"#d0d6e0"}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={18}
          textWrap
          width={520}
        />
      </Layout>
    </Layout>,
  );

  yield* all(
    cover().opacity(1, 0.45, easeOutCubic),
    cover().x(-240, 0.55, easeOutBack),
  );
  yield* all(
    textBlock().opacity(1, 0.45, easeOutCubic),
    textBlock().x(120, 0.5, easeOutCubic),
  );
  yield* waitFor(2.2);
}

function* tomeSlam(view: any) {
  const title = v("title", "ENCYCLOPEDIA");
  const volume = v("volume", "VOL. VII");
  const subtitle = v("subtitle", "Conflicts & Consequences");
  const accent = v("accent", "#d4af37");
  const coverColor = v("coverColor", "#1a1208");
  const bg = v("bg", "#050408");

  view.fill(bg);
  const tome = createRef<Rect>();
  const spine = createRef<Rect>();
  const spine2 = createRef<Rect>();

  yield view.add(
    <Layout layout={false}>
      <Rect
        ref={spine2}
        width={340}
        height={460}
        fill={"#080604"}
        x={24}
        y={-20}
        opacity={0}
        radius={4}
      />
      <Rect
        ref={spine}
        width={340}
        height={460}
        fill={"#0d0a06"}
        x={12}
        y={-10}
        opacity={0}
        radius={4}
      />
      <Rect
        ref={tome}
        width={340}
        height={460}
        fill={coverColor}
        radius={4}
        shadowColor={"#000000cc"}
        shadowBlur={50}
        shadowOffsetY={24}
        y={60}
        scale={0.7}
        opacity={0}
        layout
        direction={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        gap={16}
        padding={32}
      >
        <Txt
          text={volume}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={14}
          letterSpacing={6}
        />
        <Txt
          text={title}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={36}
          fontWeight={700}
          letterSpacing={4}
        />
        <Rect width={80} height={2} fill={accent} opacity={0.6} />
        <Txt
          text={subtitle}
          fill={accent}
          fontFamily={"Libre Baskerville, Georgia, serif"}
          fontSize={16}
          opacity={0.85}
        />
      </Rect>
    </Layout>,
  );

  yield* all(
    tome().opacity(1, 0.5, easeOutCubic),
    tome().y(0, 0.9, easeOutBack),
    tome().scale(1, 0.9, easeOutCubic),
    spine().opacity(0.9, 0.5, easeOutCubic),
    spine2().opacity(0.7, 0.5, easeOutCubic),
  );
  yield* waitFor(2.2);
}

export function* runBooks(view: any, template: string) {
  switch (template) {
    case "thumb-through":
      yield* thumbThrough(view);
      break;
    case "open-spread":
      yield* openSpread(view);
      break;
    case "cover-open":
      yield* coverOpen(view);
      break;
    case "marker-highlight":
      yield* markerHighlight(view);
      break;
    case "area-highlight":
      yield* areaHighlight(view);
      break;
    case "line-scan":
      yield* lineScan(view);
      break;
    case "page-flip":
      yield* pageFlip(view);
      break;
    case "quote":
      yield* quotePage(view);
      break;
    case "text-underline":
      yield* textUnderline(view);
      break;
    case "spine-reveal":
      yield* spineReveal(view);
      break;
    case "book-stack":
      yield* bookStack(view);
      break;
    case "book-float":
      yield* bookFloat(view);
      break;
    case "source-cite":
      yield* sourceCite(view);
      break;
    case "tome":
      yield* tomeSlam(view);
      break;
    case "cover-slam":
    default:
      yield* coverSlam(view);
      break;
  }
}

export default makeScene2D("books", function* (view) {
  yield* runBooks(view, String(v("template", "cover-slam")));
});
