import React, { useState } from "react";
import {
  CAMERA_MOVES,
  EMPHASIS_PRESETS,
  formatClock,
  HIGHLIGHT_PRESETS,
  IN_PRESETS,
  KEYFRAME_HIT_MS,
  LOOP_PRESETS,
  OUT_PRESETS,
  poseAtTime,
  sortKeyframes,
  VOX_PRESETS,
  type BoardEasing,
  type BoardElement,
  type MarkStyle,
  type MotionPhase,
  type MotionPreset,
  type TransitionIn,
} from "../../../shared/board";
import { Icon, PRESET_ICON } from "./icons";

type Props = {
  element: BoardElement | null;
  timeMs: number;
  onChange: (patch: Partial<BoardElement>) => void;
  onCameraMove: (kind: TransitionIn) => void;
  onSeek: (ms: number) => void;
  onAddKeyframe: () => void;
  onRemoveKeyframe: (ms: number) => void;
};

function toHex(color: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  return "#7c5cfc";
}

const TEMPLATE_FIELD_KEYS = [
  "headline",
  "title",
  "highlight",
  "body",
  "quote",
  "markerColor",
  "paperColor",
  "bg",
  "accent",
  "ink",
  "markStyle",
] as const;

function PresetButton({
  id,
  label,
  active,
  disabled,
  onClick,
}: {
  id: string;
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={active ? "on" : ""}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon name={PRESET_ICON[id] || "fade"} size={20} />
      <span>{label}</span>
    </button>
  );
}

export function AnimationsPanel({
  element,
  timeMs,
  onChange,
  onCameraMove,
  onSeek,
  onAddKeyframe,
  onRemoveKeyframe,
}: Props) {
  const [tab, setTab] = useState<MotionPhase | "style">("in");
  const motion = element?.motion;
  const pose = element ? poseAtTime(element, timeMs, false) : null;
  const frames = element?.keyframes ? sortKeyframes(element.keyframes) : [];

  function apply(preset: MotionPreset, phase: MotionPhase) {
    if (!element) return;
    const patch: Partial<BoardElement> = {
      motion: {
        preset,
        phase,
        durationMs: motion?.durationMs && motion.durationMs > 0 ? motion.durationMs : 1200,
        delayMs: motion?.delayMs ?? 0,
        easing: motion?.easing ?? "power2.inOut",
      },
    };
    if (preset === "highlightSweep") {
      patch.markStyle = element.markStyle && element.markStyle !== "none" ? element.markStyle : "highlight";
      if (!element.highlight && element.content) {
        const words = element.content.trim().split(/\s+/);
        patch.highlight = words.slice(0, Math.min(3, words.length)).join(" ");
      }
    }
    if (preset === "underlineDraw") {
      patch.markStyle =
        element.markStyle === "both" || element.markStyle === "highlight"
          ? "both"
          : "underline";
      if (!element.highlight && element.content) {
        const words = element.content.trim().split(/\s+/);
        patch.highlight = words.slice(0, Math.min(3, words.length)).join(" ");
      }
    }
    if (preset === "markerFlash") {
      patch.markStyle = element.markStyle && element.markStyle !== "none" ? element.markStyle : "highlight";
      patch.markerColor = element.markerColor || "#FAFF00";
    }
    onChange(patch);
  }

  function setTemplateVar(key: string, value: string) {
    if (!element) return;
    const next = { ...(element.variables || {}) };
    if (value === "") delete next[key];
    else next[key] = value;
    onChange({ variables: next });
  }

  return (
    <aside className="mb-anim">
      <div className="mb-anim-tabs">
        {(["in", "style", "out", "loop"] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? "on" : ""}
            onClick={() => setTab(t)}
          >
            {t === "in" ? "In" : t === "out" ? "Out" : t === "loop" ? "Loop" : "Style"}
          </button>
        ))}
      </div>

      {element ? (
        <div className="mb-props">
          <h4>Element</h4>
          <p className="mb-prop-type">{element.name || element.type}</p>
          {element.type === "text" ? (
            <>
              <label className="mb-prop">
                Text
                <input
                  value={element.content || ""}
                  onChange={(e) => onChange({ content: e.target.value })}
                />
              </label>
              <label className="mb-prop">
                Highlight phrase
                <input
                  value={element.highlight || ""}
                  placeholder="Must appear in text"
                  onChange={(e) => onChange({ highlight: e.target.value })}
                />
              </label>
              <div className="mb-prop-xy">
                <label>
                  Mark
                  <select
                    value={element.markStyle || "none"}
                    onChange={(e) =>
                      onChange({ markStyle: e.target.value as MarkStyle })
                    }
                  >
                    <option value="none">None</option>
                    <option value="highlight">Highlighter</option>
                    <option value="underline">Underline</option>
                    <option value="both">Both</option>
                  </select>
                </label>
                <label>
                  Marker
                  <input
                    type="color"
                    value={toHex(element.markerColor || "#FAFF00")}
                    onChange={(e) => onChange({ markerColor: e.target.value })}
                  />
                </label>
              </div>
            </>
          ) : null}
          {element.type === "template" ? (
            <div className="mb-template-vars">
              <h4>Template fields</h4>
              <p className="mb-kf-hint">
                Edit copy and colors for newspaper / Vox templates. Preview uses Revideo.
              </p>
              {TEMPLATE_FIELD_KEYS.filter((key) => {
                if (element.variables && key in element.variables) return true;
                return ["headline", "highlight", "markerColor", "paperColor"].includes(key);
              }).map((key) => (
                <label key={key} className="mb-prop">
                  {key}
                  {key.toLowerCase().includes("color") ||
                  key === "bg" ||
                  key === "accent" ||
                  key === "ink" ? (
                    <input
                      type="color"
                      value={toHex(String(element.variables?.[key] || "#FAFF00"))}
                      onChange={(e) => setTemplateVar(key, e.target.value)}
                    />
                  ) : key === "markStyle" ? (
                    <select
                      value={String(element.variables?.[key] || "highlight")}
                      onChange={(e) => setTemplateVar(key, e.target.value)}
                    >
                      <option value="highlight">Highlight</option>
                      <option value="underline">Underline</option>
                      <option value="both">Both</option>
                    </select>
                  ) : (
                    <input
                      value={String(element.variables?.[key] ?? "")}
                      onChange={(e) => setTemplateVar(key, e.target.value)}
                    />
                  )}
                </label>
              ))}
            </div>
          ) : null}
          <div className="mb-prop-colors">
            <label>
              Fill
              <input
                type="color"
                value={toHex(element.fill || "#7c5cfc")}
                onChange={(e) => onChange({ fill: e.target.value })}
              />
            </label>
            <label>
              Stroke
              <input
                type="color"
                value={toHex(element.stroke || "#5b3fd6")}
                onChange={(e) => onChange({ stroke: e.target.value })}
              />
            </label>
          </div>
          <div className="mb-prop-xy">
            <label>
              X
              <input
                type="number"
                value={Math.round(pose?.x ?? element.x)}
                onChange={(e) => onChange({ x: Number(e.target.value) || 0 })}
              />
            </label>
            <label>
              Y
              <input
                type="number"
                value={Math.round(pose?.y ?? element.y)}
                onChange={(e) => onChange({ y: Number(e.target.value) || 0 })}
              />
            </label>
            <label>
              W
              <input
                type="number"
                value={Math.round(element.width ?? 0)}
                onChange={(e) => onChange({ width: Math.max(8, Number(e.target.value) || 8) })}
              />
            </label>
            <label>
              H
              <input
                type="number"
                value={Math.round(element.height ?? 0)}
                onChange={(e) => onChange({ height: Math.max(8, Number(e.target.value) || 8) })}
              />
            </label>
          </div>
          {element.type === "chart" ? (
            <label className="mb-prop">
              Chart data
              <textarea
                rows={5}
                value={element.chartData || ""}
                onChange={(e) => onChange({ chartData: e.target.value })}
              />
            </label>
          ) : null}
          <div className="mb-kf-box">
            <div className="mb-kf-head">
              <span>Keyframes</span>
              <span className="mb-kf-actions">
                <button type="button" onClick={onAddKeyframe}>
                  Add at {formatClock(timeMs)}
                </button>
                <button
                  type="button"
                  className="mb-kf-del-now"
                  disabled={!frames.some((kf) => Math.abs(kf.timeMs - timeMs) <= KEYFRAME_HIT_MS)}
                  onClick={() => onRemoveKeyframe(timeMs)}
                >
                  Delete this
                </button>
              </span>
            </div>
            <p className="mb-kf-hint">
              Scrub, move the object, then Add or press K. Merge anim (Ctrl+Shift+M) copies motion
              onto other selected elements.
            </p>
            {frames.length ? (
              <div className="mb-kf-list">
                {frames.map((kf) => (
                  <span
                    key={kf.timeMs}
                    className={
                      Math.abs(kf.timeMs - timeMs) <= KEYFRAME_HIT_MS ? "mb-kf-chip on" : "mb-kf-chip"
                    }
                  >
                    <button type="button" onClick={() => onSeek(kf.timeMs)}>
                      {(kf.timeMs / 1000).toFixed(1)}s
                    </button>
                    <button
                      type="button"
                      className="mb-kf-x"
                      title="Remove keyframe"
                      onClick={() => onRemoveKeyframe(kf.timeMs)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mb-kf-empty">No keyframes yet</p>
            )}
          </div>
        </div>
      ) : (
        <p className="mb-anim-empty">Select an element to edit motion and properties.</p>
      )}

      {tab === "in" ? (
        <>
          <h4>Entrance</h4>
          <div className="mb-preset-grid">
            {IN_PRESETS.map((p) => (
              <PresetButton
                key={p.id}
                id={p.id}
                label={p.label}
                active={motion?.preset === p.id}
                disabled={!element}
                onClick={() => apply(p.id, "in")}
              />
            ))}
          </div>
          <h4>Emphasis</h4>
          <div className="mb-preset-grid">
            {EMPHASIS_PRESETS.map((p) => (
              <PresetButton
                key={p.id}
                id={p.id}
                label={p.label}
                active={motion?.preset === p.id}
                disabled={!element}
                onClick={() => apply(p.id, "in")}
              />
            ))}
          </div>
          <h4>Camera</h4>
          <div className="mb-preset-grid">
            {CAMERA_MOVES.map((p) => (
              <PresetButton
                key={p.id}
                id={p.id}
                label={p.label}
                active={false}
                onClick={() => onCameraMove(p.id)}
              />
            ))}
          </div>
        </>
      ) : tab === "style" ? (
        <>
          <h4>Newspaper highlight</h4>
          <p className="mb-kf-hint">
            Use on text: set a highlight phrase, then pick a sweep. Works with Mark style above.
          </p>
          <div className="mb-preset-grid">
            {HIGHLIGHT_PRESETS.map((p) => (
              <PresetButton
                key={p.id}
                id={p.id}
                label={p.label}
                active={motion?.preset === p.id}
                disabled={!element}
                onClick={() => apply(p.id, "in")}
              />
            ))}
          </div>
          <h4>Vox style</h4>
          <p className="mb-kf-hint">Documentary push / parallax / focus dimming on any element.</p>
          <div className="mb-preset-grid">
            {VOX_PRESETS.map((p) => (
              <PresetButton
                key={p.id}
                id={p.id}
                label={p.label}
                active={motion?.preset === p.id}
                disabled={!element}
                onClick={() => apply(p.id, "in")}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <h4>{tab === "out" ? "Exit" : "Loop"}</h4>
          <div className="mb-preset-grid">
            {(tab === "out" ? OUT_PRESETS : LOOP_PRESETS).map((p) => (
              <PresetButton
                key={p.id}
                id={p.id}
                label={p.label}
                active={motion?.preset === p.id}
                disabled={!element}
                onClick={() => apply(p.id, tab)}
              />
            ))}
          </div>
        </>
      )}

      <div className="mb-controls">
        <h4>Timing</h4>
        <label>
          Duration
          <input
            type="number"
            min={0}
            step={0.1}
            disabled={!element}
            value={Number(((motion?.durationMs ?? 0) / 1000).toFixed(2))}
            onChange={(e) =>
              onChange({
                motion: {
                  ...motion,
                  preset: motion?.preset ?? "none",
                  durationMs: Math.max(0, Number(e.target.value) * 1000 || 0),
                },
              })
            }
          />
          <b>s</b>
        </label>
        <label>
          Delay
          <input
            type="number"
            min={0}
            step={0.1}
            disabled={!element}
            value={Number(((motion?.delayMs ?? 0) / 1000).toFixed(2))}
            onChange={(e) =>
              onChange({
                motion: {
                  ...motion,
                  preset: motion?.preset ?? "none",
                  delayMs: Math.max(0, Number(e.target.value) * 1000 || 0),
                },
              })
            }
          />
          <b>s</b>
        </label>
        <label>
          Easing
          <select
            disabled={!element}
            value={motion?.easing ?? "power2.inOut"}
            onChange={(e) =>
              onChange({
                motion: {
                  ...motion,
                  preset: motion?.preset ?? "none",
                  easing: e.target.value as BoardEasing,
                },
              })
            }
          >
            <option value="power2.inOut">Ease In Out</option>
            <option value="power2.out">Ease Out</option>
            <option value="linear">Linear</option>
          </select>
        </label>
      </div>
    </aside>
  );
}
