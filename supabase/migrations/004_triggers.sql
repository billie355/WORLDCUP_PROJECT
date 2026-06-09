-- ============================================================
-- 004_triggers.sql — Database Triggers
-- ============================================================

-- -------------------------------------------------------
-- Auto-create profile on new user signup
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTR(NEW.id::TEXT, 1, 6)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Initialize leaderboard entry
  INSERT INTO public.leaderboard (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -------------------------------------------------------
-- Update updated_at timestamps
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER predictions_updated_at
  BEFORE UPDATE ON public.predictions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER tournament_predictions_updated_at
  BEFORE UPDATE ON public.tournament_predictions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -------------------------------------------------------
-- Recalculate leaderboard ranks after points update
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.recalculate_ranks()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.leaderboard l
  SET rank = ranks.new_rank
  FROM (
    SELECT
      user_id,
      ROW_NUMBER() OVER (ORDER BY total_points DESC, updated_at ASC) AS new_rank
    FROM public.leaderboard
  ) ranks
  WHERE l.user_id = ranks.user_id;
END;
$$;

-- -------------------------------------------------------
-- Score a single match prediction for a user
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.score_match_prediction(
  p_match_id UUID,
  p_home_score INT,
  p_away_score INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_correct_winner INT;
  v_correct_draw   INT;
  v_correct_score  INT;
BEGIN
  -- Get points config
  SELECT value INTO v_correct_winner FROM public.points_config WHERE key = 'correct_winner';
  SELECT value INTO v_correct_draw   FROM public.points_config WHERE key = 'correct_draw';
  SELECT value INTO v_correct_score  FROM public.points_config WHERE key = 'correct_scoreline';

  -- Update all predictions for this match
  UPDATE public.predictions
  SET points_awarded = CASE
    -- Exact scoreline (highest priority)
    WHEN predicted_home = p_home_score AND predicted_away = p_away_score
      THEN v_correct_score
    -- Correct draw
    WHEN p_home_score = p_away_score AND predicted_home = predicted_away
      THEN v_correct_draw
    -- Correct home win
    WHEN p_home_score > p_away_score AND predicted_home > predicted_away
      THEN v_correct_winner
    -- Correct away win
    WHEN p_home_score < p_away_score AND predicted_home < predicted_away
      THEN v_correct_winner
    ELSE 0
  END
  WHERE match_id = p_match_id;

  -- Update leaderboard totals for affected users
  UPDATE public.leaderboard lb
  SET
    match_points = (
      SELECT COALESCE(SUM(points_awarded), 0)
      FROM public.predictions
      WHERE user_id = lb.user_id AND points_awarded IS NOT NULL
    ),
    predictions_correct = (
      SELECT COUNT(*)
      FROM public.predictions
      WHERE user_id = lb.user_id AND points_awarded > 0
    ),
    predictions_total = (
      SELECT COUNT(*)
      FROM public.predictions
      WHERE user_id = lb.user_id AND points_awarded IS NOT NULL
    ),
    total_points = (
      SELECT COALESCE(SUM(p.points_awarded), 0)
      FROM public.predictions p
      WHERE p.user_id = lb.user_id AND p.points_awarded IS NOT NULL
    ) + (
      SELECT COALESCE(SUM(tp.points_awarded), 0)
      FROM public.tournament_predictions tp
      WHERE tp.user_id = lb.user_id AND tp.points_awarded IS NOT NULL
    ),
    updated_at = NOW()
  WHERE lb.user_id IN (
    SELECT user_id FROM public.predictions WHERE match_id = p_match_id
  );

  -- Recalculate ranks
  PERFORM public.recalculate_ranks();
END;
$$;
