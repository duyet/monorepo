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
  type ClickHouseConfig,
  closeClient,
  executeCommand,
  executeQuery,
  executeStatements,
  getClickHouseConfig,
  getClient,
  ping,
  type QueryResult,
} from "./client";

// Migration exports
export {
  type AppliedMigration,
  type Migration,
  MigrationRunner,
  type MigrationStatus,
} from "./migrations";

// Retention exports
export {
  applyRetentionPolicies,
  convertRetentionPolicy,
  getRetentionStatus,
  getTableSizes,
  optimizeTables,
  type RetentionPolicy,
  type RetentionResult,
} from "./retention";
