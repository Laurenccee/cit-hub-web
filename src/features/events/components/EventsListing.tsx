"use client";

import { useState } from "react";
import { CalendarX2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardEmptyState } from "@/components/shared/CardEmptyState";
import ListingFilterPills from "@/components/shared/listing/ListingFilterPills";
import ListingPagination from "@/components/shared/listing/ListingPagination";
import ListingSearchInput from "@/components/shared/listing/ListingSearchInput";
import ListingSortSelect from "@/components/shared/listing/ListingSortSelect";
import { LISTING_PAGE_SIZE, paginate } from "@/utils/listing";
import type { EventItem } from "../types";
import EventCard from "./EventCard";
import {
  filterAndSortEvents,
  type EventsSortOrder as SortOrder,
  type EventsTab as Tab,
} from "../lib/listing";

interface EventsListingProps {
  events: EventItem[];
}

const tabs: { label: string; value: Tab }[] = [
  { label: "All Events", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Academic", value: "academic" },
  { label: "Student Life", value: "student-life" },
];

const sortOptions: { label: string; value: SortOrder }[] = [
  { label: "Date: Soonest First", value: "soonest" },
  { label: "Date: Latest First", value: "latest" },
  { label: "Alphabetical", value: "alphabetical" },
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

  const selectSort = (value: SortOrder) => {
    setSortOrder(value);
    setCurrentPage(1);
  };

  const filteredEvents = filterAndSortEvents(
    events,
    activeTab,
    searchTerm,
    sortOrder,
    new Date(),
  );

  const { pageItems, pageCount } = paginate(
    filteredEvents,
    currentPage,
    LISTING_PAGE_SIZE,
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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <ListingFilterPills
          options={tabs}
          value={activeTab}
          onChange={selectTab}
          ariaLabel="Filter events"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <ListingSearchInput
            value={searchTerm}
            onChange={updateSearch}
            placeholder="Search events, workshops, venues..."
            ariaLabel="Search events"
          />
          <ListingSortSelect
            value={sortOrder}
            onChange={selectSort}
            options={sortOptions}
          />
        </div>
      </div>

      {pageItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed bg-card/80 py-6">
          <CardEmptyState
            icon={<CalendarX2 className="h-8 w-8 text-muted-foreground" />}
            title="No events match these filters"
            description="Try another tab, category, or search term."
          />
          <div className="mt-2 flex justify-center">
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

      <ListingPagination
        page={currentPage}
        pageCount={pageCount}
        onPageChange={setCurrentPage}
        ariaLabel="Event pages"
        className="pt-2"
      />
    </div>
  );
}
