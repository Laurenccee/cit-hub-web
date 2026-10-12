import ClassScheduleCard from '@/features/home/components/ClassScheduleCard';
import { formatDayDate } from '@/utils/formatters';
import Link from 'next/link';
import NewsCard from '@/features/bulletin/components/NewsCard';
import UpcomingEventsCard from '@/features/home/components/UpcomingEventsCard';
import { Suspense } from 'react';
import NewsCardSkeleton from '@/features/bulletin/components/skeletons/NewsCardSkeleton';
import { Button } from '@/components/ui/button';
import { getBulletinPageData } from '@/features/bulletin/action/queries';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, BookOpen, CreditCard, Library } from 'lucide-react';
import { PageContainer, PageHeader, PageSection } from '@/components/layouts/PageLayout';

const QUICK_TOOLS = [
    { href: '/grades', icon: BookOpen, label: 'Grades & Evaluation' },
    { href: '/tuition', icon: CreditCard, label: 'Tuition Balance & Cashier' },
    { href: '/library', icon: Library, label: 'Online University Library' },
] as const;

export default async function HomePage() {
    const { featuredNews, news } = await getBulletinPageData();

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
                            <h2 className="text-xl font-serif text-foreground">News &amp; Announcements</h2>
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
                                                <img
                                                    src={featuredNews[0].image_url}
                                                    alt={featuredNews[0].image_alt ?? featuredNews[0].title}
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <Badge className="bg-primary text-primary-foreground">
                                                    OFFICIAL ADVISORY
                                                </Badge>
                                                <Badge variant="secondary">Medical &amp; Wellness</Badge>
                                            </div>
                                        </div>
                                        <CardContent className="p-6">
                                            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>{formatDayDate(featuredNews[0].created_at)}</span>
                                                <span>•</span>
                                                <span>Internal Campus Report</span>
                                            </div>
                                            <h3 className="mb-3 text-xl font-serif">{featuredNews[0].title}</h3>
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
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.image_alt ?? item.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                )}
                                                <div className="absolute top-4 left-4">
                                                    <Badge className="bg-primary text-primary-foreground">
                                                        {item.content_type?.label || 'EVENT HIGHLIGHTS'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <CardContent className="p-4">
                                                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatDayDate(item.created_at)}</span>
                                                </div>
                                                <h4 className="mb-2 font-serif line-clamp-2">{item.title}</h4>
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
                            <h2 className="text-xl font-serif text-foreground">Dashboard</h2>
                            <span className="text-sm text-muted-foreground">{today}</span>
                        </div>

                        <ClassScheduleCard schedule={[]} />
                        <UpcomingEventsCard events={[]} />

                        {/* Quick Pioneer Tools */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                    Quick Pioneer Tools
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                {QUICK_TOOLS.map(({ href, icon: Icon, label }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-5 w-5 text-primary" />
                                            <span className="text-sm font-medium">{label}</span>
                                        </div>
                                        <span className="text-muted-foreground">›</span>
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </PageContainer>
        </PageSection>
    );
}
