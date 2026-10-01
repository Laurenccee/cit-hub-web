-- Lookup tables for student courses and majors, mirroring the ranks/designations pattern
-- used by the personnel feature. Majors are shared across all courses (not scoped to one).
--
-- year_level and section stay as plain validated text on `students` (only 4 and 2 fixed
-- values respectively) rather than full lookup tables, since they never need admin management.

create table if not exists public.courses (
    id uuid primary key default gen_random_uuid(),
    code text not null unique,
    name text not null,
    created_at timestamptz not null default now()
);

create table if not exists public.majors (
    id uuid primary key default gen_random_uuid(),
    code text not null unique,
    name text not null,
    created_at timestamptz not null default now()
);

alter table public.courses enable row level security;
alter table public.majors enable row level security;

-- Anyone signed in can read courses/majors (needed for setup/edit dropdowns); only Admins
-- manage the lists, same as ranks/designations.
drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses for select using (true);
drop policy if exists courses_admin_insert on public.courses;
create policy courses_admin_insert on public.courses for insert with check (get_my_role() = 0);
drop policy if exists courses_admin_update on public.courses;
create policy courses_admin_update on public.courses for update using (get_my_role() = 0);
drop policy if exists courses_admin_delete on public.courses;
create policy courses_admin_delete on public.courses for delete using (get_my_role() = 0);

drop policy if exists majors_select on public.majors;
create policy majors_select on public.majors for select using (true);
drop policy if exists majors_admin_insert on public.majors;
create policy majors_admin_insert on public.majors for insert with check (get_my_role() = 0);
drop policy if exists majors_admin_update on public.majors;
create policy majors_admin_update on public.majors for update using (get_my_role() = 0);
drop policy if exists majors_admin_delete on public.majors;
create policy majors_admin_delete on public.majors for delete using (get_my_role() = 0);

-- Students: replace free-text course with FK lookups, keep year_level/section as validated text.
alter table public.students drop column if exists course;
alter table public.students add column if not exists course_id uuid references public.courses (id);
alter table public.students add column if not exists major_id uuid references public.majors (id);

alter table public.students drop constraint if exists students_year_level_check;
alter table public.students add constraint students_year_level_check
    check (year_level is null or year_level in ('1st Year', '2nd Year', '3rd Year', '4th Year'));

alter table public.students drop constraint if exists students_section_check;
alter table public.students add constraint students_section_check
    check (section is null or section in ('A', 'B'));

-- Seed known courses. Add the remaining course + the 9 majors via the Supabase table
-- editor or a follow-up migration once the full list is confirmed.
insert into public.courses (code, name)
values ('BSIT', 'Bachelor of Science of Industrial Technology')
on conflict (code) do nothing;
