import { createClient } from '@/lib/supabase/server';
import { NewsItem } from '@/types/types';

export async function getNewsDashboardData() {
  const supabase = await createClient();

  const [contentTypesRes, featuredRes, newsRes] = await Promise.all([
    supabase.from('content_types').select('id, label, slug').order('label'),
    supabase
      .from('news')
      .select('*, types:content_types(label)')
      .eq('is_archived', false)
      .eq('is_published', true)
      .order('is_featured', { ascending: false })
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('news')
      .select('*')
      .eq('is_archived', false)
      .eq('is_published', true)
      .order('date', { ascending: false }),
  ]);

  const error = contentTypesRes.error || featuredRes.error || newsRes.error;
  if (error) {
    console.error('Supabase Error:', error);
    throw new Error('Failed to load news dashboard');
  }

  const contentTypes = (contentTypesRes.data ?? []).map((ct) => ({
    id: ct.id,
    name: ct.label,
    slug: ct.slug,
  }));

  const mapToNewsItem = (row: any): NewsItem => ({
    id: row.id,
    title: row.title,
    description: row.description,
    content: row.content ?? undefined,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    date: row.date,
    slug: row.slug,
    typesId: row.types_id,
    isPublished: row.is_published,
    isFeatured: row.is_featured,
  });

  const featuredNews = featuredRes.data
    ? mapToNewsItem(featuredRes.data)
    : null;

  const news = (newsRes.data ?? [])
    .map(mapToNewsItem)
    .filter((item) => item.id !== featuredNews?.id)
    .slice(0, 3);

  return {
    contentTypes,
    featuredNews,
    news,
    heroTypeLabel: (featuredRes.data?.types as any)?.label ?? 'Announcement',
  };
}
