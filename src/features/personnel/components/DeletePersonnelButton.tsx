'use client';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { deletePersonnelAction } from '../action';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DeletePersonnelButton({ id, name }: { id: string; name: string }) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    async function handleDelete() {
        setIsPending(true);
        try {
            const result = await deletePersonnelAction(id);
            if (!result.success) {
                toast.error(result.message || 'Failed to delete personnel');
                return;
            }
            toast.success(`${name} has been removed.`);
            setOpen(false);
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setIsPending(false);
        }
    }

    return (
        <DeleteConfirmDialog
            open={open}
            onOpenChange={setOpen}
            title="Remove Personnel"
            description={
                <>
                    Are you sure you want to remove <strong>{name}</strong>? This permanently deletes their account and
                    cannot be undone.
                </>
            }
            confirmLabel="Remove"
            isPending={isPending}
            onConfirm={handleDelete}
        />
    );
}
