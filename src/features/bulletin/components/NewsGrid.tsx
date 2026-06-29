import NewsCard from '@/features/bulletin/components/NewsCard';
import { ContentType, NewsItem } from '../types';

export default async function NewsGrid({ news, contentTypes }: { news: NewsItem[]; contentTypes: ContentType[] }) {
    if (news.length === 0) {
        return (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
                <p>No news or announcements yet.</p>
            </div>
        );
    }

    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {news.map((item) => (
                <NewsCard key={item.id} news={item} contentTypes={contentTypes} />
            ))}
        </section>
    );
}
