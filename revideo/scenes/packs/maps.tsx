/** @jsxImportSource @revideo/2d/lib */
import { Circle, Layout, Path, Polygon, Txt } from "@revideo/2d";
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
  COLORS,
  countryCentroid,
  destCamera,
  drawEarth,
  easeOut3,
  geodesicMid,
  getPlace,
  headingDeg,
  mapCamera,
  mixCam,
  worldCamera,
  type Camera,
  type EarthDrawing,
} from "../../lib/earth";
import { geoInterpolate } from "d3-geo";

const SERIF = "Libre Baskerville, Georgia, serif";

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

type GlobeRefs = {
  sphere: ReturnType<typeof createRef<Path>>;
  land: ReturnType<typeof createRef<Path>>;
  borders: ReturnType<typeof createRef<Path>>;
  graticule: ReturnType<typeof createRef<Path>>;
  country: ReturnType<typeof createRef<Path>>;
  glow: ReturnType<typeof createRef<Circle>>;
};

function applyDrawing(refs: GlobeRefs, drawing: EarthDrawing, cam: Camera, accent: string) {
  refs.sphere().data(drawing.sphere);
  refs.land().data(drawing.land);
  refs.borders().data(drawing.borders);
  refs.graticule().data(drawing.graticule);
  refs.country().data(drawing.country);
  if (cam.kind === "ortho") {
    refs.glow().x(cam.tx);
    refs.glow().y(cam.ty);
    refs.glow().size(cam.scale * 2.12);
    refs.glow().stroke(accent);
  }
}

function* mountGlobe(
  view: any,
  cam: Camera,
  opts: { accent: string; highlightIso?: string; countryFill?: string },
) {
  const refs: GlobeRefs = {
    sphere: createRef<Path>(),
    land: createRef<Path>(),
    borders: createRef<Path>(),
    graticule: createRef<Path>(),
    country: createRef<Path>(),
    glow: createRef<Circle>(),
  };
  const drawing = drawEarth(cam, opts.highlightIso);
  yield view.add(
    <Circle
      ref={refs.glow}
      size={cam.kind === "ortho" ? cam.scale * 2.12 : 0}
      x={cam.tx}
      y={cam.ty}
      fill={null}
      stroke={opts.accent}
      lineWidth={18}
      opacity={cam.kind === "ortho" ? 0.12 : 0}
    />,
  );
  yield view.add(
    <Path ref={refs.sphere} data={drawing.sphere} fill={COLORS.ocean} stroke={COLORS.rim} lineWidth={1.4} opacity={0.95} />,
  );
  yield view.add(
    <Path ref={refs.graticule} data={drawing.graticule} fill={null} stroke={COLORS.graticule} lineWidth={0.6} opacity={0.55} />,
  );
  yield view.add(
    <Path ref={refs.land} data={drawing.land} fill={COLORS.land} stroke={null} />,
  );
  yield view.add(
    <Path
      ref={refs.borders}
      data={drawing.borders}
      fill={null}
      stroke={COLORS.border}
      lineWidth={0.7}
      opacity={0.55}
    />,
  );
  yield view.add(
    <Path
      ref={refs.country}
      data={drawing.country}
      fill={opts.countryFill || opts.accent}
      stroke={opts.accent}
      lineWidth={1.6}
      end={0}
      opacity={0}
    />,
  );
  return { refs, drawing };
}

function* tweenGlobe(
  refs: GlobeRefs,
  from: Camera,
  to: Camera,
  duration: number,
  accent: string,
  highlightIso?: string,
) {
  const steps = Math.max(12, Math.round(duration * 28));
  const dt = duration / steps;
  for (let i = 1; i <= steps; i++) {
    const cam = mixCam(from, to, easeOut3(i / steps));
    applyDrawing(refs, drawEarth(cam, highlightIso), cam, accent);
    yield* waitFor(dt);
  }
}

function* dropPin(view: any, xy: [number, number] | null, color: string, label: string) {
  if (!xy) return null;
  const stem = createRef<Layout>();
  const txt = createRef<Txt>();
  yield view.add(
    <Layout ref={stem} x={xy[0]} y={xy[1]} opacity={0}>
      <Circle size={14} fill={color} y={-16} />
      <Circle size={5} fill={"#fff"} y={-16} />
    </Layout>,
  );
  yield view.add(
    <Txt
      ref={txt}
      text={label}
      fill={"#f4f0e6"}
      fontFamily={SERIF}
      fontSize={14}
      x={xy[0] + 18}
      y={xy[1] - 20}
      opacity={0}
    />,
  );
  return { stem, txt };
}

/** Great-circle flight on a real orthographic Earth. */
function* airplaneRoute(view: any) {
  const title = str("title", "India to USA");
  const from = getPlace(str("fromPlace", "india"));
  const to = getPlace(str("toPlace", "usa"));
  const planeColor = str("accent", "#d8a11a");
  const pathColor = str("lineColor", "#5ce1ff");
  const bg = str("bg", COLORS.void);
  const t = timing();
  view.fill(bg);

  const mid = geodesicMid(from.capital, to.capital);
  const cam: Camera = {
    kind: "ortho",
    ...{ yaw: -mid[0], pitch: -mid[1] * 0.65 },
    scale: 250,
    tx: 0,
    ty: 20,
  };

  yield* pause(t.startDelay);
  const extra = itemDelays(4);
  const globe = yield* mountGlobe(view, cam, { accent: pathColor });

  const titleRef = createRef<Txt>();
  const fromRef = createRef<Txt>();
  const toRef = createRef<Txt>();
  yield view.add(
    <Txt ref={titleRef} text={title} fill={"#f4f0e6"} fontFamily={SERIF} fontSize={28} fontWeight={700} y={-300} opacity={0} />,
  );
  yield view.add(
    <Txt ref={fromRef} text={from.name} fill={pathColor} fontFamily={SERIF} fontSize={16} y={-256} opacity={0} />,
  );
  yield view.add(
    <Txt ref={toRef} text={to.name} fill={planeColor} fontFamily={SERIF} fontSize={16} y={-228} opacity={0} />,
  );

  yield* pause(extra[0]);
  yield* titleRef().opacity(1, t.revealDuration, easeOutCubic);

  const drawing = drawEarth(cam);
  const fromXy = drawing.projection(from.capital);
  const toXy = drawing.projection(to.capital);
  const aPin = yield* dropPin(view, fromXy, pathColor, from.name);
  yield* pause(t.stepDelay);
  if (aPin) yield* all(aPin.stem().opacity(1, t.revealDuration, easeOutCubic), fromRef().opacity(1, t.revealDuration, easeOutCubic));

  yield* pause(t.connectDelay);
  yield* pause(extra[1]);
  const route = createRef<Path>();
  yield view.add(
    <Path
      ref={route}
      data={drawing.route(from.capital, to.capital)}
      fill={null}
      stroke={pathColor}
      lineWidth={3}
      end={0}
      lineCap={"round"}
      shadowColor={pathColor}
      shadowBlur={18}
    />,
  );
  const plane = createRef<Polygon>();
  const start = fromXy || [cam.tx, cam.ty];
  yield view.add(
    <Polygon ref={plane} sides={3} width={18} height={22} fill={planeColor} x={start[0]} y={start[1]} rotation={90} />,
  );

  const interp = geoInterpolate(from.capital, to.capital);
  const steps = 36;
  const dt = t.lineDuration / steps;
  yield* all(
    route().end(1, t.lineDuration, easeOutCubic),
    (function* () {
      for (let i = 1; i <= steps; i++) {
        const u = i / steps;
        const xy = drawing.projection(interp(u) as [number, number]);
        if (xy) {
          plane().opacity(1);
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
          plane().opacity(0);
          yield* waitFor(dt);
        }
      }
    })(),
  );

  yield* pause(t.stepDelay);
  yield* pause(extra[2]);
  const bPin = yield* dropPin(view, toXy, planeColor, to.name);
  if (bPin) yield* all(bPin.stem().opacity(1, t.revealDuration, easeOutCubic), toRef().opacity(1, t.revealDuration, easeOutCubic));
  yield* waitFor(1.15);
}

/** Real country polygon highlight on an orthographic globe. */
function* countryHighlight(view: any) {
  const place = getPlace(str("placeKey", "india"));
  const title = str("title", place.name.toUpperCase());
  const subtitle = str("subtitle", "SOUTH ASIA");
  const accent = str("accent", "#FF9933");
  const bg = str("bg", COLORS.void);
  const t = timing();
  view.fill(bg);

  const wide = worldCamera();
  const close = destCamera(place.iso, { scale: 340 });
  yield* pause(t.startDelay);
  const extra = itemDelays(3);
  const globe = yield* mountGlobe(view, wide, { accent, highlightIso: place.iso, countryFill: accent });
  globe.refs.country().opacity(0);
  globe.refs.country().end(0);

  const titleRef = createRef<Txt>();
  const subRef = createRef<Txt>();
  yield view.add(
    <Txt ref={titleRef} text={title} fill={"#ffffff"} fontFamily={SERIF} fontSize={36} fontWeight={700} y={-300} opacity={0} />,
  );
  yield view.add(
    <Txt ref={subRef} text={subtitle} fill={accent} fontFamily={SERIF} fontSize={16} letterSpacing={5} y={-258} opacity={0} />,
  );

  yield* pause(extra[0]);
  yield* tweenGlobe(globe.refs, wide, close, t.lineDuration * 1.35, accent, place.iso);
  yield* pause(t.connectDelay);
  yield* pause(extra[1]);
  globe.refs.country().end(0);
  globe.refs.country().opacity(0.92);
  yield* globe.refs.country().end(1, t.lineDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* pause(extra[2]);
  yield* all(
    titleRef().opacity(1, t.revealDuration, easeOutCubic),
    subRef().opacity(1, t.revealDuration, easeOutCubic),
  );
  yield* waitFor(1.2);
}

/** Equirectangular Natural Earth map with geodesic pulse rings. */
function* mapSpotlight(view: any) {
  const place = getPlace(str("placeKey", "india"));
  const region = str("region", "South Asia");
  const fact = str("fact", "Fastest growing internet region");
  const highlight = str("highlight", "Fastest growing");
  const accent = str("accent", "#d8a11a");
  const bg = str("bg", COLORS.void);
  const t = timing();
  view.fill(bg);

  const [lon, lat] = countryCentroid(place.iso);
  const cam = mapCamera(lon);
  yield* pause(t.startDelay);
  const extra = itemDelays(3);
  const globe = yield* mountGlobe(view, cam, { accent, highlightIso: place.iso });
  globe.refs.country().end(0);
  globe.refs.country().opacity(0);

  yield* pause(extra[0]);
  globe.refs.country().opacity(0.9);
  yield* globe.refs.country().end(1, t.lineDuration, easeOutCubic);

  const drawing = drawEarth(cam, place.iso);
  const rings = [6, 12, 20];
  for (let i = 0; i < rings.length; i++) {
    yield* pause(t.connectDelay);
    const ring = createRef<Path>();
    yield view.add(
      <Path
        ref={ring}
        data={drawing.ring(lon, lat, rings[i])}
        fill={null}
        stroke={accent}
        lineWidth={1.5}
        end={0}
        opacity={0.55}
      />,
    );
    yield* ring().end(1, t.lineDuration * 0.7, easeOutCubic);
  }

  const regionRef = createRef<Txt>();
  const nameRef = createRef<Txt>();
  const factRef = createRef<Txt>();
  yield view.add(
    <Txt ref={regionRef} text={region.toUpperCase()} fill={accent} fontFamily={SERIF} fontSize={14} letterSpacing={6} y={-312} opacity={0} />,
  );
  yield view.add(
    <Txt ref={nameRef} text={place.name} fill={"#ffffff"} fontFamily={SERIF} fontSize={32} fontWeight={700} y={-274} opacity={0} />,
  );
  yield view.add(
    <Txt ref={factRef} text={highlight || fact} fill={"#c5d4de"} fontFamily={SERIF} fontSize={18} y={320} opacity={0} />,
  );
  yield* pause(t.stepDelay);
  yield* pause(extra[1]);
  yield* regionRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* nameRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(extra[2]);
  yield* factRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.2);
}

/** Camera zooms from world to a real country, then drops a capital pin. */
function* zoomLocation(view: any) {
  const place = getPlace(str("placeKey", "india"));
  const city = str("city", "Mumbai");
  const detail = str("detail", "Financial capital under pressure");
  const highlight = str("highlight", "pressure");
  const accent = str("accent", "#d8a11a");
  const bg = str("bg", COLORS.void);
  const t = timing();
  view.fill(bg);

  const wide = worldCamera({ yaw: 30, pitch: -8, scale: 175 });
  const close = destCamera(place.iso, { scale: 360 });
  yield* pause(t.startDelay);
  const extra = itemDelays(4);
  const globe = yield* mountGlobe(view, wide, { accent, highlightIso: place.iso });
  globe.refs.country().opacity(0);

  yield* pause(extra[0]);
  yield* tweenGlobe(globe.refs, wide, close, Math.max(t.lineDuration * 1.5, 1.1), accent, place.iso);
  yield* pause(t.connectDelay);
  globe.refs.country().end(0);
  globe.refs.country().opacity(0.85);
  yield* globe.refs.country().end(1, t.lineDuration * 0.7, easeOutCubic);

  const drawn = drawEarth(close, place.iso);
  const xy = drawn.projection(place.capital);
  yield* pause(t.stepDelay);
  yield* pause(extra[1]);
  const pin = yield* dropPin(view, xy, accent, city);
  if (pin) yield* pin.stem().opacity(1, t.revealDuration, easeOutBack);

  const cityRef = createRef<Txt>();
  const detRef = createRef<Txt>();
  const hiRef = createRef<Txt>();
  yield view.add(
    <Txt ref={cityRef} text={city} fill={"#ffffff"} fontFamily={SERIF} fontSize={32} fontWeight={700} y={-300} opacity={0} />,
  );
  yield view.add(
    <Txt ref={detRef} text={detail} fill={"#c5d4de"} fontFamily={SERIF} fontSize={18} y={310} opacity={0} />,
  );
  yield view.add(
    <Txt ref={hiRef} text={highlight} fill={accent} fontFamily={SERIF} fontSize={16} y={340} opacity={0} />,
  );
  yield* pause(t.stepDelay);
  yield* pause(extra[2]);
  yield* cityRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(extra[3]);
  yield* all(detRef().opacity(1, t.revealDuration, easeOutCubic), hiRef().opacity(1, t.revealDuration, easeOutCubic));
  if (pin) yield* pin.txt().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.2);
}

/** Spin the real globe until the focus country is framed, then pin. */
function* globeSpin(view: any) {
  const title = str("title", "Around the world");
  const subtitle = str("subtitle", "Global stories, animated");
  const place = getPlace(str("placeKey", "india"));
  const pinLabel = str("pinLabel", "New Delhi");
  const accent = str("accent", "#d8a11a");
  const bg = str("bg", COLORS.void);
  const t = timing();
  view.fill(bg);

  for (let i = 0; i < 42; i++) {
    yield view.add(
      <Circle
        size={1.6 + (i % 3)}
        fill={"#9eb6c8"}
        x={-600 + ((i * 137) % 1200)}
        y={-330 + ((i * 79) % 660)}
        opacity={0.4}
      />,
    );
  }

  const start = worldCamera({ yaw: 70, pitch: -10, scale: 230 });
  const end = destCamera(place.iso, { scale: 300 });
  yield* pause(t.startDelay);
  const extra = itemDelays(3);
  const globe = yield* mountGlobe(view, start, { accent, highlightIso: place.iso });
  globe.refs.country().opacity(0);

  const titleRef = createRef<Txt>();
  const subRef = createRef<Txt>();
  yield view.add(
    <Txt ref={titleRef} text={title} fill={"#ffffff"} fontFamily={SERIF} fontSize={28} fontWeight={700} y={-300} opacity={0} />,
  );
  yield view.add(
    <Txt ref={subRef} text={subtitle} fill={accent} fontFamily={SERIF} fontSize={16} y={-260} opacity={0} />,
  );
  yield* pause(extra[0]);
  yield* titleRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* pause(t.stepDelay);
  yield* tweenGlobe(globe.refs, start, end, Math.max(t.lineDuration * 1.8, 1.4), accent, place.iso);
  yield* pause(t.connectDelay);
  globe.refs.country().end(0);
  globe.refs.country().opacity(0.88);
  yield* globe.refs.country().end(1, t.lineDuration * 0.6, easeOutCubic);

  const drawn = drawEarth(end, place.iso);
  const xy = drawn.projection(place.capital);
  yield* pause(extra[1]);
  const pin = yield* dropPin(view, xy, accent, pinLabel);
  if (pin) {
    yield* pin.stem().opacity(1, t.revealDuration, easeOutBack);
    yield* pin.txt().opacity(1, t.revealDuration, easeOutCubic);
  }
  yield* pause(extra[2]);
  yield* subRef().opacity(1, t.revealDuration, easeOutCubic);
  yield* waitFor(1.2);
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
      yield* globeSpin(view);
      break;
    default:
      yield* countryHighlight(view);
  }
}
