import React, { useMemo, useRef, useState } from "react";
import {
  CAMERA_MOVES,
  buildTimeline,
  compositionDurationMs,
  elementLabel,
  rootElementIds,
  type BoardDocument,
  type BoardElement,
  type TransitionIn,
} from "../../../shared/board";
import { isAssetDrag, readAssetDrag, type MbAssetPayload } from "./assetDrag";
import { Icon } from "./icons";

const PX = 56;
const ROW = 36;

type Props = {
  doc: BoardDocument;
  timeMs: number;
  selectedId: string | null;
  selectedSceneId: string | null;
  onSeek: (ms: number) => void;
  onSelectElement: (id: string) => void;
  onSelectScene: (id: string) => void;
  onAddScene: () => void;
  onAddCamera: () => void;
  onAddKeyframe: () => void;
  onRemoveKeyframe: (id: string, timeMs: number) => void;
  onToggleVisible: (id: string) => void;
  onToggleLock: (id: string) => void;
  onCameraMove: (id: string, kind: TransitionIn) => void;
  onDropAsset: (payload: MbAssetPayload, timeMs: number) => void;
  onBeginGesture: () => void;
  onLiveUpdate: (id: string, patch: Partial<BoardElement>) => void;
  onEnsureDuration: (ms: number) => void;
  onSetDuration: (ms: number) => void;
};

function clipTimes(el: BoardElement) {
  const delay = el.motion?.delayMs ?? 0;
  const dur = Math.max(0, el.motion?.durationMs ?? 0);
  return { delay, dur };
}

function timeFromClientX(clientX: number, scroller: HTMLElement) {
  const rect = scroller.getBoundingClientRect();
  return Math.max(0, ((clientX - rect.left + scroller.scrollLeft) / PX) * 1000);
}

export function MagicTimeline({
  doc,
  timeMs,
  selectedId,
  selectedSceneId,
  onSeek,
  onSelectElement,
  onSelectScene,
  onAddScene,
  onAddCamera,
  onAddKeyframe,
  onRemoveKeyframe,
  onToggleVisible,
  onToggleLock,
  onCameraMove,
  onDropAsset,
  onBeginGesture,
  onLiveUpdate,
  onEnsureDuration,
  onSetDuration,
}: Props) {
  const duration = compositionDurationMs(doc);
  const [liveDur, setLiveDur] = useState<number | null>(null);
  const shownDur = liveDur ?? duration;
  const workspaceMs = Math.max(shownDur, 0) + 12000;
  const segs = buildTimeline(doc);
  const roots = rootElementIds(doc);
  const trackWidth = (workspaceMs / 1000) * PX + 120;
  const layersRef = useRef<HTMLDivElement>(null);
  const tracksRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const [dropMs, setDropMs] = useState<number | null>(null);

  const ticks = useMemo(() => {
    const out: number[] = [];
    for (let s = 0; s <= Math.ceil(workspaceMs / 1000); s += 2) out.push(s);
    return out;
  }, [workspaceMs]);

  function syncFromTracks() {
    const tracks = tracksRef.current;
    if (!tracks) return;
    if (rulerRef.current) rulerRef.current.scrollLeft = tracks.scrollLeft;
    if (layersRef.current) layersRef.current.scrollTop = tracks.scrollTop;
  }

  function syncFromLayers() {
    const layers = layersRef.current;
    if (!layers || !tracksRef.current) return;
    tracksRef.current.scrollTop = layers.scrollTop;
  }

  function seekFromClientX(clientX: number) {
    const tracks = tracksRef.current;
    if (!tracks) return;
    onSeek(timeFromClientX(clientX, tracks));
  }

  function startSeek(e: React.PointerEvent<HTMLElement>) {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    seekFromClientX(e.clientX);
  }

  function moveSeek(e: React.PointerEvent<HTMLElement>) {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    seekFromClientX(e.clientX);
  }

  function handleDragOver(e: React.DragEvent) {
    if (!isAssetDrag(e) || !tracksRef.current) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDropMs(timeFromClientX(e.clientX, tracksRef.current));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const payload = readAssetDrag(e);
    const tracks = tracksRef.current;
    setDropMs(null);
    if (!payload || !tracks) return;
    onDropAsset(payload, timeFromClientX(e.clientX, tracks));
  }

  function startClipDrag(
    e: React.PointerEvent | React.MouseEvent,
    el: BoardElement,
    mode: "move" | "resize",
  ) {
    e.preventDefault();
    e.stopPropagation();
    onSelectElement(el.id);
    const startX = e.clientX;
    const { delay, dur } = clipTimes(el);
    const motion = el.motion ?? { preset: "none" as const };

    let moved = false;
    let frame = 0;
    let lastX = startX;

    function apply(clientX: number) {
      const dxMs = ((clientX - startX) / PX) * 1000;
      if (mode === "move") {
        onLiveUpdate(el.id, {
          motion: { ...motion, delayMs: Math.max(0, delay + dxMs), durationMs: dur },
        });
      } else {
        onLiveUpdate(el.id, {
          motion: {
            ...motion,
            delayMs: delay,
            durationMs: Math.max(0, dur + dxMs),
          },
        });
      }
    }

    function move(ev: PointerEvent) {
      lastX = ev.clientX;
      if (!moved) {
        moved = true;
        onBeginGesture();
      }
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        apply(lastX);
      });
    }

    function up(ev: PointerEvent) {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (frame) cancelAnimationFrame(frame);
      if (!moved) return;
      const dxMs = ((ev.clientX - startX) / PX) * 1000;
      const nextDelay = mode === "move" ? Math.max(0, delay + dxMs) : delay;
      const nextDur = mode === "resize" ? Math.max(0, dur + dxMs) : dur;
      apply(ev.clientX);
      onEnsureDuration(nextDelay + nextDur);
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function startDurationDrag(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    onBeginGesture();
    const startX = e.clientX;
    const startDur = shownDur;
    let last = startDur;

    function move(ev: PointerEvent) {
      last = Math.max(0, startDur + ((ev.clientX - startX) / PX) * 1000);
      setLiveDur(last);
    }

    function up() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setLiveDur(null);
      onSetDuration(Math.max(0, last));
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <div
      className={dropMs != null ? "mb-timeline drop" : "mb-timeline"}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropMs(null);
      }}
    >
      <div className="mb-tl-top">
        <button type="button" onClick={onAddScene}>
          + Scene
        </button>
        <button type="button" className="ghost" onClick={onAddCamera}>
          Add Camera
        </button>
        <button type="button" className="ghost" onClick={onAddKeyframe} disabled={!selectedId}>
          Add keyframe
        </button>
        <label className="mb-tl-duration">
          Duration
          <input
            type="number"
            min={0}
            step={0.1}
            value={Number((shownDur / 1000).toFixed(2))}
            onChange={(e) => {
              const raw = e.target.value;
              const ms = raw === "" ? 0 : Math.max(0, Number(raw) * 1000);
              onSetDuration(Number.isFinite(ms) ? ms : 0);
            }}
          />
          s
        </label>
      </div>
      <div className="mb-tl-grid">
        <div className="mb-tl-corner" />
        <div
          className="mb-tl-ruler-wrap"
          ref={rulerRef}
          onPointerDown={startSeek}
          onPointerMove={moveSeek}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="mb-tl-ruler" style={{ width: trackWidth }}>
            {ticks.map((s) => (
              <span key={s} className="mb-tl-tick" style={{ left: s * PX }}>
                {String(s).padStart(2, "0")}s
              </span>
            ))}
            <i
              className="mb-tl-end"
              style={{ transform: `translateX(${(shownDur / 1000) * PX}px)` }}
              onPointerDown={startDurationDrag}
              title="Drag to set duration"
            />
            <i
              className="mb-playhead mb-playhead-ruler"
              style={{ transform: `translateX(${(timeMs / 1000) * PX}px)` }}
            />
          </div>
        </div>

        <div className="mb-tl-layers" ref={layersRef} onScroll={syncFromLayers}>
          <div className="mb-tl-layer camera">
            <span className="mb-tl-name">Camera</span>
          </div>
          {roots.map((id) => {
            const el = doc.elements[id];
            if (!el) return null;
            return (
              <div
                key={id}
                className={selectedId === id ? "mb-tl-layer on" : "mb-tl-layer"}
                onClick={() => onSelectElement(id)}
              >
                <button
                  type="button"
                  title={el.visible === false ? "Show" : "Hide"}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onToggleVisible(id);
                  }}
                >
                  <Icon name={el.visible === false ? "eye-off" : "eye"} size={14} />
                </button>
                <button
                  type="button"
                  title={el.locked ? "Unlock" : "Lock"}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onToggleLock(id);
                  }}
                >
                  <Icon name={el.locked ? "lock" : "unlock"} size={14} />
                </button>
                <span className="mb-tl-name">{elementLabel(el)}</span>
              </div>
            );
          })}
          <div className="mb-tl-layer">
            <span className="mb-tl-name">Background</span>
          </div>
        </div>

        <div
          className="mb-tl-tracks"
          ref={tracksRef}
          onScroll={syncFromTracks}
          onPointerDown={startSeek}
          onPointerMove={moveSeek}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="mb-tl-inner" style={{ width: trackWidth }}>
            <div className="mb-tl-row" style={{ height: ROW }}>
              {segs.map((seg) => (
                <button
                  key={seg.scene.id}
                  type="button"
                  className={
                    selectedSceneId === seg.scene.id ? "mb-clip cam on" : "mb-clip cam"
                  }
                  style={{
                    left: (seg.startMs / 1000) * PX,
                    width: Math.max(36, ((seg.endMs - seg.startMs) / 1000) * PX),
                  }}
                  onPointerDown={(ev) => ev.stopPropagation()}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onSelectScene(seg.scene.id);
                    onSeek(seg.startMs);
                  }}
                >
                  {seg.scene.name ||
                    CAMERA_MOVES.find((m) => m.id === seg.scene.transitionIn)?.label ||
                    "Camera"}
                </button>
              ))}
            </div>
            {roots.map((id) => {
              const el = doc.elements[id];
              if (!el) return null;
              const { delay, dur } = clipTimes(el);
              const keys = el.keyframes || [];
              return (
                <div key={id} className="mb-tl-row" style={{ height: ROW }}>
                  {dur > 0 ? (
                  <button
                    type="button"
                    className={selectedId === id ? "mb-clip el on" : "mb-clip el"}
                    style={{
                      left: (delay / 1000) * PX,
                      width: Math.max(8, (dur / 1000) * PX),
                    }}
                    onPointerDown={(ev) => {
                      ev.stopPropagation();
                      if ((ev.target as HTMLElement).dataset.resize) return;
                      startClipDrag(ev, el, "move");
                    }}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onSelectElement(id);
                      onSeek(delay);
                    }}
                  >
                    {el.motion?.preset && el.motion.preset !== "none"
                      ? el.motion.preset.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())
                      : elementLabel(el)}
                    <i
                      data-resize="1"
                      className="mb-clip-resize"
                      onPointerDown={(ev) => {
                        ev.stopPropagation();
                        startClipDrag(ev, el, "resize");
                      }}
                    />
                  </button>
                  ) : null}
                  {keys.map((kf) => (
                    <span
                      key={`${id}-${kf.timeMs}`}
                      className="mb-kf-wrap"
                      style={{ left: (kf.timeMs / 1000) * PX }}
                    >
                      <button
                        type="button"
                        className={selectedId === id ? "mb-kf on" : "mb-kf"}
                        title={`${(kf.timeMs / 1000).toFixed(2)}s — click to seek, × to delete`}
                        onPointerDown={(ev) => ev.stopPropagation()}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onSelectElement(id);
                          onSeek(kf.timeMs);
                        }}
                      />
                      <button
                        type="button"
                        className="mb-kf-del"
                        title="Delete keyframe"
                        onPointerDown={(ev) => ev.stopPropagation()}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onRemoveKeyframe(id, kf.timeMs);
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              );
            })}
            <div className="mb-tl-row" style={{ height: ROW }}>
              <span
                className="mb-clip bg"
                style={{ left: 0, width: Math.max(0, (shownDur / 1000) * PX) }}
              >
                Background
              </span>
            </div>
            <i
              className="mb-tl-beyond"
              style={{
                left: (shownDur / 1000) * PX,
                width: Math.max(40, ((workspaceMs - shownDur) / 1000) * PX),
              }}
            />
            <i
              className="mb-tl-end"
              style={{ transform: `translateX(${(shownDur / 1000) * PX}px)` }}
              onPointerDown={startDurationDrag}
              title="Drag to set duration"
            />
            <i
              className="mb-playhead"
              style={{ transform: `translateX(${(timeMs / 1000) * PX}px)` }}
            />
            {dropMs != null ? (
              <i
                className="mb-drophead"
                style={{ transform: `translateX(${(dropMs / 1000) * PX}px)` }}
              />
            ) : null}
          </div>
        </div>
      </div>
      {selectedSceneId ? (
        <div className="mb-tl-cam-moves">
          {CAMERA_MOVES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onCameraMove(selectedSceneId, m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
