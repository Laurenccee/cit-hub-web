'use server';

import { createClient } from '@/lib/supabase/server';
import { signInSchema, type SignInFormData } from '../schema/auth';
import { redirect } from 'next/navigation';

export async function signInAction(values: SignInFormData) {
  const validatedFields = signInSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: 'Invalid form data.' };
  }

  const supabase = await createClient();

  const { data, error: authError } =
    await supabase.auth.signInWithPassword(values);

  if (authError) {
    return { success: false, message: authError.message };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role_id')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile || profile.role_id !== 0) {
    await supabase.auth.signOut();
    return {
      success: false,
      message: 'Access denied: You do not have admin privileges.',
    };
  }

  return { success: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}
