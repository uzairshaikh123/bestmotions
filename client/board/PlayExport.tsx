import React, { useRef, useState } from "react";
import { gsap } from "gsap";
import {
  stringifyBoard,
  totalDurationMs,
  type BoardDocument,
} from "../../shared/board";
import { RevideoPreview, type RevideoPreviewHandle } from "../assets/RevideoPreview";
import { videoFilename } from "../downloadVideo";
import { downloadBlob, findCanvas, recordCanvas } from "../recordCanvas";

type Props = {
  doc: BoardDocument;
  playing: boolean;
  onPlaying: (on: boolean) => void;
};

export function PlayExport({ doc, playing, onPlaying }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<RevideoPreviewHandle>(null);
  const [phase, setPhase] = useState<"idle" | "rendering" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [draftBusy, setDraftBusy] = useState(false);
  const variables = {
    template: "magic-board",
    boardJson: stringifyBoard(doc),
    sound: "off",
  };

  async function exportMp4() {
    setError(null);
    setPhase("rendering");
    try {
      const handle = previewRef.current;
      const canvas =
        handle?.getCanvas() || findCanvas(wrapRef.current);
      if (!canvas) throw new Error("Open Play first so the preview canvas exists.");
      if (handle) {
        handle.seek(0);
        handle.play();
      } else {
        onPlaying(true);
      }
      const seconds = Math.max(handle?.getDuration() || totalDurationMs(doc) / 1000, 1);
      const { blob, ext } = await recordCanvas(canvas, seconds * 1000);
      handle?.pause();
      const base = videoFilename(doc.name || "magic-board").replace(/\.mp4$/i, "");
      downloadBlob(blob, `${base}.${ext}`);
      setPhase("done");
    } catch (err) {
      setPhase("idle");
      setError(err instanceof Error ? err.message : "Export failed");
    }
  }

  async function recordDraft() {
    setError(null);
    setDraftBusy(true);
    try {
      onPlaying(true);
      await new Promise((r) => setTimeout(r, 400));
      const canvas = findCanvas(wrapRef.current);
      if (!canvas) {
        throw new Error("Could not find preview canvas for a draft capture.");
      }
      const ms = Math.max(1200, totalDurationMs(doc) || 4000);
      const { blob, ext } = await recordCanvas(canvas, ms);
      downloadBlob(blob, `${(doc.name || "magic-board").replace(/\s+/g, "-")}-draft.${ext}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Draft capture failed");
    } finally {
      setDraftBusy(false);
    }
  }

  const duration = totalDurationMs(doc);

  return (
    <div className="board-play-export">
      <div className="board-play-actions">
        <button type="button" onClick={() => onPlaying(!playing)}>
          {playing ? "Close player" : "Play (Revideo)"}
        </button>
        <button
          type="button"
          onClick={() => void exportMp4()}
          disabled={phase === "rendering" || duration <= 0}
        >
          {phase === "rendering" ? "Recording…" : "Export video"}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => void recordDraft()}
          disabled={draftBusy || duration <= 0}
        >
          {draftBusy ? "Recording draft…" : "Quick draft"}
        </button>
      </div>
      {error ? <p className="status error">{error}</p> : null}
      <p className="control-hint">
        Export records the live preview in your browser — no server Chromium.
      </p>
      {playing ? (
        <div className="board-player" ref={wrapRef}>
          <RevideoPreview
            ref={previewRef}
            variables={variables}
            playing
            controls
            muted
            instanceKey={`board-${doc.scenes.length}-${duration}`}
            estimatedDuration={duration / 1000}
          />
        </div>
      ) : null}
    </div>
  );
}

export function CanvasScrubber({
  doc,
  timeMs,
  playing,
  onTime,
  onPlaying,
}: {
  doc: BoardDocument;
  timeMs: number;
  playing: boolean;
  onTime: (ms: number) => void;
  onPlaying: (on: boolean) => void;
}) {
  const tween = useRef<gsap.core.Tween | null>(null);
  const duration = totalDurationMs(doc);

  function toggle() {
    if (playing) {
      tween.current?.kill();
      onPlaying(false);
      return;
    }
    if (duration <= 0) return;
    onPlaying(true);
    const proxy = { t: timeMs >= duration ? 0 : timeMs };
    tween.current?.kill();
    tween.current = gsap.to(proxy, {
      t: duration,
      duration: (duration - proxy.t) / 1000,
      ease: "none",
      onUpdate: () => onTime(proxy.t),
      onComplete: () => {
        onPlaying(false);
        onTime(0);
      },
    });
  }

  return (
    <div className="board-scrubber">
      <button type="button" className="secondary" onClick={toggle} disabled={duration <= 0}>
        {playing ? "Pause preview" : "Canvas preview (GSAP)"}
      </button>
      <input
        type="range"
        min={0}
        max={Math.max(duration, 1)}
        value={Math.min(timeMs, duration)}
        onChange={(e) => {
          tween.current?.kill();
          onPlaying(false);
          onTime(Number(e.target.value));
        }}
        disabled={duration <= 0}
        aria-label="Preview time"
      />
      <span className="board-scrub-time">
        {(timeMs / 1000).toFixed(1)}s / {(duration / 1000).toFixed(1)}s
      </span>
    </div>
  );
}
