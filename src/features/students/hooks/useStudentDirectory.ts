"use client";

import { useMemo, useState } from "react";
import type { DirectoryStudent, MajorFilter } from "../types";

const pageSize = 8;

interface UseStudentDirectoryProps {
  students: DirectoryStudent[];
}

interface UseStudentDirectoryReturn {
  search: string;
  setSearch: (value: string) => void;
  yearFilter: string;
  setYearFilter: (value: string) => void;
  rfidFilter: string;
  setRfidFilter: (value: string) => void;
  major: MajorFilter;
  setMajor: (value: MajorFilter) => void;
  setPage: (page: number) => void;
  counts: Record<string, number>;
  filtered: DirectoryStudent[];
  visible: DirectoryStudent[];
  showingFrom: number;
  showingTo: number;
  pageCount: number;
  safePage: number;
  clearAll: () => void;
  resetPage: () => void;
}

export function useStudentDirectory({
  students,
}: UseStudentDirectoryProps): UseStudentDirectoryReturn {
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

  return {
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
  };
}