-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create role enum
create type public.app_role as enum ('admin', 'moderator', 'user');

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  target_exam text,
  grade text,
  goals_set boolean default false,
  subscription_plan text,
  subscription_end_date timestamptz,
  is_premium boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Create chapters table
create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  chapter_number integer not null,
  title text not null,
  description text,
  subject text not null,
  is_free boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chapters enable row level security;

-- Create questions table
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references public.chapters(id) on delete cascade,
  question_text text not null,
  options jsonb not null,
  correct_answer text not null,
  explanation text,
  difficulty text,
  topic text,
  created_at timestamptz not null default now()
);

alter table public.questions enable row level security;

-- Create question_attempts table
create table public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id uuid references public.questions(id) on delete cascade,
  is_correct boolean not null,
  time_taken integer,
  attempted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.question_attempts enable row level security;

-- Create test_sessions table
create table public.test_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  test_type text not null,
  score integer,
  total_questions integer,
  time_taken integer,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.test_sessions enable row level security;

-- Create user_subscriptions table
create table public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_id text not null,
  is_active boolean default true,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_subscriptions enable row level security;

-- Create payments table
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  razorpay_order_id text not null,
  razorpay_payment_id text,
  razorpay_signature text,
  amount integer not null,
  currency text not null default 'INR',
  status text not null,
  plan_id text not null,
  plan_duration integer not null,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

-- Create ai_usage_log table
create table public.ai_usage_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  feature_type text not null,
  tokens_used integer,
  created_at timestamptz not null default now()
);

alter table public.ai_usage_log enable row level security;

-- Create study_plans table
create table public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.study_plans enable row level security;

-- Create topic_priorities table
create table public.topic_priorities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  topic text not null,
  subject text not null,
  status text not null default 'not_started',
  priority integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.topic_priorities enable row level security;

-- Create updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger for profiles
create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();

-- Create trigger for chapters
create trigger update_chapters_updated_at
before update on public.chapters
for each row
execute function public.update_updated_at_column();

-- Create trigger for user_subscriptions
create trigger update_user_subscriptions_updated_at
before update on public.user_subscriptions
for each row
execute function public.update_updated_at_column();

-- Create trigger for study_plans
create trigger update_study_plans_updated_at
before update on public.study_plans
for each row
execute function public.update_updated_at_column();

-- Create trigger for topic_priorities
create trigger update_topic_priorities_updated_at
before update on public.topic_priorities
for each row
execute function public.update_updated_at_column();

-- Create function to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Create trigger for auto-creating profiles
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Create security definer function for role checking
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- RLS Policies for profiles
create policy "Users can view their own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

-- RLS Policies for user_roles
create policy "Users can view their own roles"
on public.user_roles for select
using (auth.uid() = user_id);

create policy "Admins can manage all roles"
on public.user_roles for all
using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for chapters
create policy "Everyone can view chapters"
on public.chapters for select
using (true);

create policy "Admins can manage chapters"
on public.chapters for all
using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for questions
create policy "Everyone can view questions"
on public.questions for select
using (true);

create policy "Admins can manage questions"
on public.questions for all
using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for question_attempts
create policy "Users can view their own attempts"
on public.question_attempts for select
using (auth.uid() = user_id);

create policy "Users can insert their own attempts"
on public.question_attempts for insert
with check (auth.uid() = user_id);

create policy "Admins can view all attempts"
on public.question_attempts for select
using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for test_sessions
create policy "Users can view their own test sessions"
on public.test_sessions for select
using (auth.uid() = user_id);

create policy "Users can insert their own test sessions"
on public.test_sessions for insert
with check (auth.uid() = user_id);

create policy "Users can update their own test sessions"
on public.test_sessions for update
using (auth.uid() = user_id);

-- RLS Policies for user_subscriptions
create policy "Users can view their own subscriptions"
on public.user_subscriptions for select
using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions"
on public.user_subscriptions for insert
with check (auth.uid() = user_id);

-- RLS Policies for payments
create policy "Users can view their own payments"
on public.payments for select
using (auth.uid() = user_id);

create policy "Users can insert their own payments"
on public.payments for insert
with check (auth.uid() = user_id);

-- RLS Policies for ai_usage_log
create policy "Users can view their own AI usage"
on public.ai_usage_log for select
using (auth.uid() = user_id);

create policy "Users can insert their own AI usage"
on public.ai_usage_log for insert
with check (auth.uid() = user_id);

-- RLS Policies for study_plans
create policy "Users can view their own study plans"
on public.study_plans for select
using (auth.uid() = user_id);

create policy "Users can manage their own study plans"
on public.study_plans for all
using (auth.uid() = user_id);

-- RLS Policies for topic_priorities
create policy "Users can view their own topic priorities"
on public.topic_priorities for select
using (auth.uid() = user_id);

create policy "Users can manage their own topic priorities"
on public.topic_priorities for all
using (auth.uid() = user_id);