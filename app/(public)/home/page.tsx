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
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Calendar, BookOpen, CreditCard, Library } from 'lucide-react';

export default async function HomePage() {
    const { contentTypes, featuredNews, news } = await getBulletinPageData();

    const today = formatDayDate(new Date());

    return (
        <section className="flex flex-col py-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-wider">
                            Academic Overview
                        </Badge>
                        <span className="text-sm text-muted-foreground">CIT Pioneer Hub</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-serif text-foreground tracking-tight">
                        Welcome CIT Students
                    </h1>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - News & Announcements */}
                    <section className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-xl font-serif text-foreground">News & Announcements</h2>
                            <Link href="/bulletin">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    View all
                                    <span className="text-lg">→</span>
                                </Button>
                            </Link>
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
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <Badge className="bg-[#8B1A1A] text-white">OFFICIAL ADVISORY</Badge>
                                                <Badge variant="secondary">Medical & Wellness</Badge>
                                            </div>
                                        </div>
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDayDate(featuredNews[0].created_at)}</span>
                                                <span>•</span>
                                                <span>Internal Campus Report</span>
                                            </div>
                                            <h3 className="text-xl font-serif mb-3">{featuredNews[0].title}</h3>
                                            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                                {featuredNews[0].description || featuredNews[0].content || 'No description available.'}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <Link href={`/bulletin/${featuredNews[0].slug}`}>
                                                    <Button variant="ghost" className="gap-2 text-[#8B1A1A]">
                                                        View Full Article
                                                        <span>→</span>
                                                    </Button>
                                                </Link>
                                                <button className="text-sm text-muted-foreground hover:text-foreground">Share</button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Suspense>
                            )}

                            {/* Grid of Smaller Articles */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {news.slice(0, 2).map((item) => (
                                    <Suspense key={item.id} fallback={<NewsCardSkeleton />}>
                                        <Card className="overflow-hidden">
                                            <div className="relative aspect-video">
                                                {item.image_url && (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.image_alt ?? item.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                                <div className="absolute top-4 left-4">
                                                    <Badge className="bg-[#8B1A1A] text-white">
                                                        {item.content_type?.label || 'EVENT HIGHLIGHTS'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{formatDayDate(item.created_at)}</span>
                                                </div>
                                                <h4 className="font-serif mb-2 line-clamp-2">{item.title}</h4>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                    {item.description || item.content || 'No description available.'}
                                                </p>
                                                <Link href={`/bulletin/${item.slug}`}>
                                                    <Button variant="ghost" size="sm" className="gap-2 text-[#8B1A1A] p-0">
                                                        View Full Article
                                                        <span>→</span>
                                                    </Button>
                                                </Link>
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
                                <Link href="/grades" className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-5 h-5 text-[#8B1A1A]" />
                                        <span className="text-sm font-medium">Grades & Evaluation</span>
                                    </div>
                                    <span className="text-muted-foreground">›</span>
                                </Link>
                                <Link href="/tuition" className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-5 h-5 text-[#8B1A1A]" />
                                        <span className="text-sm font-medium">Tuition Balance & Cashier</span>
                                    </div>
                                    <span className="text-muted-foreground">›</span>
                                </Link>
                                <Link href="/library" className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Library className="w-5 h-5 text-[#8B1A1A]" />
                                        <span className="text-sm font-medium">Online University Library</span>
                                    </div>
                                    <span className="text-muted-foreground">›</span>
                                </Link>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </section>
    );
}
