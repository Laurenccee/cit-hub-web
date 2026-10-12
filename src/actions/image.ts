'use server';

import { createClient } from '@/lib/supabase/server';
import type { UploadActionResult } from '@/types/action';
import { getErrorMessage } from '@/utils/errors';
import { getAuthenticatedUser, getAuthorizedAdmin, getAuthorizedUser } from '.';

interface UploadConfig {
    bucket: string;
    folderId: string;
    prefix: string;
    file: File;
    oldFilePath?: string | null;
}

/**
 * Extracts the raw storage file path relative to a bucket from a full Supabase Public URL string.
 */
function getStoragePath(publicUrl: string): string | null {
    try {
        const url = new URL(publicUrl);
        // Supabase standard public asset path string template
        const anchor = '/storage/v1/object/public/';
        const anchorIndex = url.pathname.indexOf(anchor);
        if (anchorIndex === -1) return null;

        const afterAnchor = url.pathname.slice(anchorIndex + anchor.length);
        const slashIndex = afterAnchor.indexOf('/');
        if (slashIndex === -1) return null;

        // Extracts everything after the bucket name identifier segment
        return afterAnchor.slice(slashIndex + 1);
    } catch {
        return null;
    }
}

/**
 * Base Core engine to manage single uploads and clean up detached file pointers safely.
 */
async function uploadStorageFile({ bucket, folderId, prefix, file, oldFilePath }: UploadConfig): Promise<string> {
    const supabase = await createClient();
    const ext = file.name.split('.').pop() || 'jpg';

    // Using an isolated timestamped naming format to bypass client cache invalidation locks
    const fileName = `${prefix}-${Date.now()}.${ext}`;

    // Construct dynamic path (e.g., 'profile-pictures/USER_ID/avatar-1719600000.jpg')
    // For a flat structure like 'news-images', folderId can just be skipped or passed empty
    const storagePath = folderId ? `${folderId}/${fileName}` : fileName;

    // 1. Upload new asset
    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, { contentType: file.type, upsert: true });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    // 2. Perform atomic old asset extraction and deletion if overwritten
    if (oldFilePath) {
        const path = getStoragePath(oldFilePath);
        if (path) {
            // Soft fail logging so database errors don't crash standard form validation pipelines
            const { error: deleteError } = await supabase.storage.from(bucket).remove([path]);

            if (deleteError) {
                console.warn(`⚠️ Orphaned file cleanup failed at path [${path}]:`, deleteError.message);
            }
        }
    }

    // 3. Return the fresh public asset lookup URL destination string
    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    return data.publicUrl;
}

/* ==========================================================================
   EXPORTED DOMAIN SPECIFIC HANDLERS
   ========================================================================== */

/**
 * Avatars are a self-service upload (any signed-in user manages their own), unlike news
 * images which are editorial content restricted to Admin/Faculty via `getAuthorizedUser`.
 */
async function handleImageUpload(
    formData: FormData,
    oldFilePath: string | null | undefined,
    options: Pick<UploadConfig, 'bucket' | 'folderId' | 'prefix'>,
    authorize: () => Promise<unknown | null>,
): Promise<UploadActionResult> {
    try {
        const file = formData.get('file') as File | null;
        if (!file || file.size === 0) return { success: false, message: 'No file provided.' };

        const authorized = await authorize();
        if (!authorized) return { success: false, message: 'Authentication required.' };

        const publicUrl = await uploadStorageFile({ ...options, file, oldFilePath });
        return { success: true, url: publicUrl };
    } catch (err) {
        return { success: false, message: getErrorMessage(err, 'An unexpected error occurred.') };
    }
}

/**
 * Universally handles Personnel Profile Pictures
 * Bucket layout: 'cit_hub' -> 'profile-pictures/USER_ID/avatar-timestamp.jpg'
 */
export async function uploadAvatarAction(formData: FormData, oldFilePath?: string | null) {
    return handleImageUpload(
        formData,
        oldFilePath,
        { bucket: 'avatar-images', folderId: '', prefix: 'avatar' },
        getAuthenticatedUser,
    );
}

/**
 * Universally handles Bulletin Board Cover Images
 * Bucket layout: 'news-images' -> 'news-timestamp.jpg' (Flat layout structure)
 */
export async function uploadNewsImageAction(formData: FormData, oldFilePath?: string | null) {
    return handleImageUpload(
        formData,
        oldFilePath,
        { bucket: 'news-images', folderId: '', prefix: 'news' },
        getAuthorizedUser,
    );
}

/**
 * Universally handles Event Cover Images
 * Bucket layout: 'event-images' -> 'event-timestamp.jpg' (Flat layout structure)
 */
export async function uploadEventImageAction(formData: FormData, oldFilePath?: string | null) {
    return handleImageUpload(
        formData,
        oldFilePath,
        { bucket: 'event-images', folderId: '', prefix: 'event' },
        getAuthorizedAdmin,
    );
}

/**
 * Helper mechanism to standalone-delete image URLs when removing database records entirely.
 */
export async function deleteStorageFileAction(url: string, bucket: string) {
    const authorized =
        bucket === 'avatar-images'
            ? await getAuthenticatedUser()
            : bucket === 'event-images'
              ? await getAuthorizedAdmin()
              : await getAuthorizedUser();
    if (!authorized) return { success: false, message: 'Authentication required.' };

    try {
        const path = getStoragePath(url);
        if (!path) return { success: false, message: 'Invalid asset URL structure.' };

        const supabase = await createClient();
        const { error } = await supabase.storage.from(bucket).remove([path]);

        if (error) return { success: false, message: error.message };
        return { success: true };
    } catch {
        return { success: false, message: 'An unexpected deletion error occurred.' };
    }
}
