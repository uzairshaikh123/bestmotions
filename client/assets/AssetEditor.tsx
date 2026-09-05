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
import type { AssetDefinition, AssetField, AssetFieldColumn } from "./types";
import {
  columnsForField,
  parsePipeRows,
  serializePipeRows,
  TIMING_FIELD_KEYS,
  emptyPipeRow,
} from "./pipeField";
import {
  VIDEO_FORMATS,
  defaultFormatId,
  formatById,
  formatOrientation,
} from "./videoFormats";

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

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

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
  const [props, setProps] = useState<Record<string, string | number>>(() => ({
    bgTransparent: "off",
    frameFormat: defaultFormatId(asset.category),
    ...asset.defaults,
  }));
  const previewRef = useRef<RevideoPreviewHandle>(null);
  const [phase, setPhase] = useState<ExportPhase>("idle");
  const [exportError, setExportError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [exportedKey, setExportedKey] = useState<string | null>(null);
  const videoUrlRef = useRef<string | null>(null);

  const busy = phase === "rendering" || phase === "downloading";

  const [timingOpen, setTimingOpen] = useState(false);

  const visibleFields = useMemo(
    () =>
      asset.fields.filter(
        (field) => flags.videoSound || field.key !== "sound",
      ),
    [asset.fields, flags.videoSound],
  );

  const contentFields = useMemo(
    () => visibleFields.filter((field) => !TIMING_FIELD_KEYS.has(field.key)),
    [visibleFields],
  );

  const timingFields = useMemo(
    () => visibleFields.filter((field) => TIMING_FIELD_KEYS.has(field.key)),
    [visibleFields],
  );

  async function onImageChange(key: string, file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      setExportError("Please upload a PNG, JPG, or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setExportError("Image is too large — use a file under 8 MB.");
      return;
    }
    setExportError(null);
    const url = await readFileAsDataUrl(file);
    setField(key, url);
  }

  const variables = useMemo(
    () =>
      withFeatureFlagVariables(
        {
          template: asset.template,
          ...props,
          ...(String(props.bgTransparent ?? "off") === "on"
            ? { bg: "rgba(0,0,0,0)" }
            : null),
        },
        flags,
      ),
    [asset.template, props, flags],
  );

  const [previewVariables, setPreviewVariables] = useState(variables);

  useEffect(() => {
    const frameFormat = defaultFormatId(asset.category);
    const next = withFeatureFlagVariables(
      {
        template: asset.template,
        bgTransparent: "off",
        frameFormat,
        ...asset.defaults,
      },
      flags,
    );
    setProps({
      bgTransparent: "off",
      frameFormat,
      ...asset.defaults,
    });
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

  const [exportedExt, setExportedExt] = useState<"mp4" | "webm">("mp4");
  const transparentBg = String(props.bgTransparent ?? "off") === "on";
  const format = formatById(
    props.frameFormat ?? defaultFormatId(asset.category),
  );
  const formatShape = formatOrientation(format);
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
    const { blob, ext } = await recordCanvas(canvas, seconds * 1000, 30, {
      alpha: String(props.bgTransparent ?? "off") === "on",
    });
    handle.pause();
    handle.seek(0);
    const url = URL.createObjectURL(blob);
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    videoUrlRef.current = url;
    if (keyAtStart === currentKeyRef.current) {
      setVideoUrl(url);
      setExportedKey(keyAtStart);
      setExportedExt(ext);
    }
    const base = videoFilename(asset.name, asset.id)
      .replace(/\.mp4$/i, "")
      .concat(`-${format.width}x${format.height}`);
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
        a.download = videoFilename(asset.name, asset.id)
          .replace(/\.mp4$/i, "")
          .concat(`-${format.width}x${format.height}.${exportedExt}`);
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

  const formatLabel = transparentBg ? "WebM" : "MP4";
  const primaryLabel =
    phase === "rendering"
      ? `Rendering ${formatLabel}…`
      : phase === "downloading"
        ? "Downloading…"
        : phase === "done" && exportMatchesCurrent
          ? "Download again"
          : exportMatchesCurrent
            ? `Download ${formatLabel}`
            : `Export & download ${formatLabel}`;

  const statusText = exportError
    ? exportError
    : phase === "rendering"
      ? transparentBg
        ? "Recording a transparent WebM from the live preview…"
        : "Recording the live preview in your browser…"
      : phase === "downloading"
        ? "Saving the video to your Downloads folder…"
        : phase === "done" && exportMatchesCurrent
          ? "Download started. You can download again without re-recording until you change settings."
          : exportMatchesCurrent
            ? "Ready — this take is cached for these settings."
            : videoUrl
              ? "Settings changed — next click will record again, then download."
              : transparentBg
                ? "Transparent clips export as WebM so you can overlay them on other footage."
                : "Click Export to record the preview in your browser (no server render).";

  return (
    <section className="asset-editor">
      <div className="asset-editor-top">
        <div className="asset-editor-actions">
          <button type="button" className="secondary" onClick={onBack}>
            Back to library
          </button>
        </div>
        <div>
          <p className="assets-kicker">{asset.category}</p>
          <h2>{asset.name}</h2>
          <p>{asset.description}</p>
        </div>
      </div>

      <div className="asset-editor-grid">
        <aside className="asset-controls">
          <div className="pane-label">Styles</div>
          <p className="control-hint">
            Tweak copy, color, and timing. The preview updates live — then
            export from this panel.
          </p>

          <div className="field">
            <span>Frame size</span>
            <small>
              Every template scales to this canvas. Export matches the selected
              pixels.
            </small>
            <div className="format-grid" role="listbox" aria-label="Video frame size">
              {VIDEO_FORMATS.map((option) => {
                const shape = formatOrientation(option);
                const active = option.id === format.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={
                      active ? `format-card active ${shape}` : `format-card ${shape}`
                    }
                    onClick={() => setField("frameFormat", option.id)}
                  >
                    <span
                      className="format-card-frame"
                      style={{
                        aspectRatio: `${option.width} / ${option.height}`,
                      }}
                    />
                    <div className="format-card-copy">
                      <strong>{option.ratio}</strong>
                      <em>
                        {option.width}×{option.height}
                      </em>
                      <small>{option.hint}</small>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {contentFields.map((field) => (
            <FieldControl
              key={field.key}
              field={field}
              value={props[field.key]}
              onChange={(v) => setField(field.key, v)}
              onImage={(file) => onImageChange(field.key, file)}
            />
          ))}

          <div className="switch-field">
            <span>
              Transparent overlay
              <small>Export as WebM so you can stack this on other footage.</small>
            </span>
            <button
              type="button"
              role="switch"
              className={transparentBg ? "switch on" : "switch"}
              aria-checked={transparentBg}
              onClick={() => setField("bgTransparent", transparentBg ? "off" : "on")}
            />
          </div>

          {timingFields.length > 0 ? (
            <div className="timing-fold">
              <button
                type="button"
                className="timing-fold-toggle"
                aria-expanded={timingOpen}
                onClick={() => setTimingOpen((open) => !open)}
              >
                <span>Timing & motion</span>
                <span className="timing-fold-chevron" data-open={timingOpen} />
              </button>
              {timingOpen
                ? timingFields.map((field) => (
                    <FieldControl
                      key={field.key}
                      field={field}
                      value={props[field.key]}
                      onChange={(v) => setField(field.key, v)}
                      onImage={(file) => onImageChange(field.key, file)}
                    />
                  ))
                : null}
            </div>
          ) : null}

          <button
            type="button"
            className="secondary"
            onClick={() => {
              setProps({
                bgTransparent: "off",
                frameFormat: defaultFormatId(asset.category),
                ...asset.defaults,
              });
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
            <button type="button" className="btn-cta" onClick={onDownloadMp4} disabled={busy}>
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
                  style={{ aspectRatio: `${format.width} / ${format.height}` }}
                />
              </div>
            ) : null}
          </div>
        </aside>

        <div className="asset-preview-pane">
          <div className="pane-label preview-pane-label">
            <span>Live preview</span>
            <span className="preview-size-tag">
              {format.ratio} · {format.width}×{format.height}
            </span>
          </div>
          <div
            className={
              [
                "preview-shell asset-player",
                transparentBg ? "transparent-bg" : "",
                `player-${formatShape}`,
              ]
                .filter(Boolean)
                .join(" ")
            }
          >
            <RevideoPreview
              ref={previewRef}
              instanceKey={`editor-${asset.id}-${format.id}`}
              variables={previewVariables}
              playing={false}
              controls
              quality={1}
              width={format.width}
              height={format.height}
              estimatedDuration={asset.durationInFrames / Math.max(asset.fps, 1)}
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
  const columns = field.type === "textarea" ? columnsForField(field) : null;
  const highlightHint =
    /highlight|underline|callout/i.test(field.key) && !field.hint
      ? "Must appear in the text above — the marker, underline, or circle snaps to this exact phrase."
      : field.hint && columns
        ? undefined
        : field.hint;

  const Tag = columns ? "div" : "label";

  return (
    <Tag className="field">
      <span>{field.label}</span>
      {highlightHint ? <small>{highlightHint}</small> : null}
      {columns ? (
        <small>Add or edit rows — no need to type | separators.</small>
      ) : null}

      {columns ? (
        <PipeRowsEditor
          columns={columns}
          value={String(value ?? "")}
          onChange={onChange}
        />
      ) : null}

      {field.type === "textarea" && !columns ? (
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
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => onImage(e.target.files?.[0] ?? null)}
          />
          {value ? (
            <img src={String(value)} alt="" className="image-thumb" />
          ) : (
            <span className="status">No image yet — upload one.</span>
          )}
        </div>
      ) : null}
    </Tag>
  );
}

function PipeRowsEditor({
  columns,
  value,
  onChange,
}: {
  columns: AssetFieldColumn[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [rows, setRows] = useState(() => parsePipeRows(value, columns));
  const synced = useRef(value);

  useEffect(() => {
    if (value === synced.current) return;
    synced.current = value;
    setRows(parsePipeRows(value, columns));
  }, [value, columns]);

  function commit(next: string[][]) {
    setRows(next);
    const serialized = serializePipeRows(next);
    synced.current = serialized;
    onChange(serialized);
  }

  function setCell(rowIndex: number, colIndex: number, cell: string) {
    const next = rows.map((row) => [...row]);
    next[rowIndex][colIndex] = cell;
    commit(next);
  }

  return (
    <div
      className="pair-editor"
      style={{ ["--cols" as string]: String(columns.length) }}
    >
      <div className="pair-editor-head">
        {columns.map((col) => (
          <span key={col.label}>{col.label}</span>
        ))}
        <span className="pair-editor-spacer" />
      </div>
      {rows.map((row, rowIndex) => (
        <div className="pair-editor-row" key={rowIndex}>
          {columns.map((col, colIndex) =>
            col.kind === "color" ? (
              <input
                key={col.label}
                type="color"
                value={row[colIndex] || "#d8a11a"}
                onChange={(e) => setCell(rowIndex, colIndex, e.target.value)}
                aria-label={`${col.label} ${rowIndex + 1}`}
              />
            ) : (
              <input
                key={col.label}
                type={col.kind === "number" ? "number" : "text"}
                step={col.kind === "number" ? "any" : undefined}
                value={row[colIndex] ?? ""}
                placeholder={col.label}
                onChange={(e) => setCell(rowIndex, colIndex, e.target.value)}
                aria-label={`${col.label} ${rowIndex + 1}`}
              />
            ),
          )}
          <button
            type="button"
            className="tiny pair-remove"
            disabled={rows.length <= 1}
            onClick={() => commit(rows.filter((_, i) => i !== rowIndex))}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="secondary tiny"
        onClick={() =>
          commit([...rows, emptyPipeRow(columns, rows.length)])
        }
      >
        + Add row
      </button>
    </div>
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
