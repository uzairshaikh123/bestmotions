import type Konva from "konva";
import React, { useEffect, useRef, useState } from "react";
import {
  Arrow,
  Circle,
  Group,
  Image as KImage,
  Layer,
  Line,
  Rect,
  RegularPolygon,
  Stage,
  Star,
  Text,
  Transformer,
  Wedge,
} from "react-konva";
import {
  barRects,
  chartProgress,
  DEFAULT_CHART_DATA,
  elementSize,
  fitContentInView,
  linePoints,
  parseChartPairs,
  pieSlices,
  poseAtTime,
  rootElementIds,
  snapPoint,
  snapValue,
  statNumber,
  totalDurationMs,
  type BoardDocument,
  type BoardElement,
} from "../../shared/board";
import { isAssetDrag, readAssetDrag, type MbAssetPayload } from "./chrome/assetDrag";
import type { ToolId } from "./useBoardDocument";

const ZOOM_MIN = 0.05;
const ZOOM_MAX = 16;

function useHtmlImage(src?: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = src;
    return () => {
      img.onload = null;
    };
  }, [src]);
  return image;
}

function ChartShape({
  el,
  size,
  timeMs,
}: {
  el: BoardElement;
  size: { width: number; height: number };
  timeMs: number;
}) {
  const kind = el.chartKind || "bar";
  const u = chartProgress(el, timeMs);
  const pairs = parseChartPairs(el.chartData, DEFAULT_CHART_DATA[kind]);
  const bg = el.fill && kind !== "stat" ? "rgba(15,15,24,0.92)" : "#101018";

  if (kind === "stat") {
    return (
      <>
        <Rect width={size.width} height={size.height} fill={bg} cornerRadius={12} />
        <Text
          y={size.height / 2 - 36}
          width={size.width}
          align="center"
          text={statNumber(el, u)}
          fontSize={Math.min(64, size.height * 0.38)}
          fontFamily="Sora, Segoe UI, sans-serif"
          fill="#ffffff"
        />
        <Text
          y={size.height / 2 + 28}
          width={size.width}
          align="center"
          text={el.name || "Stat"}
          fontSize={14}
          fontFamily="Sora, Segoe UI, sans-serif"
          fill="#9aa0b4"
        />
      </>
    );
  }

  if (kind === "pie") {
    const slices = pieSlices(size.width, size.height, pairs, u);
    return (
      <>
        <Rect width={size.width} height={size.height} fill={bg} cornerRadius={12} />
        {slices.map((s) => (
          <Wedge
            key={s.label}
            x={s.cx}
            y={s.cy}
            radius={s.radius}
            angle={s.angle}
            rotation={s.rotation}
            fill={s.color}
          />
        ))}
      </>
    );
  }

  if (kind === "line") {
    const pts = linePoints(size.width, size.height, pairs, u);
    const flat = pts.flatMap((p) => [p.x, p.y]);
    return (
      <>
        <Rect width={size.width} height={size.height} fill={bg} cornerRadius={12} />
        {flat.length >= 4 ? (
          <Line points={flat} stroke="#7c5cfc" strokeWidth={3} lineCap="round" lineJoin="round" />
        ) : null}
        {pts.map((p, i) => (
          <Circle key={i} x={p.x} y={p.y} radius={4} fill="#fff" />
        ))}
      </>
    );
  }

  const bars = barRects(size.width, size.height, pairs, u);
  return (
    <>
      <Rect width={size.width} height={size.height} fill={bg} cornerRadius={12} />
      {bars.map((b) => (
        <Rect key={b.label} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.color} cornerRadius={4} />
      ))}
      {bars.map((b) => (
        <Text
          key={`${b.label}-l`}
          x={b.x}
          y={size.height - 22}
          width={b.w}
          align="center"
          text={b.label}
          fontSize={11}
          fill="#9aa0b4"
          fontFamily="Sora, Segoe UI, sans-serif"
        />
      ))}
    </>
  );
}

type NodeProps = {
  doc: BoardDocument;
  el: BoardElement;
  selectedId: string | null;
  timeMs: number;
  playing: boolean;
  tool: ToolId;
  onSelect: (id: string, additiveScene: boolean) => void;
  onBeginGesture: () => void;
  onLiveUpdate: (id: string, patch: Partial<BoardElement>) => void;
  onReparent: (
    id: string,
    x: number,
    y: number,
    worldX: number,
    worldY: number,
  ) => void;
  nodeRefs: React.MutableRefObject<Map<string, Konva.Node>>;
  toWorld: (stagePt: { x: number; y: number }) => { x: number; y: number };
};

function ElementNode({
  doc,
  el,
  selectedId,
  timeMs,
  playing,
  tool,
  onSelect,
  onBeginGesture,
  onLiveUpdate,
  onReparent,
  nodeRefs,
  toWorld,
}: NodeProps) {
  const pose = poseAtTime(el, timeMs, playing);
  const size = elementSize(el);
  const image = useHtmlImage(el.type === "image" ? el.src : undefined);
  const pivot = el.pivot || { x: size.width / 2, y: 0 };
  const listening =
    tool === "select" && !playing && el.locked !== true && el.visible !== false;
  const dragged = useRef(false);

  function bindRef(node: Konva.Node | null) {
    if (node) nodeRefs.current.set(el.id, node);
    else nodeRefs.current.delete(el.id);
  }

  const common = {
    id: el.id,
    x: pose.x,
    y: pose.y,
    rotation: pose.rotation,
    opacity: pose.opacity,
    scaleX: pose.scale,
    scaleY: pose.scaleY ?? pose.scale,
    offsetX: el.pivot ? pivot.x : 0,
    offsetY: el.pivot ? pivot.y : 0,
    draggable: listening,
    listening,
    perfectDrawEnabled: false,
    onClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      if (dragged.current) {
        dragged.current = false;
        return;
      }
      onSelect(el.id, e.evt.shiftKey);
    },
    onTap: (e: Konva.KonvaEventObject<Event>) => {
      e.cancelBubble = true;
      onSelect(el.id, false);
    },
    onDragStart: () => {
      dragged.current = true;
      onBeginGesture();
    },
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const snapped = snapPoint(node.x(), node.y());
      node.position(snapped);
      const abs = node.getAbsolutePosition();
      const world = toWorld(abs);
      onReparent(el.id, snapped.x, snapped.y, world.x, world.y);
    },
    onTransformStart: () => onBeginGesture(),
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target;
      const scaleX = node.scaleX() / Math.max(pose.scale, 0.001);
      const scaleY = node.scaleY() / Math.max(pose.scaleY ?? pose.scale, 0.001);
      node.scaleX(pose.scale);
      node.scaleY(pose.scaleY ?? pose.scale);
      onLiveUpdate(el.id, {
        x: snapValue(node.x()),
        y: snapValue(node.y()),
        rotation: node.rotation(),
        width: Math.max(8, snapValue(size.width * scaleX)),
        height: Math.max(8, snapValue(size.height * scaleY)),
      });
    },
  };

  const fill = el.fill || "#1f6b4a";
  const stroke = el.stroke || "#e8f0ea";
  const strokeWidth = el.strokeWidth ?? 2;

  const inner = el.children.map((cid) => {
    const child = doc.elements[cid];
    if (!child) return null;
    return (
      <ElementNode
        key={cid}
        doc={doc}
        el={child}
        selectedId={selectedId}
        timeMs={timeMs}
        playing={playing}
        tool={tool}
        onSelect={onSelect}
        onBeginGesture={onBeginGesture}
        onLiveUpdate={onLiveUpdate}
        onReparent={onReparent}
        nodeRefs={nodeRefs}
        toWorld={toWorld}
      />
    );
  });

  if (el.visible === false) return null;

  if (el.type === "circle") {
    const r = size.width / 2;
    return (
      <Group ref={bindRef} {...common}>
        <Circle
          x={r}
          y={r}
          radius={r}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {inner}
      </Group>
    );
  }

  if (el.type === "text") {
    return (
      <Group ref={bindRef} {...common}>
        <Text
          text={el.content || "Text"}
          fontSize={el.fontSize || 28}
          fontFamily="Sora, Segoe UI, sans-serif"
          fill={fill}
          width={size.width}
        />
        {inner}
      </Group>
    );
  }

  if (el.type === "line") {
    return (
      <Group ref={bindRef} {...common}>
        <Line
          points={[0, 0, size.width, el.height || 0]}
          stroke={stroke}
          strokeWidth={strokeWidth}
          lineCap="round"
        />
        {inner}
      </Group>
    );
  }

  if (el.type === "triangle") {
    return (
      <Group ref={bindRef} {...common}>
        <RegularPolygon
          x={size.width / 2}
          y={size.height / 2}
          sides={3}
          radius={Math.min(size.width, size.height) / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {inner}
      </Group>
    );
  }

  if (el.type === "star") {
    return (
      <Group ref={bindRef} {...common}>
        <Star
          x={size.width / 2}
          y={size.height / 2}
          numPoints={5}
          innerRadius={Math.min(size.width, size.height) * 0.2}
          outerRadius={Math.min(size.width, size.height) / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {inner}
      </Group>
    );
  }

  if (el.type === "arrow") {
    return (
      <Group ref={bindRef} {...common}>
        <Arrow
          points={[0, size.height / 2, size.width, size.height / 2]}
          stroke={stroke}
          fill={stroke}
          strokeWidth={strokeWidth || 4}
          pointerLength={16}
          pointerWidth={14}
        />
        {inner}
      </Group>
    );
  }

  if (el.type === "image") {
    return (
      <Group ref={bindRef} {...common}>
        {image ? (
          <KImage image={image} width={size.width} height={size.height} />
        ) : (
          <Rect width={size.width} height={size.height} fill="#102018" stroke={stroke} />
        )}
        {inner}
      </Group>
    );
  }

  if (el.type === "chart") {
    return (
      <Group ref={bindRef} {...common}>
        <ChartShape el={el} size={size} timeMs={timeMs} />
        {inner}
      </Group>
    );
  }

  if (el.type === "template") {
    const accent =
      typeof el.variables?.accent === "string" ? el.variables.accent : fill;
    const bg =
      typeof el.variables?.bg === "string" ? el.variables.bg : fill || "#111827";
    return (
      <Group ref={bindRef} {...common}>
        <Rect width={size.width} height={size.height} fill={bg} cornerRadius={10} />
        <Rect x={10} y={12} width={5} height={size.height - 24} fill={accent} cornerRadius={2} />
        <Text
          x={24}
          y={size.height / 2 - 28}
          width={size.width - 40}
          text={el.name || "Template"}
          fontSize={20}
          fontFamily="Sora, Segoe UI, sans-serif"
          fill="#f4f0e6"
        />
        <Text
          x={24}
          y={size.height / 2 + 2}
          width={size.width - 40}
          text="Frontpage template"
          fontSize={12}
          fontFamily="Sora, Segoe UI, sans-serif"
          fill="#9aa0b4"
        />
        {inner}
      </Group>
    );
  }

  return (
    <Group ref={bindRef} {...common}>
      <Rect
        width={size.width}
        height={size.height}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        cornerRadius={el.type === "group" ? 8 : 4}
      />
      {inner}
    </Group>
  );
}

type Props = {
  doc: BoardDocument;
  selectedId: string | null;
  tool: ToolId;
  clickAddsStop: boolean;
  timeMs: number;
  playing: boolean;
  ready?: boolean;
  onSelect: (id: string | null, additive?: boolean) => void;
  onAddScene: (id: string) => void;
  onBeginGesture: () => void;
  onLiveUpdate: (id: string, patch: Partial<BoardElement>) => void;
  onReparent: (
    id: string,
    x: number,
    y: number,
    worldX: number,
    worldY: number,
  ) => void;
  onCreateElement: (type: ToolId, extra: Partial<BoardElement>) => void;
  onDropAsset?: (payload: MbAssetPayload, world: { x: number; y: number }) => void;
  editorZoom: number;
  editorPan: { x: number; y: number };
  onViewChange: (zoom: number, pan: { x: number; y: number }) => void;
  fitTick?: number;
  onCanvasSize?: (size: { width: number; height: number }) => void;
};

export function BoardCanvas({
  doc,
  selectedId,
  tool,
  clickAddsStop,
  timeMs,
  playing,
  ready = true,
  onSelect,
  onAddScene,
  onBeginGesture,
  onLiveUpdate,
  onReparent,
  onCreateElement,
  onDropAsset,
  editorZoom,
  editorPan,
  onViewChange,
  fitTick = 0,
  onCanvasSize,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef(new Map<string, Konva.Node>());
  const panning = useRef<{
    x: number;
    y: number;
    panX: number;
    panY: number;
    click?: boolean;
    moved?: boolean;
  } | null>(null);
  const didInitFit = useRef(false);
  const [size, setSize] = useState({ width: 800, height: 560 });
  const [draft, setDraft] = useState<{
    type: "rectangle" | "circle" | "line";
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    function blockPinch(e: TouchEvent) {
      if (e.touches.length > 1) e.preventDefault();
    }
    function blockGesture(e: Event) {
      e.preventDefault();
    }
    el.addEventListener("touchmove", blockPinch, { passive: false });
    el.addEventListener("gesturestart", blockGesture);
    el.addEventListener("gesturechange", blockGesture);
    const ro = new ResizeObserver(() => {
      const next = {
        width: Math.max(320, el.clientWidth),
        height: Math.max(280, el.clientHeight),
      };
      setSize(next);
      onCanvasSize?.(next);
    });
    ro.observe(el);
    const initial = {
      width: Math.max(320, el.clientWidth),
      height: Math.max(280, el.clientHeight),
    };
    setSize(initial);
    onCanvasSize?.(initial);
    return () => {
      ro.disconnect();
      el.removeEventListener("touchmove", blockPinch);
      el.removeEventListener("gesturestart", blockGesture);
      el.removeEventListener("gesturechange", blockGesture);
    };
  }, []);

  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const node = selectedId ? nodeRefs.current.get(selectedId) : null;
    tr.nodes(node && !playing ? [node] : []);
    tr.forceUpdate();
    tr.getLayer()?.batchDraw();
  }, [selectedId, doc, playing, timeMs]);

  useEffect(() => {
    if (didInitFit.current || !ready || size.width < 80) return;
    didInitFit.current = true;
    const fitted = fitContentInView(doc, size.width, size.height);
    onViewChange(fitted.zoom, fitted.pan);
  }, [ready, size.width, size.height]);

  useEffect(() => {
    if (fitTick === 0 || size.width < 80) return;
    const fitted = fitContentInView(doc, size.width, size.height);
    onViewChange(fitted.zoom, fitted.pan);
  }, [fitTick]);

  const roots = rootElementIds(doc);
  const bg = doc.meta.background || "#ffffff";

  function stageToWorld(p: { x: number; y: number }) {
    return {
      x: (p.x - editorPan.x) / Math.max(editorZoom, 0.001),
      y: (p.y - editorPan.y) / Math.max(editorZoom, 0.001),
    };
  }

  function stagePoint(evt: Konva.KonvaEventObject<MouseEvent | TouchEvent | WheelEvent>) {
    const stage = evt.target.getStage();
    const p = stage?.getPointerPosition();
    if (!p) return { x: 0, y: 0 };
    return stageToWorld(p);
  }

  function onStageMouseDown(evt: Konva.KonvaEventObject<MouseEvent>) {
    if (playing) return;
    const panMode =
      tool === "hand" || evt.evt.button === 1 || evt.evt.altKey || evt.evt.ctrlKey;
    if (panMode) {
      const p = evt.target.getStage()?.getPointerPosition();
      if (p) {
        panning.current = { x: p.x, y: p.y, panX: editorPan.x, panY: editorPan.y };
      }
      return;
    }
    const isBg =
      evt.target === evt.target.getStage() ||
      evt.target.name() === "workspace-bg" ||
      evt.target.name() === "world-hit";
    if (!isBg) return;
    if (tool === "select") {
      const p = evt.target.getStage()?.getPointerPosition();
      if (p) {
        panning.current = {
          x: p.x,
          y: p.y,
          panX: editorPan.x,
          panY: editorPan.y,
          click: true,
          moved: false,
        };
      }
      return;
    }
    if (tool === "text") {
      const p = stagePoint(evt);
      onCreateElement("text", { x: p.x, y: p.y, width: 240, height: 48 });
      return;
    }
    if (
      tool === "rectangle" ||
      tool === "circle" ||
      tool === "line" ||
      tool === "pen" ||
      tool === "triangle" ||
      tool === "star" ||
      tool === "arrow"
    ) {
      const p = stagePoint(evt);
      const kind = tool === "pen" ? "line" : tool === "arrow" ? "line" : tool;
      setDraft({
        type: kind === "triangle" || kind === "star" ? "rectangle" : (kind as "rectangle" | "circle" | "line"),
        x: p.x,
        y: p.y,
        w: 0,
        h: 0,
      });
    }
  }

  function onStageMouseMove(evt: Konva.KonvaEventObject<MouseEvent>) {
    if (panning.current) {
      const p = evt.target.getStage()?.getPointerPosition();
      if (!p) return;
      const dx = p.x - panning.current.x;
      const dy = p.y - panning.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) panning.current.moved = true;
      onViewChange(editorZoom, {
        x: panning.current.panX + dx,
        y: panning.current.panY + dy,
      });
      return;
    }
    if (!draft) return;
    const p = stagePoint(evt);
    setDraft({
      ...draft,
      w: p.x - draft.x,
      h: p.y - draft.y,
    });
  }

  function onStageMouseUp() {
    if (panning.current?.click && !panning.current.moved) onSelect(null);
    panning.current = null;
    if (!draft) return;
    const x = Math.min(draft.x, draft.x + draft.w);
    const y = Math.min(draft.y, draft.y + draft.h);
    const w = Math.max(24, Math.abs(draft.w));
    const h = Math.max(draft.type === "line" ? 0 : 24, Math.abs(draft.h));
    const createType =
      tool === "triangle" || tool === "star" || tool === "arrow" || tool === "pen"
        ? tool === "pen"
          ? "line"
          : tool
        : draft.type;
    onCreateElement(createType as ToolId, {
      x: snapValue(x),
      y: snapValue(y),
      width: snapValue(w),
      height: snapValue(h),
    });
    setDraft(null);
  }

  function handleSelect(id: string, additive: boolean) {
    onSelect(id, additive);
    if (clickAddsStop && !additive) onAddScene(id);
  }

  function zoomAt(stagePt: { x: number; y: number }, nextZoom: number) {
    const z = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, nextZoom));
    const world = stageToWorld(stagePt);
    onViewChange(z, {
      x: stagePt.x - world.x * z,
      y: stagePt.y - world.y * z,
    });
  }

  const worldNodes = (
    <>
      {roots.map((id) => {
        const el = doc.elements[id];
        if (!el) return null;
        return (
          <ElementNode
            key={id}
            doc={doc}
            el={el}
            selectedId={selectedId}
            timeMs={timeMs}
            playing={playing}
            tool={tool}
            onSelect={handleSelect}
            onBeginGesture={onBeginGesture}
            onLiveUpdate={onLiveUpdate}
            onReparent={onReparent}
            nodeRefs={nodeRefs}
            toWorld={stageToWorld}
          />
        );
      })}
      {draft ? (
        <Rect
          x={Math.min(draft.x, draft.x + draft.w)}
          y={Math.min(draft.y, draft.y + draft.h)}
          width={Math.abs(draft.w)}
          height={Math.abs(draft.h)}
          stroke="#7c5cfc"
          dash={[6, 4]}
          listening={false}
        />
      ) : null}
    </>
  );

  return (
    <div
      className={panning.current?.moved ? "mb-canvas is-panning" : "mb-canvas"}
      ref={wrapRef}
      style={{ background: bg }}
      onDragOver={(e) => {
        if (!isAssetDrag(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(e) => {
        const payload = readAssetDrag(e);
        if (!payload || !onDropAsset) return;
        e.preventDefault();
        const rect = wrapRef.current?.getBoundingClientRect();
        if (!rect) return;
        onDropAsset(
          payload,
          stageToWorld({ x: e.clientX - rect.left, y: e.clientY - rect.top }),
        );
      }}
    >
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        onMouseDown={onStageMouseDown}
        onMouseMove={onStageMouseMove}
        onMouseUp={onStageMouseUp}
        onMouseLeave={() => {
          if (!panning.current) return;
          if (panning.current.click && !panning.current.moved) onSelect(null);
          panning.current = null;
        }}
        onWheel={(e) => {
          e.evt.preventDefault();
          if (playing) return;
          if (Math.abs(e.evt.deltaX) > Math.abs(e.evt.deltaY) + 1) {
            onViewChange(editorZoom, {
              x: editorPan.x - e.evt.deltaX,
              y: editorPan.y - e.evt.deltaY,
            });
            return;
          }
          const p = e.target.getStage()?.getPointerPosition();
          if (!p) return;
          const dir = e.evt.deltaY > 0 ? -1 : 1;
          zoomAt(p, editorZoom * (dir > 0 ? 1.08 : 1 / 1.08));
        }}
      >
        <Layer>
          <Rect
            name="workspace-bg"
            width={size.width}
            height={size.height}
            fill={bg}
          />
          <Group x={editorPan.x} y={editorPan.y} scaleX={editorZoom} scaleY={editorZoom}>
            <Rect
              name="world-hit"
              x={-100000}
              y={-100000}
              width={200000}
              height={200000}
              fill={bg}
            />
            {worldNodes}
          </Group>
        </Layer>
        <Layer listening={!playing}>
          <Transformer
            ref={trRef}
            rotateEnabled
            ignoreStroke
            padding={2}
            borderStroke="#7c3aed"
            borderStrokeWidth={1}
            anchorStroke="#7c3aed"
            anchorFill="#fff"
            anchorSize={7}
            anchorCornerRadius={1}
            rotateAnchorOffset={16}
            enabledAnchors={[
              "top-left",
              "top-right",
              "bottom-left",
              "bottom-right",
              "middle-left",
              "middle-right",
              "top-center",
              "bottom-center",
            ]}
            boundBoxFunc={(oldBox, newBox) =>
              newBox.width < 8 || newBox.height < 8 ? oldBox : newBox
            }
          />
        </Layer>
      </Stage>
      {totalDurationMs(doc) <= 0 && !Object.keys(doc.elements).length ? (
        <p className="board-canvas-hint">
          Drag empty space to pan in any direction. Scroll to zoom. Draw anywhere — one infinite canvas.
        </p>
      ) : null}
    </div>
  );
}
