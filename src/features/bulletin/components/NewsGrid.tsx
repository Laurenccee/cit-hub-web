import { createClient } from '@/lib/supabase/server';
import { LookupOption, NewsItem } from '@/types/types';
import NewsCard from '@/features/bulletin/components/NewsCard';

export default async function NewsGrid({
  contentTypes,
}: {
  contentTypes: LookupOption[];
}) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('news')
    .select('*')
    .eq('is_archived', false)
    .order('date', { ascending: false });

  const news: NewsItem[] = (data ?? []).map((row) => ({
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
  }));

  if (news.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <p>No news or announcements yet.</p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {news.map((item) => (
        <NewsCard key={item.id} news={item} contentTypes={contentTypes} />
      ))}
    </section>
  );
}
