import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role_id')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role_id !== 0) {
    return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('event_categories')
    .select('*')
    .order('label', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error.message);
    return NextResponse.json({ categories: [] });
  }

  return NextResponse.json({ categories: data ?? [] });
}