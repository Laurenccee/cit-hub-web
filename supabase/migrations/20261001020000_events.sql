-- Campus events directory with live RFID check-in rail.
--
-- Tables:
--   event_categories - lookup labels for the filter tabs and card badges
--                      (mirrors the content_types pattern used by bulletin).
--   events           - published event records shown on /events and /events/[slug].
--
-- Attendance lives in 20261001040000_event_attendance.sql (event_attendance).
--
-- RLS model:
--   - The events listing page is public, so published, non-archived events and
--     categories are readable by everyone (anon included).
--   - All writes on events/categories are restricted to Admins
--     (profiles.role_id = 0), following the students migration pattern.

create table if not exists public.event_categories (
    id uuid primary key default gen_random_uuid(),
    label text not null unique,
    color text,
    created_at timestamptz not null default now()
);

create table if not exists public.events (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null unique,
    description text,
    content text,
    image_url text,
    image_alt text,
    category_id uuid references public.event_categories (id) on delete set null,
    organizer text,
    host text,
    location text,
    start_date timestamptz not null,
    end_date timestamptz,
    capacity_label text,
    capacity_filled integer not null default 0,
    capacity_total integer,
    capacity_unit text,
    cover text,
    is_published boolean not null default false,
    is_featured boolean not null default false,
    is_archived boolean not null default false,
    created_by uuid references auth.users (id),
    updated_by uuid references auth.users (id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists events_category_id_idx
    on public.events (category_id);

create index if not exists events_start_date_idx
    on public.events (start_date);

create or replace function public.set_events_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
    before update on public.events
    for each row
    execute function public.set_events_updated_at();

alter table public.event_categories enable row level security;
alter table public.events enable row level security;

-- Categories: readable by everyone (public filter tabs).
drop policy if exists event_categories_select on public.event_categories;
create policy event_categories_select
    on public.event_categories
    for select
    using (true);

-- Categories: Admins manage the list.
drop policy if exists event_categories_admin_write on public.event_categories;
create policy event_categories_admin_write
    on public.event_categories
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

-- Events: everyone can read published, non-archived events (public listing page).
drop policy if exists events_public_select on public.events;
create policy events_public_select
    on public.events
    for select
    using (is_published = true and is_archived = false);

-- Events: Admins manage everything (including drafts and archived rows).
drop policy if exists events_admin_all on public.events;
create policy events_admin_all
    on public.events
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

-- Seed the category lookup so the filter tabs have real options on day one.
-- Add or rename categories via the Supabase table editor as needed.
insert into public.event_categories (label, color)
values
    ('Academic Workshop', '#8B1A1A'),
    ('Career Fair', '#475569'),
    ('Pioneers Assembly', '#8B1A1A'),
    ('Competition', '#8B1A1A'),
    ('Cultural & Arts', '#475569'),
    ('Research Colloquium', '#8B1A1A')
on conflict (label) do nothing;

-- This repository has no Supabase CLI project linked. Apply this file via the
-- Supabase SQL editor or `supabase db push` after linking the project.
-- If an `events-images` storage bucket is needed for cover uploads, create it
-- as a public bucket following the existing `news-images` bucket setup.
