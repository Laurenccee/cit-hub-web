import { createClient } from '@/lib/supabase/server';
import { Designation, Personnel, Rank } from '../types';

export async function getRanks(): Promise<{ success: boolean; data: Rank[] }> {
    const supabase = await createClient();

    const { data, error } = await supabase.from('ranks').select('id, name').order('name', { ascending: true });

    if (error) {
        console.error('Error fetching ranks:', error.message);
        return { success: false, data: [] }; // Return fallback instead of throwing
    }

    return { success: true, data: (data ?? []) as Rank[] };
}

export async function getDesignations(): Promise<{ success: boolean; data: Designation[] }> {
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

export async function getPersonnel(): Promise<{ success: boolean; data: Personnel[] }> {
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
