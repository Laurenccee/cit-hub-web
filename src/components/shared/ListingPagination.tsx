"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ListingPaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  ariaLabel: string;
  className?: string;
}

export default function ListingPagination({
  page,
  pageCount,
  onPageChange,
  ariaLabel,
  className,
}: ListingPaginationProps) {
  if (pageCount <= 1) return null;

  const current = Math.min(page, pageCount);
  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav
      className={cn("flex items-center justify-center gap-1.5", className)}
      aria-label={ariaLabel}
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Previous page"
        disabled={current === 1}
        onClick={() => onPageChange(Math.max(1, current - 1))}
        className="h-9 w-9 rounded-full"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pageNumbers.map((pageNumber) => (
        <Button
          key={pageNumber}
          type="button"
          variant={pageNumber === current ? "default" : "outline"}
          size="icon"
          aria-label={`Page ${pageNumber}`}
          aria-current={pageNumber === current ? "page" : undefined}
          onClick={() => onPageChange(pageNumber)}
          className="h-9 w-9 rounded-full text-xs"
        >
          {pageNumber}
        </Button>
      ))}
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Next page"
        disabled={current === pageCount}
        onClick={() => onPageChange(Math.min(pageCount, current + 1))}
        className="h-9 w-9 rounded-full"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
