/**
 * ClickHouse utilities for data-sync app
 *
 * This module provides:
 * - Client connection management with pooling
 * - SQL migration system with version tracking
 * - Retention policy enforcement and cleanup
 */

// Client exports
export {
  getClient,
  getClickHouseConfig,
  ping,
  executeQuery,
  executeCommand,
  executeStatements,
  closeClient,
  type ClickHouseConfig,
  type QueryResult,
} from "./client";

// Migration exports
export {
  MigrationRunner,
  type Migration,
  type AppliedMigration,
  type MigrationStatus,
} from "./migrations";

// Retention exports
export {
  applyRetentionPolicies,
  optimizeTables,
  getTableSizes,
  getRetentionStatus,
  convertRetentionPolicy,
  type RetentionPolicy,
  type RetentionResult,
} from "./retention";
