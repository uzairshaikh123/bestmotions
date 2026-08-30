import { contentWorldBBox, fitCameraToBBox, motionWorldBBox, sceneCameraState } from "./layout";
import {
  DEFAULT_PADDING,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type BoardDocument,
  type BoardScene,
  type CameraState,
} from "./types";

export type TimelineSegment = {
  scene: BoardScene;
  sceneIndex: number;
  /** Absolute start of the transition into this scene. */
  startMs: number;
  transitionMs: number;
  holdMs: number;
  endMs: number;
  from: CameraState;
  to: CameraState;
};

export function buildTimeline(doc: BoardDocument): TimelineSegment[] {
  const segments: TimelineSegment[] = [];
  let t = 0;
  let prev: CameraState | undefined;
  doc.scenes.forEach((scene, sceneIndex) => {
    const to = sceneCameraState(doc, scene, prev);
    const from = prev ?? to;
    const transitionMs =
      scene.transitionIn === "cut" ||
      scene.transitionIn === "wipe" ||
      scene.transitionIn === "fade" ||
      sceneIndex === 0
        ? 0
        : scene.transitionMs;
    const holdMs = scene.durationMs;
    const startMs = t;
    const endMs = startMs + transitionMs + holdMs;
    segments.push({
      scene,
      sceneIndex,
      startMs,
      transitionMs,
      holdMs,
      endMs,
      from,
      to,
    });
    t = endMs;
    prev = to;
  });
  return segments;
}

export function totalDurationMs(doc: BoardDocument): number {
  const segs = buildTimeline(doc);
  return segs.length ? segs[segs.length - 1].endMs : 0;
}

export function contentDurationMs(doc: BoardDocument): number {
  let max = totalDurationMs(doc);
  for (const el of Object.values(doc.elements)) {
    const end = (el.motion?.delayMs ?? 0) + Math.max(0, el.motion?.durationMs ?? 0);
    if (end > max) max = end;
    if (el.keyframes?.length) {
      const last = Math.max(...el.keyframes.map((kf) => kf.timeMs));
      if (last > max) max = last;
    }
  }
  return Math.max(0, max);
}

/** Explicit project length when set; otherwise the content length. May be 0. */
export function compositionDurationMs(doc: BoardDocument): number {
  if (doc.meta.durationMs != null) return Math.max(0, doc.meta.durationMs);
  return contentDurationMs(doc);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpCamera(a: CameraState, b: CameraState, t: number): CameraState {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    zoom: lerp(a.zoom, b.zoom, t),
    rotation: lerp(a.rotation, b.rotation, t),
  };
}

export function cameraAtMs(
  doc: BoardDocument,
  timeMs: number,
): { camera: CameraState; segment: TimelineSegment | null; localMs: number } {
  const bbox = motionWorldBBox(doc) || contentWorldBBox(doc);
  const fitAll = bbox
    ? fitCameraToBBox(
        bbox,
        Math.max(DEFAULT_PADDING, 80),
        doc.meta.width || VIEW_WIDTH,
        doc.meta.height || VIEW_HEIGHT,
      )
    : { x: 0, y: 0, zoom: 1, rotation: 0 };

  const segs = buildTimeline(doc).filter((seg) => seg.scene.camera.mode === "manual");
  if (!segs.length) {
    return { camera: fitAll, segment: null, localMs: 0 };
  }
  const t = Math.max(0, timeMs);
  for (const seg of segs) {
    if (t <= seg.endMs || seg === segs[segs.length - 1]) {
      if (t < seg.startMs + seg.transitionMs) {
        const u =
          seg.transitionMs <= 0
            ? 1
            : (t - seg.startMs) / seg.transitionMs;
        return {
          camera: lerpCamera(seg.from, seg.to, Math.min(1, Math.max(0, u))),
          segment: seg,
          localMs: t - seg.startMs,
        };
      }
      return {
        camera: seg.to,
        segment: seg,
        localMs: t - seg.startMs,
      };
    }
  }
  const last = segs[segs.length - 1];
  return { camera: last.to, segment: last, localMs: last.endMs - last.startMs };
}
