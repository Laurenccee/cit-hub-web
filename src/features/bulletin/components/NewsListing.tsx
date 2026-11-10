"use client";

import { useState } from "react";
import { Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardEmptyState } from "@/components/shared/CardEmptyState";
import ListingFilterPills from "@/components/shared/listing/ListingFilterPills";
import ListingPagination from "@/components/shared/listing/ListingPagination";
import ListingSearchInput from "@/components/shared/listing/ListingSearchInput";
import ListingSortSelect from "@/components/shared/listing/ListingSortSelect";
import {
  LISTING_PAGE_SIZE,
  buildSearchText,
  compareListItems,
  paginate,
} from "@/utils/listing";
import NewsCard from "./NewsCard";
import type { ContentType, NewsItem } from "../types";

type SortOrder = "latest" | "oldest" | "alphabetical";

interface NewsListingProps {
  news: NewsItem[];
  contentTypes: ContentType[];
}

const sortOptions: { label: string; value: SortOrder }[] = [
  { label: "Latest First", value: "latest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Alphabetical", value: "alphabetical" },
];

export default function NewsListing({ news, contentTypes }: NewsListingProps) {
  const [activeType, setActiveType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const tabs = [
    { label: "All Updates", value: "all" },
    ...contentTypes.map((contentType) => ({
      label: contentType.label,
      value: contentType.label,
    })),
  ];

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

  const filteredNews = news
    .filter((item) => {
      if (activeType !== "all" && item.content_type?.label !== activeType) {
        return false;
      }
      if (!normalizedSearch) return true;
      return buildSearchText([
        item.title,
        item.description,
        item.content,
        item.content_type?.label,
      ]).includes(normalizedSearch);
    })
    .sort((first, second) =>
      compareListItems(
        first,
        second,
        (item) => item.created_at,
        sortOrder === "alphabetical",
        sortOrder === "oldest",
      ),
    );

  const { pageItems, pageCount } = paginate(
    filteredNews,
    currentPage,
    LISTING_PAGE_SIZE,
  );

  const updateSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const selectType = (value: string) => {
    setActiveType(value);
    setCurrentPage(1);
  };

  const selectSort = (value: SortOrder) => {
    setSortOrder(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveType("all");
    setSortOrder("latest");
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <ListingFilterPills
          options={tabs}
          value={activeType}
          onChange={selectType}
          ariaLabel="Filter announcements"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <ListingSearchInput
            value={searchTerm}
            onChange={updateSearch}
            placeholder="Search announcements, news..."
            ariaLabel="Search announcements"
          />
          <ListingSortSelect
            value={sortOrder}
            onChange={selectSort}
            options={sortOptions}
          />
        </div>
      </div>

      {pageItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed bg-card/80 py-6">
          <CardEmptyState
            icon={<Newspaper className="h-8 w-8 text-muted-foreground" />}
            title="No announcements match these filters"
            description="Try another category or search term."
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
        ariaLabel="Bulletin pages"
        className="border-t pt-4"
      />
    </div>
  );
}
