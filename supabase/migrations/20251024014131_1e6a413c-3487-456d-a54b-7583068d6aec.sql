-- Add missing columns to profiles
alter table public.profiles 
add column if not exists premium_until timestamptz,
add column if not exists email text,
add column if not exists phone text,
add column if not exists subjects jsonb;

-- Add missing columns to questions
alter table public.questions
add column if not exists subject text,
add column if not exists question text,
add column if not exists option_a text,
add column if not exists option_b text,
add column if not exists option_c text,
add column if not exists option_d text,
add column if not exists chapter integer;

-- Add mode column to question_attempts
alter table public.question_attempts
add column if not exists mode text;

-- Create subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_id text not null,
  status text not null default 'active',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- Add trigger for subscriptions
create trigger update_subscriptions_updated_at
before update on public.subscriptions
for each row
execute function public.update_updated_at_column();

-- RLS policies for subscriptions
create policy "Users can view their own subscriptions"
on public.subscriptions for select
using (auth.uid() = user_id);

create policy "Users can manage their own subscriptions"
on public.subscriptions for all
using (auth.uid() = user_id);

-- Create user_stats table for profile statistics
create table if not exists public.user_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  total_questions integer default 0,
  correct_answers integer default 0,
  study_streak integer default 0,
  total_time_spent integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_stats enable row level security;

-- Add trigger for user_stats
create trigger update_user_stats_updated_at
before update on public.user_stats
for each row
execute function public.update_updated_at_column();

-- RLS policies for user_stats
create policy "Users can view their own stats"
on public.user_stats for select
using (auth.uid() = user_id);

create policy "Users can update their own stats"
on public.user_stats for update
using (auth.uid() = user_id);

create policy "Users can insert their own stats"
on public.user_stats for insert
with check (auth.uid() = user_id);

-- Update handle_new_user function to also create user_stats
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );
  
  insert into public.user_stats (user_id)
  values (new.id);
  
  return new;
end;
$$;