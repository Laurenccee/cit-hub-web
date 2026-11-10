import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import NewsCardSkeleton from '@/features/bulletin/components/skeletons/NewsCardSkeleton';
import { getNewsCategoryLabel, getNewsExcerpt, getNewsHref } from '@/features/bulletin/utils';
import type { NewsItem } from '@/features/bulletin/types';
import { formatDayDate } from '@/utils/formatters';

function FeaturedNewsCard({ news }: { news: NewsItem }) {
    return (
        <Suspense fallback={<NewsCardSkeleton />}>
            <Card className="overflow-hidden">
                <div className="relative aspect-video">
                    {news.image_url && (
                        <Image
                            src={news.image_url}
                            alt={news.image_alt ?? news.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 66vw"
                            className="object-cover"
                        />
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                        {news.content_type?.label && (
                            <Badge className="bg-primary text-primary-foreground">
                                {news.content_type.label}
                            </Badge>
                        )}
                    </div>
                </div>
                <CardContent className="p-6">
                    <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDayDate(news.created_at)}</span>
                    </div>
                    <h3 className="mb-3 text-section">{news.title}</h3>
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                        {getNewsExcerpt(news)}
                    </p>
                    <div className="flex items-center">
                        <Button asChild variant="ghost" className="gap-2 text-primary">
                            <Link href={getNewsHref(news)}>
                                View Full Article
                                <span>→</span>
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </Suspense>
    );
}

function CompactNewsCard({ news }: { news: NewsItem }) {
    return (
        <Suspense fallback={<NewsCardSkeleton />}>
            <Card className="overflow-hidden">
                <div className="relative aspect-video">
                    {news.image_url && (
                        <Image
                            src={news.image_url}
                            alt={news.image_alt ?? news.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 33vw"
                            className="object-cover"
                        />
                    )}
                    <div className="absolute top-4 left-4">
                        <Badge className="bg-primary text-primary-foreground">
                            {getNewsCategoryLabel(news)}
                        </Badge>
                    </div>
                </div>
                <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDayDate(news.created_at)}</span>
                    </div>
                    <h4 className="mb-2 text-subtitle line-clamp-2">{news.title}</h4>
                    <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                        {getNewsExcerpt(news)}
                    </p>
                    <Button asChild variant="ghost" size="sm" className="gap-2 p-0 text-primary">
                        <Link href={getNewsHref(news)}>
                            View Full Article
                            <span>→</span>
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </Suspense>
    );
}

interface HomeNewsSectionProps {
    featuredNews?: NewsItem[];
    news: NewsItem[];
}

export default function HomeNewsSection({ featuredNews, news }: HomeNewsSectionProps) {
    const featured = featuredNews?.[0];

    return (
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
                {featured && <FeaturedNewsCard news={featured} />}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {news.slice(0, 2).map((item) => (
                        <CompactNewsCard key={item.id} news={item} />
                    ))}
                </div>
            </div>
        </section>
    );
}
