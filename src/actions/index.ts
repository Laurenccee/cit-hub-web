'use server';

import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { ROLES } from '@/utils/constants/roles';

const { ADMIN, FACULTY } = ROLES;

const getCurrentUserProfile = cache(async () => {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase.from('profiles').select('role_id').eq('id', user.id).single();

    return { user, profile };
});

/** The signed-in Supabase user, without a role requirement. */
export async function getAuthenticatedUser() {
    const result = await getCurrentUserProfile();
    return result ? { user: result.user } : null;
}

/** The caller's role id, or null when signed out. For view-only role checks. */
export async function getViewerRoleId(): Promise<number | null> {
    const result = await getCurrentUserProfile();
    return result?.profile?.role_id ?? null;
}

/**
 * The single authorization gate for server actions. Reads the caller's profile
 * role and returns the acting user when it is in `allowedRoles`.
 */
export async function getAuthorizedUser(allowedRoles: number[] = [ADMIN, FACULTY]) {
    const result = await getCurrentUserProfile();
    if (!result) return null;
    const { user, profile } = result;
    if (profile?.role_id == null || !allowedRoles.includes(profile.role_id)) {
        return null;
    }
    return { user, roleId: profile.role_id as number };
}

/**
 * Admin-only gate for editorial content that Faculty must not manage (e.g. events).
 */
export async function getAuthorizedAdmin() {
    return getAuthorizedUser([ROLES.ADMIN]);
}
