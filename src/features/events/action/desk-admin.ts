'use server';

import { getAuthorizedAdmin } from '@/actions';

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
