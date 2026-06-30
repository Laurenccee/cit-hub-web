'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDayDate } from '@/utils/formatters';
import { ContentType, NewsItem } from '../types';

interface NewsHeroProps {
    news: NewsItem;
}

export function NewsHero({ news }: NewsHeroProps) {
    return (
        <Card className="flex flex-col lg:flex-row-reverse gap-0 border-none shadow-none  overflow-hidden p-0 lg:p-4">
            <CardHeader className="relative w-full lg:w-1/2 aspect-video lg:aspect-auto lg:min-h-96 p-0 overflow-hidden bg-muted shrink-0">
                {news.image_url && (
                    <Image
                        src={news.image_url}
                        alt={news.image_alt ?? news.title}
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                )}
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 bg-linear-to-t from-primary/40 via-transparent to-transparent" />
            </CardHeader>

            <CardContent className="flex flex-col justify-center gap-16 p-6 lg:p-12 flex-1">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-4">
                        <Badge size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            {(news as any).content_type?.label ?? 'Uncategorized'}
                        </Badge>
                        <span className="text-base font-medium text-primary">{formatDayDate(news.created_at)}</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h2 className="text-xl sm:text-3xl font-semibold text-primary tracking-tight leading-tight">
                            {news.title}
                        </h2>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-4">
                            {news.description}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end">
                    <Link href={`/bulletin/${news.slug}`}>
                        <Button variant="link" className=" text-primary">
                            Read Full Article
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
