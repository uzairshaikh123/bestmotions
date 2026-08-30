import React from "react";
import type { BoardDocument } from "../../shared/board";

type Props = {
  doc: BoardDocument;
  selectedSceneId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDuration: (id: string, durationMs: number) => void;
};

export function SceneList({
  doc,
  selectedSceneId,
  onSelect,
  onMove,
  onRemove,
  onRename,
  onDuration,
}: Props) {
  return (
    <div className="board-scenes">
      <div className="pane-label">Camera stops</div>
      <p className="control-hint">
        Click a shape on the canvas to add a stop. Reorder here.
      </p>
      {doc.scenes.length === 0 ? (
        <p className="control-hint">No stops yet.</p>
      ) : null}
      <ol className="board-scene-list">
        {doc.scenes.map((scene, i) => (
          <li
            key={scene.id}
            className={
              scene.id === selectedSceneId
                ? "board-scene-item active"
                : "board-scene-item"
            }
          >
            <button
              type="button"
              className="board-scene-pick"
              onClick={() => onSelect(scene.id)}
            >
              {i + 1}
            </button>
            <div className="board-scene-fields">
              <input
                value={scene.name}
                onChange={(e) => onRename(scene.id, e.target.value)}
                aria-label="Scene name"
              />
              <label>
                Hold (s)
                <input
                  type="number"
                  min={0.2}
                  step={0.5}
                  value={scene.durationMs / 1000}
                  onChange={(e) =>
                    onDuration(scene.id, Math.max(200, Number(e.target.value) * 1000))
                  }
                />
              </label>
            </div>
            <div className="board-scene-move">
              <button type="button" className="secondary" onClick={() => onMove(scene.id, -1)}>
                ↑
              </button>
              <button type="button" className="secondary" onClick={() => onMove(scene.id, 1)}>
                ↓
              </button>
              <button type="button" className="secondary" onClick={() => onRemove(scene.id)}>
                ×
              </button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
