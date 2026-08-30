export type AppTab = "prompt" | "assets" | "board";

export type AppUrlState = {
  tab: AppTab;
  category: string;
  subcategory: string;
  q: string;
  assetId: string | null;
};

const TABS: AppTab[] = ["prompt", "assets", "board"];

/** Map old Revideo-tab ids (`rv-*`) and Remotion code/saved tabs onto Assets. */
const LEGACY_REVIDEO_IDS: Record<string, string> = {
  "rv-thumb-through": "book-thumb-through",
  "rv-cover-slam": "book-cover-slam",
  "rv-spine-reveal": "book-spine-reveal",
  "rv-open-spread": "book-open-spread",
  "rv-cover-open": "book-cover-open",
  "rv-marker-highlight": "book-marker-highlight",
  "rv-area-highlight": "book-area-highlight",
  "rv-line-scan": "book-line-scan",
  "rv-text-underline": "book-text-underline",
  "rv-page-flip": "book-page-flip",
  "rv-quote": "book-quote",
};

export function readAppUrl(): AppUrlState {
  const params = new URLSearchParams(window.location.search);
  const tabRaw = params.get("tab") || "assets";

  if (tabRaw === "revideo") {
    const legacy = params.get("revideo");
    const assetId = legacy ? LEGACY_REVIDEO_IDS[legacy] || legacy : null;
    return {
      tab: "assets",
      category: "books",
      subcategory: "all",
      q: params.get("q") || "",
      assetId,
    };
  }

  // Former Code / Saved tabs no longer exist
  if (tabRaw === "code" || tabRaw === "saved") {
    return {
      tab: "assets",
      category: params.get("category") || "all",
      subcategory: params.get("sub") || "all",
      q: params.get("q") || "",
      assetId: params.get("asset"),
    };
  }

  const tab = (TABS.includes(tabRaw as AppTab) ? tabRaw : "assets") as AppTab;

  return {
    tab,
    category: params.get("category") || "all",
    subcategory: params.get("sub") || "all",
    q: params.get("q") || "",
    assetId: params.get("asset"),
  };
}

export function writeAppUrl(
  state: Partial<AppUrlState>,
  mode: "replace" | "push" = "replace",
) {
  const current = readAppUrl();
  const next: AppUrlState = {
    tab: state.tab ?? current.tab,
    category: state.category ?? current.category,
    subcategory: state.subcategory ?? current.subcategory,
    q: state.q ?? current.q,
    assetId: state.assetId === undefined ? current.assetId : state.assetId,
  };

  const params = new URLSearchParams();
  if (next.tab !== "assets") params.set("tab", next.tab);

  if (next.tab === "assets") {
    if (next.category && next.category !== "all") {
      params.set("category", next.category);
    }
    if (
      next.category === "charts" &&
      next.subcategory &&
      next.subcategory !== "all"
    ) {
      params.set("sub", next.subcategory);
    }
    if (next.q.trim()) params.set("q", next.q.trim());
    if (next.assetId) params.set("asset", next.assetId);
  }

  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;

  if (mode === "push") {
    window.history.pushState(next, "", url);
  } else {
    window.history.replaceState(next, "", url);
  }
}
