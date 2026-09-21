'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDayDate } from '@/utils/formatters';
import { NewsItem } from '../types';

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
                        <Badge className="bg-[#8B1A1A] text-white text-xs px-2 py-0.5">NEWS</Badge>
                        <Badge variant="outline" className="text-xs px-2 py-0.5">{(news as any).content_type?.label || 'Campus Advisory'}</Badge>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDayDate(news.created_at)}
                        </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        {news.title}
                    </h2>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {news.description || news.content || 'No description available.'}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-6 border-t">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium">CIT</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">CIT Health Response Team</span>
                            <span className="text-xs text-muted-foreground">3 min read • 1.4k views</span>
                        </div>
                    </div>

                    <Link href={`/bulletin/${news.slug}`}>
                        <Button variant="outline" size="lg" className="gap-2 text-[#8B1A1A] border-[#8B1A1A] rounded-full">
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
                <div className="absolute bottom-4 right-4">
                    <Badge className="bg-[#8B1A1A]/90 text-white text-xs px-2.5 py-0.5">Official Campus Incident Report</Badge>
                </div>
            </div>
        </div>
    );
}
