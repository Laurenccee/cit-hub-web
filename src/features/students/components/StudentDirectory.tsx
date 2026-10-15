"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Course, DirectoryStudent, Major, MajorFilter, StudentDirectoryProps } from "../types";
import DirectoryFilters, { majorFilters } from "./DirectoryFilters";
import StudentTableRow from "./StudentTableRow";
import DirectoryPagination from "./DirectoryPagination";

const pageSize = 8;

export default function StudentDirectory({
  students,
  courses,
  majors,
}: StudentDirectoryProps) {
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [rfidFilter, setRfidFilter] = useState("all");
  const [major, setMajor] = useState<MajorFilter>("ALL");
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const result: Record<string, number> = { ALL: students.length };
    for (const s of students) {
      if (!s.majorCode) continue;
      result[s.majorCode] = (result[s.majorCode] ?? 0) + 1;
    }
    return result;
  }, [students]);

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      students.filter((s) => {
        if (major !== "ALL" && s.majorCode !== major) return false;
        if (
          yearFilter !== "all" &&
          !s.yearLevel.toLowerCase().startsWith(yearFilter)
        )
          return false;
        if (rfidFilter !== "all" && s.rfidStatus !== rfidFilter) return false;
        if (!normalizedSearch) return true;
        return [
          `${s.firstName} ${s.lastName}`,
          s.studentId,
          s.rfidUid,
          s.nfcTag,
          s.course,
          s.major,
          s.college,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      }),
    [students, major, yearFilter, rfidFilter, normalizedSearch],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  const resetPage = () => setPage(1);

  const clearAll = () => {
    setSearch("");
    setYearFilter("all");
    setRfidFilter("all");
    setMajor("ALL");
    setPage(1);
  };

  const showingFrom = filtered.length === 0 ? 0 : start + 1;
  const showingTo = Math.min(start + pageSize, filtered.length);

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
        <DirectoryPagination
          showingFrom={showingFrom}
          showingTo={showingTo}
          total={filtered.length}
          page={safePage}
          pageCount={pageCount}
          onPageChange={setPage}
        />

        <div className="overflow-x-auto border-y border-border">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="text-left text-micro font-bold uppercase tracking-[0.08em] text-muted-foreground">
                <th className="px-4 py-3 sm:px-5">Student (Photo & Name)</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Course & Major</th>
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
