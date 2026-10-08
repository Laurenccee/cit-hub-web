'use server';

import { createClient } from '@/lib/supabase/server';
import { ROLES } from '@/utils/constants/roles';

export async function getAuthorizedUser() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase.from('profiles').select('role_id').eq('id', user.id).single();

    if (profile?.role_id !== ROLES.ADMIN && profile?.role_id !== ROLES.FACULTY) {
        return null;
    }
    return { user, roleId: profile.role_id as number };
}

/**
 * Admin-only gate for editorial content that Faculty must not manage (e.g. events).
 * Mirrors `getAuthorizedUser` but narrows the role set to `ROLES.ADMIN`.
 */
export async function getAuthorizedAdmin() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase.from('profiles').select('role_id').eq('id', user.id).single();

    if (profile?.role_id !== ROLES.ADMIN) {
        return null;
    }
    return { user, roleId: profile.role_id as number };
}
