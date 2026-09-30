import React, { useEffect, useMemo, useState } from "react";
import type {
  AiAspect,
  AiCreateMode,
  AiStyle,
  MotionPlan,
} from "../../shared/ai/types";
import { AI_COMPOSE_ASSET_ID, estimateComposeSeconds, parseComposeJson } from "../../shared/ai/compose";
import { getAssetById } from "../assets/catalog";
import { RevideoPreview } from "../assets/RevideoPreview";
import type { AssetDefinition } from "../assets/types";
import {
  useFeatureFlags,
  withFeatureFlagVariables,
} from "../featureFlags";
import { defaultFormatId } from "../assets/videoFormats";
import { fetchAiStatus, requestMotionPlan } from "./api";

const STYLES: { id: AiStyle; label: string }[] = [
  { id: "any", label: "Any" },
  { id: "doc", label: "Documentary" },
  { id: "news", label: "News" },
  { id: "map", label: "Maps" },
  { id: "chart", label: "Charts" },
  { id: "yt", label: "YouTube" },
  { id: "shorts", label: "Shorts" },
  { id: "books", label: "Books" },
];

const MODES: { id: AiCreateMode; label: string; hint: string }[] = [
  { id: "auto", label: "Auto", hint: "Invent or reuse a template" },
  { id: "invent", label: "Create new", hint: "Always invent a custom graphic" },
  { id: "catalog", label: "Templates", hint: "Only existing assets" },
];

const LENGTHS = [
  { sec: 8, label: "8s" },
  { sec: 12, label: "12s" },
  { sec: 18, label: "18s" },
  { sec: 24, label: "24s" },
];

type Props = {
  onOpenEditor: (
    asset: AssetDefinition,
    props: Record<string, string | number>,
  ) => void;
};

export function PromptStudio({ onOpenEditor }: Props) {
  const flags = useFeatureFlags();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<AiStyle>("any");
  const [mode, setMode] = useState<AiCreateMode>("invent");
  const [lengthSec, setLengthSec] = useState(18);
  const [aspect, setAspect] = useState<AiAspect>("16:9");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<MotionPlan | null>(null);
  const [generationId, setGenerationId] = useState(0);
  const [apiReady, setApiReady] = useState<boolean | null>(null);
  const [apiHint, setApiHint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const status = await fetchAiStatus();
        if (cancelled) return;
        if (!status.enabled) {
          setApiReady(false);
          setApiHint("Server AI is off. Set FEATURE_AI=true and restart the API.");
          return;
        }
        if (!status.configured) {
          setApiReady(false);
          setApiHint("Add GEMINI_API_KEY to the server environment, then restart.");
          return;
        }
        setApiReady(true);
        setApiHint(null);
      } catch {
        if (cancelled) return;
        setApiReady(false);
        setApiHint("Cannot reach the API. Is the server running?");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const asset = plan ? getAssetById(plan.assetId) : undefined;

  const previewVars = useMemo(() => {
    if (!asset || !plan) return null;
    return withFeatureFlagVariables(
      {
        template: asset.template,
        bgTransparent: "off",
        frameFormat: defaultFormatId(asset.category),
        ...asset.defaults,
        ...plan.props,
      },
      flags,
    );
  }, [asset, plan, flags]);

  const previewSize = useMemo(() => {
    if (aspect === "9:16") return { width: 720, height: 1280 };
    return { width: asset?.width || 1280, height: asset?.height || 720 };
  }, [aspect, asset]);

  const previewDuration = useMemo(() => {
    if (!asset || !plan) return 12;
    if (plan.invented || asset.id === AI_COMPOSE_ASSET_ID) {
      return estimateComposeSeconds(
        parseComposeJson(plan.props.composeJson || asset.defaults.composeJson),
      );
    }
    return asset.durationInFrames / asset.fps;
  }, [asset, plan]);

  const previewKey = useMemo(() => {
    const json = String(plan?.props.composeJson || "");
    const propsSig = JSON.stringify(plan?.props || {});
    // Content hash so each new plan remounts the Revideo player.
    let hash = 0;
    const src = `${plan?.assetId}|${json}|${propsSig}|${aspect}`;
    for (let i = 0; i < src.length; i++) {
      hash = (hash * 31 + src.charCodeAt(i)) | 0;
    }
    return `ai-${plan?.assetId}-${aspect}-${plan?.invented ? "inv" : "cat"}-${generationId}-${hash}`;
  }, [plan, aspect, generationId]);

  async function onGenerate(event: React.FormEvent) {
    event.preventDefault();
    if (busy || apiReady === false) return;
    setBusy(true);
    setError(null);
    try {
      const next = await requestMotionPlan({
        prompt,
        style,
        lengthSec,
        aspect,
        mode,
      });
      setPlan(next);
      setGenerationId((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function swapAlternative(assetId: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const invent = assetId === AI_COMPOSE_ASSET_ID;
      const next = await requestMotionPlan({
        prompt: invent
          ? prompt
          : `${prompt}\n\nPrefer template id: ${assetId}`,
        style,
        lengthSec,
        aspect,
        mode: invent ? "invent" : "catalog",
      });
      setPlan(next);
      setGenerationId((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not swap template.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="prompt-studio">
      <div className="prompt-studio-head">
        <p className="assets-kicker">AI</p>
        <h2>Prompt to motion</h2>
        <p>
          Describe the exact motion you want. Create new builds a unique graphic
          from your prompt — not a recycled catalog template. Open in editor to
          tweak every beat.
        </p>
      </div>

      <div className="prompt-studio-grid">
        <form className="prompt-panel" onSubmit={onGenerate}>
          <label className="prompt-label" htmlFor="ai-prompt">
            Prompt
          </label>
          <textarea
            id="ai-prompt"
            className="prompt-textarea"
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Opening title about remote work, then 3 stats on hybrid teams, a compare of office vs remote, and a short outro"
            disabled={busy}
          />

          <div className="prompt-options">
            <div>
              <span className="prompt-label">Create</span>
              <div className="prompt-chips" role="group" aria-label="Create mode">
                {MODES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    title={item.hint}
                    className={
                      mode === item.id ? "prompt-chip on" : "prompt-chip"
                    }
                    onClick={() => setMode(item.id)}
                    disabled={busy}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="prompt-label">Style</span>
              <div className="prompt-chips" role="group" aria-label="Style">
                {STYLES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      style === item.id ? "prompt-chip on" : "prompt-chip"
                    }
                    onClick={() => setStyle(item.id)}
                    disabled={busy}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="prompt-option-row">
              <div>
                <span className="prompt-label">Length</span>
                <div className="prompt-chips" role="group" aria-label="Length">
                  {LENGTHS.map((item) => (
                    <button
                      key={item.sec}
                      type="button"
                      className={
                        lengthSec === item.sec
                          ? "prompt-chip on"
                          : "prompt-chip"
                      }
                      onClick={() => setLengthSec(item.sec)}
                      disabled={busy}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="prompt-label">Aspect</span>
                <div className="prompt-chips" role="group" aria-label="Aspect">
                  {(["16:9", "9:16"] as AiAspect[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={
                        aspect === item ? "prompt-chip on" : "prompt-chip"
                      }
                      onClick={() => setAspect(item)}
                      disabled={busy}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {apiHint ? (
            <p className="prompt-status warn" role="status">
              {apiHint}
            </p>
          ) : null}
          {error ? (
            <p className="prompt-status error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="prompt-actions">
            <button
              type="submit"
              className="prompt-generate"
              disabled={busy || apiReady === false || prompt.trim().length < 8}
            >
              {busy ? "Generating…" : "Generate"}
            </button>
          </div>

          {plan ? (
            <div className="prompt-plan-meta">
              <p className="prompt-rationale">{plan.rationale}</p>
              {asset ? (
                <p className="prompt-picked">
                  {plan.invented ? (
                    <span className="prompt-invented">New graphic</span>
                  ) : null}
                  Template: <strong>{asset.name}</strong>
                  <span> · {asset.category}</span>
                  {plan.invented ? (
                    <span>
                      {" "}
                      · ~{Math.round(previewDuration)}s ·{" "}
                      {parseComposeJson(
                        plan.props.composeJson || asset.defaults.composeJson,
                      ).beats
                        .map((b) => b.type)
                        .join(" → ")}
                    </span>
                  ) : null}
                </p>
              ) : (
                <p className="prompt-status error">
                  Planned asset “{plan.assetId}” is missing from the catalog.
                </p>
              )}
              {plan.alternatives.length > 0 ? (
                <div className="prompt-alts">
                  <span className="prompt-label">Try instead</span>
                  <div className="prompt-chips">
                    {plan.alternatives.map((id) => {
                      const alt = getAssetById(id);
                      if (!alt) return null;
                      return (
                        <button
                          key={id}
                          type="button"
                          className="prompt-chip"
                          onClick={() => void swapAlternative(id)}
                          disabled={busy}
                        >
                          {alt.id === AI_COMPOSE_ASSET_ID
                            ? "Create new graphic"
                            : alt.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </form>

        <div className="prompt-preview-panel">
          <div className="prompt-preview-top">
            <span className="prompt-label">Preview</span>
            {asset && plan ? (
              <button
                type="button"
                className="prompt-open-editor"
                onClick={() => onOpenEditor(asset, plan.props)}
              >
                Open in editor
              </button>
            ) : null}
          </div>
          <div className="prompt-preview-frame">
            {previewVars && asset ? (
              <RevideoPreview
                variables={previewVars}
                estimatedDuration={previewDuration}
                width={previewSize.width}
                height={previewSize.height}
                instanceKey={previewKey}
                controls
                playing
              />
            ) : (
              <div className="prompt-preview-empty">
                <p>Your generated clip will preview here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
