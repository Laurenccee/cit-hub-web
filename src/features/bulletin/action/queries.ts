import { createClient } from '@/lib/supabase/server';
import type { QueryResult } from '@/types/action';
import { ContentType, NewsItem } from '../types';

function publishedNewsQuery(supabase: Awaited<ReturnType<typeof createClient>>) {
    return supabase
        .from('news')
        .select('*, content_type:content_types(label)')
        .eq('is_archived', false)
        .eq('is_published', true);
}

async function GetContentTypes(): Promise<QueryResult<ContentType[]>> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('content_types').select('*').order('label', { ascending: true });

    if (error) {
        console.error('Error fetching content types:', error.message);
        return { success: false, data: [] };
    }

    return { success: true, data: (data ?? []) as ContentType[] };
}

async function GetFeaturedNews(): Promise<QueryResult<NewsItem[]>> {
    const supabase = await createClient();

    const { data, error } = await publishedNewsQuery(supabase)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Error fetching featured news:', error.message);
        return { success: false, data: [] };
    }

    const results = data ? [data] : [];
    return { success: true, data: results as NewsItem[] };
}

async function GetNews(): Promise<QueryResult<NewsItem[]>> {
    const supabase = await createClient();

    const { data, error } = await publishedNewsQuery(supabase).order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching news:', error.message);
        return { success: false, data: [] };
    }

    return { success: true, data: (data ?? []) as NewsItem[] };
}

export async function getBulletinPageData() {
    const [contentTypeResult, featuredNewsResult, newsResult] = await Promise.all([
        GetContentTypes(),
        GetFeaturedNews(),
        GetNews(),
    ]);

    return {
        contentTypes: contentTypeResult.success ? contentTypeResult.data : [],
        featuredNews: featuredNewsResult.success ? featuredNewsResult.data : [],
        news: newsResult.success ? newsResult.data : [],
    };
}
