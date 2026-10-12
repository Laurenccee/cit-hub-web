'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { NewsSchema, type NewsFormData } from '../schema/news';
import { getAuthorizedUser } from '@/actions';
import { runMutation } from '@/actions/mutation';
import { deleteStorageFileAction } from '@/actions/image';
import { ROUTES } from '@/utils/constants/routes';
import { getErrorMessage } from '@/utils/errors';

/** Maps the camelCase form fields onto their snake_case `news` columns. */
function toNewsPayload(data: NewsFormData) {
    return {
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
}

export async function addNewsAction(values: NewsFormData) {
    return runMutation({
        values,
        schema: NewsSchema,
        authorize: getAuthorizedUser,
        revalidate: [ROUTES.BULLETIN],
        successMessage: 'News successfully created!',
        execute: (data, { supabase, userId }) => supabase.from('news').insert({ author_id: userId, ...toNewsPayload(data) }),
    });
}

// fallow-ignore-next-line unused-server-action
export async function updateNewsAction(values: NewsFormData, targetId: string) {
    return runMutation({
        values,
        schema: NewsSchema,
        authorize: getAuthorizedUser,
        revalidate: [ROUTES.BULLETIN],
        successMessage: 'News successfully updated!',
        execute: (data, { supabase }) => supabase.from('news').update(toNewsPayload(data)).eq('id', targetId),
    });
}

// fallow-ignore-next-line unused-server-action
export async function deleteNewsAction(id: string) {
    const authorized = await getAuthorizedUser();
    if (!authorized) return { success: false as const, message: 'Unauthorized.' };

    const supabase = await createClient();

    try {
        const { data: newsRow } = await supabase.from('news').select('image_url').eq('id', id).single();
        if (newsRow?.image_url) {
            const storageResult = await deleteStorageFileAction(newsRow.image_url, 'news-images');

            if (!storageResult.success) {
                console.error('Storage deletion failed:', storageResult.message);
            }
        }

        const { error } = await supabase.from('news').delete().eq('id', id);
        if (error) throw error;

        revalidatePath(ROUTES.BULLETIN);
        return { success: true as const, message: 'News successfully deleted.' };
    } catch (error) {
        return { success: false as const, message: getErrorMessage(error, 'An unexpected error occurred.') };
    }
}
