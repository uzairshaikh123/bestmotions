export const BOARD_VERSION = 1 as const;

export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 720;
export const DEFAULT_FPS = 30;
export const DEFAULT_HOLD_MS = 3000;
export const DEFAULT_TRANSITION_MS = 800;
export const DEFAULT_PADDING = 40;

export type MotionPhase = "in" | "out" | "loop";

export type MotionPreset =
  | "none"
  | "fadeIn"
  | "slideUp"
  | "slideIn"
  | "popIn"
  | "zoomIn"
  | "flipIn"
  | "rotateIn"
  | "fadeOut"
  | "slideOut"
  | "zoomOut"
  | "popOut"
  | "bounce"
  | "shake"
  | "swing"
  | "pulse"
  | "wobble"
  | "flash"
  | "nod"
  | "loopPulse"
  | "loopSpin";

export type ChartKind = "bar" | "pie" | "line" | "stat";

export type ElementType =
  | "rectangle"
  | "circle"
  | "triangle"
  | "star"
  | "arrow"
  | "text"
  | "image"
  | "line"
  | "group"
  | "chart"
  | "template";

export type TransitionIn =
  | "zoomPan"
  | "zoomOnly"
  | "panOnly"
  | "cut"
  | "pan"
  | "zoom"
  | "slide"
  | "wipe"
  | "fade"
  | "push";

export type BoardEasing = "power2.inOut" | "linear" | "power2.out";

export type Vec2 = { x: number; y: number };

export type ElementMotion = {
  preset: MotionPreset;
  phase?: MotionPhase;
  durationMs?: number;
  delayMs?: number;
  easing?: BoardEasing;
};

export type PoseKeyframe = {
  timeMs: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number;
  scale: number;
  scaleY?: number;
  opacity: number;
  easing?: BoardEasing;
};

export type BoardElement = {
  id: string;
  name?: string;
  type: ElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number;
  opacity: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  pivot?: Vec2;
  parentId: string | null;
  children: string[];
  content?: string;
  fontSize?: number;
  src?: string;
  visible?: boolean;
  locked?: boolean;
  motion?: ElementMotion;
  keyframes?: PoseKeyframe[];
  chartKind?: ChartKind;
  chartData?: string;
  templateId?: string;
  revideoTemplate?: string;
  variables?: Record<string, string | number>;
};

export type BoardScene = {
  id: string;
  name: string;
  elementIds: string[];
  durationMs: number;
  transitionIn: TransitionIn;
  transitionMs: number;
  easing: BoardEasing;
  camera: {
    mode: "fitTarget" | "manual";
    targetId?: string;
    padding?: number;
    x?: number;
    y?: number;
    zoom?: number;
    rotation?: number;
  };
};

export type BoardDocument = {
  version: typeof BOARD_VERSION;
  name?: string;
  meta: {
    fps: number;
    width: number;
    height: number;
    background: string;
    durationMs?: number;
  };
  elements: Record<string, BoardElement>;
  scenes: BoardScene[];
};

export type CameraState = {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
};

export type BBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Pose = {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  scaleY: number;
  opacity: number;
};
