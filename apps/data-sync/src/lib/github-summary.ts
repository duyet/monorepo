import fs from "node:fs";
import type { ClickHouseClient } from "@clickhouse/client";

interface SyncSummary {
  source: string;
  success: boolean;
  recordsProcessed: number;
  duration: number;
  error?: string;
}

interface TableStatus {
  table: string;
  totalRecords: number;
  lastSync?: string;
}

/**
 * Get record counts for all tables
 */
export async function getTableStatus(
  client: ClickHouseClient
): Promise<TableStatus[]> {
  const tables = [
    "monorepo_github_contributions_raw",
    "monorepo_wakatime_stats_raw",
    "monorepo_cloudflare_analytics_raw",
    "monorepo_unsplash_photos_raw",
  ];

  const statuses: TableStatus[] = [];

  for (const table of tables) {
    try {
      const result = await client.query({
        query: `
          SELECT
            count() as total_records,
            max(synced_at) as last_sync
          FROM ${table}
          WHERE is_deleted = 0
        `,
        format: "JSONEachRow",
      });

      const data = await result.json();
      if (Array.isArray(data) && data.length > 0) {
        const row = data[0] as { total_records: number; last_sync: string };
        statuses.push({
          table: table.replace("monorepo_", "").replace("_raw", ""),
          totalRecords: row.total_records ?? 0,
          lastSync: row.last_sync,
        });
      }
    } catch (error) {
      // Table might not exist yet, skip
      statuses.push({
        table: table.replace("monorepo_", "").replace("_raw", ""),
        totalRecords: 0,
        lastSync: undefined,
      });
    }
  }

  return statuses;
}

/**
 * Write GitHub Actions job summary
 */
export async function writeJobSummary(
  summaries: SyncSummary[],
  tableStatuses: TableStatus[]
): Promise<void> {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;

  if (!summaryPath) {
    // Not running in GitHub Actions, skip
    return;
  }

  const successCount = summaries.filter((s) => s.success).length;
  const failureCount = summaries.length - successCount;
  const totalRecordsAdded = summaries.reduce(
    (sum, s) => sum + (s.success ? s.recordsProcessed : 0),
    0
  );

  let markdown = "";

  // Header
  markdown += "# 📊 Data Sync Summary\n\n";

  // Overall status
  const emoji = failureCount === 0 ? "✅" : "⚠️";
  markdown += `## ${emoji} Overall Status\n\n`;
  markdown += `- **Total Records Added:** ${totalRecordsAdded}\n`;
  markdown += `- **Successful Syncs:** ${successCount}\n`;
  markdown += `- **Failed Syncs:** ${failureCount}\n\n`;

  // Sync results table
  markdown += "## Sync Results\n\n";
  markdown += "| Source | Status | Records Added | Duration |\n";
  markdown += "|--------|--------|---------------|----------|\n";

  for (const summary of summaries) {
    const status = summary.success ? "✅" : "❌";
    const records = summary.recordsProcessed.toLocaleString();
    const duration = `${(summary.duration / 1000).toFixed(2)}s`;
    markdown += `| ${summary.source} | ${status} | ${records} | ${duration} |\n`;

    if (summary.error) {
      markdown += `| _Error_ | |||\n`;
      markdown += `| _${summary.error}_ | |||\n`;
    }
  }
  markdown += "\n";

  // Table status
  markdown += "## Table Status\n\n";
  markdown += "| Table | Total Records | Last Sync |\n";
  markdown += "|-------|---------------|----------|\n";

  for (const status of tableStatuses) {
    const total = status.totalRecords.toLocaleString();
    const lastSync = status.lastSync
      ? new Date(status.lastSync).toISOString()
      : "Never";
    markdown += `| ${status.table} | ${total} | ${lastSync} |\n`;
  }
  markdown += "\n";

  // Write to summary file
  try {
    fs.appendFileSync(summaryPath, markdown);
  } catch (error) {
    console.error("Failed to write job summary:", error);
  }
}
