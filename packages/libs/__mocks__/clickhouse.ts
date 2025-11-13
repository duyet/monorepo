/**
 * Mock for ClickHouse client
 * Used for testing database queries in insights app
 */

export interface MockClickHouseRow {
  [key: string]: any
}

export interface MockClickHouseQueryResult {
  data: MockClickHouseRow[]
  rows: number
  statistics?: {
    elapsed: number
    rows_read: number
    bytes_read: number
  }
}

class MockClickHouseClient {
  private mockData: Map<string, MockClickHouseRow[]> = new Map()
  private queryHistory: string[] = []

  async query(options: {
    query: string
    format?: string
  }): Promise<MockClickHouseQueryResult> {
    this.queryHistory.push(options.query)

    // Simple query matcher for testing
    const data = this.mockData.get(options.query) || []

    return {
      data,
      rows: data.length,
      statistics: {
        elapsed: 0.001,
        rows_read: data.length,
        bytes_read: data.length * 100,
      },
    }
  }

  async insert(options: { table: string; values: any[]; format?: string }): Promise<void> {
    const key = `insert:${options.table}`
    const existing = this.mockData.get(key) || []
    this.mockData.set(key, [...existing, ...options.values])
  }

  async ping(): Promise<boolean> {
    return true
  }

  async close(): Promise<void> {
    // No-op for mock
  }

  // Test helper methods
  _setMockData(query: string, data: MockClickHouseRow[]): void {
    this.mockData.set(query, data)
  }

  _getMockData(query: string): MockClickHouseRow[] | undefined {
    return this.mockData.get(query)
  }

  _getQueryHistory(): string[] {
    return [...this.queryHistory]
  }

  _clearQueryHistory(): void {
    this.queryHistory = []
  }

  _clear(): void {
    this.mockData.clear()
    this.queryHistory = []
  }
}

export const createMockClickHouseClient = (): MockClickHouseClient =>
  new MockClickHouseClient()

// Default export for jest.mock()
export default createMockClickHouseClient()
