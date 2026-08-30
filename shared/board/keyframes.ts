import { easePose } from "./easing";
import type { BoardElement, Pose, PoseKeyframe } from "./types";

export const KEYFRAME_HIT_MS = 90;

export function sortKeyframes(frames: PoseKeyframe[]): PoseKeyframe[] {
  return [...frames].sort((a, b) => a.timeMs - b.timeMs);
}

export function restPoseOf(el: BoardElement): Pose {
  return {
    x: el.x,
    y: el.y,
    rotation: el.rotation,
    scale: 1,
    scaleY: 1,
    opacity: el.visible === false ? 0 : el.opacity,
  };
}

export function poseFromElement(el: BoardElement): PoseKeyframe {
  return {
    timeMs: 0,
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    rotation: el.rotation,
    scale: 1,
    scaleY: 1,
    opacity: el.opacity,
  };
}

function lerp(a: number, b: number, u: number): number {
  return a + (b - a) * u;
}

export function interpolateKeyframes(
  frames: PoseKeyframe[] | undefined,
  timeMs: number,
): PoseKeyframe | null {
  if (!frames?.length) return null;
  const sorted = sortKeyframes(frames);
  if (timeMs <= sorted[0].timeMs) return sorted[0];
  const last = sorted[sorted.length - 1];
  if (timeMs >= last.timeMs) return last;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (timeMs > b.timeMs) continue;
    const span = Math.max(1, b.timeMs - a.timeMs);
    const u = easePose((timeMs - a.timeMs) / span, b.easing);
    return {
      timeMs,
      x: lerp(a.x, b.x, u),
      y: lerp(a.y, b.y, u),
      rotation: lerp(a.rotation, b.rotation, u),
      scale: lerp(a.scale, b.scale, u),
      scaleY: lerp(a.scaleY ?? a.scale, b.scaleY ?? b.scale, u),
      opacity: lerp(a.opacity, b.opacity, u),
      width:
        a.width != null && b.width != null ? lerp(a.width, b.width, u) : (b.width ?? a.width),
      height:
        a.height != null && b.height != null
          ? lerp(a.height, b.height, u)
          : (b.height ?? a.height),
      easing: b.easing,
    };
  }
  return last;
}

export function upsertKeyframe(
  frames: PoseKeyframe[] | undefined,
  next: PoseKeyframe,
  hitMs = KEYFRAME_HIT_MS,
): PoseKeyframe[] {
  const sorted = sortKeyframes(frames || []);
  const idx = sorted.findIndex((kf) => Math.abs(kf.timeMs - next.timeMs) <= hitMs);
  if (idx >= 0) {
    sorted[idx] = { ...sorted[idx], ...next, timeMs: sorted[idx].timeMs };
  } else {
    sorted.push(next);
  }
  return sortKeyframes(sorted);
}

export function removeKeyframeAt(
  frames: PoseKeyframe[] | undefined,
  timeMs: number,
  hitMs = KEYFRAME_HIT_MS,
): PoseKeyframe[] {
  return sortKeyframes(frames || []).filter((kf) => Math.abs(kf.timeMs - timeMs) > hitMs);
}

export function lastKeyframeMs(el: BoardElement): number {
  if (!el.keyframes?.length) return 0;
  return Math.max(...el.keyframes.map((kf) => kf.timeMs));
}

export function applyKeyframeToPose(base: Pose, kf: PoseKeyframe | null): Pose {
  if (!kf) return base;
  return {
    x: kf.x,
    y: kf.y,
    rotation: kf.rotation,
    scale: kf.scale,
    scaleY: kf.scaleY ?? kf.scale,
    opacity: kf.opacity,
  };
}
