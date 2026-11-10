# CIT Hub

Student information portal for CIT students, faculty and pioneers: news bulletin, events with RFID attendance desks, personnel directory and student records. Built with Next.js (App Router), React, Tailwind CSS v4, shadcn/ui and Supabase.

> This project runs on a recent Next.js with breaking changes. Check `node_modules/next/dist/docs/` before relying on older APIs (for example `proxy.ts` replaces `middleware.ts`).

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the Supabase values (see Operations → Environment)
npm run dev            # http://localhost:3000
```

## Project structure

```
app/                     Routes only (App Router). Route groups: (public) (auth) (protected)
  error.tsx, global-error.tsx, not-found.tsx, api/health
proxy.ts                 Auth gate; rules live in src/lib/supabase/access-rules.ts
src/
  components/
    ui/                  shadcn/ui kit (generated; keep as is)
    layouts/             NavBar, Footer, PageLayout
    providers/           Auth + theme providers
    shared/              Cross-feature building blocks
      forms/             InputField, ComboboxField, AreaField, ...
      listing/           Filter pills, pagination, search, sort + pure listing helpers
      media/             ImageDropzone, ImageCropDialog, ProfilePictureStep
      wizard/            SetupWizard, SetupStepper
  features/<feature>/    auth, bulletin, events, home, personnel, students
    action/              Server actions and data queries
    components/          UI for the feature (dialogs are a light shell + lazy *Body)
    hooks/               React hooks
    lib/                 Pure/domain modules and browser infra (e.g. offline DB, listing logic)
    schema/              zod/mini schemas (+ snapshot tests)
    types/               Types
    utils.ts             Small feature-level helpers
  actions/               Shared server-action plumbing (runMutation, auth gates)
  lib/supabase/          Supabase clients, current-user (per-request cache), access rules
  hooks/, utils/, types/ Cross-cutting helpers
  test/                  Test-only helpers
supabase/migrations/     Database migrations
```

Conventions: tests sit next to the code they cover (`*.test.ts`); keep a component's pure logic in `lib/` or `utils.ts` so it can be tested without React; load heavy form/cropper code with `next/dynamic` so it stays out of first-load JS.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js dev server, production build, production server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (unit + schema snapshot tests) |
| `npx fallow` | Dead code, complexity, duplication and boundary analysis |

## Operations

### Quality gates

```bash
npm run typecheck   # tsc --noEmit
npx eslint src app
npm test            # Vitest
npm run build
npm audit --omit=dev
```

The same checks run in `.github/workflows/ci.yml` on every push to `main` and every pull request.

### Health check

`GET /api/health` returns `200 {"status":"ok"}` without touching Supabase. Point the load balancer / uptime monitor at it.

### Rollback (Vercel)

1. Open the project in Vercel → **Deployments**.
2. Find the last known-good production deployment and choose **⋯ → Instant Rollback** (or **Promote to Production**). This re-points the production domain immediately; no rebuild is needed.
3. Confirm `/api/health` returns 200 and spot-check sign-in and `/events`.
4. Revert or fix the offending commit on `main`; production rolls forward again only when you promote the next deployment (Instant Rollback disables auto-assignment of new deployments until you re-enable it).

Database changes are **not** rolled back by Vercel. Keep Supabase migrations backward-compatible with the previous deployment (add columns/tables first, remove them in a later release), and only revert a migration with an explicit down migration.

### Environment

| Variable | Scope | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` | public | Needed at build time |
| `SITE_URL` | server | Optional override of `NEXT_PUBLIC_SITE_URL` for password-reset links |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Used only in `src/lib/supabase/admin.ts`; never prefix with `NEXT_PUBLIC_` |
# cit-hub-web
