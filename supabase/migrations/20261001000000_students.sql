-- Students directory, self-service setup, and RFID card linking.
--
-- Role model (see src/utils/constants/roles.ts):
--   role_id = 0  Admin    - full access, can grant/revoke Pioneer (student officer) privileges
--   role_id = 2  Student  - the default role for every ordinary student account
--   role_id = 3  Pioneer  - student-government officers who manage this directory
--
-- Lifecycle:
--   1. An Admin or Pioneer pre-registers a student by email (creates the Auth user +
--      `profiles` row with role_id = 2).
--   2. The student signs in with the emailed credentials, sets their own password, and
--      completes exactly one `students` row describing their own profile.
--   3. An Admin can later grant Pioneer status (role_id = 3) plus an officer `position` from
--      the Students directory. Admins/Pioneers can edit any student record afterwards,
--      including linking an RFID card.

-- Surface any existing CHECK constraints on profiles.role_id so they can be reviewed manually
-- before role_id = 3 (Pioneer) is used. This performs no destructive changes.
do $$
declare
    constraint_rec record;
begin
    for constraint_rec in
        select con.conname, pg_get_constraintdef(con.oid) as definition
        from pg_constraint con
        join pg_class rel on rel.oid = con.conrelid
        join pg_namespace nsp on nsp.oid = rel.relnamespace
        where nsp.nspname = 'public'
          and rel.relname = 'profiles'
          and con.contype = 'c'
    loop
        raise notice 'Review constraint % on public.profiles before relying on role_id = 3: %',
            constraint_rec.conname, constraint_rec.definition;
    end loop;
end $$;

create table if not exists public.students (
    id uuid primary key references public.profiles (id) on delete cascade,
    student_id text,
    first_name text not null,
    last_name text not null,
    year_level text,
    section text,
    contact_number text,
    profile_picture_url text,
    rfid_uid text,
    created_by uuid references auth.users (id),
    updated_by uuid references auth.users (id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index if not exists students_student_id_key
    on public.students (student_id)
    where student_id is not null;

create unique index if not exists students_rfid_uid_key
    on public.students (rfid_uid)
    where rfid_uid is not null;

create or replace function public.set_students_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at
    before update on public.students
    for each row
    execute function public.set_students_updated_at();

alter table public.students enable row level security;

-- Admins (0) and Pioneers (3) can read every student record.
drop policy if exists students_select_staff on public.students;
create policy students_select_staff
    on public.students
    for select
    using (
        exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role_id in (0, 3)
        )
    );

-- A student can read their own record.
drop policy if exists students_select_self on public.students;
create policy students_select_self
    on public.students
    for select
    using (id = auth.uid());

-- A pre-registered student (2) or pioneer (3) inserts exactly their own row during self setup.
drop policy if exists students_insert_self on public.students;
create policy students_insert_self
    on public.students
    for insert
    with check (
        id = auth.uid()
        and exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role_id in (2, 3)
        )
    );

-- Admins and Pioneers can also create directory rows directly.
drop policy if exists students_insert_staff on public.students;
create policy students_insert_staff
    on public.students
    for insert
    with check (
        exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role_id in (0, 3)
        )
    );

-- Admins and Pioneers can edit any record (profile fields, RFID linking, officer position).
drop policy if exists students_update_staff on public.students;
create policy students_update_staff
    on public.students
    for update
    using (
        exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role_id in (0, 3)
        )
    );

-- Only Admins and Pioneers remove directory records.
drop policy if exists students_delete_staff on public.students;
create policy students_delete_staff
    on public.students
    for delete
    using (
        exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role_id in (0, 3)
        )
    );

-- This repository has no Supabase CLI project linked. Apply this file via the Supabase SQL
-- editor or `supabase db push` after linking the project, then verify the policies above
-- against the real `profiles` table before relying on them in production.
