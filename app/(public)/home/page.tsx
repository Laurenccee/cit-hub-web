import ClassScheduleCard from '@/features/home/components/ClassScheduleCard';
import { formatDayDate, formatRange } from '@/utils/formatters';
import Link from 'next/link';
import Image from 'next/image';
import UpcomingEventsCard from '@/features/home/components/UpcomingEventsCard';
import { Suspense } from 'react';
import NewsCardSkeleton from '@/features/bulletin/components/skeletons/NewsCardSkeleton';
import { Button } from '@/components/ui/button';
import { getBulletinPageData } from '@/features/bulletin/action/queries';
import { GetEvents } from '@/features/events/action/queries';
import type { EventItemProps } from '@/features/home/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { PageContainer, PageHeader, PageSection } from '@/components/layouts/PageLayout';

export default async function HomePage() {
    const [{ featuredNews, news }, eventsResult] = await Promise.all([
        getBulletinPageData(),
        GetEvents(),
    ]);
    const events = eventsResult.success ? eventsResult.data : [];

    const now = new Date();
    const upcomingEvents: EventItemProps[] = events
        .filter((event) => new Date(event.start_date) >= now)
        .slice(0, 5)
        .map((event) => ({
            id: event.id,
            title: event.title,
            description: event.description ?? event.content ?? '',
            imageUrl: event.image_url ?? '',
            imageAlt: event.image_alt ?? event.title,
            date: event.start_date,
            startTime: formatRange(event.start_date, event.end_date),
            endTime: '',
            slug: event.slug,
        }));

    const today = formatDayDate(new Date());

    return (
        <PageSection>
            <PageContainer className="gap-8">
                <PageHeader
                    eyebrow={
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-wider">
                                Academic Overview
                            </Badge>
                            <span className="text-sm text-muted-foreground">CIT Pioneer Hub</span>
                        </div>
                    }
                    title="Welcome CIT Students"
                />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - News & Announcements */}
                    <section className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-section text-foreground">News &amp; Announcements</h2>
                            <Button asChild variant="ghost" size="sm" className="gap-2">
                                <Link href="/bulletin">
                                    View all
                                    <span className="text-lg">→</span>
                                </Link>
                            </Button>
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Featured Article */}
                            {featuredNews && featuredNews[0] && (
                                <Suspense fallback={<NewsCardSkeleton />}>
                                    <Card className="overflow-hidden">
                                        <div className="relative aspect-video">
                                            {featuredNews[0].image_url && (
                                                <Image
                                                    src={featuredNews[0].image_url}
                                                    alt={featuredNews[0].image_alt ?? featuredNews[0].title}
                                                    fill
                                                    sizes="(max-width: 1024px) 100vw, 66vw"
                                                    className="object-cover"
                                                />
                                            )}
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                {featuredNews[0].content_type?.label && (
                                                    <Badge className="bg-primary text-primary-foreground">
                                                        {featuredNews[0].content_type.label}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <CardContent className="p-6">
                                            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>{formatDayDate(featuredNews[0].created_at)}</span>
                                            </div>
                                            <h3 className="mb-3 text-section">{featuredNews[0].title}</h3>
                                            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                                                {featuredNews[0].description ||
                                                    featuredNews[0].content ||
                                                    'No description available.'}
                                            </p>
                                            <div className="flex items-center">
                                                <Button asChild variant="ghost" className="gap-2 text-primary">
                                                    <Link href={`/bulletin/${featuredNews[0].slug}`}>
                                                        View Full Article
                                                        <span>→</span>
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Suspense>
                            )}

                            {/* Grid of Smaller Articles */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {news.slice(0, 2).map((item) => (
                                    <Suspense key={item.id} fallback={<NewsCardSkeleton />}>
                                        <Card className="overflow-hidden">
                                            <div className="relative aspect-video">
                                                {item.image_url && (
                                                    <Image
                                                        src={item.image_url}
                                                        alt={item.image_alt ?? item.title}
                                                        fill
                                                        sizes="(max-width: 640px) 100vw, 33vw"
                                                        className="object-cover"
                                                    />
                                                )}
                                                <div className="absolute top-4 left-4">
                                                    <Badge className="bg-primary text-primary-foreground">
                                                        {item.content_type?.label || 'News'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <CardContent className="p-4">
                                                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatDayDate(item.created_at)}</span>
                                                </div>
                                                <h4 className="mb-2 text-subtitle line-clamp-2">{item.title}</h4>
                                                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                                                    {item.description ||
                                                        item.content ||
                                                        'No description available.'}
                                                </p>
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-2 p-0 text-primary"
                                                >
                                                    <Link href={`/bulletin/${item.slug}`}>
                                                        View Full Article
                                                        <span>→</span>
                                                    </Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Suspense>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Right Column - Dashboard */}
                    <section className="flex flex-col gap-6">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-section text-foreground">Dashboard</h2>
                            <span className="text-sm text-muted-foreground">{today}</span>
                        </div>

                        <ClassScheduleCard schedule={[]} />
                        <UpcomingEventsCard events={upcomingEvents} />
                    </section>
                </div>
            </PageContainer>
        </PageSection>
    );
}
