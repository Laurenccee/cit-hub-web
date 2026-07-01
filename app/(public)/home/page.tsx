import ClassScheduleCard from '@/features/home/components/ClassScheduleCard';
import { formatDayDate } from '@/utils/formatters';
import Link from 'next/link';
import NewsCard from '@/features/bulletin/components/NewsCard';
import UpcomingEventsCard from '@/features/home/components/UpcomingEventsCard';
import { Suspense } from 'react';
import NewsCardSkeleton from '@/features/bulletin/components/skeletons/NewsCardSkeleton';
import { Button } from '@/components/ui/button';
import { GetContentTypes, GetFeaturedNews, GetNews } from '@/features/bulletin/action/queries';

export default async function HomePage() {
    const [contentTypeResult, featuredNewsResult, newsResult] = await Promise.all([
        GetContentTypes(),
        GetFeaturedNews(),
        GetNews(),
    ]);

    const contentTypes = contentTypeResult.success ? contentTypeResult.data : [];
    const featuredNews = featuredNewsResult.success ? featuredNewsResult.data : [];
    const news = newsResult.success ? newsResult.data : [];

    const today = formatDayDate(new Date());

    return (
        <section className="flex flex-col sm:py-16">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 sm:gap-16">
                <div className="flex flex-col gap-8 sm:gap-8">
                    <div className="space-y-1">
                        <span className="text-xs lg:text-sm text-primary/80 font-medium">Academic overview</span>
                        <h1 className="text-4xl sm:text-5xl text-mauve-800 tracking-tight lg:tracking-wide leading-tight lg:leading-tighter">
                            Welcome CIT Students
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-16">
                        <section className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
                            <div className="flex items-end justify-between border-b pb-2">
                                <h1 className="text-xl sm:text-2xl text-primary">News & Announcements</h1>
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
                                            news={featuredNews[0]}
                                            variant="featured"
                                            priority
                                            contentTypes={contentTypes}
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
                                            <NewsCard key={item.id} news={item} contentTypes={contentTypes} />
                                        ))}
                                    </Suspense>
                                </div>
                            </div>
                        </section>

                        <section className="flex flex-col gap-6 lg:gap-8">
                            <div className="flex items-end justify-between border-b pb-2">
                                <h1 className="text-xl sm:text-2xl text-primary">Dashboard</h1>
                                <h1 className="text-xs lg:text-sm text-muted-foreground">{today}</h1>
                            </div>

                            <div className="flex flex-col gap-6 lg:gap-8">
                                <ClassScheduleCard schedule={[]} />
                                <UpcomingEventsCard events={[]} />
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </section>
    );
}
