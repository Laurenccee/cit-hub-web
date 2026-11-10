'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import { Edit01Icon } from '@hugeicons/core-free-icons';
import type { EditPersonnelButtonProps } from '../types';

const EditPersonnelBody = dynamic(() => import('./EditPersonnelBody'), {
    ssr: false,
    loading: () => (
        <>
            <DialogTitle className="sr-only">Edit Personnel</DialogTitle>
            <DialogDescription className="sr-only">Loading personnel form.</DialogDescription>
            <Skeleton className="h-96 w-full rounded-none" />
        </>
    ),
});

export default function EditPersonnelButton({ personnel, ranks, designations }: EditPersonnelButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon-xs" variant="outline" className="cursor-pointer hover:bg-accent transition-colors">
                    <HugeiconsIcon icon={Edit01Icon} />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-7xl max-h-[85vh] p-0 overflow-hidden flex flex-row gap-0">
                <EditPersonnelBody
                    personnel={personnel}
                    ranks={ranks}
                    designations={designations}
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
