import { createClient } from '@/lib/supabase/server';
import type { QueryResult } from '@/types/action';
import { Designation, Personnel, Rank } from '../types';

async function getRanks(): Promise<QueryResult<Rank[]>> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('ranks').select('id, name').order('name', { ascending: true });

    if (error) {
        console.error('Error fetching ranks:', error.message);
        return { success: false, data: [] }; // Return fallback instead of throwing
    }

    return { success: true, data: (data ?? []) as Rank[] };
}

async function getDesignations(): Promise<QueryResult<Designation[]>> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('designations').select('id, name').order('name', { ascending: true });

    if (error) {
        console.error('Error fetching designations:', error.message);
        return { success: false, data: [] }; // Return fallback instead of throwing
    }

    return { success: true, data: (data ?? []) as Designation[] };
}

export async function getPersonnelPageData() {
    const [ranksResult, designationsResult] = await Promise.all([getRanks(), getDesignations()]);

    return {
        ranks: ranksResult.success ? ranksResult.data : [],
        designations: designationsResult.success ? designationsResult.data : [],
    };
}

export async function getCurrentUserPersonnel(): Promise<QueryResult<Personnel | null>> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, data: null };
    }

    const { data, error } = await supabase
        .from('personnel')
        .select(
            `
            *,
            ranks ( id, name ),
            designations ( id, name )
        `,
        )
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching current user personnel:', error.message);
        return { success: false, data: null };
    }

    return { success: true, data: data as Personnel | null };
}

export async function getPersonnel(): Promise<QueryResult<Personnel[]>> {
    const supabase = await createClient();

    // Fetches the personnel rows while joining the associated rank and designation records
    const { data, error } = await supabase
        .from('personnel')
        .select(
            `
            *,
            ranks ( id, name ),
            designations ( id, name )
        `,
        )
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching personnel:', error.message);
        return { success: false, data: [] }; // Return fallback instead of throwing
    }

    return { success: true, data: (data ?? []) as Personnel[] };
}

export async function getPersonnelById(id: string): Promise<QueryResult<Personnel | null>> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('personnel')
        .select(
            `
            *,
            ranks ( id, name ),
            designations ( id, name )
        `,
        )
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching personnel by id:', error.message);
        return { success: false, data: null };
    }

    return { success: true, data: data as Personnel | null };
}
