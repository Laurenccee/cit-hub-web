'use client';

import InputField from '@/components/shared/InputField';
import { zodResolver } from '@hookform/resolvers/zod';
import { Email, Loading02Icon, User03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTransition } from 'react';
import { ForgetPasswordData, ForgetPasswordSchema } from '../schemas/authSchema';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { forgetPasswordAction } from '../actions/index';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';

export default function ForgetPasswordForm() {
    const [isPending, startTransistion] = useTransition();
    const router = useRouter();

    const { control, handleSubmit } = useForm<ForgetPasswordData>({
        resolver: zodResolver(ForgetPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const handleForgetPassword: SubmitHandler<ForgetPasswordData> = async (data) => {
        startTransistion(async () => {
            try {
                const result = await forgetPasswordAction(data);

                if (result?.success === false) {
                    toast.error(result.message || 'An error occurred.');
                    return;
                }
                toast.success(
                    `Check your inbox! If an account exists for ${data.email}, you'll find a reset link there.`,
                );
                router.push(ROUTES.SIGN_IN);
            } catch (error) {
                toast.error('An error occurred during password reset.');
            }
        });
    };
    return (
        <form id="forget-password-form" className="flex flex-col gap-4" onSubmit={handleSubmit(handleForgetPassword)}>
            <div className="flex flex-col gap-2">
                <InputField
                    label="Email"
                    type="email"
                    name="email"
                    control={control}
                    isPending={isPending}
                    placeholder="Eg. john.doe@example.com"
                    leadingIcon={<HugeiconsIcon icon={User03Icon} color="currentColor" strokeWidth={1.5} />}
                />
            </div>
            <Button form="forget-password-form" size="xl" className="w-full" disabled={isPending}>
                {isPending ? 'Resetting Password...' : 'Reset Password'}
                {isPending ? (
                    <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />
                ) : (
                    <HugeiconsIcon icon={Email} />
                )}
            </Button>
        </form>
    );
}
