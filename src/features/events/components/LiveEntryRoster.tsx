"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
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
    "Name,Student ID,Program,Check In,Check Out,State",
    ...rows.map((row) => {
      const state = row.check_out ? "Out" : "Inside";
      return [
        escape(rowName(row)),
        escape(row.student?.student_id ?? "Unregistered"),
        escape(rowProgram(row)),
        escape(row.check_in ?? ""),
        escape(row.check_out ?? ""),
        escape(state),
      ].join(",");
    }),
  ];
  return lines.join("\n");
}

function rowInitials(row: DeskCheckin) {
  if (!row.student) return "?";
  return `${row.student.first_name.charAt(0)}${row.student.last_name.charAt(0)}`.toUpperCase();
}

function matchesQuery(row: DeskCheckin, query: string) {
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
}

function filterRoster(checkins: DeskCheckin[], search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return checkins;
  return checkins.filter((row) => matchesQuery(row, query));
}

function RosterStudentCell({ row }: { row: DeskCheckin }) {
  const name = rowName(row);
  return (
    <td className="px-2 py-2.5">
      <span className="flex items-center gap-2.5">
        <StudentAvatar
          url={row.student?.profile_picture_url}
          name={name}
          initials={rowInitials(row)}
          className="h-9 w-9"
          size={36}
        />
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-foreground">
            {name}
          </span>
          <span className="block whitespace-nowrap font-mono text-micro text-muted-foreground">
            {row.student?.student_id ?? "Unregistered"}
          </span>
        </span>
      </span>
    </td>
  );
}

function RosterDeleteButton({
  name,
  armed,
  deleting,
  onClick,
}: {
  name: string;
  armed: boolean;
  deleting: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={armed ? "destructive" : "ghost"}
      size="sm"
      title={armed ? "Click again to confirm delete" : "Remove record"}
      aria-label={armed ? `Confirm removal of ${name}` : `Remove ${name}`}
      onClick={onClick}
      disabled={deleting}
      className="h-7 gap-1 px-2 text-micro font-bold text-muted-foreground hover:text-destructive"
    >
      {deleting ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : armed ? (
        "Sure?"
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

function RosterRow({
  row,
  armed,
  deleting,
  onDelete,
}: {
  row: DeskCheckin;
  armed: boolean;
  deleting: boolean;
  onDelete: (id: string) => Promise<void>;
}) {
  const inside = !row.check_out;
  return (
    <tr className="transition-colors hover:bg-muted/50">
      <RosterStudentCell row={row} />
      <td className="whitespace-nowrap px-2 py-2.5">
        <span className="block max-w-32 truncate text-sm font-bold text-foreground">
          {rowProgram(row)}
        </span>
      </td>
      <td className="whitespace-nowrap px-2 py-2.5 font-mono text-xs text-muted-foreground">
        {formatTapTime(row.check_in)}
      </td>
      <td className="whitespace-nowrap px-2 py-2.5">
        <span className="flex items-center justify-end gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-bold",
              inside ? "text-success" : "text-warning",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                inside ? "bg-success" : "bg-warning",
              )}
            />
            {inside ? "Inside" : "Out"}
          </span>
          <RosterDeleteButton
            name={rowName(row)}
            armed={armed}
            deleting={deleting}
            onClick={() => void onDelete(row.id)}
          />
        </span>
      </td>
    </tr>
  );
}

function RosterPagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: Dispatch<SetStateAction<number>>;
}) {
  return (
    <nav className="flex items-center gap-1" aria-label="Roster pages">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange((p) => Math.max(1, p - 1))}
        className="h-8 gap-0.5 px-2.5 text-xs font-semibold"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Prev
      </Button>
      {pageNumbers(page, pageCount).map((n, i) =>
        n === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-xs text-muted-foreground/60">
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            aria-current={n === page ? "page" : undefined}
            onClick={() => onPageChange(n)}
            className={cn(
              "h-8 min-w-8 rounded-full px-2 text-xs font-bold transition-colors",
              n === page
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
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
        disabled={page >= pageCount}
        onClick={() => onPageChange((p) => Math.min(pageCount, p + 1))}
        className="h-8 gap-0.5 px-2.5 text-xs font-semibold"
      >
        Next
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </nav>
  );
}

export default function LiveEntryRoster({
  checkins,
  totalRecords,
  eventSlug,
  onDelete,
}: LiveEntryRosterProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [armingId, setArmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => filterRoster(checkins, search), [checkins, search]);

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
    <Card className="min-w-0 gap-4 bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-section text-foreground">
            Live Entry Roster
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Real-time stream of checked-in delegates
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="h-9 gap-1.5 px-3 text-xs font-bold text-muted-foreground"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      <InputGroup className="h-10 rounded-full">
        <InputGroupAddon className="text-muted-foreground">
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
          className="text-xs text-foreground"
        />
      </InputGroup>

      <div className="overflow-x-auto">
        <table className="w-full min-w-120 text-sm">
          <thead>
            <tr className="text-left text-micro font-bold uppercase tracking-label-wide text-muted-foreground">
              <th className="px-2 py-2.5">Student Delegate</th>
              <th className="px-2 py-2.5">Program</th>
              <th className="px-2 py-2.5">Check-in Time</th>
              <th className="px-2 py-2.5 text-right">Current State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <RosterRow
                key={row.id}
                row={row}
                armed={armingId === row.id}
                deleting={deletingId === row.id}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No attendees match this filter yet. Scan a card to begin.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-bold text-foreground">
            {rows.length} of {totalRecords.toLocaleString()}
          </span>{" "}
          attendee event records
        </p>
        <RosterPagination
          page={safePage}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      </div>
    </Card>
  );
}
