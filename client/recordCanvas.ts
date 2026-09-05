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

function pickMime(alpha = false): string {
  const candidates = alpha
    ? [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ]
    : [
        "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
        "video/mp4",
        "video/webm;codecs=vp9,opus",
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

export function extensionForMime(mime: string): "mp4" | "webm" {
  return mime.includes("mp4") ? "mp4" : "webm";
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
}

function waitMs(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, Math.max(0, ms));
  });
}

/**
 * Record a live canvas in the user's browser (no server Chromium).
 * Uses MediaRecorder on captureStream — cheap and much faster than Puppeteer.
 */
export async function recordCanvas(
  canvas: HTMLCanvasElement,
  durationMs: number,
  fps = 30,
  opts?: { alpha?: boolean },
): Promise<{ blob: Blob; mime: string; ext: "mp4" | "webm" }> {
  if (typeof canvas.captureStream !== "function") {
    throw new Error("This browser cannot record the canvas. Try Chrome or Edge.");
  }
  const alpha = Boolean(opts?.alpha);
  if (alpha) {
    canvas.style.background = "transparent";
  }
  const mime = pickMime(alpha);
  const stream = canvas.captureStream(fps);
  const recorder = mime
    ? new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 })
    : new MediaRecorder(stream, { videoBitsPerSecond: 6_000_000 });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const stopped = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const type = recorder.mimeType || mime || "video/webm";
      resolve(new Blob(chunks, { type }));
    };
    recorder.onerror = () => {
      stream.getTracks().forEach((t) => t.stop());
      reject(new Error("Canvas recorder failed."));
    };
  });
  recorder.start(100);
  await waitMs(Math.max(400, durationMs + 200));
  if (recorder.state !== "inactive") recorder.stop();
  const blob = await stopped;
  if (!blob.size) throw new Error("Recording was empty.");
  return { blob, mime: blob.type, ext: extensionForMime(blob.type) };
}
