import React, { useEffect, useRef, useState } from "react";
import {
  useFeatureFlags,
  withFeatureFlagVariables,
} from "../featureFlags";
import {
  RevideoPreview,
  type RevideoPreviewHandle,
} from "./RevideoPreview";
import type { AssetDefinition } from "./types";

const MAX_THUMBS = 64;
const STORAGE_KEY = "bm-asset-thumbs-v3";
const thumbCache = new Map<string, string>();
/** Prefer later frames so entrance animations and clock hands are visible. */
const CAPTURE_RATIOS = [0.72, 0.88, 0.55, 0.4, 0.25];

function loadPersisted() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, string>;
    for (const [id, data] of Object.entries(parsed)) {
      if (typeof data === "string" && data.startsWith("data:image")) {
        thumbCache.set(id, data);
      }
    }
  } catch {
    /* ignore */
  }
}

function persistThumbs() {
  try {
    const out: Record<string, string> = {};
    let n = 0;
    for (const [id, data] of thumbCache) {
      out[id] = data;
      n += 1;
      if (n >= MAX_THUMBS) break;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(out));
  } catch {
    /* quota / private mode */
  }
}

if (typeof window !== "undefined") loadPersisted();

function rememberThumb(id: string, data: string) {
  if (thumbCache.has(id)) thumbCache.delete(id);
  thumbCache.set(id, data);
  while (thumbCache.size > MAX_THUMBS) {
    const oldest = thumbCache.keys().next().value;
    if (!oldest) break;
    thumbCache.delete(oldest);
  }
  persistThumbs();
}

const waiters: Array<() => void> = [];
let slots = 4;

function acquireSlot() {
  if (slots > 0) {
    slots -= 1;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => waiters.push(resolve));
}

function releaseSlot() {
  const next = waiters.shift();
  if (next) next();
  else slots += 1;
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function variablesFor(
  asset: AssetDefinition,
  flags: ReturnType<typeof useFeatureFlags>,
) {
  return withFeatureFlagVariables(
    {
      template: asset.template,
      ...asset.defaults,
    },
    flags,
  );
}

/** Reject empty / near-black first frames common in entrance animations. */
function isUsefulFrame(canvas: HTMLCanvasElement): boolean {
  try {
    const probe = document.createElement("canvas");
    probe.width = 48;
    probe.height = 27;
    const ctx = probe.getContext("2d", { willReadFrequently: true });
    if (!ctx) return true;
    ctx.drawImage(canvas, 0, 0, 48, 27);
    const { data } = ctx.getImageData(0, 0, 48, 27);
    let sum = 0;
    let max = 0;
    let bright = 0;
    const n = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      const l = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      sum += l;
      if (l > max) max = l;
      if (l > 40) bright += 1;
    }
    const avg = sum / n;
    return avg > 16 || max > 48 || bright / n > 0.04;
  } catch {
    return true;
  }
}

function captureFrame(handle: RevideoPreviewHandle) {
  const canvas = handle.getCanvas();
  if (!canvas || canvas.width < 8 || canvas.height < 8) return null;
  if (!isUsefulFrame(canvas)) return null;
  try {
    return canvas.toDataURL("image/jpeg", 0.78);
  } catch {
    return null;
  }
}

type Props = {
  asset: AssetDefinition;
  playing: boolean;
  instanceKey: string;
};

export function AssetThumb({ asset, playing, instanceKey }: Props) {
  const flags = useFeatureFlags();
  const rootRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<RevideoPreviewHandle>(null);
  const [inView, setInView] = useState(false);
  const [still, setStill] = useState(() => thumbCache.get(asset.id) || "");
  const [capturing, setCapturing] = useState(false);
  const estimatedDuration = Math.max(
    0.8,
    asset.durationInFrames / Math.max(asset.fps, 1),
  );
  const title = String(asset.defaults.title || asset.name);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "160px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const cached = thumbCache.get(asset.id);
    if (cached) {
      setStill(cached);
      return;
    }
    setStill("");
  }, [asset.id]);

  useEffect(() => {
    if (still || !inView) return;

    let cancelled = false;
    let held = false;

    (async () => {
      await acquireSlot();
      held = true;
      if (cancelled) return;
      setCapturing(true);

      // Let the capture player mount, then wait for Revideo readiness.
      await sleep(40);
      const started = Date.now();
      while (!cancelled && Date.now() - started < 14_000) {
        const handle = previewRef.current;
        if (handle?.isReady()) {
          const duration = Math.max(handle.getDuration(), estimatedDuration);
          for (const ratio of CAPTURE_RATIOS) {
            if (cancelled) return;
            handle.pause();
            handle.seek(duration * ratio);
            await sleep(220);
            const data = captureFrame(handle);
            if (data && data.length > 900) {
              rememberThumb(asset.id, data);
              if (!cancelled) setStill(data);
              return;
            }
          }
          // Last resort: accept whatever frame is there so the card isn't empty forever.
          handle.seek(duration * 0.45);
          await sleep(160);
          const canvas = handle.getCanvas();
          if (canvas && canvas.width > 8) {
            try {
              const fallback = canvas.toDataURL("image/jpeg", 0.78);
              if (fallback.length > 900) {
                rememberThumb(asset.id, fallback);
                if (!cancelled) setStill(fallback);
                return;
              }
            } catch {
              /* keep trying until timeout */
            }
          }
        }
        await sleep(120);
      }
    })().finally(() => {
      if (!cancelled) setCapturing(false);
      if (held) releaseSlot();
    });

    return () => {
      cancelled = true;
    };
  }, [asset.id, estimatedDuration, inView, still]);

  const showPlayer = playing || (capturing && !still);

  return (
    <div
      ref={rootRef}
      className="asset-thumb asset-thumb-live"
      style={{ ["--accent" as string]: asset.accent }}
    >
      {still ? (
        <img className="asset-thumb-img" src={still} alt="" />
      ) : (
        <span className="asset-thumb-poster" aria-hidden>
          <span className="asset-thumb-kicker">{asset.category}</span>
          <strong>{title}</strong>
        </span>
      )}
      {showPlayer ? (
        <div
          className={
            playing ? "asset-thumb-player" : "asset-thumb-player is-capture"
          }
        >
          <RevideoPreview
            ref={previewRef}
            instanceKey={instanceKey}
            variables={variablesFor(asset, flags)}
            playing={playing}
            muted
            controls={false}
            quality={0.55}
            width={640}
            height={360}
            estimatedDuration={estimatedDuration}
          />
        </div>
      ) : null}
    </div>
  );
}
