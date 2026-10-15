"use client";

import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentDirectoryProps } from "../types";
import { useStudentDirectory } from "../hooks/useStudentDirectory";
import DirectoryFilters from "./DirectoryFilters";
import StudentTableRow from "./StudentTableRow";
import DirectoryPagination from "./DirectoryPagination";

export default function StudentDirectory({
  students,
  courses,
  majors,
}: StudentDirectoryProps) {
  const {
    search,
    setSearch,
    yearFilter,
    setYearFilter,
    rfidFilter,
    setRfidFilter,
    major,
    setMajor,
    setPage,
    counts,
    filtered,
    visible,
    showingFrom,
    showingTo,
    pageCount,
    safePage,
    clearAll,
    resetPage,
  } = useStudentDirectory({ students });

  return (
    <div className="flex flex-col gap-5">
      <DirectoryFilters
        search={search}
        onSearchChange={setSearch}
        yearFilter={yearFilter}
        onYearFilterChange={setYearFilter}
        rfidFilter={rfidFilter}
        onRfidFilterChange={setRfidFilter}
        major={major}
        onMajorChange={setMajor}
        counts={counts}
        onResetPage={resetPage}
      />

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto border-b border-border">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-micro font-bold uppercase tracking-[0.08em] text-muted-foreground">
                <th className="px-4 py-3 sm:px-5">Student Name</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Degree &amp; Major</th>
                <th className="px-4 py-3">RFID Credential</th>
                <th className="px-4 py-3 text-right sm:px-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((s) => (
                <StudentTableRow
                  key={s.id}
                  student={s}
                  courses={courses}
                  majors={majors}
                />
              ))}
            </tbody>
          </table>
        </div>

        {visible.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <SearchX className="h-10 w-10 text-muted-foreground/60" />
            <p className="text-sm font-semibold text-muted-foreground">
              No students found
            </p>
            <p className="text-xs text-muted-foreground">
              Try another name, ID, department, or clear the filters.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="mt-2"
            >
              Clear filters
            </Button>
          </div>
        )}

        <DirectoryPagination
          showingFrom={showingFrom}
          showingTo={showingTo}
          total={filtered.length}
          page={safePage}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
