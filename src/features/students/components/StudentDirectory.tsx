"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
  SearchX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Course, DirectoryStudent, Major } from "../types";
import EditStudentDialog from "./EditStudentDialog";
import PromoteToPioneerButton from "./PromoteToPioneerButton";
import RfidLinkButton from "./RfidLinkButton";
import { cn } from "@/lib/utils";

interface StudentDirectoryProps {
  students: DirectoryStudent[];
  courses: Course[];
  majors: Major[];
}

type MajorFilter = "ALL" | "AT" | "MT" | "ET" | "ELX" | "CT" | "ARDT" | "CLT" | "BCWT" | "AFT";

const pageSize = 8;

const majorFilters: { label: string; value: MajorFilter }[] = [
  { label: "All Majors", value: "ALL" },
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

const avatarPalette = [
  "bg-primary/10 text-primary",
  "bg-secondary text-secondary-foreground",
  "bg-accent text-accent-foreground",
  "bg-muted text-muted-foreground",
  "bg-primary/5 text-primary",
  "bg-muted/70 text-muted-foreground",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1)
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return avatarPalette[hash % avatarPalette.length];
}

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function presenceDot(presence: DirectoryStudent["presence"]) {
  if (presence === "inside") return "bg-success";
  if (presence === "issue") return "bg-warning";
  return "bg-muted-foreground/40";
}

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
      {/* Filter card */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              placeholder="Search by student name, ID (CIT-202X), RFID UID, or program..."
              aria-label="Search students"
              className="h-10 bg-card pl-9 pr-9 text-xs"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  resetPage();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:w-auto">
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                resetPage();
              }}
              aria-label="Filter by year level"
              className="h-10 rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            >
              <option value="all">All Year Levels</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
            </select>
            <select
              value={rfidFilter}
              onChange={(e) => {
                setRfidFilter(e.target.value);
                resetPage();
              }}
              aria-label="Filter by RFID status"
              className="h-10 rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            >
              <option value="all">RFID Status: All</option>
              <option value="linked">Linked</option>
              <option value="pending">Pending Assignment</option>
              <option value="unlinked">Not Linked</option>
            </select>
          </div>
        </div>

        <div
          className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3"
          role="group"
          aria-label="Filter by major"
        >
          {majorFilters.map(({ label, value }) => {
            const active = major === value;
            const count = counts[value] ?? 0;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                aria-label={`${label} (${count.toLocaleString()})`}
                onClick={() => {
                  setMajor(value);
                  resetPage();
                }}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-px text-micro font-bold leading-4",
                    active
                      ? "bg-card/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {count.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <DirectoryFooter
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
                <tr
                  key={s.id}
                  className="transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-3">
                      <span className="relative shrink-0">
                        <span
                          className={cn(
                            "flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-xs font-bold",
                            !s.photoUrl &&
                              avatarColor(`${s.firstName} ${s.lastName}`),
                          )}
                        >
                          {s.photoUrl ? (
                            <Image
                              src={s.photoUrl}
                              alt={`${s.firstName} ${s.lastName}`}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            initials(s.firstName, s.lastName)
                          )}
                        </span>
                        <span
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                            presenceDot(s.presence),
                          )}
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-foreground">
                          {s.firstName} {s.lastName}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {s.yearLevel}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="inline-flex rounded-md border border-border bg-card px-2 py-1 font-mono text-micro font-bold text-primary shadow-sm">
                      {s.studentId}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">
                      {s.course}
                    </p>
                    {s.major && (
                      <p className="text-xs text-muted-foreground">
                        Major in {s.major}
                      </p>
                    )}
                    <p className="text-micro text-muted-foreground">{s.college}</p>
                  </td>
                  <td className="px-4 py-3">
                    {s.rfidStatus === "linked" ? (
                      <span className="inline-flex max-w-[190px] items-center gap-1.5 truncate rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-micro font-semibold text-success">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                        <span className="truncate">{s.nfcTag ?? "Linked"}</span>
                      </span>
                    ) : s.rfidStatus === "pending" ? (
                      <span className="inline-flex max-w-[190px] items-center gap-1.5 truncate rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-micro font-semibold text-warning">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                        <span className="truncate">
                          {s.nfcTag ?? "Pending"}
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-micro font-medium text-muted-foreground">
                        Not linked
                      </span>
                    )}
                    {s.rfidUid && (
                      <p className="mt-1 text-micro tracking-wide text-muted-foreground">
                        UID: {s.rfidUid}
                      </p>
                    )}
                    {s.rfidNote && (
                      <p
                        className={cn(
                          "mt-1 text-micro font-medium",
                          s.rfidStatus === "pending"
                            ? "text-warning"
                            : "text-muted-foreground",
                        )}
                      >
                        {s.rfidNote}
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right sm:px-5">
                    <span className="inline-flex items-center gap-0.5">
                      {s.source ? (
                        <>
                          <PromoteToPioneerButton student={s.source} />
                          <EditStudentDialog
                            student={s.source}
                            courses={courses}
                            majors={majors}
                          />
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${s.firstName} ${s.lastName}`}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <RfidLinkButton
                        studentId={s.id}
                        studentName={`${s.firstName} ${s.lastName}`}
                      />
                    </span>
                  </td>
                </tr>
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

        <DirectoryFooter
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

function DirectoryFooter({
  showingFrom,
  showingTo,
  total,
  page,
  pageCount,
  onPageChange,
}: {
  showingFrom: number;
  showingTo: number;
  total: number;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
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
