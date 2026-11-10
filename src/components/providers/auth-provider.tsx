'use client';

import { createContext, useEffect, useState, useRef, ReactNode } from 'react';
import type { createClient } from '@/lib/supabase/client';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

export type AuthContextType = {
  user: User | null;
  role: number | null;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

type AuthEventDeps = {
  supabase: ReturnType<typeof createClient>;
  currentUserId: string | undefined;
  ssrRoleConsumed: { current: boolean };
  setUser: (user: User | null) => void;
  setRole: (role: number | null) => void;
};

async function syncSignedInUser(session: Session, deps: AuthEventDeps) {
  const { supabase, currentUserId, ssrRoleConsumed, setUser, setRole } = deps;
  if (session.user.id !== currentUserId) {
    setUser(session.user);
    const { data } = await supabase
      .from('profiles')
      .select('role_id')
      .eq('id', session.user.id)
      .single();
    setRole(data?.role_id ?? null);
  } else if (!ssrRoleConsumed.current) {
    ssrRoleConsumed.current = true;
  }
}

async function handleAuthEvent(
  event: AuthChangeEvent,
  session: Session | null,
  deps: AuthEventDeps,
) {
  if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
    await syncSignedInUser(session, deps);
  } else if (event === 'SIGNED_OUT') {
    deps.setUser(null);
    deps.setRole(null);
  }
}

export function AuthProvider({
  children,
  initialUser,
  initialRole,
}: {
  children: ReactNode;
  initialUser: User | null;
  initialRole: number | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [role, setRole] = useState<number | null>(initialRole);
  const [isLoading, setIsLoading] = useState(!initialUser);

  const ssrRoleConsumed = useRef(false);

  // Sync state when the server re-renders the layout with a new session (e.g.
  // after sign-in). Adjusting state during render is the React-sanctioned
  // alternative to a layout effect and avoids a cascading render.
  const [prevInitial, setPrevInitial] = useState({ initialUser, initialRole });
  if (
    prevInitial.initialUser !== initialUser ||
    prevInitial.initialRole !== initialRole
  ) {
    setPrevInitial({ initialUser, initialRole });
    setUser(initialUser);
    setRole(initialRole);
    if (initialUser) setIsLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    // The Supabase browser client is ~55KB; load it after hydration, when the
    // browser is idle, instead of shipping it in every route's first-load JS.
    const subscribe = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      if (cancelled) return;
      const supabase = createClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          await handleAuthEvent(event, session, {
            supabase,
            currentUserId: user?.id,
            ssrRoleConsumed,
            setUser,
            setRole,
          });

          setIsLoading(false);
        },
      );
      unsubscribe = () => subscription.unsubscribe();
    };

    const schedule =
      typeof window.requestIdleCallback === 'function'
        ? (cb: () => void) => window.requestIdleCallback(cb, { timeout: 2000 })
        : (cb: () => void) => window.setTimeout(cb, 200);
    const handle = schedule(() => void subscribe());

    return () => {
      cancelled = true;
      unsubscribe?.();
      if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(handle);
      } else {
        window.clearTimeout(handle);
      }
    };
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ user, role, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
