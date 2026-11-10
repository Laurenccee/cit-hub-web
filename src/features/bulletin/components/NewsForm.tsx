'use client';
import { Separator } from '@/components/ui/separator';
import ImageDropzone from '@/components/shared/media/ImageDropzone';
import type {
    BaseSyntheticEvent,
    ChangeEvent,
    RefObject,
} from 'react';
import type { Control } from 'react-hook-form';
import type { ContentType, NewsItem } from '../types';
import type { NewsFormData } from '../schema/news';
import InputField from '@/components/shared/forms/InputField';
import { HugeiconsIcon } from '@hugeicons/react';
import AreaField from '@/components/shared/forms/AreaField';
import ComboboxField from '@/components/shared/forms/ComboboxField';
import SwitchToggle from '@/components/shared/forms/SwitchToggle';
import { Link01Icon, Link04Icon, NewsIcon, TextIcon } from '@hugeicons/core-free-icons';

interface NewsFormProps {
    id?: string;
    news?: NewsItem;
    contentTypes: ContentType[];
    control: Control<NewsFormData>;
    isPending: boolean;
    pendingBlobRef: RefObject<Blob | null>;
    handleTitleChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleTypeChange: (value: string) => void;
    onSubmit: (e?: BaseSyntheticEvent) => void;
}

export default function NewsForm({
    id,
    news,
    contentTypes,
    control,
    isPending,
    pendingBlobRef,
    handleTitleChange,
    handleTypeChange,
    onSubmit,
}: NewsFormProps) {
    return (
        <form
            id={id}
            className="flex flex-col gap-6 overflow-y-auto flex-1 py-4 px-6"
            onSubmit={onSubmit}
        >
            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Image{' '}
                        <span className="text-muted-foreground font-normal normal-case tracking-normal">
                            (optional)
                        </span>
                    </p>
                    <ImageDropzone
                        variant="news"
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
                    onChange={handleTitleChange}
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
                    onChange={handleTypeChange}
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
