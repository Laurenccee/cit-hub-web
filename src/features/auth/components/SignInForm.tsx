'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { SignInSchema, type SignInFormData } from '../schemas/authSchema';
import { signInAction } from '../actions';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import FormActions from './FormActions';
import InputField from '@/components/shared/InputField';
import { HugeiconsIcon } from '@hugeicons/react';
import { User03Icon, LockPasswordIcon, Loading02Icon, ArrowRight } from '@hugeicons/core-free-icons';

export default function SignInForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const { control, handleSubmit } = useForm<SignInFormData>({
        resolver: zodResolver(SignInSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const handleSignIn: SubmitHandler<SignInFormData> = async (data) => {
        startTransition(async () => {
            try {
                const result = await signInAction(data);

                if (result?.success === false) {
                    toast.error(result.message || 'Sign in failed');
                    return;
                }

                toast.success('Welcome, Pioneer!');
                router.replace('/');
            } catch {
                toast.error('An unexpected error occurred');
            }
        });
    };

    return (
        <form id="signin-form" onSubmit={handleSubmit(handleSignIn)} className="flex flex-col gap-4">
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
                <InputField
                    label="Password"
                    type="password"
                    name="password"
                    control={control}
                    isPending={isPending}
                    placeholder="Enter password"
                    leadingIcon={<HugeiconsIcon icon={LockPasswordIcon} color="currentColor" strokeWidth={1.5} />}
                />
                <FormActions />
            </div>
            <Button size="xl" type="submit" className="w-full" disabled={isPending} form="signin-form">
                {isPending ? 'Signing in...' : 'Sign In'}
                {isPending ? (
                    <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />
                ) : (
                    <HugeiconsIcon icon={ArrowRight} />
                )}
            </Button>
        </form>
    );
}
