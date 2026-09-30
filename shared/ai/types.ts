export type AiStyle =
  | "any"
  | "news"
  | "doc"
  | "chart"
  | "map"
  | "yt"
  | "shorts"
  | "books";

export type AiAspect = "16:9" | "9:16";

/** How the planner chooses layouts. */
export type AiCreateMode = "auto" | "invent" | "catalog";

export type MotionPlanRequest = {
  prompt: string;
  style?: AiStyle;
  lengthSec?: number;
  aspect?: AiAspect;
  /** invent = always new AI composition; catalog = only existing assets; auto = model chooses */
  mode?: AiCreateMode;
};

export type MotionPlan = {
  assetId: string;
  template: string;
  props: Record<string, string | number>;
  rationale: string;
  alternatives: string[];
  /** True when this plan used the generative ai-compose template. */
  invented?: boolean;
};

export type AiStatusResponse = {
  enabled: boolean;
  configured: boolean;
  model: string | null;
};
