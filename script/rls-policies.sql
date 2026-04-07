-- ============================================================
-- Helper: get the role_id of the currently authenticated user
-- ============================================================
create or replace function public.get_my_role()
returns int
language sql
security definer
stable
as $$
  select role_id from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- content_types  (lookup, public read)
-- ============================================================
alter table public.content_types enable row level security;

create policy "Anyone can read content_types"
  on public.content_types for select
  using (true);

create policy "Admin or Faculty can insert content_types"
  on public.content_types for insert
  with check (get_my_role() in (0, 1));

create policy "Admin or Faculty can update content_types"
  on public.content_types for update
  using (get_my_role() in (0, 1));

create policy "Admin or Faculty can delete content_types"
  on public.content_types for delete
  using (get_my_role() in (0, 1));

-- ============================================================
-- news
--   • anon: only published + non-archived rows
--   • Admin / Faculty: all rows
-- ============================================================
alter table public.news enable row level security;

create policy "Anyone can read published news"
  on public.news for select
  using (
    (is_published = true and is_archived = false)
    or get_my_role() in (0, 1)
  );

create policy "Admin or Faculty can insert news"
  on public.news for insert
  with check (get_my_role() in (0, 1));

create policy "Admin or Faculty can update news"
  on public.news for update
  using (get_my_role() in (0, 1));

create policy "Admin or Faculty can delete news"
  on public.news for delete
  using (get_my_role() in (0, 1));

-- ============================================================
-- ranks  (lookup, public read)
-- ============================================================
alter table public.ranks enable row level security;

create policy "Anyone can read ranks"
  on public.ranks for select
  using (true);

create policy "Admin can insert ranks"
  on public.ranks for insert
  with check (get_my_role() = 0);

create policy "Admin can update ranks"
  on public.ranks for update
  using (get_my_role() = 0);

create policy "Admin can delete ranks"
  on public.ranks for delete
  using (get_my_role() = 0);

-- ============================================================
-- designations  (lookup, public read)
-- ============================================================
alter table public.designations enable row level security;

create policy "Anyone can read designations"
  on public.designations for select
  using (true);

create policy "Admin can insert designations"
  on public.designations for insert
  with check (get_my_role() = 0);

create policy "Admin can update designations"
  on public.designations for update
  using (get_my_role() = 0);

create policy "Admin can delete designations"
  on public.designations for delete
  using (get_my_role() = 0);

-- ============================================================
-- personnel  (public read)
-- ============================================================
alter table public.personnel enable row level security;

create policy "Anyone can read personnel"
  on public.personnel for select
  using (true);

create policy "Admin or Faculty can insert personnel"
  on public.personnel for insert
  with check (get_my_role() in (0, 1));

create policy "Admin or Faculty can update personnel"
  on public.personnel for update
  using (get_my_role() in (0, 1));

create policy "Admin or Faculty can delete personnel"
  on public.personnel for delete
  using (get_my_role() in (0, 1));

-- ============================================================
-- profiles
--   • users can read/update their own row
--   • Admin can read all
-- ============================================================
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (id = auth.uid() or get_my_role() = 0);

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());
