-- Enable required extensions
create extension if not exists "pgcrypto";

-- 1) Profiles
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  skill_level text not null default 'beginner' check (skill_level in ('beginner','intermediate','advanced')),
  timezone text not null default 'America/Los_Angeles',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at trigger helper
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
before update on profiles
for each row execute function set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();


-- 2) Tracks (Categories)
create table if not exists tracks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3) Challenges
create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references tracks(id) on delete restrict,
  difficulty text not null check (difficulty in ('beginner','intermediate','advanced')),
  title text not null,
  scenario text not null,
  instructions text not null,
  success_criteria text,
  day_date date not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists challenges_day_date_idx on challenges(day_date);
create index if not exists challenges_track_idx on challenges(track_id);

-- Enforce one published challenge per day per difficulty (optional, but recommended)
create unique index if not exists challenges_unique_day_difficulty
on challenges(day_date, difficulty)
where is_published = true;


-- 4) Challenge Submissions
create table if not exists challenge_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id uuid not null references challenges(id) on delete cascade,
  submission_text text not null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- One submission per user per challenge
create unique index if not exists submissions_unique_user_challenge
on challenge_submissions(user_id, challenge_id);

create index if not exists submissions_user_idx on challenge_submissions(user_id);
create index if not exists submissions_challenge_idx on challenge_submissions(challenge_id);


-- 5) AI Feedback (immutable, one-to-one with submission)
create table if not exists ai_feedback (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references challenge_submissions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  model text not null,
  score int not null check (score between 1 and 10),
  strengths text not null,
  improvements text not null,
  suggested_revision text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_feedback_user_idx on ai_feedback(user_id);


-- 6) User Progress (denormalized)
create table if not exists user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  challenges_completed int not null default 0,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_completed_date date,
  avg_score numeric(4,2) not null default 0,
  updated_at timestamptz not null default now()
);

drop trigger if exists user_progress_set_updated_at on user_progress;
create trigger user_progress_set_updated_at
before update on user_progress
for each row execute function set_updated_at();
