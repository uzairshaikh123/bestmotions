import React from "react";
import { formatClock } from "../../../shared/board";

type Props = {
  timeMs: number;
  durationMs: number;
  playing: boolean;
  onPlay: () => void;
  onAddScene: () => void;
  onAddCamera: () => void;
};

export function MagicTransport({
  timeMs,
  durationMs,
  playing,
  onPlay,
  onAddScene,
  onAddCamera,
}: Props) {
  return (
    <div className="mb-transport">
      <button
        type="button"
        className={playing ? "mb-play on" : "mb-play"}
        onClick={onPlay}
        title={playing ? "Pause (Space)" : "Play (Space)"}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.5v13l11-6.5L8 5.5z" />
          </svg>
        )}
      </button>
      <span className="mb-clock">
        {formatClock(timeMs)}
        <em> / {formatClock(durationMs)}</em>
      </span>
      <div className="mb-transport-actions">
        <button type="button" onClick={onAddScene}>
          + Scene
        </button>
        <button type="button" className="ghost" onClick={onAddCamera}>
          + Camera
        </button>
      </div>
    </div>
  );
}
