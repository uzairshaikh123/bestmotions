import React, { useEffect, useState } from "react";
import { AssetEditor } from "./assets/AssetEditor";
import { AssetGallery } from "./assets/AssetGallery";
import { getAssetById } from "./assets/catalog";
import type { AssetDefinition } from "./assets/types";
import { readAppUrl, writeAppUrl, type AppTab } from "./urlState";

export function App() {
  const initial = readAppUrl();
  const [tab, setTab] = useState<AppTab>(initial.tab);
  const [assetCategory, setAssetCategory] = useState(initial.category);
  const [assetQuery, setAssetQuery] = useState(initial.q);
  const [selectedAsset, setSelectedAsset] = useState<AssetDefinition | null>(
    () => (initial.assetId ? getAssetById(initial.assetId) || null : null),
  );
  const [lastAssetId, setLastAssetId] = useState<string | null>(initial.assetId);

  useEffect(() => {
    writeAppUrl(
      {
        tab,
        category: assetCategory,
        q: assetQuery,
        assetId: tab === "assets" ? (selectedAsset?.id ?? null) : null,
      },
      "replace",
    );
  }, [tab, assetCategory, assetQuery, selectedAsset]);

  useEffect(() => {
    function onPopState() {
      const next = readAppUrl();
      setTab(next.tab);
      setAssetCategory(next.category);
      setAssetQuery(next.q);
      setSelectedAsset(next.assetId ? getAssetById(next.assetId) || null : null);
      if (next.assetId) setLastAssetId(next.assetId);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function goTab(next: AppTab) {
    setTab(next);
    if (next === "assets") {
      setSelectedAsset(null);
    }
    writeAppUrl(
      {
        tab: next,
        category: assetCategory,
        q: assetQuery,
        assetId: null,
      },
      "push",
    );
  }

  function openAsset(asset: AssetDefinition) {
    setSelectedAsset(asset);
    setLastAssetId(asset.id);
    setTab("assets");
    writeAppUrl(
      {
        tab: "assets",
        category: assetCategory,
        q: assetQuery,
        assetId: asset.id,
      },
      "push",
    );
  }

  function backToGallery() {
    setSelectedAsset(null);
    writeAppUrl(
      {
        tab: "assets",
        category: assetCategory,
        q: assetQuery,
        assetId: null,
      },
      "push",
    );
  }

  return (
    <div className="app">
      <header className="top">
        <button
          type="button"
          className="brand-home"
          onClick={() => goTab("assets")}
          aria-label="BestMotions home — Assets"
        >
          <h1 className="brand compact">
            Best<span>Motions</span>
          </h1>
        </button>
        <nav className="tabs" aria-label="Main">
          <button
            type="button"
            className={tab === "assets" ? "tab active" : "tab"}
            onClick={() => goTab("assets")}
          >
            Assets
          </button>
          <button
            type="button"
            className={tab === "prompt" ? "tab active" : "tab"}
            onClick={() => goTab("prompt")}
          >
            AI
            <span className="tab-soon">Soon</span>
          </button>
        </nav>
      </header>

      {tab === "prompt" ? (
        <section className="coming-soon-page">
          <p className="coming-soon-kicker">AI generation</p>
          <h2 className="coming-soon-title">Coming soon</h2>
          <p className="coming-soon-copy">
            Prompt-to-video is on the way. For now, browse Assets, play
            previews on the grid, and customize templates — no login or signup
            required.
          </p>
          <button type="button" onClick={() => goTab("assets")}>
            Browse assets
          </button>
        </section>
      ) : null}

      {tab === "assets" ? (
        selectedAsset ? (
          <AssetEditor asset={selectedAsset} onBack={backToGallery} />
        ) : (
          <AssetGallery
            category={assetCategory}
            query={assetQuery}
            highlightAssetId={lastAssetId}
            onCategoryChange={setAssetCategory}
            onQueryChange={setAssetQuery}
            onSelect={openAsset}
          />
        )
      ) : null}
    </div>
  );
}
