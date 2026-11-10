'use client';

import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { MailIcon } from '@hugeicons/core-free-icons';
import InputField from '@/components/shared/forms/InputField';
import { SubmitHandler, useForm } from 'react-hook-form';
import { RegisterPersonnelData, RegisterPersonnelSchema } from '../schema/personnel';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerPersonnelAction } from '../action';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/errors';

const FORM_ID = 'register-user';

export default function RegisterPersonnelBody({ onSuccess }: { onSuccess: () => void }) {
    const [isPending, startTransition] = useTransition();

    const { control, handleSubmit, reset } = useForm<RegisterPersonnelData>({
        resolver: zodResolver(RegisterPersonnelSchema),
        defaultValues: {
            email: '',
        },
    });

    const handleFormSubmit: SubmitHandler<RegisterPersonnelData> = async (data) => {
        startTransition(async () => {
            try {
                const result = await registerPersonnelAction(data);

                if (!result.success) {
                    throw new Error(result.message || 'Failed to add personnel.');
                }

                toast.success(
                    'Personnel account created successfully! An email has been sent to the user with instructions to set up their profile.',
                );

                reset();
                onSuccess();
            } catch (error) {
                toast.error(getErrorMessage(error, 'An unexpected error occurred.'));
            }
        });
    };

    return (
        <>
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
        </>
    );
}
