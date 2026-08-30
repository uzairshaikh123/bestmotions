import React from "react";
import { formatClock } from "../../../shared/board";
import { Icon } from "./icons";

type Props = {
  name: string;
  timeMs: number;
  durationMs: number;
  playing: boolean;
  zoomPct: number;
  background: string;
  exportBusy: boolean;
  onName: (name: string) => void;
  onPlay: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onPreview: () => void;
  onExport: () => void;
  onHome: () => void;
  onFit: () => void;
  onZoomStep: (dir: -1 | 1) => void;
  onBackground: (color: string) => void;
};

export function MagicHeader({
  name,
  timeMs,
  durationMs,
  playing,
  zoomPct,
  background,
  exportBusy,
  onName,
  onPlay,
  onUndo,
  onRedo,
  onPreview,
  onExport,
  onHome,
  onFit,
  onZoomStep,
  onBackground,
}: Props) {
  return (
    <header className="mb-header">
      <div className="mb-brand">
        <button type="button" className="mb-logo" onClick={onHome} title="Back to Assets">
          <span className="mb-spark">
            <Icon name="spark" size={18} />
          </span>
          MagicBoard
        </button>
        <label className="mb-project-wrap">
          <input
            className="mb-project"
            value={name}
            onChange={(e) => onName(e.target.value)}
            aria-label="Project name"
          />
          <Icon name="chevron" size={14} />
        </label>
      </div>

      <div className="mb-transport" aria-label="Playback">
        <button
          type="button"
          className={playing ? "mb-play on" : "mb-play"}
          onClick={onPlay}
          title={playing ? "Pause (Space)" : "Play (Space)"}
        >
          <Icon name={playing ? "pause" : "play"} size={16} />
        </button>
        <span className="mb-clock">
          {formatClock(timeMs)} <em>/ {formatClock(durationMs)}</em>
        </span>
        <span className="mb-zoom-group">
          <button type="button" className="mb-zoom-fit" onClick={onFit} title="Fit all objects in view">
            Fit
          </button>
          <button type="button" className="mb-icon" onClick={() => onZoomStep(-1)} title="Zoom out">
            −
          </button>
          <span className="mb-zoom-readout">{zoomPct}%</span>
          <button type="button" className="mb-icon" onClick={() => onZoomStep(1)} title="Zoom in">
            +
          </button>
        </span>
        <label className="mb-bg-picker" title="Canvas background">
          <span style={{ background }} />
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(background) ? background : "#ffffff"}
            onChange={(e) => onBackground(e.target.value)}
            aria-label="Canvas background color"
          />
        </label>
      </div>

      <div className="mb-actions">
        <button type="button" className="mb-icon" onClick={onUndo} title="Undo">
          <Icon name="undo" />
        </button>
        <button type="button" className="mb-icon" onClick={onRedo} title="Redo">
          <Icon name="redo" />
        </button>
        <button type="button" className="mb-ghost" onClick={onPreview}>
          Preview
        </button>
        <button type="button" className="mb-export" onClick={onExport} disabled={exportBusy}>
          {exportBusy ? "Exporting…" : "Export"}
        </button>
        <span className="mb-avatar" aria-hidden>
          B
        </span>
      </div>
    </header>
  );
}
