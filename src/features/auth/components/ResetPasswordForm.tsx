'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowRight, Loader2, RectangleEllipsis } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ResetPasswordData, ResetPasswordSchema } from '../schemas/authSchema';
import InputField from '@/components/shared/InputField';
import PasswordRulesCard from '@/components/shared/PasswordRuleCard';
import { resetPasswordAction } from '../actions/index';

export default function ResetPasswordForm() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { control, handleSubmit, reset } = useForm<ResetPasswordData>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: '',
        },
    });

    const passwordValue = useWatch({ control, name: 'password' }) || '';

    const handlePasswordReset: SubmitHandler<ResetPasswordData> = (data) => {
        startTransition(async () => {
            try {
                const result = await resetPasswordAction(data);

                if (result.success) {
                    toast.success('Password updated successfully!');
                    reset();
                    router.replace('/');
                } else {
                    toast.error(result.message);
                }
            } catch (error) {
                toast.error('An unexpected error occurred. Please try again.');
                console.error('Form Submission Error:', error);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(handlePasswordReset)} id="verification-form" className="flex flex-col gap-6">
            <InputField
                name="password"
                label="Password"
                control={control}
                isPending={isPending}
                type="password"
                placeholder="Enter Password"
                leadingIcon={<RectangleEllipsis size={18} />}
            />
            <PasswordRulesCard password={passwordValue} />

            <Button
                type="submit"
                form="verification-form"
                disabled={isPending}
                size="xl"
                className="w-full text-xs tracking-[0.25em] uppercase transition-all active:scale-[0.98]"
            >
                {isPending ? (
                    <span className="flex items-center gap-2">
                        Updating <Loader2 size={16} className="animate-spin" />
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        Reset Password <ArrowRight size={16} strokeWidth={1.5} />
                    </span>
                )}
            </Button>
        </form>
    );
}
