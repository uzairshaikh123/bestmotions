const STORAGE_KEY = "bm-saved-assets-v1";
const MAX_SAVED = 200;

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((id): id is string => typeof id === "string" && id.length > 0)
      .slice(0, MAX_SAVED);
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_SAVED)));
  } catch {
    /* quota */
  }
}

export function listSavedAssetIds(): string[] {
  return readIds();
}

export function isAssetSaved(id: string): boolean {
  return readIds().includes(id);
}

export function toggleSavedAsset(id: string): { saved: boolean; ids: string[] } {
  const ids = readIds();
  const idx = ids.indexOf(id);
  if (idx >= 0) {
    ids.splice(idx, 1);
    writeIds(ids);
    return { saved: false, ids };
  }
  ids.unshift(id);
  writeIds(ids);
  return { saved: true, ids };
}

export function removeSavedAsset(id: string): string[] {
  const ids = readIds().filter((x) => x !== id);
  writeIds(ids);
  return ids;
}
