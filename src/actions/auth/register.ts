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

type AdminClient = ReturnType<typeof createAdminClient>;

type AuthUserOutcome = { userId: string; failure?: undefined } | { failure: ActionResult };

async function createAuthUser(admin: AdminClient, email: string): Promise<AuthUserOutcome> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: DEFAULT_TEMP_PASSWORD,
    email_confirm: false,
  });

  if (error || !data.user) {
    return {
      failure: {
        success: false,
        message: error?.message || 'Failed to create authentication user.',
      },
    };
  }
  return { userId: data.user.id };
}

async function insertProfile(
  admin: AdminClient,
  userId: string,
  email: string,
  roleId: number,
  failureCleanup: 'none' | 'user',
): Promise<ActionResult | null> {
  const { error } = await admin.from('profiles').insert({
    id: userId,
    email,
    role_id: roleId,
    change_password: true,
  });

  if (!error) return null;
  if (failureCleanup === 'user') {
    await admin.auth.admin.deleteUser(userId);
  }
  return { success: false, message: error.message };
}

async function sendVerificationEmail(
  admin: AdminClient,
  email: string,
): Promise<ActionResult | null> {
  const { error } = await admin.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/${ROUTES.SIGN_IN}`,
    },
  });

  if (!error) return null;
  console.error('Verification email failed to send:', error.message);
  return {
    success: false,
    message: error.message || 'User created but failed to send verification email.',
  };
}

function revalidateAll(revalidatePaths: string | string[]): void {
  const paths = Array.isArray(revalidatePaths) ? revalidatePaths : [revalidatePaths];
  for (const path of paths) {
    revalidatePath(path);
  }
}

export async function registerUserWithRole({
  email,
  roleId,
  revalidatePath: revalidatePaths,
  failureCleanup = 'user',
}: RegisterUserConfig): Promise<ActionResult> {
  const supabaseAdmin = createAdminClient();

  try {
    const authOutcome = await createAuthUser(supabaseAdmin, email);
    if (authOutcome.failure) return authOutcome.failure;

    const profileFailure = await insertProfile(
      supabaseAdmin,
      authOutcome.userId,
      email,
      roleId,
      failureCleanup,
    );
    if (profileFailure) return profileFailure;

    const emailFailure = await sendVerificationEmail(supabaseAdmin, email);
    if (emailFailure) return emailFailure;

    if (revalidatePaths) revalidateAll(revalidatePaths);
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
