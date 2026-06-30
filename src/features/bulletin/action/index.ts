'use server';

import { createClient } from '@/lib/supabase/server';
import { ROLES } from '@/utils/constants/roles';
import { revalidatePath } from 'next/cache';
import { PostgrestError } from '@supabase/supabase-js';
import { NewsSchema, type NewsFormData } from '../schema/news';
import { deleteStorageFileAction, uploadNewsImageAction } from '@/actions/image';

// 1. Import your newly created universal media handlers

/**
 * Step 1: Pre-flight Authorization check
 */
async function getAuthorizedUser() {
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
 * Step 2: Shared mutation executor (The abstraction engine)
 */
async function executeNewsMutation(
    values: NewsFormData,
    successMessage: string,
    dbOperation: (supabase: any, payload: any, userId: string) => Promise<{ error: PostgrestError | null }>,
) {
    const authorized = await getAuthorizedUser();
    if (!authorized) return { success: false as const, message: 'Unauthorized.' };

    const validatedFields = NewsSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false as const, message: 'Invalid form data.' };
    }

    const { data } = validatedFields;
    const supabase = await createClient();

    // Map your CamelCase form fields cleanly to Snake_case DB equivalents
    const payload = {
        title: data.title,
        description: data.description ?? '',
        content: data.content ?? null,
        slug: data.slug,
        image_url: data.imageUrl ?? '',
        image_alt: data.imageAlt ?? '',
        content_type_id: data.typesId ?? null,
        is_published: data.isPublished,
        is_featured: data.isFeatured,
    };

    try {
        const { error: dbError } = await dbOperation(supabase, payload, authorized.user.id);
        if (dbError) throw dbError;

        revalidatePath('/bulletin');
        return { success: true as const, message: successMessage };
    } catch (error: any) {
        return {
            success: false as const,
            message: error?.message || 'An unexpected database error occurred.',
        };
    }
}

// --- Clean, Declarative One-Liner News Actions ---

export async function addNewsAction(values: NewsFormData, _targetId: string) {
    return executeNewsMutation(values, 'News successfully created!', (supabase, payload, userId) =>
        supabase.from('news').insert({ author_id: userId, ...payload }),
    );
}

export async function updateNewsAction(values: NewsFormData, targetId: string) {
    return executeNewsMutation(values, 'News successfully updated!', (supabase, payload) =>
        supabase.from('news').update(payload).eq('id', targetId),
    );
}

// --- Auxiliary Asset Utilities (Wired to Universal Handlers) ---

/**
 * Handles image upload from form submission.
 * Optional: Pass `oldFilePath` if updating an existing article to clear out old files automatically.
 */
export async function uploadNewsImage(formData: FormData, oldFilePath?: string | null) {
    // Forward directly to the universal helper engine
    return await uploadNewsImageAction(formData, oldFilePath);
}

/**
 * Deletes a news post completely along with its asset from the bucket
 */
export async function deleteNewsAction(id: string) {
    const authorized = await getAuthorizedUser();
    if (!authorized) return { success: false as const, message: 'Unauthorized.' };

    const supabase = await createClient();

    // 1. Get the existing image URL before making changes
    const { data: newsRow } = await supabase.from('news').select('image_url').eq('id', id).single();

    // 2. Delete physical file from 'news-images' bucket FIRST while RLS row still exists
    if (newsRow?.image_url) {
        const storageResult = await deleteStorageFileAction(newsRow.image_url, 'news-images');

        // Optional: If storage deletion hits an RLS error, catch it here
        if (!storageResult.success) {
            console.error('Storage deletion failed:', storageResult.message);
        }
    }

    // 3. Delete database row LAST
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) return { success: false as const, message: error.message };

    revalidatePath('/bulletin');
    return { success: true as const, message: 'News successfully deleted.' };
}
