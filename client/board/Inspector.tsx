import React from "react";
import type {
  BoardDocument,
  BoardEasing,
  BoardElement,
  MotionPreset,
  TransitionIn,
} from "../../shared/board";

type Props = {
  doc: BoardDocument;
  selectedId: string | null;
  selectedSceneId: string | null;
  onUpdateElement: (id: string, patch: Partial<BoardElement>) => void;
  onRemoveElement: (id: string) => void;
  onAddScene: (id: string) => void;
  onUpdateScene: (
    id: string,
    patch: {
      transitionIn?: TransitionIn;
      transitionMs?: number;
      easing?: BoardEasing;
    },
  ) => void;
};

export function Inspector({
  doc,
  selectedId,
  selectedSceneId,
  onUpdateElement,
  onRemoveElement,
  onAddScene,
  onUpdateScene,
}: Props) {
  const el = selectedId ? doc.elements[selectedId] : null;
  const scene = doc.scenes.find((s) => s.id === selectedSceneId) || null;

  return (
    <div className="board-inspector">
      <div className="pane-label">Inspector</div>
      {el ? (
        <>
          <p className="control-hint">
            {el.type}
            {el.parentId ? " (nested)" : ""}
          </p>
          {el.type === "text" ? (
            <label className="field">
              <span>Text</span>
              <input
                value={el.content || ""}
                onChange={(e) => onUpdateElement(el.id, { content: e.target.value })}
              />
            </label>
          ) : null}
          <label className="field">
            <span>Fill</span>
            <input
              type="color"
              value={toHex(el.fill || "#1f6b4a")}
              onChange={(e) => onUpdateElement(el.id, { fill: e.target.value })}
            />
          </label>
          <label className="field">
            <span>Motion</span>
            <select
              value={el.motion?.preset || "none"}
              onChange={(e) =>
                onUpdateElement(el.id, {
                  motion: {
                    preset: e.target.value as MotionPreset,
                    durationMs: el.motion?.durationMs ?? 600,
                  },
                })
              }
            >
              <option value="none">None</option>
              <option value="pulse">Pulse</option>
              <option value="nod">Nod (pivot)</option>
              <option value="slideIn">Slide in</option>
            </select>
          </label>
          <label className="field">
            <span>Pivot X / Y (nod rotates around this)</span>
            <div className="board-inline-fields">
              <input
                type="number"
                value={el.pivot?.x ?? 0}
                onChange={(e) =>
                  onUpdateElement(el.id, {
                    pivot: { x: Number(e.target.value) || 0, y: el.pivot?.y ?? 0 },
                  })
                }
              />
              <input
                type="number"
                value={el.pivot?.y ?? 0}
                onChange={(e) =>
                  onUpdateElement(el.id, {
                    pivot: { x: el.pivot?.x ?? 0, y: Number(e.target.value) || 0 },
                  })
                }
              />
            </div>
          </label>
          <button type="button" onClick={() => onAddScene(el.id)}>
            Add camera stop
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => onRemoveElement(el.id)}
          >
            Delete element
          </button>
        </>
      ) : (
        <p className="control-hint">Select a shape to edit fill, motion, and pivot.</p>
      )}

      {scene ? (
        <>
          <div className="pane-label" style={{ marginTop: 16 }}>
            Transition into this stop
          </div>
          <label className="field">
            <span>Move</span>
            <select
              value={scene.transitionIn}
              onChange={(e) =>
                onUpdateScene(scene.id, {
                  transitionIn: e.target.value as TransitionIn,
                })
              }
            >
              <option value="zoomPan">Zoom + pan</option>
              <option value="zoomOnly">Zoom only</option>
              <option value="panOnly">Pan only</option>
              <option value="cut">Cut</option>
            </select>
          </label>
          <label className="field">
            <span>Transition (s)</span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={scene.transitionMs / 1000}
              onChange={(e) =>
                onUpdateScene(scene.id, {
                  transitionMs: Math.max(0, Number(e.target.value) * 1000),
                })
              }
            />
          </label>
          <label className="field">
            <span>Easing</span>
            <select
              value={scene.easing}
              onChange={(e) =>
                onUpdateScene(scene.id, { easing: e.target.value as BoardEasing })
              }
            >
              <option value="power2.inOut">power2.inOut</option>
              <option value="power2.out">power2.out</option>
              <option value="linear">linear</option>
            </select>
          </label>
        </>
      ) : null}
    </div>
  );
}

function toHex(color: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  return "#1f6b4a";
}
