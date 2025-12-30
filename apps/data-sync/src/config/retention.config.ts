export interface RetentionPolicy {
  tableName: string;
  retentionDays: number;
  partitionColumn: string;
}

export const retentionPolicies: RetentionPolicy[] = [
  {
    tableName: "monorepo_wakatime_daily",
    retentionDays: 90,
    partitionColumn: "date",
  },
  {
    tableName: "monorepo_cloudflare_daily",
    retentionDays: 90,
    partitionColumn: "date",
  },
  {
    tableName: "monorepo_github_daily",
    retentionDays: 365,
    partitionColumn: "date",
  },
];

export const DEFAULT_RETENTION_DAYS = 90;
