# TODO — CIT Hub Web

> Findings from codebase review. Ordered by severity.

---

## 🔴 Critical Bugs

- [x] **Rename `proxy.ts` → `middleware.ts`** at project root and rename the exported function from `proxy` to `middleware`. Next.js only recognises `middleware.ts`/`middleware.js` — the current file is never run, meaning session refresh is broken, no route protection is applied, and the root `/` redirect to `/home` never fires.
- [x] **`proxy.ts` function name and import path were still broken** — the file was renamed in intent but the function remained `proxy` and still imported from `@/lib/supabase/proxy` (old path). Fixed to `middleware` + `@/lib/supabase/session`.
- [x] **Add `app/page.tsx`** with a redirect to `/home`. Until middleware works, visiting `/` returns a 404.
- [x] **Fix operator precedence bug in `app/(public)/home/page.tsx`**:

  ```ts
  // Current (broken) — `|| 7` is always truthy, returns ALL schedules every day
  CLASS_SCHEDULES.filter((item) => item.dayOfWeek === new Date().getDay() || 7);

  // Fix
  CLASS_SCHEDULES.filter(
    (item) => item.dayOfWeek === (new Date().getDay() || 7),
  );
  ```

- [x] **Display field-level validation errors in `SignInForm.tsx`** — `fieldState` is destructured from the `Controller` render prop but never used. Zod errors are silently swallowed and never shown to the user.
- [x] **Use validated data in `signInAction`** — `src/features/auth/action/index.ts` calls `signInWithPassword(values)` (raw input) instead of `signInWithPassword(validatedFields.data)` after a successful `safeParse`.

---

## 🟠 Security / Auth

- [ ] **Add route protection in middleware** — after renaming `proxy.ts` to `middleware.ts`, guards for protected routes (e.g. any future `/dashboard`) must be implemented.
- [x] **Extract role constants** — magic number `role_id !== 0` appears in `action/index.ts` and `hooks/useAuth.ts`. Define a `ROLES` constant or enum.
- [x] **Add error handling on `getUser()` in `AuthWrapper.tsx`** — network failures currently throw unhandled.
- [x] **Create `.env.example`** documenting `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] **Add `.catch()` to `main()` in `script/create-admin.ts`** to prevent silent unhandled promise rejections. _(already present)_

---

## 🟡 Naming & Typos

- [x] **Rename `src/features/bullitin/` → `src/features/bulletin/`** (missing `le`).
- [x] **Rename `src/features/home/components/UpcommingEventsCard.tsx` → `UpcomingEventsCard.tsx`** (double `m`) and fix all imports.
- [x] **Rename `LatestNewsCard` export in `NewsCard.tsx`** to match the filename (`NewsCard`), or rename the file — default export name and filename should agree.
- [x] **Fix `ClassShecduleCard` import alias in `home/page.tsx`** — the alias has transposed letters (works by luck, not intent).
- [x] **Fix font variable name in `app/layout.tsx`** — `const notoSans = Oswald(...)` loads `Oswald` but the variable is named `notoSans`. Rename to `const oswald`.
- [x] **Fix typo in `ClassScheduleCard.tsx`** — JSX text reads `"Todays's Schedule"` → `"Today's Schedule"`.
- [x] **Fix schema error message mismatch in `auth.ts`** — `min(6, 'New password must be at least 8 characters')` contradicts itself; change min to `8` or fix the message.

---

## 🟡 Structural / Architecture

- [x] **Add `app/(auth)/layout.tsx`** — the auth route group currently has no layout, so sign-in gets the full root layout with no auth-specific wrapper.
- [x] **Move `NAV_LINKS` array out of the `NavigationBar` component body** in `src/components/layout/navigation-bar.tsx` — it is re-created on every render. Define it at module level.
- [x] **Remove `'use client'` from `app/(public)/home/page.tsx`** — the page has no hooks, refs, or event handlers that require client rendering. Making it a Server Component enables RSC streaming and improves performance.
- [x] **Fix double `<header>` nesting** — `app/(public)/layout.tsx` wraps `<NavigationBar />` in a `<header>` tag, but `NavigationBar` itself already renders a `<header>`. Remove one.
- [x] **Fix double `<footer>` nesting** — `app/(public)/layout.tsx` wraps `<Footer />` in a `<footer>` tag, but the `Footer` component renders a `<div>`. Either the layout wrapper or the component should own the semantic element — not both.
- [ ] **Fix broken navigation links** — `NAV_LINKS` references `/news-events`, `/schedule`, and `/faculty`, but none of these routes exist. Either create the routes or update the links.
- [x] **Remove redundant secondary filter in `ClassScheduleCard.tsx`** — the `schedule` prop is already filtered by day before being passed in; the `.filter()` inside the component for counting is redundant.
- [x] **Remove `router` from the `useEffect` deps array in `AuthProvider.tsx`** — `router` is listed as a dependency but never used inside the effect body, causing the auth subscription to be unnecessarily torn down on route changes.
- [x] **Rename `src/lib/supabase/proxy.ts` → `src/lib/supabase/session.ts`** to avoid confusion with the root `proxy.ts`/`middleware.ts`.

---

## 🟡 TypeScript

- [x] **Remove unused `{ start }` import from `'repl'`** in `src/data/events.ts` and `src/features/home/components/UpcomingEventsCard.tsx`.
- [x] **Remove dead exports** — `adminSignInSchema`, `changePasswordSchema`, and `ChangePasswordFormData` from `auth.ts` are defined but referenced nowhere. Remove or implement the change-password feature.
- [x] **Fix `section: string | Date`** in `src/types/types.ts` `ScheduleItemProps` — a section label should only be `string`.
- [x] **Normalize `date` field type in `news.ts` and `events.ts`** — items inconsistently use `string` or `Date`. Pick one and enforce it across the data arrays and the shared type.
- [x] **Use `@/` path alias consistently** — `app/layout.tsx` imports `../src/lib/utils` with a relative path while every other file in the project uses the `@/` alias.

---

## 🟡 Data & Features

- [ ] **Replace mock data with real Supabase queries** — `src/data/news.ts`, `src/data/events.ts`, and `src/data/schedule.ts` are all hardcoded static arrays. Implement actual database fetching.
- [ ] **Add real images or fix image references** — `public/images/` contains only `news1.jpg`. All other image paths referenced in the data files (e.g. `career-fair.jpg`, `renewable-energy.jpg`) will 404. Replace with real assets or a placeholder strategy.
- [x] **Fix invalid `blurDataURL` in `NewsCard.tsx`** — the string passed is not a valid base64-encoded image. Removed `placeholder="blur"` until real blur hashes are generated (e.g. via `plaiceholder` or Supabase storage metadata).
- [x] **Remove hardcoded `AM`/`PM` suffixes in `ClassScheduleCard.tsx` and `UpcomingEventsCard.tsx`** — times are stored as 24h strings; hardcoding suffixes is incorrect for afternoon classes.

---

## 🟢 Missing Pages & App Shell

- [ ] Create `app/not-found.tsx` — custom 404 page.
- [ ] Create `app/error.tsx` — root error boundary.
- [ ] Add per-route `loading.tsx` files for routes that will fetch data.
- [ ] Implement `src/features/bulletin/components/` — the bulletin page exists but its feature folder has no components.
- [ ] Create the `/news-events`, `/schedule`, and `/faculty` pages referenced in the nav.

---

## 🟢 Configuration & Housekeeping

- [ ] **Add image domains to `next.config.ts`** — the config is completely empty; add at least `images.remotePatterns` if external images will be used.
- [x] **Update app metadata in `app/layout.tsx`** — `title` and `description` are still the default `"Create Next App"` values.
- [ ] **Update `README.md`** — still boilerplate `create-next-app` content; replace with actual project documentation.
- [ ] **Verify `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** — the standard Supabase env var name is `NEXT_PUBLIC_SUPABASE_ANON_KEY`. If this was intentionally renamed, ensure `.env.local` and all three Supabase client files (`client.ts`, `session.ts`, `server.ts`) use the same name.
- [ ] **Implement the design spec fonts** — `DESIGN.MD` specifies Newsreader and Public Sans; the implementation uses Instrument Serif and Oswald.
- [ ] **Review `DESIGN.MD` "No-Line Rule"** — the spec forbids decorative lines, but `border-t-2` / `border-b-2` classes appear in several components.

---

## 🔴 Supabase — Security

- [x] **`signInAction` leaks Supabase error messages** — `authError.message` can expose whether an email is registered (email enumeration). Fixed to return a generic `'Invalid email or password.'` message.
- [ ] **Add rate limiting to the sign-in endpoint** — there is currently no brute-force protection. Options: enable Supabase's built-in auth rate limiting in the Dashboard (`Authentication > Rate Limits`), or add IP-based throttling in `middleware.ts` using an in-memory or Redis store.
- [ ] **Enable Row Level Security (RLS) on all tables** — verify in the Supabase Dashboard that RLS is ON for `profiles` and any future tables. Without it, any authenticated user can read or modify all rows. Minimum required policies:
  - `profiles`: users can only `SELECT`/`UPDATE` their own row (`auth.uid() = id`).
  - Admin-only tables: restrict to `role_id = 0` via a policy or a DB function.
- [ ] **Never select `*` in server queries** — future queries should always list explicit columns (e.g. `select('role_id')` already does this correctly). Avoids over-fetching sensitive fields.
- [ ] **Strengthen password validation in `script/create-admin.ts`** — currently only checks `length < 6`. Match your Supabase project's actual password policy under `Authentication > Providers > Email` (typically 8+ chars). Consider adding a regex check in the script.

---

## 🟠 Supabase — Performance & Loading

- [x] **Browser Supabase client was not a singleton** — `createClient()` in `client.ts` instantiated a new `createBrowserClient` on every call. Added a module-level variable so subsequent calls reuse the same instance.
- [x] **`AuthProvider` double-fetched the profile on hydration** — `onAuthStateChange` fires `SIGNED_IN` on the first client render even when the session was already loaded server-side by `AuthWrapper`. Added a `ssrRoleConsumed` ref guard to skip the redundant DB round trip when the user ID hasn't changed.
- [x] **`AuthWrapper` did not handle `getUser()` failures** — a Supabase network error would throw and crash the entire layout. Now gracefully falls back to unauthenticated state.
- [ ] **Cache the server-side profile fetch** — `AuthWrapper` makes two sequential Supabase round trips on every SSR render: `getUser()` then `profiles` select. Wrap the profile select with Next.js `cache()` (React request memoization) so repeated calls within the same render pass are deduplicated:
  ```ts
  // src/lib/supabase/queries.ts
  import { cache } from 'react';
  export const getProfile = cache(async (userId: string) => {
    const supabase = await createClient();
    const { data } = await supabase
      .from('profiles')
      .select('role_id')
      .eq('id', userId)
      .single();
    return data;
  });
  ```
- [ ] **Generate Supabase TypeScript types** — all table queries (`.from('profiles')`) currently return `any`-typed data. Run the Supabase CLI to generate a types file and add it to `src/types/database.types.ts`:
  ```bash
  npx supabase gen types typescript --project-id <your-project-id> > src/types/database.types.ts
  ```
  Then type the clients:
  ```ts
  import type { Database } from '@/types/database.types';
  createBrowserClient<Database>(...)
  createServerClient<Database>(...)
  ```
- [ ] **Consider a single RPC or view for auth + role** — the two-step `getUser()` → profile lookup could be replaced by a Postgres function (`auth.get_user_role()`) callable via `.rpc()`, collapsing two round trips into one at the DB level. Worth doing when the app scales.

---

## 🔴 Performance — Auth State Sync

- [x] **`router.refresh()` missing after sign-in** — `SignInForm.tsx` called `router.push('/home')` after a successful sign-in but never called `router.refresh()`. The server-side `AuthWrapper` would serve stale (unauthenticated) HTML until a full page reload, causing the nav to flicker between auth states.
- [x] **`router.refresh()` missing after sign-out** — same issue in `NavigationBar.tsx`; after `signOutAction()` the session cookie was cleared but the server-side cache was not invalidated. Added `router.refresh()` after the push.

---

## 🟠 Performance — Rendering & Bundle

- [x] **`Intl.DateTimeFormat` instances created on every call in `formatters.ts`** — `formatDayDate()` called `new Intl.DateTimeFormat(...)` on every invocation (hot path: called once per news item and per event). Hoisted to module-level constants so the objects are created once.
- [x] **`Noto_Sans` dead import in `app/layout.tsx`** — `Noto_Sans` was imported from `next/font/google` but never used or applied. This caused Next.js to download the unused font definition at build time. Removed.
- [x] **`redirect` dead import in `action/index.ts`** — `import { redirect }` was never called in the server action. Removed.
- [x] **`errors` destructured but never used in `SignInForm.tsx`** — `formState: { isSubmitting, errors }` pulled `errors` out of `useForm` unnecessarily (field errors are read via `fieldState` inside each `Controller`). Removed the unused destructure.
- [ ] **`Suspense` boundary wraps the entire app in `app/layout.tsx`** — `AuthWrapper` is an async Server Component so it can suspend fine, but placing a full-screen `<Loading />` fallback at the root means any child page that's slightly slow to fetch will show the whole-screen spinner instead of streaming content progressively. Move the `Suspense` boundary down into individual page layouts or just above data-fetching components once real Supabase fetches are in place.
- [ ] **`next.config.ts` has no image optimization settings** — `next/image` defaults to `quality: 75` and converts to WebP/AVIF automatically, but there's no `remotePatterns` config for any future remote images (CDN, Supabase Storage). Add it before connecting images to real storage.

---

## 🟡 Cleanup — Dead Files & Stale Code

- [ ] **Delete `src/lib/supabase/proxy.ts`** — this file was superseded by `src/lib/supabase/session.ts` but was never removed. Having both causes confusion about which one is canonical. Since nothing imports `proxy.ts` anymore (the root `proxy.ts` was updated to import `session.ts`), it is safe to delete.
- [ ] **`formatCurrency` in `formatters.ts` is unused** — the function is defined and exported but called nowhere in the codebase. Remove it or move it to a feature-specific file when it is actually needed.
- [ ] **`src/features/bulletin/components/` directory is empty** — the bulletin page at `app/(public)/bulletin/page.tsx` renders nothing. Either scaffold the feature components or leave a clear placeholder comment in the page.

---

## 🟡 Supabase — Backend Structure

- [ ] **Centralise all Supabase query functions in `src/lib/supabase/queries.ts`** — currently queries are scattered inline inside `AuthWrapper`, `AuthProvider`, and `signInAction`. As the app grows this becomes hard to maintain. Move all `.from(...)` calls into a single queries module and import from there:

  ```ts
  // src/lib/supabase/queries.ts
  import { cache } from 'react';
  import { createClient } from './server';

  export const getUserProfile = cache(async (userId: string) => {
    const supabase = await createClient();
    const { data } = await supabase
      .from('profiles')
      .select('role_id')
      .eq('id', userId)
      .single();
    return data;
  });
  ```

- [ ] **Define a Supabase database schema file** — there is no `supabase/migrations/` folder or schema SQL tracked in the repo. If the database schema changes, there is no way to reproduce the environment. Add a `supabase/` directory with `migrations/` and commit the schema.
- [ ] **`profiles` table email column in `create-admin.ts`** — the script upserts `email` into `profiles`, but `auth.users` already stores email. Storing a duplicate in `profiles` creates a sync problem: if the user updates their email via Supabase Auth, `profiles.email` goes stale. Consider removing the `email` column from `profiles` and always reading from `auth.users` via a join or RLS-aware view.
