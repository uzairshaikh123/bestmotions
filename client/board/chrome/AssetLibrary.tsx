import React, { useMemo, useRef, useState } from "react";
import type { ChartKind, ElementType } from "../../../shared/board";
import { DEFAULT_CHART_DATA } from "../../../shared/board";
import { ASSETS, CATEGORIES } from "../../assets/catalog";
import { clearAssetDrag, setAssetDrag } from "./assetDrag";
import { Icon, LIBRARY_ICONS, iconDataUrl } from "./icons";
import { FULL_BODY_AVATARS } from "./avatars";

type Tab =
  | "assets"
  | "text"
  | "icons"
  | "images"
  | "charts"
  | "templates"
  | "videos"
  | "audio"
  | "background"
  | "uploads";

type Props = {
  onAdd: (type: ElementType, extra?: Record<string, unknown>) => void;
  onBackground: (color: string) => void;
  onUpload: (dataUrl: string) => void;
  background?: string;
};

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "assets", label: "Assets", icon: "assets" },
  { id: "text", label: "Text", icon: "text" },
  { id: "icons", label: "Icons", icon: "icons" },
  { id: "images", label: "Images", icon: "images" },
  { id: "charts", label: "Charts", icon: "charts" },
  { id: "templates", label: "Templates", icon: "templates" },
  { id: "videos", label: "Videos", icon: "videos" },
  { id: "audio", label: "Audio", icon: "audio" },
  { id: "background", label: "Background", icon: "background" },
  { id: "uploads", label: "Uploads", icon: "uploads" },
];

const SHAPES: { type: ElementType; label: string; icon: string }[] = [
  { type: "rectangle", label: "Rectangle", icon: "rect" },
  { type: "circle", label: "Circle", icon: "circle" },
  { type: "triangle", label: "Triangle", icon: "triangle" },
  { type: "line", label: "Line", icon: "line" },
  { type: "arrow", label: "Arrow", icon: "arrow" },
  { type: "star", label: "Star", icon: "star" },
];

const ELEMENTS = ["💡", "💬", "🌐", "🖼️", "🎬", "💻"];
const ICONS = ["⚙️", "📊", "🎯", "🔔", "⭐", "❤️", "🚀", "📌"];
const BACKGROUNDS = ["#ffffff", "#f4f2ff", "#0b0b12", "#111827", "#7c5cfc", "#0c1f18"];
const IMAGE_SWATCHES = ["#c7b9ff", "#9ad7c2", "#f2c9a0", "#8cb4ff", "#f0b8c8", "#d9e2a8"];

function chartKindFromAsset(id: string): ChartKind {
  if (id.includes("pie")) return "pie";
  if (id.includes("line") || id.includes("area") || id.includes("stock")) return "line";
  if (id.includes("stat") || id.includes("counter")) return "stat";
  return "bar";
}

const BOARD_CHARTS: { kind: ChartKind; label: string }[] = [
  { kind: "bar", label: "Bar chart" },
  { kind: "pie", label: "Pie chart" },
  { kind: "line", label: "Line chart" },
  { kind: "stat", label: "Stat counter" },
];

function AssetTile({
  type,
  extra,
  className,
  title,
  onAdd,
  children,
}: {
  type: ElementType;
  extra?: Record<string, unknown>;
  className?: string;
  title?: string;
  onAdd: Props["onAdd"];
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      title={title ?? "Drag onto the canvas or timeline"}
      draggable
      onDragStart={(e) => setAssetDrag(e, type, extra ?? {})}
      onDragEnd={() => window.setTimeout(clearAssetDrag, 50)}
      onClick={() => onAdd(type, extra)}
    >
      {children}
    </button>
  );
}

function UploadBox({
  fileRef,
  onFile,
}: {
  fileRef: React.RefObject<HTMLInputElement>;
  onFile: (file: File | null) => void;
}) {
  return (
    <>
      <div
        className="mb-drop"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files[0] || null);
        }}
      >
        Drag & drop or click to upload
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          onFile(e.target.files?.[0] || null);
          e.target.value = "";
        }}
      />
    </>
  );
}

export function AssetLibrary({ onAdd, onBackground, onUpload, background = "#ffffff" }: Props) {
  const [tab, setTab] = useState<Tab>("assets");
  const [q, setQ] = useState("");
  const [templateCat, setTemplateCat] = useState<string>("charts");
  const fileRef = useRef<HTMLInputElement>(null);
  const query = q.trim().toLowerCase();

  const shapes = useMemo(
    () => SHAPES.filter((s) => s.label.toLowerCase().includes(query) || !query),
    [query],
  );

  const templates = useMemo(() => {
    return ASSETS.filter((a) => {
      if (templateCat !== "all" && a.category !== templateCat) return false;
      if (!query) return true;
      const blob = `${a.name} ${a.category} ${a.description}`.toLowerCase();
      return blob.includes(query);
    }).slice(0, 80);
  }, [query, templateCat]);

  function readFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpload(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <aside className="mb-library">
      <nav className="mb-rail" aria-label="Libraries">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? "on" : ""}
            title={t.label}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} size={18} />
            {t.label}
          </button>
        ))}
      </nav>
      <div className="mb-lib-body">
        <input
          className="mb-search"
          placeholder="Search assets..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {tab === "assets" ? (
          <>
            <h4>Shapes</h4>
            <div className="mb-shape-grid">
              {shapes.map((s) => (
                <AssetTile key={s.label} type={s.type} onAdd={onAdd}>
                  <Icon name={s.icon} size={20} />
                  <span>{s.label}</span>
                </AssetTile>
              ))}
            </div>
            <h4>Elements</h4>
            <div className="mb-emoji-grid">
              {ELEMENTS.map((e) => (
                <AssetTile
                  key={e}
                  type="text"
                  extra={{ content: e, fontSize: 48, width: 64, height: 64, name: "Element" }}
                  onAdd={onAdd}
                >
                  {e}
                </AssetTile>
              ))}
            </div>
            <h4>Characters</h4>
            <div className="mb-char-grid">
              {FULL_BODY_AVATARS.map((avatar) => (
                <AssetTile
                  key={avatar.id}
                  type="image"
                  extra={{
                    src: avatar.src,
                    width: 110,
                    height: 196,
                    name: avatar.name,
                    fill: "#ffffff",
                    strokeWidth: 0,
                  }}
                  onAdd={onAdd}
                  title={avatar.name}
                >
                  <img src={avatar.src} alt={avatar.name} />
                  <span>{avatar.name}</span>
                </AssetTile>
              ))}
            </div>
            <h4>Icons</h4>
            <div className="mb-emoji-grid">
              {ICONS.map((e) => (
                <AssetTile
                  key={e}
                  type="text"
                  extra={{ content: e, fontSize: 36, width: 48, height: 48, name: "Icon" }}
                  onAdd={onAdd}
                >
                  {e}
                </AssetTile>
              ))}
            </div>
            <h4>Images</h4>
            <div className="mb-image-grid">
              {IMAGE_SWATCHES.map((c, i) => (
                <AssetTile
                  key={c}
                  type="rectangle"
                  extra={{ fill: c, width: 280, height: 180, name: `Image ${i + 1}`, strokeWidth: 0 }}
                  onAdd={onAdd}
                >
                  <span className="mb-swatch" style={{ background: c }} />
                </AssetTile>
              ))}
            </div>
            <UploadBox fileRef={fileRef} onFile={readFile} />
          </>
        ) : null}

        {tab === "text" ? (
          <>
            <h4>Text</h4>
            <AssetTile
              className="mb-ghost-wide"
              type="text"
              extra={{ content: "Headline", fontSize: 48, width: 360, height: 64, name: "Headline" }}
              onAdd={onAdd}
            >
              Headline
            </AssetTile>
            <AssetTile
              className="mb-ghost-wide"
              type="text"
              extra={{ content: "Subheading", fontSize: 28, width: 320, height: 40, name: "Subheading" }}
              onAdd={onAdd}
            >
              Subheading
            </AssetTile>
            <AssetTile
              className="mb-ghost-wide"
              type="text"
              extra={{ content: "Body copy for your scene.", fontSize: 18, width: 360, height: 80, name: "Body" }}
              onAdd={onAdd}
            >
              Body
            </AssetTile>
          </>
        ) : null}

        {tab === "icons" ? (
          <div className="mb-emoji-grid">
            {LIBRARY_ICONS.filter(
              (i) => !query || i.label.toLowerCase().includes(query),
            ).map((item) => (
              <AssetTile
                key={item.id}
                type="image"
                extra={{
                  src: iconDataUrl(item.Icon),
                  width: 72,
                  height: 72,
                  name: item.label,
                  fill: "#ffffff",
                  strokeWidth: 0,
                }}
                onAdd={onAdd}
                title={item.label}
              >
                <item.Icon size={22} />
              </AssetTile>
            ))}
          </div>
        ) : null}

        {tab === "images" || tab === "uploads" ? (
          <UploadBox fileRef={fileRef} onFile={readFile} />
        ) : null}

        {tab === "charts" ? (
          <>
            <h4>Chart animations</h4>
            <p className="mb-muted">Bars, pie, line, and counters animate on the timeline.</p>
            <div className="mb-shape-grid">
              {BOARD_CHARTS.map((c) => (
                <AssetTile
                  key={c.kind}
                  type="chart"
                  extra={{
                    chartKind: c.kind,
                    chartData: DEFAULT_CHART_DATA[c.kind],
                    name: c.label,
                    fill: "#101018",
                    strokeWidth: 0,
                    width: 420,
                    height: 260,
                    content: c.kind === "stat" ? "%" : undefined,
                    motion: { preset: "none", durationMs: 1600, delayMs: 0 },
                  }}
                  onAdd={onAdd}
                >
                  <Icon name="charts" size={20} />
                  <span>{c.label}</span>
                </AssetTile>
              ))}
            </div>
          </>
        ) : null}

        {tab === "templates" ? (
          <>
            <h4>Frontpage templates</h4>
            <div className="mb-cat-row">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={templateCat === c.id ? "on" : ""}
                  onClick={() => setTemplateCat(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="mb-template-list">
              {templates.map((asset) => (
                <AssetTile
                  key={asset.id}
                  className="mb-template-tile"
                  type={asset.category === "charts" ? "chart" : "template"}
                  extra={
                    asset.category === "charts"
                      ? {
                          chartKind: chartKindFromAsset(asset.id),
                          chartData: String(asset.defaults.data || DEFAULT_CHART_DATA.bar),
                          name: asset.name,
                          fill: String(asset.defaults.bg || "#101018"),
                          strokeWidth: 0,
                          width: 420,
                          height: 260,
                          motion: {
                            preset: "none",
                            durationMs: Math.round((asset.durationInFrames / asset.fps) * 1000),
                            delayMs: 0,
                          },
                        }
                      : {
                          name: asset.name,
                          templateId: asset.id,
                          revideoTemplate: asset.template,
                          variables: { ...asset.defaults, template: asset.template },
                          fill: String(asset.defaults.bg || "#111827"),
                          strokeWidth: 0,
                          width: 480,
                          height: 270,
                          motion: {
                            preset: "fadeIn",
                            durationMs: Math.round((asset.durationInFrames / asset.fps) * 1000),
                            delayMs: 0,
                          },
                        }
                  }
                  onAdd={onAdd}
                  title={asset.description}
                >
                  <span className="mb-swatch" style={{ background: asset.accent }} />
                  <span>{asset.name}</span>
                </AssetTile>
              ))}
            </div>
          </>
        ) : null}

        {tab === "videos" || tab === "audio" ? (
          <p className="mb-muted">
            {tab === "videos" ? "Video clips" : "Audio"} attach on export in a later pass.
          </p>
        ) : null}

        {tab === "background" ? (
          <>
            <h4>Canvas background</h4>
            <label className="mb-bg-picker-wide">
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(background) ? background : "#ffffff"}
                onChange={(e) => onBackground(e.target.value)}
              />
              Custom color
            </label>
            <div className="mb-bg-grid">
              {BACKGROUNDS.map((c) => (
                <button
                  key={c}
                  type="button"
                  style={{ background: c }}
                  aria-label={c}
                  onClick={() => onBackground(c)}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </aside>
  );
}
