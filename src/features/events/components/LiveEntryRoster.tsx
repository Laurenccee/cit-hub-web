"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { DeskCheckin } from "../types";
import { collegeIdentityFromCourse } from "../utils";
import StudentAvatar from "./StudentAvatar";

interface LiveEntryRosterProps {
  checkins: DeskCheckin[];
  /** Event-wide tap total for the "Showing X of Y" line. */
  totalRecords: number;
  eventSlug: string;
  /** Remove one record; resolves true when the row is gone. */
  onDelete: (recordId: string) => Promise<boolean>;
}

const PAGE_SIZE = 8;

function rowDept(row: DeskCheckin) {
  return collegeIdentityFromCourse(row.student?.course_name).code;
}

function rowProgram(row: DeskCheckin) {
  return (
    row.student?.course_code ??
    row.student?.course_name ??
    row.student?.major_name ??
    "—"
  );
}

function rowName(row: DeskCheckin) {
  return row.student
    ? `${row.student.first_name} ${row.student.last_name}`
    : "Unknown card";
}

function formatTapTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pageNumbers(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const window = [page - 1, page, page + 1].filter(
    (n) => n > 1 && n < pageCount,
  );
  const items: (number | "…")[] = [1];
  if (window[0] > 2) items.push("…");
  items.push(...window);
  if (window[window.length - 1] < pageCount - 1) items.push("…");
  items.push(pageCount);
  return items;
}

function toCsv(rows: DeskCheckin[]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = [
    "Name,Student ID,Department,Program,Check In,Check Out,State",
    ...rows.map((row) => {
      const state = row.check_out ? "Out" : "Inside";
      return [
        escape(rowName(row)),
        escape(row.student?.student_id ?? "Unregistered"),
        escape(rowDept(row)),
        escape(rowProgram(row)),
        escape(row.check_in ?? ""),
        escape(row.check_out ?? ""),
        escape(state),
      ].join(",");
    }),
  ];
  return lines.join("\n");
}

export default function LiveEntryRoster({
  checkins,
  totalRecords,
  eventSlug,
  onDelete,
}: LiveEntryRosterProps) {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [page, setPage] = useState(1);
  const [armingId, setArmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const departments = useMemo(() => {
    const codes = new Set(checkins.map(rowDept));
    return ["All", ...[...codes].sort()];
  }, [checkins]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return checkins.filter((row) => {
      if (dept !== "All" && rowDept(row) !== dept) return false;
      if (!query) return true;
      return [
        rowName(row),
        row.student?.student_id,
        row.student?.course_name,
        row.student?.major_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [checkins, dept, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /** Two-click delete: first click arms, second click removes the record. */
  const handleDelete = async (id: string) => {
    if (deletingId) return;
    if (armingId !== id) {
      setArmingId(id);
      window.setTimeout(() => {
        setArmingId((current) => (current === id ? null : current));
      }, 3000);
      return;
    }
    setArmingId(null);
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(filtered)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${eventSlug}-roster.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="min-w-0 gap-4 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Live Entry Roster
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Real-time stream of checked-in delegates
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="h-9 gap-1.5 px-3 text-xs font-bold text-slate-600"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <InputGroup className="h-10 flex-1 rounded-full">
          <InputGroupAddon className="text-slate-400">
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name or ID..."
            aria-label="Search roster"
            className="text-xs text-slate-700"
          />
        </InputGroup>
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Filter by department"
        >
          {departments.map((code) => {
            const active = dept === code;
            return (
              <button
                key={code}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setDept(code);
                  setPage(1);
                }}
                className={cn(
                  "h-8 rounded-full px-3.5 text-xs font-bold transition-colors",
                  active
                    ? "bg-[#8B1A1A] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                )}
              >
                {code}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-120 text-sm">
          <thead>
            <tr className="text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-2 py-2.5">Student Delegate</th>
              <th className="px-2 py-2.5">Department • Yr</th>
              <th className="px-2 py-2.5">Check-in Time</th>
              <th className="px-2 py-2.5 text-right">Current State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const name = rowName(row);
              const inside = !row.check_out;
              const initials = row.student
                ? `${row.student.first_name.charAt(0)}${row.student.last_name.charAt(0)}`.toUpperCase()
                : "?";
              return (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-slate-50/60"
                >
                  <td className="px-2 py-2.5">
                    <span className="flex items-center gap-2.5">
                      <StudentAvatar
                        url={row.student?.profile_picture_url}
                        name={name}
                        initials={initials}
                        className="h-9 w-9"
                        size={36}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-bold text-slate-800">
                          {name}
                        </span>
                        <span className="block whitespace-nowrap font-mono text-[11px] text-slate-400">
                          {row.student?.student_id ?? "Unregistered"}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5">
                    <span className="block text-[13px] font-bold text-slate-700">
                      {rowDept(row)}
                    </span>
                    <span className="block max-w-32 truncate text-[11px] text-slate-400">
                      {rowProgram(row)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 font-mono text-xs text-slate-500">
                    {formatTapTime(row.check_in)}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5">
                    <span className="flex items-center justify-end gap-1.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-bold",
                          inside ? "text-green-600" : "text-amber-600",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            inside ? "bg-green-500" : "bg-amber-500",
                          )}
                        />
                        {inside ? "Inside" : "Out"}
                      </span>
                      <Button
                        type="button"
                        variant={armingId === row.id ? "destructive" : "ghost"}
                        size="sm"
                        title={
                          armingId === row.id
                            ? "Click again to confirm delete"
                            : "Remove record"
                        }
                        aria-label={
                          armingId === row.id
                            ? `Confirm removal of ${name}`
                            : `Remove ${name}`
                        }
                        onClick={() => void handleDelete(row.id)}
                        disabled={deletingId === row.id}
                        className="h-7 gap-1 px-2 text-[11px] font-bold text-slate-400 hover:text-red-600"
                      >
                        {deletingId === row.id ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : armingId === row.id ? (
                          "Sure?"
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-slate-400">
            No attendees match this filter yet. Scan a card to begin.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          Showing{" "}
          <span className="font-bold text-slate-700">
            {rows.length} of {totalRecords.toLocaleString()}
          </span>{" "}
          attendee event records
        </p>
        <nav className="flex items-center gap-1" aria-label="Roster pages">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-8 gap-0.5 px-2.5 text-xs font-semibold"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </Button>
          {pageNumbers(safePage, pageCount).map((n, i) =>
            n === "…" ? (
              <span key={`gap-${i}`} className="px-1 text-xs text-slate-300">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                aria-current={n === safePage ? "page" : undefined}
                onClick={() => setPage(n)}
                className={cn(
                  "h-8 min-w-8 rounded-full px-2 text-xs font-bold transition-colors",
                  n === safePage
                    ? "bg-[#8B1A1A] text-white"
                    : "text-slate-500 hover:bg-slate-100",
                )}
              >
                {n}
              </button>
            ),
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={safePage >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            className="h-8 gap-0.5 px-2.5 text-xs font-semibold"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </nav>
      </div>
    </Card>
  );
}
