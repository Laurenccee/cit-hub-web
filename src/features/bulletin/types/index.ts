import type { ActionResult } from '@/types/action';
import type { NewsFormData } from '../schema/news';

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
    priority?: boolean;
}

export interface UseNewsFormProps {
    mode?: 'create' | 'update';
    news?: NewsItem;
    initialValues: NewsFormData;
    contentTypes: ContentType[];
    onSuccess?: () => void;
    submitAction: (data: NewsFormData & { imageUrl?: string }, targetId: string) => Promise<ActionResult>;
}
