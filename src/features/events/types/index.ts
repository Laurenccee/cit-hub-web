export interface EventCategory {
    id: string;
    label: string;
    color?: string;
}

export interface EventItem {
    id: string;
    title: string;
    description?: string;
    content?: string;
    image_url?: string;
    image_alt?: string;
    slug: string;
    category_id?: string;
    is_published: boolean;
    is_featured: boolean;
    start_date: string;
    end_date?: string;
    location?: string;
    created_at: string;
    updated_at: string;
    category?: {
        label: string;
        color?: string;
    } | null;
    organizer?: string;
    host?: string;
    cover?: string;
    capacity_label?: string;
    capacity_filled?: number;
    capacity_total?: number;
    capacity_unit?: string;
    is_rsvp_confirmed?: boolean;
}

export interface EventCardProps {
    event: EventItem;
    variant?: 'featured' | 'grid' | 'list';
    priority?: boolean;
    categories: EventCategory[];
}