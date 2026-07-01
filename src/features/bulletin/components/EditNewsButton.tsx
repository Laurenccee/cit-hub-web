'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState, useMemo } from 'react';
import { type NewsFormData } from '../schema/news';
import { ContentType, NewsItem } from '../types';
import { updateNewsAction } from '../action';
import NewsForm from './NewsForm';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Edit01Icon, Loading02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import DeleteNewsButton from './DeleteNewsButton';

const FORM_ID = 'edit-news-form';

const toFormValues = (news: NewsItem): NewsFormData => ({
    title: news.title ?? '',
    description: news.description ?? '',
    content: news.content ?? '',
    slug: news.slug ?? '',
    imageUrl: news.image_url ?? undefined,
    imageAlt: news.image_alt ?? '',
    typesId: news.content_type_id ?? undefined,
    isPublished: news.is_published ?? false,
    isFeatured: news.is_featured ?? false,
});

export default function EditNewsButton({ news, contentTypes }: { news: NewsItem; contentTypes: ContentType[] }) {
    const { isAdmin, isFaculty } = useAuth();
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

    if (!isAdmin && !isFaculty) return null;

    const initialValues = useMemo(
        () => toFormValues(news),
        [
            news.id,
            news.title,
            news.description,
            news.content,
            news.slug,
            news.image_url,
            news.image_alt,
            news.content_type_id,
            news.is_published,
            news.is_featured,
        ],
    );

    console.log('EditNewsButton initialValues:', initialValues); // Debugging line

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" variant="ghost" className="text-xs text-muted-foreground">
                    <HugeiconsIcon icon={Edit01Icon} />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl flex p-0 flex-row max-h-[80vh]">
                <div ref={setPortalContainer} className="flex flex-col flex-1 min-w-0 max-h-[80vh]">
                    <DialogHeader className="px-6 pt-6 pb-2">
                        <DialogTitle>Edit News</DialogTitle>
                        <DialogDescription>Update the details for &ldquo;{news.title}&rdquo;.</DialogDescription>
                    </DialogHeader>

                    <NewsForm
                        id={FORM_ID}
                        mode="update"
                        news={news}
                        initialValues={initialValues} // 3. Passed cleanly here
                        submitAction={updateNewsAction} // 4. One-liner direct server action mapping
                        contentTypes={contentTypes}
                        onPendingChange={setIsPending}
                        onSuccess={() => setOpen(false)}
                        portalContainer={portalContainer}
                    />

                    <DialogFooter className="flex justify-between px-6 py-4 border-t shrink-0">
                        <DeleteNewsButton id={news.id} title={news.title} />
                        <Button type="submit" form={FORM_ID} size="lg" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save Changes'}
                            {isPending ? (
                                <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />
                            ) : (
                                <HugeiconsIcon icon={Edit01Icon} />
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
