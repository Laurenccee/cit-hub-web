import { createClient } from '@/lib/supabase/server';
import AuthProvider from '../provider/AuthProvider';

export default async function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // If Supabase is unreachable, gracefully render children as unauthenticated
  // rather than crashing the entire layout tree.
  if (authError) {
    return (
      <AuthProvider initialUser={null} initialRole={null}>
        {children}
      </AuthProvider>
    );
  }

  let role = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role_id')
      .eq('id', user.id)
      .single();
    role = profile?.role_id ?? null;
  }

  return (
    <AuthProvider initialUser={user} initialRole={role}>
      {children}
    </AuthProvider>
  );
}
