import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UPCOMING_EVENTS } from '@/data/events';
import AddNewsButton from '@/features/bulletin/components/AddNewsButton';
import BulletinSearchBar from '@/features/bulletin/components/BulletinSearchBar';
import NewsGrid from '@/features/bulletin/components/NewsGrid';
import NewsCardSkeleton from '@/features/bulletin/components/skeletons/NewsCardSkeleton';
import UpcomingEventsCard from '@/features/home/components/UpcomingEventsCard';
import { formatDate } from '@/utils/formatters';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

export default async function NewsAndAnnouncementsPage() {
  const supabase = await createClient();

  const [contentTypesData, featuredNewsData] = await Promise.all([
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
  ]);

  if (contentTypesData.error || featuredNewsData.error) {
    throw new Error('Failed to load form options');
  }

  const contentTypes = (contentTypesData.data ?? []).map((ct) => ({
    id: ct.id,
    name: ct.label,
    slug: ct.slug,
  }));
  const featuredNews = featuredNewsData.data;

  const heroTypeLabel =
    (featuredNews?.types as { label?: string } | null)?.label ?? 'Announcement';

  return (
    <div className="flex flex-col gap-16">
      <section>
        {featuredNews ? (
          <Card className="flex-col lg:flex-row-reverse gap-0 lg:p-8 p-0">
            <CardHeader className="relative w-full lg:w-1/2 aspect-video lg:aspect-auto lg:min-h-80 overflow-hidden rounded-t-md lg:rounded-sm bg-muted shrink-0">
              <Image
                src={featuredNews.image_url || '/images/news1.jpg'}
                alt={featuredNews.image_alt || 'News hero image'}
                fill
                priority
                className="object-cover"
              />
            </CardHeader>
            <CardContent className="flex flex-col justify-between gap-6 lg:pl-0 p-6 lg:py-12 flex-1">
              <div className="flex items-center gap-2">
                <Badge size="lg">{heroTypeLabel}</Badge>
              </div>
              <div className="flex flex-col gap-4">
                <h1 className="text-2xl md:text-4xl lg:text-5xl text-primary tracking-wide">
                  {featuredNews.title}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {featuredNews.description}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatDate(featuredNews.date)}
                </span>
              </div>
              <div>
                <Link href={`/bulletin/${featuredNews.slug}`}>
                  <Button variant="link" size="link">
                    View Full Article
                    <ArrowRight />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex items-center justify-center min-h-64 bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center gap-3 text-center py-12">
              <p className="text-lg font-medium text-muted-foreground">
                No news published yet
              </p>
              <p className="text-sm text-muted-foreground">
                Published news will appear here as the featured article.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
      <Tabs defaultValue="news">
        <section className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex flex-col flex-1">
            <h1 className="text-5xl text-primary">School Bulletin</h1>
            <span className="text-sm text-muted-foreground">
              Stay updated with the latest news and events at CIT. Check out our
              school bulletin for important announcements, upcoming events, and
              student achievements.
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <AddNewsButton contentTypes={contentTypes} />
            <BulletinSearchBar />
          </div>
        </section>

        <TabsList className="mt-6">
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="news">
          <div className="mt-6">
            <Suspense
              fallback={
                <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <NewsCardSkeleton key={i} />
                  ))}
                </section>
              }
            >
              <NewsGrid contentTypes={contentTypes} />
            </Suspense>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <section className="mt-6">
            <UpcomingEventsCard events={UPCOMING_EVENTS} />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
