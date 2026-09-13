/** Find the first drawing canvas, including closed shadow roots. */
export function findCanvas(root: ParentNode | null): HTMLCanvasElement | null {
  if (!root) return null;
  if (root instanceof HTMLCanvasElement) return root;
  const direct = (root as Element).querySelector?.("canvas");
  if (direct instanceof HTMLCanvasElement) return direct;
  const all = (root as Element).querySelectorAll?.("*") ?? [];
  for (const el of all) {
    const sr = (el as HTMLElement).shadowRoot;
    const c = sr?.querySelector("canvas");
    if (c instanceof HTMLCanvasElement) return c;
  }
  return null;
}

function isSafariLike() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iOS / desktop Safari (not Chrome/Firefox/Edge on those engines)
  return (
    /Safari/i.test(ua) &&
    !/Chrome|Chromium|CriOS|Edg|Firefox|FxiOS|OPR|Opera/i.test(ua)
  );
}

/**
 * Video-only mime list. Do not request audio codecs (e.g. mp4a) — the canvas
 * stream has no audio track, and Safari rejects those combinations.
 */
function pickMime(alpha = false): string {
  const candidates = alpha
    ? [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ]
    : [
        // Safari / Apple prefers MP4 / H.264
        "video/mp4;codecs=avc1.42E01E",
        "video/mp4;codecs=avc1.4D401E",
        "video/mp4;codecs=avc1.64001E",
        "video/mp4",
        // Chromium / Firefox fallbacks
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ];
  for (const mime of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return "";
}

export function supportsTransparentExport(): boolean {
  return Boolean(pickMime(true));
}

export function extensionForMime(mime: string): "mp4" | "webm" {
  return /mp4/i.test(mime) ? "mp4" : "webm";
}

export function downloadBlob(blob: Blob, filename: string) {
  // Legacy Edge
  const nav = window.navigator as Navigator & {
    msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => boolean;
  };
  if (typeof nav.msSaveOrOpenBlob === "function") {
    nav.msSaveOrOpenBlob(blob, filename);
    return;
  }

  const url = URL.createObjectURL(blob);
  try {
    downloadHref(url, filename);
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

/** Trigger a download from an existing object/http URL (Safari-safe). */
export function downloadHref(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.rel = "noopener";
  a.target = "_blank";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function waitMs(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, Math.max(0, ms));
  });
}

/**
 * Record a live canvas in the user's browser (no server Chromium).
 * Uses MediaRecorder on captureStream — works in Chrome, Edge, Firefox, Safari.
 */
export async function recordCanvas(
  canvas: HTMLCanvasElement,
  durationMs: number,
  fps = 30,
  opts?: { alpha?: boolean },
): Promise<{ blob: Blob; mime: string; ext: "mp4" | "webm" }> {
  if (typeof canvas.captureStream !== "function") {
    throw new Error(
      "This browser cannot record the canvas. Update Safari / Chrome / Edge / Firefox and try again.",
    );
  }
  if (typeof MediaRecorder === "undefined") {
    throw new Error(
      "This browser has no MediaRecorder. Update Safari / Chrome / Edge / Firefox and try again.",
    );
  }

  const alpha = Boolean(opts?.alpha);
  const mime = pickMime(alpha);

  if (alpha && !mime) {
    throw new Error(
      isSafariLike()
        ? "Transparent WebM export needs a browser that can record WebM with alpha (Chrome or Edge). Turn off Transparent overlay to export MP4 in Safari."
        : "This browser cannot record transparent WebM. Turn off Transparent overlay to export a normal video, or try Chrome / Edge.",
    );
  }

  const stream = canvas.captureStream(fps);
  let recorder: MediaRecorder;
  try {
    recorder = mime
      ? new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 })
      : new MediaRecorder(stream, { videoBitsPerSecond: 6_000_000 });
  } catch {
    stream.getTracks().forEach((t) => t.stop());
    throw new Error(
      isSafariLike()
        ? "Safari could not start canvas recording. Try exporting again, or use Chrome / Edge."
        : "Could not start canvas recording in this browser.",
    );
  }

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const stopped = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const type = recorder.mimeType || mime || "video/mp4";
      resolve(new Blob(chunks, { type }));
    };
    recorder.onerror = () => {
      stream.getTracks().forEach((t) => t.stop());
      reject(new Error("Canvas recorder failed."));
    };
  });

  try {
    recorder.start(250);
  } catch {
    stream.getTracks().forEach((t) => t.stop());
    throw new Error(
      isSafariLike()
        ? "Safari blocked the recorder start. Click Export again from the download button."
        : "Could not start recording.",
    );
  }

  await waitMs(Math.max(400, durationMs + 250));
  if (recorder.state !== "inactive") recorder.stop();
  const blob = await stopped;
  if (!blob.size) throw new Error("Recording was empty.");
  return { blob, mime: blob.type || mime, ext: extensionForMime(blob.type || mime) };
}
