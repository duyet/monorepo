import type { ClickHouseClient } from "@clickhouse/client";
import { createLogger } from "../logger";
import type { SyncError, SyncMetadata, SyncOptions, SyncResult } from "./types";

export abstract class BaseSyncer<TApiResponse, TRecord> {
  protected readonly sourceName: string;
  protected readonly client: ClickHouseClient;
  protected readonly logger: ReturnType<typeof createLogger>;

  constructor(client: ClickHouseClient, sourceName: string) {
    this.client = client;
    this.sourceName = sourceName;
    this.logger = createLogger(sourceName);
  }

  /**
   * Main sync entry point
   */
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    const startTime = new Date();
    const errors: SyncError[] = [];
    let recordsProcessed = 0;
    let recordsInserted = 0;
    const recordsUpdated = 0;

    try {
      this.logger.info("Starting sync", { options });

      // 1. Fetch from API with retry
      const apiData = await this.withRetry(
        () => this.fetchFromApi(options),
        options.retryCount ?? 3
      );

      // 2. Transform to records
      const records = await this.transform(apiData);
      recordsProcessed = records.length;

      this.logger.info(`Transformed ${recordsProcessed} records`);

      // 3. Insert with version metadata (if not dry run)
      if (!options.dryRun && records.length > 0) {
        recordsInserted = await this.insert(records);
        this.logger.info(`Inserted ${recordsInserted} records`);
      } else if (options.dryRun) {
        this.logger.info("Dry run mode - skipping insert");
      } else {
        this.logger.info("No records to insert");
      }

      const endTime = new Date();
      const durationMs = endTime.getTime() - startTime.getTime();

      this.logger.info("Sync completed successfully", {
        durationMs,
        recordsProcessed,
        recordsInserted,
      });

      return {
        source: this.sourceName,
        success: true,
        recordsProcessed,
        recordsInserted,
        recordsUpdated,
        errors,
        startTime,
        endTime,
        durationMs,
      };
    } catch (error) {
      const endTime = new Date();
      const durationMs = endTime.getTime() - startTime.getTime();

      const syncError: SyncError = {
        message: error instanceof Error ? error.message : String(error),
        code:
          error instanceof Error && "code" in error
            ? String(error.code)
            : undefined,
        retryable: error instanceof Error ? this.isRetryable(error) : false,
        context: { options },
      };

      errors.push(syncError);
      this.logger.error("Sync failed", syncError);

      return {
        source: this.sourceName,
        success: false,
        recordsProcessed,
        recordsInserted,
        recordsUpdated,
        errors,
        startTime,
        endTime,
        durationMs,
      };
    }
  }

  /**
   * Fetch data from external API - implemented by subclass
   */
  protected abstract fetchFromApi(
    options: SyncOptions
  ): Promise<TApiResponse[]>;

  /**
   * Transform API response to ClickHouse records - implemented by subclass
   */
  protected abstract transform(data: TApiResponse[]): Promise<TRecord[]>;

  /**
   * Get the target table name
   */
  protected abstract getTableName(): string;

  /**
   * Insert records with sync metadata
   */
  protected async insert(records: TRecord[]): Promise<number> {
    const tableName = this.getTableName();
    const batchSize = 1000;
    let totalInserted = 0;

    // Add sync metadata to all records
    // Use ClickHouse-compatible DateTime format: YYYY-MM-DD HH:MM:SS
    const now = new Date();
    const currentTimestamp = now.toISOString().slice(0, 19).replace("T", " ");
    // sync_version as simple incrementing value (seconds since epoch fits in UInt32 until 2106)
    const syncVersion = Math.floor(now.getTime() / 1000);
    const recordsWithMetadata = records.map((record) => ({
      ...record,
      sync_version: syncVersion,
      is_deleted: 0,
      synced_at: currentTimestamp,
    }));

    // Batch insert
    for (let i = 0; i < recordsWithMetadata.length; i += batchSize) {
      const batch = recordsWithMetadata.slice(i, i + batchSize);

      this.logger.debug(`Inserting batch ${i / batchSize + 1}`, {
        batchSize: batch.length,
      });

      await this.client.insert({
        table: tableName,
        values: batch,
        format: "JSONEachRow",
      });

      totalInserted += batch.length;
    }

    return totalInserted;
  }

  /**
   * Retry with exponential backoff
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries || !this.isRetryable(lastError)) {
          throw lastError;
        }

        const delayMs = 2 ** (attempt - 1) * 1000; // 1s, 2s, 4s
        this.logger.warn(
          `Attempt ${attempt} failed, retrying in ${delayMs}ms`,
          {
            error: lastError.message,
          }
        );

        await this.sleep(delayMs);
      }
    }

    throw lastError;
  }

  /**
   * Check if an error is retryable
   */
  private isRetryable(error: Error): boolean {
    const retryablePatterns = [
      /timeout/i,
      /ECONNRESET/i,
      /ETIMEDOUT/i,
      /ENOTFOUND/i,
      /429/,
      /503/,
      /rate limit/i,
      /temporarily unavailable/i,
    ];
    return retryablePatterns.some((pattern) => pattern.test(error.message));
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
