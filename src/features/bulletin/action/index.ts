'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ROLES } from '@/lib/constants/roles';
import { revalidatePath } from 'next/cache';
import {
  newsSchema,
  updateNewsSchema,
  NewsFormData,
  UpdateNewsFormData,
} from '../schema/news';

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
  return { user, roleId: profile.role_id as number };
}

export async function addNewsAction(values: NewsFormData) {
  const authorized = await getAuthorizedUser();
  if (!authorized) return { success: false as const, message: 'Unauthorized.' };

  const validated = newsSchema.safeParse(values);
  if (!validated.success) {
    return { success: false as const, message: 'Invalid form data.' };
  }

  const data = validated.data;
  const supabase = await createClient();

  const { error } = await supabase.from('news').insert({
    title: data.title,
    description: data.description,
    content: data.content ?? null,
    date: data.date,
    slug: data.slug,
    image_url: data.imageUrl ?? '',
    image_alt: data.imageAlt ?? '',
    types_id: data.typesId,
    is_published: data.isPublished,
    is_featured: data.isFeatured,
    author_id: authorized.user.id,
    posted_by: authorized.roleId,
  });

  if (error) {
    return { success: false as const, message: error.message };
  }

  revalidatePath('/bulletin');
  return { success: true as const };
}

export async function uploadNewsImageAction(formData: FormData) {
  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) {
    return { success: false as const, message: 'No file provided.' };
  }

  const supabaseAdmin = createAdminClient();
  const path = `news-images/${Date.now()}.jpg`;

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

export async function deleteNewsImageAction(url: string) {
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

export async function updateNewsAction(values: UpdateNewsFormData) {
  const authorized = await getAuthorizedUser();
  if (!authorized) return { success: false as const, message: 'Unauthorized.' };

  const validated = updateNewsSchema.safeParse(values);
  if (!validated.success) {
    return { success: false as const, message: 'Invalid form data.' };
  }

  const data = validated.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from('news')
    .update({
      title: data.title,
      description: data.description,
      content: data.content ?? null,
      date: data.date,
      slug: data.slug,
      image_url: data.imageUrl ?? '',
      image_alt: data.imageAlt ?? '',
      types_id: data.typesId,
      is_published: data.isPublished,
      is_featured: data.isFeatured,
    })
    .eq('id', data.id);

  if (error) {
    return { success: false as const, message: error.message };
  }

  revalidatePath('/bulletin');
  return { success: true as const };
}

export async function deleteNewsAction(id: string) {
  const authorized = await getAuthorizedUser();
  if (!authorized) return { success: false as const, message: 'Unauthorized.' };

  const supabase = await createClient();

  const { data: newsRow } = await supabase
    .from('news')
    .select('image_url')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('news').delete().eq('id', id);

  if (error) {
    return { success: false as const, message: error.message };
  }

  if (newsRow?.image_url) {
    await deleteNewsImageAction(newsRow.image_url);
  }

  revalidatePath('/bulletin');
  return { success: true as const };
}
