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
import EditPersonnelForm from './EditPersonnelForm';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { LookupOption, Personnel } from '@/types/types';

const FORM_ID = 'edit-personnel-form';

export default function EditPersonnelButton({
  personnel,
  ranks,
  designations,
}: {
  personnel: Personnel;
  ranks: LookupOption[];
  designations: LookupOption[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="ghost"
          className="text-xs text-muted-foreground"
        >
          Edit Profile
          <ArrowRight size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent className="lg:max-w-screen-2xl flex p-0 flex-row max-h-[80vh]">
        <div
          ref={setPortalContainer}
          className="flex flex-col flex-1 min-w-0 max-h-[90vh]"
        >
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Edit Personnel</DialogTitle>
            <DialogDescription>
              Update the details for {personnel.name}.
            </DialogDescription>
          </DialogHeader>
          <EditPersonnelForm
            id={FORM_ID}
            personnel={personnel}
            onPendingChange={setIsPending}
            onSuccess={() => setOpen(false)}
            ranks={ranks}
            designations={designations}
            portalContainer={portalContainer}
          />
          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button type="submit" form={FORM_ID} size="lg" disabled={isPending}>
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
