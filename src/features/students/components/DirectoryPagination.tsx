"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DirectoryPaginationProps } from "../types";

export default function DirectoryPagination({
  showingFrom,
  showingTo,
  total,
  page,
  pageCount,
  onPageChange,
}: DirectoryPaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-bold text-foreground">{showingFrom}</span>{" "}
        to <span className="font-bold text-foreground">{showingTo}</span> of{" "}
        <span className="font-bold text-foreground">
          {total.toLocaleString()}
        </span>{" "}
        students
      </p>
      <Pagination page={page} pageCount={pageCount} onChange={onPageChange} />
    </div>
  );
}

function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  const numbers = useMemo(() => {
    if (pageCount <= 7)
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    const set = new Set<number>([
      1,
      2,
      page - 1,
      page,
      page + 1,
      pageCount - 1,
      pageCount,
    ]);
    return Array.from(set)
      .filter((n) => n >= 1 && n <= pageCount)
      .sort((a, b) => a - b);
  }, [page, pageCount]);

  const items: (number | "gap")[] = [];
  numbers.forEach((n, i) => {
    if (i > 0 && n - numbers[i - 1] > 1) items.push("gap");
    items.push(n);
  });

  return (
    <nav className="flex items-center gap-1.5" aria-label="Student pages">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onChange(Math.max(1, page - 1))}
        className="h-8 gap-1 bg-card px-2.5 text-xs"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Prev
      </Button>
      {items.map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} className="px-0.5 text-xs text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={item}
            type="button"
            variant={item === page ? "default" : "outline"}
            size="sm"
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onChange(item)}
            className={cn(
              "h-8 min-w-8 px-2 text-xs",
              item === page ? "bg-primary hover:bg-primary/90" : "bg-card",
            )}
          >
            {item}
          </Button>
        ),
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page === pageCount}
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        className="h-8 gap-1 bg-card px-2.5 text-xs"
      >
        Next
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </nav>
  );
}
