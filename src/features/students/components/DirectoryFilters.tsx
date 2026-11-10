"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DirectoryFiltersProps, MajorFilter } from "../types";

const majorFilters: { label: string; value: MajorFilter }[] = [
  { label: "All Students", value: "ALL" },
  { label: "Automotive Technology", value: "AT" },
  { label: "Mechanical Technology", value: "MT" },
  { label: "Electrical Technology", value: "ET" },
  { label: "Electronics Technology", value: "ELX" },
  { label: "Construction Technology", value: "CT" },
  { label: "Architectural Drafting Technology", value: "ARDT" },
  { label: "Culinary Technology", value: "CLT" },
  { label: "Beauty Care and Wellness Technology", value: "BCWT" },
  { label: "Apparel and Fashion Technology", value: "AFT" },
];

export default function DirectoryFilters({
  search,
  onSearchChange,
  yearFilter,
  onYearFilterChange,
  rfidFilter,
  onRfidFilterChange,
  major,
  onMajorChange,
  counts,
  onResetPage,
}: DirectoryFiltersProps) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onResetPage();
            }}
            placeholder="Search student name, ID, RFID UID, or program..."
            aria-label="Search students"
            className="h-10 bg-card pl-9 pr-9 text-xs"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                onSearchChange("");
                onResetPage();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:w-auto">
          <Select
            size="lg"
            value={yearFilter}
            onChange={(e) => {
              onYearFilterChange(e.target.value);
              onResetPage();
            }}
            aria-label="Filter by year level"
          >
            <option value="all">All Year Levels</option>
            <option value="1st">1st Year</option>
            <option value="2nd">2nd Year</option>
            <option value="3rd">3rd Year</option>
            <option value="4th">4th Year</option>
          </Select>
          <Select
            size="lg"
            value={rfidFilter}
            onChange={(e) => {
              onRfidFilterChange(e.target.value);
              onResetPage();
            }}
            aria-label="Filter by RFID status"
          >
            <option value="all">RFID Status: All</option>
            <option value="linked">Active</option>
            <option value="unlinked">Not Linked</option>
          </Select>
        </div>
      </div>

      <div
        className="mt-3 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by major"
      >
        {majorFilters.map(({ label, value }) => {
          const active = major === value;
          const count = counts[value] ?? 0;
          const pillLabel =
            value === "ALL" ? label : `${value} • ${label}`;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => {
                onMajorChange(value);
                onResetPage();
              }}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {pillLabel} ({count.toLocaleString()})
            </button>
          );
        })}
      </div>
    </div>
  );
}
