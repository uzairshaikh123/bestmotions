import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiUrl } from "../backend";
import { DownloadVideoButton } from "../DownloadVideoButton";
import { downloadVideo, videoFilename } from "../downloadVideo";
import { RevideoPreview } from "./RevideoPreview";
import type { AssetDefinition, AssetField } from "./types";

type Props = {
  asset: AssetDefinition;
  onBack: () => void;
};

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

export function AssetEditor({ asset, onBack }: Props) {
  const [props, setProps] = useState<Record<string, string | number>>({
    ...asset.defaults,
  });
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [exportedKey, setExportedKey] = useState<string | null>(null);

  async function onImageChange(key: string, file: File | null) {
    if (!file) return;
    const url = await readFileAsDataUrl(file);
    setField(key, url);
  }

  const variables = useMemo(
    () => ({
      template: asset.template,
      ...props,
    }),
    [asset.template, props],
  );

  // Debounce live preview vars so typing doesn't thrash scene reloads
  const [previewVariables, setPreviewVariables] = useState(variables);

  useEffect(() => {
    const next = { template: asset.template, ...asset.defaults };
    setProps({ ...asset.defaults });
    setPreviewVariables(next);
    setVideoUrl(null);
    setExportedKey(null);
    setExportError(null);
  }, [asset.id]);

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
  }

  async function renderCurrentSettings(): Promise<string> {
    const keyAtStart = currentKeyRef.current;
    const res = await fetch(apiUrl("/api/revideo-render"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        variables: {
          template: asset.template,
          ...props,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Could not export video.");
    }
    const url = data.videoUrl as string;
    if (keyAtStart === currentKeyRef.current) {
      setVideoUrl(url);
      setExportedKey(keyAtStart);
    }
    return url;
  }

  async function onDownloadMp4() {
    setExportError(null);
    setExporting(true);
    try {
      const url = exportMatchesCurrent
        ? (videoUrl as string)
        : await renderCurrentSettings();
      await downloadVideo(url, videoFilename(asset.name, asset.id));
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }

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
          <button type="button" onClick={onDownloadMp4} disabled={exporting}>
            {exporting
              ? "Rendering MP4…"
              : exportMatchesCurrent
                ? "Download MP4"
                : "Export & download MP4"}
          </button>
        </div>
      </div>

      <div className="asset-editor-grid">
        <aside className="asset-controls">
          <div className="pane-label">Customize</div>
          <p className="control-hint">
            Edit text and colors below — preview updates live. Download always
            uses your latest settings.
          </p>

          {asset.fields.map((field) => (
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
              setVideoUrl(null);
              setExportedKey(null);
            }}
          >
            Reset to defaults
          </button>

          <button type="button" onClick={onDownloadMp4} disabled={exporting}>
            {exporting
              ? "Rendering MP4…"
              : exportMatchesCurrent
                ? "Download MP4"
                : "Export & download MP4"}
          </button>
          <div className={`status ${exportError ? "error" : ""}`}>
            {exportError ||
              (exporting
                ? "Rendering with your current settings…"
                : exportMatchesCurrent
                  ? "Latest settings exported — download is instant until you change something."
                  : videoUrl
                    ? "Settings changed — next download will re-export the new version."
                    : "")}
          </div>
          {exportMatchesCurrent && videoUrl ? (
            <div className="asset-export-preview">
              <video src={apiUrl(videoUrl)} controls preload="metadata" />
              <DownloadVideoButton videoUrl={videoUrl} title={asset.name} />
            </div>
          ) : null}
        </aside>

        <div className="asset-preview-pane">
          <div className="pane-label">Live preview</div>
          <div className="preview-shell asset-player">
            <RevideoPreview
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
        <select
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        >
          {(field.options || []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
