/** @jsxImportSource @revideo/2d/lib */
import { Circle, Img, Line, Node, Polygon, Rect, Txt } from "@revideo/2d";
import { createRef, waitFor, type ThreadGenerator } from "@revideo/core";
import {
  cameraAtMs,
  cameraFromEditorView,
  compositionDurationMs,
  DEFAULT_CHART_DATA,
  DEFAULT_FPS,
  barRects,
  chartProgress,
  elementSize,
  linePoints,
  parseChartPairs,
  parseBoardDocument,
  pieSlices,
  poseAtTime,
  revideoLocalCenter,
  rootElementIds,
  starPoints,
  statNumber,
  type BoardDocument,
  type BoardElement,
} from "../../../shared/board";
import { num, v } from "../../lib/helpers";

function readBoard(): BoardDocument {
  const raw = v<unknown>("boardJson", "{}");
  if (typeof raw === "string") {
    try {
      return parseBoardDocument(JSON.parse(raw || "{}"));
    } catch {
      return parseBoardDocument({});
    }
  }
  return parseBoardDocument(raw);
}

function camPos(x: number, y: number, zoom: number): [number, number] {
  return [-x * zoom, -y * zoom];
}

export function* runMagicBoard(view: any) {
  const doc = readBoard();
  view.fill(doc.meta.background || "#0c1f18");

  const camera = createRef<Node>();
  const refs: Record<string, any> = {};
  for (const id of Object.keys(doc.elements)) {
    refs[id] = createRef();
  }

  yield view.add(<Node ref={camera} />);

  for (const id of rootElementIds(doc)) {
    if (doc.elements[id]?.visible === false) continue;
    yield* mountElement(doc, id, camera(), null, refs);
  }

  const fps = doc.meta.fps || DEFAULT_FPS;
  const durationMs = compositionDurationMs(doc);
  const totalSec = Math.max(1 / fps, durationMs / 1000);
  const frames = Math.max(1, Math.round(totalSec * fps));
  const dt = totalSec / frames;

  applyBoardFrame(doc, camera(), refs, 0);
  for (let i = 1; i <= frames; i++) {
    const t = durationMs <= 0 ? 0 : (i / frames) * durationMs;
    applyBoardFrame(doc, camera(), refs, t);
    yield* waitFor(dt);
  }
}

function applyBoardFrame(
  doc: BoardDocument,
  camera: any,
  refs: Record<string, any>,
  timeMs: number,
) {
  const viewW = num("viewWidth", 0);
  const viewH = num("viewHeight", 0);
  const viewZoom = num("viewZoom", 0);
  const fromView =
    viewW >= 32 && viewH >= 32 && viewZoom > 0
      ? cameraFromEditorView(
          { x: num("viewPanX", 0), y: num("viewPanY", 0) },
          viewZoom,
          viewW,
          viewH,
        )
      : null;
  const cam = fromView || cameraAtMs(doc, timeMs).camera;
  camera.scale(cam.zoom);
  camera.position(camPos(cam.x, cam.y, cam.zoom));
  camera.rotation(cam.rotation ?? 0);
  for (const id of rootElementIds(doc)) {
    applyElementTree(doc, id, null, refs, timeMs);
  }
}

function applyElementTree(
  doc: BoardDocument,
  id: string,
  parent: BoardElement | null,
  refs: Record<string, any>,
  timeMs: number,
) {
  const el = doc.elements[id];
  if (!el || el.visible === false) return;
  const node = refs[id]?.();
  if (node) applyElementPose(el, parent, node, timeMs);
  for (const cid of el.children) {
    applyElementTree(doc, cid, el, refs, timeMs);
  }
}

function applyElementPose(
  el: BoardElement,
  parent: BoardElement | null,
  node: any,
  timeMs: number,
) {
  const pose = poseAtTime(el, timeMs, true);
  const size = elementSize(el);
  const cx = pose.x + size.width / 2;
  const cy = pose.y + size.height / 2;
  if (!parent) {
    node.position([cx, cy]);
  } else {
    const ps = elementSize(parent);
    node.position([cx - ps.width / 2, cy - ps.height / 2]);
  }
  node.opacity(pose.opacity);
  node.rotation(pose.rotation);
  node.scale([pose.scale, pose.scaleY ?? pose.scale]);
  if (el.type === "chart") updateChartNode(node, el, timeMs);
}

function chartLocal(
  x: number,
  y: number,
  w: number,
  h: number,
  box: { width: number; height: number },
) {
  return {
    x: x + w / 2 - box.width / 2,
    y: y + h / 2 - box.height / 2,
  };
}

function updateChartNode(node: any, el: BoardElement, timeMs: number) {
  const root = node.children()[0];
  if (!root?.children) return;
  const size = elementSize(el);
  const kind = el.chartKind || "bar";
  const u = chartProgress(el, timeMs);
  const pairs = parseChartPairs(el.chartData, DEFAULT_CHART_DATA[kind]);
  const kids = root.children();
  if (kind === "stat") {
    const txt = kids[1];
    if (txt?.text) txt.text(statNumber(el, u));
    return;
  }
  if (kind === "bar") {
    const bars = barRects(size.width, size.height, pairs, u);
    bars.forEach((b, i) => {
      const r = kids[i + 1];
      if (!r) return;
      const p = chartLocal(b.x, b.y, b.w, b.h, size);
      r.size([b.w, b.h]);
      r.position([p.x, p.y]);
    });
    return;
  }
  if (kind === "pie") {
    const slices = pieSlices(size.width, size.height, pairs, u);
    slices.forEach((s, i) => {
      const c = kids[i + 1];
      if (!c) return;
      if (c.startAngle) c.startAngle(s.rotation);
      if (c.endAngle) c.endAngle(s.rotation + s.angle);
    });
    return;
  }
  if (kind === "line") {
    const pts = linePoints(size.width, size.height, pairs, u);
    const line = kids[1];
    if (line?.points) {
      line.points(pts.map((p) => [p.x - size.width / 2, p.y - size.height / 2]));
    }
  }
}

function chartVisual(el: BoardElement, size: { width: number; height: number }) {
  const kind = el.chartKind || "bar";
  const pairs = parseChartPairs(el.chartData, DEFAULT_CHART_DATA[kind]);
  const w = size.width;
  const h = size.height;
  const bg = "#101018";
  if (kind === "stat") {
    return (
      <Node>
        <Rect width={w} height={h} fill={bg} radius={12} />
        <Txt text={statNumber(el, 0)} fill={"#ffffff"} fontSize={48} y={-8} />
        <Txt text={el.name || "Stat"} fill={"#9aa0b4"} fontSize={14} y={28} />
      </Node>
    );
  }
  if (kind === "pie") {
    const slices = pieSlices(w, h, pairs, 0.001);
    return (
      <Node>
        <Rect width={w} height={h} fill={bg} radius={12} />
        {slices.map((s) => (
          <Circle
            key={s.label}
            width={s.radius * 2}
            height={s.radius * 2}
            fill={s.color}
            x={s.cx - w / 2}
            y={s.cy - h / 2}
            startAngle={s.rotation}
            endAngle={s.rotation + Math.max(s.angle, 0.01)}
          />
        ))}
      </Node>
    );
  }
  if (kind === "line") {
    const pts = linePoints(w, h, pairs, 0.05);
    return (
      <Node>
        <Rect width={w} height={h} fill={bg} radius={12} />
        <Line
          points={pts.map((p) => [p.x - w / 2, p.y - h / 2])}
          stroke={"#7c5cfc"}
          lineWidth={3}
          lineCap={"round"}
        />
      </Node>
    );
  }
  const bars = barRects(w, h, pairs, 0.05);
  return (
    <Node>
      <Rect width={w} height={h} fill={bg} radius={12} />
      {bars.map((b) => {
        const p = chartLocal(b.x, b.y, b.w, b.h, size);
        return (
          <Rect
            key={b.label}
            width={b.w}
            height={b.h}
            fill={b.color}
            x={p.x}
            y={p.y}
            radius={4}
          />
        );
      })}
    </Node>
  );
}

function shapeVisual(el: BoardElement, size: { width: number; height: number }) {
  const fill = el.fill || "#1f6b4a";
  const stroke = el.stroke || "#e8f0ea";
  const lineWidth = el.strokeWidth ?? 2;
  const w = size.width;
  const h = size.height;

  if (el.type === "circle") {
    return (
      <Circle width={w} height={h} fill={fill} stroke={stroke} lineWidth={lineWidth} />
    );
  }
  if (el.type === "triangle") {
    return (
      <Polygon
        sides={3}
        width={w}
        height={h}
        fill={fill}
        stroke={stroke}
        lineWidth={lineWidth}
      />
    );
  }
  if (el.type === "star") {
    return (
      <Line
        points={starPoints(w, h, "center")}
        closed
        fill={fill}
        stroke={stroke}
        lineWidth={lineWidth}
      />
    );
  }
  if (el.type === "line") {
    return (
      <Line
        points={[
          [-w / 2, -(el.height || 0) / 2],
          [w / 2, (el.height || 0) / 2],
        ]}
        stroke={stroke}
        lineWidth={lineWidth}
        lineCap={"round"}
      />
    );
  }
  if (el.type === "arrow") {
    return (
      <Line
        points={[
          [-w / 2, 0],
          [w / 2, 0],
        ]}
        stroke={stroke || fill}
        lineWidth={Math.max(lineWidth, 4)}
        lineCap={"round"}
        endArrow
        arrowSize={16}
      />
    );
  }
  if (el.type === "text") {
    return (
      <Txt
        text={el.content || ""}
        fontSize={el.fontSize || 28}
        fontFamily={"Sora, Segoe UI, sans-serif"}
        fill={fill}
        width={w}
      />
    );
  }
  if (el.type === "image") {
    if (el.src) {
      return <Img src={el.src} width={w} height={h} />;
    }
    return <Rect width={w} height={h} fill={"#102018"} />;
  }
  if (el.type === "chart") {
    return chartVisual(el, size);
  }
  if (el.type === "template") {
    const accent =
      typeof el.variables?.accent === "string" ? el.variables.accent : fill;
    const bg =
      typeof el.variables?.bg === "string" ? String(el.variables.bg) : fill || "#111827";
    return (
      <Node>
        <Rect width={w} height={h} fill={bg} radius={10} />
        <Rect width={6} height={h - 24} fill={accent} x={-w / 2 + 16} radius={2} />
        <Txt
          text={el.name || "Template"}
          fill={"#f4f0e6"}
          fontSize={22}
          fontFamily={"Sora, Segoe UI, sans-serif"}
          y={-8}
        />
        <Txt
          text={"Frontpage template"}
          fill={"#9aa0b4"}
          fontSize={14}
          fontFamily={"Sora, Segoe UI, sans-serif"}
          y={18}
        />
      </Node>
    );
  }
  if (el.type === "group") {
    return (
      <Rect
        width={w}
        height={h}
        fill={fill || "rgba(124,92,252,0.06)"}
        stroke={stroke}
        lineWidth={lineWidth}
        radius={8}
      />
    );
  }
  return (
    <Rect
      width={w}
      height={h}
      fill={fill}
      stroke={stroke}
      lineWidth={lineWidth}
      radius={4}
    />
  );
}

function* mountElement(
  doc: BoardDocument,
  id: string,
  parent: any,
  parentEl: BoardElement | null,
  refs: Record<string, any>,
): ThreadGenerator {
  const el = doc.elements[id];
  if (!el || el.visible === false) return;
  const pos = revideoLocalCenter(el, parentEl);
  const size = elementSize(el);
  const ref = refs[id];

  yield parent.add(
    <Node
      ref={ref}
      x={pos.x}
      y={pos.y}
      opacity={el.opacity ?? 1}
      rotation={el.rotation ?? 0}
    />,
  );

  const mounted = ref();
  if (!mounted) return;
  yield mounted.add(shapeVisual(el, size));

  for (const cid of el.children) {
    yield* mountElement(doc, cid, mounted, el, refs);
  }
}
