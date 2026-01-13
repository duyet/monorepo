#!/usr/bin/env bun
import { ALL_SOURCES, sourceConfigs } from "../config";
import { logger } from "../lib";
import { closeClient, getClient } from "../lib/clickhouse";
import { getTableStatus, writeJobSummary } from "../lib/github-summary";
import { syncerMap } from "../syncers";

interface SyncSummary {
  source: string;
  success: boolean;
  recordsProcessed: number;
  duration: number;
  error?: string;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  // Parse date options for backfill
  const startDateArg = args.find((arg) => arg.startsWith("--start-date="));
  const endDateArg = args.find((arg) => arg.startsWith("--end-date="));
  const backfillDaysArg = args.find((arg) =>
    arg.startsWith("--backfill-days=")
  );

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (startDateArg) {
    startDate = new Date(startDateArg.split("=")[1]);
    if (Number.isNaN(startDate.getTime())) {
      logger.error(`Invalid start date: ${startDateArg}`);
      process.exit(1);
    }
  }

  if (endDateArg) {
    endDate = new Date(endDateArg.split("=")[1]);
    if (Number.isNaN(endDate.getTime())) {
      logger.error(`Invalid end date: ${endDateArg}`);
      process.exit(1);
    }
  }

  // Parse --backfill-days option (e.g., --backfill-days=90)
  if (backfillDaysArg && !startDate) {
    const days = Number.parseInt(backfillDaysArg.split("=")[1], 10);
    if (Number.isNaN(days) || days <= 0) {
      logger.error(`Invalid backfill days: ${backfillDaysArg}`);
      process.exit(1);
    }
    endDate = endDate || new Date();
    startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    logger.info(`Backfill mode: fetching ${days} days of data`);
  }

  const sources = args.filter((arg) => !arg.startsWith("--"));

  // Parse sources: 'all' means all enabled sources
  const sourcesToSync =
    sources.includes("all") || sources.length === 0
      ? ALL_SOURCES.filter((s) => sourceConfigs[s].enabled)
      : sources;

  // Validate sources
  const invalidSources = sourcesToSync.filter((s) => !sourceConfigs[s]);
  if (invalidSources.length > 0) {
    logger.error(`Invalid sources: ${invalidSources.join(", ")}`);
    logger.info(`Available sources: ${ALL_SOURCES.join(", ")}`);
    process.exit(1);
  }

  if (dryRun) {
    logger.info("DRY RUN MODE - No data will be written");
  }

  logger.info(`Starting sync for sources: ${sourcesToSync.join(", ")}`);

  const summaries: SyncSummary[] = [];
  const startTime = Date.now();

  for (const source of sourcesToSync) {
    const config = sourceConfigs[source];
    const syncStart = Date.now();

    logger.info(`Syncing ${config.name}: ${config.description}`);

    try {
      const SyncerClass = syncerMap[source];

      if (!SyncerClass) {
        logger.warn(`Syncer for ${source} not implemented yet`);

        const duration = Date.now() - syncStart;
        summaries.push({
          source,
          success: false,
          recordsProcessed: 0,
          duration,
          error: "Syncer not implemented",
        });
        continue;
      }

      const client = getClient();
      if (!client) {
        throw new Error("ClickHouse client not available");
      }

      const syncer = new SyncerClass(client);
      const result = await syncer.sync({
        dryRun,
        startDate,
        endDate,
      });

      const duration = Date.now() - syncStart;

      summaries.push({
        source,
        success: result.success,
        recordsProcessed: result.recordsProcessed,
        duration,
        error: result.errors.length > 0 ? result.errors[0].message : undefined,
      });
    } catch (error) {
      const duration = Date.now() - syncStart;
      const errorMsg = error instanceof Error ? error.message : "Unknown error";

      logger.error(`Failed to sync ${source}: ${errorMsg}`);

      summaries.push({
        source,
        success: false,
        recordsProcessed: 0,
        duration,
        error: errorMsg,
      });
    }
  }

  // Print summary
  const totalDuration = Date.now() - startTime;
  const successCount = summaries.filter((s) => s.success).length;
  const failureCount = summaries.length - successCount;
  const totalRecords = summaries.reduce(
    (sum, s) => sum + s.recordsProcessed,
    0
  );

  console.log(`\n${"=".repeat(60)}`);
  logger.info("SYNC SUMMARY");
  console.log("=".repeat(60));

  for (const summary of summaries) {
    const status = summary.success ? "✓" : "✗";
    const statusColor = summary.success ? "\x1b[32m" : "\x1b[31m";
    const resetColor = "\x1b[0m";

    console.log(
      `${statusColor}${status}${resetColor} ${summary.source.padEnd(15)} ` +
        `${summary.recordsProcessed.toString().padStart(8)} records  ` +
        `${(summary.duration / 1000).toFixed(2)}s`
    );

    if (summary.error) {
      console.log(`  ${"\x1b[31m"}Error: ${summary.error}${"\x1b[0m"}`);
    }
  }

  console.log("=".repeat(60));
  console.log(
    `Total: ${totalRecords} records | ` +
      `${successCount} success | ${failureCount} failed | ` +
      `${(totalDuration / 1000).toFixed(2)}s`
  );
  console.log(`${"=".repeat(60)}\n`);

  // Write GitHub Actions job summary if available
  const client = getClient();
  if (client) {
    try {
      const tableStatuses = await getTableStatus(client);
      await writeJobSummary(summaries, tableStatuses);
    } catch (error) {
      logger.warn("Failed to write job summary", { error });
    }
  }

  await closeClient();

  process.exit(failureCount > 0 ? 1 : 0);
}

main().catch((error) => {
  logger.error("Sync command failed:", error);
  process.exit(1);
});
