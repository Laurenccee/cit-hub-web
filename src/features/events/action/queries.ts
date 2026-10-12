import { createClient } from '@/lib/supabase/server';
import type { QueryResult } from '@/types/action';
import { DeskCheckin, EventAttendance, EventAttendanceRecord, EventCategory, EventItem } from '../types';


const RECENT_CHECKIN_LIMIT = 5;

function publishedEventsQuery(supabase: Awaited<ReturnType<typeof createClient>>) {
    return supabase
        .from('events')
        .select('*, category:event_categories(label, color)')
        .eq('is_archived', false)
        .eq('is_published', true);
}

/**
 * Fetches published events as two buckets — upcoming (soonest first) and
 * past (most recent first) — so past events stay visible in listings
 * instead of being dropped by a start-date cutoff.
 */
async function fetchPublishedEvents(
    supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<QueryResult<EventItem[]>> {
    const now = new Date().toISOString();

    const [upcomingRes, pastRes] = await Promise.all([
        publishedEventsQuery(supabase).gte('start_date', now).order('start_date', { ascending: true }),
        publishedEventsQuery(supabase).lt('start_date', now).order('start_date', { ascending: false }),
    ]);

    if (upcomingRes.error) {
        console.error('Error fetching upcoming events:', upcomingRes.error.message);
    }
    if (pastRes.error) {
        console.error('Error fetching past events:', pastRes.error.message);
    }

    const upcoming = (upcomingRes.data ?? []) as EventItem[];
    const past = (pastRes.data ?? []) as EventItem[];

    return { success: !upcomingRes.error || !pastRes.error, data: [...upcoming, ...past] };
}

export async function GetEventCategories(): Promise<QueryResult<EventCategory[]>> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('event_categories').select('*').order('label', { ascending: true });

    if (error) {
        console.error('Error fetching event categories:', error.message);
        return { success: false, data: [] }; // Return fallback instead of throwing
    }

    return { success: true, data: (data ?? []) as EventCategory[] };
}

export async function GetEvents(): Promise<QueryResult<EventItem[]>> {
    const supabase = await createClient();

    return fetchPublishedEvents(supabase);
}

/**
 * The hero spotlight: the currently-live event when one is running
 * (started, not yet ended), otherwise the next upcoming featured event,
 * otherwise the next upcoming event.
 */
async function GetFeaturedEvent(): Promise<QueryResult<EventItem | null>> {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data, error } = await publishedEventsQuery(supabase)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('is_featured', { ascending: false })
        .order('start_date', { ascending: true })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Error fetching featured event:', error.message);
        return { success: false, data: null };
    }

    return { success: true, data: (data ?? null) as EventItem | null };
}

export async function GetEventBySlug(slug: string): Promise<QueryResult<EventItem | null>> {
    const supabase = await createClient();

    const { data, error } = await publishedEventsQuery(supabase).eq('slug', slug).maybeSingle();

    if (error) {
        console.error('Error fetching event by slug:', error.message);
        return { success: false, data: null };
    }

    return { success: true, data: (data ?? null) as EventItem | null };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GetEventByIdOrSlug(value: string): Promise<QueryResult<EventItem | null>> {
    const supabase = await createClient();

    if (UUID_RE.test(value)) {
        const { data, error } = await publishedEventsQuery(supabase).eq('id', value).maybeSingle();

        if (error) {
            console.error('Error fetching event by id:', error.message);
            return { success: false, data: null };
        }
        if (data) {
            return { success: true, data: data as EventItem };
        }
    }

    return GetEventBySlug(value);
}

export async function GetEventAttendance(eventId: string): Promise<EventAttendance> {
    const fallback: EventAttendance = {
        present: 0,
        departed: 0,
        total: 0,
        recent: [],
    };
    const supabase = await createClient();

    const [presentRes, departedRes, totalRes, recentRes] = await Promise.all([
        supabase
            .from('event_attendance')
            .select('id', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .not('check_in', 'is', null)
            .is('check_out', null),
        supabase
            .from('event_attendance')
            .select('id', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .not('check_out', 'is', null),
        supabase
            .from('event_attendance')
            .select('id', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .not('check_in', 'is', null),
        supabase
            .from('event_attendance')
            .select('id, event_id, check_in, check_out, created_at')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false })
            .limit(RECENT_CHECKIN_LIMIT),
    ]);

    if (recentRes.error) {
        console.error('Error fetching event attendance:', recentRes.error.message);
        return fallback;
    }

    const recent = (recentRes.data ?? []) as EventAttendanceRecord[];

    return {
        present: presentRes.count ?? recent.filter((row) => row.check_in && !row.check_out).length,
        departed: departedRes.count ?? recent.filter((row) => row.check_out).length,
        total: totalRes.count ?? recent.length,
        recent,
    };
}

export async function GetDeskCheckins(eventId: string, limit = 50): Promise<QueryResult<DeskCheckin[]>> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('event_attendance')
        .select('id, event_id, check_in, check_out, student_id, created_at')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching desk check-ins:', error.message);
        return { success: false, data: [] };
    }

    const rows = (data ?? []) as DeskCheckin[];
    const studentIds = Array.from(new Set(rows.map((row) => row.student_id).filter((id): id is string => Boolean(id))));

    let studentsById = new Map<string, NonNullable<DeskCheckin['student']>>();
    if (studentIds.length > 0) {
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const admin = createAdminClient();
        const { data: students, error: studentsError } = await admin
            .from('students')
            .select('id, first_name, last_name, student_id, profile_picture_url, year_level, courses ( code, name ), majors ( code, name )')
            .in('id', studentIds);

        if (studentsError) {
            console.error('Error fetching check-in students:', studentsError.message);
        } else {
            studentsById = new Map(
                (students ?? []).map((s: any) => [
                    s.id as string,
                    {
                        first_name: s.first_name as string,
                        last_name: s.last_name as string,
                        student_id: (s.student_id ?? null) as string | null,
                        profile_picture_url: (s.profile_picture_url ?? null) as string | null,
                        year_level: (s.year_level ?? null) as string | null,
                        course_code: (s.courses?.code ?? null) as string | null,
                        course_name: (s.courses?.name ?? null) as string | null,
                        major_code: (s.majors?.code ?? null) as string | null,
                        major_name: (s.majors?.name ?? null) as string | null,
                    },
                ]),
            );
        }
    }

    return {
        success: true,
        data: rows.map((row) => ({
            ...row,
            student: row.student_id ? (studentsById.get(row.student_id) ?? null) : null,
        })),
    };
}

export async function getEventsPageData() {
    const [categoryResult, featuredResult, eventsResult] = await Promise.all([GetEventCategories(), GetFeaturedEvent(), GetEvents()]);

    return {
        categories: categoryResult.success ? categoryResult.data : [],
        featuredEvent: featuredResult.success ? featuredResult.data : null,
        events: eventsResult.success ? eventsResult.data : [],
    };
}

