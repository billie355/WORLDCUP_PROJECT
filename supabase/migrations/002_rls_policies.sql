-- ============================================================
-- 002_rls_policies.sql — Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_predictions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_config         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_cards           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_config     ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- PROFILES
-- -------------------------------------------------------
-- Anyone can view profiles (for leaderboard, share cards)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (TRUE);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- -------------------------------------------------------
-- TEAMS & PLAYERS (Public read-only)
-- -------------------------------------------------------
CREATE POLICY "Teams are public"
  ON public.teams FOR SELECT USING (TRUE);

CREATE POLICY "Players are public"
  ON public.players FOR SELECT USING (TRUE);

-- Admin can manage teams and players
CREATE POLICY "Admins can manage teams"
  ON public.teams FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage players"
  ON public.players FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- -------------------------------------------------------
-- MATCHES
-- -------------------------------------------------------
CREATE POLICY "Matches are public"
  ON public.matches FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage matches"
  ON public.matches FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- -------------------------------------------------------
-- MATCH PREDICTIONS
-- -------------------------------------------------------
-- Users can view their own predictions
CREATE POLICY "Users can view own predictions"
  ON public.predictions FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all predictions
CREATE POLICY "Admins can view all predictions"
  ON public.predictions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can insert their own predictions (only before lock time)
CREATE POLICY "Users can insert own predictions"
  ON public.predictions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_banned = TRUE
    )
  );

-- Users can update their own predictions
CREATE POLICY "Users can update own predictions"
  ON public.predictions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -------------------------------------------------------
-- TOURNAMENT PREDICTIONS
-- -------------------------------------------------------
CREATE POLICY "Users can view own tournament predictions"
  ON public.tournament_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tournament predictions"
  ON public.tournament_predictions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert own tournament predictions"
  ON public.tournament_predictions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_banned = TRUE
    )
  );

CREATE POLICY "Users can update own tournament predictions"
  ON public.tournament_predictions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -------------------------------------------------------
-- PROGRESS PREDICTIONS
-- -------------------------------------------------------
CREATE POLICY "Users can view own progress predictions"
  ON public.progress_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress predictions"
  ON public.progress_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress predictions"
  ON public.progress_predictions FOR UPDATE
  USING (auth.uid() = user_id);

-- -------------------------------------------------------
-- LEADERBOARD (Public read)
-- -------------------------------------------------------
CREATE POLICY "Leaderboard is public"
  ON public.leaderboard FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage leaderboard"
  ON public.leaderboard FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- System can update leaderboard (via service role key in Server Actions)
CREATE POLICY "Service role can update leaderboard"
  ON public.leaderboard FOR ALL
  USING (auth.role() = 'service_role');

-- -------------------------------------------------------
-- POINTS CONFIG (Public read, admin write)
-- -------------------------------------------------------
CREATE POLICY "Points config is public"
  ON public.points_config FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage points config"
  ON public.points_config FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- -------------------------------------------------------
-- SHARE CARDS (Public read for share links)
-- -------------------------------------------------------
CREATE POLICY "Share cards are public"
  ON public.share_cards FOR SELECT USING (TRUE);

CREATE POLICY "Users can create own share cards"
  ON public.share_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- -------------------------------------------------------
-- REPORTS
-- -------------------------------------------------------
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view and manage reports"
  ON public.reports FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- -------------------------------------------------------
-- TOURNAMENT CONFIG (Public read, admin write)
-- -------------------------------------------------------
CREATE POLICY "Tournament config is public"
  ON public.tournament_config FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage tournament config"
  ON public.tournament_config FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
