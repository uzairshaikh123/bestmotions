import { apiUrl } from "./backend";
import { DOWNLOAD_TIMEOUT_MS, fetchWithTimeout } from "./http";

/** Turn a title into a safe .mp4 filename. */
export function videoFilename(title: string, fallback = "bestmotions"): string {
  const base = String(title || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || fallback}.mp4`;
}

function absoluteVideoUrl(videoUrl: string): string {
  if (/^https?:\/\//i.test(videoUrl)) return videoUrl;
  return apiUrl(videoUrl);
}

function triggerAnchorDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename.endsWith(".mp4") ? filename : `${filename}.mp4`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Download an MP4 into the user's Downloads folder.
 * Fails after DOWNLOAD_TIMEOUT_MS instead of hanging forever.
 */
export async function downloadVideo(
  videoUrl: string,
  filename: string,
): Promise<void> {
  const url = absoluteVideoUrl(videoUrl);
  const safeName = filename.endsWith(".mp4") ? filename : `${filename}.mp4`;

  const res = await fetchWithTimeout(
    url,
    { mode: "cors", credentials: "omit" },
    DOWNLOAD_TIMEOUT_MS,
    "Download",
  );
  if (!res.ok) {
    throw new Error(`Could not download video (HTTP ${res.status}).`);
  }
  const blob = await res.blob();
  if (!blob.size) {
    throw new Error("Empty video file.");
  }
  const objectUrl = URL.createObjectURL(blob);
  try {
    triggerAnchorDownload(objectUrl, safeName);
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2_000);
  }
}
