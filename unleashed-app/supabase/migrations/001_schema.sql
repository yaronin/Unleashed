-- Unleashed Beginner: profiles, progress tables, RLS
-- Run in Supabase SQL Editor or: supabase db push

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- Per-user program state
create table if not exists public.user_state (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  program_start_date date not null default current_date,
  current_week int not null default 1,
  current_day_index int not null default 1,
  total_workouts_completed int not null default 0,
  advancement_mode text not null default 'calendar' check (advancement_mode in ('calendar', 'completion'))
);

-- Workout logs
create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  week int not null,
  day_index int not null,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  exercises jsonb not null
);

create index if not exists workout_logs_user_id_date_idx on public.workout_logs (user_id, date desc);

-- Personal records
create table if not exists public.personal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id text not null,
  metric text not null check (metric in ('reps', 'duration_sec')),
  value numeric not null,
  achieved_at date not null,
  workout_log_id uuid references public.workout_logs(id) on delete set null,
  unique (user_id, exercise_id, metric)
);

-- Auto-create profile + user_state on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''));
  insert into public.user_state (user_id, program_start_date)
  values (new.id, current_date);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS helper
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

alter table public.profiles enable row level security;
alter table public.user_state enable row level security;
alter table public.workout_logs enable row level security;
alter table public.personal_records enable row level security;

-- Profiles policies
drop policy if exists "users read profiles" on public.profiles;
create policy "users read profiles" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

drop policy if exists "admin update any profile" on public.profiles;
create policy "admin update any profile" on public.profiles
  for update using (public.is_admin());

-- user_state policies
drop policy if exists "own user_state" on public.user_state;
create policy "own user_state" on public.user_state
  for all using (auth.uid() = user_id);

drop policy if exists "admin read all user_state" on public.user_state;
create policy "admin read all user_state" on public.user_state
  for select using (public.is_admin());

-- workout_logs policies
drop policy if exists "own workout_logs" on public.workout_logs;
create policy "own workout_logs" on public.workout_logs
  for all using (auth.uid() = user_id);

drop policy if exists "admin read all workout_logs" on public.workout_logs;
create policy "admin read all workout_logs" on public.workout_logs
  for select using (public.is_admin());

-- personal_records policies
drop policy if exists "own personal_records" on public.personal_records;
create policy "own personal_records" on public.personal_records
  for all using (auth.uid() = user_id);

drop policy if exists "admin read all personal_records" on public.personal_records;
create policy "admin read all personal_records" on public.personal_records
  for select using (public.is_admin());

-- Bootstrap first admin (replace email after you register):
-- update public.profiles set role = 'admin' where email = 'your@email.com';
