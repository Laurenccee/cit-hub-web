"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DeskCheckin, EventAttendanceRecord } from "../types";
import { getRecentCheckinsAction } from "../action";
import { createDebouncer } from "../utils";

interface ScanRow {
  key: string;
  title: string;
  subtitle: string;
  direction: 'in' | 'out';
  elapsed: number;
}

function formatAgo(elapsed: number) {
  if (elapsed < 60) return `${elapsed}s ago`;
  return `${Math.floor(elapsed / 60)}m ago`;
}

function recordToScanRow(record: DeskCheckin | EventAttendanceRecord): ScanRow {
  const isCheckIn = Boolean(record.check_in) && !record.check_out;
  const timestamp = (isCheckIn ? record.check_in : record.check_out) ?? record.created_at;
  const student = (record as DeskCheckin).student ?? null;

  const title = student
    ? `${student.first_name} ${student.last_name}`
    : 'Unknown visitor';
  const subtitle = student?.student_id ?? 'Unregistered';

  return {
    key: record.id,
    title,
    subtitle,
    direction: isCheckIn ? 'in' : 'out',
    elapsed: Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)),
  };
}

export default function LiveActivityFeed({
  eventId,
  initialRecent = [],
}: {
  eventId: string;
  initialRecent?: (DeskCheckin | EventAttendanceRecord)[];
}) {
  const [rows, setRows] = useState<ScanRow[]>(() =>
    initialRecent.slice(0, 3).map(recordToScanRow),
  );

  // Keep the "Xs ago" labels ticking.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setRows((current) =>
        current.map((row) => ({ ...row, elapsed: row.elapsed + 1 })),
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Real-time taps, with a slow poll only as a fallback.
  useEffect(() => {
    let cancelled = false;
    let inflight = false;

    const fetchRecent = async () => {
      if (inflight || cancelled) return;
      inflight = true;
      try {
        const data = await getRecentCheckinsAction(eventId);
        if (cancelled) return;
        const records = (data.checkins ?? []) as DeskCheckin[];
        setRows(records.slice(0, 3).map(recordToScanRow));
      } catch {
        // Keep the last known rows on network failure.
      } finally {
        inflight = false;
      }
    };

    const debouncedFetch = createDebouncer();
    const channel = createClient()
      .channel(`attendance-feed:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_attendance',
          filter: `event_id=eq.${eventId}`,
        },
        () => debouncedFetch.schedule(() => void fetchRecent()),
      )
      .subscribe();

    const timer = window.setInterval(fetchRecent, 45000);
    fetchRecent();
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      debouncedFetch.cancel();
      void createClient().removeChannel(channel);
    };
  }, [eventId]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-micro font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Recent live activity
        </p>
        <p className="flex items-center gap-1.5 text-micro text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          Auto-syncing • Gate A
        </p>
      </div>
      <ul className="mt-2 flex flex-col gap-1.5">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5"
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                row.direction === 'in' ? 'bg-success' : 'bg-warning'
              }`}
            />
            <span className="truncate text-micro font-bold text-foreground">
              {row.title}
            </span>
            <span className="truncate text-micro text-muted-foreground">{row.subtitle}</span>
            <span
              className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-micro font-semibold ${
                row.direction === 'in'
                  ? 'bg-success/10 text-success'
                  : 'bg-warning/10 text-warning'
              }`}
            >
              {row.direction === 'in' ? 'In' : 'Out'} • {formatAgo(row.elapsed)}
            </span>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="py-2 text-center text-xs text-muted-foreground">
            No recent activity
          </li>
        )}
      </ul>
    </div>
  );
}
