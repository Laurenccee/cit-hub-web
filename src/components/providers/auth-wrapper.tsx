import { getCurrentUserProfile } from '@/lib/supabase/current-user';
import { AuthProvider } from './auth-provider';

export async function AuthWrapper({ children }: { children: React.ReactNode }) {
    const current = await getCurrentUserProfile();

    return (
        <AuthProvider initialUser={current?.user ?? null} initialRole={current?.profile?.role_id ?? null}>
            {children}
        </AuthProvider>
    );
}
