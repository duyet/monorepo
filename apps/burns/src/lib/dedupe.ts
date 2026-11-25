/**
 * Dedupe policy for ccusage_events daily rows.
 *
 * A machine can write the same usage twice: directly (account_id NULL or '')
 * and through the telemetry hub (account_id set, dedup_key re-keyed). Summing
 * both doubles every total. Count each (date, source, machine_name,
 * model_name) once, preferring the hub copy because it carries the corrected
 * cost, and falling back to the direct copy when no hub copy exists.
 */

export const DEDUPED_DAILY_TABLE = "deduped_daily";

/** Columns every query over the deduped table can read. */
export const DEDUPED_DAILY_COLUMNS = [
  "date",
  "source",
  "machine_name",
  "model_name",
  "input_tokens",
  "output_tokens",
  "cache_creation_tokens",
  "cache_read_tokens",
  "total_tokens",
  "cost",
] as const;

/**
 * SQL for a CTE named `deduped_daily` with one row per
 * (date, source, machine_name, model_name). Use as `WITH <this> SELECT ...`.
 */
export function dedupedDailyCte(): string {
  return `${DEDUPED_DAILY_TABLE} AS (
    SELECT
      date,
      source,
      machine_name,
      model_name,
      input_tokens,
      output_tokens,
      cache_creation_tokens,
      cache_read_tokens,
      total_tokens,
      cost
    FROM (
      SELECT
        date,
        source,
        machine_name,
        model_name,
        (COALESCE(account_id, '') <> '') AS is_hub_copy,
        SUM(input_tokens)          AS input_tokens,
        SUM(output_tokens)         AS output_tokens,
        SUM(cache_creation_tokens) AS cache_creation_tokens,
        SUM(cache_read_tokens)     AS cache_read_tokens,
        SUM(total_tokens)          AS total_tokens,
        SUM(cost)                  AS cost
      FROM ccusage_events
      WHERE record_type = 'daily'
      GROUP BY date, source, machine_name, model_name, is_hub_copy
    )
    QUALIFY row_number() OVER (
      PARTITION BY date, source, machine_name, model_name
      ORDER BY is_hub_copy DESC
    ) = 1
  )`;
}

/** Wrap a SELECT that reads `deduped_daily` with the dedupe CTE. */
export function withDedupedDaily(select: string): string {
  return `WITH ${dedupedDailyCte()}\n${select}`;
}
