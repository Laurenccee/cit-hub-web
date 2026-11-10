'use server';

import { uidVariants, toDeskStudent, ATTENDEE_SELECT } from '../utils';
import type { DeskStudent, AttendeeVia } from '../types';

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
 * Read-only: nothing is written while the tap is being resolved.
 */
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
