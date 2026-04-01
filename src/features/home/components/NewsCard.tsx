import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { NewsCardProps } from '../../../types/types';
import { formatDayDate } from '@/utils/formatters';

export default function LatestNewsCard({
  news,
  variant = 'grid',
  priority = false,
}: NewsCardProps) {
  const isFeatured = variant === 'featured';
  return (
    <Card className="pt-0 gap-8">
      <div className="aspect-video relative w-full overflow-hidden group">
        <div className="aspect-video relative overflow-hidden bg-muted rounded-t-xl">
          <Image
            src={news.imageUrl}
            alt={news.title}
            fill
            priority={priority || isFeatured}
            className="object-cover transition-all"
            placeholder="blur"
            blurDataURL="data:image/webp;..."
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="absolute inset-0 bg-black/30" />
        <div
          className="absolute inset-0 
            bg-linear-to-t from-primary/60 via-primary/20 to-transparent 
            backdrop-blur-md 
            mask-[linear-gradient(to_top,black_0%,transparent_50%)] 
            transition-opacity duration-300 "
        />
      </div>

      <CardHeader className="gap-2 flex-1">
        <div className="flex flex-col gap-2">
          <span
            className={
              isFeatured ? 'text-base' : 'text-xs line-clamp-1 text-primary'
            }
          >
            {formatDayDate(news.date)}
          </span>
          <CardTitle
            className={(isFeatured ? 'text-2xl' : 'text-lg') + ' leading-none'}
          >
            {news.title}
          </CardTitle>
          <CardDescription
            className={
              isFeatured
                ? 'line-clamp-3 text-base'
                : 'line-clamp-2 text-sm text-muted-foreground'
            }
          >
            {news.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardFooter className="flex self-end justify-end">
        <Button
          size="lg"
          variant="ghost"
          className="text-xs text-muted-foreground"
        >
          View Full Article
          <ArrowRight size={14} />
        </Button>
      </CardFooter>
    </Card>
  );
}
