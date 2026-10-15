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
            let imageUrl: string | undefined = data.imageUrl || undefined;
            const originalImageUrl = news?.image_url; // 👈 Track original state for cleanup checks

            try {
                if (pendingBlobRef.current) {
                    const fd = new FormData();
                    fd.append('file', pendingBlobRef.current, 'news.jpg');

                    // 1. Pass originalImageUrl here so it deletes the old file on upload success!
                    const uploadResult = await uploadNewsImageAction(fd, originalImageUrl);
                    if (!uploadResult.success) {
                        toast.error(uploadResult.message ?? 'Failed to upload image.');
                        return;
                    }
                    imageUrl = uploadResult.url;
                }

                const targetId = isEditMode ? news!.id : '';
                const result = await submitAction({ ...data, imageUrl }, targetId);

                if (!result.success) {
                    // Rollback uploaded image if the DB update itself failed
                    if (imageUrl && imageUrl !== originalImageUrl) {
                        await deleteStorageFileAction(imageUrl, 'news-images');
                    }
                    toast.error(result.message || `Failed to ${isEditMode ? 'update' : 'add'} news`);
                    return;
                }

                toast.success(`News ${isEditMode ? 'updated' : 'added'} successfully.`);
                if (!isEditMode) reset();
                onSuccess?.();
            } catch {
                // Error safety rollback
                if (imageUrl && imageUrl !== originalImageUrl) {
                    await deleteStorageFileAction(imageUrl, 'news-images');
                }
                toast.error('An unexpected error occurred');
            }
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
