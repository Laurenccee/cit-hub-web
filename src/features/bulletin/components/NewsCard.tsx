'use client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { formatDayDate } from '@/utils/formatters';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import DeleteNewsButton from '@/features/bulletin/components/DeleteNewsButton';
import { NewsCardProps } from '../types';
import EditNewsButton from './EditNewsButton';

export default function NewsCard({ news, variant = 'grid', priority = false, contentTypes }: NewsCardProps) {
    const isFeatured = variant === 'featured';
    const { isAdmin, isFaculty } = useAuth();
    const canManage = isAdmin || isFaculty;
    return (
        <Card className="pt-0 gap-8">
            <div className="relative aspect-video overflow-hidden bg-muted">
                {news.image_url && (
                    <Image
                        src={news.image_url}
                        alt={news.image_alt ?? news.title}
                        fill
                        priority={priority || isFeatured}
                        className="object-cover transition-all"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                )}
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
                <p className={cn(isFeatured ? 'text-base' : 'text-xs line-clamp-1 text-primary')}>
                    {formatDayDate(news.created_at)}
                </p>
                <CardTitle className={cn(isFeatured ? 'text-lg' : 'text-base', 'leading-none')}>{news.title}</CardTitle>
                <CardDescription
                    className={isFeatured ? 'line-clamp-3 text-xs' : 'line-clamp-2 text-xs text-muted-foreground'}
                >
                    {news.description || news.content || 'No description available.'}
                </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between">
                {canManage && (
                    <div className="flex gap-2">
                        <DeleteNewsButton id={news.id} title={news.title} />
                        <EditNewsButton news={news} contentTypes={contentTypes} />
                    </div>
                )}
                <Link href={`/bulletin/${news.slug}`}>
                    <Button size="xl" variant="ghost" className="text-xs text-muted-foreground">
                        View Full Article
                        <ArrowRight size={14} />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
