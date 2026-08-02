export type FieldType =
  | "text"
  | "textarea"
  | "color"
  | "select"
  | "image"
  | "number";

export type AssetField = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  hint?: string;
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
  /** Passed to the Revideo scene as `template` */
  template: string;
};
