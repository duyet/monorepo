import type { RetentionPolicy as ConfigRetentionPolicy } from "../../config/retention.config";
import { executeQuery } from "./client";

/**
 * Retention policy interface
 */
export interface RetentionPolicy {
  table: string;
  days: number;
  dateColumn?: string;
  conditions?: string;
}

/**
 * Convert config retention policy to internal format
 */
export function convertRetentionPolicy(
  configPolicy: ConfigRetentionPolicy
): RetentionPolicy {
  return {
    table: configPolicy.tableName,
    days: configPolicy.retentionDays,
    dateColumn: configPolicy.partitionColumn,
  };
}

/**
 * Retention cleanup result
 */
export interface RetentionResult {
  table: string;
  recordsToDelete: number;
  deleted: boolean;
  error?: string;
}

/**
 * Count records that would be deleted by retention policy
 */
async function countExpiredRecords(policy: RetentionPolicy): Promise<number> {
  const dateColumn = policy.dateColumn || "created_at";
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - policy.days);

  const conditions = policy.conditions ? `AND ${policy.conditions}` : "";

  const query = `
    SELECT count() as count
    FROM ${policy.table}
    WHERE ${dateColumn} < '${cutoffDate.toISOString().split("T")[0]}'
    ${conditions}
  `;

  console.log("[Retention] Counting expired records for table:", policy.table);

  const result = await executeQuery(query);

  if (!result.success) {
    throw new Error(`Failed to count expired records: ${result.error}`);
  }

  const count = result.data[0]?.count || 0;
  return typeof count === "number" ? count : Number.parseInt(String(count), 10);
}

/**
 * Delete expired records from table
 */
async function deleteExpiredRecords(
  policy: RetentionPolicy,
  dryRun = false
): Promise<number> {
  const dateColumn = policy.dateColumn || "created_at";
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - policy.days);

  const conditions = policy.conditions ? `AND ${policy.conditions}` : "";

  if (dryRun) {
    console.log(
      `[Retention] DRY RUN: Would delete records from ${policy.table}`
    );
    return await countExpiredRecords(policy);
  }

  const query = `
    ALTER TABLE ${policy.table}
    DELETE WHERE ${dateColumn} < '${cutoffDate.toISOString().split("T")[0]}'
    ${conditions}
  `;

  console.log("[Retention] Deleting expired records from table:", policy.table);

  const result = await executeQuery(query);

  if (!result.success) {
    throw new Error(`Failed to delete expired records: ${result.error}`);
  }

  return await countExpiredRecords(policy);
}

/**
 * Force TTL cleanup with OPTIMIZE TABLE ... FINAL
 * This triggers immediate cleanup of data marked for deletion by TTL
 */
async function forceTTLCleanup(table: string): Promise<void> {
  console.log("[Retention] Forcing TTL cleanup for table:", table);

  const query = `OPTIMIZE TABLE ${table} FINAL`;

  const result = await executeQuery(query);

  if (!result.success) {
    throw new Error(`Failed to optimize table: ${result.error}`);
  }

  console.log("[Retention] TTL cleanup completed for table:", table);
}

/**
 * Apply retention policies to tables
 */
export async function applyRetentionPolicies(
  policies: RetentionPolicy[],
  dryRun = false
): Promise<RetentionResult[]> {
  console.log(
    `[Retention] Applying ${policies.length} retention policies (dry run: ${dryRun})`
  );

  const results: RetentionResult[] = [];

  for (const policy of policies) {
    console.log(`[Retention] Processing policy for table: ${policy.table}`);

    try {
      const recordsToDelete = await countExpiredRecords(policy);

      if (recordsToDelete === 0) {
        console.log(`[Retention] No expired records found in ${policy.table}`);
        results.push({
          table: policy.table,
          recordsToDelete: 0,
          deleted: false,
        });
        continue;
      }

      console.log(
        `[Retention] Found ${recordsToDelete} expired records in ${policy.table}`
      );

      if (!dryRun) {
        await deleteExpiredRecords(policy, false);

        results.push({
          table: policy.table,
          recordsToDelete,
          deleted: true,
        });

        console.log(
          `[Retention] Deleted ${recordsToDelete} records from ${policy.table}`
        );
      } else {
        results.push({
          table: policy.table,
          recordsToDelete,
          deleted: false,
        });

        console.log(
          `[Retention] DRY RUN: Would delete ${recordsToDelete} records from ${policy.table}`
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";

      console.error(
        `[Retention] Failed to apply policy for ${policy.table}:`,
        errorMsg
      );

      results.push({
        table: policy.table,
        recordsToDelete: 0,
        deleted: false,
        error: errorMsg,
      });
    }
  }

  console.log("[Retention] Completed retention policy application");
  return results;
}

/**
 * Force TTL cleanup on multiple tables
 */
export async function optimizeTables(tables: string[]): Promise<void> {
  console.log(`[Retention] Optimizing ${tables.length} tables`);

  for (const table of tables) {
    try {
      await forceTTLCleanup(table);
    } catch (error) {
      console.error(`[Retention] Failed to optimize table ${table}:`, error);
    }
  }

  console.log("[Retention] Table optimization completed");
}

/**
 * Get table size information
 */
export async function getTableSizes(
  tables: string[]
): Promise<Record<string, { rows: number; bytes: number }>> {
  console.log("[Retention] Getting table sizes...");

  const query = `
    SELECT
      table,
      sum(rows) as rows,
      sum(bytes) as bytes
    FROM system.parts
    WHERE table IN (${tables.map((t) => `'${t}'`).join(",")})
      AND active
    GROUP BY table
  `;

  const result = await executeQuery(query);

  if (!result.success) {
    throw new Error(`Failed to get table sizes: ${result.error}`);
  }

  const sizes: Record<string, { rows: number; bytes: number }> = {};

  for (const row of result.data) {
    const table = row.table as string;
    const rows =
      typeof row.rows === "number"
        ? row.rows
        : Number.parseInt(String(row.rows), 10);
    const bytes =
      typeof row.bytes === "number"
        ? row.bytes
        : Number.parseInt(String(row.bytes), 10);

    sizes[table] = { rows, bytes };
  }

  console.log("[Retention] Table sizes retrieved:", Object.keys(sizes).length);
  return sizes;
}

/**
 * Get retention policy compliance status
 */
export async function getRetentionStatus(policies: RetentionPolicy[]): Promise<
  Array<{
    table: string;
    totalRows: number;
    expiredRows: number;
    compliancePercentage: number;
  }>
> {
  console.log("[Retention] Getting retention status...");

  const results = [];

  for (const policy of policies) {
    try {
      const expiredRows = await countExpiredRecords(policy);

      const totalQuery = `SELECT count() as count FROM ${policy.table}`;
      const totalResult = await executeQuery(totalQuery);

      if (!totalResult.success) {
        throw new Error(`Failed to count total rows: ${totalResult.error}`);
      }

      const totalRows = totalResult.data[0]?.count || 0;
      const total =
        typeof totalRows === "number"
          ? totalRows
          : Number.parseInt(String(totalRows), 10);

      const compliancePercentage =
        total > 0 ? ((total - expiredRows) / total) * 100 : 100;

      results.push({
        table: policy.table,
        totalRows: total,
        expiredRows,
        compliancePercentage: Math.round(compliancePercentage * 100) / 100,
      });
    } catch (error) {
      console.error(
        `[Retention] Failed to get status for ${policy.table}:`,
        error
      );

      results.push({
        table: policy.table,
        totalRows: 0,
        expiredRows: 0,
        compliancePercentage: 100,
      });
    }
  }

  console.log("[Retention] Retention status retrieved");
  return results;
}
