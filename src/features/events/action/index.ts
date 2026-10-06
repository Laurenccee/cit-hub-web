'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { EventSchema, type EventFormData } from '../schema/event';
import { GetEventCategories, GetDeskCheckins, GetEventAttendance } from './queries';
import type {
  DeskCheckinRecord,
  DeskCheckinResult,
  DeskStudent,
  OpenVisitMessages,
  CreateEventResult,
} from '../types';

export async function getEventCategoriesAction() {
  const { success, data } = await GetEventCategories();
  if (!success) return { success: false as const, categories: [] };
  return { success: true as const, categories: data };
}

/**
 * Create a new event. Accepts a validated, typed EventFormData object —
 * the caller (useEventForm) owns form validation via zodResolver.
 * Form keys use camelCase; this action maps them to snake_case DB columns.
 */
export async function createEventAction(
  values: EventFormData & { imageBlob?: string | null },
  imageBlobDataUrl?: string | null,
): Promise<CreateEventResult> {
  const supabase = await createClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role_id')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role_id !== 0) {
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

  let image_url: string | null = null;

  // Handle image upload if provided (passed as a base64 data URL from the
  // client because File/Blob objects cannot cross the server action boundary).
  if (imageBlobDataUrl) {
    try {
      const base64 = imageBlobDataUrl.split(',')[1];
      const mimeMatch = imageBlobDataUrl.match(/data:([^;]+);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const ext = mime.split('/')[1] || 'jpg';
      const buffer = Buffer.from(base64, 'base64');
      const fileName = `${uuidv4()}.${ext}`;
      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, buffer, {
          contentType: mime,
          upsert: false,
        });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        return { success: false, error: 'Failed to upload image' };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('news-images')
        .getPublicUrl(filePath);

      image_url = publicUrl;
    } catch (err) {
      console.error('Image upload failed:', err);
      return { success: false, error: 'Failed to upload image' };
    }
  }

  // Map camelCase form keys to snake_case DB columns.
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      location: data.location,
      start_date: data.startDate ? new Date(data.startDate).toISOString() : data.startDate,
      end_date: data.endDate ? new Date(data.endDate).toISOString() : null,
      category_id: data.categoryId || null,
      image_url,
      image_alt: data.imageAlt || null,
      is_published: data.isPublished,
      is_featured: data.isFeatured,
      is_archived: false,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id, slug')
    .single();

  if (eventError) {
    console.error('Event creation error:', eventError);
    // Handle unique constraint violations
    if (eventError.code === '23505') {
      return { success: false, error: 'An event with this slug already exists' };
    }
    return { success: false, error: 'Failed to create event' };
  }

  // Revalidate events page
  revalidatePath('/events');
  revalidatePath('/events/[slug]', 'page');

  return { success: true, eventId: event.id };
}

// ---------------------------------------------------------------------------
// Re-export DeskStudent and DeskDirection for backward compat. New code should
// import them from ../types.
// ---------------------------------------------------------------------------

/** @see types/index.ts — DeskStudent is now the canonical location. */
export type { DeskStudent } from '../types';

export type DeskDirection = 'in' | 'out';

function uidVariants(cardUid: string) {
  const raw = cardUid.trim();
  const compact = raw.replace(/[\s:.-]/g, '').toUpperCase();
  return Array.from(new Set([raw, raw.toUpperCase(), compact]));
}

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
 * Log one RFID tap at the check-in desk. IN opens a visit row (or warns when
 * the student is already inside); OUT stamps `check_out` on their open visit.
 * Unregistered cards are rejected at the gate, never recorded.
 *
 * The created/updated row is returned so the UI can update instantly without
 * refetching the page. Event validation and card lookup run in parallel.
 */
export async function logDeskCheckinAction(
  eventId: string,
  cardUid: string,
  direction: DeskDirection,
): Promise<DeskCheckinResult> {
  const trimmedUid = cardUid.trim();
  if (!trimmedUid) {
    return { success: false, message: 'Empty card UID.' };
  }

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
        check_in: now,
      })
      .select('id, event_id, check_in, check_out, student_id')
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
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
  const closeVisitForEvent = () =>
    supabase
      .from('event_attendance')
      .update({ check_out: now })
      .eq('event_id', eventId)
      .eq('student_id', student.id)
      .not('check_in', 'is', null)
      .is('check_out', null)
      .select('id, event_id, check_in, check_out, student_id');

  const closeAnyOpenVisit = () =>
    supabase
      .from('event_attendance')
      .update({ check_out: now })
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