'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types/action';
import { ROUTES } from '@/utils/constants/routes';
import {
    ForgetPasswordData,
    ForgetPasswordSchema,
    ResetPasswordData,
    ResetPasswordSchema,
    SignInSchema,
    type SignInFormData,
} from '../schema/auth';

export async function signInAction(values: SignInFormData): Promise<ActionResult> {
    try {
        const validatedFields = SignInSchema.safeParse(values);
        if (!validatedFields.success) {
            return { success: false, message: 'Please fill in all required fields.' };
        }

        const supabase = await createClient();

        const { error } = await supabase.auth.signInWithPassword({
            email: validatedFields.data.email,
            password: validatedFields.data.password,
        });

        if (error) {
            if (error.message === 'Email not confirmed') {
                await supabase.auth.resend({
                    type: 'signup',
                    email: validatedFields.data.email,
                });
                return {
                    success: false,
                    message: 'Your email is not verified. A new verification link has been sent to your inbox.',
                };
            }
            return { success: false, message: 'Invalid email or password. Please try again.' };
        }

        revalidatePath(ROUTES.HOME);
        revalidatePath(ROUTES.ROOT);
        return { success: true };
    } catch (err) {
        console.error('Sign in unexpected error:', err);
        return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function forgetPasswordAction(values: ForgetPasswordData): Promise<ActionResult> {
    try {
        const validatedFields = ForgetPasswordSchema.safeParse(values);
        if (!validatedFields.success) {
            const message = validatedFields.error.issues[0]?.message ?? 'Please enter a valid email.';
            return { success: false, message };
        }

        const supabase = await createClient();

        const { error } = await supabase.auth.resetPasswordForEmail(validatedFields.data.email, {
            redirectTo: `${process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
        });

        if (error) {
            return { success: false, message: 'Unable to send password reset email. Please try again.' };
        }

        return { success: true, message: 'Password reset email sent.' };
    } catch (err) {
        console.error('Forget password unexpected error:', err);
        return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function resetPasswordAction(values: ResetPasswordData): Promise<ActionResult> {
    try {
        const validatedFields = ResetPasswordSchema.safeParse(values);
        if (!validatedFields.success) {
            return { success: false, message: 'Please fill in all required fields.' };
        }

        const supabase = await createClient();

        const { data: authData, error: authError } = await supabase.auth.updateUser({
            password: validatedFields.data.password,
        });

        if (authError) {
            return { success: false, message: 'Unable to reset password. Please try again.' };
        }

        if (authData?.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ change_password: false })
                .eq('id', authData.user.id);

            if (profileError) {
                console.error('Failed to update profile flag:', profileError.message);
            }
        }

        revalidatePath(ROUTES.HOME);
        return { success: true };
    } catch (err) {
        console.error('Reset password unexpected error:', err);
        return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function signOutAction(): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
            return { success: false, message: 'Failed to sign out. Please try again.' };
        }

        revalidatePath(ROUTES.ROOT);
        revalidatePath(ROUTES.HOME);
        return { success: true };
    } catch (err) {
        console.error('Sign out unexpected error:', err);
        return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
}
