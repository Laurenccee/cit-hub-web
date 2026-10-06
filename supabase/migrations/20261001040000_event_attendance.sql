-- Per-visitor attendance log backing the live attendance rail and the
-- RFID check-in desk (/desk).
--
-- Model: one row per visit. `check_in` is stamped on tap-in, `check_out` on
-- tap-out. A row with `check_in` set and `check_out` null means the visitor
-- is currently inside. `student_id` links the registered card holder.
-- Unregistered cards are rejected at the desk, never recorded.
--
-- Depends on 20261001020000_events.sql (events) and
-- 20261001000000_students.sql (students).
--
-- RLS model (same kiosk-friendly shape as the events page):
--   - Everyone (anon included) can read attendance rows for published,
--     non-archived events so the live rail renders without sign-in.
--   - Everyone can insert taps, but only against published, non-archived
--     events.
--   - Only Admins (profiles.role_id = 0) can update/delete rows.

-- Retire the superseded draft table from the unapplied 20261001020000 draft,
-- in case it was applied before this revision.
drop policy if exists event_checkins_select on public.event_checkins;
drop policy if exists event_checkins_public_insert on public.event_checkins;
drop policy if exists event_checkins_admin_delete on public.event_checkins;
drop table if exists public.event_checkins;

create table if not exists public.event_attendance (
    id uuid primary key default gen_random_uuid(),
    event_id uuid not null references public.events (id) on delete cascade,
    student_id uuid references public.students (id) on delete set null,
    check_in timestamptz,
    check_out timestamptz,
    created_at timestamptz not null default now(),
    constraint event_attendance_direction_check
        check (check_in is not null or check_out is not null)
);

create index if not exists event_attendance_event_id_idx
    on public.event_attendance (event_id);

create index if not exists event_attendance_created_at_idx
    on public.event_attendance (created_at desc);

create index if not exists event_attendance_open_visit_idx
    on public.event_attendance (event_id, student_id)
    where check_in is not null and check_out is null;

alter table public.event_attendance enable row level security;

-- Readable by everyone (public live rail + desk list).
drop policy if exists event_attendance_select on public.event_attendance;
create policy event_attendance_select
    on public.event_attendance
    for select
    using (
        exists (
            select 1 from public.events e
            where e.id = event_id
              and e.is_published = true
              and e.is_archived = false
        )
    );

-- The entry desk (including anon kiosk sessions) can log taps against
-- published, non-archived events.
drop policy if exists event_attendance_public_insert on public.event_attendance;
create policy event_attendance_public_insert
    on public.event_attendance
    for insert
    with check (
        exists (
            select 1 from public.events e
            where e.id = event_id
              and e.is_published = true
              and e.is_archived = false
        )
    );

-- Only Admins can correct or remove attendance rows.
drop policy if exists event_attendance_admin_write on public.event_attendance;
create policy event_attendance_admin_write
    on public.event_attendance
    for all
    using (
        exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role_id = 0
        )
    )
    with check (
        exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role_id = 0
        )
    );

-- This repository has no Supabase CLI project linked. Apply this file via the
-- Supabase SQL editor or `supabase db push` after linking the project.
