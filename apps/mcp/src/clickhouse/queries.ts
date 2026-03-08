/**
 * Pre-built read-only ClickHouse query templates.
 *
 * All functions return valid SQL strings ready to be passed to
 * ClickHouseClient.query(). The queries are intentionally kept
 * generic so they work across common monorepo_* table conventions.
 */

/**
 * Return row counts, min/max dates, and latest sync times per table.
 * Optionally filter to a specific list of tables.
 */
export function tableStatsQuery(tables?: string[]): string {
  const tableFilter =
    tables && tables.length > 0
      ? `AND name IN (${tables.map((t) => `'${t}'`).join(", ")})`
      : "";

  return `
SELECT
  name                            AS table,
  total_rows                      AS rows,
  formatReadableSize(total_bytes) AS size,
  engine
FROM system.tables
WHERE database = currentDatabase()
  AND engine NOT IN ('View', 'MaterializedView', 'Dictionary')
  ${tableFilter}
ORDER BY total_rows DESC
`.trim();
}

/**
 * Show the most recent synced_at value per monorepo_* table to detect stale data.
 */
export function dataFreshnessQuery(): string {
  return `
SELECT
  name AS table,
  (
    SELECT max(synced_at)
    FROM merge(currentDatabase(), name)
  ) AS latest_sync,
  dateDiff('minute', (
    SELECT max(synced_at)
    FROM merge(currentDatabase(), name)
  ), now()) AS minutes_since_sync
FROM system.tables
WHERE database = currentDatabase()
  AND name LIKE 'monorepo_%'
  AND engine NOT IN ('View', 'MaterializedView', 'Dictionary')
ORDER BY latest_sync ASC
`.trim();
}

/**
 * Summarise sync counts per source for the past N days.
 * @param source  Optional source name to filter (e.g. 'wakatime', 'github')
 * @param days    Lookback window in days (default 7)
 */
export function syncStatusQuery(source?: string, days = 7): string {
  const sourceFilter = source ? `AND source = '${source}'` : "";
  return `
SELECT
  source,
  toDate(synced_at)     AS sync_date,
  count()               AS records,
  max(synced_at)        AS last_sync
FROM (
  SELECT 'wakatime'  AS source, synced_at FROM monorepo_wakatime
  UNION ALL
  SELECT 'cloudflare', synced_at          FROM monorepo_cloudflare
  UNION ALL
  SELECT 'github',     synced_at          FROM monorepo_github
  UNION ALL
  SELECT 'posthog',    synced_at          FROM monorepo_posthog
  UNION ALL
  SELECT 'unsplash',   synced_at          FROM monorepo_unsplash
)
WHERE synced_at >= now() - INTERVAL ${days} DAY
  ${sourceFilter}
GROUP BY source, sync_date
ORDER BY sync_date DESC, source
`.trim();
}

/**
 * List applied ClickHouse migrations (requires a monorepo_migrations table).
 */
export function migrationStatusQuery(): string {
  return `
SELECT
  migration_id,
  applied_at,
  description
FROM monorepo_migrations
ORDER BY applied_at DESC
LIMIT 50
`.trim();
}

/**
 * Show table sizes and row counts to understand data retention.
 */
export function retentionStatusQuery(): string {
  return `
SELECT
  name                                    AS table,
  total_rows                              AS rows,
  formatReadableSize(total_bytes)         AS size,
  min(partition)                          AS oldest_partition,
  max(partition)                          AS newest_partition,
  count(DISTINCT partition)               AS partition_count
FROM system.parts
WHERE database = currentDatabase()
  AND active = 1
GROUP BY name
ORDER BY total_bytes DESC
`.trim();
}

/**
 * Validate and optionally append a LIMIT clause to a user-supplied query.
 *
 * @param sql    Raw SQL from the caller
 * @param limit  Row cap to append when the query lacks a LIMIT clause
 * @returns      SQL string ready to pass to ClickHouseClient.query()
 */
export function buildUserQuery(sql: string, limit: number): string {
  const trimmed = sql.trim();
  const upper = trimmed.toUpperCase();
  // Only SELECT queries benefit from an auto-appended LIMIT
  const needsLimit =
    upper.startsWith("SELECT") || upper.startsWith("WITH");
  const hasLimit = /\bLIMIT\b/i.test(trimmed);
  return needsLimit && !hasLimit ? `${trimmed} LIMIT ${limit}` : trimmed;
}

/**
 * General system information: version, uptime, memory usage.
 */
export function systemInfoQuery(): string {
  return `
SELECT
  version()                                 AS clickhouse_version,
  uptime()                                  AS uptime_seconds,
  formatReadableSize(
    getSetting('max_memory_usage')
  )                                         AS max_memory_setting,
  currentDatabase()                         AS current_database,
  now()                                     AS server_time,
  timezone()                                AS server_timezone
`.trim();
}
