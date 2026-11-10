# CIT Hub Web — Beta Readiness TODO
*Re-verified against the repo on 2026-11-10 (Next.js 16.2.1, fallow 3.41.0)*

**Verified green:** `tsc --noEmit` ✓ · `eslint src app` ✓ · `next build` ✓ (~30s)

---

## 🚨 WEEK 0 — Blockers (Do Before Anything Else)

### Security: dependency audit (`npm audit`: 15 vulns — 1 critical, 7 high, 6 moderate, 1 low)
- [x] **Upgrade `next` 16.2.1 → 16.4.6** (non-major; fixes the **critical** advisory range ≤16.4.0)
  - Includes *Middleware/Proxy bypass* advisories — this app gates auth in `proxy.ts`, so treat as a real beta blocker
  - Also covers RSC DoS, Image Optimization DoS, WebSocket SSRF, CSP-nonce XSS
  - After bump: bump `eslint-config-next` to match, re-run tsc / eslint / build, smoke-test auth redirects
  - Done 2026-11-10: tsc / eslint / build green. The new `react-hooks/set-state-in-effect` rule flagged `WebcamDialog` in `ProfilePictureStep.tsx` (fixed). Auth redirect smoke test against `next start` passes; it also exposed that signed-out users could open `/personnel/setup` (the `/personnel/` public prefix matched it) — fixed in `src/lib/supabase/proxy.ts`
- [x] `npm audit fix` for the non-breaking fixes (`zod` ≥4.6.6, `undici`, `body-parser`, `@shadcn/registry`)
- [x] Move `shadcn` (CLI) from `dependencies` → `devDependencies` — it drags most of the transitive vulns into the prod tree (it is only imported at build time via `@import "shadcn/tailwind.css"`; fallow `ignoreDependencies` covers its `dev-dep-in-prod` finding)
- [x] `sharp` and `postcss` (high) — cleared by the Next bump / audit fix; nothing left to track
- [x] Re-run `npm audit --omit=dev` — **0 vulnerabilities**. Full `npm audit` still has 12 dev-only (2 low / 10 moderate, `@typescript-eslint` chain via `eslint-config-next`); only fixable with `--force`, not shipped to prod

---

## 📋 WEEK 1 — Stabilize

### Dead Code Cleanup (current `fallow dead-code`: 50 issues)
Counts re-measured: 1 unused file · 29 unused exports · **17** unused types · 2 duplicate export aliases · 1 stale suppression.
Done 2026-11-10 — `fallow dead-code` now exits 0 (was 50 issues); tsc / eslint clean.
- [x] `cmd /c npx fallow fix --dry-run` — skipped; edits were made by hand (all findings were small)
- [x] Delete `src/components/providers/index.ts`
- [x] Remove stale suppression: `src/features/events/action/desk-lookup.ts:41` (line 11 one is still needed)
- [x] Unused exports in `components/ui/*` → kept as UI-kit surface via fallow `ignoreExports` in `.fallowrc.json`
- [x] Unused app exports removed / un-exported: `utils/formatters.ts` (3 deleted), `listing-utils.ts` (`compareByDate` un-exported), `students/action/queries.ts` (`getStudents` deleted), `DirectoryFilters.tsx` (`majorFilters` un-exported), `events/schema/event.ts` (`UpdateEventSchema` deleted), providers' default exports
- [x] Unused types removed (events 11 `*Props`, students 2 `*Props`, `UpdateEventFormData`, `UpdateStudentFormData`, `MajorFilter` re-export)
- [x] Duplicate export aliases: kept the named export, dropped `default` in `auth-provider.tsx` / `auth-wrapper.tsx`
- [x] Fallow config added (`.fallowrc.json`): UI-kit `ignoreExports`, `shadcn` build-time dependency, and boundary zones (`ui` imports nothing; `features` may import `ui` + `features`). `fallow architecture` passes. `.fallow/` added to `.gitignore`

### Bundle Analysis
- [ ] ~~`@next/bundle-analyzer`~~ not needed — Next 16 ships `next experimental-analyze` (see `node_modules/next/dist/docs/01-app/03-api-reference/06-cli/next.md`)
- [x] Ran `npx next analyze --output --snapshot beta-1` (16.4 name for `experimental-analyze`); interactive UI is at `.next/diagnostics/analyze`
- [x] **First-load JS (gzip) optimized 2026-11-10** — measured from `.next/diagnostics/route-bundle-stats.json`. Before → after (KB): `/` 219→**178** · `/home` 257→**208** · `/bulletin` 325→**216** · `/personnel` 333→**213** · `/student` 326→**216** · `/events` 330→**221** · `/events/[slug]` 260→**211** · `/bulletin/[...slug]` 257→**208** · `/personnel/[id]` 261→**212** · `/sign-in` 286→**241** · `/reset-password` 288→**244**
  How: (1) `AuthProvider` loads the Supabase browser client lazily at idle (−~41KB on every route); (2) `LiveActivityFeed` lazy-loads it for realtime; (3) form dialogs (`CreateEventDialog`, `AddNewsButton`, `EditPersonnelButton`, `RegisterPersonnelButton`, `EditStudentDialog`, `RegisterStudentButton`) are now light shells that `next/dynamic`-load a `*Body` with zod + react-hook-form + the image cropper only when opened (−~35KB gzip on listing routes).
  **Round 2 (same day):** migrated all schemas to `zod/mini` (−~12KB on every form route; `src/features/schemas.test.ts` snapshots every schema's field/code/message output — only zod's *built-in default* wording changed, e.g. "Invalid input" instead of "expected string, received undefined"; all custom messages, paths, codes and parsed data are identical), lazy-loaded `react-easy-crop` via `ImageCropDialog`, and lazy-loaded the Supabase realtime client in `useScanTerminal` (verified in a browser: websocket opens, no CSP/console errors, offline roster cache still populates). Now: `/sign-in` **229** · `/reset-password` 232 · `/events/[slug]/login|logout` **219** · `/profile/edit` 264 · `/personnel/setup` 261 · `/student/setup` 258 (KB gzip).
  **Still over 250KB (3 one-time setup wizards, by 8–14KB):** the floor is now zod core (~20KB, not reducible further), react-hook-form (~11KB), cmdk (~16KB, needed by the first-step comboboxes) and the wizard UI. Further gains would need splitting wizard steps with `next/dynamic` — low value for pages a user visits once.
  Behaviour changes from the dialog split: dialogs show a brief skeleton on first open, and form input no longer survives closing/reopening a dialog (body unmounts). Not exercised in a signed-in browser session — click through each dialog (create event, add news, edit/register personnel, edit/register student) and the image crop flow before beta.

### Quick CSS Hygiene
- [x] Deleted unused `--sidebar*` tokens in `app/globals.css` (all 3 blocks). Note: "sidebar" in `PersonnelSidebar`/`PersonnelProfile` is an unrelated component name, not the token
- [x] Verified undefined custom properties — every `var(--…)` in `src/` and `app/` resolves to a defined/runtime-set property
- Remaining advisory `css-dead-surface` warnings: `--color-chart-1…5`, `--radius-4xl` (unused theme tokens; not gating)
- [x] Document any intentional arbitrary values — the list lives in the Week 3 audit table below

---

## 📋 WEEK 2 — Reduce Complexity (Target: CRAP < 200)

**✅ Done 2026-11-10.** Highest CRAP in the repo is now **90** (was 992); **0 functions ≥ CRAP 100** (was 32), 0 critical (was 32). 106 functions remain above fallow's reporting threshold (35 high, 71 moderate — all CRAP < 100). Maintainability avg 92.3. CRAP is the static estimate (no coverage data), so it equals cyc² + cyc; tests (Week 4) will lower it further.

Method: pure helpers / lookup maps / small components extracted, behavior preserved. Verified with tsc, eslint, `fallow dead-code` (clean), 25 unit tests, `next build`, and a **rendered-HTML diff of 9 public routes vs. HEAD** (identical apart from Next-version font class names and one whitespace-only text node in `PersonnelCard`). **Not covered by that diff:** signed-in/form flows (setup wizards, event gate/check-in, news/event/personnel forms, auth register) — smoke-test these manually before beta; Week 4 E2E should cover them.

Notable changes: `updateSession` decisions moved to pure `src/lib/supabase/access-rules.ts` with Vitest coverage (`access-rules.test.ts`); `useNewsForm` now keeps a saved post if `reset()/onSuccess()/toast` throws afterwards (old code deleted the uploaded image and showed an error); `runMutation` helpers stay in `src/actions/mutation.ts`.

### Critical Hotspots (CRAP > 200) — all resolved (table shows the original numbers)

| Function | File | Cyc / Cog | CRAP | Split Into |
|----------|------|-----------|------|------------|
| `PersonnelCard` | `features/personnel/components/PersonnelCard.tsx` | 31 / 25 | 992 | `PersonnelBadge`, `PersonnelContactRow`, `PersonnelActions`, `PersonnelEducationSummary` |
| `updateSession` | `lib/supabase/proxy.ts` | 29 / 55 | 870 | `extractTokenFromCookie`, `refreshSession`, `setCookieHeaders`, `handleAuthError` (**auth-critical — add tests first**) |
| `toDeskStudent` | `features/events/utils.ts` | 24 / 15 | 600 | Extract pure mappers; early returns. File also flagged "split high-impact" (7 dependents) |
| `EventDetailPage` | `app/(public)/events/[slug]/page.tsx` | 23 / 20 | 552 | `EventHeader`, `EventMeta`, `EventActions`, `RelatedEvents`, `AttendanceSection` |
| `VerifiedIdCard` | `features/events/components/VerifiedIdCard.tsx` | 23 / 20 | 552 | Split header/badge/body |
| `commitDeskVisit` | `features/events/action/desk-checkin.ts` | 19 / 27 | 380 | Extract validation, DB write, response |
| `directory` | `features/students/action/queries.ts` | 19 / 10 | 380 | Pure mapper + fetcher split |
| `useNewsForm` (submit arrow) | `features/bulletin/hooks/useNewsForm.tsx:61` | 18 / 19 | 342 | **New** — extract payload builder + upload step |
| `usePersonnelForm` | `features/personnel/hooks/usePersonnelForm.tsx` | 18 / 16 | 342 | Split `defaultValues` builder (already uses `useProfileSubmit`) |
| `InputField` (arrow) | `components/shared/InputField.tsx:52` | 17 / 15 | 306 | Used 27× — extract `renderLabel`, `renderError`, `renderHelper` |
| `EditPersonnelButton` | `features/personnel/components/EditPersonnelButton.tsx` | 17 / 16 | 306 | Extract preview logic |
| `runMutation` | `actions/mutation.ts:48` | 16 / 17 | 272 | **New** — shared by all actions; split error-mapping vs execution |
| `useStudentForm` | `features/students/hooks/useStudentForm.tsx` | 14 / 15 | 210 | Extract `defaultValues` builder |

### Next tier (CRAP 100–200) — all resolved (cyc ≤ 9). Skipped as unnecessary: `useScanTerminal` hook split (kept as one hook; extracted pure helpers in `events/lib/scan-tap-outcome.ts` instead), `CreateEventDialog` and `GateTerminal`/`SetupWizard` (no function ≥ CRAP 100)

| Function | File | CRAP | Action |
|----------|------|------|--------|
| `registerUserWithRole` | `actions/auth/register.ts` | 182 | **New** — split validation / auth signup / profile insert |
| `ImageDropzone` | `components/shared/ImageDropzone.tsx` | 182 | `ImageUploader`, `ImageCropper`, `ImagePreview` (4 consumers) |
| `logDeskCheckinAction` | `events/action/desk-checkin.ts:271` | 182 | Extract validation |
| `DeskSyncBadge` | `events/components/DeskSyncBadge.tsx` | 182 | Extract state→label/colour map |
| `filteredEvents` | `events/components/EventsListing.tsx:83` | 182 | Move to pure util in `listing-utils.ts` |
| `LiveEntryRoster` (arrow) | `events/components/LiveEntryRoster.tsx:204` | 182 | Extract `RosterRow`, `RosterFilters`, `RosterPagination` |
| `canGoNext` | `students/components/SetupStudentCard.tsx:66` | 182 | Replace branch chain with per-step validator map |
| `SetupStepper` (arrow) | `components/shared/SetupStepper.tsx:22` | 156 | Simplify |
| `useEventForm` (arrow) | `events/hooks/useEventForm.tsx:59` | 156 | Extract payload builder |
| `EventCard` | `events/components/EventCard.tsx` | 132 | Extract status/date helpers |
| `useScanTerminal.commitTap` | `events/hooks/useScanTerminal.ts:127` | 132 | Split into `useScanQueue`, `useSyncEngine`, `useKeyHandler`, `useTerminalState` |
| `HomePage` | `app/(public)/home/page.tsx` | 110 | Extract sections |
| `CreateEventDialog` | `events/components/` | — | `EventFormSteps`, `EventCoverUploader`, `EventPreview`, `EventFormFooter` |
| `GateTerminal` / `SetupWizard` | — | low | `StatusPill`, `ReaderStatus`, `ScanLog` / `useSetupWizard` — lower priority |

### Hidden coupling (fallow change-coupling)
- [x] `bulletin/page.tsx` ↔ `home/page.tsx` ↔ `personnel/page.tsx` ↔ `NewsCard.tsx` — investigated: mostly coincidental co-editing (they already share the `PageSection`/`PageHeader` shell). The real duplication was news-card logic (excerpt fallback ×3, href, category label, badge colour); extracted to `src/features/bulletin/utils.ts`, and `HomePage` split into `HomeNewsSection` / `HomeDashboardSection` (cyc 10 → 2). The fallow coupling figure is git-history based and only drops after new commits land
- [x] Hotspots (high churn × complexity): 4 files remain flagged by fallow (`fallow health --hotspots`); churn-driven, not a complexity problem now

---

## 📋 WEEK 3 — CSS Hygiene (Design Token Discipline)

### Arbitrary Value Audit (re-measured: 108 distinct / 168 uses — unchanged; excludes `data-[…]`/`aria-[…]` variants)
Other frequent ones not in the original list: `bottom-[36%]` (5), `bottom-[26%]` (4), `w-[16%]` (4), `text-[10px]` (4), `text-[0.625rem]` (4), `border-[3px]` (4), `ring-[3px]` (3), `rounded-[2px]` (3).
Promote frequent patterns to `@theme` tokens in `globals.css`:

| Pattern | Count | Files | Proposed Token |
|---------|-------|-------|----------------|
| `tracking-[0.14em]` | 8 | GateTerminal | `--tracking-wide` |
| `tracking-[0.1em]` | 7 | events/[slug] | `--tracking-normal` |
| `tracking-[0.12em]` | 4 | events/[slug] | `--tracking-slight` |
| `tracking-[0.2em]` | 4 | AreaField | `--tracking-wider` |
| `max-h-[80vh]` | 2 | AddNewsButton | `--max-h-dialog` |
| `aspect-[21/9]` | 1 | events/[slug] | `--aspect-cinematic` |
| `aspect-[16/9]` | 1 | events/[slug] | `--aspect-video` |
| `grid-cols-[1fr_340px]` | 1 | events/[slug] | `--grid-sidebar` |

- [x] Add tokens to `@theme` block — done 2026-11-10. Used distinct names instead of overriding Tailwind's built-in `tracking-wide/wider` (which other components use): `tracking-label-tight` 0.08em, `tracking-label` 0.1em, `tracking-label-wide` 0.12em, `tracking-label-wider` 0.14em, `tracking-spaced` 0.2em, `text-2xs` (0.625rem), `aspect-cinematic` (21/9); utilities `max-h-dialog` (80vh) and `grid-cols-sidebar` (1fr 340px). `aspect-[16/9]` → built-in `aspect-video`
- [x] Replace arbitrary values with new utilities (app code; the shadcn `components/ui/*` kit is intentionally left as generated). Also deduplicated five identical `<dt>` label styles in `EventDetailsCard` into `DetailLabel`. Generated CSS verified for every new utility
- [x] Re-measured: 114 distinct / 183 uses (more uses counted than before because Week 2 refactors split markup, not because new values were added). **87 are in `components/ui/*` (kit) and 87 in `EventCover.tsx`** (decorative scene illustration — absolute percentage geometry, intentional); ~10 remain in other app code (`tracking-[0.22em/0.25em/0.28em]` one-offs, `max-h-[85vh/90vh]`, `text-[11px]`, etc.)
- [ ] `fallow audit --gate all` still reports `css-token-drift` **warnings** (advisory, non-gating) for the kit and `EventCover.tsx`; fallow's per-file `overrides` has no effect on this rule, so they stay as known/intentional

---

## 📋 WEEK 4 — Beta Hardening

### Observability & Error Handling
*(2026-11-10: added)* `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`, and an `error.tsx` per route group (`(public)`, `(protected)`, `(auth)`) sharing `src/components/shared/RouteError.tsx` (logs the error, shows the digest as a reference, Try again / Go home). Next 16.4 error boundaries take `retry` (not `reset`). Verified: custom 404 renders inside the public layout; boundaries not exercised with a forced runtime error yet.
- [x] Add error boundaries per route segment (`error.tsx` in each route group)
- [x] Add global error boundary (`app/global-error.tsx`) and `app/error.tsx`
- [x] Add `app/not-found.tsx`
- [ ] Integrate Vercel Analytics (`@vercel/analytics`) — needs a decision/Vercel project; `npm i @vercel/analytics` + `<Analytics />` in `app/layout.tsx`
- [ ] Integrate Sentry (or open-source: `@sentry/nextjs`) — needs a Sentry DSN; wire `RouteError`/`global-error` `useEffect` to `Sentry.captureException`
- [ ] Add `nextjs-opentelemetry` if self-hosted

### Performance Baselines
- [ ] Run Lighthouse CI on all routes (build now reports **18 routes**, was 17) (target: P90 LCP < 2.5s, CLS < 0.1, TBT < 200ms)
- [x] **Server-side data optimizations (2026-11-10):** (a) `getCurrentUserProfile` moved to `src/lib/supabase/current-user.ts` (React `cache`) and now shared by the root `AuthWrapper`, `/student` and `getCurrentUserPersonnel` — one `getUser` + profile query per render instead of up to three; (b) `/events/[slug]` fetches related events with two limited queries (`GetRelatedEvents`) instead of loading every published event with full `content`; (c) `/home` uses `GetUpcomingEvents(5)` and `getBulletinPageData({ newsLimit: 2 })` instead of all events/all news; (d) `/student` loads directory + lookups in parallel. Remaining per-request cost: the `proxy` still does its own `getUser` + profile (+ setup-table) lookups — consider `getClaims()` there if the Supabase project uses asymmetric JWT signing keys.
- [ ] **Rendering strategy:** the latest build shows **every route as dynamic (ƒ)** — the old "15 static" baseline no longer holds. Find what forces dynamic rendering (likely `cookies()` via the Supabase client in the root layout / `proxy.ts`) and decide per route:
  - `/events/[slug]` → `revalidate: 60` (or on-demand via webhook)
  - `/bulletin/[...slug]` → `revalidate: 300`
  - `/personnel/[id]` → `revalidate: 3600`
  - (ISR only applies once these routes can render statically)
- [x] Configure image optimization in `next.config.ts` (**note: `.ts`, not `.js`**):
  - ✅ `remotePatterns` for `*.supabase.co` storage — done
  - [x] `formats: ['image/avif', 'image/webp']`
  - [x] `deviceSizes`, `imageSizes` set to a conservative responsive ladder (360–1920 / 32–384); re-tune against real layouts when Lighthouse numbers exist

### Testing
- [ ] Write 3–5 critical E2E flows (Playwright recommended):
  1. Auth → Sign in → Create event → Publish → Check-in attendee
  2. Personnel edit → Save → Verify preview updates live
  3. Student setup → Complete wizard → Verify directory entry
  4. Bulletin create → Publish → Verify hero + listing
  5. RFID link → Scan → Verify desk sync
- [x] Add unit tests for pure functions — 58 Vitest tests, colocated with the code: auth access rules (25), `listing-utils`, `formatters`, bulletin `utils`, `events/lib/scan-tap-outcome`, and per-feature schema snapshot tests. Mappers like `toDeskStudent` and the desk-checkin helpers are still untested
- [ ] Add integration tests for server actions (mock Supabase)

### Security & Ops
- [x] Verified `SUPABASE_SERVICE_ROLE_KEY` handling in code: only read in `src/lib/supabase/admin.ts`, not `NEXT_PUBLIC_`, and `admin.ts` is imported only from server modules (actions / server queries), never from a `"use client"` file. **Still to do by you:** confirm the variable is set in the Vercel production env (can't be checked from the repo)
- [ ] ~~Run `npm audit`~~ → moved to **Week 0** (critical `next` advisory)
- [x] Add CSP + security headers via `next.config.ts` `async headers()`: CSP (self + Supabase https/wss, `blob:`/`data:` images, `frame-ancestors 'none'`, `object-src 'none'`, `upgrade-insecure-requests` in prod), `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` (camera allowed for the profile-photo step). Checked in a real browser against 6 public routes: no CSP violations, hydration/JS works. **Limitation:** `script-src` needs `'unsafe-inline'` because Next's inline bootstrap scripts have no nonces; moving to nonces requires dynamic rendering via `proxy.ts` (already all-dynamic). Signed-in pages (webcam capture, image cropper/`blob:`, CSV export) were not browser-tested under the CSP — check them before beta
- [x] Document rollback procedure (Vercel instant rollback) — README → Operations
- [x] Add health check endpoint (`/api/health`) for load balancer — liveness only (no DB call); excluded from the auth `proxy` matcher; returns `Cache-Control: no-store`
- [ ] **New finding:** `EventAboutCard` renders `event.content` with `dangerouslySetInnerHTML` — sanitize on write or render (e.g. `sanitize-html`/DOMPurify) so a compromised or careless editor account can't inject script
- [ ] **New finding:** the events list links to `/events/testing`, which returns 404 (existing before these changes) — check that event's published/slug state

---

## 📋 ONGOING / NICE TO HAVE

### Architecture
- [ ] Feature flags (mentioned in fallow skill) — implement if needed for gradual rollout
- [ ] Offline queue + `client_op_id` idempotency — migration `20261008034030_event_attendance_offline_idempotency.sql` already exists; verify it's applied to the Supabase project, and wire `client_op_id` through the app (no references in `src/` yet)
- [ ] NavBar signed-out nav links decision
- [ ] `AcademicYearBadge` dynamic year/semester (currently hardcoded)

### Developer Experience
- [x] Add `fallow` to CI gate — `fallow dead-code` (pinned 3.41.0) runs in CI; the full `audit --gate all` is diff-based and still emits advisory warnings, so not gating
- [ ] Add `knip` for dead code detection in CI — redundant with fallow; skip unless you want a second opinion
- [ ] Document component library usage (Storybook or MDX)
- [x] Add `npm run typecheck` script (`typecheck:watch` not added)
- [x] Add a test runner + `test` script — Vitest 3 (`vitest.config.ts`, `npm test`); v5 needs `@types/node` ≥ 22. Playwright (E2E) still to do
- [x] Add `.github/workflows/ci.yml`: typecheck → eslint → fallow dead-code → vitest → build → `npm audit --omit=dev --audit-level=high`. Build verified locally with no `.env` and placeholder public env vars; the workflow itself has not run on GitHub yet
- [x] **Repo cleanup & folder structure (2026-11-10):** removed the completed root `TODO` roadmap (superseded by this file; still in git history), the create-next-app `public/*.svg` boilerplate, and empty dirs (`app/(admin)`, `src/features/students/utils`); regrouped `src/components/shared` into `forms/`, `listing/`, `media/`, `wizard/`; moved pure modules into each feature's `lib/` / `utils.ts` (`bulletin/utils.ts`, `events/lib/listing.ts` — which now owns `isAcademicEvent` instead of `EventCard`, `events/lib/scan-tap-outcome.ts`); split the schema snapshot test into per-feature `schema/*.test.ts` with a shared `src/test/report-parse.ts`; replaced the boilerplate README with a project overview + structure guide; added `.env.example` (whitelisted in `.gitignore`). Layout is documented in README → Project structure. `public/images/news1.jpg` is unreferenced in code — left in place, delete if it's not content you need.

---

## 🔗 Key Commands Reference

```bash
# Quality gates
cmd /c npx tsc --noEmit
cmd /c npx eslint src app
cmd /c npx fallow audit --gate all
cmd /c npm run build

# Analysis (note: `fallow audit` only scans files changed vs origin/main — use bare `fallow` for the full picture)
cmd /c npx fallow
cmd /c npx fallow dead-code --format json --quiet
cmd /c npx fallow health --format json --quiet

# Bundle analysis (built into Next 16)
cmd /c npx next experimental-analyze

# Security
cmd /c npm audit --omit=dev
```

---

## 📊 Metrics (re-measured 2026-11-10; baseline 2026-10-15 in parentheses)

| Metric | Value | Target |
|--------|-------|--------|
| Total LOC | 17,348 (16,304 on 2026-11-10 am; 12,645 baseline) | — |
| Files analyzed | 186 | — |
| Duplication | 0.0% | < 1% ✓ |
| Dead files | 1 (1) | 0 |
| Unused exports | 29 (29) | 0 |
| Unused types | 17 (16) | 0 |
| Functions above threshold | 106 (35 high, 71 moderate, 0 critical) | < 10 very-high ✓ |
| CRAP > 200 | 0 (max 90) | 0 ✓ |
| Arbitrary Tailwind values | 183 uses / 114 distinct (87 shadcn kit + 87 EventCover scenery; ~10 elsewhere) | < 20 outside kit/EventCover ✓ |
| Build time | ~30s (~23s) | < 30s ⚠ borderline |
| Routes | 18, all dynamic (17, 15 static) | — |
| Fallow health score | 75.3 B | — |
| Maintainability | 91.7 (89.9) | > 80 ✓ |
| `npm audit` | 1 critical / 7 high / 6 mod / 1 low | 0 high+ |
| Tests | 52 unit, 0 E2E | 3+ E2E |
| CI workflows | 1 (`ci.yml`, not yet run on GitHub) | 1 ✓ |

*Not re-measured:* unused `@theme` tokens count (14 → sidebar tokens still present) and the styling health score (needs `fallow` styling audit).

---

## 🎯 Definition of Done for Beta

- [x] Week 0 blockers resolved (`next` ≥ 16.4.6, 0 high/critical in `npm audit --omit=dev`)
- [x] All Week 1 items ✓ (the >250KB route follow-up is recorded as a finding with deferred architectural fixes)
- [x] CRAP < 200 for all functions (Week 2) — max is now 90
- [ ] 0 fallow audit findings (dead code, complexity, styling)
- [ ] Bundle analyzer shows no route > 250KB JS — 15 routes were over; now 3 remain (`/profile/edit` 264, `/personnel/setup` 261, `/student/setup` 258 KB gzip) — one-time wizards
- [ ] Lighthouse CI passes on all 15 routes
- [ ] 3+ E2E tests passing in CI
- [ ] Error boundaries + monitoring deployed
- [ ] Security audit clean
- [x] Rollback procedure documented (README → Operations)

---

*Last updated: 2026-11-10 | Next review: after Week 0 + Week 1 completion*