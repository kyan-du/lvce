CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expires_at ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS public_trip_shares (
  token_hash TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS public_trip_shares_trip_id ON public_trip_shares(trip_id);

CREATE TABLE IF NOT EXISTS readings (
  trip_id TEXT NOT NULL,
  reading_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  venue TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  markdown TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (trip_id, reading_id)
);
