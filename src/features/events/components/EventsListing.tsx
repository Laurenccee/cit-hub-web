"use client";

import { useState } from "react";
import { CalendarX2, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EventCategory, EventItem } from "../types";
import EventCard, { isAcademicEvent } from "./EventCard";
import { CardEmptyState } from "@/components/shared/CardEmptyState";

type Tab = "all" | "upcoming" | "week" | "month" | "academic" | "student-life";
type SortOrder = "soonest" | "latest" | "alphabetical";

interface EventsListingProps {
  events: EventItem[];
  categories: EventCategory[];
}

const pageSize = 6;

const tabs: { label: string; value: Tab }[] = [
  { label: "All Events", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Academic", value: "academic" },
  { label: "Student Life", value: "student-life" },
];

export default function EventsListing({ events }: EventsListingProps) {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("soonest");
  const [currentPage, setCurrentPage] = useState(1);

  const selectTab = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const now = new Date();
  
  // Week interval (Monday to Sunday)
  const currentDay = now.getDay();
  const diffToMonday = (currentDay + 6) % 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Month interval
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const isWithinInterval = (date: Date, start: Date, end: Date) => {
    return date >= start && date <= end;
  };

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

  const filteredEvents = events
    .filter((event) => {
      const eventDate = new Date(event.start_date);
      if (activeTab === "upcoming" && !(eventDate >= now)) return false;
      if (activeTab === "week" && !isWithinInterval(eventDate, startOfWeek, endOfWeek))
        return false;
      if (activeTab === "month" && !isWithinInterval(eventDate, startOfMonth, endOfMonth))
        return false;
      if (activeTab === "academic" && !isAcademicEvent(event)) return false;
      if (activeTab === "student-life" && isAcademicEvent(event)) return false;

      if (!normalizedSearch) return true;
      const searchableText = [
        event.title,
        event.description,
        event.content,
        event.location,
        event.category?.label,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      return searchableText.includes(normalizedSearch);
    })
    .sort((first, second) => {
      if (sortOrder === "alphabetical") {
        return first.title.localeCompare(second.title);
      }
      const dateDifference =
        new Date(first.start_date).getTime() -
        new Date(second.start_date).getTime();
      return sortOrder === "soonest" ? dateDifference : -dateDifference;
    });

  const pageCount = Math.ceil(filteredEvents.length / pageSize);
  const visibleEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const pageNumbers = Array.from(
    { length: pageCount },
    (_, index) => index + 1,
  );

  const updateSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveTab("all");
    setSortOrder("soonest");
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Filters + search */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          role="group"
          aria-label="Filter events"
        >
          {tabs.map(({ label, value }) => {
            const isSelected = activeTab === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => selectTab(value)}
                className={`h-8 shrink-0 rounded-md border px-3 text-xs font-medium transition-colors ${
                  isSelected
                    ? "border-[#8B1A1A] bg-[#8B1A1A] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              value={searchTerm}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Search events, workshops, venues..."
              aria-label="Search events"
              className="h-9 bg-white pl-9 pr-9 text-xs"
            />
            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => updateSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <label className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
            Sort by:
            <select
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value as SortOrder);
                setCurrentPage(1);
              }}
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30"
            >
              <option value="soonest">Date: Soonest First</option>
              <option value="latest">Date: Latest First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </label>
        </div>
      </div>

      {/* Grid */}
      {visibleEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed bg-white/80 py-6">
          <CardEmptyState
            icon={<CalendarX2 className="h-8 w-8 text-slate-400" />}
            title="No events match these filters"
            description="Try another tab, category, or search term."
          />
          <div className="flex justify-center mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </div>
        </Card>
      )}

      {pageCount > 1 && (
        <nav
          className="flex items-center justify-center gap-1.5 pt-2"
          aria-label="Event pages"
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            className="h-9 w-9 rounded-full bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {pageNumbers.map((page) => (
            <Button
              key={page}
              type="button"
              variant={page === currentPage ? "default" : "outline"}
              size="icon"
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
              onClick={() => setCurrentPage(page)}
              className={`h-9 w-9 rounded-full text-xs ${
                page === currentPage
                  ? "bg-[#8B1A1A] hover:bg-[#6B1515]"
                  : "bg-white"
              }`}
            >
              {page}
            </Button>
          ))}
          {pageCount > 4 && (
            <span className="px-1 text-xs text-slate-400">…</span>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next page"
            disabled={currentPage === pageCount}
            onClick={() =>
              setCurrentPage((page) => Math.min(pageCount, page + 1))
            }
            className="h-9 w-9 rounded-full bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      )}
    </div>
  );
}
