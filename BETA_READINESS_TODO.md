# CIT Hub Web — Beta Readiness TODO
*Generated from fallow audit + manual review (Next.js 16.2.1)*

---

## 📋 WEEK 1 — Stabilize (Do First)

### Dead Code Cleanup (auto-fixable)
- [ ] `cmd /c npx fallow fix --dry-run` — review changes
- [ ] `cmd /c npx fallow fix` — apply **with exclusions**
  - Removes: `src/components/providers/index.ts` (dead file) ✓
  - **KEEPS**: 29 unused exports in `components/ui/*` (Field*, Popover*, Sheet*, Command*, CardAction, DialogClose) — intentional future API surface
  - Removes: 16 unused type exports (events/types, students/types, schema) — not part of UI kit
- [ ] Remove stale suppression: `src/features/events/action/desk-lookup.ts:41`

### Bundle Analysis
- [ ] `npm i -D @next/bundle-analyzer`
- [ ] Add to `next.config.js`
- [ ] Run `ANALYZE=1 cmd /c npm run build`
- [ ] Review bundle sizes; flag anything > 250KB per route

### Quick CSS Hygiene
- [ ] Delete 14 unused sidebar tokens from `app/globals.css` (lines 54–63)
- [ ] Verify 2 undefined custom properties (may come from JS)
- [ ] Document any intentional arbitrary values (keep list for Week 3)

---

## 📋 WEEK 2 — Reduce Complexity (Target: CRAP < 200)

### Critical Hotspots (CRAP > 500)

| Component/Hook | Lines | CRAP | Split Into |
|----------------|-------|------|------------|
| `CreateEventDialog` | 399 | — | `EventFormSteps`, `EventCoverUploader`, `EventPreview`, `EventFormFooter` |
| `useScanTerminal` | 375 | — | `useScanQueue`, `useSyncEngine`, `useKeyHandler`, `useTerminalState` |
| `EventDetailPage` | 271 | 552 | `EventHeader`, `EventMeta`, `EventActions`, `RelatedEvents`, `AttendanceSection` |
| `PersonnelCard` | 157 | 992 | `PersonnelBadge`, `PersonnelContactRow`, `PersonnelActions`, `PersonnelEducationSummary` |
| `updateSession` | 161 | 870 | `extractTokenFromCookie`, `refreshSession`, `setCookieHeaders`, `handleAuthError` |
| `toDeskStudent` | 22 | 600 | Extract pure mappers; reduce cyclomatic via early returns |
| `ImageDropzone` | 169 | 182 | `ImageUploader`, `ImageCropper`, `ImagePreview` (shared across 4 consumers) |

### High Complexity (CRAP 100–300)

| Component/Hook | Lines | CRAP | Action |
|----------------|-------|------|--------|
| `VerifiedIdCard` | 146 | 552 | Split header/badge/body |
| `commitDeskVisit` | 146 | 380 | Extract validation, DB write, response |
| `directory` (queries) | 22 | 380 | Pure mapper + fetcher split |
| `usePersonnelForm` | 116 | 342 | Already extracted `useProfileSubmit`; split `defaultValues` builder |
| `InputField` | 76 | 306 | Used 27× — keep but extract `renderLabel`, `renderError`, `renderHelper` |
| `EditPersonnelButton` | 81 | 306 | Already uses `PersonnelEditTabs`; extract preview logic |
| `useStudentForm` | 79 | 210 | Already uses `useProfileSubmit`; extract `defaultValues` builder |
| `LiveEntryRoster` | 268 | 182 | Extract `RosterRow`, `RosterFilters`, `RosterPagination` |
| `GateTerminal` | 153 | 56 | Extract `StatusPill`, `ReaderStatus`, `ScanLog` |
| `SetupWizard` | 134 | 42 | Extract `useSetupWizard` hook (logic); keep component thin |

---

## 📋 WEEK 3 — CSS Hygiene (Design Token Discipline)

### Arbitrary Value Audit (108 distinct / 168 uses)
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

- [ ] Add tokens to `@theme` block
- [ ] Replace arbitrary values with new utilities
- [ ] Run `cmd /c npx fallow audit --gate all` to verify 0 styling findings

---

## 📋 WEEK 4 — Beta Hardening

### Observability & Error Handling
- [ ] Add error boundaries per route segment (`error.tsx` in each route group)
- [ ] Add global error boundary (`app/error.tsx`)
- [ ] Integrate Vercel Analytics (`@vercel/analytics`)
- [ ] Integrate Sentry (or open-source: `@sentry/nextjs`)
- [ ] Add `nextjs-opentelemetry` if self-hosted

### Performance Baselines
- [ ] Run Lighthouse CI on all 15 routes (target: P90 LCP < 2.5s, CLS < 0.1, TBT < 200ms)
- [ ] Document ISR/revalidate strategy:
  - `/events/[slug]` → `revalidate: 60` (or on-demand via webhook)
  - `/bulletin/[...slug]` → `revalidate: 300`
  - `/personnel/[id]` → `revalidate: 3600`
- [ ] Configure `next.config.js` image optimization:
  - `remotePatterns` for Supabase storage
  - `formats: ['image/avif', 'image/webp']`
  - `deviceSizes`, `imageSizes` tuned for your designs

### Testing
- [ ] Write 3–5 critical E2E flows (Playwright recommended):
  1. Auth → Sign in → Create event → Publish → Check-in attendee
  2. Personnel edit → Save → Verify preview updates live
  3. Student setup → Complete wizard → Verify directory entry
  4. Bulletin create → Publish → Verify hero + listing
  5. RFID link → Scan → Verify desk sync
- [ ] Add unit tests for pure functions (mappers, validators, formatters)
- [ ] Add integration tests for server actions (mock Supabase)

### Security & Ops
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` present in production env
- [ ] Run `npm audit` — fix high/critical
- [ ] Add CSP headers via `next.config.js` `async headers()`
- [ ] Document rollback procedure (Vercel instant rollback)
- [ ] Add health check endpoint (`/api/health`) for load balancer

---

## 📋 ONGOING / NICE TO HAVE

### Architecture
- [ ] Feature flags (mentioned in fallow skill) — implement if needed for gradual rollout
- [ ] Offline queue + `client_op_id` idempotency (new migration required)
- [ ] NavBar signed-out nav links decision
- [ ] `AcademicYearBadge` dynamic year/semester (currently hardcoded)

### Developer Experience
- [ ] Add `fallow` to CI gate (`fallow audit --gate all`)
- [ ] Add `knip` for dead code detection in CI
- [ ] Document component library usage (Storybook or MDX)
- [ ] Add `npm run typecheck:watch` script

---

## 🔗 Key Commands Reference

```bash
# Quality gates
cmd /c npx tsc --noEmit
cmd /c npx eslint src app
cmd /c npx fallow audit --gate all
cmd /c npm run build

# Analysis
cmd /c npx fallow dupes --format json --quiet
cmd /c npx fallow complexity --format json --quiet
cmd /c npx fallow unused --format json

# With bundle analyzer
ANALYZE=1 cmd /c npm run build
```

---

## 📊 Metrics Baseline (2026-10-15)

| Metric | Value | Target |
|--------|-------|--------|
| Total LOC | 12,645 | — |
| Duplication | 0.0% | < 1% ✓ |
| Dead files | 1 | 0 |
| Unused exports | 29 | 0 |
| Unused types | 16 | 0 |
| Very-high functions | 56 | < 10 |
| CRAP > 200 | ~25 | 0 |
| Arbitrary Tailwind values | 108 | < 20 |
| Unused @theme tokens | 14 | 0 |
| Build time | ~23s | < 30s ✓ |
| Routes | 17 (15 static) | — |
| Styling health | 89 A | > 85 ✓ |
| Maintainability | 89.9 | > 80 ✓ |

---

## 🎯 Definition of Done for Beta

- [ ] All Week 1 items ✓
- [ ] CRAP < 200 for all functions (Week 2)
- [ ] 0 fallow audit findings (dead code, complexity, styling)
- [ ] Bundle analyzer shows no route > 250KB JS
- [ ] Lighthouse CI passes on all 15 routes
- [ ] 3+ E2E tests passing in CI
- [ ] Error boundaries + monitoring deployed
- [ ] Security audit clean
- [ ] Rollback procedure documented

---

*Last updated: 2026-10-15 | Next review: after Week 2 completion*