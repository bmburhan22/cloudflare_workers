CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  property TEXT NOT NULL,
  checkin_date TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  activities TEXT NOT NULL,
  initials TEXT NOT NULL,
  signature TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL,
  activity TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  access_code TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES submissions (id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_lookup ON submissions (name, email, property, checkin_date);
CREATE INDEX IF NOT EXISTS idx_documents_submission ON documents (submission_id);
