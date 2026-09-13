import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Aspect = "free" | "1:1" | "16:9" | "9:16" | "4:5";

type Props = {
  src: string;
  onCancel: () => void;
  onApply: (dataUrl: string) => void;
};

const ASPECTS: { id: Aspect; label: string; ratio: number | null }[] = [
  { id: "free", label: "Free", ratio: null },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "4:5", label: "4:5", ratio: 4 / 5 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
  { id: "9:16", label: "9:16", ratio: 9 / 16 },
];

type CropRect = { x: number; y: number; w: number; h: number };

export function ImageCropModal({ src, onCancel, onApply }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [aspect, setAspect] = useState<Aspect>("free");
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 1, h: 1 });
  const [drag, setDrag] = useState<{
    mode: "move" | "se";
    startX: number;
    startY: number;
    origin: CropRect;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onCancel]);

  function initCrop(nw: number, nh: number, nextAspect: Aspect) {
    const ratio = ASPECTS.find((a) => a.id === nextAspect)?.ratio ?? null;
    let w = 0.82;
    let h = 0.82;
    if (ratio) {
      const imgRatio = nw / nh;
      if (imgRatio > ratio) {
        h = 0.82;
        w = (0.82 * ratio * nh) / nw;
      } else {
        w = 0.82;
        h = (0.82 * nw) / (ratio * nh);
      }
    }
    setCrop({
      x: (1 - w) / 2,
      y: (1 - h) / 2,
      w,
      h,
    });
  }

  function onImageLoad() {
    const img = imgRef.current;
    if (!img) return;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    setNatural({ w: nw, h: nh });
    initCrop(nw, nh, aspect);
  }

  function changeAspect(next: Aspect) {
    setAspect(next);
    if (natural.w && natural.h) initCrop(natural.w, natural.h, next);
  }

  function onPointerDown(
    event: React.PointerEvent,
    mode: "move" | "se",
  ) {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    setDrag({
      mode,
      startX: event.clientX,
      startY: event.clientY,
      origin: { ...crop },
    });
  }

  useEffect(() => {
    if (!drag) return;
    function onMove(event: PointerEvent) {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const dx = (event.clientX - drag.startX) / rect.width;
      const dy = (event.clientY - drag.startY) / rect.height;
      const o = drag.origin;
      const ratio = ASPECTS.find((a) => a.id === aspect)?.ratio ?? null;

      if (drag.mode === "move") {
        setCrop({
          ...o,
          x: Math.min(Math.max(0, o.x + dx), 1 - o.w),
          y: Math.min(Math.max(0, o.y + dy), 1 - o.h),
        });
        return;
      }

      let w = Math.min(1 - o.x, Math.max(0.12, o.w + dx));
      let h = Math.min(1 - o.y, Math.max(0.12, o.h + dy));
      if (ratio && natural.w && natural.h) {
        const imgRatio = natural.w / natural.h;
        h = (w * natural.w) / (ratio * natural.h);
        if (o.y + h > 1) {
          h = 1 - o.y;
          w = (h * ratio * natural.h) / natural.w;
        }
        if (w < 0.12) {
          w = 0.12;
          h = (w * natural.w) / (ratio * natural.h);
        }
        void imgRatio;
      }
      setCrop({ ...o, w, h });
    }
    function onUp() {
      setDrag(null);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, aspect, natural]);

  async function apply() {
    if (!natural.w || !natural.h) return;
    setBusy(true);
    try {
      const img = new Image();
      img.decoding = "async";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not load image."));
        img.src = src;
      });
      const sx = Math.round(crop.x * natural.w);
      const sy = Math.round(crop.y * natural.h);
      const sw = Math.max(1, Math.round(crop.w * natural.w));
      const sh = Math.max(1, Math.round(crop.h * natural.h));
      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable.");
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      const type = src.startsWith("data:image/png") ? "image/png" : "image/jpeg";
      const dataUrl = canvas.toDataURL(type, 0.92);
      onApply(dataUrl);
    } catch {
      onApply(src);
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div className="crop-modal" role="dialog" aria-modal="true" aria-label="Crop image">
      <button type="button" className="crop-modal-scrim" aria-label="Close" onClick={onCancel} />
      <div className="crop-modal-panel">
        <header className="crop-modal-head">
          <div>
            <p className="crop-kicker">Image crop</p>
            <h2>Frame your upload</h2>
          </div>
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        </header>

        <div className="crop-aspects" role="group" aria-label="Aspect ratio">
          {ASPECTS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={aspect === item.id ? "crop-aspect on" : "crop-aspect"}
              onClick={() => changeAspect(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="crop-stage-wrap">
          <div
            ref={stageRef}
            className="crop-stage"
            style={
              natural.w && natural.h
                ? { aspectRatio: `${natural.w} / ${natural.h}` }
                : undefined
            }
          >
            <img
              ref={imgRef}
              src={src}
              alt=""
              draggable={false}
              onLoad={onImageLoad}
            />
            <div
              className="crop-box"
              style={{
                left: `${crop.x * 100}%`,
                top: `${crop.y * 100}%`,
                width: `${crop.w * 100}%`,
                height: `${crop.h * 100}%`,
              }}
              onPointerDown={(e) => onPointerDown(e, "move")}
            >
              <span className="crop-grid" aria-hidden />
              <button
                type="button"
                className="crop-handle"
                aria-label="Resize crop"
                onPointerDown={(e) => onPointerDown(e, "se")}
              />
            </div>
          </div>
        </div>

        <p className="crop-hint">Drag to reposition. Use the corner handle to resize.</p>

        <footer className="crop-modal-actions">
          <button type="button" className="secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn-cta crop-apply" onClick={apply} disabled={busy}>
            {busy ? "Cropping…" : "Apply crop"}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
