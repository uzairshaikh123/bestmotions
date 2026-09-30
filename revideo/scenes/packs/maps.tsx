/** @jsxImportSource @revideo/2d/lib */
/**
 * Maps & travel — each template has its own visual language + motion grammar
 * so gallery neighbors never look like clones. Flat d3-geo Natural Earth (free OSS).
 */
import { Circle, Layout, Line, Path, Polygon, Rect, Txt } from "@revideo/2d";
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  num,
  str,
  waitFor,
} from "../../lib/helpers";
import {
  countryCentroid,
  drawFlatWorld,
  easeInOutCubic,
  easeOut3,
  getPlace,
  haversineKm,
  headingDeg,
  mixView,
  viewAt,
  viewSpan,
  worldView,
  type EarthDrawing,
  type MapView,
} from "../../lib/earth";
import { geoInterpolate } from "d3-geo";

const SERIF = "Libre Baskerville, Georgia, serif";
const MONO = "ui-monospace, Consolas, monospace";
const SANS = "Segoe UI, Helvetica Neue, Arial, sans-serif";

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

type Theme = {
  ocean?: string;
  land: string;
  border: string;
  graticule?: string;
  showGraticule?: boolean;
  landOpacity?: number;
  borderOpacity?: number;
};

type MapRefs = {
  plate: ReturnType<typeof createRef<Layout>>;
  land: ReturnType<typeof createRef<Path>>;
  borders: ReturnType<typeof createRef<Path>>;
  country: ReturnType<typeof createRef<Path>>;
};

function applyView(refs: MapRefs, view: MapView) {
  refs.plate().scale(view.scale);
  refs.plate().position([view.x, view.y]);
}

function* mountFlatMap(
  view: any,
  drawing: EarthDrawing,
  opts: {
    accent: string;
    countryFill?: string;
    initial?: MapView;
    theme: Theme;
    countryOpacity?: number;
  },
) {
  const refs: MapRefs = {
    plate: createRef<Layout>(),
    land: createRef<Path>(),
    borders: createRef<Path>(),
    country: createRef<Path>(),
  };
  const cam = opts.initial ?? worldView();
  const th = opts.theme;

  yield view.add(
    <Layout ref={refs.plate} layout={false} x={cam.x} y={cam.y} scale={cam.scale}>
      <Path
        data={drawing.graticule}
        fill={null}
        stroke={th.graticule || th.border}
        lineWidth={0.5}
        opacity={th.showGraticule === false ? 0 : 0.45}
      />
      <Path
        ref={refs.land}
        data={drawing.land}
        fill={th.land}
        stroke={null}
        opacity={th.landOpacity ?? 1}
      />
      <Path
        ref={refs.borders}
        data={drawing.borders}
        fill={null}
        stroke={th.border}
        lineWidth={0.6}
        opacity={th.borderOpacity ?? 0.55}
      />
      <Path
        ref={refs.country}
        data={drawing.country}
        fill={opts.countryFill || opts.accent}
        stroke={opts.accent}
        lineWidth={1.6}
        end={0}
        opacity={opts.countryOpacity ?? 0}
      />
    </Layout>,
  );

  return { refs, drawing };
}

function* tweenView(refs: MapRefs, from: MapView, to: MapView, duration: number) {
  const steps = Math.max(12, Math.round(duration * 30));
  const dt = duration / steps;
  for (let i = 1; i <= steps; i++) {
    applyView(refs, mixView(from, to, easeInOutCubic(i / steps)));
    yield* waitFor(dt);
  }
}

function screenXy(
  drawing: EarthDrawing,
  cam: MapView,
  lonlat: [number, number],
): [number, number] | null {
  const local = drawing.projection(lonlat);
  if (!local) return null;
  return [local[0] * cam.scale + cam.x, local[1] * cam.scale + cam.y];
}

function* countUp(txt: ReturnType<typeof createRef<Txt>>, target: number, duration: number, suffix = "") {
  const steps = Math.max(12, Math.round(duration * 24));
  const dt = duration / steps;
  for (let i = 1; i <= steps; i++) {
    const n = Math.round(target * easeOut3(i / steps));
    txt().text(`${n.toLocaleString("en-US")}${suffix}`);
    yield* waitFor(dt);
  }
}

/* ═══════════════════════════════════════════════════════════════
   1) AIRPLANE ROUTE — night flight board (HUD cards + trail)
   ═══════════════════════════════════════════════════════════════ */
function* airplaneRoute(view: any) {
  const title = str("title", "India to USA");
  const from = getPlace(str("fromPlace", "india"));
  const to = getPlace(str("toPlace", "usa"));
  const planeColor = str("accent", "#ffc857");
  const pathColor = str("lineColor", "#5ce1ff");
  const bg = str("bg", "#04060f");
  const t = timing();
  view.fill(bg);

  const km = haversineKm(from.capital, to.capital);
  const drawing = drawFlatWorld();
  const framed = viewSpan(drawing, from.capital, to.capital, 1.2);

  yield* pause(t.startDelay);
  const extra = itemDelays(4);

  // Soft horizon wash
  const wash = createRef<Rect>();
  yield view.add(
    <Rect ref={wash} width={1400} height={420} y={40} fill={"#0a1a3a"} opacity={0} />,
  );
  yield* wash().opacity(0.55, t.revealDuration, easeOutCubic);

  const map = yield* mountFlatMap(view, drawing, {
    accent: pathColor,
    initial: framed,
    theme: {
      land: "#132038",
      border: "#3d5a78",
      graticule: "#152840",
      landOpacity: 0.92,
    },
  });

  const eyebrow = createRef<Txt>();
  yield view.add(
    <Txt
      ref={eyebrow}
      text={"FLIGHT PATH"}
      fill={pathColor}
      fontFamily={MONO}
      fontSize={13}
      letterSpacing={6}
      y={-318}
      opacity={0}
      zIndex={40}
    />,
  );

  // Origin / destination HUD cards
  const fromCard = createRef<Layout>();
  const toCard = createRef<Layout>();
  yield view.add(
    <Layout ref={fromCard} x={-520} y={-210} opacity={0} zIndex={40}>
      <Rect width={200} height={78} fill={"#0b1224"} stroke={pathColor} lineWidth={1.2} radius={6} opacity={0.92} />
      <Txt text={"DEPART"} fill={pathColor} fontFamily={MONO} fontSize={11} letterSpacing={3} y={-22} />
      <Txt text={from.name.toUpperCase()} fill={"#f2f6ff"} fontFamily={SANS} fontSize={20} fontWeight={700} y={6} />
    </Layout>,
  );
  yield view.add(
    <Layout ref={toCard} x={520} y={-210} opacity={0} zIndex={40}>
      <Rect width={200} height={78} fill={"#0b1224"} stroke={planeColor} lineWidth={1.2} radius={6} opacity={0.92} />
      <Txt text={"ARRIVE"} fill={planeColor} fontFamily={MONO} fontSize={11} letterSpacing={3} y={-22} />
      <Txt text={to.name.toUpperCase()} fill={"#f2f6ff"} fontFamily={SANS} fontSize={20} fontWeight={700} y={6} />
    </Layout>,
  );

  const titleRef = createRef<Txt>();
  const distRef = createRef<Txt>();
  yield view.add(
    <Txt ref={titleRef} text={title} fill={"#e8eef8"} fontFamily={SERIF} fontSize={26} fontWeight={700} y={-280} opacity={0} zIndex={40} />,
  );
  yield view.add(
    <Txt ref={distRef} text={"0 km"} fill={"#9eb4d0"} fontFamily={MONO} fontSize={15} y={310} opacity={0} zIndex={40} />,
  );

  yield* pause(extra[0]);
  yield* all(
    eyebrow().opacity(1, t.revealDuration, easeOutCubic),
    titleRef().opacity(1, t.revealDuration, easeOutCubic),
    fromCard().opacity(1, t.revealDuration, easeOutCubic),
    fromCard().x(-460, t.revealDuration, easeOutCubic),
  );
  yield* pause(t.stepDelay);
  yield* all(
    toCard().opacity(1, t.revealDuration, easeOutCubic),
    toCard().x(460, t.revealDuration, easeOutCubic),
  );

  const route = createRef<Path>();
  const plane = createRef<Polygon>();
  const localFrom = drawing.projection(from.capital) || [0, 0];
  yield map.refs.plate().add(
    <Path
      ref={route}
      data={drawing.route(from.capital, to.capital)}
      fill={null}
      stroke={pathColor}
      lineWidth={2.6 / framed.scale}
      end={0}
      lineCap={"round"}
      shadowColor={pathColor}
      shadowBlur={16}
      zIndex={5}
    />,
  );
  yield map.refs.plate().add(
    <Polygon
      ref={plane}
      sides={3}
      width={18 / framed.scale}
      height={22 / framed.scale}
      fill={planeColor}
      x={localFrom[0]}
      y={localFrom[1]}
      rotation={90}
      zIndex={6}
      shadowColor={planeColor}
      shadowBlur={10}
    />,
  );

  yield* pause(t.connectDelay);
  yield* pause(extra[1]);
  yield* distRef().opacity(1, 0.2, easeOutCubic);

  const interp = geoInterpolate(from.capital, to.capital);
  const steps = 44;
  const dt = t.lineDuration / steps;
  yield* all(
    route().end(1, t.lineDuration, easeOutCubic),
    countUp(distRef, km, t.lineDuration, " km"),
    (function* () {
      for (let i = 1; i <= steps; i++) {
        const u = easeOut3(i / steps);
        const xy = drawing.projection(interp(u) as [number, number]);
        if (xy) {
          // Breadcrumb dots every few steps
          if (i % 5 === 0) {
            yield map.refs.plate().add(
              <Circle
                size={4.5 / framed.scale}
                fill={pathColor}
                x={xy[0]}
                y={xy[1]}
                opacity={0.55}
                zIndex={4}
              />,
            );
          }
          yield* all(
            plane().x(xy[0], dt, easeOutCubic),
            plane().y(xy[1], dt, easeOutCubic),
            plane().rotation(
              headingDeg(drawing.projection, (u) => interp(u) as [number, number], u) + 90,
              dt,
              easeOutCubic,
            ),
          );
        } else {
          yield* waitFor(dt);
        }
      }
    })(),
  );

  yield* pause(extra[2]);
  yield* waitFor(1.0);
}

/* ═══════════════════════════════════════════════════════════════
   2) COUNTRY HIGHLIGHT — editorial ink stamp
   ═══════════════════════════════════════════════════════════════ */
function* countryHighlight(view: any) {
  const place = getPlace(str("placeKey", "india"));
  const title = str("title", place.name.toUpperCase());
  const subtitle = str("subtitle", "SOUTH ASIA");
  const accent = str("accent", "#e8a045");
  const bg = str("bg", "#100e0c");
  const t = timing();
  view.fill(bg);

  const [lon, lat] = countryCentroid(place.iso);
  const drawing = drawFlatWorld({ highlightIso: place.iso });
  const wide = worldView();
  const close = viewAt(drawing, lon, lat, 2.7);

  yield* pause(t.startDelay);
  const extra = itemDelays(3);

  // Giant watermark
  const mark = createRef<Txt>();
  yield view.add(
    <Txt
      ref={mark}
      text={title}
      fill={accent}
      fontFamily={SERIF}
      fontSize={120}
      fontWeight={700}
      opacity={0}
      y={20}
      zIndex={1}
    />,
  );

  const map = yield* mountFlatMap(view, drawing, {
    accent,
    countryFill: accent,
    initial: wide,
    theme: {
      land: "#2a241c",
      border: "#5c4e3a",
      showGraticule: false,
      landOpacity: 0.85,
      borderOpacity: 0.35,
    },
    countryOpacity: 0,
  });

  // Corner brackets
  const mkBracket = function* (x: number, y: number, sx: number, sy: number) {
    const r = createRef<Layout>();
    yield view.add(
      <Layout ref={r} x={x} y={y} opacity={0} zIndex={35}>
        <Rect width={28} height={2} fill={accent} x={sx * 13} />
        <Rect width={2} height={28} fill={accent} y={sy * 13} />
      </Layout>,
    );
    return r;
  };
  const b1 = yield* mkBracket(-520, -280, 1, 1);
  const b2 = yield* mkBracket(520, -280, -1, 1);
  const b3 = yield* mkBracket(-520, 280, 1, -1);
  const b4 = yield* mkBracket(520, 280, -1, -1);

  const chip = createRef<Layout>();
  yield view.add(
    <Layout ref={chip} x={-420} y={-300} opacity={0} zIndex={40}>
      <Rect width={160} height={28} fill={accent} radius={2} />
      <Txt text={subtitle} fill={"#100e0c"} fontFamily={MONO} fontSize={12} letterSpacing={2} fontWeight={700} />
    </Layout>,
  );
  const titleRef = createRef<Txt>();
  yield view.add(
    <Txt ref={titleRef} text={title} fill={"#f7f1e6"} fontFamily={SERIF} fontSize={42} fontWeight={700} y={-250} opacity={0} zIndex={40} />,
  );

  yield* pause(extra[0]);
  yield* all(
    mark().opacity(0.07, t.revealDuration, easeOutCubic),
    b1().opacity(1, t.revealDuration, easeOutCubic),
    b2().opacity(1, t.revealDuration, easeOutCubic),
    b3().opacity(1, t.revealDuration, easeOutCubic),
    b4().opacity(1, t.revealDuration, easeOutCubic),
  );

  // Stroke-trace the country first, then flood fill
  map.refs.country().fill(null);
  map.refs.country().lineWidth(2.4);
  map.refs.country().opacity(1);
  map.refs.country().end(0);
  yield* pause(t.connectDelay);
  yield* all(
    tweenView(map.refs, wide, close, t.lineDuration * 1.15),
    map.refs.country().end(1, t.lineDuration * 1.15, easeOutCubic),
  );

  yield* pause(extra[1]);
  map.refs.country().fill(accent);
  map.refs.country().opacity(0);
  yield* map.refs.country().opacity(0.78, t.revealDuration * 1.2, easeOutCubic);

  yield* pause(t.stepDelay);
  yield* pause(extra[2]);
  yield* all(
    chip().opacity(1, t.revealDuration, easeOutCubic),
    titleRef().opacity(1, t.revealDuration, easeOutCubic),
  );
  yield* waitFor(1.15);
}

/* ═══════════════════════════════════════════════════════════════
   3) MAP SPOTLIGHT — phosphor radar / broadcast target
   ═══════════════════════════════════════════════════════════════ */
function* mapSpotlight(view: any) {
  const place = getPlace(str("placeKey", "india"));
  const region = str("region", "South Asia");
  const fact = str("fact", "Fastest growing internet region");
  const highlight = str("highlight", "Fastest growing");
  const accent = str("accent", "#3dff9a");
  const bg = str("bg", "#010503");
  const t = timing();
  view.fill(bg);

  const [lon, lat] = countryCentroid(place.iso);
  const drawing = drawFlatWorld({ highlightIso: place.iso });
  const focus = viewAt(drawing, lon, lat, 2.05);

  yield* pause(t.startDelay);
  const extra = itemDelays(3);

  // Scanlines
  for (let i = 0; i < 18; i++) {
    yield view.add(
      <Rect
        width={1280}
        height={1}
        y={-340 + i * 40}
        fill={accent}
        opacity={0.04}
        zIndex={2}
      />,
    );
  }

  const map = yield* mountFlatMap(view, drawing, {
    accent,
    initial: focus,
    theme: {
      land: "#0a2818",
      border: "#1a5c3a",
      graticule: "#063018",
      landOpacity: 0.9,
    },
  });

  const local = drawing.projection([lon, lat]) || [0, 0];

  // Crosshair
  const cross = createRef<Layout>();
  yield map.refs.plate().add(
    <Layout ref={cross} x={local[0]} y={local[1]} opacity={0} zIndex={8}>
      <Rect width={36 / focus.scale} height={1.2 / focus.scale} fill={accent} />
      <Rect width={1.2 / focus.scale} height={36 / focus.scale} fill={accent} />
      <Circle size={10 / focus.scale} fill={null} stroke={accent} lineWidth={1.2 / focus.scale} />
    </Layout>,
  );

  // Sweep arm
  const sweep = createRef<Rect>();
  yield map.refs.plate().add(
    <Rect
      ref={sweep}
      width={90 / focus.scale}
      height={1.5 / focus.scale}
      fill={accent}
      x={local[0]}
      y={local[1]}
      offset={[-1, 0]}
      opacity={0}
      zIndex={7}
    />,
  );

  const hudL = createRef<Txt>();
  const hudR = createRef<Txt>();
  const factRef = createRef<Txt>();
  const nameRef = createRef<Txt>();
  yield view.add(
    <Txt
      ref={hudL}
      text={`LAT ${lat.toFixed(2)}  LON ${lon.toFixed(2)}`}
      fill={accent}
      fontFamily={MONO}
      fontSize={13}
      x={-420}
      y={300}
      opacity={0}
      zIndex={40}
    />,
  );
  yield view.add(
    <Txt
      ref={hudR}
      text={`SECTOR · ${region.toUpperCase()}`}
      fill={accent}
      fontFamily={MONO}
      fontSize={13}
      x={400}
      y={300}
      opacity={0}
      zIndex={40}
    />,
  );
  yield view.add(
    <Txt ref={nameRef} text={place.name.toUpperCase()} fill={accent} fontFamily={MONO} fontSize={28} letterSpacing={4} y={-300} opacity={0} zIndex={40} />,
  );
  yield view.add(
    <Txt ref={factRef} text={highlight || fact} fill={"#b8ffd6"} fontFamily={SANS} fontSize={18} y={-260} opacity={0} zIndex={40} />,
  );

  yield* pause(extra[0]);
  map.refs.country().opacity(0.55);
  map.refs.country().end(0);
  yield* all(
    map.refs.country().end(1, t.lineDuration, easeOutCubic),
    cross().opacity(1, t.revealDuration, easeOutCubic),
    sweep().opacity(0.7, t.revealDuration, easeOutCubic),
    nameRef().opacity(1, t.revealDuration, easeOutCubic),
  );

  // Expanding rings + sweep rotation
  yield* pause(t.connectDelay);
  const rings = [7, 13, 20];
  yield* all(
    (function* () {
      const steps = Math.max(16, Math.round(t.lineDuration * 1.4 * 28));
      const dt = (t.lineDuration * 1.4) / steps;
      for (let i = 1; i <= steps; i++) {
        sweep().rotation((i / steps) * 360);
        yield* waitFor(dt);
      }
    })(),
    (function* () {
      for (let i = 0; i < rings.length; i++) {
        const ring = createRef<Path>();
        yield map.refs.plate().add(
          <Path
            ref={ring}
            data={drawing.ring(lon, lat, rings[i])}
            fill={null}
            stroke={accent}
            lineWidth={1.2 / focus.scale}
            end={0}
            opacity={0.65}
            zIndex={6}
          />,
        );
        yield* ring().end(1, t.lineDuration * 0.55, easeOutCubic);
        yield* ring().opacity(0.15, 0.25, easeOutCubic);
        yield* pause(t.connectDelay * 0.5);
      }
    })(),
  );

  yield* pause(extra[1]);
  yield* all(
    hudL().opacity(1, t.revealDuration, easeOutCubic),
    hudR().opacity(1, t.revealDuration, easeOutCubic),
  );
  yield* pause(extra[2]);
  yield* factRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.0);
}

/* ═══════════════════════════════════════════════════════════════
   4) ZOOM LOCATION — dossier + red string
   ═══════════════════════════════════════════════════════════════ */
function* zoomLocation(view: any) {
  const place = getPlace(str("placeKey", "india"));
  const city = str("city", "Mumbai");
  const detail = str("detail", "Financial capital under pressure");
  const highlight = str("highlight", "pressure");
  const accent = str("accent", "#e23d3d");
  const bg = str("bg", "#0b0a0f");
  const t = timing();
  view.fill(bg);

  const drawing = drawFlatWorld({ highlightIso: place.iso });
  const wide: MapView = { scale: 1.05, x: -40, y: 10 };
  const close = viewAt(drawing, place.capital[0], place.capital[1], 2.4);

  yield* pause(t.startDelay);
  const extra = itemDelays(4);

  const map = yield* mountFlatMap(view, drawing, {
    accent: "#6a7a8c",
    countryFill: "#3a4555",
    initial: wide,
    theme: {
      land: "#1a1e28",
      border: "#3a4455",
      showGraticule: false,
      landOpacity: 0.75,
      borderOpacity: 0.4,
    },
  });

  yield* pause(extra[0]);
  yield* tweenView(map.refs, wide, close, Math.max(t.lineDuration * 1.1, 0.9));
  map.refs.country().opacity(0.45);
  map.refs.country().end(0);
  yield* map.refs.country().end(1, t.lineDuration * 0.5, easeOutCubic);

  const pinXy = screenXy(drawing, close, place.capital);
  if (!pinXy) {
    yield* waitFor(1);
    return;
  }

  const pin = createRef<Layout>();
  yield view.add(
    <Layout ref={pin} x={pinXy[0]} y={pinXy[1]} scale={0} zIndex={30}>
      <Circle size={18} fill={accent} y={-16} shadowColor={accent} shadowBlur={12} />
      <Circle size={6} fill={"#fff"} y={-16} />
      <Rect width={2} height={14} fill={accent} y={-2} />
    </Layout>,
  );
  yield* pause(t.stepDelay);
  yield* pin().scale(1, t.revealDuration, easeOutBack);

  // Dossier card
  const card = createRef<Layout>();
  const cardX = 380;
  const cardY = 160;
  yield view.add(
    <Layout ref={card} x={cardX + 80} y={cardY + 40} opacity={0} zIndex={40} rotation={-3}>
      <Rect width={320} height={180} fill={"#f4efe4"} radius={4} shadowColor={"#000"} shadowBlur={24} />
      <Rect width={320} height={8} fill={accent} y={-86} />
      <Txt text={"LOCATION FILE"} fill={accent} fontFamily={MONO} fontSize={11} letterSpacing={3} y={-62} />
      <Txt text={city} fill={"#1a1410"} fontFamily={SERIF} fontSize={28} fontWeight={700} y={-28} />
      <Txt text={place.name} fill={"#5a5048"} fontFamily={SANS} fontSize={14} y={6} />
      <Txt text={detail} fill={"#2a2420"} fontFamily={SANS} fontSize={14} y={40} width={280} textWrap textAlign={"center"} />
      <Txt text={highlight} fill={accent} fontFamily={SERIF} fontSize={13} fontStyle={"italic"} y={72} />
    </Layout>,
  );

  yield* pause(extra[1]);
  yield* all(
    card().opacity(1, t.revealDuration, easeOutCubic),
    card().position([cardX, cardY], t.revealDuration * 1.2, easeOutCubic),
  );

  // Red string from pin to card corner
  const string = createRef<Line>();
  yield view.add(
    <Line
      ref={string}
      points={[
        [pinXy[0], pinXy[1] - 16],
        [pinXy[0], pinXy[1] - 16],
      ]}
      stroke={accent}
      lineWidth={1.6}
      opacity={0.85}
      zIndex={25}
    />,
  );
  yield* pause(t.connectDelay);
  yield* pause(extra[2]);
  const steps = 18;
  const dt = t.lineDuration * 0.6 / steps;
  for (let i = 1; i <= steps; i++) {
    const u = easeOut3(i / steps);
    string().points([
      [pinXy[0], pinXy[1] - 16],
      [pinXy[0] + (cardX - 150 - pinXy[0]) * u, pinXy[1] - 16 + (cardY - 90 - (pinXy[1] - 16)) * u],
    ]);
    yield* waitFor(dt);
  }

  yield* pause(extra[3]);
  yield* waitFor(1.1);
}

/* ═══════════════════════════════════════════════════════════════
   5) WORLD FOCUS — letterboxed ribbon travel
   ═══════════════════════════════════════════════════════════════ */
function* worldFocus(view: any) {
  const title = str("title", "Around the world");
  const subtitle = str("subtitle", "Global stories, animated");
  const place = getPlace(str("placeKey", "india"));
  const pinLabel = str("pinLabel", "New Delhi");
  const accent = str("accent", "#ffb020");
  const bg = str("bg", "#060a10");
  const t = timing();
  view.fill(bg);

  const drawing = drawFlatWorld({ highlightIso: place.iso });
  const start: MapView = { scale: 1.15, x: 220, y: 0 };
  const end = viewAt(drawing, place.capital[0], place.capital[1], 2.6);

  yield* pause(t.startDelay);
  const extra = itemDelays(3);

  // Letterbox bars
  const topBar = createRef<Rect>();
  const botBar = createRef<Rect>();
  yield view.add(<Rect ref={topBar} width={1400} height={90} y={-360} fill={"#000"} zIndex={50} />);
  yield view.add(<Rect ref={botBar} width={1400} height={90} y={360} fill={"#000"} zIndex={50} />);

  const map = yield* mountFlatMap(view, drawing, {
    accent,
    initial: start,
    theme: {
      land: "#1c3d52",
      border: "#5a849c",
      graticule: "#143040",
      landOpacity: 0.95,
    },
  });

  const titleRef = createRef<Txt>();
  const subRef = createRef<Txt>();
  yield view.add(
    <Txt
      ref={titleRef}
      text={title}
      fill={"#fff8ec"}
      fontFamily={SERIF}
      fontSize={36}
      fontWeight={700}
      y={280}
      opacity={0}
      zIndex={55}
    />,
  );
  yield view.add(
    <Txt
      ref={subRef}
      text={subtitle}
      fill={accent}
      fontFamily={SANS}
      fontSize={15}
      y={318}
      opacity={0}
      zIndex={55}
    />,
  );

  yield* pause(extra[0]);
  yield* titleRef().opacity(1, t.revealDuration, easeOutCubic);

  // Ribbon pan into destination
  yield* tweenView(map.refs, start, end, Math.max(t.lineDuration * 1.85, 1.4));
  yield* pause(t.connectDelay);

  map.refs.country().end(0);
  map.refs.country().opacity(0.9);
  yield* map.refs.country().end(1, t.lineDuration * 0.5, easeOutCubic);

  const xy = screenXy(drawing, end, place.capital);
  if (xy) {
    // Burst rings
    for (const s of [28, 48, 72]) {
      const ring = createRef<Circle>();
      yield view.add(
        <Circle ref={ring} size={8} x={xy[0]} y={xy[1]} fill={null} stroke={accent} lineWidth={2} opacity={0.9} zIndex={35} />,
      );
      yield* all(
        ring().size(s, 0.35, easeOutCubic),
        ring().opacity(0, 0.35, easeOutCubic),
      );
    }
    const pin = createRef<Layout>();
    const lbl = createRef<Txt>();
    yield view.add(
      <Layout ref={pin} x={xy[0]} y={xy[1]} scale={0} zIndex={36}>
        <Circle size={16} fill={accent} y={-16} />
        <Circle size={5} fill={"#fff"} y={-16} />
      </Layout>,
    );
    yield view.add(
      <Txt ref={lbl} text={pinLabel} fill={"#fff8ec"} fontFamily={SERIF} fontSize={16} x={xy[0] + 22} y={xy[1] - 20} opacity={0} zIndex={36} />,
    );
    yield* pause(extra[1]);
    yield* pin().scale(1, t.revealDuration, easeOutBack);
    yield* lbl().opacity(1, t.revealDuration, easeOutCubic);
  }

  // Open letterbox slightly + subtitle
  yield* pause(extra[2]);
  yield* all(
    topBar().y(-400, 0.45, easeOutCubic),
    botBar().y(400, 0.45, easeOutCubic),
    subRef().opacity(1, t.revealDuration, easeOutCubic),
  );
  yield* waitFor(1.0);
}

/* ═══════════════════════════════════════════════════════════════
   6) DISTANCE SLAM — giant km counter (new)
   ═══════════════════════════════════════════════════════════════ */
function* mapDistance(view: any) {
  const from = getPlace(str("fromPlace", "india"));
  const to = getPlace(str("toPlace", "usa"));
  const title = str("title", `${from.name} → ${to.name}`);
  const accent = str("accent", "#ff6b4a");
  const bg = str("bg", "#0a0c12");
  const t = timing();
  view.fill(bg);

  const km = haversineKm(from.capital, to.capital);
  const drawing = drawFlatWorld();
  const framed = viewSpan(drawing, from.capital, to.capital, 1.35);

  yield* pause(t.startDelay);
  const extra = itemDelays(3);

  const map = yield* mountFlatMap(view, drawing, {
    accent,
    initial: framed,
    theme: {
      land: "#161c28",
      border: "#2e3a4e",
      showGraticule: false,
      landOpacity: 0.55,
      borderOpacity: 0.35,
    },
  });

  const route = createRef<Path>();
  yield map.refs.plate().add(
    <Path
      ref={route}
      data={drawing.route(from.capital, to.capital)}
      fill={null}
      stroke={accent}
      lineWidth={3 / framed.scale}
      end={0}
      lineCap={"round"}
      zIndex={5}
    />,
  );

  const big = createRef<Txt>();
  const unit = createRef<Txt>();
  const titleRef = createRef<Txt>();
  const fromLbl = createRef<Txt>();
  const toLbl = createRef<Txt>();
  yield view.add(
    <Txt ref={big} text={"0"} fill={"#fff"} fontFamily={SANS} fontSize={96} fontWeight={800} y={-40} opacity={0} zIndex={40} />,
  );
  yield view.add(
    <Txt ref={unit} text={"KILOMETRES"} fill={accent} fontFamily={MONO} fontSize={14} letterSpacing={6} y={40} opacity={0} zIndex={40} />,
  );
  yield view.add(
    <Txt ref={titleRef} text={title} fill={"#c8d0dc"} fontFamily={SERIF} fontSize={22} y={-280} opacity={0} zIndex={40} />,
  );
  yield view.add(
    <Txt ref={fromLbl} text={from.name} fill={"#9aa8bc"} fontFamily={SANS} fontSize={16} x={-200} y={280} opacity={0} zIndex={40} />,
  );
  yield view.add(
    <Txt ref={toLbl} text={to.name} fill={"#9aa8bc"} fontFamily={SANS} fontSize={16} x={200} y={280} opacity={0} zIndex={40} />,
  );

  yield* pause(extra[0]);
  yield* titleRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* all(
    big().opacity(1, 0.2, easeOutCubic),
    unit().opacity(1, t.revealDuration, easeOutCubic),
    route().end(1, t.lineDuration, easeOutCubic),
    countUp(big, km, t.lineDuration),
  );
  yield* pause(extra[1]);
  yield* all(
    fromLbl().opacity(1, t.revealDuration, easeOutCubic),
    toLbl().opacity(1, t.revealDuration, easeOutCubic),
  );
  yield* pause(extra[2]);
  yield* waitFor(1.1);
}

/* ═══════════════════════════════════════════════════════════════
   7) SPLIT COMPARE — diptych two countries (new)
   ═══════════════════════════════════════════════════════════════ */
function* mapSplit(view: any) {
  const left = getPlace(str("fromPlace", "india"));
  const right = getPlace(str("toPlace", "china"));
  const title = str("title", "Two powers");
  const accent = str("accent", "#5b8cff");
  const accent2 = str("lineColor", "#ff6b4a");
  const bg = str("bg", "#08090e");
  const t = timing();
  view.fill(bg);

  yield* pause(t.startDelay);
  const extra = itemDelays(3);

  const drawL = drawFlatWorld({ highlightIso: left.iso, centerLon: left.capital[0] });
  const drawR = drawFlatWorld({ highlightIso: right.iso, centerLon: right.capital[0] });
  const [llon, llat] = countryCentroid(left.iso);
  const [rlon, rlat] = countryCentroid(right.iso);
  const viewL = viewAt(drawL, llon, llat, 2.8);
  const viewR = viewAt(drawR, rlon, rlat, 2.8);

  // Split panels with fixed size for clipping
  const leftPanel = createRef<Layout>();
  const rightPanel = createRef<Layout>();
  yield view.add(
    <Layout ref={leftPanel} x={-320} width={560} height={520} clip layout={false} zIndex={10} />,
  );
  yield view.add(
    <Layout ref={rightPanel} x={320} width={560} height={520} clip layout={false} zIndex={10} />,
  );

  // Mask frames
  const frameL = createRef<Rect>();
  const frameR = createRef<Rect>();
  yield view.add(
    <Rect ref={frameL} width={560} height={520} x={-320} fill={null} stroke={accent} lineWidth={1.5} radius={4} opacity={0} zIndex={20} />,
  );
  yield view.add(
    <Rect ref={frameR} width={560} height={520} x={320} fill={null} stroke={accent2} lineWidth={1.5} radius={4} opacity={0} zIndex={20} />,
  );

  // Soft panel backgrounds
  yield leftPanel().add(<Rect width={560} height={520} fill={"#0c1018"} />);
  yield rightPanel().add(<Rect width={560} height={520} fill={"#100c0c"} />);

  const plateL = createRef<Layout>();
  const plateR = createRef<Layout>();
  const countryL = createRef<Path>();
  const countryR = createRef<Path>();
  yield leftPanel().add(
    <Layout ref={plateL} layout={false} x={viewL.x} y={viewL.y} scale={viewL.scale}>
      <Path data={drawL.land} fill={"#1a2a40"} />
      <Path data={drawL.borders} fill={null} stroke={"#4a6a8a"} lineWidth={0.5} opacity={0.4} />
      <Path ref={countryL} data={drawL.country} fill={accent} stroke={accent} lineWidth={1.4} opacity={0} end={0} />
    </Layout>,
  );
  yield rightPanel().add(
    <Layout ref={plateR} layout={false} x={viewR.x} y={viewR.y} scale={viewR.scale}>
      <Path data={drawR.land} fill={"#2a1a18"} />
      <Path data={drawR.borders} fill={null} stroke={"#8a5a4a"} lineWidth={0.5} opacity={0.4} />
      <Path ref={countryR} data={drawR.country} fill={accent2} stroke={accent2} lineWidth={1.4} opacity={0} end={0} />
    </Layout>,
  );

  const vs = createRef<Txt>();
  const titleRef = createRef<Txt>();
  const leftName = createRef<Txt>();
  const rightName = createRef<Txt>();
  yield view.add(
    <Txt ref={vs} text={"VS"} fill={"#fff"} fontFamily={SANS} fontSize={28} fontWeight={800} opacity={0} zIndex={50} />,
  );
  yield view.add(
    <Txt ref={titleRef} text={title} fill={"#dce4f0"} fontFamily={SERIF} fontSize={24} y={-300} opacity={0} zIndex={50} />,
  );
  yield view.add(
    <Txt ref={leftName} text={left.name.toUpperCase()} fill={accent} fontFamily={MONO} fontSize={16} letterSpacing={3} x={-320} y={300} opacity={0} zIndex={50} />,
  );
  yield view.add(
    <Txt ref={rightName} text={right.name.toUpperCase()} fill={accent2} fontFamily={MONO} fontSize={16} letterSpacing={3} x={320} y={300} opacity={0} zIndex={50} />,
  );

  // Slide panels in from sides
  leftPanel().x(-900);
  rightPanel().x(900);
  yield* pause(extra[0]);
  yield* all(
    titleRef().opacity(1, t.revealDuration, easeOutCubic),
    leftPanel().x(-320, t.lineDuration, easeOutCubic),
    rightPanel().x(320, t.lineDuration, easeOutCubic),
    frameL().opacity(0.7, t.lineDuration, easeOutCubic),
    frameR().opacity(0.7, t.lineDuration, easeOutCubic),
  );

  yield* pause(t.connectDelay);
  countryL().opacity(0.85);
  countryR().opacity(0.85);
  yield* all(
    countryL().end(1, t.lineDuration * 0.8, easeOutCubic),
    countryR().end(1, t.lineDuration * 0.8, easeOutCubic),
    vs().opacity(1, t.revealDuration, easeOutBack),
    vs().scale(1.15, t.revealDuration, easeOutBack),
  );

  yield* pause(extra[1]);
  yield* all(
    leftName().opacity(1, t.revealDuration, easeOutCubic),
    rightName().opacity(1, t.revealDuration, easeOutCubic),
  );
  yield* pause(extra[2]);
  yield* waitFor(1.1);
}

/* ═══════════════════════════════════════════════════════════════
   8) BORDER TRACE — outline-only calligraphy (new)
   ═══════════════════════════════════════════════════════════════ */
function* mapBorderTrace(view: any) {
  const place = getPlace(str("placeKey", "india"));
  const title = str("title", place.name);
  const subtitle = str("subtitle", "Outlined");
  const accent = str("accent", "#f0e6d0");
  const bg = str("bg", "#050508");
  const t = timing();
  view.fill(bg);

  const [lon, lat] = countryCentroid(place.iso);
  const drawing = drawFlatWorld({ highlightIso: place.iso });
  const close = viewAt(drawing, lon, lat, 3.2);

  yield* pause(t.startDelay);
  const extra = itemDelays(3);

  // Nearly invisible world — focus is the stroke
  const map = yield* mountFlatMap(view, drawing, {
    accent,
    initial: close,
    theme: {
      land: "#0c0c12",
      border: "#1a1a24",
      showGraticule: false,
      landOpacity: 0.35,
      borderOpacity: 0.15,
    },
  });

  map.refs.country().fill(null);
  map.refs.country().stroke(accent);
  map.refs.country().lineWidth(2.8);
  map.refs.country().opacity(1);
  map.refs.country().end(0);
  map.refs.country().lineCap("round");

  const ghost = createRef<Txt>();
  const titleRef = createRef<Txt>();
  const subRef = createRef<Txt>();
  yield view.add(
    <Txt
      ref={ghost}
      text={title.charAt(0)}
      fill={accent}
      fontFamily={SERIF}
      fontSize={280}
      fontWeight={700}
      opacity={0}
      x={380}
      y={20}
      zIndex={5}
    />,
  );
  yield view.add(
    <Txt ref={titleRef} text={title} fill={accent} fontFamily={SERIF} fontSize={40} fontWeight={700} x={-360} y={-280} opacity={0} zIndex={40} />,
  );
  yield view.add(
    <Txt ref={subRef} text={subtitle.toUpperCase()} fill={"#6a6878"} fontFamily={MONO} fontSize={13} letterSpacing={5} x={-360} y={-240} opacity={0} zIndex={40} />,
  );

  // Hairline rule
  const rule = createRef<Rect>();
  yield view.add(<Rect ref={rule} width={0} height={1} fill={accent} x={-360} y={-255} offset={[-1, 0]} opacity={0.7} zIndex={40} />);

  yield* pause(extra[0]);
  yield* all(
    ghost().opacity(0.06, t.revealDuration, easeOutCubic),
    map.refs.country().end(1, Math.max(t.lineDuration * 1.8, 1.5), easeInOutCubic),
  );

  yield* pause(extra[1]);
  yield* all(
    titleRef().opacity(1, t.revealDuration, easeOutCubic),
    subRef().opacity(1, t.revealDuration, easeOutCubic),
    rule().width(160, t.lineDuration * 0.6, easeOutCubic),
  );

  // Soft fill after trace
  yield* pause(t.connectDelay);
  map.refs.country().fill(accent);
  yield* map.refs.country().opacity(0.22, t.revealDuration, easeOutCubic);

  yield* pause(extra[2]);
  yield* waitFor(1.15);
}

export function* runMaps(view: any, template: string) {
  switch (template) {
    case "airplane-route":
      yield* airplaneRoute(view);
      break;
    case "country-highlight":
      yield* countryHighlight(view);
      break;
    case "map-spotlight":
      yield* mapSpotlight(view);
      break;
    case "zoom-location":
      yield* zoomLocation(view);
      break;
    case "globe-spin":
    case "world-focus":
      yield* worldFocus(view);
      break;
    case "map-distance":
      yield* mapDistance(view);
      break;
    case "map-split":
      yield* mapSplit(view);
      break;
    case "map-border-trace":
      yield* mapBorderTrace(view);
      break;
    default:
      yield* countryHighlight(view);
  }
}
