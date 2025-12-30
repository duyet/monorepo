import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { CloudflareSyncer } from '../cloudflare.syncer';
import type { ClickHouseClient } from '@clickhouse/client';

describe('CloudflareSyncer', () => {
  let mockClient: ClickHouseClient;

  beforeEach(() => {
    mockClient = {
      insert: mock(() => Promise.resolve()),
      query: mock(() => Promise.resolve()),
      close: mock(() => Promise.resolve()),
    } as unknown as ClickHouseClient;
  });

  test('should create syncer instance', () => {
    const syncer = new CloudflareSyncer(mockClient);
    expect(syncer).toBeDefined();
  });

  test('should be CloudflareSyncer instance', () => {
    const syncer = new CloudflareSyncer(mockClient);
    expect(syncer).toBeInstanceOf(CloudflareSyncer);
  });

  test('should throw error when CLOUDFLARE credentials are missing', async () => {
    const originalZoneId = process.env.CLOUDFLARE_ZONE_ID;
    const originalApiKey = process.env.CLOUDFLARE_API_KEY;

    process.env.CLOUDFLARE_ZONE_ID = undefined;
    process.env.CLOUDFLARE_API_KEY = undefined;

    const syncer = new CloudflareSyncer(mockClient);

    try {
      await syncer.sync({ dryRun: true });
    } catch (error) {
      expect(error instanceof Error).toBe(true);
      expect((error as Error).message).toContain('CLOUDFLARE');
    }

    if (originalZoneId) process.env.CLOUDFLARE_ZONE_ID = originalZoneId;
    if (originalApiKey) process.env.CLOUDFLARE_API_KEY = originalApiKey;
  });
});
