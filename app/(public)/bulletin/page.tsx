import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UPCOMING_EVENTS } from '@/data/events';
import AddNewsButton from '@/features/bulletin/components/AddNewsButton';
import BulletinSearchBar from '@/features/bulletin/components/BulletinSearchBar';
import NewsGrid from '@/features/bulletin/components/NewsGrid';
import UpcomingEventsCard from '@/features/home/components/UpcomingEventsCard';
import { Suspense } from 'react';
import { getNewsDashboardData } from '@/features/bulletin/services/newsService';
import { NewsHero } from '@/features/bulletin/components/NewsHero';
import NewsCardSkeleton from '@/features/bulletin/components/skeletons/NewsCardSkeleton';

export default async function NewsAndAnnouncementsPage() {
  const { contentTypes, featuredNews, news } = await getNewsDashboardData();
  return (
    <div className="flex flex-col gap-16">
      <section>
        {featuredNews ? (
          <NewsHero news={featuredNews} contentTypes={contentTypes} />
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
            <Suspense fallback={<NewsLoadingGrid />}>
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

function NewsLoadingGrid() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </section>
  );
}
