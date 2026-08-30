import {
  DEFAULT_PADDING,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type BBox,
  type BoardDocument,
  type BoardElement,
  type BoardScene,
  type CameraState,
} from "./types";

const TAU = Math.PI / 180;

export function elementSize(el: BoardElement): { width: number; height: number } {
  if (el.type === "circle") {
    const d = el.width ?? el.height ?? 120;
    return { width: d, height: d };
  }
  if (el.type === "line") {
    return {
      width: Math.abs(el.width ?? 160),
      height: Math.max(Math.abs(el.height ?? 0), 8),
    };
  }
  return {
    width: Math.max(el.width ?? 80, 8),
    height: Math.max(el.height ?? (el.type === "text" ? 40 : 80), 8),
  };
}

function chainFromRoot(doc: BoardDocument, id: string): BoardElement[] {
  const chain: BoardElement[] = [];
  let cur: BoardElement | undefined = doc.elements[id];
  const guard = new Set<string>();
  while (cur && !guard.has(cur.id)) {
    guard.add(cur.id);
    chain.unshift(cur);
    cur = cur.parentId ? doc.elements[cur.parentId] : undefined;
  }
  return chain;
}

/** World-space top-left and accumulated rotation of an element's local origin. */
export function worldOrigin(
  doc: BoardDocument,
  id: string,
): { x: number; y: number; rotation: number } {
  let x = 0;
  let y = 0;
  let rotation = 0;
  for (const el of chainFromRoot(doc, id)) {
    const rad = rotation * TAU;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const nx = x + el.x * c - el.y * s;
    const ny = y + el.x * s + el.y * c;
    x = nx;
    y = ny;
    rotation += el.rotation;
  }
  return { x, y, rotation };
}

export function elementWorldBBox(doc: BoardDocument, id: string): BBox {
  const el = doc.elements[id];
  if (!el) return { x: 0, y: 0, width: 1, height: 1 };
  const origin = worldOrigin(doc, id);
  const { width, height } = elementSize(el);
  const rad = origin.rotation * TAU;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const corners = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ].map(([lx, ly]) => ({
    x: origin.x + lx * c - ly * s,
    y: origin.y + lx * s + ly * c,
  }));
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of corners) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  for (const childId of el.children) {
    const cb = elementWorldBBox(doc, childId);
    minX = Math.min(minX, cb.x);
    minY = Math.min(minY, cb.y);
    maxX = Math.max(maxX, cb.x + cb.width);
    maxY = Math.max(maxY, cb.y + cb.height);
  }
  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}

export function fitCameraToBBox(
  bbox: BBox,
  padding = DEFAULT_PADDING,
  viewW = VIEW_WIDTH,
  viewH = VIEW_HEIGHT,
): CameraState {
  const w = Math.max(bbox.width + padding * 2, 32);
  const h = Math.max(bbox.height + padding * 2, 32);
  const zoom = Math.min(viewW / w, viewH / h);
  return {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2,
    zoom: Number.isFinite(zoom) && zoom > 0 ? zoom : 1,
    rotation: 0,
  };
}

export function sceneCameraState(
  doc: BoardDocument,
  scene: BoardScene,
  previous?: CameraState,
): CameraState {
  const cam = scene.camera;
  if (cam.mode === "manual" && cam.x != null && cam.y != null && cam.zoom != null) {
    return {
      x: cam.x,
      y: cam.y,
      zoom: cam.zoom,
      rotation: cam.rotation ?? 0,
    };
  }
  const targetId = cam.targetId || scene.elementIds[0];
  const fitted = targetId
    ? fitCameraToBBox(
        elementWorldBBox(doc, targetId),
        cam.padding ?? DEFAULT_PADDING,
        doc.meta.width || VIEW_WIDTH,
        doc.meta.height || VIEW_HEIGHT,
      )
    : previous || { x: VIEW_WIDTH / 2, y: VIEW_HEIGHT / 2, zoom: 1, rotation: 0 };

  const from = previous || fitted;
  const kind = scene.transitionIn;
  if (kind === "zoomOnly" || kind === "zoom") {
    return { ...from, zoom: fitted.zoom };
  }
  if (kind === "panOnly" || kind === "pan") {
    return { ...from, x: fitted.x, y: fitted.y, rotation: fitted.rotation };
  }
  if (kind === "cut" || kind === "wipe" || kind === "fade") {
    return fitted;
  }
  return fitted;
}

export function cameraViewportWorld(cam: CameraState, viewW = VIEW_WIDTH, viewH = VIEW_HEIGHT): BBox {
  const width = viewW / Math.max(cam.zoom, 0.001);
  const height = viewH / Math.max(cam.zoom, 0.001);
  return {
    x: cam.x - width / 2,
    y: cam.y - height / 2,
    width,
    height,
  };
}

/** Map world point through camera into a stage of size viewW x viewH (top-left origin). */
export function worldToView(
  cam: CameraState,
  worldX: number,
  worldY: number,
  stageW: number,
  stageH: number,
): { x: number; y: number } {
  return {
    x: (worldX - cam.x) * cam.zoom + stageW / 2,
    y: (worldY - cam.y) * cam.zoom + stageH / 2,
  };
}

export function cameraLayerTransform(
  cam: CameraState,
  stageW: number,
  stageH: number,
): { x: number; y: number; scale: number; rotation: number } {
  return {
    x: stageW / 2 - cam.x * cam.zoom,
    y: stageH / 2 - cam.y * cam.zoom,
    scale: cam.zoom,
    rotation: cam.rotation,
  };
}

/** Revideo nodes are center-origin; board elements are top-left. */
export function revideoLocalCenter(
  el: BoardElement,
  parent?: BoardElement | null,
): { x: number; y: number } {
  const { width, height } = elementSize(el);
  const cx = el.x + width / 2;
  const cy = el.y + height / 2;
  if (!parent) return { x: cx, y: cy };
  const ps = elementSize(parent);
  return { x: cx - ps.width / 2, y: cy - ps.height / 2 };
}

export function hitTestElement(
  doc: BoardDocument,
  id: string,
  worldX: number,
  worldY: number,
): boolean {
  const bbox = elementWorldBBox(doc, id);
  return (
    worldX >= bbox.x &&
    worldX <= bbox.x + bbox.width &&
    worldY >= bbox.y &&
    worldY <= bbox.y + bbox.height
  );
}

export function findDropTarget(
  doc: BoardDocument,
  draggedId: string,
  worldX: number,
  worldY: number,
): string | null {
  const skip = new Set<string>([draggedId]);
  const dragged = doc.elements[draggedId];
  if (!dragged) return null;
  for (const id of dragged.children) skip.add(id);

  let best: { id: string; area: number } | null = null;
  for (const el of Object.values(doc.elements)) {
    if (skip.has(el.id)) continue;
    if (el.type !== "group") continue;
    if (!hitTestElement(doc, el.id, worldX, worldY)) continue;
    const bbox = elementWorldBBox(doc, el.id);
    const area = bbox.width * bbox.height;
    if (!best || area < best.area) best = { id: el.id, area };
  }
  return best?.id ?? null;
}

export function trianglePoints(
  width: number,
  height: number,
  origin: "topLeft" | "center" = "center",
): [number, number][] {
  const pts: [number, number][] = [
    [width / 2, 0],
    [width, height],
    [0, height],
  ];
  if (origin === "topLeft") return pts;
  return pts.map(([x, y]) => [x - width / 2, y - height / 2]);
}

export function starPoints(
  width: number,
  height: number,
  origin: "topLeft" | "center" = "center",
): [number, number][] {
  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.min(width, height) / 2;
  const inner = outer * 0.4;
  const pts: [number, number][] = [];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const b = a + Math.PI / 5;
    pts.push([cx + Math.cos(a) * outer, cy + Math.sin(a) * outer]);
    pts.push([cx + Math.cos(b) * inner, cy + Math.sin(b) * inner]);
  }
  if (origin === "topLeft") return pts;
  return pts.map(([x, y]) => [x - cx, y - cy]);
}

export const SNAP_GRID = 8;

export function snapValue(n: number, grid = SNAP_GRID): number {
  return Math.round(n / grid) * grid;
}

export function snapPoint(
  x: number,
  y: number,
  grid = SNAP_GRID,
): { x: number; y: number } {
  return { x: snapValue(x, grid), y: snapValue(y, grid) };
}

export function letterboxFrame(
  stageW: number,
  stageH: number,
  viewW = VIEW_WIDTH,
  viewH = VIEW_HEIGHT,
  pad = 16,
): { x: number; y: number; scale: number } {
  const scale = Math.min(
    Math.max(32, stageW - pad * 2) / viewW,
    Math.max(32, stageH - pad * 2) / viewH,
  );
  return {
    x: (stageW - viewW * scale) / 2,
    y: (stageH - viewH * scale) / 2,
    scale: Number.isFinite(scale) && scale > 0 ? scale : 1,
  };
}

export function fitPageInView(
  stageW: number,
  stageH: number,
  viewW = VIEW_WIDTH,
  viewH = VIEW_HEIGHT,
  pad = 40,
): { zoom: number; pan: { x: number; y: number } } {
  const frame = letterboxFrame(stageW, stageH, viewW, viewH, pad);
  return { zoom: frame.scale, pan: { x: frame.x, y: frame.y } };
}

export function contentWorldBBox(doc: BoardDocument): BBox | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let any = false;
  for (const el of Object.values(doc.elements)) {
    if (el.parentId) continue;
    if (el.visible === false) continue;
    any = true;
    const b = elementWorldBBox(doc, el.id);
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  }
  if (!any) return null;
  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}

function unionBox(a: BBox | null, b: BBox): BBox {
  if (!a) return b;
  const minX = Math.min(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxX = Math.max(a.x + a.width, b.x + b.width);
  const maxY = Math.max(a.y + a.height, b.y + b.height);
  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}

/** Rest layout plus every keyframe pose, so motion stays in the export frame. */
export function motionWorldBBox(doc: BoardDocument): BBox | null {
  let box = contentWorldBBox(doc);
  for (const el of Object.values(doc.elements)) {
    if (el.parentId) continue;
    if (el.visible === false) continue;
    if (!el.keyframes?.length) continue;
    const size = elementSize(el);
    for (const kf of el.keyframes) {
      box = unionBox(box, {
        x: kf.x,
        y: kf.y,
        width: Math.max(kf.width ?? size.width, 1),
        height: Math.max(kf.height ?? size.height, 1),
      });
    }
  }
  return box;
}

export function fitContentInView(
  doc: BoardDocument,
  stageW: number,
  stageH: number,
  pad = 64,
): { zoom: number; pan: { x: number; y: number } } {
  const bbox = contentWorldBBox(doc);
  if (!bbox) {
    return { zoom: 1, pan: { x: stageW / 2, y: stageH / 2 } };
  }
  const w = Math.max(bbox.width, 32);
  const h = Math.max(bbox.height, 32);
  const zoom = Math.min(
    Math.max(32, stageW - pad * 2) / w,
    Math.max(32, stageH - pad * 2) / h,
    16,
  );
  const z = Number.isFinite(zoom) && zoom > 0 ? Math.max(0.05, zoom) : 1;
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;
  return {
    zoom: z,
    pan: { x: stageW / 2 - cx * z, y: stageH / 2 - cy * z },
  };
}

/** Camera that shows the same world region as the editor canvas (nothing cropped). */
export function cameraFromEditorView(
  pan: { x: number; y: number },
  zoom: number,
  stageW: number,
  stageH: number,
  viewW = VIEW_WIDTH,
  viewH = VIEW_HEIGHT,
): CameraState {
  const z = Math.max(zoom, 0.001);
  const worldW = Math.max(stageW / z, 1);
  const worldH = Math.max(stageH / z, 1);
  return {
    x: (stageW / 2 - pan.x) / z,
    y: (stageH / 2 - pan.y) / z,
    zoom: Math.min(viewW / worldW, viewH / worldH),
    rotation: 0,
  };
}
