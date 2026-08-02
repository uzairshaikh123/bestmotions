import { apiUrl } from "./backend";

/** Turn a title into a safe .mp4 filename. */
export function videoFilename(title: string, fallback = "bestmotions"): string {
  const base = String(title || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || fallback}.mp4`;
}

/** Download an MP4 from a /videos/... URL into the user's Downloads folder. */
export async function downloadVideo(
  videoUrl: string,
  filename: string,
): Promise<void> {
  const url = apiUrl(videoUrl);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Could not download video.");
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename.endsWith(".mp4") ? filename : `${filename}.mp4`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}
