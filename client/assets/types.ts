export type FieldType =
  | "text"
  | "textarea"
  | "color"
  | "select"
  | "image"
  | "number";

export type AssetFieldColumn = {
  label: string;
  kind?: "text" | "number" | "color";
};

export type AssetField = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  hint?: string;
  step?: number;
  min?: number;
  max?: number;
  /** Structured row editor — serialized back to `a|b|c` lines for scenes. */
  columns?: AssetFieldColumn[];
};

export type AssetCategory =
  | "maps"
  | "3d"
  | "text"
  | "photos"
  | "charts"
  | "ui"
  | "shorts"
  | "india"
  | "timeline"
  | "money"
  | "comparison"
  | "rise"
  | "time"
  | "newspaper"
  | "yt"
  | "fire"
  | "books";

export type AssetDefinition = {
  id: string;
  name: string;
  description: string;
  category: AssetCategory;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  fields: AssetField[];
  defaults: Record<string, string | number>;
  accent: string;
  subcategory?: string;
  /** Passed to the Revideo scene as `template` */
  template: string;
};
