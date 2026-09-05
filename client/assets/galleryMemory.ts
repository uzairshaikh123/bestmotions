export const PAGE_SIZE = 20;

export const galleryMemory = {
  key: "",
  page: 1,
  scrollY: 0,
};

export function galleryFilterKey(
  category: string,
  subcategory: string,
  query: string,
  sort: string,
  filterIds?: string[] | null,
) {
  const ids = filterIds?.length ? filterIds.join(",") : "";
  return `${category}|${subcategory}|${query.trim().toLowerCase()}|${sort}|${ids}`;
}
