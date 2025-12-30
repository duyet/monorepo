import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { WakaTimeSyncer } from '../wakatime.syncer';
import type { ClickHouseClient } from '@clickhouse/client';

describe('WakaTimeSyncer', () => {
  let mockClient: ClickHouseClient;

  beforeEach(() => {
    mockClient = {
      insert: mock(() => Promise.resolve()),
      query: mock(() => Promise.resolve()),
      close: mock(() => Promise.resolve()),
    } as unknown as ClickHouseClient;
  });

  test('should create syncer instance', () => {
    const syncer = new WakaTimeSyncer(mockClient);
    expect(syncer).toBeDefined();
  });

  test('should be WakaTimeSyncer instance', () => {
    const syncer = new WakaTimeSyncer(mockClient);
    expect(syncer).toBeInstanceOf(WakaTimeSyncer);
  });

  test('should throw error when WAKATIME_API_KEY is missing', async () => {
    const originalKey = process.env.WAKATIME_API_KEY;
    process.env.WAKATIME_API_KEY = undefined;

    const syncer = new WakaTimeSyncer(mockClient);

    try {
      await syncer.sync({ dryRun: true });
    } catch (error) {
      expect(error instanceof Error).toBe(true);
      expect((error as Error).message).toContain('WAKATIME_API_KEY');
    }

    if (originalKey) {
      process.env.WAKATIME_API_KEY = originalKey;
    }
  });
});
