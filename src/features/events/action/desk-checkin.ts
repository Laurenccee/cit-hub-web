'use server';

import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { GetDeskCheckins, GetEventAttendance } from './queries';
import { resolveAttendeeAction } from './desk-lookup';
import type {
  DeskCheckinRecord,
  DeskCheckinResult,
  DeskDirection,
  DeskStudent,
  DeskTapContext,
  OpenVisitMessages,
} from '../types';

/**
 * Has this exact device tap already been committed? Offline replays retry
 * taps whose response was lost, so the answer decides between "success" and a
 * duplicate check-in. Returns null when there is no client id to match on.
 *
 * Each tap owns its own key column, so only the column for this direction is
 * consulted — a key is never shared between a check-in and a check-out.
 */
async function findAppliedTap(
  supabase: SupabaseClient,
  clientId: string | null,
  direction: DeskDirection,
): Promise<DeskCheckinRecord | null> {
  if (!clientId) return null;

  const { data, error } = await supabase
    .from('event_attendance')
    .select('id, event_id, check_in, check_out, student_id, created_at')
    .eq(direction === 'in' ? 'check_in_client_id' : 'check_out_client_id', clientId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Idempotency lookup error:', error.message);
    return null;
  }

  return (data as DeskCheckinRecord | null) ?? null;
}

/**
 * The student's currently open visit, if any. A tap can be blocked by an open
 * visit at this event or another one, so every check shares this lookup.
 */
async function findOpenVisit(supabase: SupabaseClient, studentId: string) {
  const { data } = await supabase
    .from('event_attendance')
    .select('event_id')
    .eq('student_id', studentId)
    .not('check_in', 'is', null)
    .is('check_out', null)
    .limit(1)
    .maybeSingle();

  return data;
}

/** The blocked "already checked in" result, wherever the open visit lives. */
async function alreadyCheckedInResult(
  supabase: SupabaseClient,
  student: DeskStudent,
  eventId: string,
): Promise<DeskCheckinResult> {
  const name = `${student.first_name} ${student.last_name}`;
  return {
    success: false,
    message: await describeOpenVisit(supabase, student, eventId, {
      sameEvent: `${name} is already checked in.`,
      otherEvent: (title) => `${name} is already checked in at "${title}".`,
      none: `${name} is already checked in.`,
    }),
    student,
    alreadyInside: true,
  };
}

/**
 * Turn a blocked visit into an actionable message: at this event, somewhere
 * else, or never checked in.
 */
async function describeOpenVisit(
  supabase: SupabaseClient,
  student: DeskStudent,
  currentEventId: string,
  messages: OpenVisitMessages,
): Promise<string> {
  const openVisit = await findOpenVisit(supabase, student.id);

  if (!openVisit) return messages.none;
  if (openVisit.event_id === currentEventId) return messages.sameEvent;

  const { data: event } = await supabase
    .from('events')
    .select('title')
    .eq('id', openVisit.event_id)
    .maybeSingle();

  return event?.title ? messages.otherEvent(event.title) : messages.sameEvent;
}

/**
 * Write one resolved tap: IN opens a visit row (or warns when the student is
 * already inside); OUT stamps `check_out` on their open visit. Shared by the
 * card-tap action and the typed-identifier action so both commit identically.
 */
async function commitDeskVisit(
  supabase: SupabaseClient,
  eventId: string,
  student: DeskStudent,
  direction: DeskDirection,
  clientId: string | null,
  clientTimestamp: string | null,
): Promise<DeskCheckinResult> {
  const now = new Date().toISOString();
  const tap: DeskTap = {
    supabase,
    eventId,
    student,
    clientId,
    timestamp: clientTimestamp ?? now,
    now,
  };

  // A replayed tap may already be committed — the original attempt could have
  // written the row and then lost its response. Resolve that before the
  // open-visit pre-check so a retry reports success, not "already checked in".
  const applied = await findAppliedTap(supabase, clientId, direction);
  if (applied) return tapRecordedResult(student, applied);

  return direction === 'in' ? commitCheckIn(tap) : commitCheckOut(tap);
}

interface DeskTap {
  supabase: SupabaseClient;
  eventId: string;
  student: DeskStudent;
  clientId: string | null;
  /** Device time when the tap was captured, else the server's `now`. */
  timestamp: string;
  now: string;
}

type AttendanceRow = Omit<DeskCheckinRecord, 'created_at'>;

const ATTENDANCE_COLUMNS = 'id, event_id, check_in, check_out, student_id';

function tapRecordedResult(student: DeskStudent, record: DeskCheckinRecord): DeskCheckinResult {
  return { success: true, message: 'Tap already recorded.', student, record };
}

function dbFailureResult(
  action: 'check-in' | 'check-out',
  error: { code?: string; message: string },
): DeskCheckinResult {
  return {
    success: false,
    message: `Could not record ${action} (${error.code ?? 'db-error'}: ${error.message}).`,
  };
}

async function commitCheckIn(tap: DeskTap): Promise<DeskCheckinResult> {
  const { supabase, eventId, student, clientId, timestamp, now } = tap;

  // Read the student's open visit alongside the event and card lookup so
  // duplicates are caught before the insert without adding a round trip.
  const openVisit = await findOpenVisit(supabase, student.id);
  if (openVisit) return alreadyCheckedInResult(supabase, student, eventId);

  const { data: created, error: insertError } = await supabase
    .from('event_attendance')
    .insert({
      event_id: eventId,
      student_id: student.id,
      check_in: timestamp,
      check_in_client_id: clientId,
    })
    .select(ATTENDANCE_COLUMNS)
    .single();

  if (insertError) return resolveCheckInInsertError(tap, insertError);

  return {
    success: true,
    message: `Welcome, ${student.first_name} ${student.last_name}. Checked in.`,
    student,
    record: { ...(created as AttendanceRow), created_at: now },
  };
}

async function resolveCheckInInsertError(
  tap: DeskTap,
  insertError: { code?: string; message: string },
): Promise<DeskCheckinResult> {
  const { supabase, eventId, student, clientId } = tap;

  if (insertError.code !== '23505') {
    console.error('Check-in insert error:', insertError.message);
    return dbFailureResult('check-in', insertError);
  }

  // Two unique indexes can raise this: the check_in_client_id key (this
  // exact tap already landed) and the one-open-visit key (they are
  // already inside).
  const replayed = await findAppliedTap(supabase, clientId, 'in');
  if (replayed) return tapRecordedResult(student, replayed);
  return alreadyCheckedInResult(supabase, student, eventId);
}

/**
 * Close the student's open visit for this event, or failing that any of
 * their open visits — a card scanned in at one desk still has to be able to
 * leave at whichever kiosk is in front of them.
 *
 * Only `check_out_client_id` is written: `check_in_client_id` belongs to the
 * IN tap that opened the visit, and overwriting it would let a replayed IN
 * slip past the idempotency check and open a second visit.
 */
function closeOpenVisit(tap: DeskTap, scopedToEvent: boolean) {
  const query = tap.supabase
    .from('event_attendance')
    .update({ check_out: tap.timestamp, check_out_client_id: tap.clientId });

  return (scopedToEvent ? query.eq('event_id', tap.eventId) : query)
    .eq('student_id', tap.student.id)
    .not('check_in', 'is', null)
    .is('check_out', null)
    .select(ATTENDANCE_COLUMNS);
}

type CloseAttempt = Awaited<ReturnType<typeof closeOpenVisit>>;

function findClosedVisit(attempts: CloseAttempt[], now: string) {
  let closedVisit: DeskCheckinRecord | null = null;
  let updateError: CloseAttempt['error'] = null;

  for (const attempt of attempts) {
    if (attempt.error) {
      console.error(
        'Check-out update error:',
        attempt.error.message,
        attempt.error.code,
        attempt.error.details,
      );
      updateError = attempt.error;
      continue;
    }
    if (attempt.data?.length) {
      closedVisit = { ...(attempt.data[0] as AttendanceRow), created_at: now };
      break;
    }
  }

  return { closedVisit, updateError };
}

async function noActiveVisitResult(tap: DeskTap): Promise<DeskCheckinResult> {
  const { supabase, eventId, student } = tap;
  const name = `${student.first_name} ${student.last_name}`;

  // No open row for this event. If they are checked in somewhere else, say
  // where instead of the bare "no active check-in".
  return {
    success: false,
    message: await describeOpenVisit(supabase, student, eventId, {
      sameEvent: `${name} has no active check-in.`,
      otherEvent: (title) => `${name} is checked in at "${title}". Log them out there first.`,
      none: `${name} has no active check-in.`,
    }),
    student,
    noActiveVisit: true,
  };
}

// A conditional update returns the closed row, so no follow-up read is
// needed. No returned row means there was no open visit to close.
async function commitCheckOut(tap: DeskTap): Promise<DeskCheckinResult> {
  const { eventId, student, now } = tap;

  const scoped = await closeOpenVisit(tap, true);
  const attempts = scoped.data?.length ? [scoped] : [scoped, await closeOpenVisit(tap, false)];
  const { closedVisit, updateError } = findClosedVisit(attempts, now);

  if (!closedVisit) {
    return updateError ? dbFailureResult('check-out', updateError) : noActiveVisitResult(tap);
  }

  if (closedVisit.event_id !== eventId) {
    console.warn(`Closed ${student.id}'s open visit on a different event than the desk (${closedVisit.event_id} vs ${eventId}).`);
  }

  return {
    success: true,
    message: `Goodbye, ${student.first_name} ${student.last_name}. Checked out.`,
    student,
    record: closedVisit,
  };
}

type LookupSettled =
  | { status: 'ok'; result: Awaited<ReturnType<typeof resolveAttendeeAction>> }
  | { status: 'failed'; error: unknown };

type LookupOutcome = { student: DeskStudent } | { failure: DeskCheckinResult };

function isEventAcceptingCheckins(
  eventRes: { error: unknown; data: { is_published: boolean; is_archived: boolean } | null },
): boolean {
  return !eventRes.error && !!eventRes.data && eventRes.data.is_published && !eventRes.data.is_archived;
}

function interpretLookup(settled: LookupSettled, identifier: string): LookupOutcome {
  if (settled.status === 'failed') {
    const { error } = settled;
    console.error('Attendee lookup threw:', error instanceof Error ? error.message : error);
    return { failure: { success: false, message: 'Card lookup is unavailable. Check the server configuration.' } };
  }
  if (!settled.result.success) {
    return { failure: { success: false, message: 'Lookup failed. Try again.' } };
  }
  // Unknown cards and IDs are rejected at the gate, never recorded.
  if (!settled.result.student) {
    return {
      failure: {
        success: false,
        message: `No student found for "${identifier}". Register the card in the student directory, or check the ID and try again.`,
      },
    };
  }
  return { student: settled.result.student };
}

/**
 * Log one RFID tap at the check-in desk. IN opens a visit row (or warns when
 * the student is already inside); OUT stamps `check_out` on their open visit.
 * Unregistered cards are rejected at the gate, never recorded.
 *
 * The created/updated row is returned so the UI can update instantly without
 * refetching the page. Event validation and card lookup run in parallel.
 *
 * `context` carries the device-side identity of the tap. When the desk was
 * offline the tap is replayed later, and the same `clientId` may already have
 * been committed by an attempt whose response never arrived — that case
 * resolves to success rather than a duplicate check-in.
 */
export async function logDeskCheckinAction(
  eventId: string,
  identifier: string,
  direction: DeskDirection,
  context?: DeskTapContext,
): Promise<DeskCheckinResult> {
  const trimmed = identifier.trim();
  if (!trimmed) {
    return { success: false, message: 'Empty card UID.' };
  }

  const clientId = context?.clientId?.trim() || null;
  const clientTimestamp = context?.clientTimestamp ?? null;

  const supabase = await createClient();

  const [eventRes, lookupSettled] = await Promise.all([
    supabase
      .from('events')
      .select('id, title, is_published, is_archived')
      .eq('id', eventId)
      .maybeSingle(),
    resolveAttendeeAction(trimmed).then(
      (result): LookupSettled => ({ status: 'ok', result }),
      (error: unknown): LookupSettled => ({ status: 'failed', error }),
    ),
  ]);

  if (!isEventAcceptingCheckins(eventRes)) {
    return { success: false, message: 'This event is not accepting check-ins.' };
  }

  const outcome = interpretLookup(lookupSettled, trimmed);
  if ('failure' in outcome) return outcome.failure;

  return commitDeskVisit(supabase, eventId, outcome.student, direction, clientId, clientTimestamp);
}

/**
 * Server-action replacement for the /api/events/[eventId]/checkins/recent
 * route. Returns recent check-ins with student details and the attendance
 * summary for one event. Used by useScanTerminal and LiveActivityFeed.
 */
export async function getRecentCheckinsAction(eventId: string): Promise<{
  success: boolean;
  checkins: import('../types').DeskCheckin[];
  attendance: {
    present: number;
    departed: number;
    total: number;
  };
}> {
  const fallback = { success: false as const, checkins: [], attendance: { present: 0, departed: 0, total: 0 } };
  if (!eventId) return fallback;

  const [checkinsResult, attendance] = await Promise.all([
    GetDeskCheckins(eventId, 5),
    GetEventAttendance(eventId),
  ]);

  if (!checkinsResult.success) return fallback;

  return {
    success: true,
    checkins: checkinsResult.data,
    attendance: {
      present: attendance.present,
      departed: attendance.departed,
      total: attendance.total,
    },
  };
}
