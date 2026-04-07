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
import AddPersonnelForm from './AddPersonnelForm';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { LookupOption } from '@/types/types';

const FORM_ID = 'add-personnel-form';

export default function AddPersonnelButton({
  ranks,
  designations,
}: {
  ranks: LookupOption[];
  designations: LookupOption[];
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
      <DialogTrigger asChild>
        <Button variant="outline" size="xl">
          Add New Personnel
        </Button>
      </DialogTrigger>
      <DialogContent className="lg:max-w-screen-2xl flex p-0 flex-row max-h-[80vh]">
        <div
          ref={setPortalContainer}
          className="flex flex-col flex-1 min-w-0 max-h-[90vh]"
        >
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Add New Personnel</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new personnel member.
            </DialogDescription>
          </DialogHeader>
          <AddPersonnelForm
            id={FORM_ID}
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
                'Add Personnel'
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
