'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useState } from 'react';

const RegisterPersonnelBody = dynamic(() => import('./RegisterPersonnelBody'), {
    ssr: false,
    loading: () => <Skeleton className="h-24 w-full" />,
});

export default function RegisterPersonnelButton() {
    const { isAdmin } = useAuth();
    const [open, setOpen] = useState(false);

    if (!isAdmin) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="xl">
                    Add New Personnel
                </Button>
            </DialogTrigger>
            <DialogContent className="lg:max-w-md flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-base text-primary">Add New Personnel</DialogTitle>
                    <DialogDescription className="text-sm">
                        Fill in the details below to add a new personnel member.
                    </DialogDescription>
                </DialogHeader>

                <RegisterPersonnelBody onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}
