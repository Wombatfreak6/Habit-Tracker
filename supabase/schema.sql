-- ============================================================
-- SAKURA HABIT TRACKER — Full Supabase Schema
-- Run this in your Supabase SQL editor after creating a project
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: user_profiles (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- TABLE: habits
-- ============================================================
CREATE TABLE IF NOT EXISTS public.habits (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('Health', 'Mind', 'Work')),
  position    INTEGER NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS habits_user_id_idx ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS habits_category_idx ON public.habits(user_id, category);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own habits"
  ON public.habits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLE: habit_completions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id     UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (habit_id, user_id, date)
);

CREATE INDEX IF NOT EXISTS habit_completions_user_date_idx ON public.habit_completions(user_id, date);

ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own completions"
  ON public.habit_completions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable Realtime for multi-tab sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.habit_completions;

-- ============================================================
-- TABLE: mood_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_level  INTEGER NOT NULL CHECK (mood_level BETWEEN 1 AND 5),
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS mood_logs_user_date_idx ON public.mood_logs(user_id, date);

ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own mood logs"
  ON public.mood_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLE: achievements
-- ============================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  unlocked_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, achievement_key)
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own achievements"
  ON public.achievements FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLE: user_stats
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak   INTEGER NOT NULL DEFAULT 0,
  longest_streak   INTEGER NOT NULL DEFAULT 0,
  total_completed  INTEGER NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read/update own stats"
  ON public.user_stats FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- FUNCTION: Recalculate user stats on habit_completion INSERT
-- ============================================================
CREATE OR REPLACE FUNCTION public.recalculate_user_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id         UUID;
  v_total_completed INTEGER;
  v_current_streak  INTEGER;
  v_longest_streak  INTEGER;
  v_check_date      DATE;
  v_streak          INTEGER;
  v_max_streak      INTEGER;
  v_habits_count    INTEGER;
  v_completed_count INTEGER;
BEGIN
  v_user_id := NEW.user_id;

  -- Count total completions
  SELECT COUNT(*) INTO v_total_completed
  FROM public.habit_completions
  WHERE user_id = v_user_id;

  -- Calculate current streak (consecutive days with 100% completion)
  v_current_streak := 0;
  v_check_date := CURRENT_DATE;

  LOOP
    -- Count habits for this user (non-archived)
    SELECT COUNT(*) INTO v_habits_count
    FROM public.habits
    WHERE user_id = v_user_id AND is_archived = FALSE;

    EXIT WHEN v_habits_count = 0;

    -- Count completions on check_date
    SELECT COUNT(DISTINCT habit_id) INTO v_completed_count
    FROM public.habit_completions
    WHERE user_id = v_user_id AND date = v_check_date;

    EXIT WHEN v_completed_count < v_habits_count;

    v_current_streak := v_current_streak + 1;
    v_check_date := v_check_date - INTERVAL '1 day';
  END LOOP;

  -- Calculate longest streak
  v_max_streak := 0;
  v_streak := 0;

  SELECT MAX(longest) INTO v_longest_streak FROM (
    SELECT
      date,
      COUNT(DISTINCT habit_id) as completed_count,
      SUM(1) OVER (
        ORDER BY date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
      ) as row_num
    FROM public.habit_completions
    WHERE user_id = v_user_id
    GROUP BY date
  ) sub;

  -- Simpler: just use current vs stored longest
  SELECT COALESCE(longest_streak, 0) INTO v_longest_streak
  FROM public.user_stats
  WHERE user_id = v_user_id;

  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Upsert user_stats
  INSERT INTO public.user_stats (user_id, current_streak, longest_streak, total_completed, updated_at)
  VALUES (v_user_id, v_current_streak, v_longest_streak, v_total_completed, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak  = EXCLUDED.current_streak,
    longest_streak  = GREATEST(public.user_stats.longest_streak, EXCLUDED.current_streak),
    total_completed = EXCLUDED.total_completed,
    updated_at      = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to habit_completions
DROP TRIGGER IF EXISTS on_habit_completion_insert ON public.habit_completions;
CREATE TRIGGER on_habit_completion_insert
  AFTER INSERT ON public.habit_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_user_stats();

-- ============================================================
-- FUNCTION: Auto-create user_profile and user_stats on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
