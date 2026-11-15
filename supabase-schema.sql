-- CalorIQ Supabase schema
-- Run this entire script in Supabase Dashboard > SQL Editor > New query.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  age integer check (age is null or age between 13 and 120),
  gender text,
  height_cm numeric(6,2) check (height_cm is null or height_cm between 50 and 260),
  weight_kg numeric(6,2) check (weight_kg is null or weight_kg between 20 and 500),
  activity_level text,
  fitness_goal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{"meals": [], "steps": 0, "water": 0, "sleep": 0}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_data enable row level security;

-- A signed-in user can only read and change their own profile.
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- A signed-in user can only read and change their own wellness data.
drop policy if exists "Users can view their own wellness data" on public.user_data;
create policy "Users can view their own wellness data" on public.user_data
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own wellness data" on public.user_data;
create policy "Users can insert their own wellness data" on public.user_data
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own wellness data" on public.user_data;
create policy "Users can update their own wellness data" on public.user_data
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Create an empty profile row automatically whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;

  insert into public.user_data (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
