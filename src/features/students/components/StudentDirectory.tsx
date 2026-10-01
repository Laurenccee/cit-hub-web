"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  IdCard,
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

type DepartmentFilter = "ALL" | "CCS" | "COE" | "CBA" | "CAS";

const pageSize = 8;

const departments: { label: string; value: DepartmentFilter; short: string }[] =
  [
    { label: "All Departments", value: "ALL", short: "All" },
    { label: "CCS • Computer Studies", value: "CCS", short: "CCS" },
    { label: "COE • Engineering", value: "COE", short: "COE" },
    { label: "CBA • Business Admin", value: "CBA", short: "CBA" },
    { label: "CAS • Arts & Sciences", value: "CAS", short: "CAS" },
  ];

const avatarPalette = [
  "bg-red-100 text-[#8B1A1A]",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
  "bg-cyan-100 text-cyan-700",
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

function standingClasses(standing: string) {
  if (/dean/i.test(standing))
    return "border-amber-200 bg-amber-50 text-amber-700";
  if (/probation|suspension/i.test(standing))
    return "border-red-200 bg-red-50 text-red-700";
  return "border-green-200 bg-green-50 text-green-700";
}

function presenceDot(presence: DirectoryStudent["presence"]) {
  if (presence === "inside") return "bg-green-500";
  if (presence === "issue") return "bg-amber-500";
  return "bg-slate-300";
}

export default function StudentDirectory({
  students,
  courses,
  majors,
}: StudentDirectoryProps) {
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [rfidFilter, setRfidFilter] = useState("all");
  const [standingFilter, setStandingFilter] = useState("all");
  const [department, setDepartment] = useState<DepartmentFilter>("ALL");
  const [page, setPage] = useState(1);

  const standings = useMemo(
    () => Array.from(new Set(students.map((s) => s.standing))).sort(),
    [students],
  );

  const counts = useMemo(() => {
    const result: Record<string, number> = { ALL: students.length };
    for (const s of students)
      result[s.department] = (result[s.department] ?? 0) + 1;
    return result;
  }, [students]);

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      students.filter((s) => {
        if (department !== "ALL" && s.department !== department) return false;
        if (
          yearFilter !== "all" &&
          !s.yearLevel.toLowerCase().startsWith(yearFilter)
        )
          return false;
        if (rfidFilter !== "all" && s.rfidStatus !== rfidFilter) return false;
        if (standingFilter !== "all" && s.standing !== standingFilter)
          return false;
        if (!normalizedSearch) return true;
        return [
          `${s.firstName} ${s.lastName}`,
          s.studentId,
          s.rfidUid,
          s.nfcTag,
          s.course,
          s.major,
          s.college,
          s.standing,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      }),
    [
      students,
      department,
      yearFilter,
      rfidFilter,
      standingFilter,
      normalizedSearch,
    ],
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
    setStandingFilter("all");
    setDepartment("ALL");
    setPage(1);
  };

  const showingFrom = filtered.length === 0 ? 0 : start + 1;
  const showingTo = Math.min(start + pageSize, filtered.length);

  return (
    <div className="flex flex-col gap-5">
      {/* Filter card */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              placeholder="Search by student name, ID (CIT-202X), RFID UID, program, or standing..."
              aria-label="Search students"
              className="h-10 bg-white pl-9 pr-9 text-xs"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  resetPage();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:w-auto">
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                resetPage();
              }}
              aria-label="Filter by year level"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30"
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
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30"
            >
              <option value="all">RFID Status: All</option>
              <option value="linked">Linked</option>
              <option value="pending">Pending Assignment</option>
              <option value="unlinked">Not Linked</option>
            </select>
            <select
              value={standingFilter}
              onChange={(e) => {
                setStandingFilter(e.target.value);
                resetPage();
              }}
              aria-label="Filter by academic standing"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30"
            >
              <option value="all">Academic Standing: All</option>
              {standings.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="-mx-1 mt-3 flex gap-2 overflow-x-auto border-t border-slate-100 px-1 pt-3"
          role="group"
          aria-label="Filter by department"
        >
          {departments.map(({ label, value }) => {
            const active = department === value;
            const count = counts[value] ?? 0;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setDepartment(value);
                  resetPage();
                }}
                className={cn(
                  "h-8 shrink-0 rounded-lg border px-3 text-xs font-semibold transition-colors",
                  active
                    ? "border-[#8B1A1A] bg-[#8B1A1A] text-white"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800",
                )}
              >
                {label} ({count.toLocaleString()})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-800">{showingFrom}</span> to{" "}
            <span className="font-bold text-slate-800">{showingTo}</span> of{" "}
            <span className="font-bold text-slate-800">
              {filtered.length.toLocaleString()}
            </span>{" "}
            students
          </p>
          <Pagination
            page={safePage}
            pageCount={pageCount}
            onChange={setPage}
          />
        </div>

        <div className="overflow-x-auto border-y border-slate-100">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                <th className="px-4 py-3 sm:px-5">Student (Photo & Name)</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Course & Major</th>
                <th className="px-4 py-3">RFID Credential</th>
                <th className="px-4 py-3 text-right sm:px-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((s) => (
                <tr
                  key={s.id}
                  className="transition-colors hover:bg-slate-50/60"
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
                            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                            presenceDot(s.presence),
                          )}
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-slate-900">
                          {s.firstName} {s.lastName}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-500">
                          {s.yearLevel}
                          <span className="text-slate-300">•</span>
                          <span
                            className={cn(
                              "rounded border px-1.5 py-px text-[10px] font-semibold leading-4",
                              standingClasses(s.standing),
                            )}
                          >
                            {s.standing}
                          </span>
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="inline-flex rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] font-bold text-[#8B1A1A] shadow-sm">
                      {s.studentId}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-semibold text-slate-800">
                      {s.course}
                    </p>
                    {s.major && (
                      <p className="text-xs text-slate-500">
                        Major in {s.major}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400">{s.college}</p>
                  </td>
                  <td className="px-4 py-3">
                    {s.rfidStatus === "linked" ? (
                      <span className="inline-flex max-w-[190px] items-center gap-1.5 truncate rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                        <span className="truncate">{s.nfcTag ?? "Linked"}</span>
                      </span>
                    ) : s.rfidStatus === "pending" ? (
                      <span className="inline-flex max-w-[190px] items-center gap-1.5 truncate rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        <span className="truncate">
                          {s.nfcTag ?? "Pending"}
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-400">
                        Not linked
                      </span>
                    )}
                    {s.rfidUid && (
                      <p className="mt-1 text-[10px] tracking-wide text-slate-400">
                        UID: {s.rfidUid}
                      </p>
                    )}
                    {s.rfidNote && (
                      <p
                        className={cn(
                          "mt-1 text-[11px] font-medium",
                          s.rfidStatus === "pending"
                            ? "text-amber-600"
                            : "text-slate-400",
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
                          className="h-8 w-8 text-slate-400 hover:text-slate-700"
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
            <SearchX className="h-10 w-10 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">
              No students found
            </p>
            <p className="text-xs text-slate-400">
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

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-800">{showingFrom}</span> to{" "}
            <span className="font-bold text-slate-800">{showingTo}</span> of{" "}
            <span className="font-bold text-slate-800">
              {filtered.length.toLocaleString()}
            </span>{" "}
            students
          </p>
          <Pagination
            page={safePage}
            pageCount={pageCount}
            onChange={setPage}
          />
        </div>
      </div>
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
        className="h-8 gap-1 bg-white px-2.5 text-xs"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Prev
      </Button>
      {items.map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} className="px-0.5 text-xs text-slate-400">
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
              item === page ? "bg-[#8B1A1A] hover:bg-[#6B1515]" : "bg-white",
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
        className="h-8 gap-1 bg-white px-2.5 text-xs"
      >
        Next
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </nav>
  );
}
