'use client';
import { Separator } from '@/components/ui/separator';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type NewsFormData, NewsSchema } from '../schema/news';
import NewsImageDropzone from './NewsImageDropzone';
import { useEffect, useRef, useTransition } from 'react';
import { toast } from 'sonner';
import { slugify } from '@/utils/formatters';
import { ContentType, NewsItem } from '../types';
import InputField from '@/components/shared/InputField';
import { HugeiconsIcon } from '@hugeicons/react';
import AreaField from '@/components/shared/AreaField';
import ComboboxField from '@/components/shared/ComboboxField';
import SwitchToggle from '@/components/shared/SwitchToggle';
import { Image02Icon, Link01Icon, Link04Icon, NewsIcon, TextIcon } from '@hugeicons/core-free-icons';
import { deleteStorageFileAction, uploadNewsImageAction } from '@/actions/image';

interface NewsFormProps {
    id?: string;
    mode?: 'create' | 'update';
    news?: NewsItem;
    initialValues: NewsFormData; // Vital for hydration
    contentTypes: ContentType[];
    onPendingChange?: (isPending: boolean) => void;
    onSuccess?: () => void;
    portalContainer?: HTMLElement | null;
    submitAction: (data: NewsFormData & { imageUrl?: string }, targetId: string) => Promise<any>;
}

export default function NewsForm({
    id,
    mode,
    news,
    initialValues,
    contentTypes,
    onPendingChange,
    onSuccess,
    portalContainer,
    submitAction,
}: NewsFormProps) {
    const pendingBlobRef = useRef<Blob | null>(null);
    const isEditMode = mode === 'update';

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { isSubmitting },
    } = useForm<NewsFormData>({
        resolver: zodResolver(NewsSchema),
        defaultValues: initialValues,
    });

    useEffect(() => {
        reset(initialValues);
    }, [initialValues, reset]);

    useEffect(() => {
        onPendingChange?.(isSubmitting);
    }, [isSubmitting, onPendingChange]);

    const titleValue = useWatch({ control, name: 'title' });
    const typesIdValue = useWatch({ control, name: 'typesId' });

    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (isEditMode) return;

        const typeSlug = contentTypes.find((ct) => ct.id === typesIdValue)?.slug;
        const titleSlug = slugify(titleValue ?? '');
        const generated = typeSlug ? `${typeSlug}/${titleSlug}` : titleSlug;
        setValue('slug', generated, { shouldValidate: false });
    }, [titleValue, typesIdValue, contentTypes, setValue, isEditMode]);

    const handleFormSubmit: SubmitHandler<NewsFormData> = async (data) => {
        startTransition(async () => {
            let imageUrl: string | undefined = data.imageUrl || undefined;
            let originalImageUrl = news?.image_url; // 👈 Track original state for cleanup checks

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

    return (
        <form
            id={id}
            className="flex flex-col gap-6 overflow-y-auto flex-1 py-4 px-6"
            onSubmit={handleSubmit(handleFormSubmit)}
        >
            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Image{' '}
                        <span className="text-muted-foreground font-normal normal-case tracking-normal">
                            (optional)
                        </span>
                    </p>
                    <NewsImageDropzone
                        initialUrl={news?.image_url}
                        onFile={(blob) => {
                            pendingBlobRef.current = blob;
                        }}
                    />
                    <InputField
                        label="imageAlt"
                        type="text"
                        name="imageAlt"
                        control={control}
                        isPending={isPending}
                        placeholder="Eg. Image description"
                        leadingIcon={<HugeiconsIcon icon={Link01Icon} color="currentColor" strokeWidth={1.5} />}
                    />
                </div>
                <Separator />

                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Content</p>
                <InputField
                    label="Title"
                    type="text"
                    name="title"
                    control={control}
                    isPending={isPending}
                    placeholder="Enter news title"
                    leadingIcon={<HugeiconsIcon icon={TextIcon} color="currentColor" strokeWidth={1.5} />}
                />
                <AreaField
                    label="Description"
                    type="text"
                    name="description"
                    control={control}
                    isPending={isPending}
                    placeholder="Brief description summary"
                    leadingIcon={<HugeiconsIcon icon={TextIcon} color="currentColor" strokeWidth={1.5} />}
                />
                <AreaField
                    label="Content"
                    type="text"
                    name="content"
                    control={control}
                    isPending={isPending}
                    placeholder="Main body content"
                    leadingIcon={<HugeiconsIcon icon={NewsIcon} color="currentColor" strokeWidth={1.5} />}
                />
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Meta</p>
                <ComboboxField
                    name="typesId"
                    label="Content Type"
                    control={control}
                    options={contentTypes}
                    valueKey="id"
                    labelKey="label"
                    placeholder="Select content type"
                    searchPlaceholder="Search content types..."
                    isPending={isPending}
                />
                <InputField
                    label="Slug"
                    type="text"
                    name="slug"
                    control={control}
                    isPending={isPending}
                    placeholder="auto-generated-from-title"
                    leadingIcon={<HugeiconsIcon icon={Link04Icon} color="currentColor" strokeWidth={1.5} />}
                    disabled
                />
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Settings</p>
                <div className="flex gap-6">
                    <SwitchToggle name="isPublished" control={control} label="Published Status" />
                    <SwitchToggle name="isFeatured" control={control} label="Featured Status" />
                </div>
            </div>
        </form>
    );
}
