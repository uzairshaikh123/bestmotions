/** @jsxImportSource @revideo/2d/lib */
/**
 * Realistic map animations using live Esri basemap imagery
 * (satellite / street / topo) via the same-origin /api/map-image proxy.
 */
import { Circle, Img, Layout, Line, Node, Polygon, Rect, Txt } from "@revideo/2d";
import {
  all,
  createRef,
  easeOutBack,
  easeOutCubic,
  num,
  str,
  waitFor,
} from "../../lib/helpers";
import { easeInOutCubic } from "@revideo/core";
import { getPlace } from "../../lib/places";
import { geocodeSrc } from "../../lib/geocode";
import {
  ZOOM_SPANS,
  bboxAround,
  bboxUnion,
  mapImageUrl,
  projectLonLat,
  type MapStyle,
} from "../../lib/realMap";
import { pause, timing } from "../../lib/timing";

const SERIF = "Libre Baskerville, Georgia, serif";
const UI = "Inter, Segoe UI, system-ui, sans-serif";
/** Amber target accent — matches cinematic satellite engine reference. */
const TARGET_AMBER = "#f59e0b";

/** Tiny dark placeholder if Esri/proxy is slow or down — never block the scene. */
const MAP_FALLBACK =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0b1c28"/><stop offset="100%" stop-color="#12263a"/>
      </linearGradient></defs>
      <rect width="1280" height="720" fill="url(#g)"/>
      <circle cx="640" cy="360" r="180" fill="#1c3a50" opacity="0.7"/>
      <text x="640" y="370" text-anchor="middle" fill="#7ec8e3" font-family="sans-serif" font-size="28">Map preview</text>
    </svg>`,
  );

async function resolveMapSrc(src: string, ms = 3500): Promise<string> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    const res = await fetch(src, { signal: ctrl.signal, mode: "cors" });
    clearTimeout(timer);
    if (!res.ok) return MAP_FALLBACK;
    // Warm the browser cache so Revideo Img resolves immediately
    const blob = await res.blob();
    if (!blob.size) return MAP_FALLBACK;
    return URL.createObjectURL(blob);
  } catch {
    return MAP_FALLBACK;
  }
}

/** Await map bytes (or fallback) so Img never hangs the scene forever. */
function* mapSrc(
  src: string,
  ms = 3500,
): Generator<Promise<string>, string, string> {
  return yield resolveMapSrc(src, ms);
}

function lite() {
  const v = str("litePreview", "off").toLowerCase();
  return v === "on" || v === "true" || v === "1";
}

function mapSize() {
  return lite() ? { w: 640, h: 360 } : { w: 1280, h: 720 };
}

function styleOf(fallback: MapStyle = "satellite"): MapStyle {
  const raw = str("mapStyle", fallback).toLowerCase();
  if (raw === "street" || raw === "topo" || raw === "dark" || raw === "satellite") {
    return raw;
  }
  return fallback;
}

function* credit(view: any, label = "Esri basemap") {
  yield view.add(
    <Txt
      text={label}
      fill={"#ffffff"}
      fontFamily={SERIF}
      fontSize={11}
      opacity={0.55}
      x={520}
      y={330}
    />,
  );
}

function* titleHud(view: any, title: string, subtitle: string, accent: string) {
  const tRef = createRef<Txt>();
  const sRef = createRef<Txt>();
  yield view.add(
    <Txt
      ref={tRef}
      text={title}
      fill={"#ffffff"}
      fontFamily={SERIF}
      fontSize={28}
      fontWeight={700}
      y={-300}
      opacity={0}
      shadowColor={"#000000aa"}
      shadowBlur={14}
    />,
  );
  yield view.add(
    <Txt
      ref={sRef}
      text={subtitle}
      fill={accent}
      fontFamily={SERIF}
      fontSize={15}
      y={-262}
      opacity={0}
      shadowColor={"#00000088"}
      shadowBlur={10}
    />,
  );
  return { tRef, sRef };
}

function Pin(opts: { x: number; y: number; color: string; scale?: number }) {
  return (
    <Node x={opts.x} y={opts.y} scale={opts.scale ?? 1}>
      <Circle size={22} fill={opts.color} y={-18} shadowColor={"#00000088"} shadowBlur={10} />
      <Circle size={8} fill={"#ffffff"} y={-18} />
      <Polygon sides={3} width={14} height={16} fill={opts.color} y={-2} rotation={180} />
    </Node>
  );
}

/** Glowing target marker — core + expanding pulse rings (Leaflet-style). */
function GlowTarget(opts: {
  core: ReturnType<typeof createRef<Circle>>;
  ringA: ReturnType<typeof createRef<Circle>>;
  ringB: ReturnType<typeof createRef<Circle>>;
  color: string;
}) {
  return (
    <Node>
      <Circle
        ref={opts.ringB}
        size={28}
        stroke={opts.color}
        lineWidth={2}
        fill={null}
        opacity={0}
      />
      <Circle
        ref={opts.ringA}
        size={20}
        stroke={opts.color}
        lineWidth={2.5}
        fill={null}
        opacity={0}
      />
      <Circle
        ref={opts.core}
        size={14}
        fill={opts.color}
        opacity={0}
        shadowColor={opts.color}
        shadowBlur={22}
      />
      <Circle size={5} fill={"#ffffff"} opacity={0.95} />
    </Node>
  );
}

function* pulseRings(
  ringA: ReturnType<typeof createRef<Circle>>,
  ringB: ReturnType<typeof createRef<Circle>>,
  cycles = 2,
) {
  for (let i = 0; i < cycles; i++) {
    ringA().size(20);
    ringA().opacity(0.95);
    ringB().size(28);
    ringB().opacity(0.55);
    yield* all(
      ringA().size(110, 1.15, easeOutCubic),
      ringA().opacity(0, 1.15, easeOutCubic),
      ringB().size(150, 1.35, easeOutCubic),
      ringB().opacity(0, 1.35, easeOutCubic),
    );
  }
}

/** Frosted glass acquisition panel — left HUD from the satellite engine reference. */
function* glassAcquireHud(
  view: any,
  opts: {
    title: string;
    subtitle: string;
    lat: number;
    lon: number;
    accent: string;
  },
) {
  const panel = createRef<Layout>();
  const nameRef = createRef<Txt>();
  const statusRef = createRef<Txt>();
  yield view.add(
    <Layout
      ref={panel}
      x={-420}
      y={-210}
      opacity={0}
      scale={0.96}
    >
      <Rect
        width={340}
        height={168}
        fill={"#0f172a99"}
        stroke={"#ffffff22"}
        lineWidth={1}
        radius={16}
        shadowColor={"#00000088"}
        shadowBlur={28}
      />
      <Txt
        text={"BestMotions"}
        fill={"#f8fafc"}
        fontFamily={UI}
        fontSize={22}
        fontWeight={600}
        x={-78}
        y={-58}
      />
      <Circle size={8} fill={opts.accent} x={42} y={-58} shadowColor={opts.accent} shadowBlur={10} />
      <Txt
        text={"CINEMATIC SATELLITE ENGINE"}
        fill={"#94a3b8"}
        fontFamily={UI}
        fontSize={9}
        letterSpacing={2.2}
        x={-22}
        y={-34}
      />
      <Rect width={300} height={1} fill={"#ffffff18"} y={-16} />
      <Txt
        ref={statusRef}
        text={"ACQUIRING TARGET…"}
        fill={"#94a3b8"}
        fontFamily={UI}
        fontSize={10}
        letterSpacing={1.6}
        x={-78}
        y={4}
      />
      <Txt
        ref={nameRef}
        text={opts.title}
        fill={opts.accent}
        fontFamily={UI}
        fontSize={15}
        fontWeight={600}
        x={-8}
        y={28}
        width={300}
        textAlign={"left"}
      />
      <Txt
        text={`LAT  ${opts.lat.toFixed(4)}`}
        fill={"#cbd5e1"}
        fontFamily={"ui-monospace, Consolas, monospace"}
        fontSize={11}
        x={-98}
        y={58}
      />
      <Txt
        text={`LON  ${opts.lon.toFixed(4)}`}
        fill={"#cbd5e1"}
        fontFamily={"ui-monospace, Consolas, monospace"}
        fontSize={11}
        x={42}
        y={58}
      />
      <Txt
        text={opts.subtitle}
        fill={"#64748b"}
        fontFamily={UI}
        fontSize={10}
        x={-40}
        y={78}
        opacity={0.85}
      />
    </Layout>,
  );
  return { panel, nameRef, statusRef };
}

/** Soft vignette for cinema grade framing. */
function* vignette(view: any) {
  yield view.add(<Rect width={1280} height={90} fill={"#000000"} y={-315} opacity={0.45} />);
  yield view.add(<Rect width={1280} height={110} fill={"#000000"} y={305} opacity={0.55} />);
  yield view.add(<Rect width={100} height={720} fill={"#000000"} x={-590} opacity={0.35} />);
  yield view.add(<Rect width={100} height={720} fill={"#000000"} x={590} opacity={0.35} />);
}

/** Satellite Ken Burns into a real city. */
function* satZoom(view: any) {
  const place = getPlace(str("placeKey", "india"));
  const title = str("title", place.name);
  const subtitle = str("subtitle", "Satellite · capital metro");
  const accent = str("accent", "#ff5a3a");
  const span = num("spanLat", ZOOM_SPANS.metro);
  const t = timing();
  const size = mapSize();
  const bbox = bboxAround(place.capital[0], place.capital[1], span);
  const src = mapImageUrl(bbox, { style: styleOf("satellite"), ...size });
  const map = yield* mapSrc(src);
  view.fill(str("bg", "#05080d"));

  const frame = createRef<Layout>();
  const pin = createRef<Node>();
  const [px, py] = projectLonLat(place.capital[0], place.capital[1], bbox, 1280, 720);
  yield view.add(
    <Layout ref={frame} scale={1.35} x={-40} y={20}>
      <Img src={map} width={1280} height={720} />
    </Layout>,
  );
  yield view.add(
    <Node ref={pin} x={px} y={py - 120} opacity={0} scale={0.4}>
      <Pin x={0} y={0} color={accent} />
    </Node>,
  );
  const hud = yield* titleHud(view, title, subtitle, accent);
  yield* credit(view, "Esri World Imagery");

  yield* pause(t.startDelay);
  yield* all(
    hud.tRef().opacity(1, t.revealDuration, easeOutCubic),
    hud.sRef().opacity(1, t.revealDuration, easeOutCubic),
    frame().scale(1, Math.max(t.lineDuration * 2.2, 1.8), easeOutCubic),
    frame().x(0, Math.max(t.lineDuration * 2.2, 1.8), easeOutCubic),
    frame().y(0, Math.max(t.lineDuration * 2.2, 1.8), easeOutCubic),
  );
  yield* pause(t.connectDelay);
  yield* all(
    pin().opacity(1, 0.12),
    pin().y(py, t.revealDuration, easeOutBack),
    pin().scale(1, t.revealDuration, easeOutBack),
  );
  yield* waitFor(1.1);
}

/** Real street map with pin. */
function* streetPin(view: any) {
  const place = getPlace(str("placeKey", "uk"));
  const title = str("title", place.name);
  const subtitle = str("subtitle", "Street map · capital");
  const accent = str("accent", "#1d6fd8");
  const t = timing();
  const size = mapSize();
  const bbox = bboxAround(place.capital[0], place.capital[1], ZOOM_SPANS.city);
  const src = mapImageUrl(bbox, { style: styleOf("street"), ...size });
  const map = yield* mapSrc(src);
  view.fill(str("bg", "#0a0c10"));

  const frame = createRef<Layout>();
  const [px, py] = projectLonLat(place.capital[0], place.capital[1], bbox, 1280, 720);
  yield view.add(
    <Layout ref={frame} scale={1.2} y={30}>
      <Img src={map} width={1280} height={720} />
    </Layout>,
  );
  const pin = createRef<Node>();
  yield view.add(
    <Node ref={pin} x={px} y={py - 100} opacity={0}>
      <Pin x={0} y={0} color={accent} />
    </Node>,
  );
  const hud = yield* titleHud(view, title, subtitle, accent);
  yield* credit(view, "Esri World Street Map");

  yield* pause(t.startDelay);
  yield* all(
    hud.tRef().opacity(1, t.revealDuration, easeOutCubic),
    hud.sRef().opacity(1, t.revealDuration, easeOutCubic),
    frame().scale(1, t.lineDuration * 1.6, easeOutCubic),
    frame().y(0, t.lineDuration * 1.6, easeOutCubic),
  );
  yield* all(
    pin().opacity(1, 0.1),
    pin().y(py, t.revealDuration, easeOutBack),
  );
  yield* waitFor(1.15);
}

/** Satellite corridor covering two cities + route. */
function* satRoute(view: any) {
  const from = getPlace(str("fromPlace", "india"));
  const to = getPlace(str("toPlace", "uae"));
  const title = str("title", `${from.name} → ${to.name}`);
  const subtitle = str("subtitle", "Satellite corridor");
  const accent = str("accent", "#ffbf00");
  const t = timing();
  const size = mapSize();
  const a = bboxAround(from.capital[0], from.capital[1], ZOOM_SPANS.region);
  const b = bboxAround(to.capital[0], to.capital[1], ZOOM_SPANS.region);
  const bbox = bboxUnion(a, b, 0.2);
  const src = mapImageUrl(bbox, { style: styleOf("satellite"), ...size });
  const map = yield* mapSrc(src);
  const [ax, ay] = projectLonLat(from.capital[0], from.capital[1], bbox, 1280, 720);
  const [bx, by] = projectLonLat(to.capital[0], to.capital[1], bbox, 1280, 720);
  view.fill(str("bg", "#05080d"));

  yield view.add(<Img src={map} width={1280} height={720} />);
  const route = createRef<Line>();
  yield view.add(
    <Line
      ref={route}
      points={[
        [ax, ay],
        [bx, by],
      ]}
      stroke={accent}
      lineWidth={4}
      end={0}
      lineCap={"round"}
      shadowColor={accent}
      shadowBlur={16}
    />,
  );
  yield view.add(<Pin x={ax} y={ay} color={"#5ce1ff"} scale={0.9} />);
  const endPin = createRef<Node>();
  yield view.add(
    <Node ref={endPin} x={bx} y={by - 80} opacity={0}>
      <Pin x={0} y={0} color={accent} />
    </Node>,
  );
  const hud = yield* titleHud(view, title, subtitle, accent);
  yield* credit(view, "Esri World Imagery");

  yield* pause(t.startDelay);
  yield* all(
    hud.tRef().opacity(1, t.revealDuration, easeOutCubic),
    hud.sRef().opacity(1, t.revealDuration, easeOutCubic),
  );
  yield* route().end(1, t.lineDuration * 1.4, easeOutCubic);
  yield* all(
    endPin().opacity(1, 0.1),
    endPin().y(by, t.revealDuration, easeOutBack),
  );
  yield* waitFor(1.0);
}

/** Google-Earth-style staged zoom: continent → region → city (real imagery). */
function* zoomLevels(view: any) {
  const place = getPlace(str("placeKey", "japan"));
  const title = str("title", place.name);
  const subtitle = str("subtitle", "Continent → city");
  const accent = str("accent", "#ff5a3a");
  const t = timing();
  const size = mapSize();
  const spans = [ZOOM_SPANS.continent, ZOOM_SPANS.region, ZOOM_SPANS.city];
  const layers = spans.map((span) => {
    const bbox = bboxAround(place.capital[0], place.capital[1], span);
    return {
      bbox,
      src: mapImageUrl(bbox, { style: styleOf("satellite"), ...size }),
      map: MAP_FALLBACK as string,
    };
  });
  for (let i = 0; i < layers.length; i++) {
    layers[i].map = yield* mapSrc(layers[i].src);
  }
  view.fill(str("bg", "#05080d"));

  const refs = layers.map(() => createRef<Layout>());
  for (let i = 0; i < layers.length; i++) {
    yield view.add(
      <Layout ref={refs[i]} opacity={i === 0 ? 1 : 0} scale={i === 0 ? 1.08 : 1.2}>
        <Img src={layers[i].map} width={1280} height={720} />
      </Layout>,
    );
  }
  const city = layers[2].bbox;
  const [px, py] = projectLonLat(place.capital[0], place.capital[1], city, 1280, 720);
  const pin = createRef<Node>();
  yield view.add(
    <Node ref={pin} x={px} y={py - 90} opacity={0}>
      <Pin x={0} y={0} color={accent} />
    </Node>,
  );
  const hud = yield* titleHud(view, title, subtitle, accent);
  yield* credit(view, "Esri World Imagery");

  yield* pause(t.startDelay);
  yield* all(
    hud.tRef().opacity(1, t.revealDuration, easeOutCubic),
    hud.sRef().opacity(1, t.revealDuration, easeOutCubic),
    refs[0]().scale(1, t.lineDuration, easeOutCubic),
  );
  for (let i = 1; i < refs.length; i++) {
    yield* pause(t.stepDelay);
    yield* all(
      refs[i - 1]().opacity(0, t.revealDuration, easeOutCubic),
      refs[i]().opacity(1, t.revealDuration, easeOutCubic),
      refs[i]().scale(1, t.lineDuration, easeOutCubic),
    );
  }
  yield* all(
    pin().opacity(1, 0.12),
    pin().y(py, t.revealDuration, easeOutBack),
  );
  yield* waitFor(1.0);
}

/** Topographic basemap pan. */
function* topoPan(view: any) {
  const p = getPlace(str("placeKey", "france"));
  const title = str("title", p.name);
  const subtitle = str("subtitle", "Topographic basemap");
  const accent = str("accent", "#7ddea2");
  const t = timing();
  const size = mapSize();
  const bbox = bboxAround(p.capital[0], p.capital[1], ZOOM_SPANS.region);
  const src = mapImageUrl(bbox, { style: styleOf("topo"), ...size });
  const map = yield* mapSrc(src);
  view.fill(str("bg", "#0a100c"));

  const frame = createRef<Layout>();
  yield view.add(
    <Layout ref={frame} x={80}>
      <Img src={map} width={1280} height={720} />
    </Layout>,
  );
  const hud = yield* titleHud(view, title, subtitle, accent);
  yield* credit(view, "Esri World Topo Map");

  yield* pause(t.startDelay);
  yield* all(
    hud.tRef().opacity(1, t.revealDuration, easeOutCubic),
    hud.sRef().opacity(1, t.revealDuration, easeOutCubic),
    frame().x(-60, Math.max(t.lineDuration * 2, 1.6), easeOutCubic),
  );
  yield* waitFor(1.0);
}

/** Street vs satellite split compare. */
function* dualCompare(view: any) {
  const place = getPlace(str("placeKey", "usa"));
  const title = str("title", place.name);
  const subtitle = str("subtitle", "Street  ·  Satellite");
  const accent = str("accent", "#5ce1ff");
  const t = timing();
  const size = { w: lite() ? 480 : 720, h: lite() ? 360 : 720 };
  const bbox = bboxAround(place.capital[0], place.capital[1], ZOOM_SPANS.city);
  const street = mapImageUrl(bbox, { style: "street", ...size });
  const streetMap = yield* mapSrc(street);
  const sat = mapImageUrl(bbox, { style: "satellite", ...size });
  const satMap = yield* mapSrc(sat);
  view.fill(str("bg", "#05080d"));

  const left = createRef<Layout>();
  const right = createRef<Layout>();
  yield view.add(
    <Layout ref={left} x={-340} opacity={0}>
      <Img src={streetMap} width={600} height={720} />
      <Rect width={600} height={40} fill={"#00000099"} y={320} />
      <Txt text={"STREET"} fill={"#ffffff"} fontFamily={SERIF} fontSize={14} y={320} />
    </Layout>,
  );
  yield view.add(
    <Layout ref={right} x={340} opacity={0}>
      <Img src={satMap} width={600} height={720} />
      <Rect width={600} height={40} fill={"#00000099"} y={320} />
      <Txt text={"SATELLITE"} fill={"#ffffff"} fontFamily={SERIF} fontSize={14} y={320} />
    </Layout>,
  );
  const hud = yield* titleHud(view, title, subtitle, accent);
  yield* credit(view, "Esri Street + Imagery");

  yield* pause(t.startDelay);
  yield* all(
    hud.tRef().opacity(1, t.revealDuration, easeOutCubic),
    hud.sRef().opacity(1, t.revealDuration, easeOutCubic),
    left().opacity(1, t.revealDuration, easeOutCubic),
    left().x(-300, t.revealDuration, easeOutCubic),
    right().opacity(1, t.revealDuration, easeOutCubic),
    right().x(300, t.revealDuration, easeOutCubic),
  );
  yield* waitFor(1.25);
}

/** Regional satellite sweep / pan. */
function* regionSweep(view: any) {
  const place = getPlace(str("placeKey", "australia"));
  const title = str("title", place.name);
  const subtitle = str("subtitle", "Regional satellite sweep");
  const accent = str("accent", "#ff9933");
  const t = timing();
  const size = mapSize();
  const bbox = bboxAround(place.capital[0], place.capital[1], ZOOM_SPANS.country);
  const src = mapImageUrl(bbox, { style: styleOf("satellite"), ...size });
  const map = yield* mapSrc(src);
  view.fill(str("bg", "#05080d"));

  const frame = createRef<Layout>();
  yield view.add(
    <Layout ref={frame} scale={1.25} x={100}>
      <Img src={map} width={1280} height={720} />
    </Layout>,
  );
  const hud = yield* titleHud(view, title, subtitle, accent);
  yield* credit(view, "Esri World Imagery");

  yield* pause(t.startDelay);
  yield* all(
    hud.tRef().opacity(1, t.revealDuration, easeOutCubic),
    hud.sRef().opacity(1, t.revealDuration, easeOutCubic),
    frame().x(-100, Math.max(t.lineDuration * 2.4, 2), easeOutCubic),
    frame().scale(1.05, Math.max(t.lineDuration * 2.4, 2), easeOutCubic),
  );
  yield* waitFor(1.0);
}

/** Dark basemap with glowing pin (news-desk look). */
function* darkPin(view: any) {
  const place = getPlace(str("placeKey", "germany"));
  const title = str("title", place.name);
  const subtitle = str("subtitle", "Dark basemap");
  const accent = str("accent", "#ffd060");
  const t = timing();
  const size = mapSize();
  const bbox = bboxAround(place.capital[0], place.capital[1], ZOOM_SPANS.metro);
  const src = mapImageUrl(bbox, { style: styleOf("dark"), ...size });
  const map = yield* mapSrc(src);
  view.fill(str("bg", "#050608"));

  yield view.add(<Img src={map} width={1280} height={720} />);
  const [px, py] = projectLonLat(place.capital[0], place.capital[1], bbox, 1280, 720);
  const glow = createRef<Circle>();
  const pin = createRef<Node>();
  yield view.add(
    <Circle ref={glow} size={20} fill={accent} x={px} y={py} opacity={0} />,
  );
  yield view.add(
    <Node ref={pin} x={px} y={py - 100} opacity={0}>
      <Pin x={0} y={0} color={accent} />
    </Node>,
  );
  const hud = yield* titleHud(view, title, subtitle, accent);
  yield* credit(view, "Esri Dark Gray Canvas");

  yield* pause(t.startDelay);
  yield* all(
    hud.tRef().opacity(1, t.revealDuration, easeOutCubic),
    hud.sRef().opacity(1, t.revealDuration, easeOutCubic),
  );
  yield* all(
    pin().opacity(1, 0.1),
    pin().y(py, t.revealDuration, easeOutBack),
    glow().opacity(0.55, 0.2),
    glow().size(90, t.lineDuration, easeOutCubic),
  );
  yield* glow().opacity(0.15, 0.4, easeOutCubic);
  yield* waitFor(1.0);
}

/** Orbit-style rotate on satellite plate. */
function* satOrbit(view: any) {
  const place = getPlace(str("placeKey", "brazil"));
  const title = str("title", place.name);
  const subtitle = str("subtitle", "Satellite orbit pass");
  const accent = str("accent", "#7ddea2");
  const t = timing();
  const size = mapSize();
  const bbox = bboxAround(place.capital[0], place.capital[1], ZOOM_SPANS.metro);
  const src = mapImageUrl(bbox, { style: styleOf("satellite"), ...size });
  const map = yield* mapSrc(src);
  view.fill(str("bg", "#05080d"));

  const frame = createRef<Layout>();
  yield view.add(
    <Layout ref={frame} scale={1.15} rotation={-8}>
      <Img src={map} width={1280} height={720} />
    </Layout>,
  );
  const hud = yield* titleHud(view, title, subtitle, accent);
  yield* credit(view, "Esri World Imagery");

  yield* pause(t.startDelay);
  yield* all(
    hud.tRef().opacity(1, t.revealDuration, easeOutCubic),
    hud.sRef().opacity(1, t.revealDuration, easeOutCubic),
    frame().rotation(6, Math.max(t.lineDuration * 2, 1.6), easeOutCubic),
    frame().scale(1, Math.max(t.lineDuration * 2, 1.6), easeOutCubic),
  );
  yield* waitFor(1.0);
}

/** Multi-hop pans between three real capitals. */
function* multiHop(view: any) {
  const keys = [
    str("fromPlace", "usa"),
    str("viaPlace", "uk"),
    str("toPlace", "india"),
  ];
  const places = keys.map((k) => getPlace(k));
  const title = str("title", places.map((p) => p.name).join(" → "));
  const subtitle = str("subtitle", "Multi-city satellite hops");
  const accent = str("accent", "#5ce1ff");
  const t = timing();
  const size = mapSize();
  view.fill(str("bg", "#05080d"));

  const layer = createRef<Layout>();
  yield view.add(<Layout ref={layer} />);
  const hud = yield* titleHud(view, title, subtitle, accent);
  yield* credit(view, "Esri World Imagery");
  yield* pause(t.startDelay);
  yield* all(
    hud.tRef().opacity(1, t.revealDuration, easeOutCubic),
    hud.sRef().opacity(1, t.revealDuration, easeOutCubic),
  );

  for (let i = 0; i < places.length; i++) {
    const p = places[i];
    const bbox = bboxAround(p.capital[0], p.capital[1], ZOOM_SPANS.metro);
    const src = mapImageUrl(bbox, { style: styleOf("satellite"), ...size });
    const map = yield* mapSrc(src);
    const plate = createRef<Layout>();
    const [px, py] = projectLonLat(p.capital[0], p.capital[1], bbox, 1280, 720);
    yield layer().add(
      <Layout ref={plate} opacity={0} scale={1.18}>
        <Img src={map} width={1280} height={720} />
        <Pin x={px} y={py} color={accent} />
        <Txt
          text={p.name}
          fill={"#ffffff"}
          fontFamily={SERIF}
          fontSize={22}
          fontWeight={700}
          y={280}
          shadowColor={"#000000aa"}
          shadowBlur={12}
        />
      </Layout>,
    );
    yield* all(
      plate().opacity(1, t.revealDuration, easeOutCubic),
      plate().scale(1, t.lineDuration, easeOutCubic),
    );
    yield* pause(t.stepDelay + 0.35);
    if (i < places.length - 1) {
      yield* plate().opacity(0, t.revealDuration * 0.7, easeOutCubic);
    }
  }
  yield* waitFor(0.9);
}

/** Close street-level push-in. */
function* streetPush(view: any) {
  const place = getPlace(str("placeKey", "france"));
  const title = str("title", place.name);
  const subtitle = str("subtitle", "Street-level push-in");
  const accent = str("accent", "#e63946");
  const t = timing();
  const size = mapSize();
  const bbox = bboxAround(place.capital[0], place.capital[1], ZOOM_SPANS.street);
  const src = mapImageUrl(bbox, { style: styleOf("street"), ...size });
  const map = yield* mapSrc(src);
  view.fill(str("bg", "#0a0c10"));

  const frame = createRef<Layout>();
  yield view.add(
    <Layout ref={frame} scale={0.92}>
      <Img src={map} width={1280} height={720} />
    </Layout>,
  );
  const hud = yield* titleHud(view, title, subtitle, accent);
  yield* credit(view, "Esri World Street Map");

  yield* pause(t.startDelay);
  yield* all(
    hud.tRef().opacity(1, t.revealDuration, easeOutCubic),
    hud.sRef().opacity(1, t.revealDuration, easeOutCubic),
    frame().scale(1.2, Math.max(t.lineDuration * 2.2, 1.8), easeOutCubic),
  );
  yield* waitFor(1.0);
}

/** Coastal satellite focus (ocean + city visible in real imagery). */
function* coastalSat(view: any) {
  const place = getPlace(str("placeKey", "uae"));
  const title = str("title", place.name);
  const subtitle = str("subtitle", "Coastal satellite");
  const accent = str("accent", "#3a9fd4");
  const t = timing();
  const size = mapSize();
  // Shift bbox slightly seaward so ocean is visible for coastal capitals
  const lon = place.capital[0] + num("lonBias", 0.12);
  const lat = place.capital[1] - num("latBias", 0.05);
  const bbox = bboxAround(lon, lat, ZOOM_SPANS.metro);
  const src = mapImageUrl(bbox, { style: styleOf("satellite"), ...size });
  const map = yield* mapSrc(src);
  view.fill(str("bg", "#041018"));

  const frame = createRef<Layout>();
  const [px, py] = projectLonLat(place.capital[0], place.capital[1], bbox, 1280, 720);
  yield view.add(
    <Layout ref={frame} scale={1.3} y={40}>
      <Img src={map} width={1280} height={720} />
    </Layout>,
  );
  const pin = createRef<Node>();
  yield view.add(
    <Node ref={pin} x={px} y={py - 100} opacity={0}>
      <Pin x={0} y={0} color={accent} />
    </Node>,
  );
  const hud = yield* titleHud(view, title, subtitle, accent);
  yield* credit(view, "Esri World Imagery");

  yield* pause(t.startDelay);
  yield* all(
    hud.tRef().opacity(1, t.revealDuration, easeOutCubic),
    hud.sRef().opacity(1, t.revealDuration, easeOutCubic),
    frame().scale(1, t.lineDuration * 1.8, easeOutCubic),
    frame().y(0, t.lineDuration * 1.8, easeOutCubic),
  );
  yield* all(
    pin().opacity(1, 0.1),
    pin().y(py, t.revealDuration, easeOutBack),
  );
  yield* waitFor(1.1);
}

/**
 * Cinematic target lock — single Esri plate, fly-in Ken Burns,
 * amber pulse marker + glass acquisition HUD (Leaflet satellite engine style).
 * One network fetch → loads fast.
 */
function* targetLock(view: any) {
  const place = getPlace(str("placeKey", "india"));
  const title = str("title", place.name);
  const subtitle = str("subtitle", "Target locked");
  const accent = str("accent", TARGET_AMBER);
  const t = timing();
  const size = mapSize();
  const span = num("spanLat", ZOOM_SPANS.metro);
  const bbox = bboxAround(place.capital[0], place.capital[1], span);
  const src = mapImageUrl(bbox, { style: styleOf("satellite"), ...size });
  const map = yield* mapSrc(src);
  view.fill(str("bg", "#000000"));

  const frame = createRef<Layout>();
  const [px, py] = projectLonLat(place.capital[0], place.capital[1], bbox, 1280, 720);
  // Start wide + offset so the settle feels like flyTo (easeLinearity ~0.15)
  yield view.add(
    <Layout ref={frame} scale={2.05} x={px * -0.35} y={py * -0.25}>
      <Img src={map} width={1280} height={720} />
    </Layout>,
  );
  yield* vignette(view);

  const core = createRef<Circle>();
  const ringA = createRef<Circle>();
  const ringB = createRef<Circle>();
  const marker = createRef<Node>();
  yield view.add(
    <Node ref={marker} x={px} y={py} scale={0.3} opacity={0}>
      <GlowTarget core={core} ringA={ringA} ringB={ringB} color={accent} />
    </Node>,
  );

  const hud = yield* glassAcquireHud(view, {
    title,
    subtitle,
    lat: place.capital[1],
    lon: place.capital[0],
    accent,
  });
  yield* credit(view, "Esri World Imagery");

  const fly = Math.max(t.lineDuration * 3.2, 2.8);
  yield* pause(t.startDelay);
  yield* all(
    hud.panel().opacity(1, 0.45, easeOutCubic),
    hud.panel().scale(1, 0.5, easeOutCubic),
    frame().scale(1, fly, easeInOutCubic),
    frame().x(0, fly, easeInOutCubic),
    frame().y(0, fly, easeInOutCubic),
  );
  yield* all(
    marker().opacity(1, 0.12),
    marker().scale(1, 0.45, easeOutBack),
    core().opacity(1, 0.2),
  );
  hud.statusRef().text("TARGET LOCKED");
  hud.statusRef().fill(accent);
  yield* pulseRings(ringA, ringB, lite() ? 1 : 2);
  yield* waitFor(0.55);
}

/**
 * Production fly-to — two plates only (country → metro) with cinematic ease.
 * Faster than three-level zoom; still reads as Google-Earth descent.
 */
function* satFlyTo(view: any) {
  const place = getPlace(str("placeKey", "japan"));
  const title = str("title", place.name);
  const subtitle = str("subtitle", "Satellite fly-to");
  const accent = str("accent", TARGET_AMBER);
  const t = timing();
  const size = mapSize();
  const wide = bboxAround(place.capital[0], place.capital[1], ZOOM_SPANS.country);
  const tight = bboxAround(
    place.capital[0],
    place.capital[1],
    num("spanLat", ZOOM_SPANS.metro),
  );
  const wideMap = yield* mapSrc(mapImageUrl(wide, { style: styleOf("satellite"), ...size }));
  const tightMap = yield* mapSrc(mapImageUrl(tight, { style: styleOf("satellite"), ...size }));
  view.fill(str("bg", "#000000"));

  const far = createRef<Layout>();
  const near = createRef<Layout>();
  const [px, py] = projectLonLat(place.capital[0], place.capital[1], tight, 1280, 720);
  yield view.add(
    <Layout ref={far} scale={1.12}>
      <Img src={wideMap} width={1280} height={720} />
    </Layout>,
  );
  yield view.add(
    <Layout ref={near} opacity={0} scale={1.35}>
      <Img src={tightMap} width={1280} height={720} />
    </Layout>,
  );
  yield* vignette(view);

  const core = createRef<Circle>();
  const ringA = createRef<Circle>();
  const ringB = createRef<Circle>();
  const marker = createRef<Node>();
  yield view.add(
    <Node ref={marker} x={px} y={py} opacity={0} scale={0.4}>
      <GlowTarget core={core} ringA={ringA} ringB={ringB} color={accent} />
    </Node>,
  );

  const hud = yield* titleHud(view, title, subtitle, accent);
  yield* credit(view, "Esri World Imagery");

  const fly = Math.max(t.lineDuration * 2.4, 2.2);
  yield* pause(t.startDelay);
  yield* all(
    hud.tRef().opacity(1, t.revealDuration, easeOutCubic),
    hud.sRef().opacity(1, t.revealDuration, easeOutCubic),
    far().scale(1.55, fly * 0.55, easeInOutCubic),
  );
  yield* all(
    far().opacity(0, t.revealDuration * 1.2, easeOutCubic),
    near().opacity(1, t.revealDuration * 1.2, easeOutCubic),
    near().scale(1, fly * 0.55, easeInOutCubic),
  );
  yield* all(
    marker().opacity(1, 0.12),
    marker().scale(1, 0.4, easeOutBack),
    core().opacity(1, 0.18),
  );
  yield* pulseRings(ringA, ringB, lite() ? 1 : 2);
  yield* waitFor(0.5);
}

/**
 * Radar-style scan acquire — horizontal sweep, crosshair, then lock.
 * Single satellite plate for fast gallery / export.
 */
function* scanAcquire(view: any) {
  const place = getPlace(str("placeKey", "uae"));
  const title = str("title", place.name);
  const subtitle = str("subtitle", "Scan · acquire");
  const accent = str("accent", TARGET_AMBER);
  const t = timing();
  const size = mapSize();
  const bbox = bboxAround(place.capital[0], place.capital[1], ZOOM_SPANS.metro);
  const map = yield* mapSrc(mapImageUrl(bbox, { style: styleOf("satellite"), ...size }));
  view.fill(str("bg", "#020617"));

  const frame = createRef<Layout>();
  const [px, py] = projectLonLat(place.capital[0], place.capital[1], bbox, 1280, 720);
  yield view.add(
    <Layout ref={frame} scale={1.08}>
      <Img src={map} width={1280} height={720} />
    </Layout>,
  );
  yield* vignette(view);

  const scan = createRef<Rect>();
  yield view.add(
    <Rect
      ref={scan}
      width={1280}
      height={3}
      fill={accent}
      y={-360}
      opacity={0.85}
      shadowColor={accent}
      shadowBlur={18}
    />,
  );

  const crossH = createRef<Rect>();
  const crossV = createRef<Rect>();
  yield view.add(
    <Rect ref={crossH} width={0} height={1.5} fill={"#ffffffcc"} x={px} y={py} />,
  );
  yield view.add(
    <Rect ref={crossV} width={1.5} height={0} fill={"#ffffffcc"} x={px} y={py} />,
  );

  const core = createRef<Circle>();
  const ringA = createRef<Circle>();
  const ringB = createRef<Circle>();
  const marker = createRef<Node>();
  yield view.add(
    <Node ref={marker} x={px} y={py} opacity={0}>
      <GlowTarget core={core} ringA={ringA} ringB={ringB} color={accent} />
    </Node>,
  );

  const hud = yield* glassAcquireHud(view, {
    title,
    subtitle,
    lat: place.capital[1],
    lon: place.capital[0],
    accent,
  });
  yield* credit(view, "Esri World Imagery");

  yield* pause(t.startDelay);
  yield* all(
    hud.panel().opacity(1, 0.4, easeOutCubic),
    hud.panel().scale(1, 0.45, easeOutCubic),
    frame().scale(1, Math.max(t.lineDuration * 1.6, 1.2), easeOutCubic),
  );
  yield* scan().y(360, Math.max(t.lineDuration * 1.8, 1.4), easeInOutCubic);
  yield* scan().opacity(0, 0.25);
  yield* all(
    crossH().width(72, 0.35, easeOutCubic),
    crossV().height(72, 0.35, easeOutCubic),
  );
  yield* all(
    marker().opacity(1, 0.15),
    core().opacity(1, 0.2),
    crossH().opacity(0.35, 0.3),
    crossV().opacity(0.35, 0.3),
  );
  hud.statusRef().text("TARGET LOCKED");
  hud.statusRef().fill(accent);
  yield* pulseRings(ringA, ringB, lite() ? 1 : 2);
  yield* waitFor(0.5);
}

/**
 * Ambient satellite drift — slow lateral pan + gentle push (idle B-roll).
 * One plate; ideal for beds and interstitial maps.
 */
function* satDrift(view: any) {
  const place = getPlace(str("placeKey", "australia"));
  const title = str("title", place.name);
  const subtitle = str("subtitle", "Orbital drift");
  const accent = str("accent", "#94a3b8");
  const t = timing();
  const size = mapSize();
  const bbox = bboxAround(place.capital[0], place.capital[1], ZOOM_SPANS.country);
  const map = yield* mapSrc(mapImageUrl(bbox, { style: styleOf("satellite"), ...size }));
  view.fill(str("bg", "#000000"));

  const frame = createRef<Layout>();
  yield view.add(
    <Layout ref={frame} scale={1.22} x={90}>
      <Img src={map} width={1280} height={720} />
    </Layout>,
  );
  yield* vignette(view);
  const hud = yield* titleHud(view, title, subtitle, accent);
  yield* credit(view, "Esri World Imagery");

  const drift = Math.max(t.lineDuration * 3.5, 3.2);
  yield* pause(t.startDelay);
  yield* all(
    hud.tRef().opacity(0.9, t.revealDuration, easeOutCubic),
    hud.sRef().opacity(0.75, t.revealDuration, easeOutCubic),
    frame().x(-90, drift, easeInOutCubic),
    frame().scale(1.08, drift, easeInOutCubic),
  );
  yield* waitFor(0.45);
}

/** Resolve typed place via geocode, else fall back to lat/lon fields. */
function* resolveAnyTarget() {
  const query = str("locationQuery", "").trim();
  const manualSpan = num("spanLat", 0);
  const pickSpan = (auto: number) =>
    manualSpan > 0.04 ? manualSpan : auto;

  if (query) {
    const hit = yield* geocodeSrc(query);
    if (hit) {
      return {
        lon: hit.lon,
        lat: hit.lat,
        name: str("title", hit.name),
        spanLat: pickSpan(hit.spanLat),
      };
    }
  }

  return {
    lon: num("lon", 77.209),
    lat: num("lat", 28.6139),
    name: str("title", query || "Location"),
    spanLat: pickSpan(ZOOM_SPANS.metro),
  };
}

/**
 * Zoom any place — live Esri satellite only (no stock photos).
 * Wide → city → landmark zoom-IN, pin on the exact coord, title hold.
 */
function* anyPlace(view: any) {
  const target = yield* resolveAnyTarget();
  const title = str("title", target.name);
  const subtitle = str("subtitle", "");
  const accent = str("accent", TARGET_AMBER);
  const t = timing();
  const size = mapSize();
  const isLite = lite();

  const closeSpan = Math.min(
    Math.max(target.spanLat, ZOOM_SPANS.landmark),
    ZOOM_SPANS.street,
  );
  const midSpan = Math.max(closeSpan * 5, ZOOM_SPANS.city);
  const wideSpan = Math.min(
    ZOOM_SPANS.continent,
    Math.max(midSpan * 5, ZOOM_SPANS.region),
  );

  const wideBBox = bboxAround(target.lon, target.lat, wideSpan);
  const midBBox = bboxAround(target.lon, target.lat, midSpan);
  const closeBBox = bboxAround(target.lon, target.lat, closeSpan);

  const wideMap = yield* mapSrc(
    mapImageUrl(wideBBox, { style: styleOf("satellite"), ...size }),
  );
  const midMap = isLite
    ? wideMap
    : yield* mapSrc(
        mapImageUrl(midBBox, { style: styleOf("satellite"), ...size }),
      );
  const closeMap = yield* mapSrc(
    mapImageUrl(closeBBox, { style: styleOf("satellite"), ...size }),
  );
  view.fill(str("bg", "#000000"));

  const [px, py] = projectLonLat(target.lon, target.lat, closeBBox, 1280, 720);
  const fly = Math.max(t.lineDuration * 2.4, 2.0);

  const core = createRef<Circle>();
  const ringA = createRef<Circle>();
  const ringB = createRef<Circle>();
  const marker = createRef<Node>();
  const wide = createRef<Layout>();
  const mid = createRef<Layout>();
  const close = createRef<Layout>();
  const nameRef = createRef<Txt>();
  const capRef = createRef<Txt>();

  yield view.add(
    <Layout ref={wide} scale={1} opacity={isLite ? 0 : 1}>
      <Img src={wideMap} width={1280} height={720} />
    </Layout>,
  );
  if (!isLite) {
    yield view.add(
      <Layout ref={mid} scale={1.2} opacity={0}>
        <Img src={midMap} width={1280} height={720} />
      </Layout>,
    );
  }
  yield view.add(
    <Layout ref={close} scale={0.92} opacity={isLite ? 1 : 0}>
      <Img src={closeMap} width={1280} height={720} />
    </Layout>,
  );
  yield* vignette(view);
  yield view.add(
    <Node ref={marker} x={px} y={py} scale={0.15} opacity={0}>
      <GlowTarget core={core} ringA={ringA} ringB={ringB} color={accent} />
    </Node>,
  );
  yield view.add(
    <Txt
      ref={nameRef}
      text={title}
      fill={"#ffffff"}
      fontFamily={SERIF}
      fontSize={32}
      fontWeight={700}
      y={280}
      opacity={0}
      shadowColor={"#000000cc"}
      shadowBlur={14}
    />,
  );
  if (subtitle) {
    yield view.add(
      <Txt
        ref={capRef}
        text={subtitle}
        fill={accent}
        fontFamily={UI}
        fontSize={14}
        y={316}
        opacity={0}
      />,
    );
  }
  yield* credit(view, "Esri World Imagery");
  yield* pause(t.startDelay);

  if (isLite) {
    yield* all(
      close().scale(1.45, fly, easeInOutCubic),
      close().x(-px * 0.25, fly, easeInOutCubic),
      close().y(-py * 0.25, fly, easeInOutCubic),
    );
  } else {
    yield* all(
      wide().scale(1.55, fly * 0.38, easeInOutCubic),
      wide().x(-px * 0.25, fly * 0.38, easeInOutCubic),
      wide().y(-py * 0.25, fly * 0.38, easeInOutCubic),
    );
    yield* all(
      wide().opacity(0, t.revealDuration, easeOutCubic),
      mid().opacity(1, t.revealDuration, easeOutCubic),
      mid().scale(1.08, fly * 0.32, easeInOutCubic),
    );
    yield* all(
      mid().opacity(0, t.revealDuration, easeOutCubic),
      close().opacity(1, t.revealDuration, easeOutCubic),
      close().scale(1.2, fly * 0.5, easeInOutCubic),
      close().x(-px * 0.12, fly * 0.5, easeInOutCubic),
      close().y(-py * 0.12, fly * 0.5, easeInOutCubic),
    );
  }

  // Arrive on the real satellite view of the place
  yield* all(
    marker().opacity(1, 0.12),
    marker().scale(1.05, 0.4, easeOutBack),
    core().opacity(1, 0.18),
    close().scale(isLite ? 1.55 : 1.38, 0.7, easeInOutCubic),
    nameRef().opacity(1, 0.4, easeOutCubic),
    ...(subtitle ? [capRef().opacity(0.95, 0.4, easeOutCubic)] : []),
  );
  yield* pulseRings(ringA, ringB, isLite ? 1 : 2);
  yield* waitFor(0.9);
}

/**
 * Documentary / Think School style — any place, clean lower-third, slow push.
 * Single plate for fast gallery load.
 */
function* docPlace(view: any) {
  const target = yield* resolveAnyTarget();
  const title = str("title", target.name);
  const subtitle = str("subtitle", "Where the story begins");
  const accent = str("accent", TARGET_AMBER);
  const t = timing();
  const size = mapSize();
  const span = Math.max(0.08, target.spanLat);
  const bbox = bboxAround(target.lon, target.lat, span);
  const map = yield* mapSrc(
    mapImageUrl(bbox, { style: styleOf("satellite"), ...size }),
  );
  view.fill(str("bg", "#05080d"));

  const frame = createRef<Layout>();
  const [px, py] = projectLonLat(target.lon, target.lat, bbox, 1280, 720);
  yield view.add(
    <Layout ref={frame} scale={1.55} x={40} y={24}>
      <Img src={map} width={1280} height={720} />
    </Layout>,
  );
  yield* vignette(view);

  const core = createRef<Circle>();
  const ringA = createRef<Circle>();
  const ringB = createRef<Circle>();
  const marker = createRef<Node>();
  yield view.add(
    <Node ref={marker} x={px} y={py} opacity={0} scale={0.5}>
      <GlowTarget core={core} ringA={ringA} ringB={ringB} color={accent} />
    </Node>,
  );

  const eyebrow = createRef<Txt>();
  const headline = createRef<Txt>();
  const caption = createRef<Txt>();
  const rule = createRef<Rect>();
  yield view.add(
    <Txt
      ref={eyebrow}
      text={"LOCATION"}
      fill={"#94a3b8"}
      fontFamily={UI}
      fontSize={12}
      letterSpacing={3}
      x={-470}
      y={240}
      opacity={0}
      textAlign={"left"}
    />,
  );
  yield view.add(
    <Txt
      ref={headline}
      text={title}
      fill={"#f8fafc"}
      fontFamily={SERIF}
      fontSize={36}
      fontWeight={700}
      x={-280}
      y={278}
      opacity={0}
      textAlign={"left"}
      shadowColor={"#000000cc"}
      shadowBlur={16}
    />,
  );
  yield view.add(
    <Rect ref={rule} width={0} height={3} fill={accent} x={-520} y={308} opacity={0} />,
  );
  yield view.add(
    <Txt
      ref={caption}
      text={subtitle}
      fill={"#cbd5e1"}
      fontFamily={UI}
      fontSize={15}
      x={-400}
      y={332}
      opacity={0}
      textAlign={"left"}
    />,
  );
  yield* credit(view, "Esri World Imagery");

  const push = Math.max(t.lineDuration * 2.8, 2.4);
  yield* pause(t.startDelay);
  yield* all(
    frame().scale(1.02, push, easeInOutCubic),
    frame().x(0, push, easeInOutCubic),
    frame().y(0, push, easeInOutCubic),
    eyebrow().opacity(1, t.revealDuration, easeOutCubic),
    headline().opacity(1, t.revealDuration, easeOutCubic),
    caption().opacity(0.9, t.revealDuration * 1.2, easeOutCubic),
    rule().opacity(1, 0.2),
    rule().width(160, t.revealDuration * 1.4, easeOutCubic),
  );
  yield* all(
    marker().opacity(1, 0.15),
    marker().scale(1, 0.4, easeOutBack),
    core().opacity(1, 0.2),
  );
  yield* pulseRings(ringA, ringB, 1);
  yield* waitFor(0.55);
}

export function* runRealMaps(view: any, template: string) {
  switch (template) {
    case "real-sat-zoom":
      yield* satZoom(view);
      break;
    case "real-street-pin":
      yield* streetPin(view);
      break;
    case "real-sat-route":
      yield* satRoute(view);
      break;
    case "real-zoom-levels":
      yield* zoomLevels(view);
      break;
    case "real-topo-pan":
      yield* topoPan(view);
      break;
    case "real-dual-compare":
      yield* dualCompare(view);
      break;
    case "real-region-sweep":
      yield* regionSweep(view);
      break;
    case "real-dark-pin":
      yield* darkPin(view);
      break;
    case "real-sat-orbit":
      yield* satOrbit(view);
      break;
    case "real-multi-hop":
      yield* multiHop(view);
      break;
    case "real-street-push":
      yield* streetPush(view);
      break;
    case "real-coastal-sat":
      yield* coastalSat(view);
      break;
    case "real-target-lock":
      yield* targetLock(view);
      break;
    case "real-sat-flyto":
      yield* satFlyTo(view);
      break;
    case "real-scan-acquire":
      yield* scanAcquire(view);
      break;
    case "real-sat-drift":
      yield* satDrift(view);
      break;
    case "real-any-place":
      yield* anyPlace(view);
      break;
    case "real-doc-place":
      yield* docPlace(view);
      break;
    default:
      yield* satZoom(view);
  }
}
