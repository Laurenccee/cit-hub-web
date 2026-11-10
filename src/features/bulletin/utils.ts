import type { NewsItem } from './types';

export function getNewsExcerpt(news: NewsItem): string {
    return news.description || news.content || 'No description available.';
}

export function getNewsCategoryLabel(news: NewsItem): string {
    return news.content_type?.label || 'News';
}

export function getNewsHref(news: NewsItem): string {
    return `/bulletin/${news.slug}`;
}

export function getCategoryBadgeColor(news: NewsItem): string {
    const label = news.content_type?.label?.toLowerCase() ?? '';
    const isAdvisory = label.includes('advisory') || label.includes('campus');
    return isAdvisory ? 'bg-orange-500' : 'bg-primary';
}
