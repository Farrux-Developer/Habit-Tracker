-- ============================================================
-- Геймифицированный трекер привычек — схема БД (Supabase)
-- ============================================================

-- 1. Таблица привычек
CREATE TABLE habits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  type        TEXT NOT NULL CHECK (type IN ('daily', 'one_time')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Таблица выполнений (одна запись = один habit выполнен в конкретную дату)
CREATE TABLE habit_completions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id       UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(habit_id, completed_date)  -- нельзя выполнить один habit дважды в один день
);

-- Индексы для быстрых запросов
CREATE INDEX idx_habits_user_id         ON habits(user_id);
CREATE INDEX idx_completions_user_date  ON habit_completions(user_id, completed_date);
CREATE INDEX idx_completions_habit_date ON habit_completions(habit_id, completed_date);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE habits            ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

-- Политики для habits
CREATE POLICY "Users can read own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- Политики для habit_completions
CREATE POLICY "Users can read own completions"
  ON habit_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON habit_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions"
  ON habit_completions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Helper: автообновление updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
