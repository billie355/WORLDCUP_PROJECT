-- ============================================================
-- 001_schema.sql — World Cup Prediction Platform
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------
-- PROFILES (extends auth.users)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  country       TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_banned     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- TEAMS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teams (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  short_code    TEXT NOT NULL,        -- e.g. "BRA", "ARG"
  flag_url      TEXT,
  group_name    TEXT,                 -- e.g. "A", "B", ... "L"
  confederation TEXT,                -- UEFA, CONMEBOL, etc.
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- PLAYERS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.players (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  team_id       UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  position      TEXT CHECK (position IN ('GK', 'DEF', 'MID', 'FWD')),
  birth_date    DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- MATCHES
-- -------------------------------------------------------
CREATE TYPE match_stage AS ENUM ('group', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final');
CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'finished', 'postponed', 'cancelled');

CREATE TABLE IF NOT EXISTS public.matches (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  home_team_id    UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  away_team_id    UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  kickoff_time    TIMESTAMPTZ NOT NULL,
  lock_minutes    INT NOT NULL DEFAULT 60,   -- minutes before kickoff to lock predictions
  stage           match_stage NOT NULL DEFAULT 'group',
  status          match_status NOT NULL DEFAULT 'scheduled',
  home_score      INT,                       -- NULL until result entered
  away_score      INT,
  venue           TEXT,
  match_day       INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- MATCH PREDICTIONS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.predictions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id          UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  predicted_home    INT NOT NULL CHECK (predicted_home >= 0),
  predicted_away    INT NOT NULL CHECK (predicted_away >= 0),
  points_awarded    INT,                     -- NULL until match finished & scored
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, match_id)
);

-- -------------------------------------------------------
-- TOURNAMENT PREDICTIONS
-- -------------------------------------------------------
CREATE TYPE tournament_category AS ENUM (
  'winner',
  'runner_up',
  'golden_boot',
  'best_player',
  'best_young_player',
  'best_goalkeeper'
);

CREATE TABLE IF NOT EXISTS public.tournament_predictions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category            tournament_category NOT NULL,
  selected_team_id    UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  selected_player_id  UUID REFERENCES public.players(id) ON DELETE SET NULL,
  points_awarded      INT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, category)
);

-- -------------------------------------------------------
-- TEAM PROGRESS PREDICTIONS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.progress_predictions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id     UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  stage       match_stage NOT NULL,
  points_awarded INT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, team_id, stage)
);

-- -------------------------------------------------------
-- LEADERBOARD
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leaderboard (
  user_id         UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points    INT NOT NULL DEFAULT 0,
  match_points    INT NOT NULL DEFAULT 0,
  tournament_points INT NOT NULL DEFAULT 0,
  rank            INT,
  predictions_correct INT NOT NULL DEFAULT 0,
  predictions_total   INT NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- POINTS CONFIG
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.points_config (
  key         TEXT PRIMARY KEY,
  value       INT NOT NULL,
  description TEXT
);

INSERT INTO public.points_config (key, value, description) VALUES
  ('correct_winner',       3,  'Correct match winner (not score)'),
  ('correct_draw',         3,  'Correct draw result'),
  ('correct_scoreline',    5,  'Exact correct scoreline'),
  ('tournament_winner',   30,  'Correct World Cup winner'),
  ('tournament_runner_up',15,  'Correct runner-up'),
  ('golden_boot',         20,  'Correct Golden Boot winner'),
  ('best_player',         20,  'Correct Best Player of Tournament'),
  ('best_young_player',   10,  'Correct Best Young Player'),
  ('best_goalkeeper',     10,  'Correct Best Goalkeeper')
ON CONFLICT (key) DO NOTHING;

-- -------------------------------------------------------
-- SHARE CARDS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.share_cards (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  snapshot    JSONB NOT NULL,              -- snapshot of predictions at time of share
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- REPORTS (User moderation)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason            TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- TOURNAMENT CONFIG (Admin-managed)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tournament_config (
  key       TEXT PRIMARY KEY,
  value     TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.tournament_config (key, value) VALUES
  ('tournament_name', 'FIFA World Cup 2026'),
  ('tournament_start', '2026-06-11T17:00:00Z'),
  ('tournament_end',   '2026-07-19T20:00:00Z'),
  ('predictions_open', 'true')
ON CONFLICT (key) DO NOTHING;

-- -------------------------------------------------------
-- INDEXES
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON public.predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_tournament_predictions_user_id ON public.tournament_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_kickoff ON public.matches(kickoff_time);
CREATE INDEX IF NOT EXISTS idx_matches_stage ON public.matches(stage);
CREATE INDEX IF NOT EXISTS idx_leaderboard_points ON public.leaderboard(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON public.leaderboard(rank);
