-- Production persistence schema. The development adapter seeds the same shape in memory.
CREATE TABLE members (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  member_id TEXT NOT NULL UNIQUE,
  contact TEXT NOT NULL,
  address TEXT NOT NULL,
  picture_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE membership_packages (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL,
  started_at TEXT NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0)
);
CREATE INDEX idx_members_member_id ON members(member_id);
