CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  ip TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_code ON reports(code);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);

CREATE TABLE IF NOT EXISTS publish_limits (
  ip TEXT NOT NULL,
  day TEXT NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (ip, day)
);

ALTER TABLE exams ADD COLUMN suspended INTEGER NOT NULL DEFAULT 0;
