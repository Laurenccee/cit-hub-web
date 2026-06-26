'use server';

import { createClient } from '@/lib/supabase/server';
import {
    ForgetPasswordData,
    ResetPasswordData,
    ResetPasswordSchema,
    SignInSchema,
    type SignInFormData,
} from '../schemas/authSchema';
import { revalidatePath } from 'next/cache';

export async function signInAction(values: SignInFormData) {
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
            return { success: false, message: error.message };
        }

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (err: any) {
        console.error('Sign in unexpected error:', err);
        return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function forgetPasswordAction(values: ForgetPasswordData) {
    try {
        const supabase = await createClient();

        const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
            redirectTo: `${process.env.SITE_URL}/reset-password`,
        });

        if (error) {
            return { success: false, message: error.message };
        }

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (err: any) {
        console.error('Forget password unexpected error:', err);
        return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function resetPasswordAction(values: ResetPasswordData) {
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
            return { success: false, message: authError.message };
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

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (err: any) {
        console.error('Reset password unexpected error:', err);
        return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
}

export async function signOutAction() {
    try {
        const supabase = await createClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
            return { success: false, message: error.message };
        }

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (err: any) {
        console.error('Sign out unexpected error:', err);
        return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
}
