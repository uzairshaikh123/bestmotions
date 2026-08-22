/** Export/render timeout (ms). Revideo MP4 jobs usually need 1–3 minutes. */
export const RENDER_TIMEOUT_MS = Number(
  import.meta.env.VITE_RENDER_TIMEOUT_MS || 180_000,
);

/** Fetching an already-rendered file should be quick. */
export const DOWNLOAD_TIMEOUT_MS = Number(
  import.meta.env.VITE_DOWNLOAD_TIMEOUT_MS || 30_000,
);

/** @deprecated use RENDER_TIMEOUT_MS */
export const REQUEST_TIMEOUT_MS = RENDER_TIMEOUT_MS;

export class TimeoutError extends Error {
  constructor(ms: number, label = "Request") {
    super(`${label} timed out after ${Math.round(ms / 1000)}s.`);
    this.name = "TimeoutError";
  }
}

/** fetch() that rejects after `timeoutMs`. */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = RENDER_TIMEOUT_MS,
  label = "Request",
): Promise<Response> {
  const controller = new AbortController();
  const outer = init.signal;
  if (outer) {
    if (outer.aborted) {
      controller.abort(outer.reason);
    } else {
      outer.addEventListener("abort", () => controller.abort(outer.reason), {
        once: true,
      });
    }
  }

  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (
      err instanceof DOMException &&
      (err.name === "AbortError" || err.code === 20)
    ) {
      throw new TimeoutError(timeoutMs, label);
    }
    if (err instanceof Error && err.name === "AbortError") {
      throw new TimeoutError(timeoutMs, label);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
