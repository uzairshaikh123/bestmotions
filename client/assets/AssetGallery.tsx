import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  useFeatureFlags,
  withFeatureFlagVariables,
} from "../featureFlags";
import { ASSETS, CATEGORIES, CHART_SUBCATEGORIES } from "./catalog";
import { RevideoPreview } from "./RevideoPreview";
import type { AssetDefinition } from "./types";

type Props = {
  category: string;
  subcategory: string;
  query: string;
  highlightAssetId?: string | null;
  onCategoryChange: (category: string) => void;
  onSubcategoryChange: (subcategory: string) => void;
  onQueryChange: (query: string) => void;
  onSelect: (asset: AssetDefinition) => void;
};

function variablesFor(
  asset: AssetDefinition,
  flags: ReturnType<typeof useFeatureFlags>,
) {
  return withFeatureFlagVariables(
    {
      template: asset.template,
      ...asset.defaults,
    },
    flags,
  );
}

export function AssetGallery({
  category,
  subcategory,
  query,
  highlightAssetId,
  onCategoryChange,
  onSubcategoryChange,
  onQueryChange,
  onSelect,
}: Props) {
  const flags = useFeatureFlags();
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ASSETS.filter((a) => {
      const catOk = category === "all" || a.category === category;
      if (!catOk) return false;
      if (
        category === "charts" &&
        subcategory !== "all" &&
        a.subcategory !== subcategory
      ) {
        return false;
      }
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.subcategory || "").toLowerCase().includes(q)
      );
    });
  }, [category, subcategory, query]);

  useEffect(() => {
    if (!highlightAssetId) return;
    const el = cardRefs.current[highlightAssetId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightAssetId, items]);

  useEffect(() => {
    setPlayingId(null);
  }, [category, subcategory, query]);

  return (
    <section className="assets-page">
      <div className="assets-intro">
        <h2>Motion assets</h2>
        <p>
          Browse {ASSETS.length} Revideo templates across categories — play a
          preview, customize fields, and export MP4. No account needed.
        </p>
      </div>

      <div className="assets-toolbar">
        <input
          className="asset-search"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search assets…"
          aria-label="Search assets"
        />
        <div className="category-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={category === cat.id ? "chip active" : "chip"}
              onClick={() => onCategoryChange(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {category === "charts" ? (
          <div className="category-row subcategory-row">
            {CHART_SUBCATEGORIES.map((sub) => (
              <button
                key={sub.id}
                type="button"
                className={subcategory === sub.id ? "chip sub active" : "chip sub"}
                onClick={() => onSubcategoryChange(sub.id)}
              >
                {sub.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="status">
          No assets match this filter. Clear search or pick All.
        </p>
      ) : (
        <div className="asset-grid">
          {items.map((asset) => {
            const playing = playingId === asset.id;
            return (
              <article
                key={asset.id}
                className={
                  asset.id === highlightAssetId
                    ? "asset-card highlighted"
                    : "asset-card"
                }
                style={{ ["--accent" as string]: asset.accent }}
                ref={(node) => {
                  cardRefs.current[asset.id] = node;
                }}
              >
                <div className="asset-thumb asset-thumb-live">
                  {playing ? (
                    <div className="asset-thumb-player">
                      <RevideoPreview
                        instanceKey={`gallery-${asset.id}`}
                        variables={variablesFor(asset, flags)}
                        playing
                        muted
                        controls={false}
                        quality={0.5}
                      />
                    </div>
                  ) : (
                    <span className="asset-thumb-mark" aria-hidden />
                  )}
                  <span className="asset-cat">
                    {asset.subcategory
                      ? `${asset.category} · ${asset.subcategory}`
                      : asset.category}
                  </span>
                  <button
                    type="button"
                    className={
                      playing ? "thumb-play active corner" : "thumb-play"
                    }
                    aria-label={
                      playing ? `Pause ${asset.name}` : `Play ${asset.name}`
                    }
                    onClick={() =>
                      setPlayingId((id) => (id === asset.id ? null : asset.id))
                    }
                  >
                    {playing ? (
                      <span className="thumb-play-icon pause" />
                    ) : (
                      <span className="thumb-play-icon play" />
                    )}
                  </button>
                </div>
                <div className="asset-card-body">
                  <h3>{asset.name}</h3>
                  <p>{asset.description}</p>
                  <button
                    type="button"
                    className="thumb-customize"
                    onClick={() => onSelect(asset)}
                  >
                    Customize
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
