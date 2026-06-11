-- -------------------------------------------------------
-- Player Match Predictions
-- Lets users predict goal scorer & man of the match per game
-- -------------------------------------------------------

create table if not exists player_match_predictions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  match_id        uuid references matches(id) on delete cascade not null,
  prediction_type text not null check (prediction_type in ('goal_scorer', 'man_of_match')),
  player_id       uuid references players(id) on delete cascade not null,
  points_awarded  int,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null,
  unique(user_id, match_id, prediction_type)
);

-- Index for fast lookups by user + match
create index if not exists idx_player_match_predictions_user_match
  on player_match_predictions(user_id, match_id);

-- Updated_at trigger (reuse the existing handle_updated_at function)
CREATE TRIGGER player_match_predictions_updated_at
  BEFORE UPDATE ON player_match_predictions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -------------------------------------------------------
-- RLS Policies
-- -------------------------------------------------------
alter table player_match_predictions enable row level security;

-- Users can view their own predictions
create policy "Users can view own player predictions"
  on player_match_predictions for select
  using (auth.uid() = user_id);

-- Users can insert their own predictions
create policy "Users can insert own player predictions"
  on player_match_predictions for insert
  with check (auth.uid() = user_id);

-- Users can update their own predictions
create policy "Users can update own player predictions"
  on player_match_predictions for update
  using (auth.uid() = user_id);

-- Admins can view all
create policy "Admins can view all player predictions"
  on player_match_predictions for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- Admins can update (for awarding points)
create policy "Admins can update all player predictions"
  on player_match_predictions for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
