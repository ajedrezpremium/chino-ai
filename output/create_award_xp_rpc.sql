-- Run in Supabase SQL Editor to create the award_xp RPC function
-- This is optional — the frontend falls back to client-side logic

CREATE OR REPLACE FUNCTION award_xp(p_user_id UUID, p_xp INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_prev_xp INTEGER;
  v_prev_streak INTEGER;
  v_last_date DATE;
  v_new_streak INTEGER;
  v_streak_bonus INTEGER;
  v_total_gain INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Get current values
  SELECT xp, streak, last_activity_date::DATE
  INTO v_prev_xp, v_prev_streak, v_last_date
  FROM user_xp
  WHERE user_id = p_user_id;

  -- If no row exists, initialize
  IF v_prev_xp IS NULL THEN
    INSERT INTO user_xp (user_id, xp, level, streak, max_streak, last_activity_date, updated_at)
    VALUES (p_user_id, p_xp, GREATEST(1, p_xp / 500 + 1), 1, 1, v_today, NOW());
    RETURN;
  END IF;

  -- Calculate streak
  IF v_last_date IS DISTINCT FROM v_today THEN
    IF v_last_date IS NOT NULL AND v_today - v_last_date <= 2 THEN
      v_new_streak := v_prev_streak + 1;
    ELSE
      v_new_streak := 1;
    END IF;
  ELSE
    v_new_streak := v_prev_streak;
  END IF;

  -- Streak bonus (up to 7 days = 35 XP)
  v_streak_bonus := LEAST(v_new_streak, 7) * 5;
  v_total_gain := p_xp + v_streak_bonus;
  v_new_xp := v_prev_xp + v_total_gain;

  -- Calculate level
  v_new_level := 1;
  FOR i IN 0..9 LOOP
    IF v_new_xp >= (SELECT (500 * i * (i + 1) / 2)) THEN
      v_new_level := i + 1;
    END IF;
  END LOOP;

  -- Update
  UPDATE user_xp SET
    xp = v_new_xp,
    level = v_new_level,
    streak = v_new_streak,
    max_streak = GREATEST(max_streak, v_new_streak),
    last_activity_date = v_today,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;
