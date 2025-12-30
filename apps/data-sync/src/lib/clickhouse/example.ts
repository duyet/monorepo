/**
 * Example usage of ClickHouse utilities
 *
 * This file demonstrates how to use the client, migration system,
 * and retention policies together in a typical data-sync workflow.
 */

import {
  MigrationRunner,
  applyRetentionPolicies,
  closeClient,
  convertRetentionPolicy,
  executeQuery,
  getClient,
  getRetentionStatus,
  getTableSizes,
  optimizeTables,
  ping,
} from "./index";

import { retentionPolicies } from "../../config/retention.config";

/**
 * Initialize database with migrations
 */
async function initializeDatabase() {
  console.log("=== Initializing Database ===");

  // Test connection
  const connected = await ping();
  if (!connected) {
    throw new Error("Failed to connect to ClickHouse");
  }
  console.log("✓ Connection successful");

  // Run migrations
  const runner = new MigrationRunner("./migrations");
  await runner.init();

  const status = await runner.status();
  console.log(
    `✓ Migrations: ${status.appliedCount} applied, ${status.pendingCount} pending`
  );

  if (status.pendingCount > 0) {
    console.log("  Running pending migrations...");
    await runner.up();
    console.log("✓ All migrations applied");
  }

  // Verify migration integrity
  const valid = await runner.verify();
  if (!valid) {
    throw new Error("Migration checksum validation failed");
  }
  console.log("✓ Migration checksums verified");
}

/**
 * Run retention cleanup
 */
async function runRetentionCleanup(dryRun = true) {
  console.log(`\n=== Retention Cleanup (dry run: ${dryRun}) ===`);

  // Convert config policies
  const policies = retentionPolicies.map(convertRetentionPolicy);

  // Get current retention status
  const status = await getRetentionStatus(policies);
  console.log("\nRetention Status:");
  for (const info of status) {
    console.log(
      `  ${info.table}: ${info.totalRows} total, ${info.expiredRows} expired (${info.compliancePercentage}% compliant)`
    );
  }

  // Apply retention policies
  const results = await applyRetentionPolicies(policies, dryRun);

  console.log("\nRetention Results:");
  for (const result of results) {
    if (result.error) {
      console.error(`  ✗ ${result.table}: ${result.error}`);
    } else if (result.deleted) {
      console.log(
        `  ✓ ${result.table}: Deleted ${result.recordsToDelete} records`
      );
    } else {
      console.log(
        `  - ${result.table}: Would delete ${result.recordsToDelete} records`
      );
    }
  }

  // Force TTL cleanup if not dry run
  if (!dryRun) {
    console.log("\nForcing TTL cleanup...");
    const tables = policies.map((p) => p.table);
    await optimizeTables(tables);
    console.log("✓ TTL cleanup completed");
  }
}

/**
 * Get database statistics
 */
async function getDatabaseStats() {
  console.log("\n=== Database Statistics ===");

  const tables = retentionPolicies.map((p) => p.tableName);
  const sizes = await getTableSizes(tables);

  console.log("\nTable Sizes:");
  for (const [table, info] of Object.entries(sizes)) {
    const sizeMB = (info.bytes / 1024 / 1024).toFixed(2);
    console.log(`  ${table}: ${info.rows} rows, ${sizeMB} MB`);
  }

  // Get total storage
  const totalRows = Object.values(sizes).reduce((sum, s) => sum + s.rows, 0);
  const totalBytes = Object.values(sizes).reduce((sum, s) => sum + s.bytes, 0);
  const totalMB = (totalBytes / 1024 / 1024).toFixed(2);

  console.log(`\nTotal: ${totalRows} rows, ${totalMB} MB`);
}

/**
 * Example: Execute custom query
 */
async function customQuery() {
  console.log("\n=== Custom Query Example ===");

  const query = `
    SELECT
      sync_type,
      status,
      count() as count,
      avg(records_processed) as avg_records
    FROM sync_logs
    WHERE started_at >= today() - INTERVAL 7 DAY
    GROUP BY sync_type, status
    ORDER BY sync_type, status
  `;

  const result = await executeQuery(query);

  if (result.success) {
    console.log("\nSync Summary (last 7 days):");
    for (const row of result.data) {
      console.log(
        `  ${row.sync_type} (${row.status}): ${row.count} syncs, ${Number(row.avg_records).toFixed(0)} avg records`
      );
    }
  } else {
    console.error("Query failed:", result.error);
  }
}

/**
 * Main workflow
 */
export async function runMaintenanceWorkflow() {
  try {
    // 1. Initialize database
    await initializeDatabase();

    // 2. Get database stats
    await getDatabaseStats();

    // 3. Dry run retention cleanup
    await runRetentionCleanup(true);

    // 4. Run custom queries
    await customQuery();

    // 5. Actually run retention cleanup (uncomment when ready)
    // await runRetentionCleanup(false)

    console.log("\n✓ Maintenance workflow completed successfully");
  } catch (error) {
    console.error("\n✗ Maintenance workflow failed:", error);
    throw error;
  }
}

/**
 * Graceful shutdown
 */
export async function shutdown() {
  console.log("\nShutting down...");
  await closeClient();
  console.log("✓ ClickHouse client closed");
}

// Example usage:
//
// import { runMaintenanceWorkflow, shutdown } from './lib/clickhouse/example'
//
// async function main() {
//   try {
//     await runMaintenanceWorkflow()
//   } finally {
//     await shutdown()
//   }
// }
//
// main().catch(console.error)
