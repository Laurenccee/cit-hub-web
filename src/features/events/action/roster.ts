'use server';

import { normalizeUid } from '../utils';
import type { RosterSnapshot, RosterSnapshotEntry } from '../types';

/**
 * The full card → student map for the check-in desk, so the browser can
 * resolve a tap without a network round trip.
 *
 * Uses the service-role client because kiosk sessions cannot read the
 * students table under RLS. Only the fields the desk renders are returned.
 *
 * Note: this hands the whole roster to whoever loads the desk page, which is
 * a public route. That is the cost of resolving taps offline; the desk is
 * expected to run on a controlled kiosk network.
 */
export async function getRosterSnapshotAction(): Promise<RosterSnapshot> {
  const syncedAt = new Date().toISOString();
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('students')
    .select('id, first_name, last_name, student_id, profile_picture_url, rfid_uid')
    .not('rfid_uid', 'is', null);

  if (error) {
    console.error('Roster snapshot error:', error.message);
    return { success: false, students: [], syncedAt };
  }

  const students: RosterSnapshotEntry[] = [];
  for (const row of data ?? []) {
    const uid = normalizeUid(row.rfid_uid ?? '');
    if (!uid) continue;
    students.push({
      uid,
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      student_id: row.student_id,
      profile_picture_url: row.profile_picture_url,
    });
  }

  return { success: true, students, syncedAt };
}
