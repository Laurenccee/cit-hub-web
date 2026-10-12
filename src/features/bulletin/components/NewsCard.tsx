'use client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { formatDayDate } from '@/utils/formatters';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { NewsCardProps } from '../types';

export default function NewsCard({ news, variant = 'grid', priority = false, contentTypes }: NewsCardProps) {
    const { isAdmin, isFaculty } = useAuth();

    const getCategoryBadgeColor = () => {
        const label = (news as any).content_type?.label?.toLowerCase() || '';
        if (label.includes('event')) return 'bg-primary';
        if (label.includes('advisory') || label.includes('campus')) return 'bg-orange-500';
        if (label.includes('guidance') || label.includes('health')) return 'bg-primary';
        return 'bg-primary';
    };

    return (
        <Card className="overflow-hidden flex flex-col h-full">
            <div className="relative aspect-video overflow-hidden bg-muted">
                {news.image_url && (
                    <Image
                        src={news.image_url}
                        alt={news.image_alt ?? news.title}
                        fill
                        priority={priority}
                        className="object-cover transition-all"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                )}
                <div className="absolute top-3 left-3 z-10">
                    <Badge className={`${getCategoryBadgeColor()} text-primary-foreground text-xs px-2 py-0.5`}>
                        {(news as any).content_type?.label || 'News'}
                    </Badge>
                </div>
            </div>

            <CardHeader className="gap-2 p-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDayDate(news.created_at)}</span>
                </div>
                <CardTitle className="text-base font-semibold leading-snug line-clamp-2">{news.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                    {news.description || news.content || 'No description available.'}
                </CardDescription>
            </CardHeader>

            <CardFooter className="flex items-center justify-between px-4 pb-4 pt-0">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    4 min read
                </span>
                <Link href={`/bulletin/${news.slug}`}>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-primary text-sm">
                        View Full Article
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
