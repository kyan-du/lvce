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
