export interface RetentionPolicy {
  tableName: string;
  retentionDays: number;
  partitionColumn: string;
}

export const retentionPolicies: RetentionPolicy[] = [
  {
    tableName: "wakatime_daily_stats",
    retentionDays: 90,
    partitionColumn: "date",
  },
  {
    tableName: "wakatime_hourly_durations",
    retentionDays: 90,
    partitionColumn: "date",
  },
  {
    tableName: "cloudflare_analytics_daily",
    retentionDays: 90,
    partitionColumn: "date",
  },
  {
    tableName: "cloudflare_top_pages",
    retentionDays: 90,
    partitionColumn: "date",
  },
  {
    tableName: "github_contributions_daily",
    retentionDays: 365,
    partitionColumn: "date",
  },
  {
    tableName: "github_events",
    retentionDays: 90,
    partitionColumn: "toDate(created_at)",
  },
  {
    tableName: "github_repo_stats",
    retentionDays: 90,
    partitionColumn: "snapshot_date",
  },
  {
    tableName: "unsplash_photo_stats",
    retentionDays: 90,
    partitionColumn: "snapshot_date",
  },
  {
    tableName: "unsplash_portfolio_stats",
    retentionDays: 90,
    partitionColumn: "snapshot_date",
  },
];

export const DEFAULT_RETENTION_DAYS = 90;
