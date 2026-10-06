-- Guarantees a student can only ever hold one active visit, and makes
-- attendance changes stream to every gate screen in real time.
--
-- Why a separate file: supabase_migrations.schema_migrations records applied
-- versions, so edits inside 20261001050000_event_attendance_desk_columns.sql
-- are skipped once that version has run. A new version always applies.

-- ---------------------------------------------------------------------------
-- 1. Close duplicate open visits left over from before the constraint existed.
--    The earliest check-in is the real visit; later ones are stamped closed.
-- ---------------------------------------------------------------------------
with ranked as (
    select
        id,
        student_id,
        row_number() over (
            partition by student_id
            order by check_in asc, created_at asc, id asc
        ) as visit_rank
    from public.event_attendance
    where check_in is not null
      and check_out is null
)
update public.event_attendance attendance
set check_out = now()
from ranked
where attendance.id = ranked.id
  and ranked.visit_rank > 1;

-- ---------------------------------------------------------------------------
-- 2. One active visit per student. Enforced by the database, so duplicate
--    taps are blocked no matter which station, tab, or kiosk logs them.
-- ---------------------------------------------------------------------------
drop index if exists public.event_attendance_one_open_visit_idx;

create unique index event_attendance_one_open_visit_idx
    on public.event_attendance (student_id)
    where check_in is not null and check_out is null;

-- ---------------------------------------------------------------------------
-- 3. Stream attendance changes so gate screens update without waiting on a
--    poll. Requires the table in the realtime publication.
-- ---------------------------------------------------------------------------
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

-- Verify: this should report zero rows.
--   select student_id, count(*)
--   from public.event_attendance
--   where check_in is not null and check_out is null
--   group by student_id
--   having count(*) > 1;
