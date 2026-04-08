import ClassScheduleCard from '@/features/home/components/ClassScheduleCard';
import { formatDayDate } from '@/utils/formatters';
import Link from 'next/link';
import NewsCard from '@/features/bulletin/components/NewsCard';
import UpcomingEventsCard from '@/features/home/components/UpcomingEventsCard';
import { Suspense } from 'react';
import NewsCardSkeleton from '@/features/bulletin/components/skeletons/NewsCardSkeleton';
import { getNewsDashboardData } from '@/features/bulletin/services/newsService';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const { contentTypes, featuredNews, news } = await getNewsDashboardData();
  const today = formatDayDate(new Date());

  return (
    <div className="flex flex-col gap-10 lg:gap-16">
      <section className="space-y-1">
        <span className="text-sm lg:text-base text-primary/80 font-medium">
          Academic overview
        </span>
        <div className="flex justify-between">
          <h1 className="text-4xl md:text-6xl lg:text-7xl text-mauve-800 tracking-tight lg:tracking-wide leading-tight lg:leading-tighter">
            Welcome CIT Students
          </h1>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        <section className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
          <div className="flex items-end justify-between border-b pb-2">
            <h1 className="text-2xl lg:text-3xl text-primary">
              News & Announcements
            </h1>
            <Link href="/bulletin">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>

          <div className="flex flex-col gap-8 lg:gap-12">
            {featuredNews && (
              <Suspense fallback={<NewsCardSkeleton />}>
                <NewsCard
                  news={featuredNews}
                  variant="featured"
                  contentTypes={contentTypes}
                  priority
                />
              </Suspense>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <Suspense
                fallback={
                  <>
                    {[...Array(3)].map((_, i) => (
                      <NewsCardSkeleton key={i} />
                    ))}
                  </>
                }
              >
                {news.slice(0, 6).map((item) => (
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

        <section className="flex flex-col gap-6 lg:gap-8">
          <div className="flex items-end justify-between border-b pb-2">
            <h1 className="text-2xl lg:text-3xl text-primary">Dashboard</h1>
            <h1 className="text-sm lg:text-base text-muted-foreground">
              {today}
            </h1>
          </div>

          <div className="flex flex-col gap-6 lg:gap-8">
            <ClassScheduleCard schedule={[]} />
            <UpcomingEventsCard events={[]} />
          </div>
        </section>
      </div>
    </div>
  );
}
