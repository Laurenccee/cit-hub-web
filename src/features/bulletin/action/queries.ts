import { createClient } from '@/lib/supabase/server';
import { ContentType, NewsItem } from '../types';

export async function GetContentTypes(): Promise<{ success: boolean; data: ContentType[] }> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('content_types').select('*').order('label', { ascending: true });

    if (error) {
        console.error('Error fetching content types:', error.message);
        return { success: false, data: [] };
    }

    return { success: true, data: (data ?? []) as ContentType[] };
}

export async function GetFeaturedNews(): Promise<{ success: boolean; data: NewsItem[] }> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('news')
        .select('*, content_type:content_types(label)')
        .eq('is_archived', false)
        .eq('is_published', true)
        .order('is_featured', { ascending: false })
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Error fetching featured news:', error.message);
        return { success: false, data: [] };
    }

    const results = data ? [data] : [];
    return { success: true, data: results as NewsItem[] };
}

export async function GetNews(): Promise<{ success: boolean; data: NewsItem[] }> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('news')
        .select('*, content_type:content_types(label)')
        .eq('is_archived', false)
        .eq('is_published', true)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching news:', error.message);
        return { success: false, data: [] };
    }

    return { success: true, data: (data ?? []) as NewsItem[] };
}
