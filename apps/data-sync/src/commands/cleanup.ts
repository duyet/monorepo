#!/usr/bin/env bun
import {
  applyRetentionPolicies,
  convertRetentionPolicy,
  closeClient,
  getTableSizes,
} from '../lib/clickhouse'
import { retentionPolicies } from '../config'
import { logger } from '../lib'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')

  if (dryRun) {
    logger.info('DRY RUN MODE - No data will be deleted')
  }

  logger.info('Starting retention cleanup...')

  // Get table sizes before cleanup
  const tablesToCheck = retentionPolicies.map((p) => p.tableName)
  let tablesSizeBefore: Record<string, { rows: number; bytes: number }> = {}

  try {
    tablesSizeBefore = await getTableSizes(tablesToCheck)
  } catch (error) {
    logger.warn('Failed to get table sizes:', error)
  }

  // Convert and apply retention policies
  const policies = retentionPolicies.map(convertRetentionPolicy)
  const results = await applyRetentionPolicies(policies, dryRun)

  // Get table sizes after cleanup (if not dry run)
  let tablesSizeAfter: Record<string, { rows: number; bytes: number }> = {}

  if (!dryRun) {
    try {
      // Wait a bit for ClickHouse to update stats
      await new Promise((resolve) => setTimeout(resolve, 1000))
      tablesSizeAfter = await getTableSizes(tablesToCheck)
    } catch (error) {
      logger.warn('Failed to get table sizes after cleanup:', error)
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(80))
  logger.info(dryRun ? 'CLEANUP PREVIEW (DRY RUN)' : 'CLEANUP SUMMARY')
  console.log('='.repeat(80))

  let totalRecordsDeleted = 0
  let totalBytesFreed = 0

  for (const result of results) {
    const statusColor = result.deleted
      ? '\x1b[32m'
      : result.error
        ? '\x1b[31m'
        : '\x1b[33m'
    const status = result.deleted ? '✓' : result.error ? '✗' : '•'
    const action = dryRun ? 'Would delete' : result.deleted ? 'Deleted' : 'Found'
    const resetColor = '\x1b[0m'

    const beforeStats = tablesSizeBefore[result.table]
    const afterStats = tablesSizeAfter[result.table]

    console.log(
      `${statusColor}${status}${resetColor} ${result.table.padEnd(35)} ` +
        `${action}: ${formatNumber(result.recordsToDelete).padStart(10)} records`
    )

    if (beforeStats && afterStats && !dryRun) {
      const bytesFreed = beforeStats.bytes - afterStats.bytes
      if (bytesFreed > 0) {
        console.log(`  Space freed: ${formatBytes(bytesFreed)}`)
        totalBytesFreed += bytesFreed
      }
    }

    if (result.error) {
      console.log(`  ${'\x1b[31m'}Error: ${result.error}${'\x1b[0m'}`)
    }

    totalRecordsDeleted += result.recordsToDelete
  }

  console.log('='.repeat(80))

  if (dryRun) {
    console.log(
      `Would delete: ${formatNumber(totalRecordsDeleted)} records across ${results.length} tables`
    )
  } else {
    console.log(
      `Total: ${formatNumber(totalRecordsDeleted)} records deleted across ${results.length} tables`
    )

    if (totalBytesFreed > 0) {
      console.log(`Space freed: ${formatBytes(totalBytesFreed)}`)
    }
  }

  console.log('='.repeat(80) + '\n')

  await closeClient()

  // Exit with error if any policy failed
  const hasErrors = results.some((r) => r.error)
  process.exit(hasErrors ? 1 : 0)
}

main().catch((error) => {
  logger.error('Cleanup command failed:', error)
  process.exit(1)
})
