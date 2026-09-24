# Scripts

## One-time data imports

- `../data/qiantang-itinerary.seed.json` — historical 钱江潮 itinerary rows for a **one-time** import into the trip database.
  - **Not** read by `migrateTripDocument` / `buildQiantangTrip` at runtime.
  - After deploy of the db-owned itinerary migration, apply via API (or `import-qiantang-itinerary.mjs`) if the live trip still needs these rows; then edit times/titles in the UI as needed.
- `seed-readings.mjs` — writes reading markdown into D1 via the authenticated API (requires `LVCE_PASSWORD`).
- `import-qiantang-itinerary.mjs` — prints the seed JSON by default; set `LVCE_PASSWORD` (+ optional `LVCE_ORIGIN`) and `APPLY=1` to PUT the qiantang itinerary (merges into the live document). Prefer not to hit production without credentials and an intentional APPLY.
