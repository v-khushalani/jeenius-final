-- Add city and state to profiles
alter table public.profiles
add column if not exists city text,
add column if not exists state text;

-- Create usage_limits table
create table if not exists public.usage_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  questions_today integer default 0,
  last_reset_date date default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.usage_limits enable row level security;

-- RLS policies for usage_limits
create policy "Users can view their own usage limits"
on public.usage_limits for select
using (auth.uid() = user_id);

create policy "Users can manage their own usage limits"
on public.usage_limits for all
using (auth.uid() = user_id);

-- Create test_attempts table
create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  test_type text not null,
  score integer,
  total_questions integer,
  answers jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.test_attempts enable row level security;

-- RLS policies for test_attempts
create policy "Users can view their own test attempts"
on public.test_attempts for select
using (auth.uid() = user_id);

create policy "Users can manage their own test attempts"
on public.test_attempts for all
using (auth.uid() = user_id);

-- Create free_content_limits table
create table if not exists public.free_content_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  chapters_accessed integer default 0,
  questions_attempted integer default 0,
  tests_taken integer default 0,
  last_reset_date date default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.free_content_limits enable row level security;

-- RLS policies for free_content_limits
create policy "Users can view their own free content limits"
on public.free_content_limits for select
using (auth.uid() = user_id);

create policy "Users can manage their own free content limits"
on public.free_content_limits for all
using (auth.uid() = user_id);

-- Create user_content_access table
create table if not exists public.user_content_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject text not null,
  content_identifier text not null,
  access_type text not null,
  accessed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.user_content_access enable row level security;

-- RLS policies for user_content_access
create policy "Users can view their own content access"
on public.user_content_access for select
using (auth.uid() = user_id);

create policy "Users can manage their own content access"
on public.user_content_access for all
using (auth.uid() = user_id);

-- Create validate_question_answer function
create or replace function public.validate_question_answer(
  _question_id uuid,
  _user_answer text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correct_answer text;
  v_explanation text;
  v_is_correct boolean;
  v_attempt_id uuid;
begin
  -- Get correct answer and explanation
  select correct_answer, explanation
  into v_correct_answer, v_explanation
  from public.questions
  where id = _question_id;
  
  -- Check if answer is correct
  v_is_correct := (v_correct_answer = _user_answer);
  
  -- Record the attempt
  insert into public.question_attempts (
    user_id, question_id, is_correct, attempted_at
  ) values (
    auth.uid(), _question_id, v_is_correct, now()
  ) returning id into v_attempt_id;
  
  -- Return result
  return jsonb_build_object(
    'attempt_id', v_attempt_id,
    'is_correct', v_is_correct,
    'correct_option', v_correct_answer,
    'explanation', v_explanation
  );
end;
$$;