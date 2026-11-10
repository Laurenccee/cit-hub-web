import type { DeskStudent } from "./types";

export const ATTENDEE_SELECT =
  "id, first_name, last_name, student_id, profile_picture_url, year_level, rfid_uid, courses ( code, name ), majors ( code, name )";

export interface RawAttendeeRow {
  id: string;
  first_name: string;
  last_name: string;
  student_id?: string | null;
  profile_picture_url?: string | null;
  year_level?: string | null;
  rfid_uid?: string | null;
  courses?:
    | { code?: string | null; name?: string | null }
    | null
    | Array<{ code?: string | null; name?: string | null } | null>;
  majors?:
    | { code?: string | null; name?: string | null }
    | null
    | Array<{ code?: string | null; name?: string | null } | null>;
}

/** Supabase returns a to-one join as an object or a one-element array. */
function flattenJoin(joined: RawAttendeeRow["courses"]) {
  const first = Array.isArray(joined) ? joined[0] : joined;
  return { code: first?.code ?? null, name: first?.name ?? null };
}

/**
 * Everything the gate badge and roster need to identify a student, flattened
 * from the courses/majors joins. `rfid_uid` is intentionally stripped by
 * `toDeskStudent` before anything leaves the server.
 */
export function toDeskStudent(row: RawAttendeeRow): DeskStudent {
  const course = flattenJoin(row.courses);
  const major = flattenJoin(row.majors);
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    student_id: row.student_id ?? null,
    profile_picture_url: row.profile_picture_url ?? null,
    year_level: row.year_level ?? null,
    course_code: course.code,
    course_name: course.name,
    major_code: major.code,
    major_name: major.name,
  };
}

/**
 * Canonical form of a card UID: trimmed, separators stripped, upper-cased.
 * Used as the cache key so a card resolves the same way offline and online.
 */
export function normalizeUid(cardUid: string) {
  return cardUid.trim().replace(/[\s:.-]/g, "").toUpperCase();
}

/**
 * Every spelling a card UID might arrive in: as scanned, upper-cased, and
 * compacted. Shared by the server lookup and the offline roster cache so both
 * resolve the same card.
 */
export function uidVariants(cardUid: string) {
  const raw = cardUid.trim();
  return Array.from(new Set([raw, raw.toUpperCase(), normalizeUid(raw)]));
}

/**
 * Idempotency key for one tap, generated on the device so a replay can be
 * recognised as the same tap. `crypto.randomUUID` needs a secure context, and
 * a kiosk may be served over plain HTTP on a LAN address, so fall back to
 * `getRandomValues` and finally to a timestamp+counter.
 */
export function createClientId() {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
    if (typeof crypto.getRandomValues === "function") {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    }
  }
  return `tap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function isEventLive(
  event: { start_date: string; end_date?: string | null },
  now = new Date(),
) {
  const start = new Date(event.start_date).getTime();
  const end = event.end_date
    ? new Date(event.end_date).getTime()
    : Number.POSITIVE_INFINITY;
  const at = now.getTime();
  return start <= at && at <= end;
}

/**
 * Trailing-edge debouncer for realtime bursts. `window` is only touched when
 * the returned functions run, so this is safe to import from server code.
 */
export function createDebouncer(delay = 300) {
  let timer: number | null = null;

  const cancel = () => {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  };

  const schedule = (callback: () => void) => {
    cancel();
    timer = window.setTimeout(() => {
      timer = null;
      callback();
    }, delay);
  };

  return { schedule, cancel };
}
