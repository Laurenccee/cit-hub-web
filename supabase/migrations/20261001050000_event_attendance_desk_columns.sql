-- Bring manually-created event_attendance tables up to the shape the
-- check-in desk code expects (see 20261001040000_event_attendance.sql).
--
-- Adds only missing pieces; existing rows are preserved:
--   created_at  row timestamp used for ordering the scan log.
-- Plus the kiosk RLS policies, including the check-out update policy the
-- desk needs to stamp check_out on open visits.
--
-- Depends on an event_attendance table shaped like:
--   id, event_id FK -> events.id, check_in, check_out,
--   student_id UUID FK -> students.id.

-- Row timestamp; backfilled from check_in for pre-existing rows.
alter table public.event_attendance
    add column if not exists created_at timestamptz;

update public.event_attendance
set created_at = coalesce(check_in, now())
where created_at is null;

alter table public.event_attendance
    alter column created_at set not null;

alter table public.event_attendance
    alter column created_at set default now();

create index if not exists event_attendance_created_at_idx
    on public.event_attendance (created_at desc);

-- One active visit per student, anywhere. A person cannot be inside two
-- events at once, and this also lets the desk read/write with a single query
-- (no "is there an open row?" pre-check) while still blocking duplicate taps
-- and races between two stations scanning the same card.
--
-- Close any duplicates that slipped through before the index existed, keeping
-- the earliest check-in as the real visit.
update public.event_attendance keep
set check_out = coalesce(keep.check_out, now())
where keep.check_in is not null
  and keep.check_out is null
  and exists (
      select 1
      from public.event_attendance earlier
      where earlier.student_id = keep.student_id
        and earlier.check_in is not null
        and earlier.check_out is null
        and (earlier.check_in, earlier.created_at, earlier.id) < (keep.check_in, keep.created_at, keep.id)
  );

-- Dropped first so an earlier, weaker definition of this index is replaced
-- rather than silently kept by `if not exists`.
drop index if exists public.event_attendance_one_open_visit_idx;

create unique index event_attendance_one_open_visit_idx
    on public.event_attendance (student_id)
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

-- The entry desk can close open visits (stamp check_out) on published,
-- non-archived events. Only rows that are still open can be updated.
drop policy if exists event_attendance_public_checkout on public.event_attendance;
create policy event_attendance_public_checkout
    on public.event_attendance
    for update
    using (
        check_out is null
        and exists (
            select 1 from public.events e
            where e.id = event_id
              and e.is_published = true
              and e.is_archived = false
        )
    )
    with check (
        exists (
            select 1 from public.events e
            where e.id = event_id
              and e.is_published = true
              and e.is_archived = false
        )
    );

-- Only Admins can otherwise correct or remove attendance rows.
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

-- Publish attendance changes so gate screens update the moment any station
-- logs a tap, instead of waiting on a poll.
do $$
begin
    if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
       and not exists (
           select 1
           from pg_publication_tables
           where pubname = 'supabase_realtime'
             and schemaname = 'public'
             and tablename = 'event_attendance'
       )
    then
        alter publication supabase_realtime add table public.event_attendance;
    end if;
end
$$;

-- This repository has no Supabase CLI project linked. Apply this file via the
-- Supabase SQL editor or `supabase db push` after linking the project.
