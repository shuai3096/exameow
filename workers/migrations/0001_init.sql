CREATE TABLE IF NOT EXISTS exams (
  code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  questions TEXT NOT NULL,
  start_at INTEGER NOT NULL,
  end_at INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  admin_token_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  answers TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  total_count INTEGER NOT NULL,
  pending_count INTEGER NOT NULL,
  duration_sec INTEGER NOT NULL,
  submitted_at INTEGER NOT NULL,
  detail TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_results_code ON results(code);
