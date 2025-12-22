-- Enable RLS
alter table profiles enable row level security;
alter table tracks enable row level security;
alter table challenges enable row level security;
alter table challenge_submissions enable row level security;
alter table ai_feedback enable row level security;
alter table user_progress enable row level security;

-- Profiles policies
create policy "Profiles are readable by owner"
on profiles for select
using (auth.uid() = user_id);

create policy "Profiles editable by owner"
on profiles for update
using (auth.uid() = user_id);

-- Tracks + Challenges are public-readable (published only)
create policy "Tracks readable by all authenticated users"
on tracks for select
using (true);

create policy "Published challenges readable by all authenticated users"
on challenges for select
using (is_published = true);

-- Submissions policies
create policy "Users can read their submissions"
on challenge_submissions for select
using (auth.uid() = user_id);

create policy "Users can create their submissions"
on challenge_submissions for insert
with check (auth.uid() = user_id);

-- Feedback policies
create policy "Users can read their feedback"
on ai_feedback for select
using (auth.uid() = user_id);

-- Progress policies
create policy "Users can read their progress"
on user_progress for select
using (auth.uid() = user_id);
