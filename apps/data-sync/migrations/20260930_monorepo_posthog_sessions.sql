-- @name: monorepo_posthog_sessions
-- @version: 20260930
-- @description: Declare the `sessions` column PostHogSyncer has always emitted and ClickHouse has always dropped

-- UP
-- PostHogSyncer's record is { date, path, visitors, views, sessions } and it
-- computes `sessions` (unique $session_id, falling back to distinct_id), but
-- migrations 001 and 002 declare `bounce_rate Nullable(Float32)` instead. With
-- input_format_skip_unknown_fields on, every `sessions` value has been dropped
-- on the way in and the column has never existed.
--
-- `sessions` is the value the syncer can actually derive from $pageview
-- events, so the schema is aligned to the syncer rather than the other way
-- round: bounce rate needs session-level exits that this event stream does not
-- carry, and nothing in the repo reads bounce_rate (apps/insights queries
-- PostHog directly, not this table).
--
-- `bounce_rate` is left in place: it is Nullable, so it defaults to NULL and
-- costs nothing, and dropping it would be a destructive change for a column a
-- future sync may still want to fill.
--
-- Additive and instant (ADD COLUMN on a non-MATERIALIZED column is a metadata
-- change), so no rebuild, no backfill, and existing rows are untouched: their
-- `sessions` reads as the 0 default until the next sync rewrites the row.
--
-- Numbered the day after 20260929 so it sorts after it; the runner applies
-- pending migrations in ascending version order, and the 001-010 sequence was
-- already exhausted by the date-stamped 20250109.

ALTER TABLE monorepo_posthog
  ADD COLUMN IF NOT EXISTS sessions UInt32 DEFAULT 0 AFTER views;

-- DOWN
ALTER TABLE monorepo_posthog
  DROP COLUMN IF EXISTS sessions;
