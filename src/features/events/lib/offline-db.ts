"use client";

import type { DeskStudent } from "../types";
import { normalizeUid } from "../utils";

/**
 * Local-first storage for the check-in desk.
 *
 * Two stores:
 *  - `roster`      the student list, keyed by canonical card UID, so a tap
 *                  resolves without a network round trip.
 *  - `pendingTaps` taps that could not reach the server, replayed in order
 *                  once the connection is back.
 *
 * Every entry point is a no-op when IndexedDB is unavailable (SSR, private
 * browsing, storage disabled), so callers can treat a miss as "fall back to
 * the network" rather than handling an error.
 */

const DB_NAME = "cit-hub-desk";
const DB_VERSION = 1;
const ROSTER_STORE = "roster";
const QUEUE_STORE = "pendingTaps";
const META_STORE = "meta";
const ROSTER_SYNCED_AT = "rosterSyncedAt";

export interface CachedStudent extends DeskStudent {
  /** Canonical card UID; the primary key. */
  uid: string;
}

export interface PendingTap {
  /** Idempotency key, generated on the device; the primary key. */
  id: string;
  eventId: string;
  cardUid: string;
  direction: "in" | "out";
  /** When the tap happened here, which may predate the replay. */
  clientTimestamp: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function hasIndexedDb() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ROSTER_STORE)) {
        db.createObjectStore(ROSTER_STORE, { keyPath: "uid" });
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  // Never cache a failed open, or every later call rejects forever.
  dbPromise.catch(() => {
    dbPromise = null;
  });

  return dbPromise;
}

function run<T = unknown>(
  store: string,
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const request = work(tx.objectStore(store));
        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error);
      }),
  );
}

/** Build a cache entry from a server snapshot row. */
export function toCachedStudent(student: DeskStudent, cardUid: string): CachedStudent {
  return { ...student, uid: normalizeUid(cardUid) };
}

/** Swap the whole roster in one transaction so readers never see it half-written. */
export async function replaceRoster(students: CachedStudent[]) {
  if (!hasIndexedDb()) return;
  const db = await openDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([ROSTER_STORE, META_STORE], "readwrite");
    const roster = tx.objectStore(ROSTER_STORE);
    roster.clear();
    for (const student of students) roster.put(student);
    tx.objectStore(META_STORE).put(new Date().toISOString(), ROSTER_SYNCED_AT);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function findStudentByUid(cardUid: string): Promise<CachedStudent | null> {
  if (!hasIndexedDb()) return null;
  const uid = normalizeUid(cardUid);
  if (!uid) return null;
  const found = await run<CachedStudent | undefined>(ROSTER_STORE, "readonly", (store) =>
    store.get(uid),
  );
  return found ?? null;
}

export async function getRosterSyncedAt(): Promise<string | null> {
  if (!hasIndexedDb()) return null;
  const value = await run<string | undefined>(META_STORE, "readonly", (store) =>
    store.get(ROSTER_SYNCED_AT),
  );
  return value ?? null;
}

export async function enqueueTap(tap: PendingTap) {
  if (!hasIndexedDb()) return;
  await run(QUEUE_STORE, "readwrite", (store) => store.put(tap));
}

/** Oldest first, so a queued check-out never replays before its check-in. */
export async function listPendingTaps(): Promise<PendingTap[]> {
  if (!hasIndexedDb()) return [];
  const taps = await run<PendingTap[]>(QUEUE_STORE, "readonly", (store) => store.getAll());
  return taps.sort((a, b) => a.clientTimestamp.localeCompare(b.clientTimestamp));
}

export async function removePendingTap(id: string) {
  if (!hasIndexedDb()) return;
  await run(QUEUE_STORE, "readwrite", (store) => store.delete(id));
}

export async function countPendingTaps(): Promise<number> {
  if (!hasIndexedDb()) return 0;
  return run<number>(QUEUE_STORE, "readonly", (store) => store.count());
}
