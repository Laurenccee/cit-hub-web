import { ROUTES } from '@/utils/constants/routes';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    const path = request.nextUrl.pathname;

    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const AUTH_ROUTES = [
        ROUTES.ROOT,
        ROUTES.SIGN_IN,
        ROUTES.FORGET_PASSWORD,
        ROUTES.EMAIL_VERIFICATION,
        ROUTES.RESET_PASSWORD,
    ];
    const PUBLIC_ROUTES = [
        ROUTES.HOME,
        ROUTES.FEED,
        ROUTES.BULLETIN,
        ROUTES.SCHEDULE,
        ROUTES.PERSONNEL,
        ROUTES.PIONEERS,
    ];

    if (!user) {
        if (path === ROUTES.RESET_PASSWORD) {
            const token = request.nextUrl.searchParams.get('code');
            if (!token) {
                return NextResponse.redirect(new URL(ROUTES.SIGN_IN, request.url));
            }
            return supabaseResponse;
        }

        if (!AUTH_ROUTES.includes(path) && !PUBLIC_ROUTES.includes(path)) {
            return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
        }
        return supabaseResponse;
    }

    if (user) {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, role_id, change_password')
            .eq('id', user.id)
            .single();

        if (profile?.change_password === true) {
            if (path !== ROUTES.RESET_PASSWORD) {
                return NextResponse.redirect(new URL(ROUTES.RESET_PASSWORD, request.url));
            }
            return supabaseResponse; // Allow them to stay on the reset page
        }

        if (AUTH_ROUTES.includes(path)) {
            return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
        }

        const role = profile?.role_id;

        if (role === 1) {
            const { data: personnel, error } = await supabase
                .from('personnel')
                .select('id')
                .eq('id', user.id)
                .maybeSingle();

            const hasPersonnelData = !!personnel;

            if (!hasPersonnelData) {
                if (path !== ROUTES.PERSONNEL_SETUP) {
                    return NextResponse.redirect(new URL(ROUTES.PERSONNEL_SETUP, request.url));
                }
            } else {
                if (path === ROUTES.PERSONNEL_SETUP) {
                    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
                }
            }
        } else if (role === 2) {
            if (path !== ROUTES.STUDENT_SETUP) {
                return NextResponse.redirect(new URL(ROUTES.STUDENT_SETUP, request.url));
            }
        } else if (role === 0) {
            if (path === ROUTES.PERSONNEL_SETUP || path === ROUTES.STUDENT_SETUP) {
                return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
            }
        }
    }

    return supabaseResponse;
}
