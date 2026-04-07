'use server';

import { createClient } from '@/lib/supabase/server';
import { signInSchema, type SignInFormData } from '../schema/auth';
import { revalidatePath } from 'next/cache';

export async function signInAction(values: SignInFormData) {
  const validatedFields = signInSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: 'Invalid form data.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword(
    validatedFields.data,
  );

  if (error) {
    return { success: false, message: 'Invalid email or password.' };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
