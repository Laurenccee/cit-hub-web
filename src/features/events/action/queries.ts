import { createClient } from '@/lib/supabase/server';
import { EventCategory, EventItem } from '../types';

function publishedEventsQuery(supabase: Awaited<ReturnType<typeof createClient>>) {
    return supabase
        .from('events')
        .select('*, category:event_categories(label, color)')
        .eq('is_archived', false)
        .eq('is_published', true)
        .gte('start_date', new Date().toISOString());
}

export async function GetEventCategories(): Promise<{ success: boolean; data: EventCategory[] }> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .order('label', { ascending: true });

    if (error) {
        console.error('Error fetching event categories:', error.message);
        return { success: false, data: [] };
    }

    return { success: true, data: (data ?? []) as EventCategory[] };
}

export async function GetFeaturedEvents(): Promise<{ success: boolean; data: EventItem[] }> {
    const supabase = await createClient();

    const { data, error } = await publishedEventsQuery(supabase)
        .order('is_featured', { ascending: false })
        .order('start_date', { ascending: true })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Error fetching featured events:', error.message);
        return { success: false, data: [] };
    }

    const results = data ? [data] : [];
    return { success: true, data: results as EventItem[] };
}

export async function GetEvents(): Promise<{ success: boolean; data: EventItem[] }> {
    const supabase = await createClient();

    const { data, error } = await publishedEventsQuery(supabase)
        .order('start_date', { ascending: true });

    if (error) {
        console.error('Error fetching events:', error.message);
        return { success: false, data: [] };
    }

    return { success: true, data: (data ?? []) as EventItem[] };
}

export async function getEventsPageData() {
    const [categoryResult, featuredEventsResult, eventsResult] = await Promise.all([
        GetEventCategories(),
        GetFeaturedEvents(),
        GetEvents(),
    ]);

    return {
        categories: categoryResult.success ? categoryResult.data : [],
        featuredEvents: featuredEventsResult.success ? featuredEventsResult.data : [],
        events: eventsResult.success ? eventsResult.data : [],
    };
}