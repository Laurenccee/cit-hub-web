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

/**
 * College short code + label derived from a course name, for the roster's
 * department pills. Mirrors the student directory's program mapping so the
 * gate roster reads the same way.
 */
export function collegeIdentityFromCourse(course?: string | null): {
  code: string;
  label: string;
} {
  const text = (course ?? "").toLowerCase();
  if (
    /computer science|information systems|information technology|software|data science/.test(
      text,
    )
  ) {
    return { code: "CCS", label: "College of Computer Studies (CCS)" };
  }
  if (/engineering/.test(text)) {
    return { code: "COE", label: "College of Engineering (COE)" };
  }
  if (/accountancy|business|marketing|management|administration/.test(text)) {
    return { code: "CBA", label: "College of Business & Accountancy (CBA)" };
  }
  if (/communication|arts|media|multimedia/.test(text)) {
    return { code: "CAS", label: "College of Arts & Sciences (CAS)" };
  }
  return { code: "OTHER", label: "CIT" };
}
