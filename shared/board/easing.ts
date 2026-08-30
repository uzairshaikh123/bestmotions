import type { BoardEasing } from "./types";

export function easePose(t: number, kind: BoardEasing | string | undefined): number {
  const x = Math.min(1, Math.max(0, t));
  if (kind === "linear") return x;
  if (kind === "power2.out") return 1 - (1 - x) * (1 - x);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

/** GSAP ease string used on the Konva editor preview. */
export const GSAP_EASE: Record<BoardEasing, string> = {
  "power2.inOut": "power2.inOut",
  linear: "none",
  "power2.out": "power2.out",
};

export type RevideoEaseName =
  | "easeInOutCubic"
  | "linear"
  | "easeOutCubic";

export const REVIDEO_EASE: Record<BoardEasing, RevideoEaseName> = {
  "power2.inOut": "easeInOutCubic",
  linear: "linear",
  "power2.out": "easeOutCubic",
};
