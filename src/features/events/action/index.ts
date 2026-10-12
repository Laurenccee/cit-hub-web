'use server';

import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getAuthorizedAdmin } from '@/actions';
import { runMutation } from '@/actions/mutation';
import { ROUTES } from '@/utils/constants/routes';
import { EventSchema, type EventFormData } from '../schema/event';
import { GetEventCategories, GetDeskCheckins, GetEventAttendance } from './queries';
import { uidVariants } from '../utils';
import type { QueryResult } from '@/types/action';
import type {
  CreateEventResult,
  DeskCheckinRecord,
  DeskCheckinResult,
  DeskStudent,
  DeskTapContext,
  EventCategory,
  OpenVisitMessages,
} from '../types';

export async function getEventCategoriesAction(): Promise<QueryResult<EventCategory[]>> {
  const { success, data } = await GetEventCategories();
  if (!success) return { success: false, data: [] };
  return { success: true, data };
}

/** Maps the camelCase form fields onto their snake_case `events` columns. */
function toEventPayload(data: EventFormData, imageUrl: string | null | undefined) {
  return {
    title: data.title,
    slug: data.slug,
    description: data.description || null,
    location: data.location,
    start_date: data.startDate ? new Date(data.startDate).toISOString() : data.startDate,
    end_date: data.endDate ? new Date(data.endDate).toISOString() : null,
    category_id: data.categoryId || null,
    image_url: imageUrl ?? null,
    image_alt: data.imageAlt || null,
    is_published: data.isPublished,
    is_featured: data.isFeatured,
    is_archived: false,
  };
}

/**
 * Create a new event. Accepts a validated, typed EventFormData object —
 * the caller (useEventForm) owns form validation via zodResolver and uploads
 * the cover image through `uploadEventImageAction` before submitting.
 * Form keys use camelCase; this action maps them to snake_case DB columns.
 */
export async function createEventAction(
  values: EventFormData,
  imageUrl?: string | null,
): Promise<CreateEventResult> {
  return runMutation({
    values,
    schema: EventSchema,
    authorize: getAuthorizedAdmin,
    revalidate: [ROUTES.EVENTS, { path: `${ROUTES.EVENTS}/[slug]`, type: 'page' }],
    unauthorizedMessage: 'Forbidden: Admin only',
    invalidMessage: 'Validation failed',
    failureMessage: 'Failed to create event',
    conflictMessage: 'An event with this slug already exists',
    execute: async (data, { supabase, userId }) => {
      const { data: event, error } = await supabase
        .from('events')
        .insert({ ...toEventPayload(data, imageUrl), created_by: userId, updated_by: userId })
        .select('id')
        .single();
      return { error, extra: { eventId: event?.id } };
    },
  });
}

export type DeskDirection = 'in' | 'out';

/**
 * Everything the gate badge and roster need to identify a student, flattened
 * from the courses/majors joins. `rfid_uid` is intentionally stripped by
 * `toDeskStudent` before anything leaves the server.
 */
function toDeskStudent(row: {
  id: string;
  first_name: string;
  last_name: string;
  student_id?: string | null;
  profile_picture_url?: string | null;
  year_level?: string | null;
  rfid_uid?: string | null;
  courses?: { code?: string | null; name?: string | null } | null | Array<{ code?: string | null; name?: string | null } | null>;
  majors?: { code?: string | null; name?: string | null } | null | Array<{ code?: string | null; name?: string | null } | null>;
}): DeskStudent {
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    student_id: row.student_id ?? null,
    profile_picture_url: row.profile_picture_url ?? null,
    year_level: row.year_level ?? null,
    course_code: Array.isArray(row.courses) ? (row.courses[0]?.code ?? null) : (row.courses?.code ?? null),
    course_name: Array.isArray(row.courses) ? (row.courses[0]?.name ?? null) : (row.courses?.name ?? null),
    major_code: Array.isArray(row.majors) ? (row.majors[0]?.code ?? null) : (row.majors?.code ?? null),
    major_name: Array.isArray(row.majors) ? (row.majors[0]?.name ?? null) : (row.majors?.name ?? null),
  };
}


const ATTENDEE_SELECT =
  'id, first_name, last_name, student_id, profile_picture_url, year_level, rfid_uid, courses ( code, name ), majors ( code, name )';

/**
 * Resolve a tapped card to a student. Uses the service-role client because
 * the desk runs on public kiosk sessions that cannot read the students
 * table under RLS. Only minimal identity fields are returned.
 */
// fallow-ignore-next-line unused-server-action
export async function lookupStudentByCardAction(
  cardUid: string,
): Promise<{ success: boolean; student: DeskStudent | null }> {
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('students')
    .select(ATTENDEE_SELECT)
    .in('rfid_uid', uidVariants(cardUid))
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('RFID lookup error:', error.message);
    return { success: false, student: null };
  }
  if (!data) return { success: true, student: null };

  return { success: true, student: toDeskStudent(data) };
}


/**
 * Resolve whatever the operator provides — a tapped card UID or a typed
 * student ID like CIT-2023-8812 — to a student. Card lookup runs first so a
 * tap never misresolves; the student-ID match is case-insensitive exact.
 * Read-only: nothing is written, so the gate can preview the badge before
 * the operator confirms the tap.
 */
// fallow-ignore-next-line unused-type
export type AttendeeVia = 'card' | 'student_id';

// fallow-ignore-next-line unused-server-action
export async function resolveAttendeeAction(identifier: string): Promise<{
  success: boolean;
  student: DeskStudent | null;
  via: AttendeeVia | null;
}> {
  const trimmed = identifier.trim();
  if (!trimmed) return { success: true, student: null, via: null };

  const cardLookup = await lookupStudentByCardAction(trimmed);
  if (!cardLookup.success) return { success: false, student: null, via: null };
  if (cardLookup.student) return { success: true, student: cardLookup.student, via: 'card' };

  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();

  // Demo and replay flows identify the student by row id.
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    const { data: byId, error: byIdError } = await admin
      .from('students')
      .select(ATTENDEE_SELECT)
      .eq('id', trimmed)
      .maybeSingle();

    if (byIdError) {
      console.error('Student lookup error:', byIdError.message);
      return { success: false, student: null, via: null };
    }
    if (byId) return { success: true, student: toDeskStudent(byId), via: 'student_id' };
  }

  const { data, error } = await admin
    .from('students')
    .select(ATTENDEE_SELECT)
    .ilike('student_id', trimmed)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Student ID lookup error:', error.message);
    return { success: false, student: null, via: null };
  }
  if (!data) return { success: true, student: null, via: null };

  return { success: true, student: toDeskStudent(data), via: 'student_id' };
}

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

  // A replayed tap may already be committed — the original attempt could have
  // written the row and then lost its response. Resolve that before the
  // open-visit pre-check so a retry reports success, not "already checked in".
  const applied = await findAppliedTap(supabase, clientId, direction);
  if (applied) {
    return { success: true, message: 'Tap already recorded.', student, record: applied };
  }

  if (direction === 'in') {
    // Read the student's open visit alongside the event and card lookup so
    // duplicates are caught before the insert without adding a round trip.
    const openVisit = await findOpenVisit(supabase, student.id);

    if (openVisit) {
      return alreadyCheckedInResult(supabase, student, eventId);
    }

    const { data: created, error: insertError } = await supabase
      .from('event_attendance')
      .insert({
        event_id: eventId,
        student_id: student.id,
        check_in: clientTimestamp ?? now,
        check_in_client_id: clientId,
      })
      .select('id, event_id, check_in, check_out, student_id')
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        // Two unique indexes can raise this: the check_in_client_id key (this
        // exact tap already landed) and the one-open-visit key (they are
        // already inside).
        const replayed = await findAppliedTap(supabase, clientId, direction);
        if (replayed) {
          return { success: true, message: 'Tap already recorded.', student, record: replayed };
        }
        return alreadyCheckedInResult(supabase, student, eventId);
      }
      console.error('Check-in insert error:', insertError.message);
      return { success: false, message: `Could not record check-in (${insertError.code ?? 'db-error'}: ${insertError.message}).` };
    }

    return {
      success: true,
      message: `Welcome, ${student.first_name} ${student.last_name}. Checked in.`,
      student,
      record: { ...(created as Omit<DeskCheckinRecord, 'created_at'>), created_at: now },
    };
  }

  // direction === 'out': close the student's open visit.
  // A conditional update returns the closed row, so no follow-up read is
  // needed. No returned row means there was no open visit to close.
  let closedVisit: DeskCheckinRecord | null = null;
  let updateError: { code?: string; message: string; details?: string | null } | null = null;

  // Close the student's open visit for this event, or failing that any of
  // their open visits — a card scanned in at one desk still has to be able to
  // leave at whichever kiosk is in front of them.
  //
  // Only `check_out_client_id` is written: `check_in_client_id` belongs to the
  // IN tap that opened the visit, and overwriting it would let a replayed IN
  // slip past the idempotency check and open a second visit.
  const closeVisitForEvent = () =>
    supabase
      .from('event_attendance')
      .update({ check_out: clientTimestamp ?? now, check_out_client_id: clientId })
      .eq('event_id', eventId)
      .eq('student_id', student.id)
      .not('check_in', 'is', null)
      .is('check_out', null)
      .select('id, event_id, check_in, check_out, student_id');

  const closeAnyOpenVisit = () =>
    supabase
      .from('event_attendance')
      .update({ check_out: clientTimestamp ?? now, check_out_client_id: clientId })
      .eq('student_id', student.id)
      .not('check_in', 'is', null)
      .is('check_out', null)
      .select('id, event_id, check_in, check_out, student_id');

  const scoped = await closeVisitForEvent();
  const attempts = scoped.data?.length ? [scoped] : [scoped, await closeAnyOpenVisit()];

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
    if (attempt.data && attempt.data.length > 0) {
      closedVisit = {
        ...(attempt.data[0] as Omit<DeskCheckinRecord, 'created_at'>),
        created_at: now,
      };
      break;
    }
  }

  if (!closedVisit) {
    if (updateError) {
      return { success: false, message: `Could not record check-out (${updateError.code ?? 'db-error'}: ${updateError.message}).` };
    }

    // No open row for this event. If they are checked in somewhere else, say
    // where instead of the bare "no active check-in".
    return {
      success: false,
      message: await describeOpenVisit(supabase, student, eventId, {
        sameEvent: `${student.first_name} ${student.last_name} has no active check-in.`,
        otherEvent: (title) => `${student.first_name} ${student.last_name} is checked in at "${title}". Log them out there first.`,
        none: `${student.first_name} ${student.last_name} has no active check-in.`,
      }),
      student,
      noActiveVisit: true,
    };
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
      (result) => ({ status: 'ok' as const, result }),
      (error: unknown) => ({ status: 'failed' as const, error }),
    ),
  ]);

  if (eventRes.error || !eventRes.data || !eventRes.data.is_published || eventRes.data.is_archived) {
    return { success: false, message: 'This event is not accepting check-ins.' };
  }

  if (lookupSettled.status === 'failed') {
    console.error('Attendee lookup threw:', lookupSettled.error instanceof Error ? lookupSettled.error.message : lookupSettled.error);
    return { success: false, message: 'Card lookup is unavailable. Check the server configuration.' };
  }
  const lookup = lookupSettled.result;
  if (!lookup.success) {
    return { success: false, message: 'Lookup failed. Try again.' };
  }
  const student = lookup.student;

  // Unknown cards and IDs are rejected at the gate, never recorded.
  if (!student) {
    return {
      success: false,
      message: `No student found for "${trimmed}". Register the card in the student directory, or check the ID and try again.`,
    };
  }

  return commitDeskVisit(supabase, eventId, student, direction, clientId, clientTimestamp);
}

/**
 * Remove one attendance record from the roster. Admin only — the gate pages
 * run on public kiosk sessions, so the write goes through the service-role
 * client after the role check instead of trusting RLS on the anon session.
 */
export async function deleteAttendanceRecordAction(
  recordId: string,
): Promise<{ success: boolean; message: string }> {
  const authorized = await getAuthorizedAdmin();
  if (!authorized) {
    return { success: false, message: 'Only admins can remove attendance records. Sign in as admin first.' };
  }

  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('event_attendance')
    .delete()
    .eq('id', recordId)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Delete attendance error:', error.message);
    return { success: false, message: `Could not delete that record (${error.code ?? 'db-error'}).` };
  }
  if (!data) {
    return { success: false, message: 'That record is already gone.' };
  }
  return { success: true, message: 'Record removed.' };
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