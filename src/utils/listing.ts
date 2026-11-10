export const LISTING_PAGE_SIZE = 6;

export function buildSearchText(
  parts: Array<string | null | undefined>,
): string {
  return parts.filter(Boolean).join(" ").toLocaleLowerCase();
}

function compareByDate<T>(
  a: T,
  b: T,
  getDate: (item: T) => string,
  direction: "asc" | "desc",
): number {
  const difference =
    new Date(getDate(a)).getTime() - new Date(getDate(b)).getTime();
  return direction === "asc" ? difference : -difference;
}

export function compareListItems<T extends { title: string }>(
  a: T,
  b: T,
  getDate: (item: T) => string,
  alphabetical: boolean,
  ascending: boolean,
): number {
  if (alphabetical) {
    return a.title.localeCompare(b.title);
  }
  return compareByDate(a, b, getDate, ascending ? "asc" : "desc");
}

export function paginate<T>(items: T[], currentPage: number, pageSize: number) {
  const pageCount = Math.ceil(items.length / pageSize);
  const page = Math.min(currentPage, Math.max(1, pageCount));
  const pageItems = items.slice((page - 1) * pageSize, page * pageSize);
  return { page, pageCount, pageItems };
}
