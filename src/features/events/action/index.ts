'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { getAuthorizedAdmin } from '@/actions';
import { ROUTES } from '@/utils/constants/routes';
import { EventSchema, type EventFormData } from '../schema/event';
import { GetEventCategories, GetDeskCheckins, GetEventAttendance } from './queries';
import { uidVariants } from '../utils';
import type {
  DeskCheckinRecord,
  DeskCheckinResult,
  DeskStudent,
  DeskTapContext,
  OpenVisitMessages,
  CreateEventResult,
} from '../types';

export async function getEventCategoriesAction() {
  const { success, data } = await GetEventCategories();
  if (!success) return { success: false as const, categories: [] };
  return { success: true as const, categories: data };
}

/**
 * Shared pipeline for event mutations: authorize, re-validate, map camelCase
 * form keys to snake_case columns, run the DB operation, revalidate and
 * translate failures into the `CreateEventResult` contract the form expects.
 */
async function executeEventMutation(
  values: EventFormData,
  imageUrl: string | null | undefined,
  failureMessage: string,
  dbOperation: (
    supabase: SupabaseClient,
    payload: Record<string, unknown>,
    userId: string,
  ) => PromiseLike<{ data: { id: string } | null; error: PostgrestError | null }>,
): Promise<CreateEventResult> {
  const authorized = await getAuthorizedAdmin();
  if (!authorized) {
    return { success: false, error: 'Forbidden: Admin only' };
  }

  // Re-validate on the server (defence-in-depth; the client resolver already
  // validated, but server actions must never trust client data).
  const validation = EventSchema.safeParse(values);
  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {};
    validation.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    });
    return { success: false, error: 'Validation failed', fieldErrors };
  }

  const data = validation.data;
  const supabase = await createClient();

  const payload = {
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

  try {
    const { data: event, error: dbError } = await dbOperation(supabase, payload, authorized.user.id);
    if (dbError) throw dbError;

    revalidatePath(ROUTES.EVENTS);
    revalidatePath(`${ROUTES.EVENTS}/[slug]`, 'page');

    return { success: true, eventId: event?.id };
  } catch (error) {
    console.error('Event mutation error:', error);
    // Handle unique constraint violations
    if ((error as { code?: string } | null)?.code === '23505') {
      return { success: false, error: 'An event with this slug already exists' };
    }
    return { success: false, error: failureMessage };
  }
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
  return executeEventMutation(values, imageUrl, 'Failed to create event', (supabase, payload, userId) =>
    supabase
      .from('events')
      .insert({ ...payload, created_by: userId, updated_by: userId })
      .select('id')
      .single(),
  );
}

export type DeskDirection = 'in' | 'out';

/**
 * Resolve a tapped card to a student. Uses the service-role client because
 * the desk runs on public kiosk sessions that cannot read the students
 * table under RLS. Only minimal identity fields are returned.
 */
export async function lookupStudentByCardAction(
  cardUid: string,
): Promise<{ success: boolean; student: DeskStudent | null }> {
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('students')
    .select('id, first_name, last_name, student_id, profile_picture_url, rfid_uid')
    .in('rfid_uid', uidVariants(cardUid))
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('RFID lookup error:', error.message);
    return { success: false, student: null };
  }
  if (!data) return { success: true, student: null };

  const { rfid_uid: _rfidUid, ...student } = data;
  return { success: true, student: student as DeskStudent };
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
  cardUid: string,
  direction: DeskDirection,
  context?: DeskTapContext,
): Promise<DeskCheckinResult> {
  const trimmedUid = cardUid.trim();
  if (!trimmedUid) {
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
    lookupStudentByCardAction(trimmedUid).then(
      (result) => ({ status: 'ok' as const, result }),
      (error: unknown) => ({ status: 'failed' as const, error }),
    ),
  ]);

  if (eventRes.error || !eventRes.data || !eventRes.data.is_published || eventRes.data.is_archived) {
    return { success: false, message: 'This event is not accepting check-ins.' };
  }

  if (lookupSettled.status === 'failed') {
    console.error('RFID lookup threw:', lookupSettled.error instanceof Error ? lookupSettled.error.message : lookupSettled.error);
    return { success: false, message: 'Card lookup is unavailable. Check the server configuration.' };
  }
  const lookup = lookupSettled.result;
  if (!lookup.success) {
    return { success: false, message: 'Lookup failed. Try again.' };
  }
  const student = lookup.student;

  // Unregistered cards are rejected at the gate, never recorded.
  if (!student) {
    return {
      success: false,
      message: `Card ${trimmedUid} is not registered. Register it in the student directory first.`,
    };
  }

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
    const { data: openVisit } = await supabase
      .from('event_attendance')
      .select('event_id')
      .eq('student_id', student.id)
      .not('check_in', 'is', null)
      .is('check_out', null)
      .limit(1)
      .maybeSingle();

    if (openVisit) {
      return {
        success: false,
        message: await describeOpenVisit(supabase, student, eventId, {
          sameEvent: `${student.first_name} ${student.last_name} is already checked in.`,
          otherEvent: (title) => `${student.first_name} ${student.last_name} is already checked in at "${title}".`,
          none: `${student.first_name} ${student.last_name} is already checked in.`,
        }),
        student,
        alreadyInside: true,
      };
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
        return {
          success: false,
          message: await describeOpenVisit(supabase, student, eventId, {
            sameEvent: `${student.first_name} ${student.last_name} is already checked in.`,
            otherEvent: (title) => `${student.first_name} ${student.last_name} is already checked in at "${title}".`,
            none: `${student.first_name} ${student.last_name} is already checked in.`,
          }),
          student,
          alreadyInside: true,
        };
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
 * Turn a blocked visit into an actionable message: at this event, somewhere
 * else, or never checked in.
 */
async function describeOpenVisit(
  supabase: SupabaseClient,
  student: DeskStudent,
  currentEventId: string,
  messages: OpenVisitMessages,
): Promise<string> {
  const { data: openVisit } = await supabase
    .from('event_attendance')
    .select('event_id')
    .eq('student_id', student.id)
    .not('check_in', 'is', null)
    .is('check_out', null)
    .limit(1)
    .maybeSingle();

  if (!openVisit) return messages.none;
  if (openVisit.event_id === currentEventId) return messages.sameEvent;

  const { data: event } = await supabase
    .from('events')
    .select('title')
    .eq('id', openVisit.event_id)
    .maybeSingle();

  return event?.title ? messages.otherEvent(event.title) : messages.sameEvent;
}