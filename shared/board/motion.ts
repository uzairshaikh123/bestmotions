import { easePose } from "./easing";
import { applyKeyframeToPose, interpolateKeyframes, restPoseOf } from "./keyframes";
import type { BoardElement, MotionPreset, Pose } from "./types";

function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

export function poseAtTime(
  el: BoardElement,
  timeMs: number | null,
  playing = timeMs != null,
): Pose {
  const rest = applyKeyframeToPose(
    restPoseOf(el),
    interpolateKeyframes(el.keyframes, timeMs ?? 0),
  );
  if (!playing || timeMs == null) return rest;
  if (el.keyframes && el.keyframes.length > 0) return rest;
  const preset = el.motion?.preset || "none";
  if (preset === "none") return rest;
  const delay = el.motion?.delayMs ?? 0;
  const dur = Math.max(el.motion?.durationMs ?? 1200, 1);
  const local = timeMs - delay;
  const looping =
    preset === "loopPulse" ||
    preset === "loopSpin" ||
    el.motion?.phase === "loop";
  let rawT: number;
  if (looping) {
    if (local < 0) return rest;
    rawT = (((local % dur) + dur) % dur) / dur;
  } else if (local <= 0) {
    rawT = 0;
  } else {
    rawT = clamp01(local / dur);
  }
  const u = easePose(rawT, el.motion?.easing);
  return applyPreset(preset, u, rawT, rest);
}

export function applyPreset(
  preset: MotionPreset,
  u: number,
  rawT: number,
  rest: Pose,
): Pose {
  const wave = Math.sin(rawT * Math.PI);
  switch (preset) {
    case "fadeIn":
      return { ...rest, opacity: rest.opacity * u };
    case "slideIn":
      return { ...rest, x: rest.x - 56 * (1 - u), opacity: rest.opacity * u };
    case "slideUp":
      return { ...rest, y: rest.y + 48 * (1 - u), opacity: rest.opacity * u };
    case "popIn":
      return { ...rest, scale: 0.4 + 0.6 * u, opacity: rest.opacity * u };
    case "zoomIn":
      return {
        ...rest,
        scale: 0.55 + 0.45 * u,
        opacity: rest.opacity * Math.min(1, u * 1.4),
      };
    case "flipIn":
      return { ...rest, scaleY: Math.max(0.05, u), opacity: rest.opacity * u };
    case "rotateIn":
      return {
        ...rest,
        rotation: rest.rotation - 90 * (1 - u),
        opacity: rest.opacity * u,
      };
    case "fadeOut":
      return { ...rest, opacity: rest.opacity * (1 - u) };
    case "slideOut":
      return { ...rest, x: rest.x + 56 * u, opacity: rest.opacity * (1 - u) };
    case "zoomOut":
      return { ...rest, scale: 1 + 0.35 * u, opacity: rest.opacity * (1 - u) };
    case "popOut":
      return { ...rest, scale: 1 + 0.2 * u, opacity: rest.opacity * (1 - u) };
    case "bounce":
      return { ...rest, y: rest.y - 18 * Math.abs(Math.sin(rawT * Math.PI * 2)) };
    case "shake":
      return { ...rest, x: rest.x + 10 * Math.sin(rawT * Math.PI * 8) };
    case "swing":
      return { ...rest, rotation: rest.rotation + 12 * Math.sin(rawT * Math.PI * 2) };
    case "pulse":
    case "loopPulse":
      return { ...rest, scale: 1 + 0.1 * wave };
    case "wobble":
      return {
        ...rest,
        rotation: rest.rotation + 8 * Math.sin(rawT * Math.PI * 4),
        scale: 1 + 0.04 * wave,
      };
    case "flash":
      return {
        ...rest,
        opacity:
          rest.opacity * (0.35 + 0.65 * Math.abs(Math.sin(rawT * Math.PI * 3))),
      };
    case "nod":
      return { ...rest, rotation: rest.rotation + 12 * Math.sin(rawT * Math.PI * 2) };
    case "loopSpin":
      return { ...rest, rotation: rest.rotation + 360 * rawT };
    default:
      return rest;
  }
}

export function formatClock(ms: number): string {
  const total = Math.max(0, ms) / 1000;
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  const cs = Math.floor((total % 1) * 100);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

export const IN_PRESETS: { id: MotionPreset; label: string }[] = [
  { id: "fadeIn", label: "Fade In" },
  { id: "slideUp", label: "Slide Up" },
  { id: "popIn", label: "Pop In" },
  { id: "zoomIn", label: "Zoom In" },
  { id: "flipIn", label: "Flip In" },
  { id: "rotateIn", label: "Rotate In" },
];

export const EMPHASIS_PRESETS: { id: MotionPreset; label: string }[] = [
  { id: "bounce", label: "Bounce" },
  { id: "shake", label: "Shake" },
  { id: "swing", label: "Swing" },
  { id: "pulse", label: "Pulse" },
  { id: "wobble", label: "Wobble" },
  { id: "flash", label: "Flash" },
];

export const OUT_PRESETS: { id: MotionPreset; label: string }[] = [
  { id: "fadeOut", label: "Fade Out" },
  { id: "slideOut", label: "Slide Out" },
  { id: "zoomOut", label: "Zoom Out" },
  { id: "popOut", label: "Pop Out" },
];

export const LOOP_PRESETS: { id: MotionPreset; label: string }[] = [
  { id: "loopPulse", label: "Pulse" },
  { id: "loopSpin", label: "Spin" },
  { id: "bounce", label: "Bounce" },
  { id: "wobble", label: "Wobble" },
];

export const CAMERA_MOVES: { id: import("./types").TransitionIn; label: string }[] = [
  { id: "pan", label: "Pan" },
  { id: "zoom", label: "Zoom" },
  { id: "slide", label: "Slide" },
  { id: "wipe", label: "Wipe" },
  { id: "fade", label: "Fade" },
  { id: "push", label: "Push" },
];
