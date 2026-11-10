import { ROLES } from "@/utils/constants/roles";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  resolveGuestRedirect,
  resolveUserRedirect,
  type AccessProfile,
} from "./access-rules";

const SETUP_TABLE_BY_ROLE: Record<number, "personnel" | "students"> = {
  [ROLES.FACULTY]: "personnel",
  [ROLES.STUDENT]: "students",
};

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
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

  const path = request.nextUrl.pathname;

  async function loadProfile(userId: string): Promise<AccessProfile> {
    const { data } = await supabase
      .from("profiles")
      .select("id, role_id, change_password")
      .eq("id", userId)
      .single();
    return data;
  }

  async function hasSetupProfile(userId: string, role: number) {
    const { data } = await supabase
      .from(SETUP_TABLE_BY_ROLE[role])
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    return !!data;
  }

  const redirectTo = user
    ? await resolveUserRedirect(path, await loadProfile(user.id), (role) =>
        hasSetupProfile(user.id, role),
      )
    : resolveGuestRedirect(path, !!request.nextUrl.searchParams.get("code"));

  if (redirectTo) {
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }
  return supabaseResponse;
}
