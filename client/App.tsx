import React, { useEffect, useState } from "react";
import { AssetEditor } from "./assets/AssetEditor";
import { AssetGallery } from "./assets/AssetGallery";
import { getAssetById } from "./assets/catalog";
import {
  listSavedAssetIds,
  removeSavedAsset,
  toggleSavedAsset,
} from "./assets/savedAssets";
import type { AssetDefinition } from "./assets/types";
import { BoardApp } from "./board/BoardApp";
import { BrandLogo } from "./BrandLogo";
import { isBoardEnabled } from "./featureFlags";
import { readAppUrl, writeAppUrl, type AppTab, type AssetSort } from "./urlState";

type ToastState = { message: string; id: number } | null;

export function App() {
  const boardEnabled = isBoardEnabled();
  const initial = readAppUrl();
  const [tab, setTab] = useState<AppTab>(() => {
    if (initial.tab === "prompt") return "prompt";
    if (initial.tab === "board") return "board";
    if (initial.tab === "saved") return "saved";
    return "assets";
  });
  const [assetCategory, setAssetCategory] = useState(initial.category);
  const [chartSubcategory, setChartSubcategory] = useState(initial.subcategory);
  const [assetQuery, setAssetQuery] = useState(initial.q);
  const [assetSort, setAssetSort] = useState<AssetSort>(initial.sort);
  const [selectedAsset, setSelectedAsset] = useState<AssetDefinition | null>(
    () => (initial.assetId ? getAssetById(initial.assetId) || null : null),
  );
  const [lastAssetId, setLastAssetId] = useState<string | null>(initial.assetId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>(() => listSavedAssetIds());
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    writeAppUrl(
      {
        tab,
        category: assetCategory,
        subcategory: chartSubcategory,
        q: assetQuery,
        sort: assetSort,
        assetId:
          tab === "assets" || tab === "saved"
            ? (selectedAsset?.id ?? null)
            : null,
      },
      "replace",
    );
  }, [tab, assetCategory, chartSubcategory, assetQuery, assetSort, selectedAsset]);

  useEffect(() => {
    function onPopState() {
      const next = readAppUrl();
      setTab(next.tab);
      setAssetCategory(next.category);
      setChartSubcategory(next.subcategory);
      setAssetQuery(next.q);
      setAssetSort(next.sort);
      setSelectedAsset(next.assetId ? getAssetById(next.assetId) || null : null);
      if (next.assetId) setLastAssetId(next.assetId);
      setMenuOpen(false);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  function showToast(message: string) {
    setToast({ message, id: Date.now() });
  }

  function persist(
    next: {
      tab: AppTab;
      category?: string;
      subcategory?: string;
      q?: string;
      sort?: AssetSort;
      assetId?: string | null;
    },
    mode: "push" | "replace" = "push",
  ) {
    writeAppUrl(
      {
        tab: next.tab,
        category: next.category ?? assetCategory,
        subcategory: next.subcategory ?? chartSubcategory,
        q: next.q ?? assetQuery,
        sort: next.sort ?? assetSort,
        assetId: next.assetId ?? null,
      },
      mode,
    );
  }

  function goAssets() {
    setTab("assets");
    setSelectedAsset(null);
    setMenuOpen(false);
    persist({ tab: "assets", assetId: null });
  }

  function goSaved() {
    setTab("saved");
    setSelectedAsset(null);
    setMenuOpen(false);
    persist({ tab: "saved", assetId: null });
  }

  function goBoard() {
    setTab("board");
    setSelectedAsset(null);
    setMenuOpen(false);
    persist({ tab: "board", assetId: null });
  }

  function goSoon(next: Extract<AppTab, "board" | "prompt">) {
    setTab(next);
    setSelectedAsset(null);
    setMenuOpen(false);
    persist({ tab: next, assetId: null });
  }

  function changeAssetCategory(category: string) {
    setAssetCategory(category);
    if (category !== "charts") {
      setChartSubcategory("all");
    }
  }

  function openAsset(asset: AssetDefinition) {
    setSelectedAsset(asset);
    setLastAssetId(asset.id);
    setMenuOpen(false);
    const nextTab = tab === "saved" ? "saved" : "assets";
    setTab(nextTab);
    persist({ tab: nextTab, assetId: asset.id });
  }

  function backToGallery() {
    setSelectedAsset(null);
    persist({ tab: tab === "saved" ? "saved" : "assets", assetId: null });
    if (tab === "saved") {
      /* stay on saved list */
    }
  }

  function onToggleSave(asset: AssetDefinition) {
    const result = toggleSavedAsset(asset.id);
    setSavedIds(result.ids);
    showToast(
      result.saved
        ? `Saved “${asset.name}” for later`
        : `Removed “${asset.name}” from saved`,
    );
  }

  function onRemoveSaved(asset: AssetDefinition) {
    setSavedIds(removeSavedAsset(asset.id));
    showToast(`Removed “${asset.name}” from saved`);
  }

  const assetsOn = tab === "assets";
  const savedOn = tab === "saved";
  const showBoardApp = tab === "board" && boardEnabled;
  const showSoon =
    tab === "prompt" || (tab === "board" && !boardEnabled);
  const soonLabel = tab === "board" ? "Magic Board" : "AI generation";

  const savedAssets = savedIds
    .map((id) => getAssetById(id))
    .filter((a): a is AssetDefinition => Boolean(a));

  if (showBoardApp) {
    return (
      <div className="app app-magic">
        <BoardApp onHome={goAssets} />
      </div>
    );
  }

  return (
    <div className="app studio">
      <header className="studio-nav">
        <button
          type="button"
          className="studio-brand"
          onClick={goAssets}
          aria-label="BestMotions home"
        >
          <BrandLogo className="studio-logo" />
          <span className="studio-brand-copy">
            <strong>BestMotions</strong>
          </span>
        </button>

        <div className="studio-nav-actions">
          {(assetsOn || savedOn) && selectedAsset ? (
            <div className="studio-crumb">
              <button
                type="button"
                className="studio-link"
                onClick={() => {
                  setSelectedAsset(null);
                  if (savedOn) goSaved();
                  else backToGallery();
                }}
              >
                {savedOn ? "Saved" : "Assets"}
              </button>
              <span aria-hidden>/</span>
              <strong>{selectedAsset.name}</strong>
            </div>
          ) : null}
          <button
            type="button"
            className={menuOpen ? "nav-burger on" : "nav-burger"}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div className="nav-drawer-root">
          <button
            type="button"
            className="nav-drawer-scrim"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="nav-drawer" aria-label="Main">
            <p className="nav-drawer-label">Navigate</p>
            <button
              type="button"
              className={assetsOn ? "nav-drawer-link on" : "nav-drawer-link"}
              onClick={goAssets}
            >
              Assets
            </button>
            <button
              type="button"
              className={savedOn ? "nav-drawer-link on" : "nav-drawer-link"}
              onClick={goSaved}
            >
              Save for later
              <em>{savedIds.length}</em>
            </button>
            <button
              type="button"
              className={tab === "board" ? "nav-drawer-link on" : "nav-drawer-link"}
              onClick={() => (boardEnabled ? goBoard() : goSoon("board"))}
            >
              Magic Board
              {boardEnabled ? null : <span className="nav-soon">Coming soon</span>}
            </button>
            <button
              type="button"
              className={tab === "prompt" ? "nav-drawer-link on" : "nav-drawer-link"}
              onClick={() => goSoon("prompt")}
            >
              AI
              <span className="nav-soon">Coming soon</span>
            </button>
          </nav>
        </div>
      ) : null}

      <div className="studio-body">
        {showSoon ? (
          <section className="coming-soon-page">
            <div className="coming-soon-backdrop" aria-hidden>
              {tab === "board" ? <BoardOutline /> : <AiOutline />}
            </div>
            <div className="coming-soon-overlay">
              <p className="coming-soon-kicker">{soonLabel}</p>
              <h2 className="coming-soon-title">Coming soon</h2>
              <p className="coming-soon-copy">
                {tab === "board"
                  ? "Magic Board is on the way. For now, browse Assets, hover a card to preview, then customize and export."
                  : "Prompt-to-video is on the way. For now, browse Assets, hover a card to preview, then customize and export."}
              </p>
              <button type="button" onClick={goAssets}>
                Browse assets
              </button>
            </div>
          </section>
        ) : null}

        {assetsOn ? (
          <>
            <div className={selectedAsset ? "studio-gallery is-parked" : "studio-gallery"}>
              <AssetGallery
                category={assetCategory}
                subcategory={chartSubcategory}
                query={assetQuery}
                sort={assetSort}
                highlightAssetId={lastAssetId}
                active={!selectedAsset}
                savedIds={savedIds}
                onCategoryChange={changeAssetCategory}
                onSubcategoryChange={setChartSubcategory}
                onQueryChange={setAssetQuery}
                onSortChange={setAssetSort}
                onSelect={openAsset}
                onToggleSave={onToggleSave}
              />
            </div>
            {selectedAsset ? (
              <AssetEditor
                asset={selectedAsset}
                onBack={() => {
                  setSelectedAsset(null);
                  persist({ tab: "assets", assetId: null });
                }}
              />
            ) : null}
          </>
        ) : null}

        {savedOn ? (
          <section className="saved-page">
            <div className="saved-page-head">
              <p className="assets-kicker">Library</p>
              <h2>Save for later</h2>
              <p>
                {savedAssets.length === 0
                  ? "Bookmark templates from Assets — they’ll show up here."
                  : `${savedAssets.length} saved template${savedAssets.length === 1 ? "" : "s"}.`}
              </p>
            </div>
            {selectedAsset ? (
              <AssetEditor
                asset={selectedAsset}
                onBack={() => {
                  setSelectedAsset(null);
                  persist({ tab: "saved", assetId: null });
                }}
              />
            ) : savedAssets.length === 0 ? (
              <div className="saved-empty-card">
                <p>Nothing saved yet.</p>
                <button type="button" onClick={goAssets}>
                  Browse assets
                </button>
              </div>
            ) : (
              <AssetGallery
                category="all"
                subcategory="all"
                query=""
                sort="featured"
                highlightAssetId={lastAssetId}
                active
                savedIds={savedIds}
                filterIds={savedIds}
                onCategoryChange={() => {}}
                onSubcategoryChange={() => {}}
                onQueryChange={() => {}}
                onSortChange={() => {}}
                onSelect={openAsset}
                onToggleSave={(asset) => {
                  onRemoveSaved(asset);
                }}
                hideFilters
              />
            )}
          </section>
        ) : null}
      </div>

      {toast ? (
        <div className="studio-toast" key={toast.id} role="status">
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}

function BoardOutline() {
  return (
    <div className="soon-outline">
      <div className="soon-wire soon-wire-board">
        <div className="soon-block soon-board-header">
          <span className="soon-chip" />
          <span className="soon-chip soon-chip-wide" />
          <span className="soon-chip" />
        </div>
        <div className="soon-board-body">
          <div className="soon-block soon-board-rail">
            <span className="soon-slot-label">Assets</span>
            <span className="soon-line" />
            <span className="soon-line" />
            <span className="soon-line short" />
            <span className="soon-tile-row">
              <span className="soon-tile" />
              <span className="soon-tile" />
            </span>
            <span className="soon-tile-row">
              <span className="soon-tile" />
              <span className="soon-tile" />
            </span>
          </div>
          <div className="soon-board-center">
            <div className="soon-block soon-board-stage">
              <span className="soon-slot-label">Canvas</span>
              <span className="soon-stage-frame">
                <span className="soon-stage-shape a" />
                <span className="soon-stage-shape b" />
              </span>
            </div>
            <div className="soon-block soon-board-timeline">
              <span className="soon-slot-label">Timeline</span>
              <span className="soon-track" />
              <span className="soon-track short" />
              <span className="soon-track" />
            </div>
          </div>
          <div className="soon-block soon-board-rail">
            <span className="soon-slot-label">Properties</span>
            <span className="soon-line" />
            <span className="soon-line short" />
            <span className="soon-line" />
            <span className="soon-line short" />
            <span className="soon-line" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AiOutline() {
  return (
    <div className="soon-outline">
      <div className="soon-wire soon-wire-ai">
        <div className="soon-ai-main">
          <div className="soon-block soon-ai-prompt">
            <span className="soon-slot-label">Prompt</span>
            <span className="soon-line" />
            <span className="soon-line" />
            <span className="soon-line short" />
            <span className="soon-chip soon-chip-cta" />
          </div>
          <div className="soon-block soon-ai-preview">
            <span className="soon-slot-label">Preview</span>
            <span className="soon-preview-frame">
              <span className="soon-preview-bar" />
            </span>
          </div>
        </div>
        <div className="soon-block soon-ai-options">
          <span className="soon-slot-label">Style & length</span>
          <span className="soon-chip-row">
            <span className="soon-chip" />
            <span className="soon-chip" />
            <span className="soon-chip" />
            <span className="soon-chip" />
          </span>
        </div>
      </div>
    </div>
  );
}
