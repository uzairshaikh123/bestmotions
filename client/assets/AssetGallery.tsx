import React, { useEffect, useMemo, useRef, useState } from "react";
import Select, { type StylesConfig, type SingleValue } from "react-select";
import type { AssetSort } from "../urlState";
import { ASSETS, CATEGORIES, CHART_SUBCATEGORIES } from "./catalog";
import { AssetThumb } from "./AssetThumb";
import {
  PAGE_SIZE,
  galleryFilterKey,
  galleryMemory,
} from "./galleryMemory";
import type { AssetDefinition } from "./types";

type Props = {
  category: string;
  subcategory: string;
  query: string;
  sort: AssetSort;
  highlightAssetId?: string | null;
  active?: boolean;
  savedIds?: string[];
  /** When set, only these asset ids are shown (Save for later page). */
  filterIds?: string[] | null;
  hideFilters?: boolean;
  onCategoryChange: (category: string) => void;
  onSubcategoryChange: (subcategory: string) => void;
  onQueryChange: (query: string) => void;
  onSortChange: (sort: AssetSort) => void;
  onSelect: (asset: AssetDefinition) => void;
  onToggleSave: (asset: AssetDefinition) => void;
};

type FilterOption = { value: string; label: string };

const SORT_OPTIONS: { id: AssetSort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "name", label: "Name A–Z" },
  { id: "duration", label: "Duration" },
  { id: "category", label: "Category" },
];

const filterSelectStyles: StylesConfig<FilterOption, false> = {
  container: (base) => ({
    ...base,
    width: "100%",
  }),
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    height: 44,
    borderRadius: 12,
    borderColor: state.isFocused
      ? "rgba(124, 58, 237, 0.5)"
      : "rgba(124, 58, 237, 0.16)",
    backgroundColor: "#ffffff",
    boxShadow: state.isFocused ? "0 0 0 1px rgba(168, 85, 247, 0.28)" : "none",
    cursor: "pointer",
    "&:hover": {
      borderColor: "rgba(124, 58, 237, 0.35)",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 12px",
    height: 42,
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--fog)",
    fontSize: "0.86rem",
    fontWeight: 650,
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--muted)",
    fontSize: "0.86rem",
    fontWeight: 600,
  }),
  input: (base) => ({
    ...base,
    color: "var(--fog)",
    margin: 0,
    padding: 0,
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "#7c3aed" : "rgba(26, 16, 40, 0.4)",
    padding: "0 10px",
    transition: "transform 0.15s ease, color 0.15s ease",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : undefined,
    "&:hover": {
      color: "#7c3aed",
    },
  }),
  menu: (base) => ({
    ...base,
    marginTop: 6,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(124, 58, 237, 0.14)",
    boxShadow: "0 16px 40px rgba(124, 58, 237, 0.12)",
    zIndex: 40,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 40,
  }),
  menuList: (base) => ({
    ...base,
    padding: 6,
    maxHeight: 280,
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: "0.86rem",
    fontWeight: state.isSelected ? 700 : 600,
    cursor: "pointer",
    color: state.isSelected || state.isFocused ? "#5b21b6" : "var(--fog)",
    backgroundColor: state.isSelected
      ? "rgba(168, 85, 247, 0.16)"
      : state.isFocused
        ? "rgba(124, 58, 237, 0.06)"
        : "transparent",
    ":active": {
      backgroundColor: "rgba(168, 85, 247, 0.22)",
    },
  }),
};

const sortSelectStyles: StylesConfig<FilterOption, false> = {
  ...filterSelectStyles,
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    height: 38,
    borderRadius: 10,
    borderColor: state.isFocused
      ? "rgba(124, 58, 237, 0.5)"
      : "rgba(124, 58, 237, 0.16)",
    backgroundColor: "#ffffff",
    boxShadow: state.isFocused ? "0 0 0 1px rgba(168, 85, 247, 0.28)" : "none",
    cursor: "pointer",
    "&:hover": {
      borderColor: "rgba(124, 58, 237, 0.35)",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 8px",
    height: 36,
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--fog)",
    fontSize: "0.78rem",
    fontWeight: 650,
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: "0.78rem",
    fontWeight: state.isSelected ? 700 : 600,
    cursor: "pointer",
    color: state.isSelected || state.isFocused ? "#5b21b6" : "var(--fog)",
    backgroundColor: state.isSelected
      ? "rgba(168, 85, 247, 0.16)"
      : state.isFocused
        ? "rgba(124, 58, 237, 0.06)"
        : "transparent",
    ":active": {
      backgroundColor: "rgba(168, 85, 247, 0.22)",
    },
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "#7c3aed" : "rgba(26, 16, 40, 0.4)",
    padding: "0 8px",
    transition: "transform 0.15s ease, color 0.15s ease",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : undefined,
    "&:hover": {
      color: "#7c3aed",
    },
  }),
};

function durationSec(asset: AssetDefinition) {
  return Math.max(1, Math.round(asset.durationInFrames / Math.max(asset.fps, 1)));
}

function matchesQuery(asset: AssetDefinition, q: string) {
  if (!q) return true;
  return (
    asset.name.toLowerCase().includes(q) ||
    asset.description.toLowerCase().includes(q) ||
    asset.id.toLowerCase().includes(q) ||
    asset.category.toLowerCase().includes(q) ||
    (asset.subcategory || "").toLowerCase().includes(q)
  );
}

function canHoverPreview() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(hover: hover)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function pageItems(total: number, page: number, size: number) {
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * size;
  return { pages, current, start, end: Math.min(total, start + size) };
}

function pageWindow(current: number, pages: number) {
  if (pages <= 7) {
    return Array.from({ length: pages }, (_, i) => i + 1);
  }
  const items: Array<number | "gap"> = [1];
  const from = Math.max(2, current - 1);
  const to = Math.min(pages - 1, current + 1);
  if (from > 2) items.push("gap");
  for (let n = from; n <= to; n += 1) items.push(n);
  if (to < pages - 1) items.push("gap");
  items.push(pages);
  return items;
}

export function AssetGallery({
  category,
  subcategory,
  query,
  sort,
  highlightAssetId,
  active = true,
  savedIds = [],
  filterIds = null,
  hideFilters = false,
  onCategoryChange,
  onSubcategoryChange,
  onQueryChange,
  onSortChange,
  onSelect,
  onToggleSave,
}: Props) {
  const filterKey = galleryFilterKey(
    category,
    subcategory,
    query,
    sort,
    filterIds,
  );
  const searchRef = useRef<HTMLInputElement | null>(null);
  const playTimer = useRef(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [page, setPage] = useState(() =>
    galleryMemory.key === filterKey ? galleryMemory.page : 1,
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: ASSETS.length };
    for (const asset of ASSETS) {
      counts[asset.category] = (counts[asset.category] || 0) + 1;
    }
    return counts;
  }, []);

  const chartSubCounts = useMemo(() => {
    const charts = ASSETS.filter((a) => a.category === "charts");
    const counts: Record<string, number> = { all: charts.length };
    for (const asset of charts) {
      if (!asset.subcategory) continue;
      counts[asset.subcategory] = (counts[asset.subcategory] || 0) + 1;
    }
    return counts;
  }, []);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const idSet = filterIds ? new Set(filterIds) : null;
    const filtered = ASSETS.filter((a) => {
      if (idSet && !idSet.has(a.id)) return false;
      if (idSet) return matchesQuery(a, q);
      const catOk = category === "all" || a.category === category;
      if (!catOk) return false;
      if (
        category === "charts" &&
        subcategory !== "all" &&
        a.subcategory !== subcategory
      ) {
        return false;
      }
      return matchesQuery(a, q);
    });

    if (idSet) {
      // Keep save order from filterIds
      const byId = new Map(filtered.map((a) => [a.id, a]));
      return filterIds!.map((id) => byId.get(id)).filter(Boolean) as AssetDefinition[];
    }

    const next = [...filtered];
    if (sort === "name") {
      next.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "duration") {
      next.sort((a, b) => durationSec(a) - durationSec(b) || a.name.localeCompare(b.name));
    } else if (sort === "category") {
      next.sort(
        (a, b) =>
          a.category.localeCompare(b.category) ||
          (a.subcategory || "").localeCompare(b.subcategory || "") ||
          a.name.localeCompare(b.name),
      );
    }
    return next;
  }, [category, subcategory, query, sort, filterIds]);

  const paging = pageItems(items.length, page, PAGE_SIZE);
  const visibleItems = items.slice(paging.start, paging.end);

  useEffect(() => {
    if (galleryMemory.key === filterKey) {
      setPage(galleryMemory.page);
      return;
    }
    galleryMemory.key = filterKey;
    galleryMemory.page = 1;
    galleryMemory.scrollY = 0;
    setPage(1);
    setPlayingId(null);
  }, [filterKey]);

  useEffect(() => {
    galleryMemory.page = paging.current;
    if (page !== paging.current) setPage(paging.current);
  }, [page, paging.current]);

  useEffect(() => {
    if (!active) return;
    const id = window.requestAnimationFrame(() => {
      window.scrollTo(0, galleryMemory.scrollY);
    });
    return () => window.cancelAnimationFrame(id);
  }, [active]);

  useEffect(() => {
    window.clearTimeout(playTimer.current);
    setPlayingId(null);
  }, [filterKey, paging.current]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function goPage(next: number) {
    const clamped = Math.min(Math.max(1, next), paging.pages);
    setPage(clamped);
    galleryMemory.page = clamped;
    galleryMemory.scrollY = 0;
    window.scrollTo(0, 0);
  }

  function schedulePlay(id: string) {
    if (!canHoverPreview()) return;
    window.clearTimeout(playTimer.current);
    playTimer.current = window.setTimeout(() => setPlayingId(id), 140);
  }

  function stopPlay(id: string) {
    window.clearTimeout(playTimer.current);
    setPlayingId((cur) => (cur === id ? null : cur));
  }

  function open(asset: AssetDefinition) {
    galleryMemory.scrollY = window.scrollY;
    galleryMemory.page = paging.current;
    onSelect(asset);
  }

  const pages = pageWindow(paging.current, paging.pages);

  const categoryOptions = useMemo<FilterOption[]>(
    () =>
      CATEGORIES.map((cat) => ({
        value: cat.id,
        label: `${cat.label} (${categoryCounts[cat.id] ?? 0})`,
      })),
    [categoryCounts],
  );

  const subcategoryOptions = useMemo<FilterOption[]>(
    () =>
      CHART_SUBCATEGORIES.map((sub) => ({
        value: sub.id,
        label: `${sub.label} (${chartSubCounts[sub.id] ?? 0})`,
      })),
    [chartSubCounts],
  );

  const sortOptions = useMemo<FilterOption[]>(
    () => SORT_OPTIONS.map((opt) => ({ value: opt.id, label: opt.label })),
    [],
  );

  const selectedCategory =
    categoryOptions.find((opt) => opt.value === category) ?? categoryOptions[0];
  const selectedSubcategory =
    subcategoryOptions.find((opt) => opt.value === subcategory) ??
    subcategoryOptions[0];
  const selectedSort =
    sortOptions.find((opt) => opt.value === sort) ?? sortOptions[0];

  return (
    <section className="assets-page">
      {hideFilters ? null : (
      <div className="assets-toolbar">
        <label className="studio-search toolbar-search">
          <SearchIcon />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search templates..."
            aria-label="Search assets"
          />
          <kbd>⌘ K</kbd>
        </label>
        <div className="asset-filter">
          <span className="sr-only">Category</span>
          <Select
            classNamePrefix="asset-rs"
            inputId="asset-category-filter"
            aria-label="Filter by category"
            options={categoryOptions}
            value={selectedCategory}
            onChange={(next: SingleValue<FilterOption>) => {
              if (next) onCategoryChange(next.value);
            }}
            isSearchable={false}
            styles={filterSelectStyles}
            menuPortalTarget={
              typeof document !== "undefined" ? document.body : null
            }
            menuPosition="fixed"
          />
        </div>
        {category === "charts" ? (
          <div className="asset-filter">
            <span className="sr-only">Chart type</span>
            <Select
              classNamePrefix="asset-rs"
              inputId="asset-chart-filter"
              aria-label="Filter by chart type"
              options={subcategoryOptions}
              value={selectedSubcategory}
              onChange={(next: SingleValue<FilterOption>) => {
                if (next) onSubcategoryChange(next.value);
              }}
              isSearchable={false}
              styles={filterSelectStyles}
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
              }
              menuPosition="fixed"
            />
          </div>
        ) : null}
        <div className="asset-sort">
          <span className="sr-only">Sort</span>
          <Select
            classNamePrefix="asset-rs"
            inputId="asset-sort-filter"
            aria-label="Sort assets"
            options={sortOptions}
            value={selectedSort}
            onChange={(next: SingleValue<FilterOption>) => {
              if (next) onSortChange(next.value as AssetSort);
            }}
            isSearchable={false}
            styles={sortSelectStyles}
            menuPortalTarget={
              typeof document !== "undefined" ? document.body : null
            }
            menuPosition="fixed"
          />
        </div>
      </div>
      )}

      <div className="asset-board">
        {items.length === 0 ? (
          <p className="status assets-empty">
            Try All, clear search, or pick another category.
          </p>
        ) : (
          <>
            <div className="asset-grid">
              {visibleItems.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  playing={playingId === asset.id}
                  highlighted={asset.id === highlightAssetId}
                  saved={savedIds.includes(asset.id)}
                  onHoverStart={() => schedulePlay(asset.id)}
                  onHoverEnd={() => stopPlay(asset.id)}
                  onSelect={() => open(asset)}
                  onToggleSave={() => onToggleSave(asset)}
                />
              ))}
            </div>
            {paging.pages > 1 ? (
              <nav className="asset-pager" aria-label="Library pages">
                <button
                  type="button"
                  className="pager-nav"
                  disabled={paging.current <= 1}
                  onClick={() => goPage(paging.current - 1)}
                >
                  <PagerChevron />
                  Previous
                </button>
                <div className="pager-pages">
                  {pages.map((item, index) =>
                    item === "gap" ? (
                      <span key={`gap-${index}`} className="pager-gap">
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        className={item === paging.current ? "pager-page on" : "pager-page"}
                        aria-current={item === paging.current ? "page" : undefined}
                        onClick={() => goPage(item)}
                      >
                        {item}
                      </button>
                    ),
                  )}
                </div>
                <button
                  type="button"
                  className="pager-nav"
                  disabled={paging.current >= paging.pages}
                  onClick={() => goPage(paging.current + 1)}
                >
                  Next
                  <PagerChevron flip />
                </button>
              </nav>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

function AssetCard({
  asset,
  playing,
  highlighted,
  saved,
  onHoverStart,
  onHoverEnd,
  onSelect,
  onToggleSave,
}: {
  asset: AssetDefinition;
  playing: boolean;
  highlighted: boolean;
  saved: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onSelect: () => void;
  onToggleSave: () => void;
}) {
  const tag = asset.subcategory || asset.category;
  const className = [
    "asset-card",
    playing ? "is-playing" : "",
    highlighted ? "highlighted" : "",
    saved ? "is-saved" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={className}
      style={{ ["--accent" as string]: asset.accent }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          onHoverEnd();
        }
      }}
    >
      <button
        type="button"
        className="asset-card-hit"
        onClick={onSelect}
        aria-label={`Open ${asset.name}`}
      >
        <div className="asset-card-media">
          <AssetThumb
            asset={asset}
            playing={playing}
            instanceKey={`gallery-${asset.id}`}
          />
          <span className="asset-duration">{durationSec(asset)}s</span>
        </div>
        <div className="asset-card-body">
          <h3>{asset.name}</h3>
          <p className="asset-tag">{tag}</p>
        </div>
      </button>
      <div className="asset-card-actions">
        <button
          type="button"
          className={saved ? "asset-save on" : "asset-save"}
          aria-label={saved ? `Remove ${asset.name} from saved` : `Save ${asset.name} for later`}
          aria-pressed={saved}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSave();
          }}
        >
          <BookmarkIcon filled={saved} />
        </button>
        <button
          type="button"
          className="asset-edit"
          aria-label={`Customize ${asset.name}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect();
          }}
        >
          <EditIcon />
        </button>
      </div>
    </article>
  );
}

function BookmarkIcon({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M7 4.5h10v15l-5-3.2-5 3.2z"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M4 20h4l10.5-10.5-4-4L4 16v4z" />
      <path d="M13.5 6.5l4 4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16.2 16.2 20 20" />
    </svg>
  );
}

function PagerChevron({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M14.5 6 8.5 12l6 6" />
    </svg>
  );
}
