'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import {
  PersonnelFormData,
  personnelSchema,
  UpdatePersonnelFormData,
  updatePersonnelSchema,
} from '../schema/personnel';
import { createClient } from '@/lib/supabase/server';
import { ROLES } from '@/lib/constants/roles';
import { revalidatePath } from 'next/cache';

async function getAuthorizedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role_id')
    .eq('id', user.id)
    .single();

  if (profile?.role_id !== ROLES.ADMIN && profile?.role_id !== ROLES.FACULTY) {
    return null;
  }
  return user;
}

export async function deleteProfilePictureAction(url: string) {
  const supabaseAdmin = createAdminClient();
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/');
    const bucketIndex = parts.indexOf('cit_hub');
    if (bucketIndex === -1) return;
    const path = parts.slice(bucketIndex + 1).join('/');
    await supabaseAdmin.storage.from('cit_hub').remove([path]);
  } catch {}
}

export async function uploadProfilePictureAction(formData: FormData) {
  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) {
    return { success: false as const, message: 'No file provided.' };
  }

  const supabaseAdmin = createAdminClient();
  const path = `profile-pictures/${Date.now()}.jpg`;

  const { data, error } = await supabaseAdmin.storage
    .from('cit_hub')
    .upload(path, file, { upsert: true, contentType: 'image/jpeg' });

  if (error || !data) {
    return {
      success: false as const,
      message: error?.message ?? 'Upload failed.',
    };
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from('cit_hub').getPublicUrl(data.path);

  return { success: true as const, url: publicUrl };
}

export async function addPersonnelAction(values: PersonnelFormData) {
  const user = await getAuthorizedUser();
  if (!user) return { success: false, message: 'Unauthorized.' };

  const validatedFields = personnelSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: 'Invalid form data.' };
  }

  const data = validatedFields.data;
  const supabaseAdmin = createAdminClient();

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: 'P@ssw0rd!',
    });

  if (authError) {
    return { success: false, message: authError.message };
  }

  const userId = authData.user.id;

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({ id: userId, email: data.email, role_id: 1 });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return { success: false, message: profileError.message };
  }

  const { error: personnelError } = await supabaseAdmin
    .from('personnel')
    .insert({
      id: userId,
      employee_id: data.employeeId,
      email: data.email,
      name: `${data.firstName} ${data.lastName}`,
      rank_id: data.rankId,
      designation_id: data.designationId ?? null,
      office: data.office,
      contact_number: data.contactNumber,
      social_media: data.socialMedia,
      education: data.education,
      profile_picture_url: data.profilePictureUrl,
      must_change_password: true,
    });

  if (personnelError) {
    await supabaseAdmin.from('profiles').delete().eq('id', userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return { success: false, message: personnelError.message };
  }

  revalidatePath('/personnel');
  return { success: true };
}

export async function updatePersonnelAction(values: UpdatePersonnelFormData) {
  const user = await getAuthorizedUser();
  if (!user) return { success: false, message: 'Unauthorized.' };

  const validatedFields = updatePersonnelSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: 'Invalid form data.' };
  }

  const data = validatedFields.data;
  const supabaseAdmin = createAdminClient();

  const { data: existing } = await supabaseAdmin
    .from('personnel')
    .select('profile_picture_url')
    .eq('id', data.id)
    .single();

  const { error } = await supabaseAdmin
    .from('personnel')
    .update({
      employee_id: data.employeeId,
      name: `${data.firstName} ${data.lastName}`,
      rank_id: data.rankId,
      designation_id: data.designationId ?? null,
      office: data.office,
      contact_number: data.contactNumber,
      social_media: data.socialMedia,
      education: data.education,
      profile_picture_url: data.profilePictureUrl ?? null,
    })
    .eq('id', data.id);

  if (error) return { success: false, message: error.message };

  if (
    existing?.profile_picture_url &&
    data.profilePictureUrl !== existing.profile_picture_url
  ) {
    await deleteProfilePictureAction(existing.profile_picture_url);
  }

  revalidatePath('/personnel');
  return { success: true };
}

export async function deletePersonnelAction(id: string) {
  const user = await getAuthorizedUser();
  if (!user) return { success: false, message: 'Unauthorized.' };

  const supabaseAdmin = createAdminClient();

  const { data: existing } = await supabaseAdmin
    .from('personnel')
    .select('profile_picture_url')
    .eq('id', id)
    .single();

  const { error: personnelError } = await supabaseAdmin
    .from('personnel')
    .delete()
    .eq('id', id);

  if (personnelError)
    return { success: false, message: personnelError.message };

  await supabaseAdmin.from('profiles').delete().eq('id', id);

  if (existing?.profile_picture_url) {
    await deleteProfilePictureAction(existing.profile_picture_url);
  }

  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (authError) return { success: false, message: authError.message };

  revalidatePath('/personnel');
  return { success: true };
}
