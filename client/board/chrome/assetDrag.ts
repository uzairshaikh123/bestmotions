import type { DragEvent } from "react";
import type { ElementType } from "../../../shared/board";

export const MB_ASSET_MIME = "application/x-mb-asset";

export type MbAssetPayload = {
  kind: "mb-asset";
  type: ElementType;
  extra: Record<string, unknown>;
};

let dragging: MbAssetPayload | null = null;

export function setAssetDrag(
  event: DragEvent,
  type: ElementType,
  extra: Record<string, unknown> = {},
) {
  const payload: MbAssetPayload = { kind: "mb-asset", type, extra };
  dragging = payload;
  const json = JSON.stringify(payload);
  event.dataTransfer.setData(MB_ASSET_MIME, json);
  event.dataTransfer.setData("text/plain", json);
  event.dataTransfer.effectAllowed = "copy";
}

export function clearAssetDrag() {
  dragging = null;
}

export function isAssetDrag(event: DragEvent) {
  if (dragging) return true;
  return Array.from(event.dataTransfer.types).includes(MB_ASSET_MIME);
}

export function readAssetDrag(event: DragEvent): MbAssetPayload | null {
  const raw =
    event.dataTransfer.getData(MB_ASSET_MIME) ||
    event.dataTransfer.getData("text/plain");
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as MbAssetPayload;
      if (parsed?.kind === "mb-asset" && parsed.type) {
        dragging = null;
        return parsed;
      }
    } catch {
      /* fall through to in-memory payload */
    }
  }
  const payload = dragging;
  dragging = null;
  return payload;
}
