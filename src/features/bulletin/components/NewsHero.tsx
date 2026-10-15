'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDayDate } from '@/utils/formatters';
import type { NewsItem } from '../types';

interface NewsHeroProps {
    news: NewsItem;
}

export function NewsHero({ news }: NewsHeroProps) {
    return (
        <div className="flex flex-col lg:flex-row">
            {/* Left Content */}
            <div className="flex flex-col gap-6 p-6 lg:p-8 flex-1">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5">NEWS</Badge>
                        <Badge variant="outline" className="text-xs px-2 py-0.5">{news.content_type?.label || 'Campus Advisory'}</Badge>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDayDate(news.created_at)}
                        </span>
                    </div>

                    <h2 className="text-title text-foreground">
                        {news.title}
                    </h2>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {news.description || news.content || 'No description available.'}
                    </p>
                </div>

                <div className="flex items-center justify-end mt-auto pt-6 border-t">
                    <Link href={`/bulletin/${news.slug}`}>
                        <Button variant="outline" size="lg" className="gap-2 text-primary border-primary rounded-full">
                            Read Full Article
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Right Image */}
            <div className="relative w-full lg:w-1/2 min-h-64 lg:min-h-96">
                {news.image_url ? (
                    <Image
                        src={news.image_url}
                        alt={news.image_alt ?? news.title}
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">No image</span>
                    </div>
                )}
            </div>
        </div>
    );
}
