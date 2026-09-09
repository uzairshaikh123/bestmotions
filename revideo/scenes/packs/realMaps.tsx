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
import { getPlace } from "../../lib/earth";
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
  view.fill(str("bg", "#05080d"));

  const frame = createRef<Layout>();
  const pin = createRef<Node>();
  const [px, py] = projectLonLat(place.capital[0], place.capital[1], bbox, 1280, 720);
  yield view.add(
    <Layout ref={frame} scale={1.35} x={-40} y={20}>
      <Img src={src} width={1280} height={720} />
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
  view.fill(str("bg", "#0a0c10"));

  const frame = createRef<Layout>();
  const [px, py] = projectLonLat(place.capital[0], place.capital[1], bbox, 1280, 720);
  yield view.add(
    <Layout ref={frame} scale={1.2} y={30}>
      <Img src={src} width={1280} height={720} />
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
  const [ax, ay] = projectLonLat(from.capital[0], from.capital[1], bbox, 1280, 720);
  const [bx, by] = projectLonLat(to.capital[0], to.capital[1], bbox, 1280, 720);
  view.fill(str("bg", "#05080d"));

  yield view.add(<Img src={src} width={1280} height={720} />);
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
    };
  });
  view.fill(str("bg", "#05080d"));

  const refs = layers.map(() => createRef<Layout>());
  for (let i = 0; i < layers.length; i++) {
    yield view.add(
      <Layout ref={refs[i]} opacity={i === 0 ? 1 : 0} scale={i === 0 ? 1.08 : 1.2}>
        <Img src={layers[i].src} width={1280} height={720} />
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
  view.fill(str("bg", "#0a100c"));

  const frame = createRef<Layout>();
  yield view.add(
    <Layout ref={frame} x={80}>
      <Img src={src} width={1280} height={720} />
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
  const sat = mapImageUrl(bbox, { style: "satellite", ...size });
  view.fill(str("bg", "#05080d"));

  const left = createRef<Layout>();
  const right = createRef<Layout>();
  yield view.add(
    <Layout ref={left} x={-340} opacity={0}>
      <Img src={street} width={600} height={720} />
      <Rect width={600} height={40} fill={"#00000099"} y={320} />
      <Txt text={"STREET"} fill={"#ffffff"} fontFamily={SERIF} fontSize={14} y={320} />
    </Layout>,
  );
  yield view.add(
    <Layout ref={right} x={340} opacity={0}>
      <Img src={sat} width={600} height={720} />
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
  view.fill(str("bg", "#05080d"));

  const frame = createRef<Layout>();
  yield view.add(
    <Layout ref={frame} scale={1.25} x={100}>
      <Img src={src} width={1280} height={720} />
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
  view.fill(str("bg", "#050608"));

  yield view.add(<Img src={src} width={1280} height={720} />);
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
  view.fill(str("bg", "#05080d"));

  const frame = createRef<Layout>();
  yield view.add(
    <Layout ref={frame} scale={1.15} rotation={-8}>
      <Img src={src} width={1280} height={720} />
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
    const plate = createRef<Layout>();
    const [px, py] = projectLonLat(p.capital[0], p.capital[1], bbox, 1280, 720);
    yield layer().add(
      <Layout ref={plate} opacity={0} scale={1.18}>
        <Img src={src} width={1280} height={720} />
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
  view.fill(str("bg", "#0a0c10"));

  const frame = createRef<Layout>();
  yield view.add(
    <Layout ref={frame} scale={0.92}>
      <Img src={src} width={1280} height={720} />
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
  view.fill(str("bg", "#041018"));

  const frame = createRef<Layout>();
  const [px, py] = projectLonLat(place.capital[0], place.capital[1], bbox, 1280, 720);
  yield view.add(
    <Layout ref={frame} scale={1.3} y={40}>
      <Img src={src} width={1280} height={720} />
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
    default:
      yield* satZoom(view);
  }
}
