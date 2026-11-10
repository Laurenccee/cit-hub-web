'use client';

import {
    useRef,
    useTransition,
    type BaseSyntheticEvent,
    type ChangeEvent,
} from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { slugify } from '@/utils/formatters';
import { NewsSchema, type NewsFormData } from '../schema/news';
import { deleteStorageFileAction, uploadNewsImageAction } from '@/actions/image';
import type { UseNewsFormProps } from '../types';

type SubmitOutcome = { success: true } | { success: false; message: string };
type ImageStep = { success: true; url?: string } | { success: false; message: string };

interface SubmitNewsArgs {
    data: NewsFormData;
    blob: Blob | null;
    originalImageUrl?: string | null;
    targetId: string;
    isEditMode: boolean;
    submitAction: UseNewsFormProps['submitAction'];
}

async function uploadPendingImage(
    blob: Blob | null,
    currentUrl: string | undefined,
    originalUrl?: string | null,
): Promise<ImageStep> {
    if (!blob) return { success: true, url: currentUrl };

    const fd = new FormData();
    fd.append('file', blob, 'news.jpg');

    // Passing the original URL makes the action delete the old file on upload success.
    const uploadResult = await uploadNewsImageAction(fd, originalUrl);
    if (!uploadResult.success) {
        return { success: false, message: uploadResult.message ?? 'Failed to upload image.' };
    }
    return { success: true, url: uploadResult.url };
}

async function rollbackUploadedImage(imageUrl: string | undefined, originalUrl?: string | null) {
    if (imageUrl && imageUrl !== originalUrl) {
        await deleteStorageFileAction(imageUrl, 'news-images');
    }
}

function failureMessage(message: string | undefined, isEditMode: boolean) {
    return message || `Failed to ${isEditMode ? 'update' : 'add'} news`;
}

async function submitNews({
    data,
    blob,
    originalImageUrl,
    targetId,
    isEditMode,
    submitAction,
}: SubmitNewsArgs): Promise<SubmitOutcome> {
    let imageUrl: string | undefined = data.imageUrl || undefined;

    try {
        const upload = await uploadPendingImage(blob, imageUrl, originalImageUrl);
        if (!upload.success) return upload;
        imageUrl = upload.url;

        const result = await submitAction({ ...data, imageUrl }, targetId);
        if (result.success) return { success: true };

        await rollbackUploadedImage(imageUrl, originalImageUrl);
        return { success: false, message: failureMessage(result.message, isEditMode) };
    } catch {
        await rollbackUploadedImage(imageUrl, originalImageUrl);
        return { success: false, message: 'An unexpected error occurred' };
    }
}

/**
 * Owns the News form engine (RHF + zodResolver + useTransition + toast +
 * action call) so rendering surfaces stay presentational. Mirrors the
 * useStudentForm/usePersonnelForm/useEventForm pattern.
 */
export function useNewsForm({
    mode,
    news,
    initialValues,
    contentTypes,
    submitAction,
    onSuccess,
}: UseNewsFormProps) {
    const pendingBlobRef = useRef<Blob | null>(null);
    const isEditMode = mode === 'update';
    const [isPending, startTransition] = useTransition();

    const { control, handleSubmit, setValue, getValues, reset } =
        useForm<NewsFormData>({
            resolver: zodResolver(NewsSchema),
            defaultValues: initialValues,
        });

    // Derived on the change events that affect it (not via a `useWatch` +
    // effect pair, which re-rendered the whole form on every keystroke).
    const buildSlug = (title: string, typeId: string | undefined) => {
        const typeSlug = contentTypes.find((ct) => ct.id === typeId)?.slug;
        const titleSlug = slugify(title ?? '');
        return typeSlug ? `${typeSlug}/${titleSlug}` : titleSlug;
    };

    const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValue('slug', buildSlug(event.target.value, getValues('typesId')), {
            shouldValidate: false,
        });
    };

    const handleTypeChange = (typeId: string) => {
        setValue('slug', buildSlug(getValues('title'), typeId), {
            shouldValidate: false,
        });
    };

    const handleFormSubmit: SubmitHandler<NewsFormData> = async (data) => {
        startTransition(async () => {
            const outcome = await submitNews({
                data,
                blob: pendingBlobRef.current,
                originalImageUrl: news?.image_url,
                targetId: isEditMode ? news!.id : '',
                isEditMode,
                submitAction,
            });

            if (!outcome.success) {
                toast.error(outcome.message);
                return;
            }

            toast.success(`News ${isEditMode ? 'updated' : 'added'} successfully.`);
            if (!isEditMode) reset();
            onSuccess?.();
        });
    };

    // Deferred so `handleSubmit` runs at event time, not during render — the
    // submit handler reads `pendingBlobRef`, and refs must not be read in render.
    const onSubmit = (event?: BaseSyntheticEvent) =>
        handleSubmit(handleFormSubmit)(event);

    return {
        control,
        isPending,
        pendingBlobRef,
        handleTitleChange,
        handleTypeChange,
        onSubmit,
    };
}
