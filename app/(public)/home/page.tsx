import ClassScheduleCard from '@/features/bulletin/components/ClassScheduleCard';
import { formatDayDate } from '@/utils/formatters';
import Link from 'next/link';
import NewsCard from '@/features/bulletin/components/NewsCard';
import { LATEST_NEWS } from '@/data/news';
import { CLASS_SCHEDULES } from '@/data/schedule';
import { UPCOMING_EVENTS } from '@/data/events';
import UpcomingEventsCard from '@/features/home/components/UpcomingEventsCard';
import { Suspense } from 'react';
import NewsCardSkeleton from '@/features/bulletin/components/skeletons/NewsCardSkeleton';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { NewsItem } from '@/types/types';

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Correct destructuring: Promise.all returns an array of results
  const [contentTypesResponse, featuredNewsResponse, newsResponse] =
    await Promise.all([
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
        .order('date', { ascending: false }),
    ]);

  if (
    newsResponse.error ||
    contentTypesResponse.error ||
    featuredNewsResponse.error
  ) {
    console.error(
      'Supabase Error:',
      newsResponse.error ||
        contentTypesResponse.error ||
        featuredNewsResponse.error,
    );
    throw new Error('Failed to load news or content types');
  }

  const contentTypes = (contentTypesResponse.data ?? []).map((category) => ({
    id: category.id,
    name: category.label,
    slug: category.slug,
  }));

  const rawHero = featuredNewsResponse.data;
  const featuredNews: NewsItem | null = rawHero
    ? {
        id: rawHero.id,
        title: rawHero.title,
        description: rawHero.description,
        content: rawHero.content ?? undefined,
        imageUrl: rawHero.image_url,
        imageAlt: rawHero.image_alt,
        date: rawHero.date,
        slug: rawHero.slug,
        typesId: rawHero.types_id,
        isPublished: rawHero.is_published,
        isFeatured: rawHero.is_featured,
      }
    : null;

  const news: NewsItem[] = (newsResponse.data ?? [])
    .map((row) => ({
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
    }))
    .filter((item) => item.id !== featuredNews?.id)
    .slice(0, 3);
  console.log('news', news);

  const classesToday = CLASS_SCHEDULES.filter(
    (item) => item.dayOfWeek === (new Date().getDay() || 7),
  );
  const today = formatDayDate(new Date());
  return (
    <div className="flex flex-col gap-16">
      <section>
        <span className="text-primary/80">Academic overview</span>
        <div className="flex justify-between">
          <h1 className="text-7xl text-mauve-800 tracking-wide leading-tighter">
            Welcome CIT Students
          </h1>
        </div>
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <section className="col-span-2 flex flex-col gap-4">
          <div className=" flex items-end justify-between">
            <h1 className="text-3xl text-primary">News & Announcements</h1>
            <Link
              href="/news"
              className=" flex gap-2.5 text-muted-foreground items-center border-b-2 border-transparent hover:text-primary hover:border-primary transition-all duration-200 ease-in-out"
            >
              View all news
            </Link>
          </div>

          <div className="flex flex-col gap-16">
            {featuredNews && (
              <Suspense fallback={<NewsCardSkeleton />}>
                <NewsCard
                  news={featuredNews}
                  variant="featured"
                  contentTypes={contentTypes}
                />
              </Suspense>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Suspense fallback={<NewsCardSkeleton />}>
                {news.map((item) => (
                  <NewsCard
                    key={item.id}
                    news={item}
                    contentTypes={contentTypes}
                  />
                ))}
              </Suspense>
            </div>
          </div>
        </section>
        <section className="col-span-1 flex flex-col gap-8">
          <div className=" flex items-end justify-between">
            <h1 className="text-3xl text-primary">Student Dashboard</h1>
            <p className=" text-muted-foreground">{today}</p>
          </div>
          <div className=" flex flex-col gap-8">
            <ClassScheduleCard schedule={classesToday} />
            <UpcomingEventsCard events={UPCOMING_EVENTS} />
          </div>
        </section>
      </div>
    </div>
  );
}
