import {
  BOARD_VERSION,
  DEFAULT_FPS,
  DEFAULT_HOLD_MS,
  DEFAULT_PADDING,
  DEFAULT_TRANSITION_MS,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type BoardDocument,
  type BoardEasing,
  type BoardElement,
  type BoardScene,
  type ChartKind,
  type ElementType,
  type MotionPreset,
  type PoseKeyframe,
  type TransitionIn,
} from "./types";

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyBoardDocument(name = "Untitled Project"): BoardDocument {
  return {
    version: BOARD_VERSION,
    name,
    meta: {
      fps: DEFAULT_FPS,
      width: VIEW_WIDTH,
      height: VIEW_HEIGHT,
      background: "#ffffff",
      durationMs: 0,
    },
    elements: {},
    scenes: [],
  };
}

const ELEMENT_TYPES: ElementType[] = [
  "rectangle",
  "circle",
  "triangle",
  "star",
  "arrow",
  "text",
  "image",
  "line",
  "group",
  "chart",
  "template",
];

const PRESETS: MotionPreset[] = [
  "none",
  "fadeIn",
  "slideUp",
  "slideIn",
  "popIn",
  "zoomIn",
  "flipIn",
  "rotateIn",
  "fadeOut",
  "slideOut",
  "zoomOut",
  "popOut",
  "bounce",
  "shake",
  "swing",
  "pulse",
  "wobble",
  "flash",
  "nod",
  "loopPulse",
  "loopSpin",
];
const TRANSITIONS: TransitionIn[] = [
  "zoomPan",
  "zoomOnly",
  "panOnly",
  "cut",
  "pan",
  "zoom",
  "slide",
  "wipe",
  "fade",
  "push",
];
const EASINGS: BoardEasing[] = ["power2.inOut", "linear", "power2.out"];

function num(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function parseElement(raw: unknown, id: string): BoardElement | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const type = ELEMENT_TYPES.includes(o.type as ElementType)
    ? (o.type as ElementType)
    : null;
  if (!type) return null;
  const children = Array.isArray(o.children)
    ? o.children.filter((c): c is string => typeof c === "string")
    : [];
  const motionRaw = o.motion;
  let motion: BoardElement["motion"];
  if (motionRaw && typeof motionRaw === "object") {
    const m = motionRaw as Record<string, unknown>;
    const preset = PRESETS.includes(m.preset as MotionPreset)
      ? (m.preset as MotionPreset)
      : "none";
    motion = {
      preset,
      durationMs: m.durationMs != null ? num(m.durationMs, 1200) : undefined,
      delayMs: m.delayMs != null ? num(m.delayMs, 0) : undefined,
      easing: EASINGS.includes(m.easing as BoardEasing)
        ? (m.easing as BoardEasing)
        : undefined,
      phase:
        m.phase === "out" || m.phase === "loop" || m.phase === "in"
          ? m.phase
          : undefined,
    };
  }
  const pivotRaw = o.pivot;
  const pivot =
    pivotRaw && typeof pivotRaw === "object"
      ? {
          x: num((pivotRaw as Record<string, unknown>).x, 0),
          y: num((pivotRaw as Record<string, unknown>).y, 0),
        }
      : undefined;
  return {
    id,
    type,
    x: num(o.x, 0),
    y: num(o.y, 0),
    width: o.width != null ? num(o.width, 120) : undefined,
    height: o.height != null ? num(o.height, 80) : undefined,
    rotation: num(o.rotation, 0),
    opacity: o.opacity == null ? 1 : Math.min(1, Math.max(0, num(o.opacity, 1))),
    fill: typeof o.fill === "string" ? o.fill : undefined,
    stroke: typeof o.stroke === "string" ? o.stroke : undefined,
    strokeWidth: o.strokeWidth != null ? num(o.strokeWidth, 2) : undefined,
    pivot,
    parentId: typeof o.parentId === "string" ? o.parentId : null,
    children,
    content: typeof o.content === "string" ? o.content : undefined,
    fontSize: o.fontSize != null ? num(o.fontSize, 28) : undefined,
    src: typeof o.src === "string" ? o.src : undefined,
    name: typeof o.name === "string" ? o.name : undefined,
    visible: o.visible === false ? false : true,
    locked: Boolean(o.locked),
    motion,
    keyframes: parseKeyframes(o.keyframes),
    chartKind: parseChartKind(o.chartKind),
    chartData: typeof o.chartData === "string" ? o.chartData : undefined,
    templateId: typeof o.templateId === "string" ? o.templateId : undefined,
    revideoTemplate: typeof o.revideoTemplate === "string" ? o.revideoTemplate : undefined,
    variables: parseVariables(o.variables),
  };
}

function parseChartKind(raw: unknown): ChartKind | undefined {
  if (raw === "bar" || raw === "pie" || raw === "line" || raw === "stat") return raw;
  return undefined;
}

function parseVariables(raw: unknown): Record<string, string | number> | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: Record<string, string | number> = {};
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof val === "string" || typeof val === "number") out[key] = val;
  }
  return Object.keys(out).length ? out : undefined;
}

function parseKeyframes(raw: unknown): PoseKeyframe[] | undefined {
  if (!Array.isArray(raw) || !raw.length) return undefined;
  const frames: PoseKeyframe[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const k = item as Record<string, unknown>;
    frames.push({
      timeMs: Math.max(0, num(k.timeMs, 0)),
      x: num(k.x, 0),
      y: num(k.y, 0),
      width: k.width != null ? num(k.width, 0) : undefined,
      height: k.height != null ? num(k.height, 0) : undefined,
      rotation: num(k.rotation, 0),
      scale: num(k.scale, 1),
      scaleY: k.scaleY != null ? num(k.scaleY, 1) : undefined,
      opacity: Math.min(1, Math.max(0, num(k.opacity, 1))),
      easing: EASINGS.includes(k.easing as BoardEasing)
        ? (k.easing as BoardEasing)
        : undefined,
    });
  }
  return frames.length ? frames : undefined;
}

function parseScene(raw: unknown, index: number): BoardScene | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const cam = (o.camera && typeof o.camera === "object"
    ? (o.camera as Record<string, unknown>)
    : {}) as Record<string, unknown>;
  return {
    id: str(o.id, newId("scene")),
    name: str(o.name, `Scene ${index + 1}`),
    elementIds: Array.isArray(o.elementIds)
      ? o.elementIds.filter((c): c is string => typeof c === "string")
      : [],
    durationMs: Math.max(0, num(o.durationMs, DEFAULT_HOLD_MS)),
    transitionIn: TRANSITIONS.includes(o.transitionIn as TransitionIn)
      ? (o.transitionIn as TransitionIn)
      : "zoomPan",
    transitionMs: Math.max(0, num(o.transitionMs, DEFAULT_TRANSITION_MS)),
    easing: EASINGS.includes(o.easing as BoardEasing)
      ? (o.easing as BoardEasing)
      : "power2.inOut",
    camera: {
      mode: cam.mode === "manual" ? "manual" : "fitTarget",
      targetId: typeof cam.targetId === "string" ? cam.targetId : undefined,
      padding: cam.padding != null ? num(cam.padding, DEFAULT_PADDING) : undefined,
      x: cam.x != null ? num(cam.x, 0) : undefined,
      y: cam.y != null ? num(cam.y, 0) : undefined,
      zoom: cam.zoom != null ? num(cam.zoom, 1) : undefined,
      rotation: cam.rotation != null ? num(cam.rotation, 0) : undefined,
    },
  };
}

export function parseBoardDocument(raw: unknown): BoardDocument {
  const fallback = emptyBoardDocument();
  if (!raw || typeof raw !== "object") return fallback;
  const o = raw as Record<string, unknown>;
  const metaRaw =
    o.meta && typeof o.meta === "object"
      ? (o.meta as Record<string, unknown>)
      : {};
  const elementsIn =
    o.elements && typeof o.elements === "object"
      ? (o.elements as Record<string, unknown>)
      : {};
  const elements: Record<string, BoardElement> = {};
  for (const [id, value] of Object.entries(elementsIn)) {
    const el = parseElement(value, id);
    if (el) elements[el.id] = { ...el, id };
  }
  const scenes = Array.isArray(o.scenes)
    ? o.scenes
        .map((s, i) => parseScene(s, i))
        .filter((s): s is BoardScene => Boolean(s))
    : [];
  return {
    version: BOARD_VERSION,
    name: typeof o.name === "string" ? o.name : fallback.name,
    meta: {
      fps: num(metaRaw.fps, DEFAULT_FPS),
      width: num(metaRaw.width, VIEW_WIDTH),
      height: num(metaRaw.height, VIEW_HEIGHT),
      background: str(metaRaw.background, fallback.meta.background),
      durationMs:
        metaRaw.durationMs != null ? Math.max(0, num(metaRaw.durationMs, 0)) : undefined,
    },
    elements,
    scenes,
  };
}

export function cloneBoard(doc: BoardDocument): BoardDocument {
  return parseBoardDocument(JSON.parse(JSON.stringify(doc)));
}

export function stringifyBoard(doc: BoardDocument): string {
  return JSON.stringify(doc);
}

export function defaultElement(
  type: ElementType,
  extra: Partial<BoardElement> = {},
): BoardElement {
  const id = extra.id || newId(type.slice(0, 4));
  const base: BoardElement = {
    id,
    type,
    x: extra.x ?? 120,
    y: extra.y ?? 120,
    width: extra.width ?? (type === "circle" ? 140 : type === "line" ? 180 : 220),
    height: extra.height ?? (type === "circle" ? 140 : type === "line" ? 0 : 120),
    rotation: 0,
    opacity: 1,
    fill:
      extra.fill ??
      (type === "text"
        ? "#1a1433"
        : type === "line" || type === "arrow"
          ? undefined
          : "#7c5cfc"),
    stroke:
      extra.stroke ??
      (type === "line" || type === "arrow" ? "#7c5cfc" : "#5b3fd6"),
    strokeWidth: extra.strokeWidth ?? (type === "line" || type === "arrow" ? 4 : 0),
    parentId: extra.parentId ?? null,
    children: extra.children ?? [],
    content: type === "text" ? extra.content ?? "Label" : extra.content,
    fontSize: type === "text" ? extra.fontSize ?? 28 : extra.fontSize,
    src: extra.src,
    name: extra.name ?? type,
    visible: extra.visible ?? true,
    locked: extra.locked ?? false,
    motion: extra.motion ?? { preset: "none", durationMs: 0, delayMs: 0 },
    pivot: extra.pivot,
    chartKind: extra.chartKind,
    chartData: extra.chartData,
    templateId: extra.templateId,
    revideoTemplate: extra.revideoTemplate,
    variables: extra.variables,
  };
  return { ...base, ...extra, id, type, children: extra.children ?? [] };
}

export function defaultScene(
  targetId: string,
  name: string,
  extra: Partial<BoardScene> = {},
): BoardScene {
  return {
    id: extra.id || newId("scene"),
    name,
    elementIds: extra.elementIds ?? [targetId],
    durationMs: extra.durationMs ?? DEFAULT_HOLD_MS,
    transitionIn: extra.transitionIn ?? "zoomPan",
    transitionMs: extra.transitionMs ?? DEFAULT_TRANSITION_MS,
    easing: extra.easing ?? "power2.inOut",
    camera: {
      mode: "fitTarget",
      targetId,
      padding: DEFAULT_PADDING,
      ...extra.camera,
    },
  };
}

export function rootElementIds(doc: BoardDocument): string[] {
  return Object.values(doc.elements)
    .filter((el) => !el.parentId)
    .map((el) => el.id);
}

export function elementLabel(el: BoardElement): string {
  if (el.name) return el.name;
  if (el.type === "text" && el.content) return el.content.slice(0, 24);
  if (el.type === "chart") return el.chartKind ? `${el.chartKind} chart` : "Chart";
  if (el.type === "template") return el.templateId || "Template";
  return el.type;
}

export function collectDescendants(
  doc: BoardDocument,
  id: string,
  into: string[] = [],
): string[] {
  const el = doc.elements[id];
  if (!el) return into;
  for (const childId of el.children) {
    into.push(childId);
    collectDescendants(doc, childId, into);
  }
  return into;
}
