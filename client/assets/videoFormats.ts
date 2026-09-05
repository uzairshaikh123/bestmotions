export type VideoFormat = {
  id: string;
  label: string;
  ratio: string;
  hint: string;
  width: number;
  height: number;
};

/** Standard output sizes. Scenes are designed at 1280×720 and scaled to fit. */
export const VIDEO_FORMATS: VideoFormat[] = [
  {
    id: "16:9",
    label: "Landscape",
    ratio: "16:9",
    hint: "YouTube, TV",
    width: 1920,
    height: 1080,
  },
  {
    id: "9:16",
    label: "Vertical",
    ratio: "9:16",
    hint: "Shorts, Reels, TikTok",
    width: 1080,
    height: 1920,
  },
  {
    id: "1:1",
    label: "Square",
    ratio: "1:1",
    hint: "Feed post",
    width: 1080,
    height: 1080,
  },
  {
    id: "4:5",
    label: "Portrait",
    ratio: "4:5",
    hint: "Instagram",
    width: 1080,
    height: 1350,
  },
  {
    id: "4:3",
    label: "Classic",
    ratio: "4:3",
    hint: "Slides",
    width: 1440,
    height: 1080,
  },
  {
    id: "21:9",
    label: "Ultrawide",
    ratio: "21:9",
    hint: "Cinematic",
    width: 1920,
    height: 824,
  },
];

export const DEFAULT_FORMAT_ID = "16:9";

export function formatById(id: string | number | undefined | null): VideoFormat {
  const key = String(id || DEFAULT_FORMAT_ID);
  return VIDEO_FORMATS.find((format) => format.id === key) ?? VIDEO_FORMATS[0];
}

export function defaultFormatId(category?: string) {
  return category === "shorts" ? "9:16" : DEFAULT_FORMAT_ID;
}

export function formatOrientation(format: VideoFormat) {
  if (format.width === format.height) return "square" as const;
  return format.width > format.height ? ("landscape" as const) : ("portrait" as const);
}