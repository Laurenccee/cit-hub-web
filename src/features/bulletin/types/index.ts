export interface ContentType {
    id: string;
    name: string;
    slug?: string;
    description?: string;
}

export interface NewsItem {
    id: string;
    title: string;
    description?: string;
    content?: string;
    imageUrl: string;
    imageAlt: string;
    date: string;
    slug: string;
    typesId: number;
    isPublished: boolean;
    isFeatured: boolean;
}
export interface NewsCardProps {
    news: NewsItem;
    contentTypes?: ContentType;
    variant?: 'featured' | 'grid' | 'list';
    priority?: boolean;
}
