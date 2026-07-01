'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { PostgrestError } from '@supabase/supabase-js';
import { NewsSchema, type NewsFormData } from '../schema/news';
import { getAuthorizedUser } from '@/actions';
import { deleteStorageFileAction, uploadNewsImageAction } from '@/actions/image';

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

export async function deleteNewsAction(id: string) {
    const authorized = await getAuthorizedUser();
    if (!authorized) return { success: false as const, message: 'Unauthorized.' };

    const supabase = await createClient();

    const { data: newsRow } = await supabase.from('news').select('image_url').eq('id', id).single();
    if (newsRow?.image_url) {
        const storageResult = await deleteStorageFileAction(newsRow.image_url, 'news-images');

        if (!storageResult.success) {
            console.error('Storage deletion failed:', storageResult.message);
        }
    }

    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) return { success: false as const, message: error.message };

    revalidatePath('/bulletin');
    return { success: true as const, message: 'News successfully deleted.' };
}
