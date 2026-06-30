export interface ContentType {
    id: string;
    slug?: string;
    label: string;
}

export interface NewsItem {
    id: string;
    title: string;
    description?: string;
    content?: string;
    image_url: string;
    image_alt: string;
    slug: string;
    content_type_id?: string;
    is_published: boolean;
    is_featured: boolean;

    created_at: string;
    updated_at: string;

    content_type?: {
        label: string;
    } | null;
}
export interface NewsCardProps {
    news: NewsItem;
    variant?: 'featured' | 'grid' | 'list';
    priority?: boolean;
    contentTypes: ContentType[];
}
