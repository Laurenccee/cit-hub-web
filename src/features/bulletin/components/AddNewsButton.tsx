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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { ContentType } from '../types';
import NewsForm from './NewsForm';
import { NewsFormData } from '../schema/news';
import { addNewsAction } from '../action';

const FORM_ID = 'add-news-form';

export default function AddNewsButton({ contentTypes }: { contentTypes: ContentType[] }) {
    const { isAdmin, isFaculty } = useAuth();
    const [isPending, setIsPending] = useState(false);
    const [open, setOpen] = useState(false);
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

    if (!isAdmin && !isFaculty) return null;

    const INITIAL_VALUES: NewsFormData = {
        title: '',
        description: '',
        content: '',
        slug: '',
        imageUrl: undefined,
        imageAlt: '',
        typesId: undefined,
        isPublished: false,
        isFeatured: false,
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button size="icon-xl" className="w-full aspect-square sm:w-auto">
                            <Plus />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Add News & Announcement</TooltipContent>
            </Tooltip>
            <DialogContent className="sm:max-w-2xl flex p-0 flex-row max-h-[80vh]">
                <div ref={setPortalContainer} className="flex flex-col flex-1 min-w-0 max-h-[80vh]">
                    <DialogHeader className="px-6 pt-6 pb-2">
                        <DialogTitle>Add News & Announcement</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to publish a new article or announcement.
                        </DialogDescription>
                    </DialogHeader>
                    <NewsForm
                        id={FORM_ID}
                        mode="create"
                        initialValues={INITIAL_VALUES}
                        submitAction={addNewsAction}
                        contentTypes={contentTypes}
                        onPendingChange={setIsPending}
                        onSuccess={() => setOpen(false)}
                        portalContainer={portalContainer}
                    />
                    <DialogFooter className="px-6 py-4 border-t shrink-0">
                        <Button type="submit" form={FORM_ID} size="lg" disabled={isPending}>
                            {isPending ? <Loader2 size={16} className="animate-spin" /> : 'Publish'}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
