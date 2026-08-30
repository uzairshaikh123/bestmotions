import React, { useEffect, useMemo, useRef, useState } from "react";
import { downloadBlob, recordCanvas } from "../recordCanvas";
import { videoFilename } from "../downloadVideo";
import {
  useFeatureFlags,
  withFeatureFlagVariables,
} from "../featureFlags";
import {
  RevideoPreview,
  type RevideoPreviewHandle,
} from "./RevideoPreview";
import type { AssetDefinition, AssetField } from "./types";

type Props = {
  asset: AssetDefinition;
  onBack: () => void;
};

type ExportPhase = "idle" | "rendering" | "downloading" | "done";

function settingsKey(
  assetId: string,
  props: Record<string, string | number>,
) {
  return JSON.stringify({ assetId, props });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

function friendlyExportError(raw: string): string {
  if (/captureStream|MediaRecorder|cannot record/i.test(raw)) {
    return "This browser cannot record the preview. Use Chrome or Edge.";
  }
  return raw;
}

function waitForPreview(
  handle: RevideoPreviewHandle,
  timeoutMs = 12_000,
): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function tick() {
      if (handle.isReady() && handle.getDuration() > 0.2) {
        resolve();
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error("Preview is not ready yet. Wait a moment and try again."));
        return;
      }
      window.requestAnimationFrame(tick);
    }
    tick();
  });
}

export function AssetEditor({ asset, onBack }: Props) {
  const flags = useFeatureFlags();
  const [props, setProps] = useState<Record<string, string | number>>({
    ...asset.defaults,
  });
  const previewRef = useRef<RevideoPreviewHandle>(null);
  const [phase, setPhase] = useState<ExportPhase>("idle");
  const [exportError, setExportError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [exportedKey, setExportedKey] = useState<string | null>(null);
  const videoUrlRef = useRef<string | null>(null);

  const busy = phase === "rendering" || phase === "downloading";

  const visibleFields = useMemo(
    () =>
      asset.fields.filter(
        (field) => flags.videoSound || field.key !== "sound",
      ),
    [asset.fields, flags.videoSound],
  );

  async function onImageChange(key: string, file: File | null) {
    if (!file) return;
    const url = await readFileAsDataUrl(file);
    setField(key, url);
  }

  const variables = useMemo(
    () =>
      withFeatureFlagVariables(
        {
          template: asset.template,
          ...props,
        },
        flags,
      ),
    [asset.template, props, flags],
  );

  const [previewVariables, setPreviewVariables] = useState(variables);

  useEffect(() => {
    const next = withFeatureFlagVariables(
      { template: asset.template, ...asset.defaults },
      flags,
    );
    setProps({ ...asset.defaults });
    setPreviewVariables(next);
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    videoUrlRef.current = null;
    setVideoUrl(null);
    setExportedKey(null);
    setExportError(null);
    setPhase("idle");
  }, [asset.id, flags.videoSound]);

  useEffect(() => {
    const t = window.setTimeout(() => setPreviewVariables(variables), 180);
    return () => window.clearTimeout(t);
  }, [variables]);

  const currentKey = useMemo(
    () => settingsKey(asset.id, props),
    [asset.id, props],
  );

  const exportMatchesCurrent = Boolean(videoUrl && exportedKey === currentKey);
  const currentKeyRef = useRef(currentKey);
  currentKeyRef.current = currentKey;

  function setField(key: string, value: string | number) {
    setProps((prev) => ({ ...prev, [key]: value }));
    setPhase((p) => (p === "done" ? "idle" : p));
  }

  async function renderCurrentSettings(): Promise<string> {
    const keyAtStart = currentKeyRef.current;
    const handle = previewRef.current;
    if (!handle) throw new Error("Preview is not mounted.");
    await waitForPreview(handle);
    const canvas = handle.getCanvas();
    if (!canvas) throw new Error("Could not find the preview canvas.");
    handle.seek(0);
    handle.play();
    const seconds = Math.max(handle.getDuration(), 1);
    const { blob, ext } = await recordCanvas(canvas, seconds * 1000);
    handle.pause();
    handle.seek(0);
    const url = URL.createObjectURL(blob);
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    videoUrlRef.current = url;
    if (keyAtStart === currentKeyRef.current) {
      setVideoUrl(url);
      setExportedKey(keyAtStart);
    }
    const base = videoFilename(asset.name, asset.id).replace(/\.mp4$/i, "");
    downloadBlob(blob, `${base}.${ext}`);
    return url;
  }

  async function onDownloadMp4() {
    setExportError(null);
    try {
      if (exportMatchesCurrent && videoUrl) {
        setPhase("downloading");
        const a = document.createElement("a");
        a.href = videoUrl;
        a.download = videoFilename(asset.name, asset.id);
        a.click();
        setPhase("done");
        return;
      }
      setPhase("rendering");
      await renderCurrentSettings();
      setPhase("done");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Export failed.";
      setExportError(friendlyExportError(raw));
      setPhase("idle");
    }
  }

  const primaryLabel =
    phase === "rendering"
      ? "Rendering MP4…"
      : phase === "downloading"
        ? "Downloading…"
        : phase === "done" && exportMatchesCurrent
          ? "Download again"
          : exportMatchesCurrent
            ? "Download MP4"
            : "Export & download MP4";

  const statusText = exportError
    ? exportError
    : phase === "rendering"
      ? "Recording the live preview in your browser…"
      : phase === "downloading"
        ? "Saving the video to your Downloads folder…"
        : phase === "done" && exportMatchesCurrent
          ? "Download started. You can download again without re-recording until you change settings."
          : exportMatchesCurrent
            ? "Ready — this take is cached for these settings."
            : videoUrl
              ? "Settings changed — next click will record again, then download."
              : "Click Export to record the preview in your browser (no server render).";

  return (
    <section className="asset-editor">
      <div className="asset-editor-top">
        <button type="button" className="secondary" onClick={onBack}>
          ← All assets
        </button>
        <div>
          <h2>{asset.name}</h2>
          <p>{asset.description}</p>
        </div>
        <div className="asset-editor-actions">
          <button type="button" onClick={onDownloadMp4} disabled={busy}>
            {primaryLabel}
          </button>
        </div>
      </div>

      <div className="asset-editor-grid">
        <aside className="asset-controls">
          <div className="pane-label">Customize</div>
          <p className="control-hint">
            Edit text and colors — preview updates live. Download uses your
            latest settings.
          </p>

          {visibleFields.map((field) => (
            <FieldControl
              key={field.key}
              field={field}
              value={props[field.key]}
              onChange={(v) => setField(field.key, v)}
              onImage={(file) => onImageChange(field.key, file)}
            />
          ))}

          <button
            type="button"
            className="secondary"
            onClick={() => {
              setProps({ ...asset.defaults });
              if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
              videoUrlRef.current = null;
              setVideoUrl(null);
              setExportedKey(null);
              setPhase("idle");
              setExportError(null);
            }}
          >
            Reset to defaults
          </button>

          <div className="asset-download-panel">
            <button type="button" onClick={onDownloadMp4} disabled={busy}>
              {primaryLabel}
            </button>
            <div className={`status ${exportError ? "error" : ""}`}>
              {statusText}
            </div>
            {exportMatchesCurrent && videoUrl ? (
              <div className="asset-export-preview">
                <video
                  key={videoUrl}
                  src={videoUrl}
                  controls
                  preload="metadata"
                />
              </div>
            ) : null}
          </div>
        </aside>

        <div className="asset-preview-pane">
          <div className="pane-label">Live preview</div>
          <div className="preview-shell asset-player">
            <RevideoPreview
              ref={previewRef}
              instanceKey={`editor-${asset.id}`}
              variables={previewVariables}
              playing={false}
              controls
              quality={1}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldControl({
  field,
  value,
  onChange,
  onImage,
}: {
  field: AssetField;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  onImage: (file: File | null) => void;
}) {
  return (
    <label className="field">
      <span>{field.label}</span>
      {field.hint ? <small>{field.hint}</small> : null}

      {field.type === "textarea" ? (
        <textarea
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
        />
      ) : null}

      {field.type === "text" ? (
        <input
          type="text"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      ) : null}

      {field.type === "number" ? (
        <input
          type="number"
          step={field.step ?? "any"}
          min={field.min}
          max={field.max}
          value={Number(value ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      ) : null}

      {field.type === "color" ? (
        <input
          type="color"
          value={String(value ?? "#d8a11a")}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : null}

      {field.type === "select" ? (
        <DarkSelect
          value={String(value ?? "")}
          options={field.options || []}
          onChange={onChange}
        />
      ) : null}

      {field.type === "image" ? (
        <div className="image-field">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onImage(e.target.files?.[0] ?? null)}
          />
          {value ? (
            <img src={String(value)} alt="" className="image-thumb" />
          ) : (
            <span className="status">No image yet — upload one.</span>
          )}
        </div>
      ) : null}
    </label>
  );
}

function DarkSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string | number) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className={open ? "dark-select open" : "dark-select"} ref={rootRef}>
      <button
        type="button"
        className="dark-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{selected?.label ?? value}</span>
        <span className="dark-select-chevron" aria-hidden />
      </button>
      {open ? (
        <ul className="dark-select-menu" role="listbox">
          {options.map((opt) => (
            <li key={opt.value} role="option" aria-selected={opt.value === value}>
              <button
                type="button"
                className={opt.value === value ? "active" : undefined}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
