CREATE TABLE IF NOT EXISTS public_trip_shares (
  token_hash TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS public_trip_shares_trip_id ON public_trip_shares(trip_id);
