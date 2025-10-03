DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS submissions;

CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  property TEXT NOT NULL,
  checkin_date TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  activities TEXT NOT NULL,
  activity_initials TEXT NOT NULL,
  signature TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL,
  activity TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES submissions (id)
);

CREATE INDEX idx_submissions_lookup ON submissions (name, email, property, checkin_date);
CREATE INDEX idx_documents_submission ON documents (submission_id);
