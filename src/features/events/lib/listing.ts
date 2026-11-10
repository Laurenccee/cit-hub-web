import { buildSearchText, compareListItems } from "@/utils/listing";
import type { EventItem } from "../types";

const ACADEMIC_KEYWORDS = [
  "academic",
  "career",
  "competition",
  "research",
  "workshop",
  "colloquium",
  "expo",
  "challenge",
  "fair",
  "ctf",
];

function isAcademicEvent(event: EventItem) {
  const haystack =
    `${event.category?.label ?? ""} ${event.title}`.toLowerCase();
  return ACADEMIC_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

export type EventsTab =
  | "all"
  | "upcoming"
  | "week"
  | "month"
  | "academic"
  | "student-life";
export type EventsSortOrder = "soonest" | "latest" | "alphabetical";

interface TabContext {
  now: Date;
  startOfWeek: Date;
  endOfWeek: Date;
  startOfMonth: Date;
  endOfMonth: Date;
}

function buildTabContext(now: Date): TabContext {
  // Week interval (Monday to Sunday)
  const diffToMonday = (now.getDay() + 6) % 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return {
    now,
    startOfWeek,
    endOfWeek,
    startOfMonth: new Date(now.getFullYear(), now.getMonth(), 1),
    endOfMonth: new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    ),
  };
}

function isWithinInterval(date: Date, start: Date, end: Date) {
  return date >= start && date <= end;
}

const TAB_PREDICATES: Record<
  EventsTab,
  (event: EventItem, date: Date, ctx: TabContext) => boolean
> = {
  all: () => true,
  upcoming: (_event, date, ctx) => date >= ctx.now,
  week: (_event, date, ctx) =>
    isWithinInterval(date, ctx.startOfWeek, ctx.endOfWeek),
  month: (_event, date, ctx) =>
    isWithinInterval(date, ctx.startOfMonth, ctx.endOfMonth),
  academic: (event) => isAcademicEvent(event),
  "student-life": (event) => !isAcademicEvent(event),
};

function matchesSearch(event: EventItem, normalizedSearch: string) {
  if (!normalizedSearch) return true;
  return buildSearchText([
    event.title,
    event.description,
    event.content,
    event.location,
    event.category?.label,
  ]).includes(normalizedSearch);
}

export function filterAndSortEvents(
  events: EventItem[],
  tab: EventsTab,
  searchTerm: string,
  sortOrder: EventsSortOrder,
  now: Date,
) {
  const ctx = buildTabContext(now);
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

  return events
    .filter(
      (event) =>
        TAB_PREDICATES[tab](event, new Date(event.start_date), ctx) &&
        matchesSearch(event, normalizedSearch),
    )
    .sort((first, second) =>
      compareListItems(
        first,
        second,
        (item) => item.start_date,
        sortOrder === "alphabetical",
        sortOrder === "soonest",
      ),
    );
}
