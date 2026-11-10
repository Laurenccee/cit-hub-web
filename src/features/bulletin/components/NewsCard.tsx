'use client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ArrowRight, Calendar } from 'lucide-react';
import { formatDayDate } from '@/utils/formatters';
import Link from 'next/link';
import { NewsCardProps } from '../types';
import { getCategoryBadgeColor, getNewsCategoryLabel, getNewsExcerpt, getNewsHref } from '../utils';

export default function NewsCard({ news, priority = false }: NewsCardProps) {
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
                    <Badge className={`                    ${getCategoryBadgeColor(news)} text-primary-foreground text-xs px-2 py-0.5`}>
                                            {getNewsCategoryLabel(news)}
                    </Badge>
                </div>
            </div>

            <CardHeader className="gap-2 p-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDayDate(news.created_at)}</span>
                </div>
                <CardTitle className="text-subtitle leading-snug line-clamp-2">{news.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                    {getNewsExcerpt(news)}
                </CardDescription>
            </CardHeader>

            <CardFooter className="flex items-center justify-end px-4 pb-4 pt-0">
                <Link href={getNewsHref(news)}>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-primary text-sm">
                        View Full Article
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
