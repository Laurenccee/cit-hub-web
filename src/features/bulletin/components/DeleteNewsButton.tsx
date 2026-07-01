'use client';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { deleteNewsAction } from '../action';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DeleteNewsButton({ id, title }: { id: string; title: string }) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    async function handleDelete() {
        setIsPending(true);
        try {
            const result = await deleteNewsAction(id);
            if (!result.success) {
                toast.error(result.message || 'Failed to delete news');
                return;
            }
            toast.success('News article deleted.');
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
            title="Delete Article"
            description={
                <>
                    Are you sure you want to delete <strong>&ldquo;{title}&rdquo;</strong>? This cannot be undone.
                </>
            }
            confirmLabel="Delete"
            isPending={isPending}
            onConfirm={handleDelete}
        />
    );
}
