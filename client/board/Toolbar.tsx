import React, { useRef } from "react";
import type { ToolId } from "./useBoardDocument";

const TOOLS: { id: ToolId; label: string }[] = [
  { id: "select", label: "Select" },
  { id: "rectangle", label: "Rect" },
  { id: "circle", label: "Circle" },
  { id: "text", label: "Text" },
  { id: "line", label: "Line" },
  { id: "image", label: "Image" },
];

type Props = {
  tool: ToolId;
  clickAddsStop: boolean;
  onTool: (tool: ToolId) => void;
  onClickAddsStop: (on: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  onImage: (dataUrl: string) => void;
};

export function Toolbar({
  tool,
  clickAddsStop,
  onTool,
  onClickAddsStop,
  onUndo,
  onRedo,
  onImage,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function onPickImage(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="board-toolbar">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={tool === t.id ? "tab active" : "tab"}
          onClick={() => {
            if (t.id === "image") {
              fileRef.current?.click();
              return;
            }
            onTool(t.id);
          }}
        >
          {t.label}
        </button>
      ))}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          onPickImage(e.target.files?.[0] || null);
          e.target.value = "";
        }}
      />
      <label className="board-toggle">
        <input
          type="checkbox"
          checked={clickAddsStop}
          onChange={(e) => onClickAddsStop(e.target.checked)}
        />
        Click adds stop
      </label>
      <button type="button" className="secondary" onClick={onUndo}>
        Undo
      </button>
      <button type="button" className="secondary" onClick={onRedo}>
        Redo
      </button>
    </div>
  );
}
