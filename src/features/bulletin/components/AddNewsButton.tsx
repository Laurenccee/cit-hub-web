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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import AddNewsForm from './AddNewsForm';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { LookupOption } from '@/types/types';

const FORM_ID = 'add-news-form';

export default function AddNewsButton({
  contentTypes,
}: {
  contentTypes: LookupOption[];
}) {
  const { isAdmin, isFaculty } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );

  if (!isAdmin && !isFaculty) return null;

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
        <div
          ref={setPortalContainer}
          className="flex flex-col flex-1 min-w-0 max-h-[80vh]"
        >
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Add News & Announcement</DialogTitle>
            <DialogDescription>
              Fill in the details below to publish a new article or
              announcement.
            </DialogDescription>
          </DialogHeader>
          <AddNewsForm
            id={FORM_ID}
            contentTypes={contentTypes}
            onPendingChange={setIsPending}
            onSuccess={() => setOpen(false)}
            portalContainer={portalContainer}
          />
          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button type="submit" form={FORM_ID} size="lg" disabled={isPending}>
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                'Publish'
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
