import { createClient } from '@clickhouse/client'
import type { ClickHouseConfig, QueryResult } from '../types'

/**
 * Get ClickHouse configuration from environment variables
 */
function getClickHouseConfig(): ClickHouseConfig | null {
  const host = process.env.CLICKHOUSE_HOST
  const port = process.env.CLICKHOUSE_PORT || '8123'
  const username = process.env.CLICKHOUSE_USER
  const password = process.env.CLICKHOUSE_PASSWORD
  const database = process.env.CLICKHOUSE_DATABASE

  if (!host || !username || !password || !database) {
    console.warn('ClickHouse environment variables not found')
    return null
  }

  return { host, port, username, password, database }
}

/**
 * Get ClickHouse client instance with error handling
 */
function getClickHouseClient() {
  const config = getClickHouseConfig()
  if (!config) return null

  try {
    return createClient({
      host: `http://${config.host}:${config.port}`,
      username: config.username,
      password: config.password,
      database: config.database,
      clickhouse_settings: {
        max_execution_time: 30,
        max_result_rows: '10000', // Prevent runaway queries
        max_memory_usage: '1G', // Limit memory usage
      },
    })
  } catch (error) {
    console.error('Failed to create ClickHouse client:', error)
    return null
  }
}

/**
 * Execute ClickHouse query with comprehensive error handling
 */
export async function executeClickHouseQuery(
  query: string,
  timeoutMs: number = 30000,
): Promise<QueryResult> {
  const client = getClickHouseClient()

  if (!client) {
    return {
      success: false,
      data: [],
      error: 'ClickHouse client not available',
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const resultSet = await client.query({
      query,
      format: 'JSONEachRow',
      abort_signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const data = await resultSet.json()
    
    // ClickHouse JSONEachRow format returns array of objects
    if (Array.isArray(data)) {
      return {
        success: true,
        data: data as Record<string, unknown>[],
      }
    }
    
    return {
      success: true,
      data: [],
    }
  } catch (error) {
    clearTimeout(timeoutId)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('ClickHouse query failed:', error)
    
    return {
      success: false,
      data: [],
      error: errorMessage,
    }
  } finally {
    try {
      await client.close()
    } catch (closeError) {
      console.warn('Failed to close ClickHouse client:', closeError)
    }
  }
}

/**
 * Execute query and return data array (backward compatibility)
 */
export async function executeClickHouseQueryLegacy(
  query: string,
): Promise<Record<string, unknown>[]> {
  const result = await executeClickHouseQuery(query)
  return result.data
}