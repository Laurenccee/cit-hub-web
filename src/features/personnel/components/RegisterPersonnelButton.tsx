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
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { MailIcon } from '@hugeicons/core-free-icons';
import InputField from '@/components/shared/InputField';
import { SubmitHandler, useForm } from 'react-hook-form';
import { RegisterPersonnelData, RegisterPersonnelSchema } from '../schema/personnel';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterPersonnelAction } from '../action';
import { toast } from 'sonner';

const FORM_ID = 'register-user';

export default function RegisterPersonnelButton() {
    const { isAdmin, isFaculty } = useAuth();
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);

    if (!isAdmin) return null;

    const { control, handleSubmit, reset } = useForm<RegisterPersonnelData>({
        resolver: zodResolver(RegisterPersonnelSchema),
        defaultValues: {
            email: '',
        },
    });

    const handleFormSubmit: SubmitHandler<RegisterPersonnelData> = async (data) => {
        startTransition(async () => {
            try {
                const result = await RegisterPersonnelAction(data);

                if (!result.success) {
                    throw new Error(result.message || 'Failed to add personnel.');
                }

                toast.success(
                    'Personnel account created successfully! An email has been sent to the user with instructions to set up their profile.',
                );

                reset();
                setOpen(false);
            } catch (error: any) {
                toast.error(error.message || 'An unexpected error occurred.');
            }
        });
    };

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

                <form id={FORM_ID} onSubmit={handleSubmit(handleFormSubmit)}>
                    <InputField
                        name="email"
                        label="Institution Email"
                        control={control}
                        isPending={isPending}
                        placeholder="e.g. john.doe@intuition.edu"
                        leadingIcon={<HugeiconsIcon icon={MailIcon} />}
                    />
                </form>

                <DialogFooter className="border-t pt-4">
                    <Button type="submit" form={FORM_ID} size="xl" disabled={isPending}>
                        {isPending ? <Loader2 size={16} className="animate-spin" /> : 'Add Personnel'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
