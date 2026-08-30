import { useCallback, useEffect, useRef, useState } from "react";
import {
  cloneBoard,
  collectDescendants,
  compositionDurationMs,
  defaultElement,
  defaultScene,
  emptyBoardDocument,
  findDropTarget,
  hitTestElement,
  KEYFRAME_HIT_MS,
  newId,
  parseBoardDocument,
  poseFromElement,
  poseAtTime,
  removeKeyframeAt,
  upsertKeyframe,
  worldOrigin,
  type BoardDocument,
  type BoardElement,
  type BoardScene,
  type ElementType,
} from "../../shared/board";
import { loadDraft, saveDraft } from "./idb";
import { travelDemoBoard } from "./demo";

const HISTORY_LIMIT = 50;

export type ToolId =
  | "select"
  | "hand"
  | "pen"
  | "rectangle"
  | "circle"
  | "triangle"
  | "star"
  | "arrow"
  | "text"
  | "image"
  | "line";

function withoutElement(doc: BoardDocument, id: string): BoardDocument {
  const next = cloneBoard(doc);
  const el = next.elements[id];
  if (!el) return next;
  const ids = [id, ...collectDescendants(next, id)];
  if (el.parentId && next.elements[el.parentId]) {
    next.elements[el.parentId].children = next.elements[
      el.parentId
    ].children.filter((c) => c !== id);
  }
  for (const rid of ids) delete next.elements[rid];
  next.scenes = next.scenes.map((scene) => ({
    ...scene,
    elementIds: scene.elementIds.filter((eid) => !ids.includes(eid)),
    camera: {
      ...scene.camera,
      targetId:
        scene.camera.targetId && ids.includes(scene.camera.targetId)
          ? undefined
          : scene.camera.targetId,
    },
  }));
  return next;
}

export function useBoardDocument() {
  const [doc, setDoc] = useState<BoardDocument>(() => emptyBoardDocument());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [tool, setTool] = useState<ToolId>("select");
  const [clickAddsStop, setClickAddsStop] = useState(false);
  const [ready, setReady] = useState(false);
  const history = useRef<BoardDocument[]>([]);
  const future = useRef<BoardDocument[]>([]);
  const skipSave = useRef(true);

  useEffect(() => {
    let cancelled = false;
    void loadDraft().then((draft) => {
      if (cancelled) return;
      if (draft && Object.keys(draft.elements).length + draft.scenes.length) {
        setDoc(draft);
        setSelectedSceneId(draft.scenes[0]?.id ?? null);
      } else {
        const demo = travelDemoBoard();
        setDoc(demo);
        setSelectedSceneId(demo.scenes[0]?.id ?? null);
      }
      setReady(true);
      skipSave.current = false;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || skipSave.current) return;
    const t = window.setTimeout(() => void saveDraft(doc), 280);
    return () => window.clearTimeout(t);
  }, [doc, ready]);

  const pushHistory = useCallback((prev: BoardDocument) => {
    history.current = [...history.current, cloneBoard(prev)].slice(
      -HISTORY_LIMIT,
    );
    future.current = [];
  }, []);

  const commit = useCallback(
    (recipe: (current: BoardDocument) => BoardDocument) => {
      setDoc((current) => {
        const next = recipe(current);
        if (next === current) return current;
        pushHistory(current);
        return next;
      });
    },
    [pushHistory],
  );

  const undo = useCallback(() => {
    const prev = history.current.pop();
    if (!prev) return;
    setDoc((current) => {
      future.current.push(cloneBoard(current));
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    setDoc((current) => {
      history.current.push(cloneBoard(current));
      return next;
    });
  }, []);

  const replaceDoc = useCallback((next: BoardDocument) => {
    setDoc((current) => {
      pushHistory(current);
      const parsed = parseBoardDocument(next);
      setSelectedSceneId(parsed.scenes[0]?.id ?? null);
      setSelectedId(null);
      return parsed;
    });
  }, [pushHistory]);

  const addElement = useCallback(
    (type: ElementType, extra: Partial<BoardElement> = {}) => {
      const el = defaultElement(type, extra);
      commit((current) => {
        const next = cloneBoard(current);
        next.elements[el.id] = el;
        return next;
      });
      setSelectedId(el.id);
      setSelectedIds([el.id]);
      setTool("select");
      return el.id;
    },
    [commit],
  );

  const updateElement = useCallback(
    (id: string, patch: Partial<BoardElement>) => {
      commit((current) => {
        if (!current.elements[id]) return current;
        const next = cloneBoard(current);
        next.elements[id] = { ...next.elements[id], ...patch, id };
        return next;
      });
    },
    [commit],
  );

  const updateElementLive = useCallback(
    (id: string, patch: Partial<BoardElement>) => {
      setDoc((current) => {
        if (!current.elements[id]) return current;
        return {
          ...current,
          elements: {
            ...current.elements,
            [id]: { ...current.elements[id], ...patch, id },
          },
        };
      });
    },
    [],
  );

  const beginGesture = useCallback(() => {
    setDoc((current) => {
      pushHistory(current);
      return current;
    });
  }, [pushHistory]);

  const removeElement = useCallback(
    (id: string) => {
      commit((current) => withoutElement(current, id));
      setSelectedId((cur) => (cur === id ? null : cur));
      setSelectedIds((ids) => ids.filter((x) => x !== id));
    },
    [commit],
  );

  const applyPosePatch = useCallback(
    (
      current: BoardDocument,
      id: string,
      patch: Partial<BoardElement>,
      timeMs: number,
    ): BoardDocument => {
      const el = current.elements[id];
      if (!el) return current;
      const next = cloneBoard(current);
      const moving = next.elements[id];
      const atTime = Math.max(0, timeMs);
      const hasKeys = Boolean(moving.keyframes?.length);
      const recordKey = hasKeys || atTime > KEYFRAME_HIT_MS;
      const merged = { ...moving, ...patch, id };
      if (!recordKey) {
        next.elements[id] = merged;
        return next;
      }
      let seed = merged.keyframes || [];
      if (!seed.length && atTime > KEYFRAME_HIT_MS) {
        seed = [{ ...poseFromElement(moving), timeMs: 0 }];
      }
      const frames = upsertKeyframe(seed, {
        ...poseFromElement(merged),
        timeMs: atTime,
        x: merged.x,
        y: merged.y,
        width: merged.width,
        height: merged.height,
        rotation: merged.rotation,
        opacity: merged.opacity,
      });
      if (atTime <= KEYFRAME_HIT_MS) {
        next.elements[id] = { ...merged, keyframes: frames };
      } else {
        next.elements[id] = {
          ...moving,
          width: merged.width,
          height: merged.height,
          keyframes: frames,
        };
      }
      return next;
    },
    [],
  );

  const finishDrag = useCallback(
    (
      id: string,
      x: number,
      y: number,
      worldX: number,
      worldY: number,
      timeMs = 0,
    ) => {
      commit((current) => {
        const el = current.elements[id];
        if (!el) return current;
        const next = applyPosePatch(current, id, { x, y }, timeMs);
        const moving = next.elements[id];
        if (!moving) return next;
        if (timeMs > KEYFRAME_HIT_MS) return next;

        const parent = moving.parentId ? next.elements[moving.parentId] : null;
        if (parent && parent.type !== "group") return next;

        const targetId = findDropTarget(next, id, worldX, worldY);
        if (targetId === moving.parentId) return next;

        const stillOnParent =
          Boolean(moving.parentId) &&
          hitTestElement(next, moving.parentId as string, worldX, worldY);
        if (!targetId && stillOnParent) return next;
        if (!targetId && parent) {
          const origin = worldOrigin(next, id);
          next.elements[parent.id].children = parent.children.filter((c) => c !== id);
          moving.parentId = null;
          moving.x = origin.x;
          moving.y = origin.y;
          return next;
        }
        if (!targetId) return next;

        const origin = worldOrigin(next, id);
        if (moving.parentId && next.elements[moving.parentId]) {
          next.elements[moving.parentId].children = next.elements[
            moving.parentId
          ].children.filter((c) => c !== id);
        }
        const group = next.elements[targetId];
        group.children = [...group.children.filter((c) => c !== id), id];
        moving.parentId = targetId;
        const pOrigin = worldOrigin(next, targetId);
        const rad = (-pOrigin.rotation * Math.PI) / 180;
        const dx = origin.x - pOrigin.x;
        const dy = origin.y - pOrigin.y;
        moving.x = dx * Math.cos(rad) - dy * Math.sin(rad);
        moving.y = dx * Math.sin(rad) + dy * Math.cos(rad);
        return next;
      });
    },
    [applyPosePatch, commit],
  );

  const addKeyframe = useCallback(
    (id: string, timeMs: number) => {
      commit((current) => {
        const el = current.elements[id];
        if (!el) return current;
        const atTime = Math.max(0, timeMs);
        const visual = poseAtTime(el, atTime, false);
        const next = cloneBoard(current);
        const moving = next.elements[id];
        let seed = moving.keyframes || [];
        if (!seed.some((kf) => kf.timeMs <= KEYFRAME_HIT_MS)) {
          seed = upsertKeyframe(seed, {
            ...poseFromElement(moving),
            timeMs: 0,
          });
        }
        const frames = upsertKeyframe(seed, {
          ...poseFromElement(moving),
          timeMs: atTime,
          x: visual.x,
          y: visual.y,
          rotation: visual.rotation,
          scale: visual.scale,
          scaleY: visual.scaleY,
          opacity: visual.opacity,
        });
        if (atTime <= KEYFRAME_HIT_MS) {
          next.elements[id] = {
            ...moving,
            x: visual.x,
            y: visual.y,
            rotation: visual.rotation,
            opacity: visual.opacity,
            keyframes: frames,
          };
        } else {
          next.elements[id] = { ...moving, keyframes: frames };
        }
        return next;
      });
    },
    [],
  );

  const removeKeyframe = useCallback(
    (id: string, timeMs: number) => {
      commit((current) => {
        const el = current.elements[id];
        if (!el?.keyframes?.length) return current;
        const next = cloneBoard(current);
        const frames = removeKeyframeAt(next.elements[id].keyframes, timeMs);
        if (!frames.length) {
          next.elements[id] = { ...next.elements[id], keyframes: undefined };
          return next;
        }
        const first = frames[0];
        next.elements[id] = {
          ...next.elements[id],
          x: first.timeMs <= KEYFRAME_HIT_MS ? first.x : next.elements[id].x,
          y: first.timeMs <= KEYFRAME_HIT_MS ? first.y : next.elements[id].y,
          rotation: first.timeMs <= KEYFRAME_HIT_MS ? first.rotation : next.elements[id].rotation,
          opacity: first.timeMs <= KEYFRAME_HIT_MS ? first.opacity : next.elements[id].opacity,
          keyframes: frames,
        };
        return next;
      });
    },
    [commit],
  );

  const addSceneFromElement = useCallback(
    (elementId: string) => {
      const el = doc.elements[elementId];
      if (!el) return;
      const last = doc.scenes[doc.scenes.length - 1];
      if (last?.camera.targetId === elementId) {
        setSelectedSceneId(last.id);
        return;
      }
      const name = `${el.type} ${doc.scenes.length + 1}`;
      const scene = defaultScene(elementId, name, {
        elementIds: [elementId, ...collectDescendants(doc, elementId)],
      });
      commit((current) => {
        const next = cloneBoard(current);
        next.scenes = [...next.scenes, scene];
        return next;
      });
      setSelectedSceneId(scene.id);
    },
    [commit, doc],
  );

  const updateScene = useCallback(
    (id: string, patch: Partial<BoardScene>) => {
      commit((current) => {
        const next = cloneBoard(current);
        next.scenes = next.scenes.map((s) =>
          s.id === id ? { ...s, ...patch, id } : s,
        );
        return next;
      });
    },
    [commit],
  );

  const removeScene = useCallback(
    (id: string) => {
      commit((current) => {
        const next = cloneBoard(current);
        next.scenes = next.scenes.filter((s) => s.id !== id);
        return next;
      });
      setSelectedSceneId((cur) => (cur === id ? null : cur));
    },
    [commit],
  );

  const moveScene = useCallback(
    (id: string, dir: -1 | 1) => {
      commit((current) => {
        const i = current.scenes.findIndex((s) => s.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= current.scenes.length) return current;
        const next = cloneBoard(current);
        const copy = [...next.scenes];
        const [item] = copy.splice(i, 1);
        copy.splice(j, 0, item);
        next.scenes = copy;
        return next;
      });
    },
    [commit],
  );

  const selectElement = useCallback((id: string | null, additive = false) => {
    if (!id) {
      setSelectedId(null);
      setSelectedIds([]);
      return;
    }
    if (additive) {
      setSelectedIds((ids) => {
        const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
        setSelectedId(next[next.length - 1] ?? null);
        return next;
      });
      return;
    }
    setSelectedId(id);
    setSelectedIds([id]);
  }, []);

  const groupSelected = useCallback(() => {
    commit((current) => {
      const ids = selectedIds.filter((id) => current.elements[id] && !current.elements[id].parentId);
      if (ids.length < 2) return current;
      const next = cloneBoard(current);
      const group = defaultElement("group", {
        name: "Group",
        x: Math.min(...ids.map((id) => next.elements[id].x)),
        y: Math.min(...ids.map((id) => next.elements[id].y)),
        width: 200,
        height: 120,
        fill: "rgba(124,92,252,0.06)",
        stroke: "#7c5cfc",
        strokeWidth: 1,
      });
      next.elements[group.id] = group;
      for (const id of ids) {
        const el = next.elements[id];
        el.x -= group.x;
        el.y -= group.y;
        el.parentId = group.id;
      }
      group.children = ids;
      return next;
    });
  }, [commit, selectedIds]);

  const addEmptyScene = useCallback(() => {
    commit((current) => {
      const next = cloneBoard(current);
      const target = selectedId && current.elements[selectedId] ? selectedId : "";
      const scene = defaultScene(target || Object.keys(current.elements)[0] || "none", `Scene ${current.scenes.length + 1}`);
      if (!target) {
        scene.camera = {
          mode: "manual",
          x: 640,
          y: 360,
          zoom: 1,
          rotation: 0,
        };
      }
      next.scenes = [...next.scenes, scene];
      return next;
    });
  }, [commit, selectedId]);

  const extendComposition = useCallback(
    (neededMs: number) => {
      commit((current) => {
        const needed = Math.max(0, neededMs);
        const now = compositionDurationMs(current);
        if (needed <= now) return current;
        const next = cloneBoard(current);
        next.meta = { ...next.meta, durationMs: needed };
        return next;
      });
    },
    [commit],
  );

  const setCompositionDuration = useCallback(
    (ms: number) => {
      commit((current) => {
        const next = cloneBoard(current);
        next.meta = { ...next.meta, durationMs: Math.max(0, ms) };
        return next;
      });
    },
    [commit],
  );

  const renameBoard = useCallback(
    (name: string) => {
      commit((current) => ({ ...cloneBoard(current), name }));
    },
    [commit],
  );

  const newBoard = useCallback(() => {
    replaceDoc(emptyBoardDocument());
  }, [replaceDoc]);

  return {
    doc,
    ready,
    selectedId,
    selectedIds,
    setSelectedId,
    selectElement,
    selectedSceneId,
    setSelectedSceneId,
    tool,
    setTool,
    clickAddsStop,
    setClickAddsStop,
    addElement,
    updateElement,
    updateElementLive,
    updateElementAtTime: (id: string, patch: Partial<BoardElement>, timeMs: number) => {
      commit((current) => applyPosePatch(current, id, patch, timeMs));
    },
    beginGesture,
    removeElement,
    reparent: finishDrag,
    addKeyframe,
    removeKeyframe,
    addSceneFromElement,
    addEmptyScene,
    extendComposition,
    setCompositionDuration,
    updateScene,
    removeScene,
    moveScene,
    groupSelected,
    renameBoard,
    replaceDoc,
    newBoard,
    undo,
    redo,
    newId,
  };
}
