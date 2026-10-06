"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DeskCheckin, EventAttendance, ScanState } from "../types";
import { DeskDirection, logDeskCheckinAction, getRecentCheckinsAction } from "../action";

interface UseScanTerminalOptions {
  eventId: string;
  direction: DeskDirection;
  initialCheckins: DeskCheckin[];
  initialAttendance: EventAttendance;
}

const LIST_LIMIT = 50;

/** Merge polled rows into the visible list: fresh rows win, newest first. */
function mergeCheckins(previous: DeskCheckin[], fresh: DeskCheckin[]) {
  const merged = new Map(previous.map((row) => [row.id, row]));
  for (const row of fresh) merged.set(row.id, row);
  return [...merged.values()]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, LIST_LIMIT);
}

export function useScanTerminal({
  eventId,
  direction,
  initialCheckins,
  initialAttendance,
}: UseScanTerminalOptions) {
  const [scan, setScan] = useState<ScanState>({ kind: "idle" });
  const [buffer, setBuffer] = useState("");
  const [manualUid, setManualUid] = useState("");
  const [checkins, setCheckins] = useState(initialCheckins);
  const [attendance, setAttendance] = useState(initialAttendance);
  const bufferRef = useRef("");
  const processingRef = useRef(false);

  const processScan = useCallback(
    async (cardUid: string) => {
      const uid = cardUid.trim();
      if (!uid || processingRef.current) return;
      processingRef.current = true;
      setScan({ kind: "processing", uid });

      try {
        const result = await logDeskCheckinAction(eventId, uid, direction);
        if (result.success && result.record && result.student) {
          // Instant local update — no page refetch.
          const entry: DeskCheckin = {
            ...result.record,
            student: {
              first_name: result.student.first_name,
              last_name: result.student.last_name,
              student_id: result.student.student_id,
              profile_picture_url: result.student.profile_picture_url,
            },
          };
          setCheckins((prev) => mergeCheckins(prev, [entry]));
          setAttendance((prev) =>
            direction === "in"
              ? { ...prev, present: prev.present + 1, total: prev.total + 1 }
              : {
                  ...prev,
                  present: Math.max(0, prev.present - 1),
                  departed: prev.departed + 1,
                },
          );
          setScan({ kind: "success", message: result.message, direction });
        } else if (result.alreadyInside || result.noActiveVisit) {
          setScan({ kind: "warning", message: result.message });
        } else {
          setScan({ kind: "error", message: result.message });
        }
      } catch {
        setScan({ kind: "error", message: "Connection error. Try again." });
      } finally {
        processingRef.current = false;
      }
    },
    [eventId, direction],
  );

  // USB HID wedge capture: scanners type the UID + Enter.
  useEffect(() => {
    let resetTimer = 0;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Enter") {
        const uid = bufferRef.current.trim();
        bufferRef.current = "";
        setBuffer("");
        if (uid.length >= 3) void processScan(uid);
        return;
      }
      if (e.key.length === 1) {
        bufferRef.current += e.key;
        setBuffer(bufferRef.current);
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          bufferRef.current = "";
          setBuffer("");
        }, 200);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(resetTimer);
    };
  }, [processScan]);

  // Live attendance: subscribe to Postgres changes so any station's tap shows
  // up immediately. The payload has no student details, so a change triggers
  // the same cheap snapshot fetch the fallback poll uses.
  useEffect(() => {
    let cancelled = false;
    let inflight = false;

    const sync = async () => {
      if (inflight || cancelled) return;
      inflight = true;
      try {
        const data = await getRecentCheckinsAction(eventId);
        if (cancelled) return;
        if (data.attendance) {
          setAttendance((prev) => ({ ...prev, ...data.attendance }));
        }
        if (Array.isArray(data.checkins)) {
          setCheckins((prev) => mergeCheckins(prev, data.checkins));
        }
      } catch {
        // Keep last known state on network failure.
      } finally {
        inflight = false;
      }
    };

    const channel = createClient()
      .channel(`attendance:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_attendance",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          void sync();
        },
      )
      .subscribe();

    // Fallback for when realtime is unavailable, and to self-heal after the
    // socket reconnects.
    const timer = window.setInterval(sync, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      void createClient().removeChannel(channel);
    };
  }, [eventId]);

  const handleManualSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setManualUid((current) => {
        if (current.trim()) void processScan(current);
        return "";
      });
    },
    [processScan],
  );

  return {
    scan,
    buffer,
    manualUid,
    setManualUid,
    checkins,
    attendance,
    processScan,
    handleManualSubmit,
  };
}
