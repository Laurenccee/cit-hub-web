'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDayDate } from '@/utils/formatters';
import { NewsItem } from '@/types/types';

interface NewsHeroProps {
  news: NewsItem;
  contentTypes: any[];
}

export function NewsHero({ news, contentTypes }: NewsHeroProps) {
  const typeLabel =
    contentTypes.find((t) => t.id === news.typesId)?.name || 'Latest News';

  return (
    <Card className="flex flex-col lg:flex-row-reverse gap-0 border-none shadow-none  overflow-hidden p-0 lg:p-4">
      <CardHeader className="relative w-full lg:w-1/2 aspect-video lg:aspect-auto lg:min-h-96 p-0 overflow-hidden bg-muted shrink-0">
        {news.imageUrl && (
          <Image
            src={news.imageUrl}
            alt={news.imageAlt ?? news.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        )}
        {/* Same Overlays from your NewsCard */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-linear-to-t from-primary/40 via-transparent to-transparent" />
      </CardHeader>

      {/* Content Section */}
      <CardContent className="flex flex-col justify-center gap-6 p-6 lg:p-12 flex-1">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {typeLabel}
            </Badge>
            <span className="text-sm font-medium text-primary">
              {formatDayDate(news.date)}
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-primary tracking-tight leading-tight">
              {news.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed line-clamp-4">
              {news.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end mt-4">
          <Link href={`/bulletin/${news.slug}`}>
            <Button
              variant="link"
              className="group p-0 h-auto text-primary font-semibold text-base hover:no-underline"
            >
              Read Full Article
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
