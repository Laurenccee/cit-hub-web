'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/utils/constants/routes';
import { DEFAULT_TEMP_PASSWORD } from '@/utils/constants/auth';
import { getErrorMessage } from '@/utils/errors';
import type { ActionResult } from '@/types/action';

export type RegisterUserConfig = {
  email: string;
  roleId: number;
  revalidatePath?: string | string[];
  failureCleanup?: 'none' | 'user';
};

export async function registerUserWithRole({
  email,
  roleId,
  revalidatePath: revalidatePaths,
  failureCleanup = 'user',
}: RegisterUserConfig): Promise<ActionResult> {
  const supabaseAdmin = createAdminClient();

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: DEFAULT_TEMP_PASSWORD,
      email_confirm: false,
    });

    if (authError || !authData.user) {
      return {
        success: false,
        message: authError?.message || 'Failed to create authentication user.',
      };
    }

    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      email,
      role_id: roleId,
      change_password: true,
    });

    if (profileError) {
      if (failureCleanup === 'user') {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      }
      return { success: false, message: profileError.message };
    }

    const { error: emailError } = await supabaseAdmin.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/${ROUTES.SIGN_IN}`,
      },
    });

    if (emailError) {
      console.error('Verification email failed to send:', emailError.message);
      return {
        success: false,
        message: emailError.message || 'User created but failed to send verification email.',
      };
    }

    if (revalidatePaths) {
      const paths = Array.isArray(revalidatePaths) ? revalidatePaths : [revalidatePaths];
      for (const path of paths) {
        revalidatePath(path);
      }
    }
    return { success: true };
  } catch (error) {
    console.error('Registration Action Error:', error);
    return { success: false, message: getErrorMessage(error, 'An unexpected error occurred.') };
  }
}

/**
 * Removes the profile row and the Supabase auth user for an account. Domain
 * tables (students/personnel) and avatar storage are cleared by the caller,
 * which owns that feature's cleanup order. Throws on the first failure so the
 * caller's try/catch can surface it through `getErrorMessage`.
 */
export async function unregisterUser(id: string): Promise<void> {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const { error: profileError } = await supabase.from('profiles').delete().eq('id', id);
  if (profileError) throw profileError;

  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (authError) throw authError;
}
