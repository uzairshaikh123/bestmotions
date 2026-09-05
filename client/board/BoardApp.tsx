import React, { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  stringifyBoard,
  compositionDurationMs,
  snapValue,
  type ElementMotion,
  type ElementType,
  type TransitionIn,
} from "../../shared/board";
import { BoardCanvas } from "./BoardCanvas";
import { AnimationsPanel } from "./chrome/AnimationsPanel";
import { AssetLibrary } from "./chrome/AssetLibrary";
import { type MbAssetPayload } from "./chrome/assetDrag";
import { MagicHeader } from "./chrome/MagicHeader";
import { MagicTimeline } from "./chrome/MagicTimeline";
import { Icon } from "./chrome/icons";
import { videoFilename } from "../downloadVideo";
import { downloadBlob, findCanvas, recordCanvas } from "../recordCanvas";
import { RevideoPreview } from "../assets/RevideoPreview";
import { useBoardDocument, type ToolId } from "./useBoardDocument";

type Props = { onHome: () => void };

const ZOOM_MIN = 0.05;
const ZOOM_MAX = 16;

export function BoardApp({ onHome }: Props) {
  const board = useBoardDocument();
  const [previewTime, setPreviewTime] = useState(0);
  const [canvasPlaying, setCanvasPlaying] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [editorZoom, setEditorZoom] = useState(1);
  const [editorPan, setEditorPan] = useState({ x: 0, y: 0 });
  const [fitTick, setFitTick] = useState(0);
  const canvasSize = useRef({ width: 800, height: 560 });
  const tween = useRef<gsap.core.Tween | null>(null);
  const duration = compositionDurationMs(board.doc);
  const selected = board.selectedId ? board.doc.elements[board.selectedId] : null;

  useEffect(() => {
    if (previewTime > duration) setPreviewTime(duration);
  }, [duration, previewTime]);

  const fit = useCallback(() => {
    setFitTick((n) => n + 1);
  }, []);

  function zoomAroundCenter(next: number) {
    const z = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next));
    const cx = canvasSize.current.width / 2;
    const cy = canvasSize.current.height / 2;
    const worldX = (cx - editorPan.x) / Math.max(editorZoom, 0.001);
    const worldY = (cy - editorPan.y) / Math.max(editorZoom, 0.001);
    setEditorZoom(z);
    setEditorPan({ x: cx - worldX * z, y: cy - worldY * z });
  }

  useEffect(() => {
    document.documentElement.classList.add("mb-noscale");
    function pinch(e: TouchEvent) {
      if (e.touches.length > 1) e.preventDefault();
    }
    function gesture(e: Event) {
      e.preventDefault();
    }
    document.addEventListener("touchmove", pinch, { passive: false });
    document.addEventListener("gesturestart", gesture);
    document.addEventListener("gesturechange", gesture);
    return () => {
      document.documentElement.classList.remove("mb-noscale");
      document.removeEventListener("touchmove", pinch);
      document.removeEventListener("gesturestart", gesture);
      document.removeEventListener("gesturechange", gesture);
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) board.redo();
        else board.undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        board.redo();
      }
      if ((e.key === "Delete" || e.key === "Backspace") && board.selectedId) {
        e.preventDefault();
        const el = board.doc.elements[board.selectedId];
        const hit = el?.keyframes?.find(
          (kf) => Math.abs(kf.timeMs - previewTime) <= 90,
        );
        if (hit && !e.shiftKey) {
          board.removeKeyframe(board.selectedId, hit.timeMs);
        } else {
          board.removeElement(board.selectedId);
        }
      }
      if (e.key.toLowerCase() === "k" && board.selectedId) {
        e.preventDefault();
        board.addKeyframe(board.selectedId, previewTime);
        board.extendComposition(previewTime);
      }
      if (e.code === "Space" && target?.tagName !== "BUTTON") {
        e.preventDefault();
        togglePlay();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function togglePlay() {
    if (canvasPlaying) {
      tween.current?.kill();
      setCanvasPlaying(false);
      return;
    }
    if (duration <= 0) return;
    setCanvasPlaying(true);
    const proxy = { t: previewTime >= duration ? 0 : previewTime };
    tween.current?.kill();
    tween.current = gsap.to(proxy, {
      t: duration,
      duration: (duration - proxy.t) / 1000,
      ease: "none",
      onUpdate: () => setPreviewTime(proxy.t),
      onComplete: () => {
        setCanvasPlaying(false);
        setPreviewTime(0);
      },
    });
  }

  async function exportMp4() {
    setExportError(null);
    setExportBusy(true);
    try {
      if (duration <= 0) throw new Error("Set a timeline length first.");
      const canvas = findCanvas(document.querySelector(".mb-stage-wrap"));
      if (!canvas) throw new Error("Could not find the board canvas.");
      tween.current?.kill();
      setPreviewTime(0);
      setCanvasPlaying(true);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      const proxy = { t: 0 };
      const played = new Promise<void>((resolve) => {
        tween.current = gsap.to(proxy, {
          t: duration,
          duration: duration / 1000,
          ease: "none",
          onUpdate: () => setPreviewTime(proxy.t),
          onComplete: () => {
            setCanvasPlaying(false);
            setPreviewTime(0);
            resolve();
          },
        });
      });
      const recorded = recordCanvas(canvas, duration);
      const [, { blob, ext }] = await Promise.all([played, recorded]);
      const base = videoFilename(board.doc.name || "magic-board").replace(/\.mp4$/i, "");
      downloadBlob(blob, `${base}.${ext}`);
    } catch (err) {
      tween.current?.kill();
      setCanvasPlaying(false);
      setExportError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExportBusy(false);
    }
  }

  function place(
    type: ElementType,
    extra: Record<string, unknown> = {},
    at: { timeMs?: number; x?: number; y?: number } = {},
  ) {
    const motion = extra.motion as ElementMotion | undefined;
    const timeMs = Math.max(0, at.timeMs ?? previewTime);
    const durationMs = motion?.durationMs ?? 0;
    const width =
      Number(extra.width) ||
      (type === "circle"
        ? 140
        : type === "text"
          ? 240
          : type === "chart"
            ? 420
            : type === "template"
              ? 480
              : 220);
    const height =
      Number(extra.height) ||
      (type === "circle"
        ? 140
        : type === "text"
          ? 48
          : type === "chart"
            ? 260
            : type === "template"
              ? 270
              : 120);
    const center = {
      x: (canvasSize.current.width / 2 - editorPan.x) / Math.max(editorZoom, 0.001),
      y: (canvasSize.current.height / 2 - editorPan.y) / Math.max(editorZoom, 0.001),
    };
    const x = snapValue(at.x != null ? at.x - width / 2 : center.x - width / 2);
    const y = snapValue(at.y != null ? at.y - height / 2 : center.y - height / 2);
    board.addElement(type, {
      ...extra,
      x,
      y,
      motion: {
        preset: motion?.preset ?? "none",
        phase: motion?.phase ?? "in",
        easing: motion?.easing ?? "power2.out",
        durationMs,
        delayMs: motion?.delayMs ?? timeMs,
      },
    });
    board.extendComposition(timeMs + durationMs);
  }

  function dropAsset(
    payload: MbAssetPayload,
    timeMs: number,
    xy?: { x: number; y: number },
  ) {
    place(payload.type, payload.extra, { timeMs, ...xy });
  }

  return (
    <div className="magicboard">
      <MagicHeader
        name={board.doc.name || "Untitled Project"}
        timeMs={previewTime}
        durationMs={duration}
        playing={canvasPlaying}
        zoomPct={Math.round(editorZoom * 100)}
        background={board.doc.meta.background || "#ffffff"}
        exportBusy={exportBusy}
        onName={board.renameBoard}
        onPlay={togglePlay}
        onUndo={board.undo}
        onRedo={board.redo}
        onPreview={() => setShowPreview(true)}
        onExport={() => void exportMp4()}
        onHome={onHome}
        onFit={fit}
        onZoomStep={(dir) => zoomAroundCenter(editorZoom + dir * 0.1)}
        onBackground={(color) =>
          board.replaceDoc({
            ...board.doc,
            meta: { ...board.doc.meta, background: color },
          })
        }
      />

      <div className="mb-body">
        <AssetLibrary
          background={board.doc.meta.background || "#ffffff"}
          onAdd={place}
          onBackground={(color) =>
            board.replaceDoc({
              ...board.doc,
              meta: { ...board.doc.meta, background: color },
            })
          }
          onUpload={(src) => place("image", { src, width: 280, height: 180, name: "Image" })}
        />

        <div className="mb-center">
          <div className="mb-stage-wrap">
            {selected ? (
              <div className="mb-context">
                <button
                  type="button"
                  title="Select"
                  className={board.tool === "select" ? "on" : ""}
                  onClick={() => board.setTool("select")}
                >
                  <Icon name="cursor" />
                </button>
                <button type="button" title="Crop" onClick={() => board.setTool("select")}>
                  <Icon name="crop" />
                </button>
                <button
                  type="button"
                  title={selected.locked ? "Unlock" : "Lock"}
                  onClick={() =>
                    board.updateElement(selected.id, { locked: !selected.locked })
                  }
                >
                  <Icon name={selected.locked ? "lock" : "unlock"} />
                </button>
                <button
                  type="button"
                  title="Text"
                  className={board.tool === "text" ? "on" : ""}
                  onClick={() => board.setTool("text")}
                >
                  <Icon name="text" />
                </button>
                <button
                  type="button"
                  className="mb-context-label"
                  onClick={board.groupSelected}
                  disabled={board.selectedIds.length < 2}
                >
                  Group
                </button>
                <button
                  type="button"
                  title="Delete"
                  onClick={() => board.removeElement(selected.id)}
                >
                  <Icon name="trash" />
                </button>
              </div>
            ) : null}
            <BoardCanvas
              doc={board.doc}
              selectedId={board.selectedId}
              tool={board.tool}
              clickAddsStop={false}
              timeMs={previewTime}
              playing={canvasPlaying}
              ready={board.ready}
              editorZoom={editorZoom}
              editorPan={editorPan}
              fitTick={fitTick}
              onCanvasSize={(next) => {
                canvasSize.current = next;
              }}
              onViewChange={(zoom, pan) => {
                setEditorZoom(zoom);
                setEditorPan(pan);
              }}
              onDropAsset={(payload, world) => dropAsset(payload, previewTime, world)}
              onSelect={(id, additive) => board.selectElement(id, additive)}
              onAddScene={board.addSceneFromElement}
              onBeginGesture={board.beginGesture}
              onLiveUpdate={(id, patch) => board.updateElementAtTime(id, patch, previewTime)}
              onReparent={(id, x, y, worldX, worldY) =>
                board.reparent(id, x, y, worldX, worldY, previewTime)
              }
              onCreateElement={(type, extra) =>
                board.addElement(type as Exclude<ToolId, "select" | "hand" | "pen">, extra)
              }
            />
          </div>
          <MagicTimeline
            doc={board.doc}
            timeMs={previewTime}
            selectedId={board.selectedId}
            selectedSceneId={board.selectedSceneId}
            onSeek={(ms) => {
              tween.current?.kill();
              setCanvasPlaying(false);
              setPreviewTime(ms);
            }}
            onSelectElement={(id) => board.selectElement(id)}
            onSelectScene={board.setSelectedSceneId}
            onAddScene={board.addEmptyScene}
            onAddCamera={() => {
              if (board.selectedId) board.addSceneFromElement(board.selectedId);
              else board.addEmptyScene();
            }}
            onAddKeyframe={() => {
              if (!board.selectedId) return;
              board.addKeyframe(board.selectedId, previewTime);
              board.extendComposition(previewTime);
            }}
            onRemoveKeyframe={(id, ms) => board.removeKeyframe(id, ms)}
            onToggleVisible={(id) => {
              const el = board.doc.elements[id];
              if (el) board.updateElement(id, { visible: el.visible === false });
            }}
            onToggleLock={(id) => {
              const el = board.doc.elements[id];
              if (el) board.updateElement(id, { locked: !el.locked });
            }}
            onCameraMove={(id, kind: TransitionIn) =>
              board.updateScene(id, { transitionIn: kind, name: kind })
            }
            onDropAsset={(payload, timeMs) => dropAsset(payload, timeMs)}
            onBeginGesture={board.beginGesture}
            onLiveUpdate={board.updateElementLive}
            onEnsureDuration={board.extendComposition}
            onSetDuration={board.setCompositionDuration}
          />
        </div>

        <AnimationsPanel
          element={selected}
          timeMs={previewTime}
          onChange={(patch) => {
            if (!board.selectedId) return;
            if (
              patch.x != null ||
              patch.y != null ||
              patch.width != null ||
              patch.height != null ||
              patch.rotation != null
            ) {
              board.updateElementAtTime(board.selectedId, patch, previewTime);
              return;
            }
            board.updateElement(board.selectedId, patch);
          }}
          onSeek={(ms) => {
            tween.current?.kill();
            setCanvasPlaying(false);
            setPreviewTime(ms);
          }}
          onAddKeyframe={() => {
            if (!board.selectedId) return;
            board.addKeyframe(board.selectedId, previewTime);
            board.extendComposition(previewTime);
          }}
          onRemoveKeyframe={(ms) => {
            if (board.selectedId) board.removeKeyframe(board.selectedId, ms);
          }}
          onCameraMove={(kind) => {
            const id = board.selectedSceneId || board.doc.scenes[0]?.id;
            if (id) board.updateScene(id, { transitionIn: kind, name: kind });
          }}
        />
      </div>

      {exportError ? <div className="mb-toast">{exportError}</div> : null}

      {showPreview ? (
        <div className="mb-modal" onClick={() => setShowPreview(false)}>
          <div className="mb-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="mb-modal-bar">
              <strong>Preview</strong>
              <button type="button" onClick={() => setShowPreview(false)}>
                Close
              </button>
            </div>
            <RevideoPreview
              variables={{
                template: "magic-board",
                boardJson: stringifyBoard(board.doc),
                sound: "off",
                viewWidth: canvasSize.current.width,
                viewHeight: canvasSize.current.height,
                viewZoom: editorZoom,
                viewPanX: editorPan.x,
                viewPanY: editorPan.y,
              }}
              playing
              controls
              muted
              instanceKey={`mb-${duration}`}
              estimatedDuration={duration / 1000}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
