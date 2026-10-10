"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DeskCheckin,
  DeskCheckinRecord,
  DeskStudent,
  DeskSyncStatus,
  EventAttendance,
  LastTapResult,
  ScanState,
} from "../types";
import { DeskDirection, deleteAttendanceRecordAction, logDeskCheckinAction, getRecentCheckinsAction } from "../action";
import { getRosterSnapshotAction } from "../action/roster";
import { createClientId, createDebouncer } from "../utils";
import {
  countPendingTaps,
  enqueueTap,
  findStudentByUid,
  getRosterSyncedAt,
  listPendingTaps,
  removePendingTap,
  replaceRoster,
  toCachedStudent,
} from "../lib/offline-db";

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
  const [manualUid, setManualUid] = useState("");
  const [checkins, setCheckins] = useState(initialCheckins);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [lastResult, setLastResult] = useState<LastTapResult | null>(null);
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [rosterSyncedAt, setRosterSyncedAt] = useState<string | null>(null);
  const bufferRef = useRef("");
  const processingRef = useRef(false);
  const flushingRef = useRef(false);

  /** Fold one committed tap into the visible list and the counters. */
  const applyTapResult = useCallback(
    (record: DeskCheckinRecord, student: DeskStudent, tapDirection: DeskDirection) => {
      const entry: DeskCheckin = {
        ...record,
        student: {
          first_name: student.first_name,
          last_name: student.last_name,
          student_id: student.student_id,
          profile_picture_url: student.profile_picture_url,
          year_level: student.year_level ?? null,
          course_code: student.course_code ?? null,
          course_name: student.course_name ?? null,
          major_code: student.major_code ?? null,
          major_name: student.major_name ?? null,
        },
      };
      setCheckins((prev) => mergeCheckins(prev, [entry]));
      setAttendance((prev) =>
        tapDirection === "in"
          ? { ...prev, present: prev.present + 1, total: prev.total + 1 }
          : {
              ...prev,
              present: Math.max(0, prev.present - 1),
              departed: prev.departed + 1,
            },
      );
    },
    [],
  );

  /**
   * The server was unreachable. Resolve the card from the local roster so the
   * operator still sees a name, then park the tap in IndexedDB for replay.
   */
  const queueOfflineTap = useCallback(
    async (uid: string, clientId: string, clientTimestamp: string) => {
      try {
        const cached = await findStudentByUid(uid);
        await enqueueTap({ id: clientId, eventId, cardUid: uid, direction, clientTimestamp });
        const queued = await countPendingTaps();
        setPending(queued);

        // A no-op enqueue means this device cannot store taps at all.
        if (queued === 0) {
          const message = "Offline, and this device cannot store taps. Reconnect to record.";
          setScan({ kind: "error", message });
          setLastResult({ student: cached, identifier: uid, message, tone: "error", at: clientTimestamp });
          return;
        }

        const message = cached
          ? `${cached.first_name} ${cached.last_name} — saved on this device.`
          : `Card ${uid} — saved on this device.`;
        setScan({ kind: "queued", message, direction });
        setLastResult({ student: cached, identifier: uid, message, tone: "queued", at: clientTimestamp });
      } catch {
        const message = "Offline, and this device cannot store taps. Reconnect to record.";
        setScan({ kind: "error", message });
        setLastResult({ student: null, identifier: uid, message, tone: "error", at: clientTimestamp });
      }
    },
    [eventId, direction],
  );

  /**
   * Write one tap and fold it into the visible state. Every outcome — success,
   * duplicate, unknown card — lands on the ID card via `lastResult`.
   */
  const commitTap = useCallback(
    async (identifier: string, clientId: string, clientTimestamp: string) => {
      try {
        const result = await logDeskCheckinAction(eventId, identifier, direction, {
          clientId,
          clientTimestamp,
        });
        if (result.success && result.record && result.student) {
          // Instant local update — no page refetch.
          applyTapResult(result.record, result.student, direction);
          setScan({ kind: "success", message: result.message, direction });
          setLastResult({
            student: result.student,
            identifier,
            message: result.message,
            tone: "success",
            at: (direction === "in" ? result.record.check_in : result.record.check_out) ?? result.record.created_at,
          });
        } else if (result.alreadyInside || result.noActiveVisit) {
          setScan({ kind: "warning", message: result.message });
          setLastResult({
            student: result.student ?? null,
            identifier,
            message: result.message,
            tone: "warning",
            at: new Date().toISOString(),
          });
        } else {
          setScan({ kind: "error", message: result.message });
          setLastResult({
            student: result.student ?? null,
            identifier,
            message: result.message,
            tone: "error",
            at: new Date().toISOString(),
          });
        }
      } catch {
        await queueOfflineTap(identifier, clientId, clientTimestamp);
      }
    },
    [eventId, direction, applyTapResult, queueOfflineTap],
  );

  const processScan = useCallback(
    async (cardUid: string) => {
      const uid = cardUid.trim();
      if (!uid || processingRef.current) return;
      processingRef.current = true;
      setScan({ kind: "processing", uid });

      // The tap's own identity, so a retry of this exact tap is recognised as
      // already applied instead of opening a second visit.
      const clientId = createClientId();
      const clientTimestamp = new Date().toISOString();

      try {
        await commitTap(uid, clientId, clientTimestamp);
      } finally {
        processingRef.current = false;
      }
    },
    [commitTap],
  );

  /**
   * Remove one attendance record (admin only). The row and counters update
   * instantly on success; realtime sync converges every station afterwards.
   */
  const removeCheckin = useCallback(async (recordId: string): Promise<boolean> => {
    const target = checkins.find((row) => row.id === recordId);
    if (!target) return false;
    try {
      const result = await deleteAttendanceRecordAction(recordId);
      if (!result.success) {
        setScan({ kind: "error", message: result.message });
        return false;
      }
    } catch {
      setScan({ kind: "error", message: "Could not delete that record. Try again." });
      return false;
    }
    setCheckins((prev) => prev.filter((row) => row.id !== recordId));
    setAttendance((prev) => ({
      ...prev,
      present: target.check_out ? prev.present : Math.max(0, prev.present - 1),
      departed: target.check_out ? Math.max(0, prev.departed - 1) : prev.departed,
      total: Math.max(0, prev.total - 1),
    }));
    return true;
  }, [checkins]);

  /** Back to a clean gate: no receipt, ready for the next tap. */
  const resetTerminal = useCallback(() => {
    setLastResult(null);
    setManualUid("");
    setScan({ kind: "idle" });
  }, []);

  /**
   * Replay queued taps oldest-first. `listPendingTaps` sorts by client
   * timestamp, so a check-out never lands before the check-in that opened it.
   */
  const flushQueue = useCallback(async () => {
    if (flushingRef.current) return;
    flushingRef.current = true;
    setSyncing(true);
    try {
      const taps = await listPendingTaps();
      for (const tap of taps) {
        let result;
        try {
          result = await logDeskCheckinAction(tap.eventId, tap.cardUid, tap.direction, {
            clientId: tap.id,
            clientTimestamp: tap.clientTimestamp,
          });
        } catch {
          // Still unreachable — leave the rest queued for the next attempt.
          break;
        }

        if (result.success) {
          await removePendingTap(tap.id);
          if (result.record && result.student && result.record.event_id === eventId) {
            applyTapResult(result.record, result.student, tap.direction);
          }
        } else if (result.alreadyInside || result.noActiveVisit) {
          // Permanently rejected by the server; retrying will never help.
          await removePendingTap(tap.id);
        } else {
          break;
        }
      }
    } finally {
      flushingRef.current = false;
      setSyncing(false);
      setPending(await countPendingTaps().catch(() => 0));
    }
  }, [eventId, applyTapResult]);

  // Track connectivity so the badge and the flush trigger stay honest.
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // Cache the roster so taps can still be resolved to a name while offline.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const cachedAt = await getRosterSyncedAt();
        if (!cancelled && cachedAt) setRosterSyncedAt(cachedAt);

        const snapshot = await getRosterSnapshotAction();
        if (cancelled || !snapshot.success) return;
        await replaceRoster(snapshot.students.map((s) => toCachedStudent(s, s.uid)));
        if (!cancelled) setRosterSyncedAt(snapshot.syncedAt);
      } catch {
        // Offline or IndexedDB unavailable — keep whatever is cached.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Drain the queue on mount, whenever the connection comes back, and on a slow
  // retry while taps are still waiting. The retry matters because the network
  // can be up while the server is unreachable, which `navigator.onLine` cannot
  // see — without it those taps would sit until the next reload.
  useEffect(() => {
    if (!online) return;
    void flushQueue();
    if (pending === 0) return;
    const timer = window.setInterval(() => void flushQueue(), 15000);
    return () => window.clearInterval(timer);
  }, [online, pending, flushQueue]);

  const syncStatus: DeskSyncStatus = useMemo(
    () => ({ online, pending, syncing, rosterSyncedAt }),
    [online, pending, syncing, rosterSyncedAt],
  );

  // USB HID wedge capture: scanners type the UID + Enter.
  useEffect(() => {
    let resetTimer = 0;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Enter") {
        const uid = bufferRef.current.trim();
        bufferRef.current = "";
        if (uid.length >= 3) void processScan(uid);
        return;
      }
      if (e.key.length === 1) {
        bufferRef.current += e.key;
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          bufferRef.current = "";
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

    const debouncedSync = createDebouncer();
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
        () => debouncedSync.schedule(() => void sync()),
      )
      .subscribe();

    // Fallback for when realtime is unavailable, and to self-heal after the
    // socket reconnects.
    const timer = window.setInterval(sync, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      debouncedSync.cancel();
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
    manualUid,
    setManualUid,
    checkins,
    attendance,
    syncStatus,
    processScan,
    handleManualSubmit,
    lastResult,
    resetTerminal,
    removeCheckin,
  };
}
