import { cache } from 'react';
import { createClient } from './server';

/**
 * The signed-in user and their profile role, memoized per request so the root
 * layout, pages and queries share one auth round trip instead of repeating it.
 * Server-only: never export this from a `'use server'` file.
 */
export const getCurrentUserProfile = cache(async () => {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase.from('profiles').select('role_id').eq('id', user.id).single();

    return { user, profile };
});
