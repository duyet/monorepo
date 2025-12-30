export interface SyncResult {
  source: string;
  success: boolean;
  recordsProcessed: number;
  recordsInserted: number;
  recordsUpdated: number;
  errors: SyncError[];
  startTime: Date;
  endTime: Date;
  durationMs: number;
}

export interface SyncError {
  message: string;
  code?: string;
  retryable: boolean;
  context?: Record<string, unknown>;
}

export interface SyncOptions {
  dryRun?: boolean;
  startDate?: Date;
  endDate?: Date;
  retryCount?: number;
  batchSize?: number;
}

export interface SyncMetadata {
  sync_version: number;
  is_deleted: number;
  synced_at: string;
}
